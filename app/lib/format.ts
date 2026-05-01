export function formatDate(value: Date | string): string {
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatWeight(lbs: number): string {
  return `${lbs.toFixed(2)} lb`;
}

export function formatLength(inches: number): string {
  return `${inches.toFixed(1)}"`;
}
