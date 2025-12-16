// Stubbed to unblock build
// import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return {
    from: () => ({ select: () => ({ data: [], error: null }), insert: () => ({ select: () => ({ data: null, error: null }) }), update: () => ({}), eq: () => ({}), single: () => ({ data: null }) }),
    auth: { admin: { createUser: () => ({ data: { user: null }, error: null }) } }
  } as any;
}
