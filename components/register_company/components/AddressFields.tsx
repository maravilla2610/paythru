"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TextField, FileField, CountrySelectField } from "./FormFields";
import { AddressType, FormData } from "../../../lib/types/register-types";
import { countries } from "@/lib/domain/entities/countries";

interface AddressFieldsProps {
    addressType: AddressType;
    formData: FormData;
    errors: Record<string, string>;
    onAddressChange: (addressType: AddressType, field: string, value: string) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    title: string;
    fileFieldName: string;
    fileFieldLabel: string;
}

export function AddressFields({
    addressType,
    formData,
    errors,
    onAddressChange,
    onFileChange,
    title,
    fileFieldName,
    fileFieldLabel,
}: AddressFieldsProps) {
    const address = formData[addressType];
    const getError = (field: string) => errors[`${addressType}.${field}`] || errors[field];

    return (
        <>
            <h3 className="text-lg font-semibold">{title}</h3>
            <div className="space-y-2">
                <Label htmlFor={`${addressType}_direccion`}>Calle y Número</Label>
                <Input
                    id={`${addressType}_direccion`}
                    name={`${addressType}_direccion`}
                    value={address?.direccion || ""}
                    onChange={(e) => onAddressChange(addressType, "direccion", e.target.value)}
                    className={getError("direccion") ? "border-red-500" : ""}
                />
                {getError("direccion") && (
                    <p className="text-xs text-red-500">{getError("direccion")}</p>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                    id={`${addressType}_colonia`}
                    label="Colonia"
                    value={address?.colonia || ""}
                    onChange={(e) => onAddressChange(addressType, "colonia", e.target.value)}
                    error={getError("colonia")}
                />
                <TextField
                    id={`${addressType}_codigo_postal`}
                    label="Código Postal"
                    value={address?.codigo_postal || ""}
                    onChange={(e) => onAddressChange(addressType, "codigo_postal", e.target.value)}
                    error={getError("codigo_postal")}
                />
                <TextField
                    id={`${addressType}_ciudad`}
                    label="Ciudad"
                    value={address?.ciudad || ""}
                    onChange={(e) => onAddressChange(addressType, "ciudad", e.target.value)}
                    error={getError("ciudad")}
                />
                <TextField
                    id={`${addressType}_estado`}
                    label="Estado"
                    value={address?.estado || ""}
                    onChange={(e) => onAddressChange(addressType, "estado", e.target.value)}
                    error={getError("estado")}
                />
                <CountrySelectField
                    id={`${addressType}_pais`}
                    label="País"
                    value={address?.pais || ""}
                    onValueChange={(value) => onAddressChange(addressType, "pais", value)}
                    error={getError("pais")}
                    countries={countries}
                />
                <FileField
                    id={fileFieldName}
                    label={fileFieldLabel}
                    onChange={onFileChange}
                    error={errors[fileFieldName]}
                    fileName={(formData[fileFieldName as keyof FormData] as File)?.name}
                />
            </div>
        </>
    );
}
