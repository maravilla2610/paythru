"use client";

import React, { useMemo } from "react";
import { Building2, MapPin, FileText, Wallet, Users } from "lucide-react";
import ToolbarExpandable from "@/components/ui/toolbar-expandable";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/domain/entities/user";
import { useRegistrationForm } from "../../lib/hooks/useRegistrationForm";
import { TypeStep } from "./steps/TypeStep";
import { GeneralStep } from "./steps/GeneralStep";
import { AddressStep } from "./steps/AddressStep";
import { RepresentativeStep } from "./steps/RepresentativeStep";
import { CompanyStructureStep } from "./steps/CompanyStructure";
import { FinancialStep } from "./steps/FinancialStep";
import {
    COMPANY_GENERAL_FIELDS,
    PERSON_GENERAL_FIELDS,
    REPRESENTATIVE_FIELDS,
} from "./constants";

interface RegistrationFormProps {
    user: User | null;
    setShowRegistration: (show: boolean) => void;
    onSuccess?: () => void;
}

export default function RegistrationForm({
    user,
    setShowRegistration,
    onSuccess,
}: RegistrationFormProps) {
    const {
        formData,
        errors,
        isLoading,
        sameAddress,
        activeStep,
        setActiveStep,
        handleChange,
        handleSelectChange,
        handleDocumentTypeChange,
        handleFileChange,
        handleAddressChange,
        handleFieldUpdate,
        handleNext,
        handleBack,
        handleSubmit,
        handleSameAddressChange,
    } = useRegistrationForm({
        userId: user?.id,
        onSuccess,
        onClose: () => setShowRegistration(false),
    });

    const isMoral = formData.moral;

    const steps = useMemo(() => {
        const baseSteps = [
            {
                id: "type",
                title: "Tipo de cuenta",
                description: "Seleccione el tipo de cuenta",
                icon: FileText,
                content: (
                    <TypeStep
                        formData={formData}
                        errors={errors}
                        onSelectChange={handleSelectChange}
                        onNext={() => handleNext("general", ["moral", "pais"])}
                    />
                ),
            },
            {
                id: "general",
                title: "Información General",
                description: `Datos básicos ${isMoral ? "de la empresa" : "de la persona"}`,
                icon: Building2,
                content: (
                    <GeneralStep
                        formData={formData}
                        errors={errors}
                        onChange={handleChange}
                        onFileChange={handleFileChange}
                        onDocumentTypeChange={handleDocumentTypeChange}
                        onAddressChange={handleAddressChange}
                        onFieldUpdate={handleFieldUpdate}
                        onBack={() => handleBack("type")}
                        onNext={() =>
                            handleNext(
                                "address",
                                isMoral
                                    ? [...COMPANY_GENERAL_FIELDS]
                                    : [...PERSON_GENERAL_FIELDS]
                            )
                        }
                    />
                ),
            },
            {
                id: "address",
                title: "Dirección",
                description: `Dirección fiscal ${isMoral ? "de la empresa" : "de la persona"}`,
                icon: MapPin,
                content: (
                    <AddressStep
                        formData={formData}
                        errors={errors}
                        sameAddress={sameAddress}
                        onAddressChange={handleAddressChange}
                        onFileChange={handleFileChange}
                        onSameAddressChange={handleSameAddressChange}
                        onBack={() => handleBack("general")}
                        onNext={() =>
                            handleNext(
                                isMoral ? "representative" : "financial",
                                isMoral
                                    ? [
                                        "direccion_fiscal",
                                        "comprobante_domicilio_fiscal",
                                        "direccion_operativa",
                                        ...(sameAddress ? [] : ["comprobante_domicilio_operativo"]),
                                    ]
                                    : ["direccion_fiscal", "comprobante_domicilio_fiscal"]
                            )
                        }
                    />
                ),
            },
        ];

        if (isMoral) {
            baseSteps.push({
                id: "representative",
                title: "Representante Legal",
                description: "Datos del representante legal",
                icon: FileText,
                content: (
                    <RepresentativeStep
                        formData={formData}
                        errors={errors}
                        onChange={handleChange}
                        onFileChange={handleFileChange}
                        onDocumentTypeChange={handleDocumentTypeChange}
                        onFieldUpdate={handleFieldUpdate}
                        onBack={() => handleBack("address")}
                        onNext={() =>
                            handleNext("structure", [...REPRESENTATIVE_FIELDS])
                        }
                    />
                ),
            });

            baseSteps.push({
                id: "structure",
                title: "Estructura Societaria",
                description: "Accionistas y participaciones",
                icon: Users,
                content: (
                    <CompanyStructureStep
                        formData={formData}
                        errors={errors}
                        onFieldUpdate={handleFieldUpdate}
                        onFileChange={handleFileChange}
                        onBack={() => handleBack("representative")}
                        onNext={() => handleNext("financial", [])}
                    />
                ),
            });
        }

        baseSteps.push({
            id: "financial",
            title: "Financiero",
            description: "Información financiera y operativa",
            icon: Wallet,
            content: (
                <FinancialStep
                    formData={formData}
                    errors={errors}
                    isLoading={isLoading}
                    onChange={handleChange}
                    onSelectChange={handleSelectChange}
                    onBack={() => handleBack(isMoral ? "structure" : "address")}
                    onSubmit={handleSubmit}
                />
            ),
        });

        return baseSteps;
    }, [
        formData,
        errors,
        isLoading,
        sameAddress,
        isMoral,
        handleChange,
        handleSelectChange,
        handleDocumentTypeChange,
        handleFileChange,
        handleAddressChange,
        handleFieldUpdate,
        handleSameAddressChange,
        handleNext,
        handleBack,
        handleSubmit,
    ]);

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight">
                    Registro de Compañía
                </h1>
                <p className="text-muted-foreground mt-2">
                    Complete el formulario para registrar una nueva entidad.
                </p>
            </div>
            <ToolbarExpandable
                steps={steps}
                badgeText="REGISTRO"
                activeStep={activeStep}
                onActiveStepChange={(step) => {
                    if (step) setActiveStep(step);
                }}
                expanded={true}
            />
            <div className="mt-5 z-10 text-center">
                <Button onClick={() => setShowRegistration(false)}>
                    Cancelar
                </Button>
            </div>
        </div>
    );
}
