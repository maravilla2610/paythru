'use server'

import { createClient } from '@/lib/providers/supabase/server'
import { CompanyFormData as Company } from '@/lib/domain/entities/company'

export async function getCompanies(userId: number | null): Promise<Company[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('Company')
        .select('*')
        .eq('user_id', userId)
    if (error) {
        throw new Error('Error fetching companies')
    }    

    return data as Company[]
}