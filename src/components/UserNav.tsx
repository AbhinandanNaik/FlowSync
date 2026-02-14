'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function UserNav() {
    const [user, setUser] = useState<any>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    if (!user) return null

    return (
        <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden md:block">
                {user.email}
            </span>
            <button
                onClick={handleSignOut}
                className="text-sm font-medium text-red-500 hover:text-red-700"
            >
                Sign out
            </button>
        </div>
    )
}
