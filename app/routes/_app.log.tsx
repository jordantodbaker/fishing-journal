import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CatchForm } from "~/components/CatchForm";
import { createCatch } from "~/server/catches";
import type { CatchInput } from "~/lib/validation";

export const Route = createFileRoute("/_app/log")({
  component: LogCatchPage,
});

function LogCatchPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CatchInput) => createCatch({ data }),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries();
      navigate({ to: "/catches/$id", params: { id: created.id } });
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5 sm:space-y-6">
      <div>
        <h1 className="font-display text-2xl text-moss-900 sm:text-3xl">
          Log a catch
        </h1>
        <p className="text-sm text-moss-600">
          Record a single fish — species, size, where and how it came in.
        </p>
      </div>
      <div className="card">
        <CatchForm
          submitLabel="Save catch"
          pending={mutation.isPending}
          onSubmit={async (data) => {
            await mutation.mutateAsync(data);
          }}
        />
      </div>
    </div>
  );
}
