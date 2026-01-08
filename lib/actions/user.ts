'use server'

import { createClient } from '@/lib/providers/supabase/server'
import { User } from '@/lib/domain/entities/user'

export async function getUser(): Promise<User | null> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
        .from('UsersPayThru')
        .select('*')
        .eq('correo', user?.email)
        .single()

    if (error) {
        return null
    }    

    return data as User | null
}