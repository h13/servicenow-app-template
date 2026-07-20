import { isLevel, resolvePriority } from '../utils/resolve-priority';

/**
 * Structural view of the GlideRecord methods this rule needs. Keeping the
 * surface minimal makes the function trivial to stub in tests. Once you
 * have run `pnpm run dependencies` in your project, you can switch to the
 * real platform types instead:
 *
 *   import { GlideRecord } from '@servicenow/glide'
 */
export interface PriorityRecord {
  getValue(field: string): string | null;
  setValue(field: string, value: string): void;
}

/** Business rule entry point — receives the record being written. */
export function setPriority(current: PriorityRecord): void {
  const impact = Number(current.getValue('impact'));
  const urgency = Number(current.getValue('urgency'));

  // Leave priority untouched unless both fields hold known levels.
  if (!isLevel(impact) || !isLevel(urgency)) {
    return;
  }

  current.setValue('priority', String(resolvePriority(impact, urgency)));
}
