-- Security Audit Script for Supabase/PostgreSQL
-- This script checks for common security misconfigurations.

-- =====================================================================
-- 1. Insecure Functions (SECURITY DEFINER without search_path)
-- =====================================================================
-- Functions defined as SECURITY DEFINER execute with the privileges of the owner.
-- If search_path is not set, a malicious user could create objects in a schema
-- that is searched before system schemas, potentially hijacking the function.
-- =====================================================================

SELECT
    'Insecure Function' as issue_type,
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_function_arguments(p.oid) AS arguments,
    'Function is SECURITY DEFINER but search_path is not set.' as description
FROM
    pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE
    n.nspname NOT IN ('pg_catalog', 'information_schema', 'extensions', 'graphql', 'realtime', 'storage', 'vault', 'pgsodium')
    AND p.prosecdef IS TRUE
    AND (p.proconfig IS NULL OR NOT 'search_path' = ANY(p.proconfig));


-- =====================================================================
-- 2. Tables without Row Level Security (RLS) in 'public' schema
-- =====================================================================
-- In Supabase, the 'public' schema is often exposed via the API.
-- Tables without RLS enabled are accessible to anyone with access to the API
-- (depending on role privileges), which can lead to data leaks.
-- =====================================================================

SELECT
    'Missing RLS' as issue_type,
    n.nspname AS schema_name,
    c.relname AS table_name,
    'N/A' as arguments,
    'Table in public schema does not have Row Level Security (RLS) enabled.' as description
FROM
    pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE
    n.nspname = 'public'
    AND c.relkind = 'r' -- 'r' means ordinary table
    AND c.relrowsecurity IS FALSE;
