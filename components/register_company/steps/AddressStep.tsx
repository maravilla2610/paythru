"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { AddressFields } from "../components/AddressFields";
import { StepNavigation } from "../components/StepNavigation";
import { FormData, AddressType } from "../../../lib/types/register-types";

interface AddressStepProps {
    formData: FormData;
    errors: Record<string, string>;
    sameAddress: boolean;
    onAddressChange: (addressType: AddressType, field: string, value: string) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSameAddressChange: (checked: boolean) => void;
    onBack: () => void;
    onNext: () => void;
}

export function AddressStep({
    formData,
    errors,
    sameAddress,
    onAddressChange,
    onFileChange,
    onSameAddressChange,
    onBack,
    onNext,
}: AddressStepProps) {
    const isMoral = formData.moral;

    return (
        <div className="grid gap-4 py-4">
            <AddressFields
                addressType="direccion_fiscal"
                formData={formData}
                errors={errors}
                onAddressChange={onAddressChange}
                onFileChange={onFileChange}
                title="Dirección Fiscal"
                fileFieldName="comprobante_domicilio_fiscal"
                fileFieldLabel="Comprobante de Domicilio Fiscal"
            />

            {isMoral && (
                <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold mb-4">Dirección Operativa</h3>
                    <div className="flex items-center space-x-2 mb-4">
                        <input
                            type="checkbox"
                            id="same_address"
                            checked={sameAddress}
                            onChange={(e) => onSameAddressChange(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="same_address" className="text-sm font-medium cursor-pointer">
                            La dirección operativa es la misma que la fiscal
                        </Label>
                    </div>

                    {!sameAddress && (
                        <>
                            <AddressFields
                                addressType="direccion_operativa"
                                formData={formData}
                                errors={errors}
                                onAddressChange={onAddressChange}
                                onFileChange={onFileChange}
                                title=""
                                fileFieldName="comprobante_domicilio_operativo"
                                fileFieldLabel="Comprobante de Domicilio Operativo (sube una imagen para autocompletar)"
                            />
                        </>
                    )}
                </div>
            )}

            <StepNavigation onBack={onBack} onNext={onNext} />
        </div>
    );
}
