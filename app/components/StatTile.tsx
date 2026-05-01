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
      <p className="mt-1.5 break-words font-display text-2xl leading-tight text-moss-900 sm:mt-2 sm:text-3xl">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-moss-600">{hint}</p>}
    </div>
  );
}
