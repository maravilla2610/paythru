'use server'


import { createClient } from '@/lib/providers/supabase/server'
import { redirect } from 'next/navigation'

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function login(prevState: { error?: string, message?: string } | null, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string

    const { data: user, error: userError} = await supabase.from('UsersPayThru').select().eq('correo', email).single()

    if (userError || !user) {
        const { error: userError } = await supabase.from('UsersPayThru').insert([
            { 
                correo: `${email}`,
                onboarding: false
            }
        ])
        if (userError) {
            return { error: userError.message }
        }

    }

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
            shouldCreateUser: true
        },
    })

    if (error) {
        return { error: error.message }
    }

    return { message: "Check your email for the login link!" }
}
