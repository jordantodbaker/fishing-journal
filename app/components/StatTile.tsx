import type { ReactNode } from "react";

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="card">
      <p className="text-xs font-semibold uppercase tracking-wider text-moss-600">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl text-moss-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-moss-600">{hint}</p>}
    </div>
  );
}
