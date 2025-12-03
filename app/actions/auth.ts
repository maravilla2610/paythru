'use server'


import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function login(prevState: { error?: string, message?: string } | null, formData: FormData) {
    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    const email = formData.get('email') as string

    const user = await supabase.from('Users').select().eq('correo', email).single()

    if (user.error || !user.data.user) {
        const { error: userError } = await supabase.from('Users').insert([
            { 
                correo: `${email}` 
            }
        ])
        if (userError) {
            console.log('User insert error:', userError)
            return { error: userError.message }
        }

    }

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    return { message: "Check your email for the login link!" }
}
