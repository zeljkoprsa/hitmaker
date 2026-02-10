# Supabase Migrations

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of the migration file
4. Paste and run the SQL

### Option 2: Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push
```

---

## Migration Files

### `20260210_fix_rls_performance.sql`
**Purpose**: Fix Row Level Security (RLS) performance warnings

**Issue**: RLS policies were calling `auth.uid()` directly, causing it to be re-evaluated for each row.

**Fix**: Wrapped auth function calls in subqueries: `(select auth.uid())`

**Impact**:
- Improves query performance at scale
- Resolves all 4 Supabase linter warnings for `user_preferences` table
- No breaking changes - same security policies, just optimized

**Policies Updated**:
- ✅ Users can SELECT their own preferences
- ✅ Users can INSERT their own preferences
- ✅ Users can UPDATE their own preferences
- ✅ Users can DELETE their own preferences

---

## Verification

After applying the migration, verify in Supabase Dashboard:
1. Go to **Database** → **Tables** → `user_preferences`
2. Click **Policies** tab
3. Check that all 4 policies exist and use `(select auth.uid())`
4. Run the database linter again - warnings should be gone
