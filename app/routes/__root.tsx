import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { HeadContent, Scripts } from "@tanstack/react-router";
import { ClerkProvider } from "@clerk/tanstack-react-start";
import type { QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import globalsCss from "~/styles/globals.css?url";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Fishing Journal — Pacific Northwest Catch Tracker" },
      {
        name: "description",
        content:
          "Log, browse, and analyze your salt- and freshwater catches across the Pacific Northwest.",
      },
      { name: "theme-color", content: "#476938" },
    ],
    links: [
      { rel: "stylesheet", href: globalsCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <ClerkProvider>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ClerkProvider>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
