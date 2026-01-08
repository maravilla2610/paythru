import { SupabaseClient } from "@supabase/supabase-js";
import { EmailService } from "./email";
import { EmailProvider } from "../domain/interfaces/email-provider";

export class RegisterCompanyService {
    private supabase: SupabaseClient;
    private emailProvider?: EmailProvider;
    private emailService?: EmailService;

    constructor(supabaseClient: SupabaseClient, emailProvider?: EmailProvider) {
        this.supabase = supabaseClient;
        if (emailProvider) {
            this.emailProvider = emailProvider;
            this.emailService = new EmailService(this.emailProvider);
        }
    }

    public async register(formData: Record<string, unknown>, userId?: number): Promise<Record<string, unknown>> {
        return await this.persistUserData(formData, userId);
    }

    public async uploadAllFiles(formData: Record<string, unknown>): Promise<Record<string, unknown>> {
        const processedData: Record<string, unknown> = { ...formData };
        const userId = formData.user_id as number;

        for (const [key, value] of Object.entries(formData)) {
            if (value instanceof File) {
                const filePath = `private/${userId}/${Date.now()}_${key}`;
                const { error: uploadError } = await this.supabase.storage
                    .from("documentos")
                    .upload(filePath, value, {
                        contentType: value.type,
                        upsert: true
                    });
    
                if (uploadError) {
                    throw new Error(`Error uploading ${key}`);
                }
    
                processedData[key] = filePath;
            }
        }

        return processedData;
    }

    private async persistUserData (processedData: Record<string, unknown>, userId?: number): Promise<Record<string, unknown>> {
        processedData.onboarding = true;
        const { data: userData, error: userError } = await this.supabase
            .from("UsersPayThru")
            .update(processedData)
            .eq("id", userId!)
            .select()

        if (userError || !userData) {
            throw new Error(userError?.message || "Error registering user");
        }
        return userData[0];
    }

}