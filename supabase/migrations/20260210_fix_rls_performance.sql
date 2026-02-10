-- Fix RLS performance warnings by wrapping auth.uid() in subqueries
-- This prevents re-evaluation of auth.uid() for each row
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- Drop existing policies
DROP POLICY IF EXISTS "Users can SELECT their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can INSERT their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can UPDATE their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can DELETE their own preferences" ON public.user_preferences;

-- Recreate policies with optimized auth.uid() calls
CREATE POLICY "Users can SELECT their own preferences"
ON public.user_preferences
FOR SELECT
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can INSERT their own preferences"
ON public.user_preferences
FOR INSERT
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can UPDATE their own preferences"
ON public.user_preferences
FOR UPDATE
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can DELETE their own preferences"
ON public.user_preferences
FOR DELETE
USING (user_id = (select auth.uid()));
