import { SupabaseClient } from "@supabase/supabase-js";
import { CompanyStructure } from "../domain/entities/company-structure";
import { EmailService } from "./email";
import { EmailProvider } from "../domain/interfaces/email-provider";

export class RegisterCompanyService {
    private supabase: SupabaseClient;
    private structureMembers: CompanyStructure[];
    private emailProvider?: EmailProvider;
    private emailService?: EmailService;

    constructor(supabaseClient: SupabaseClient, emailProvider?: EmailProvider) {
        this.supabase = supabaseClient;
        this.structureMembers = [];
        if (emailProvider) {
            this.emailProvider = emailProvider;
            this.emailService = new EmailService(this.emailProvider);
        }
    }

    public async registerCompany(formData: Record<string, unknown>): Promise<void> {
        const processedData = this.removeIrrelevantFields(formData);
        const companyData = await this.persistCompanyData(processedData);
        await this.persistStructureMembers(companyData.id as number, companyData.user_id as number);
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

        if (Array.isArray(processedData["estructura_societaria"])) {
            const structureMembers = processedData["estructura_societaria"] as CompanyStructure[];
            console.log("Uploading structure member documents:", structureMembers);
            const updatedMembers = await Promise.all(structureMembers.map(async (member, index) => {
                const newMember = { ...member };
                
                if (newMember.documento instanceof File) {
                    newMember.documento = await this.uploadStructureMemberDocument(
                        newMember.documento,
                        userId,
                        index,
                        newMember.nombre_completo,
                        "documento"
                    );
                }

                if (newMember.poder instanceof File) {
                    newMember.poder = await this.uploadStructureMemberDocument(
                        newMember.poder,
                        userId,
                        index,
                        newMember.nombre_completo,
                        "poder"
                    );
                }
                return newMember;
            }));
            processedData["estructura_societaria"] = updatedMembers;
        }

        return processedData;
    }

    private removeIrrelevantFields (formData: Record<string, unknown>): Record<string, unknown> {
        const processedData: Record<string, unknown> = { ...formData };

        this.structureMembers = this.structureMembersData(processedData);

        delete processedData["direccion_fiscal"];
        delete processedData["direccion_operativa"];
        delete processedData["pais"];
        delete processedData["estructura_societaria"];

        return processedData;
    }

    private structureMembersData(formData: Record<string, unknown>): CompanyStructure[] {
        const structureMembers = Array.isArray(formData["estructura_societaria"])
            ? (formData["estructura_societaria"] as CompanyStructure[])
            : [];
        return structureMembers;
    }

    private async persistCompanyData (processedData: Record<string, unknown>){

        const { data: companyData, error: companyError } = await this.supabase
            .from("Company")
            .insert(processedData)
            .select()
            .single();

        if (companyError || !companyData) {
            console.error("Company insert error", companyError);
            throw new Error(companyError?.message || "Error registering company");
        }
        return companyData;
    }


    private async persistStructureMembers (companyId: number, userId: number): Promise<void> {
        if (this.structureMembers.length === 0) {
            console.log("No structure members to persist.");
            return;
        }
            

        await Promise.all(this.structureMembers.map(async (member, index) => {
            const uploads: { documento?: string; poder?: string } = {};

            if (member.documento instanceof File) {
                uploads.documento = await this.uploadStructureMemberDocument(
                    member.documento,
                    userId,
                    index,
                    member.nombre_completo,
                    "documento"
                );
            } else if (typeof member.documento === 'string') {
                uploads.documento = member.documento;
            }

            if (member.poder instanceof File) {
                uploads.poder = await this.uploadStructureMemberDocument(
                    member.poder,
                    userId,
                    index,
                    member.nombre_completo,
                    "poder"
                );
            } else if (typeof member.poder === 'string') {
                uploads.poder = member.poder;
            }

            const { error, data } = await this.supabase.from("CompanyStructure").insert({
                company_id: companyId,
                nombre_completo: member.nombre_completo,
                porcentaje: member.porcentaje,
                rol_consejo: member.rol_consejo,
                propietario: member.propietario,
                apoderado: member.apoderado,
                rol: member.rol,
                proveedor_recursos: member.proveedor_recursos,
                documento: uploads.documento,
                poder: uploads.poder,
            });
            console.log("Inserted structure member:", data);
            if (error) {
                console.error("CompanyStructure insert error", error);
                throw new Error(`Error registering structure member: ${member.nombre_completo}`);
            }
        }));
    }

    private async uploadStructureMemberDocument(
        file: File, 
        userId: number, 
        index: number, 
        memberName: string, 
        docType: "documento" | "poder"
    ): Promise<string> {
        const filePath = `private/${userId}/${Date.now()}_${index}_estructura_societaria_${docType}_${memberName}`;
        const { error: uploadError } = await this.supabase.storage
            .from("documentos")
            .upload(filePath, file, {
                contentType: file.type,
            });

        if (uploadError) {
            throw new Error(`Error uploading ${docType} for ${memberName}`);
        }
        return filePath;
    }

    private async sendNotificationEmail(to: string, subject: string, body: string, html?: string): Promise<void> {
        if (this.emailService) {
            await this.emailService.sendEmail(to, subject, body, html);
        }
    }
}