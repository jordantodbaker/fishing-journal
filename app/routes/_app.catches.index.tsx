import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { z } from "zod";
import { listCatches } from "~/server/catches";
import { formatDate, formatLength, formatWeight } from "~/lib/format";

const searchSchema = z.object({
  species: z.string().optional(),
  location: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
});

type SearchParams = z.infer<typeof searchSchema>;

const PAGE_SIZE = 20;

function buildQuery(search: SearchParams) {
  const page = search.page ?? 1;
  return {
    queryKey: ["catches", { ...search, page }] as const,
    queryFn: () =>
      listCatches({
        data: {
          species: search.species,
          location: search.location,
          from: search.from,
          to: search.to,
          page,
          pageSize: PAGE_SIZE,
        },
      }),
  };
}

export const Route = createFileRoute("/_app/catches/")({
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(buildQuery(deps)),
  component: CatchesPage,
});

function CatchesPage() {
  return (
    <Suspense fallback={<div className="card h-64 animate-pulse" />}>
      <CatchesContent />
    </Suspense>
  );
}

function CatchesContent() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/catches/" });
  const { data } = useSuspenseQuery(buildQuery(search));

  const [draft, setDraft] = useState({
    species: search.species ?? "",
    location: search.location ?? "",
    from: search.from ?? "",
    to: search.to ?? "",
  });

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    navigate({
      search: {
        species: draft.species || undefined,
        location: draft.location || undefined,
        from: draft.from || undefined,
        to: draft.to || undefined,
        page: 1,
      },
    });
  }

  function clearFilters() {
    setDraft({ species: "", location: "", from: "", to: "" });
    navigate({ search: { page: 1 } });
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-moss-900 sm:text-3xl">
            Catch history
          </h1>
          <p className="text-sm text-moss-600">
            {data.total} catch{data.total === 1 ? "" : "es"} on file.
          </p>
        </div>
        <Link to="/log" className="btn-primary w-full sm:w-auto">
          + Log a catch
        </Link>
      </div>

      <form
        onSubmit={applyFilters}
        className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div>
          <label className="label" htmlFor="f-species">
            Species
          </label>
          <input
            id="f-species"
            className="input"
            value={draft.species}
            onChange={(e) =>
              setDraft((d) => ({ ...d, species: e.target.value }))
            }
            placeholder="e.g. Coho Salmon"
          />
        </div>
        <div>
          <label className="label" htmlFor="f-location">
            Location
          </label>
          <input
            id="f-location"
            className="input"
            value={draft.location}
            onChange={(e) =>
              setDraft((d) => ({ ...d, location: e.target.value }))
            }
            placeholder="e.g. Skagit"
          />
        </div>
        <div>
          <label className="label" htmlFor="f-from">
            From
          </label>
          <input
            id="f-from"
            type="date"
            className="input"
            value={draft.from}
            onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
          />
        </div>
        <div>
          <label className="label" htmlFor="f-to">
            To
          </label>
          <input
            id="f-to"
            type="date"
            className="input"
            value={draft.to}
            onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
          />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end lg:col-span-4">
          <button
            type="button"
            className="btn-secondary w-full sm:w-auto"
            onClick={clearFilters}
          >
            Clear
          </button>
          <button type="submit" className="btn-primary w-full sm:w-auto">
            Apply filters
          </button>
        </div>
      </form>

      {data.items.length === 0 ? (
        <div className="card text-center text-sm text-moss-600">
          No catches match those filters.
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <ul className="divide-y divide-moss-100">
            {data.items.map((c) => (
              <li key={c.id}>
                <Link
                  to="/catches/$id"
                  params={{ id: c.id }}
                  className="block hover:bg-moss-50/60"
                >
                  {/* Mobile layout */}
                  <div className="flex items-start justify-between gap-3 px-4 py-3 sm:hidden">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-moss-900">
                        {c.species}
                      </p>
                      <p className="truncate text-xs text-moss-600">
                        {formatDate(c.dateCaught)} • {c.location}
                      </p>
                      <p className="truncate text-xs text-moss-500">
                        {c.method}
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
                  </div>
                  {/* Desktop layout */}
                  <div className="hidden grid-cols-5 items-center gap-2 px-4 py-3 sm:grid">
                    <div className="col-span-2 min-w-0">
                      <p className="truncate font-medium text-moss-900">
                        {c.species}
                      </p>
                      <p className="text-xs text-moss-600">
                        {formatDate(c.dateCaught)}
                      </p>
                    </div>
                    <div className="truncate text-sm text-moss-700">
                      {c.location}
                    </div>
                    <div className="truncate text-sm text-moss-700">
                      {c.method}
                    </div>
                    <div className="text-right text-sm text-moss-800">
                      {formatWeight(c.weight)}
                      <span className="ml-2 text-moss-500">
                        {formatLength(c.length)}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Pagination
        page={data.page}
        pageCount={data.pageCount}
        onChange={(page) =>
          navigate({ search: { ...search, page }, replace: false })
        }
      />
    </div>
  );
}

function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 text-sm text-moss-700">
      <button
        className="btn-secondary disabled:opacity-50"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <span className="sm:hidden">←</span>
        <span className="hidden sm:inline">← Newer</span>
      </button>
      <span className="whitespace-nowrap">
        Page {page} of {pageCount}
      </span>
      <button
        className="btn-secondary disabled:opacity-50"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        <span className="sm:hidden">→</span>
        <span className="hidden sm:inline">Older →</span>
      </button>
    </div>
  );
}
