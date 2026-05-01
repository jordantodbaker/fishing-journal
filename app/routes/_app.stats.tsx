import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getStats } from "~/server/stats";

const statsQuery = {
  queryKey: ["stats"],
  queryFn: () => getStats(),
};

export const Route = createFileRoute("/_app/stats")({
  loader: ({ context }) => context.queryClient.ensureQueryData(statsQuery),
  component: StatsPage,
});

function StatsPage() {
  return (
    <Suspense fallback={<div className="card h-96 animate-pulse" />}>
      <StatsContent />
    </Suspense>
  );
}

const PIE_COLORS = [
  "#476938",
  "#5e844b",
  "#7fa169",
  "#357884",
  "#4d929d",
  "#76b1ba",
  "#bfa172",
  "#a78352",
  "#8d6b40",
];

function StatsContent() {
  const { data } = useSuspenseQuery(statsQuery);

  if (data.totalCatches === 0) {
    return (
      <div className="card text-center text-sm text-moss-700">
        <p className="font-display text-xl text-moss-900">No data yet</p>
        <p className="mt-1">Log a few catches and the charts will fill in.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-moss-900">Stats</h1>
        <p className="text-sm text-moss-600">
          {data.totalCatches} catch{data.totalCatches === 1 ? "" : "es"}{" "}
          analyzed.
        </p>
      </div>

      <section className="card">
        <h2 className="mb-3 font-display text-xl">Catches over time</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={data.catchesOverTime}>
              <CartesianGrid stroke="#e6ede0" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#476938" fontSize={12} />
              <YAxis allowDecimals={false} stroke="#476938" fontSize={12} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#357884"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 font-display text-xl">Breakdown by species</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.speciesBreakdown}
                  dataKey="count"
                  nameKey="species"
                  outerRadius={100}
                  label={(entry) => entry.species}
                >
                  {data.speciesBreakdown.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={PIE_COLORS[idx % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card">
          <h2 className="mb-3 font-display text-xl">
            Average weight by species
          </h2>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={data.averageWeightBySpecies}>
                <CartesianGrid stroke="#e6ede0" strokeDasharray="3 3" />
                <XAxis dataKey="species" stroke="#476938" fontSize={11} />
                <YAxis
                  stroke="#476938"
                  fontSize={12}
                  label={{
                    value: "lbs",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#476938",
                    fontSize: 12,
                  }}
                />
                <Tooltip />
                <Bar
                  dataKey="averageWeight"
                  fill="#476938"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
