import { createBrowserClient } from '@supabase/ssr'

// Step A: The Architectural Intent
// This is the "Browser Client". It is used in Client Components (hooks, event listeners).
// It acts as a singleton on the client, maintaining the session in local storage.

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

// Step B: Code Breakdown
// - `createBrowserClient`: Factory function from `@supabase/ssr` specifically for client-side.
// - `process.env...`: Accesses the public keys we defined in `.env.local`.

// Step C: What's Next
// We will use this in our React hooks (e.g., specific feature stores) to subscribe to Realtime changes.
