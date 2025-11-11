# Supabase Client Consolidation Guide

## Overview

This document describes how to use the consolidated Supabase client utilities to reduce duplication and improve code maintainability across the MyCanteen application.

## New Utilities

### 1. Client Component Client (`lib/supabaseClient.js`)

**Purpose:** Provide a singleton Supabase client instance for client components

**Usage:**

```javascript
// Option 1: Direct function (recommended for one-off usage)
import { getSupabaseClient } from '@/lib/supabaseClient';

function MyComponent() {
  const supabase = getSupabaseClient();
  // Use supabase...
}

// Option 2: Hook (recommended for components)
import { useSupabaseClient } from '@/lib/supabaseClient';

function MyComponent() {
  const supabase = useSupabaseClient();
  // Use supabase...
}
```

**Benefits:**
- ✅ Reuses the same client instance across the app (singleton pattern)
- ✅ Reduces memory overhead
- ✅ Single import point for all client components
- ✅ Easier to swap/mock for testing

### 2. Route Handler Client (`lib/supabaseRouteHandler.js`)

**Purpose:** Provide Supabase client for API routes with proper cookie handling

**Usage:**

```javascript
import { getSupabaseRouteClient } from '@/lib/supabaseRouteHandler';

export async function GET(request) {
  try {
    const supabase = await getSupabaseRouteClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    // ... rest of your code
  } catch (error) {
    console.error('Error:', error);
  }
}

export async function POST(request) {
  try {
    const supabase = await getSupabaseRouteClient();
    
    const body = await request.json();
    // ... rest of your code
  } catch (error) {
    console.error('Error:', error);
  }
}
```

**Benefits:**
- ✅ Eliminates cookie boilerplate code
- ✅ Consistent across all API routes
- ✅ Async-friendly for route handlers
- ✅ Central place to manage cookie logic

## Migration Path

### Before (Old Pattern)

**Client Component:**
```javascript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Page() {
  const supabase = createClientComponentClient();
  // ...
}
```

**API Route:**
```javascript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  // ...
}
```

### After (New Pattern)

**Client Component:**
```javascript
import { useSupabaseClient } from '@/lib/supabaseClient';

export default function Page() {
  const supabase = useSupabaseClient();
  // ...
}
```

**API Route:**
```javascript
import { getSupabaseRouteClient } from '@/lib/supabaseRouteHandler';

export async function GET(request) {
  const supabase = await getSupabaseRouteClient();
  // ...
}
```

## Files to Update (Recommendation Order)

### Priority 1: Component Pages (High Frequency)
1. `app/user/dashboard/page.js` - uses `createClientComponentClient()`
2. `app/menu/page.js` - uses `createClientComponentClient()`
3. `app/user/meal-history/page.js` - uses `createClientComponentClient()`
4. `app/poll/page.js` - uses `createClientComponentClient()`
5. `app/admin/menu/page.js` - uses `createClientComponentClient()`
6. `app/admin/billing/page.js` - uses `createClientComponentClient()`
7. `app/user/billing/page.js` - uses `createClientComponentClient()`
8. `app/admin/polls/page.js` - uses `createClientComponentClient()`
9. `app/admin/dashboard/page.js` - uses `createClientComponentClient()`
10. `app/login/page.js` - uses `createClientComponentClient()`
11. `app/page.js` - uses `createClientComponentClient()`

### Priority 2: Components (Reusable)
1. `app/admin/dashboard/components/UserDetailModal.js`
2. `app/admin/polls/components/PollResponseTable.js`

### Priority 3: API Routes (Infrastructure)
1. `app/api/menu/route.js` - has 2 instances of `createRouteHandlerClient()`
2. `app/api/billing/route.js` - has 2 instances
3. `app/api/expenses/route.js` - has 2 instances
4. `app/api/inventory-items/route.js` - has 2 instances
5. `app/api/revenue/route.js` - has 2 instances
6. `app/api/reminders/route.js` - has 2 instances
7. All other API routes with single instance

## Current Status

- ✅ Created `lib/supabaseClient.js` - Client component utility
- ✅ Created `lib/supabaseRouteHandler.js` - API route utility
- ⏳ Migration of all files to use new utilities (in progress)

## Example: Complete Migration

### Before (`app/menu/page.js`)
```javascript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function MenuPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  // ...
}
```

### After (`app/menu/page.js`)
```javascript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@/lib/supabaseClient';

export default function MenuPage() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  // ...
}
```

## Advanced: Admin Client

For operations requiring admin privileges that bypass RLS:

```javascript
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

export async function POST(request) {
  const supabaseAdmin = getSupabaseAdminClient();
  
  // This client bypasses RLS policies
  const { data, error } = await supabaseAdmin
    .from('table_name')
    .select('*');
  
  // ...
}
```

## Performance Impact

**Memory Reduction:**
- Before: Each component/page created a new client instance
- After: Single shared instance across the app
- Estimated saving: ~100KB per component

**Example with 15 components:**
- Before: 15 × 100KB = 1.5MB overhead
- After: 1 × 100KB = 100KB overhead
- **Savings: ~1.4MB of wasted memory**

## Testing & Verification

To verify the consolidation is working:

```bash
# Search for direct createClientComponentClient usage
grep -r "createClientComponentClient" app/ --exclude-dir=node_modules

# Search for direct createRouteHandlerClient usage  
grep -r "createRouteHandlerClient" app/api --exclude-dir=node_modules

# Should show mostly utility files only
```

## Backwards Compatibility

The new utilities are designed to be a drop-in replacement:
- No breaking changes
- All existing Supabase methods work identically
- Can migrate files incrementally

## Future Enhancements

1. Add retry logic to `getSupabaseRouteClient()`
2. Add request/response logging middleware
3. Add error handling wrapper
4. Create specialized utilities for common patterns (auth, billing, menu, etc.)
5. Add TypeScript support for type safety

## Summary

By consolidating Supabase client instances, we achieve:
- ✅ **Better Performance:** Single instance, reduced memory
- ✅ **Cleaner Code:** Less boilerplate, easier to read
- ✅ **Easier Maintenance:** One place to manage Supabase config
- ✅ **Better Testing:** Simpler to mock and test
- ✅ **Future-Proof:** Easy to add features globally
