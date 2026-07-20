import { BusinessRule } from '@servicenow/sdk/core';

import { setPriority } from '../../server/business-rules/set-priority';

// Keeps `priority` in sync with `impact` and `urgency` on your app's table.
//
// To adopt: copy `examples/fluent` and `examples/server` into `src/` (after
// `init`), change `table` to a table in your scope, then run `pnpm run build`
// so the 'set-priority' key is registered in keys.ts — and commit that file.
BusinessRule({
  $id: Now.ID['set-priority'],
  name: 'Set priority from impact and urgency',
  table: 'x_yourcompany_yourapp_request',
  when: 'before',
  action: ['insert', 'update'],
  order: 100,
  script: setPriority,
});
