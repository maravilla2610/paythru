"use client";

import React from "react";
import { AddressFields } from "../components/AddressFields";
import { StepNavigation } from "../components/StepNavigation";
import { FormData, AddressType } from "../../../lib/types/register-types";

interface AddressStepProps {
    formData: FormData;
    errors: Record<string, string>;
    sameAddress?: boolean;
    onAddressChange: (addressType: AddressType, field: string, value: string) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSameAddressChange?: (checked: boolean) => void;
    onBack: () => void;
    onNext: () => void;
}

export function AddressStep({
    formData,
    errors,
    onAddressChange,
    onFileChange,
    onBack,
    onNext,
}: AddressStepProps) {

    return (
        <div className="grid gap-4 py-4">
            <AddressFields
                addressType="domicilio_particular"
                formData={formData}
                errors={errors}
                onAddressChange={onAddressChange}
                onFileChange={onFileChange}
                title="Domicilio Particular"
            />

            <StepNavigation onBack={onBack} onNext={onNext} />
        </div>
    );
}
