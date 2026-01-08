'use server'

import { PersonFormData } from "@/lib/domain/entities/person";
import { createClient } from "@/lib/providers/supabase/server";
import { RegisterCompanyService } from "@/lib/services/register";

import { SesEmailProvider } from "../providers/ses-email-provider";

export async function registerUser(formData: PersonFormData, userId?: number) {
    const supabase = await createClient();
    const registerCompanyService = new RegisterCompanyService(supabase, new SesEmailProvider());
    await registerCompanyService.register(formData, userId);
}