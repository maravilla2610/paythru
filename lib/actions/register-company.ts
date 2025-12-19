'use server'

import { CompanyFormData } from "@/lib/domain/entities/company";
import { PersonFormData } from "@/lib/domain/entities/person";
import { createClient } from "@/lib/providers/supabase/server";
import { RegisterCompanyService } from "@/lib/services/register-company";

export async function registerCompany(formData: CompanyFormData | PersonFormData) {
    const supabase = await createClient();
    const registerCompanyService = new RegisterCompanyService(supabase);
    await registerCompanyService.registerCompany(formData);
}