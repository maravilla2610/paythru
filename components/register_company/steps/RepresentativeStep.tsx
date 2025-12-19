"use client";

import React, { useState } from "react";
import { TextField, DateField, FileField, SelectField } from "../components/FormFields";
import { StepNavigation } from "../components/StepNavigation";
import { FormData, DocumentType, AddressType } from "../../../lib/types/register-types";
import { DOCUMENT_TYPES } from "../constants";
import { extractDocumentData } from "@/lib/actions/ocr";
import { Address } from "@/lib/domain/entities/address";
import { DocumentImp } from "@/lib/types/ocr-types";
interface RepresentativeStepProps {
    formData: FormData;
    errors: Record<string, string>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDocumentTypeChange: (value: DocumentType) => void;
    onFieldUpdate?: (field: string, value: string | number | Date | undefined) => void;
    onAddressChange?: (addressType: AddressType, field: string, value: string) => void;
    onBack: () => void;
    onNext: () => void;
}

export function RepresentativeStep({
    formData,
    errors,
    onChange,
    onFileChange,
    onDocumentTypeChange,
    onFieldUpdate,
    onAddressChange,
    onBack,
    onNext,
}: RepresentativeStepProps) {
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

        if (name === "documento") {
            setIsProcessing(true);
            setOcrError(null);

            try {
                const result = await extractDocumentData(file);

                if (result.success && result.data) {
                    applyPersonData(result.data);
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
                    {ocrError}
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
                <div className="col-span-1 md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-1">Autocompletado Inteligente</h3>
                            <p className="text-sm text-blue-800">
                                Sube tu documento de identidad y los datos se llenarán automáticamente. Puedes editar cualquier campo después.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                    <h4 className="font-bold mb-3 text-sm tracking-wide">🪪 Sube el documento </h4>
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
                    label="Legal Document"
                    onChange={handleFileChangeWithOCR}
                    error={errors.documento}
                    fileName={(formData.documento as File)?.name}
                    required
                />
                <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                    <h4 className="font-bold mb-3 text-sm tracking-wide">🪪 Información del representante </h4>
                </div>
                <TextField
                    id="nombre_representante_legal"
                    label="Nombre(s)"
                    value={formData.nombre_representante_legal || ""}
                    onChange={onChange}
                    error={errors.nombre_representante_legal}
                    required
                />
                <TextField
                    id="apellido_representante_legal"
                    label="Apellidos"
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
                />
                <TextField
                    id="rfc"
                    label="RFC"
                    value={formData.rfc || ""}
                    onChange={onChange}
                    error={errors.rfc}
                />
                <TextField
                    id="nacionalidad"
                    label="Nacionalidad"
                    value={formData.nacionalidad || ""}
                    onChange={onChange}
                    error={errors.nacionalidad}
                />
            </div>
            <FileField
                id="poder"
                label="Poder Notarial"
                onChange={onFileChange}
                error={errors.poder}
                fileName={(formData.poder as File)?.name}
            />
            <StepNavigation onBack={onBack} onNext={onNext} />
        </div>
    );
}
