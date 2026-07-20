import { describe, expect, it } from 'vitest';

import { setPriority, type PriorityRecord } from './set-priority';

function fakeRecord(fields: Record<string, string>): PriorityRecord & {
  fields: ReadonlyMap<string, string>;
} {
  const store = new Map(Object.entries(fields));
  return {
    fields: store,
    getValue: (field) => store.get(field) ?? null,
    setValue: (field, value) => {
      store.set(field, value);
    },
  };
}

describe('setPriority', () => {
  it('sets priority from impact and urgency', () => {
    const record = fakeRecord({ impact: '1', urgency: '2' });

    setPriority(record);

    expect(record.fields.get('priority')).toBe('2');
  });

  it('leaves priority untouched when impact is missing', () => {
    const record = fakeRecord({ urgency: '2', priority: '4' });

    setPriority(record);

    expect(record.fields.get('priority')).toBe('4');
  });

  it('leaves priority untouched when urgency is out of range', () => {
    const record = fakeRecord({ impact: '1', urgency: '9' });

    setPriority(record);

    expect(record.fields.get('priority')).toBeUndefined();
  });
});
