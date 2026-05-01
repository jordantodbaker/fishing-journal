import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });

  const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultErrorComponent: ({ error }) => (
      <div className="m-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
        <h1 className="font-display text-xl">Something went wrong</h1>
        <p className="mt-2 text-sm opacity-80">{error.message}</p>
      </div>
    ),
    defaultNotFoundComponent: () => (
      <div className="m-8 rounded-2xl border border-moss-200 bg-white p-6 text-moss-900">
        <h1 className="font-display text-xl">Not found</h1>
        <p className="mt-2 text-sm opacity-80">
          That page swam off. Try heading back to the dashboard.
        </p>
      </div>
    ),
    context: { queryClient },
    scrollRestoration: true,
  });

  return routerWithQueryClient(router, queryClient);
}
