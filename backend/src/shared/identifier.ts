export function createIdentifier(prefix: string): string {
  const timestampPortion = Date.now().toString(36);
  const randomPortion = Math.floor(Math.random() * 1_000_000)
    .toString(36)
    .padStart(4, "0");

  return `${prefix}_${timestampPortion}_${randomPortion}`;
}
