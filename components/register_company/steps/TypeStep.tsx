"use client";

import React from "react";
import { SelectField, CountrySelectField } from "../components/FormFields";
import { StepNavigation } from "../components/StepNavigation";
import { FormData } from "../../../lib/types/register-types";
import { ACCOUNT_TYPES } from "../constants";
import { countries } from "@/lib/domain/entities/countries";

interface TypeStepProps {
    formData: FormData;
    errors: Record<string, string>;
    onSelectChange: (name: string, value: string | boolean) => void;
    onNext: () => void;
}

export function TypeStep({
    formData,
    errors,
    onSelectChange,
    onNext,
}: TypeStepProps) {
    return (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                    id="moral"
                    label="Tipo de Cuenta"
                    value={formData.moral ? "moral" : "fisica"}
                    onValueChange={(value) => onSelectChange("moral", value === "moral")}
                    error={errors.moral}
                    placeholder="Seleccione el tipo de cuenta"
                    options={[...ACCOUNT_TYPES]}
                />
                <CountrySelectField
                    id="pais"
                    label="Country"
                    value={formData.pais || ""}
                    onValueChange={(value) => onSelectChange("pais", value)}
                    error={errors.pais}
                    countries={countries}
                />
            </div>
            <StepNavigation showBack={false} onNext={onNext} />
        </div>
    );
}
