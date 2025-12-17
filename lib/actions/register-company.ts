'use server'

import { CompanyFormData } from "@/lib/domain/entities/company";
import { PersonFormData } from "@/lib/domain/entities/person";
import { CompanyStructure } from "@/lib/domain/entities/company-structure";
import { createClient } from "@/lib/providers/supabase/server";

export async function registerCompany(formData: CompanyFormData | PersonFormData) {
    const supabase = await createClient();

    const processedData: Record<string, unknown> = { ...formData };

    for (const [key, value] of Object.entries(formData)) {
        if (value instanceof File) {
            const filePath = `private/${formData.user_id}/${Date.now()}_${key}`;
            const { error: uploadError } = await supabase.storage
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

    delete processedData["direccion_fiscal"];
    delete processedData["direccion_operativa"];
    delete processedData["pais"];

    const structureMembers = Array.isArray((formData as CompanyFormData).estructura_societaria)
        ? ((formData as CompanyFormData).estructura_societaria as CompanyStructure[])
        : [];
    delete processedData["estructura_societaria"];

    const { data: companyData, error: companyError } = await supabase
        .from("Company")
        .insert(processedData)
        .select()
        .single();

    if (companyError || !companyData) {
        console.error("Company insert error", companyError);
        throw new Error(companyError?.message || "Error registering company");
    }

    if (structureMembers.length > 0) {
        const uploadedMemberDocs = await Promise.all(structureMembers.map(async (member, index) => {
            const uploads: { documento?: string; poder?: string } = {};

            if (member.documento instanceof File) {
                const filePath = `private/${formData.user_id}/${Date.now()}_${index}_estructura_societaria_documento_${member.nombre_completo}`;
                const { error: uploadError } = await supabase.storage
                    .from("documentos")
                    .upload(filePath, member.documento, {
                        contentType: member.documento.type,
                    });

                if (uploadError) {
                    throw new Error(`Error uploading documento for ${member.nombre_completo}`);
                }
                console.log("Uploaded documento for", member.nombre_completo, "to", filePath);
                uploads.documento = filePath;
            }

            if (member.poder instanceof File) {
                const filePath = `private/${formData.user_id}/${Date.now()}_${index}_estructura_societaria_poder_${member.nombre_completo}`;
                const { error: uploadError } = await supabase.storage
                    .from("documentos")
                    .upload(filePath, member.poder, {
                        contentType: member.poder.type,
                    });

                if (uploadError) {
                    throw new Error(`Error uploading poder for ${member.nombre_completo}`);
                }   
                console.log("Uploaded poder for", member.nombre_completo, "to", filePath);
                uploads.poder = filePath;
            }

            return uploads;
        }));

        const rows = structureMembers.map((member, index) => ({
            company_id: companyData.id,
            nombre_completo: member.nombre_completo,
            porcentaje: member.porcentaje,
            rol_consejo: member.rol_consejo,
            propietario: member.propietario,
            apoderado: member.apoderado,
            rol: member.rol ?? null,
            proveedor_recursos: member.proveedor_recursos ?? false,
            documento: uploadedMemberDocs[index].documento ?? (typeof member.documento === "string" ? member.documento : null),
            poder: uploadedMemberDocs[index].poder ?? (typeof member.poder === "string" ? member.poder : null),
        }));

        const { error: structureError } = await supabase
            .from("CompanyStructure")
            .insert(rows);

        if (structureError) {
            console.error("CompanyStructure insert error", structureError, { rows });
            throw new Error(structureError.message || "Error registering company structure");
        }
    }

    return companyData;
}