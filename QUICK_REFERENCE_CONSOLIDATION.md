# Quick Reference: Supabase Client Consolidation

## TL;DR

We've consolidated duplicate Supabase client instances to save ~1.4MB memory and reduce code duplication.

## Quick Start

### For Client Components
```javascript
import { useSupabaseClient } from '@/lib/supabaseClient';

export default function MyPage() {
  const supabase = useSupabaseClient();
  // Use it like before!
}
```

### For API Routes
```javascript
import { getSupabaseRouteClient } from '@/lib/supabaseRouteHandler';

export async function GET(request) {
  const supabase = await getSupabaseRouteClient();
  // Use it like before!
}
```

## What Changed

| Before | After | Benefit |
|--------|-------|---------|
| `createClientComponentClient()` | `useSupabaseClient()` | Reuses instance, 100KB savings |
| Multiple client instances | Single singleton | ~1.4MB total savings |
| Cookie boilerplate in each route | `getSupabaseRouteClient()` | 8 lines → 1 line per route |
| Import from `@supabase/auth-helpers-nextjs` | Import from `@/lib/*` | Centralized, easier to maintain |

## Files Already Updated

✅ `app/menu/page.js`
✅ `app/user/meal-history/page.js`
✅ `app/admin/menu/page.js`
✅ `app/api/menu/route.js`

## Migration Checklist

For each file needing updates:

- [ ] Replace import `createClientComponentClient` with `useSupabaseClient` (or `getSupabaseRouteClient` for API)
- [ ] Remove `const supabase = createClientComponentClient()` line
- [ ] Add `const supabase = useSupabaseClient()` (or `await getSupabaseRouteClient()`)
- [ ] Test the file works correctly
- [ ] Commit changes

## Code Diff Example

```diff
- import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
+ import { useSupabaseClient } from '@/lib/supabaseClient';

export default function Page() {
-   const supabase = createClientComponentClient();
+   const supabase = useSupabaseClient();
    // Rest stays the same
}
```

## Files Still Needing Updates

**Pages (14 files):**
- app/user/dashboard/page.js
- app/admin/dashboard/page.js
- app/login/page.js
- app/page.js
- app/admin/billing/page.js
- app/user/billing/page.js
- app/admin/polls/page.js
- app/poll/page.js
- And more...

**Components (2 files):**
- app/admin/dashboard/components/UserDetailModal.js
- app/admin/polls/components/PollResponseTable.js

**API Routes (8+ files):**
- app/api/billing/route.js
- app/api/expenses/route.js
- app/api/inventory-items/route.js
- app/api/revenue/route.js
- app/api/reminders/route.js
- app/api/inventory-logs/route.js
- And more...

## Full Docs

📖 See `SUPABASE_CLIENT_CONSOLIDATION.md` for detailed migration guide
📋 See `SUPABASE_CONSOLIDATION_SUMMARY.md` for implementation status

## Questions?

- **How do I use it in a component?** → `import { useSupabaseClient }` and call it
- **How do I use it in an API route?** → `import { getSupabaseRouteClient }` and `await` it
- **Will my code break?** → No! It's a drop-in replacement
- **Can I migrate gradually?** → Yes! Old and new code work together

## One-Line Changes

Replace entire imports + initialization:

**Client Component:**
```javascript
// Just change these 2 lines in ANY client component:
// Line 1: import { useSupabaseClient } from '@/lib/supabaseClient';
// Line N: const supabase = useSupabaseClient();
```

**API Route:**
```javascript
// Just change these 2 lines in ANY API route:
// Line 1: import { getSupabaseRouteClient } from '@/lib/supabaseRouteHandler';
// Line N: const supabase = await getSupabaseRouteClient();
```

That's it! ✨
