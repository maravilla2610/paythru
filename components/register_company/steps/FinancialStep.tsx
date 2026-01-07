"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FINANCIAL_INSTITUTIONS, FinancialInstitutionCode } from "@/lib/domain/entities/financial-institutions";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TextField, SelectField } from "../components/FormFields";
import { StepNavigation } from "../components/StepNavigation";
import { FormData } from "../../../lib/types/register-types";
import {
    ORIGEN_RECURSOS_OPTIONS,
    DESTINO_RECURSOS_OPTIONS,
    CRYPTO_CURRENCIES,
    OPERACIONES_OPTIONS,
} from "../constants";

interface FinancialStepProps {
    formData: FormData;
    errors: Record<string, string>;
    isLoading: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectChange: (name: string, value: string) => void;
    onBack: () => void;
    onSubmit: () => void;
}

export function FinancialStep({
    formData,
    errors,
    isLoading,
    onChange,
    onSelectChange,
    onBack,
    onSubmit,
}: FinancialStepProps) {
    const isMoral = formData.moral;

    const handleClabeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e);

        const digits = e.target.value.replace(/\D/g, "");

        if (digits.length >= 3) {
            const bankCode = digits.slice(0, 3);
            const institution = FINANCIAL_INSTITUTIONS[bankCode as FinancialInstitutionCode];
            onSelectChange("nombre_institucion_clabe", institution ? institution : "");
        } else if (!digits) {
            onSelectChange("nombre_institucion_clabe", "");
        }
    };

    return (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                    id="clabe"
                    label="CLABE"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.clabe || ""}
                    onChange={handleClabeChange}
                    error={errors.clabe}
                    required
                />
                <TextField
                    id="nombre_institucion_clabe"
                    label="Nombre Institucion Financiera"
                    value={formData.nombre_institucion_clabe || ""}
                    onChange={onChange}
                    error={errors.nombre_institucion_clabe}
                    required
                />
                <TextField
                    id="wallet"
                    label="Wallet Address"
                    value={formData.wallet || ""}
                    onChange={onChange}
                />
                <SelectField
                    id="origen_recursos"
                    label="Origen de Recursos"
                    value={formData.origen_recursos || ""}
                    onValueChange={(value) => onSelectChange("origen_recursos", value)}
                    error={errors.origen_recursos}
                    placeholder="Origen"
                    options={[...ORIGEN_RECURSOS_OPTIONS]}
                    required
                />
                <SelectField
                    id="destino_recursos"
                    label="Destino de Recursos"
                    value={formData.destino_recursos || ""}
                    onValueChange={(value) => onSelectChange("destino_recursos", value)}
                    error={errors.destino_recursos}
                    placeholder="Destino"
                    options={[...DESTINO_RECURSOS_OPTIONS]}
                    required
                />
                <TextField
                    id="volumen_transaccional_mxn"
                    label="Volumen Transaccional MXN"
                    type="number"
                    value={formData.volumen_transaccional_mxn?.toString() || ""}
                    onChange={onChange}
                    error={errors.volumen_transaccional_mxn}
                    required
                />
                <CryptoVolumeField
                    formData={formData}
                    errors={errors}
                    onChange={onChange}
                    onSelectChange={onSelectChange}
                />
                <SelectField
                    id="operaciones_approximadas"
                    label="Operaciones Approximadas Mensuales"
                    value={formData.operaciones_approximadas || ""}
                    onValueChange={(value) => onSelectChange("operaciones_approximadas", value)}
                    error={errors.operaciones_approximadas}
                    placeholder="Seleccionar..."
                    options={[...OPERACIONES_OPTIONS]}
                />
                {!isMoral && (
                    <TextField
                        id="giro_mercantil"
                        label="Giro Mercantil"
                        value={formData.giro_mercantil || ""}
                        onChange={onChange}
                        error={errors.giro_mercantil}
                        required
                    />
                )}
            </div>
            <StepNavigation
                onBack={onBack}
                onNext={onSubmit}
                isSubmit
                isLoading={isLoading}
            />
        </div>
    );
}

interface CryptoVolumeFieldProps {
    formData: FormData;
    errors: Record<string, string>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectChange: (name: string, value: string) => void;
}

function CryptoVolumeField({
    formData,
    errors,
    onChange,
    onSelectChange,
}: CryptoVolumeFieldProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor="volumen_transaccional_crypto">
                Volumen Transaccional Crypto
            </Label>
            <div className="flex gap-2">
                <Select
                    value={formData.moneda_crypto || ""}
                    onValueChange={(value) => onSelectChange("moneda_crypto", value)}
                >
                    <SelectTrigger
                        className={`w-[120px] ${errors.moneda_crypto ? "border-red-500" : ""}`}
                    >
                        <SelectValue placeholder="Moneda" />
                    </SelectTrigger>
                    <SelectContent>
                        {CRYPTO_CURRENCIES.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                                {currency.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    id="volumen_transaccional_crypto"
                    name="volumen_transaccional_crypto"
                    type="number"
                    value={formData.volumen_transaccional_crypto || ""}
                    onChange={onChange}
                    className={`flex-1 ${errors.volumen_transaccional_crypto ? "border-red-500" : ""}`}
                />
            </div>
            {(errors.volumen_transaccional_crypto || errors.moneda_crypto) && (
                <p className="text-xs text-red-500">
                    {errors.moneda_crypto || errors.volumen_transaccional_crypto}
                </p>
            )}
        </div>
    );
}
