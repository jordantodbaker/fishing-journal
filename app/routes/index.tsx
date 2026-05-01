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
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-5 py-10 text-center sm:px-6 sm:py-16">
      <p className="rounded-full border border-moss-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-moss-700 shadow-card sm:text-xs">
        Pacific Northwest catch tracker
      </p>
      <h1 className="mt-5 font-display text-[2.25rem] leading-[1.1] text-moss-900 sm:mt-6 sm:text-6xl">
        Log every fish.
        <br />
        <span className="text-moss-600">Read the river over time.</span>
      </h1>
      <p className="mt-4 max-w-xl text-base text-moss-700 sm:mt-5 sm:text-lg">
        A simple, mobile-friendly journal for the boat, the bank, or the dock.
        Track species, weight, length, location, and method — and watch the
        season unfold in charts.
      </p>
      <div className="mt-7 flex w-full max-w-xs flex-col items-stretch gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
        <Link
          to="/sign-in/$"
          params={{ _splat: "" }}
          className="btn-primary w-full sm:w-auto"
        >
          Sign in to get started
        </Link>
      </div>
      <ul className="mt-10 grid w-full grid-cols-1 gap-3 text-left sm:mt-12 sm:grid-cols-3">
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
