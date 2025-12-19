"use client";

import React, { useState } from "react";
import { TextField, DateField, FileField, SelectField } from "../components/FormFields";
import { StepNavigation } from "../components/StepNavigation";
import { FormData, DocumentType, AddressType } from "../../../lib/types/register-types";
import { DOCUMENT_TYPES } from "../constants";
import { extractCsfData, extractDocumentData } from "@/lib/actions/ocr";
import { DocumentImp, CompanyDocumentImp } from "@/lib/types/ocr-types";
import { Address } from "@/lib/domain/entities/address";
import { BrainCircuit } from "lucide-react";

interface GeneralStepProps {
    formData: FormData;
    errors: Record<string, string>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDocumentTypeChange: (value: DocumentType) => void;
    onAddressChange?: (addressType: AddressType, field: string, value: string) => void;
    onFieldUpdate?: (field: string, value: string | number | Date | undefined) => void;
    onBack: () => void;
    onNext: () => void;
}

export function GeneralStep({
    formData,
    errors,
    onChange,
    onFileChange,
    onDocumentTypeChange,
    onAddressChange,
    onFieldUpdate,
    onBack,
    onNext,
}: GeneralStepProps) {
    const isMoral = formData.moral;
    const [isProcessing, setIsProcessing] = useState(false);
    const [ocrError, setOcrError] = useState<string | null>(null);

    const applyPersonData = (data: DocumentImp) => {
        if (!onFieldUpdate) return;

        if (data.nombre_representante_legal) onFieldUpdate("nombre_representante_legal", data.nombre_representante_legal);
        if (data.apellido_representante_legal) onFieldUpdate("apellido_representante_legal", data.apellido_representante_legal);
        if (data.fecha_de_nacimiento) onFieldUpdate("fecha_de_nacimiento", new Date(data.fecha_de_nacimiento));
        if (data.rfc) onFieldUpdate("rfc", data.rfc);
        if (data.curp) onFieldUpdate("curp", data.curp);
        if (data.numero_documento) onFieldUpdate("numero_documento", data.numero_documento);
        if (data.tipo_documento) onDocumentTypeChange(data.tipo_documento);
        if (data.nacionalidad) onFieldUpdate("nacionalidad", data.nacionalidad);

        if (data.direccion_fiscal && onAddressChange) {
            applyAddressData("direccion_fiscal", data.direccion_fiscal);
        }
    };

    const applyCompanyData = (data: CompanyDocumentImp) => {
        if (!onFieldUpdate) return;

        if (data.nombre_compañia) onFieldUpdate("nombre_compañia", data.nombre_compañia);
        if (data.nombre_legal_compañia) onFieldUpdate("nombre_legal_compañia", data.nombre_legal_compañia);
        if (data.fecha_de_constitucion) onFieldUpdate("fecha_de_constitucion", new Date(data.fecha_de_constitucion));
        if (data.rfc_entidad_legal) onFieldUpdate("rfc_entidad_legal", data.rfc_entidad_legal || "");
        if (data.giro_mercantil) onFieldUpdate("giro_mercantil", data.giro_mercantil);

        if (data.direccion_fiscal && onAddressChange) {
            applyAddressData("direccion_fiscal", data.direccion_fiscal);
        }
        if (data.direccion_operativa && onAddressChange) {
            applyAddressData("direccion_operativa", data.direccion_operativa);
        }
    };

    const applyAddressData = (addressType: AddressType, data: Address) => {
        if (!onAddressChange) return;

        if (data.direccion) onAddressChange(addressType, "direccion", data.direccion);
        if (data.colonia) onAddressChange(addressType, "colonia", data.colonia);
        if (data.ciudad) onAddressChange(addressType, "ciudad", data.ciudad);
        if (data.estado) onAddressChange(addressType, "estado", data.estado);
        if (data.pais) onAddressChange(addressType, "pais", data.pais);
        if (data.codigo_postal) onAddressChange(addressType, "codigo_postal", data.codigo_postal);
    };

    const handleFileChangeWithOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;

        onFileChange(e);

        if (!files || files.length === 0) return;

        const file = files[0];

        if (name === "csf") {
            setIsProcessing(true);
            setOcrError(null);

            try {
                const result = await extractCsfData(file, isMoral || false);

                if (result.success && result.data) {
                    if (isMoral) {
                        applyCompanyData(result.data);
                    } else {
                        applyPersonData(result.data);
                    }
                } else if (result.error) {
                    setOcrError(result.error);
                }
            } catch (error) {
                console.error("OCR processing error:", error);
                setOcrError("Error al procesar el documento. Por favor, ingrese los datos manualmente.");
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return (
        <div className="grid gap-4 py-4">
            {ocrError && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm">
                    La extracción automática de datos falló. Por favor, ingrese los datos manualmente.
                </div>
            )}

            {isProcessing && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md text-sm flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Extrayendo datos del documento...
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isMoral ? (
                    <CompanyGeneralFields
                        formData={formData}
                        errors={errors}
                        onChange={onChange}
                        onFileChange={handleFileChangeWithOCR}
                    />
                ) : (
                    <PersonGeneralFields
                        formData={formData}
                        errors={errors}
                        onChange={onChange}
                        onFileChange={handleFileChangeWithOCR}
                        onDocumentTypeChange={onDocumentTypeChange}
                    />
                )}
            </div>
            <StepNavigation onBack={onBack} onNext={onNext} />
        </div>
    );
}

interface CompanyGeneralFieldsProps {
    formData: FormData;
    errors: Record<string, string>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function CompanyGeneralFields({
    formData,
    errors,
    onChange,
    onFileChange,
}: CompanyGeneralFieldsProps) {
    return (
        <>
            <div className="col-span-1 md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
                <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 className="font-semibold text-blue-900 mb-1">Autocompletado Inteligente</h3>
                        <p className="text-sm text-blue-800">
                            Sube tu Constancia de Situación Fiscal y los datos se llenarán automáticamente. Puedes editar cualquier campo después.
                        </p>
                    </div>
                </div>
            </div>

            <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                <h4 className="font-bold mb-3 text-sm tracking-wide">📄 Sube la constancia de situacion fiscal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FileField
                        id="csf"
                        label="Constancia de Situación Fiscal"
                        onChange={onFileChange}
                        error={errors.csf}
                        fileName={(formData.csf as File)?.name}
                        required
                    />

                </div>
            </div>

            <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                <h4 className="font-bold mb-3 text-sm tracking-wide">🪪 Sube los documentos adicionales </h4>
            </div>
            <FileField
                id="acta_constitutiva"
                label="Acta Constitutiva"
                onChange={onFileChange}
                error={errors.acta_constitutiva}
                fileName={(formData.acta_constitutiva as File)?.name}
                required
            />
            <FileField
                id="acta_asamblea"
                label="Acta de Asamblea"
                onChange={onFileChange}
                error={errors.acta_asamblea}
                fileName={(formData.acta_asamblea as File)?.name}
            />

            <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                <h4 className="font-bold mb-3 text-sm tracking-wide">✏️ Información de la Empresa</h4>
            </div>

            <TextField
                id="nombre_compañia"
                label="Nombre de la Compañía"
                value={formData.nombre_compañia || ""}
                onChange={onChange}
                error={errors.nombre_compañia}
                required
            />
            <TextField
                id="nombre_legal_compañia"
                label="Nombre Legal"
                value={formData.nombre_legal_compañia || ""}
                onChange={onChange}
                error={errors.nombre_legal_compañia}
                required
            />
            <DateField
                id="fecha_de_constitucion"
                label="Fecha de Constitución"
                value={formData.fecha_de_constitucion}
                onChange={onChange}
                error={errors.fecha_de_constitucion}
                required
            />
            {formData.pais === "MX" && (
                <TextField
                    id="rfc_entidad_legal"
                    label="RFC"
                    value={formData.rfc_entidad_legal || ""}
                    onChange={onChange}
                    error={errors.rfc_entidad_legal}
                    required
                />
            )}
            <TextField
                id="correo"
                label="Correo Electrónico"
                type="email"
                value={formData.correo || ""}
                onChange={onChange}
                error={errors.correo}
            />
            <TextField
                id="giro_mercantil"
                label="Giro Mercantil"
                value={formData.giro_mercantil || ""}
                onChange={onChange}
                error={errors.giro_mercantil}
                required
            />
            <TextField
                id="e_firma"
                label="E-Firma (Opcional)"
                value={formData.e_firma || ""}
                onChange={onChange}
                error={errors.e_firma}
            />
            <TextField
                id="no_sello"
                label="Numero de Sello SAT (Opcional)"
                value={formData.no_sello || ""}
                onChange={onChange}
                error={errors.no_sello}
            />
        </>
    );
}

interface PersonGeneralFieldsProps {
    formData: FormData;
    errors: Record<string, string>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDocumentTypeChange: (value: DocumentType) => void;
}

function PersonGeneralFields({
    formData,
    errors,
    onChange,
    onFileChange,
    onDocumentTypeChange,
}: PersonGeneralFieldsProps) {
    return (
        <>
            <div className="col-span-1 md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
                <div className="flex items-start gap-3">
                    <BrainCircuit className="text-blue-600 w-10 h-10" />
                    <div>
                        <h3 className="font-semibold text-blue-900 mb-1">Autocompletado Inteligente</h3>
                        <p className="text-sm text-blue-800">
                            Sube tu Constancia de Situación Fiscal y los datos se llenarán automáticamente. Puedes editar cualquier campo después.
                        </p>
                    </div>
                </div>
            </div>

            <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                <h4 className="font-bold mb-3 text-sm tracking-wide">📄 Sube tu constancia</h4>
            </div>

            <FileField
                id="csf"
                label="Constancia de Situación Fiscal"
                onChange={onFileChange}
                error={errors.csf}
                fileName={(formData.csf as File)?.name}
                required
            />
            <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                <h4 className="font-bold mb-3 text-sm tracking-wide">🪪 Sube tu documento de identidad</h4>
            </div>
            <SelectField
                id="tipo_documento"
                label="Tipo de Documento"
                value={formData.tipo_documento || ""}
                onValueChange={(value) => onDocumentTypeChange(value as DocumentType)}
                error={errors.tipo_documento}
                options={[...DOCUMENT_TYPES]}
                required
            />
            <FileField
                id="documento"
                label="Subir Documento"
                onChange={onFileChange}
                error={errors.documento}
                fileName={(formData.documento as File)?.name}
                required
            />
            <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                <h4 className="font-bold mb-3 text-sm tracking-wide">✏️ Información Personal</h4>
            </div>

            <TextField
                id="nombre_representante_legal"
                label="Nombre"
                value={formData.nombre_representante_legal || ""}
                onChange={onChange}
                error={errors.nombre_representante_legal}
                required
            />
            <TextField
                id="apellido_representante_legal"
                label="Apellido"
                value={formData.apellido_representante_legal || ""}
                onChange={onChange}
                error={errors.apellido_representante_legal}
                required
            />
            <DateField
                id="fecha_de_nacimiento"
                label="Fecha de Nacimiento"
                value={formData.fecha_de_nacimiento}
                onChange={onChange}
                error={errors.fecha_de_nacimiento}
                required
            />
            <TextField
                id="curp"
                label="CURP"
                value={formData.curp || ""}
                onChange={onChange}
                error={errors.curp}
                required
            />

            <TextField
                id="rfc"
                label="RFC"
                value={formData.rfc || ""}
                onChange={onChange}
                error={errors.rfc}
                required
            />
            <TextField
                id="nacionalidad"
                label="Nacionalidad"
                value={formData.nacionalidad || ""}
                onChange={onChange}
                error={errors.nacionalidad}
                required
            />

            <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                <h4 className="font-bold mb-3 text-sm tracking-wide">📞 Información de Contacto</h4>
            </div>

            <TextField
                id="correo"
                label="Correo Electrónico"
                type="email"
                value={formData.correo || ""}
                onChange={onChange}
                error={errors.correo}
            />
            <TextField
                id="telefono"
                label="Teléfono"
                type="tel"
                value={formData.telefono || ""}
                onChange={onChange}
                error={errors.telefono}
                required
            />

            <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                <h4 className="font-bold mb-3 text-sm  tracking-wide">📋 Información Fiscal (Opcional)</h4>
            </div>

            <TextField
                id="e_firma"
                label="E-Firma (Opcional)"
                value={formData.e_firma || ""}
                onChange={onChange}
                error={errors.e_firma}
            />
            <TextField
                id="no_sello"
                label="Numero de Sello SAT (Opcional)"
                value={formData.no_sello || ""}
                onChange={onChange}
                error={errors.no_sello}
            />
        </>
    );
}
