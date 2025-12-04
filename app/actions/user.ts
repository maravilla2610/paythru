'use server'

import { createClient } from '@/lib/supabase/server'
import { User } from '@/lib/entities/user'

export async function getUser(): Promise<User | null> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
        .from('Users')
        .select('*')
        .eq('auth_id', user?.id)
        .single()

    if (error) {
        console.error('Error fetching user:', error)
        return null
    }    

    return data as User | null
}