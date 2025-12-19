import { SupabaseClient } from "@supabase/supabase-js";
import { CompanyStructure } from "../domain/entities/company-structure";

export class RegisterCompanyService {
    private supabase: SupabaseClient;
    private structureMembers: CompanyStructure[];

    constructor(supabaseClient: SupabaseClient) {
        this.supabase = supabaseClient;
        this.structureMembers = [];
    }

    public async registerCompany(formData: Record<string, unknown>): Promise<void> {
        const processedData = await this.uploadCompanyDocuments(formData);
        const companyData = await this.persistCompanyData(processedData);
        await this.persistStructureMembers(companyData.id as number, companyData.user_id as number);
    }

    private async uploadCompanyDocuments (formData: Record<string, unknown>): Promise<Record<string, unknown>> {
        const processedData: Record<string, unknown> = { ...formData };

        for (const [key, value] of Object.entries(formData)) {
                if (value instanceof File) {
                    const filePath = `private/${formData.user_id}/${Date.now()}_${key}`;
                    const { error: uploadError } = await this.supabase.storage
                        .from("documentos")
                        .upload(filePath, value, {
                            contentType: value.type,
                        });
        
                    if (uploadError) {
                        throw new Error(`Error uploading ${key}`);
                    }
        
                    processedData[key] = filePath;
                }
            }
        return this.removeIrrelevantFields(processedData);
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
        if (this.structureMembers.length === 0) return;

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
            }

            if (member.poder instanceof File) {
                uploads.poder = await this.uploadStructureMemberDocument(
                    member.poder,
                    userId,
                    index,
                    member.nombre_completo,
                    "poder"
                );
            }

            const { error } = await this.supabase.from("CompanyStructure").insert({
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
}