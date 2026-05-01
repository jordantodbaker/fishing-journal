import { createServerFn } from "@tanstack/react-start";
import { prisma } from "./db";
import { requireUserId } from "./auth";

export const getDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await requireUserId();

  const [total, recent, heaviest, bySpecies] = await Promise.all([
    prisma.catch.count({ where: { userId } }),
    prisma.catch.findMany({
      where: { userId },
      orderBy: { dateCaught: "desc" },
      take: 5,
    }),
    prisma.catch.findFirst({
      where: { userId },
      orderBy: { weight: "desc" },
    }),
    prisma.catch.groupBy({
      by: ["species"],
      where: { userId },
      _count: { _all: true },
      orderBy: { _count: { species: "desc" } },
      take: 1,
    }),
  ]);

  return {
    total,
    recent,
    heaviest,
    mostCaughtSpecies: bySpecies[0]
      ? { species: bySpecies[0].species, count: bySpecies[0]._count._all }
      : null,
  };
});

export const getStats = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await requireUserId();

  const allCatches = await prisma.catch.findMany({
    where: { userId },
    select: {
      species: true,
      weight: true,
      length: true,
      dateCaught: true,
    },
    orderBy: { dateCaught: "asc" },
  });

  const byMonth = new Map<string, number>();
  const speciesCount = new Map<string, number>();
  const speciesWeight = new Map<string, { sum: number; n: number }>();

  for (const c of allCatches) {
    const key = `${c.dateCaught.getUTCFullYear()}-${String(
      c.dateCaught.getUTCMonth() + 1,
    ).padStart(2, "0")}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + 1);

    speciesCount.set(c.species, (speciesCount.get(c.species) ?? 0) + 1);
    const w = speciesWeight.get(c.species) ?? { sum: 0, n: 0 };
    w.sum += c.weight;
    w.n += 1;
    speciesWeight.set(c.species, w);
  }

  return {
    totalCatches: allCatches.length,
    catchesOverTime: Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count })),
    speciesBreakdown: Array.from(speciesCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([species, count]) => ({ species, count })),
    averageWeightBySpecies: Array.from(speciesWeight.entries())
      .map(([species, { sum, n }]) => ({
        species,
        averageWeight: Number((sum / n).toFixed(2)),
        catches: n,
      }))
      .sort((a, b) => b.averageWeight - a.averageWeight),
  };
});
