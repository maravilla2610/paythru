'use server'

import { CompanyFormData, PersonFormData } from "@/lib/entities/company";
import { createClient } from "@/lib/supabase/server";
export async function registerCompany(formData: CompanyFormData | PersonFormData) {
    const supabase = await createClient();

    const processedData: Record<string, unknown> = { ...formData };

    for (const [key, value] of Object.entries(formData)) {
        if (value instanceof File) {
            const filePath = `private/${formData.user_id}/${Date.now()}_${key}`;
            const { error: uploadError } = await supabase.storage
                .from('documentos')
                .upload(filePath, value, {
                    contentType: value.type,
                });

            if (uploadError) {
                console.error(`Error uploading ${key}:`, uploadError);
                throw new Error(`Error uploading ${key}`);
            }

            processedData[key] = filePath;
        }
    }

    const { data, error } = await supabase.from('Company').insert(processedData)

    if (error) {
        console.error('Error registering company:', error);
        throw new Error('Error registering company');
    }

    return data;
}