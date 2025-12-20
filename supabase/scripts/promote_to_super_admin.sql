-- ==============================================================================
-- SCRIPT: PROMOTE USER TO SUPER ADMIN
-- PURPOSE: Grant 'super_admin' privileges to a specific user for "Virtual Testing"
--          on Live Production.
-- 
-- INSTRUCTIONS:
-- 1.  Find the User's UUID from the Authentication > Users table in Supabase Dashboard.
--     OR use the email address to find the ID.
-- 2.  Replace 'REPLACE_WITH_USER_ID' with the actual UUID string.
-- 3.  Run this script in the Supabase SQL Editor.
-- ==============================================================================

-- Option 1: Update by UUID (Recommended - Safest)
-- UPDATE public.users
-- SET role = 'super_admin'
-- WHERE id = 'REPLACE_WITH_USER_ID'::uuid;

-- Option 2: Update by Email (Easier if you know the exact email)
DO $$
DECLARE
    target_email TEXT := 'REPLACE_WITH_USER_EMAIL'; -- e.g., 'kan@tanjai.com'
    found_id uuid;
BEGIN
    SELECT id INTO found_id FROM auth.users WHERE email = target_email;

    IF found_id IS NULL THEN
        RAISE NOTICE 'User with email % not found.', target_email;
    ELSE
        UPDATE public.users
        SET role = 'super_admin'
        WHERE id = found_id;
        
        RAISE NOTICE 'SUCCESS: User % (ID: %) has been promoted to super_admin.', target_email, found_id;
    END IF;
END $$;
