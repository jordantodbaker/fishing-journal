import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { getDashboard } from "~/server/stats";
import { StatTile } from "~/components/StatTile";
import { formatDate, formatLength, formatWeight } from "~/lib/format";

const dashboardQuery = {
  queryKey: ["dashboard"],
  queryFn: () => getDashboard(),
};

export const Route = createFileRoute("/_app/dashboard")({
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQuery),
  component: DashboardPage,
  pendingComponent: () => <DashboardSkeleton />,
});

function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { data } = useSuspenseQuery(dashboardQuery);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-moss-900 sm:text-3xl">
            Dashboard
          </h1>
          <p className="text-sm text-moss-600">A quick read on your season.</p>
        </div>
        <Link to="/log" className="btn-primary w-full sm:w-auto">
          + Log a catch
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatTile label="Total catches" value={data.total} />
        <StatTile
          label="Most caught"
          value={data.mostCaughtSpecies?.species ?? "—"}
          hint={
            data.mostCaughtSpecies
              ? `${data.mostCaughtSpecies.count} catch${
                  data.mostCaughtSpecies.count === 1 ? "" : "es"
                }`
              : "No catches yet"
          }
        />
        <StatTile
          label="Heaviest"
          value={data.heaviest ? formatWeight(data.heaviest.weight) : "—"}
          hint={
            data.heaviest
              ? `${data.heaviest.species} • ${formatDate(data.heaviest.dateCaught)}`
              : "No catches yet"
          }
        />
      </div>

      <section className="card">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg sm:text-xl">Recent catches</h2>
          <Link
            to="/catches"
            className="whitespace-nowrap text-sm font-medium text-river-700 hover:underline"
          >
            View all →
          </Link>
        </div>
        {data.recent.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-moss-100">
            {data.recent.map((c) => (
              <li key={c.id}>
                <Link
                  to="/catches/$id"
                  params={{ id: c.id }}
                  className="flex items-center justify-between gap-3 py-3 hover:bg-moss-50/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-moss-900">
                      {c.species}
                    </p>
                    <p className="truncate text-xs text-moss-600">
                      {formatDate(c.dateCaught)} • {c.location} • {c.method}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-medium text-moss-800">
                      {formatWeight(c.weight)}
                    </p>
                    <p className="text-xs text-moss-600">
                      {formatLength(c.length)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-moss-200 bg-moss-50/50 p-6 text-center">
      <p className="font-display text-lg text-moss-800">No catches yet</p>
      <p className="mt-1 text-sm text-moss-600">
        Log your first catch and the dashboard will start to fill in.
      </p>
      <Link to="/log" className="btn-primary mt-4">
        + Log a catch
      </Link>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 animate-pulse rounded bg-moss-100" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card h-28 animate-pulse" />
        ))}
      </div>
      <div className="card h-72 animate-pulse" />
    </div>
  );
}
