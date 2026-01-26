-- Improved fix for get_admin_data function
-- Uses a subquery for ordering to strictly avoid GROUP BY errors
-- This is the most compatible way to handle ordered JSON aggregation in Postgres

CREATE OR REPLACE FUNCTION get_admin_data(p_table_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    result jsonb;
BEGIN
    -- Validation to prevent SQL Injection (allow-list)
    IF p_table_name NOT IN ('projects', 'education', 'experience', 'map_universities') THEN
        RAISE EXCEPTION 'Invalid table name';
    END IF;

    -- Dynamic Query using Subquery for ordering
    -- 1. Selects from the table and orders by order_index
    -- 2. Aggregates the ordered rows into a JSON array
    EXECUTE format('
        SELECT json_agg(t) 
        FROM (
            SELECT * FROM %I ORDER BY order_index ASC
        ) t
    ', p_table_name) INTO result;
    
    -- Return empty array if null
    RETURN coalesce(result, '[]'::jsonb);
END;
$$;
