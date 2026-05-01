import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { CatchForm } from "~/components/CatchForm";
import { deleteCatch, getCatch, updateCatch } from "~/server/catches";
import type { CatchInput } from "~/lib/validation";
import { formatDate, formatLength, formatWeight } from "~/lib/format";

const buildQuery = (id: string) => ({
  queryKey: ["catch", id] as const,
  queryFn: () => getCatch({ data: { id } }),
});

export const Route = createFileRoute("/_app/catches/$id")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(buildQuery(params.id)),
  component: CatchDetailPage,
});

function CatchDetailPage() {
  return (
    <Suspense fallback={<div className="card h-64 animate-pulse" />}>
      <CatchDetailContent />
    </Suspense>
  );
}

function CatchDetailContent() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(buildQuery(id));
  const [editing, setEditing] = useState(false);

  const update = useMutation({
    mutationFn: (input: CatchInput) =>
      updateCatch({ data: { id, ...input } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      setEditing(false);
    },
  });

  const remove = useMutation({
    mutationFn: () => deleteCatch({ data: { id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      navigate({ to: "/catches" });
    },
  });

  function confirmDelete() {
    if (window.confirm("Delete this catch? This cannot be undone.")) {
      remove.mutate();
    }
  }

  if (editing) {
    return (
      <div className="mx-auto max-w-3xl space-y-5 sm:space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-2xl text-moss-900 sm:text-3xl">
            Edit catch
          </h1>
          <button
            className="btn-secondary"
            onClick={() => setEditing(false)}
            disabled={update.isPending}
          >
            Cancel
          </button>
        </div>
        <div className="card">
          <CatchForm
            initial={{
              species: data.species,
              weight: data.weight,
              length: data.length,
              location: data.location,
              method: data.method,
              dateCaught: data.dateCaught,
              notes: data.notes ?? undefined,
              photoUrl: data.photoUrl ?? undefined,
            }}
            submitLabel="Save changes"
            pending={update.isPending}
            onSubmit={async (input) => {
              await update.mutateAsync(input);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/catches"
          className="text-sm font-medium text-river-700 hover:underline"
        >
          ← All catches
        </Link>
        <div className="flex gap-2">
          <button
            className="btn-secondary flex-1 sm:flex-none"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
          <button
            className="btn-danger flex-1 sm:flex-none"
            onClick={confirmDelete}
            disabled={remove.isPending}
          >
            {remove.isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt={`${data.species} caught at ${data.location}`}
          className="aspect-video w-full rounded-2xl border border-moss-100 object-cover shadow-card"
        />
      )}

      <div className="card space-y-4">
        <div>
          <h1 className="font-display text-2xl text-moss-900 sm:text-3xl">
            {data.species}
          </h1>
          <p className="text-sm text-moss-600">
            {formatDate(data.dateCaught)} • {data.location}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Field label="Weight" value={formatWeight(data.weight)} />
          <Field label="Length" value={formatLength(data.length)} />
          <Field label="Method" value={data.method} />
          <Field label="Logged" value={formatDate(data.createdAt)} />
        </dl>

        {data.notes && (
          <div>
            <p className="label">Notes</p>
            <p className="whitespace-pre-wrap text-sm text-moss-800">
              {data.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-moss-600">
        {label}
      </dt>
      <dd className="mt-1 font-medium text-moss-900">{value}</dd>
    </div>
  );
}
