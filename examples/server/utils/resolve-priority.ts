/**
 * Example of the recommended pattern: business logic as a pure function,
 * free of Glide APIs, so it can be unit-tested with Vitest without an
 * instance. The Glide-facing wrapper lives in `../business-rules/`.
 */

const LEVELS = [1, 2, 3] as const;

/** Impact / urgency level as stored in choice fields (1 = high, 3 = low). */
export type Level = (typeof LEVELS)[number];

export function isLevel(value: number): value is Level {
  return (LEVELS as readonly number[]).includes(value);
}

/**
 * Simplified priority matrix: 1 (critical) … 5 (planning).
 * Replace with your organization's mapping — the pattern, not the
 * formula, is the point of this example.
 */
export function resolvePriority(impact: Level, urgency: Level): number {
  return impact + urgency - 1;
}
