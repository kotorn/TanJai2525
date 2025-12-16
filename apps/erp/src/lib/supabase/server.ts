// Stubbed to unblock build
export function createClient() {
  console.warn('Supabase client is stubbed');
  return {
    from: () => ({ select: () => ({ data: [], error: null }), insert: () => ({}), update: () => ({}), eq: () => ({}), single: () => ({ data: null }), in: () => ({}), order: () => ({}) }),
    auth: { getSession: () => ({ data: { session: null } }), signInWithOAuth: () => ({}), exchangeCodeForSession: () => ({ data: { session: null }, error: null }) }
  } as any
}
