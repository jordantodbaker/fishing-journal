import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { listSpecies } from "~/server/catches";
import { catchInputSchema, type CatchInput } from "~/lib/validation";

type Props = {
  initial?: Partial<CatchInput>;
  submitLabel: string;
  onSubmit: (data: CatchInput) => Promise<void> | void;
  pending?: boolean;
};

const CUSTOM_SPECIES = "__custom__";

function toDateInput(value: Date | string | undefined): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  const d = value instanceof Date ? value : new Date(value);
  return d.toISOString().slice(0, 10);
}

export function CatchForm({ initial, submitLabel, onSubmit, pending }: Props) {
  const speciesQuery = useQuery({
    queryKey: ["species"],
    queryFn: () => listSpecies(),
  });

  const knownSpecies = speciesQuery.data ?? [];
  const initialSpeciesIsKnown =
    !initial?.species ||
    knownSpecies.some((s) => s.name === initial?.species);

  const [speciesSelect, setSpeciesSelect] = useState<string>(
    initial?.species && initialSpeciesIsKnown
      ? initial.species
      : initial?.species
        ? CUSTOM_SPECIES
        : "",
  );
  const [customSpecies, setCustomSpecies] = useState<string>(
    initial?.species && !initialSpeciesIsKnown ? initial.species : "",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setSubmitError(null);

    const formData = new FormData(event.currentTarget);
    const speciesValue =
      speciesSelect === CUSTOM_SPECIES ? customSpecies : speciesSelect;

    const candidate = {
      species: speciesValue,
      weight: formData.get("weight"),
      length: formData.get("length"),
      location: formData.get("location"),
      method: formData.get("method"),
      dateCaught: formData.get("dateCaught"),
      notes: formData.get("notes") ?? undefined,
      photoUrl: formData.get("photoUrl") ?? undefined,
    };

    const result = catchInputSchema.safeParse(candidate);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      await onSubmit(result.data);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not save catch");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="label" htmlFor="species">
          Species
        </label>
        <select
          id="species"
          className="input"
          value={speciesSelect}
          onChange={(e) => setSpeciesSelect(e.target.value)}
        >
          <option value="" disabled>
            {speciesQuery.isLoading ? "Loading…" : "Select a species"}
          </option>
          {knownSpecies.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
          <option value={CUSTOM_SPECIES}>Other (type your own)…</option>
        </select>
        {speciesSelect === CUSTOM_SPECIES && (
          <input
            type="text"
            className="input mt-2"
            placeholder="e.g. Kokanee"
            value={customSpecies}
            onChange={(e) => setCustomSpecies(e.target.value)}
            maxLength={80}
          />
        )}
        {errors.species && (
          <p className="mt-1 text-xs text-red-700">{errors.species}</p>
        )}
      </div>

      <div>
        <label className="label" htmlFor="weight">
          Weight (lbs)
        </label>
        <input
          id="weight"
          name="weight"
          type="number"
          step="0.01"
          min="0"
          className="input"
          defaultValue={initial?.weight ?? ""}
          required
        />
        {errors.weight && (
          <p className="mt-1 text-xs text-red-700">{errors.weight}</p>
        )}
      </div>

      <div>
        <label className="label" htmlFor="length">
          Length (in)
        </label>
        <input
          id="length"
          name="length"
          type="number"
          step="0.1"
          min="0"
          className="input"
          defaultValue={initial?.length ?? ""}
          required
        />
        {errors.length && (
          <p className="mt-1 text-xs text-red-700">{errors.length}</p>
        )}
      </div>

      <div>
        <label className="label" htmlFor="location">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          className="input"
          placeholder="e.g. Skagit River, Neah Bay"
          defaultValue={initial?.location ?? ""}
          required
        />
        {errors.location && (
          <p className="mt-1 text-xs text-red-700">{errors.location}</p>
        )}
      </div>

      <div>
        <label className="label" htmlFor="method">
          Method
        </label>
        <input
          id="method"
          name="method"
          type="text"
          className="input"
          placeholder="e.g. Fly fishing, Trolling, Netting"
          defaultValue={initial?.method ?? ""}
          required
        />
        {errors.method && (
          <p className="mt-1 text-xs text-red-700">{errors.method}</p>
        )}
      </div>

      <div>
        <label className="label" htmlFor="dateCaught">
          Date caught
        </label>
        <input
          id="dateCaught"
          name="dateCaught"
          type="date"
          className="input"
          defaultValue={toDateInput(
            initial?.dateCaught as Date | string | undefined,
          )}
          required
        />
        {errors.dateCaught && (
          <p className="mt-1 text-xs text-red-700">{errors.dateCaught}</p>
        )}
      </div>

      <div className="sm:col-span-2">
        <label className="label" htmlFor="photoUrl">
          Photo URL (optional)
        </label>
        <input
          id="photoUrl"
          name="photoUrl"
          type="url"
          className="input"
          placeholder="https://…"
          defaultValue={initial?.photoUrl ?? ""}
        />
        {errors.photoUrl && (
          <p className="mt-1 text-xs text-red-700">{errors.photoUrl}</p>
        )}
      </div>

      <div className="sm:col-span-2">
        <label className="label" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          className="input min-h-[100px] resize-y"
          placeholder="Tide, weather, gear, who you were with…"
          defaultValue={initial?.notes ?? ""}
        />
        {errors.notes && (
          <p className="mt-1 text-xs text-red-700">{errors.notes}</p>
        )}
      </div>

      {submitError && (
        <div className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {submitError}
        </div>
      )}

      <div className="sm:col-span-2 flex justify-end">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
