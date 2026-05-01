import { createServerFn } from "@tanstack/react-start";
import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { requireUserId } from "./auth";
import {
  catchFilterSchema,
  catchInputSchema,
  catchUpdateSchema,
} from "~/lib/validation";

export const listSpecies = createServerFn({ method: "GET" }).handler(async () => {
  await requireUserId();
  return prisma.species.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
});

export const listCatches = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => catchFilterSchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const where: Prisma.CatchWhereInput = { userId };
    if (data.species) where.species = data.species;
    if (data.location)
      where.location = { contains: data.location, mode: "insensitive" };
    if (data.from || data.to) {
      where.dateCaught = {};
      if (data.from) where.dateCaught.gte = data.from;
      if (data.to) where.dateCaught.lte = data.to;
    }

    const [items, total] = await Promise.all([
      prisma.catch.findMany({
        where,
        orderBy: { dateCaught: "desc" },
        skip: (data.page - 1) * data.pageSize,
        take: data.pageSize,
      }),
      prisma.catch.count({ where }),
    ]);

    return {
      items,
      total,
      page: data.page,
      pageSize: data.pageSize,
      pageCount: Math.max(1, Math.ceil(total / data.pageSize)),
    };
  });

export const getCatch = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => {
    if (typeof data !== "object" || !data || !("id" in data)) {
      throw new Error("id is required");
    }
    return { id: String((data as { id: unknown }).id) };
  })
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const record = await prisma.catch.findFirst({
      where: { id: data.id, userId },
    });
    if (!record) throw new Error("Catch not found");
    return record;
  });

export const createCatch = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => catchInputSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    return prisma.catch.create({
      data: { ...data, userId },
    });
  });

export const updateCatch = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => catchUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const { id, ...rest } = data;
    const result = await prisma.catch.updateMany({
      where: { id, userId },
      data: rest,
    });
    if (result.count === 0) throw new Error("Catch not found");
    return prisma.catch.findUniqueOrThrow({ where: { id } });
  });

export const deleteCatch = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (typeof data !== "object" || !data || !("id" in data)) {
      throw new Error("id is required");
    }
    return { id: String((data as { id: unknown }).id) };
  })
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const result = await prisma.catch.deleteMany({
      where: { id: data.id, userId },
    });
    if (result.count === 0) throw new Error("Catch not found");
    return { ok: true };
  });
