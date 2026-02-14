import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Step A: The Architectural Intent
// This is the "Server Client". It is used in Server Components and Server Actions.
// Unlike the browser client, this one must safely read/write HttpOnly cookies to manage the session.
// CRITICAL: In Next.js 15, `cookies()` is an asynchronous function.

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing user sessions.
                    }
                },
            },
        }
    )
}

// Step B: Code Breakdown
// - `await cookies()`: Access the incoming request cookies (Async in Next.js 15).
// - `getAll()`: Reads cookies to authenticate the user for this request.
// - `setAll()`: Writes cookies (e.g., refreshing a token).
// - `try/catch`: Prevents errors when calling `set` from a Server Component (which cannot write cookies directly).

// Step C: What's Next
// We will use this in `page.tsx` servers to fetch data and in `actions.ts` to mutate data.
