import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getOptionalUserId } from "~/server/auth";

const checkAuth = createServerFn({ method: "GET" }).handler(async () => {
  return { userId: await getOptionalUserId() };
});

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { userId } = await checkAuth();
    if (userId) throw redirect({ to: "/dashboard" });
  },
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="rounded-full border border-moss-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-moss-700 shadow-card">
        Pacific Northwest catch tracker
      </p>
      <h1 className="mt-6 font-display text-4xl text-moss-900 sm:text-6xl">
        Log every fish.
        <br />
        <span className="text-moss-600">Read the river over time.</span>
      </h1>
      <p className="mt-5 max-w-xl text-base text-moss-700 sm:text-lg">
        A simple, mobile-friendly journal for the boat, the bank, or the dock.
        Track species, weight, length, location, and method — and watch the
        season unfold in charts.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/sign-in/$"
          params={{ _splat: "" }}
          className="btn-primary"
        >
          Sign in to get started
        </Link>
      </div>
      <ul className="mt-12 grid w-full grid-cols-1 gap-3 text-left sm:grid-cols-3">
        {[
          { t: "Log", d: "Record species, weight, length, location, method." },
          {
            t: "Filter",
            d: "Browse history by species, location, date range.",
          },
          { t: "Visualize", d: "Catches over time and species breakdowns." },
        ].map((f) => (
          <li key={f.t} className="card">
            <p className="font-display text-xl">{f.t}</p>
            <p className="mt-1 text-sm text-moss-700">{f.d}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
