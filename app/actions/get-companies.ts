'use server'

import { createClient } from '@/lib/supabase/server'
import { CompanyFormData as Company } from '@/lib/entities/company'

export async function getCompanies(userId: string | null): Promise<Company[]> {
    console.log('Getting companies for userId:', userId)
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('Company')
        .select('*')
        .eq('user_id', userId)
    if (error) {
        console.error('Error fetching companies:', error)
        throw new Error('Error fetching companies')
    }    

    return data as Company[]
}