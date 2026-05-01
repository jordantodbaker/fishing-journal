import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { UserButton } from "@clerk/tanstack-react-start";
import { createServerFn } from "@tanstack/react-start";
import { getOptionalUserId } from "~/server/auth";
import { cn } from "~/lib/cn";

const requireSignedIn = createServerFn({ method: "GET" }).handler(async () => {
  return { userId: await getOptionalUserId() };
});

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ location }) => {
    const { userId } = await requireSignedIn();
    if (!userId) {
      throw redirect({
        to: "/sign-in/$",
        params: { _splat: "" },
        search: { redirect: location.href },
      });
    }
  },
  component: AppLayout,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/catches", label: "Catches" },
  { to: "/log", label: "Log a Catch" },
  { to: "/stats", label: "Stats" },
] as const;

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-moss-100 bg-moss-50/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-moss-700 text-moss-50">
              <FishIcon />
            </span>
            <span className="font-display text-lg leading-none text-moss-900">
              Fishing Journal
            </span>
          </Link>
          <nav className="hidden gap-1 sm:flex">
            {NAV.map((item) => {
              const active =
                pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                    active
                      ? "bg-moss-700 text-moss-50"
                      : "text-moss-700 hover:bg-moss-100",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <UserButton />
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3 sm:hidden">
          {NAV.map((item) => {
            const active =
              pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium",
                  active
                    ? "bg-moss-700 text-moss-50"
                    : "border border-moss-200 bg-white text-moss-700",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
      <footer className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-moss-600 sm:px-6">
        Tight lines. Built for the PNW.
      </footer>
    </div>
  );
}

function FishIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 12s3-6 9-6 8 4 8 6-2 6-8 6-9-6-9-6Z" />
      <path d="M22 12l-3 2-3-2 3-2 3 2Z" />
      <circle cx="9" cy="11" r="0.9" fill="currentColor" />
    </svg>
  );
}
