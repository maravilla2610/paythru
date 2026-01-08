"use client";

import React from "react";
import { TextField, DateField, FileField } from "../components/FormFields";
import { FormData, DocumentType, AddressType } from "../../../lib/types/register-types";
import { StepNavigation } from "../components/StepNavigation";

interface GeneralStepProps {
    formData: FormData;
    errors: Record<string, string>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onNext: () => void;
}

export function GeneralStep({
    formData,
    errors,
    onChange,
    onFileChange,
    onNext,
}: GeneralStepProps) {
    return (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PersonGeneralFields
                    formData={formData}
                    errors={errors}
                    onChange={onChange}
                    onFileChange={onFileChange}
                />
            </div>
            <StepNavigation
                onNext={onNext}
                showBack={false}
            />
        </div>
    );
}

interface PersonGeneralFieldsProps {
    formData: FormData;
    errors: Record<string, string>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function PersonGeneralFields({
    formData,
    errors,
    onChange,
    onFileChange,
}: PersonGeneralFieldsProps) {
    return (
        <>
            <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                <h4 className="font-bold mb-3 text-sm tracking-wide">✏️ Información Personal</h4>
            </div>

            <TextField
                id="nombre_completo"
                label="Nombre Completo"
                value={formData.nombre_completo || ""}
                onChange={onChange}
                error={errors.nombre_completo}
                required
            />
            <DateField
                id="fecha_nacimiento"
                label="Fecha de Nacimiento"
                value={formData.fecha_nacimiento}
                onChange={onChange}
                error={errors.fecha_nacimiento}
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
             <TextField
                id="pais_nacimiento"
                label="País de Nacimiento"
                value={formData.pais_nacimiento || ""}
                onChange={onChange}
                error={errors.pais_nacimiento}
                required
            />
             <TextField
                id="nombre_completo_ordenante"
                label="Nombre Completo Ordenante"
                value={formData.nombre_completo_ordenante || ""}
                onChange={onChange}
                error={errors.nombre_completo_ordenante}
                required
            />

            <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                <h4 className="font-bold mb-3 text-sm tracking-wide">🪪 Documento de Identidad (INE)</h4>
            </div>
            <FileField
                id="ine"
                label="Subir INE"
                onChange={onFileChange}
                error={errors.ine}
                fileName={(formData.ine as File)?.name}
                required
            />
        </>
    );
}
