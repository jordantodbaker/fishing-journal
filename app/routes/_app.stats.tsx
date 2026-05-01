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
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="font-display text-2xl text-moss-900 sm:text-3xl">
          Stats
        </h1>
        <p className="text-sm text-moss-600">
          {data.totalCatches} catch{data.totalCatches === 1 ? "" : "es"}{" "}
          analyzed.
        </p>
      </div>

      <section className="card">
        <h2 className="mb-3 font-display text-lg sm:text-xl">
          Catches over time
        </h2>
        <div className="h-56 sm:h-64">
          <ResponsiveContainer>
            <LineChart
              data={data.catchesOverTime}
              margin={{ top: 5, right: 10, bottom: 5, left: -10 }}
            >
              <CartesianGrid stroke="#e6ede0" strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                stroke="#476938"
                fontSize={11}
                interval="preserveStartEnd"
                minTickGap={20}
              />
              <YAxis
                allowDecimals={false}
                stroke="#476938"
                fontSize={11}
                width={32}
              />
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

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <section className="card">
          <h2 className="mb-3 font-display text-lg sm:text-xl">
            Breakdown by species
          </h2>
          <div className="h-72 sm:h-80">
            <ResponsiveContainer>
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={data.speciesBreakdown}
                  dataKey="count"
                  nameKey="species"
                  cx="50%"
                  cy="42%"
                  outerRadius="70%"
                >
                  {data.speciesBreakdown.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={PIE_COLORS[idx % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconSize={10}
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card">
          <h2 className="mb-3 font-display text-lg sm:text-xl">
            Average weight by species
          </h2>
          <div className="h-72 sm:h-80">
            <ResponsiveContainer>
              <BarChart
                data={data.averageWeightBySpecies}
                margin={{ top: 5, right: 10, bottom: 40, left: -10 }}
              >
                <CartesianGrid stroke="#e6ede0" strokeDasharray="3 3" />
                <XAxis
                  dataKey="species"
                  stroke="#476938"
                  fontSize={11}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke="#476938"
                  fontSize={11}
                  width={36}
                  label={{
                    value: "lbs",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#476938",
                    fontSize: 11,
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
