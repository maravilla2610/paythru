"use client";

import React, { useMemo } from "react";
import { Building2, MapPin } from "lucide-react";
import ToolbarExpandable from "@/components/ui/toolbar-expandable";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/domain/entities/user";
import { useRegistrationForm } from "../../lib/hooks/useRegistrationForm";
import { GeneralStep } from "./steps/GeneralStep";
import { AddressStep } from "./steps/AddressStep";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import {
    PERSON_GENERAL_FIELDS,
} from "./constants";

const loadingStates = [
    { text: "Validating user information" },
    { text: "Verifying documents" },
    { text: "Finalizing registration" },
];

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
        activeStep,
        setActiveStep,
        handleChange,
        handleFileChange,
        handleAddressChange,
        handleNext,
        handleBack,
        handleSubmit,
    } = useRegistrationForm({
        user,
        onSuccess,
        onClose: () => setShowRegistration(false),
    });

    const steps = useMemo(() => {
        const baseSteps = [
            {
                id: "general",
                title: "Información General",
                description: "Datos básicos de la persona",
                icon: Building2,
                content: (
                    <GeneralStep
                        formData={formData}
                        errors={errors}
                        onChange={handleChange}
                        onFileChange={handleFileChange}
                        onNext={() =>
                            handleNext(
                                "address",
                                [...PERSON_GENERAL_FIELDS]
                            )
                        }
                    />
                ),
            },
            {
                id: "address",
                title: "Dirección",
                description: "Dirección fiscal de la persona",
                icon: MapPin,
                content: (
                    <AddressStep
                        formData={formData}
                        errors={errors}
                        onAddressChange={handleAddressChange}
                        onFileChange={handleFileChange}
                        onBack={() => handleBack("general")}
                        onNext={handleSubmit}
                    />
                ),
            },
        ];

        return baseSteps;
    }, [
        formData,
        errors,
        handleChange,
        handleFileChange,
        handleAddressChange,
        handleNext,
        handleBack,
        handleSubmit,
    ]);

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight">
                    Registro
                </h1>
                <p className="text-muted-foreground mt-2">
                    Complete el formulario para registrarse.
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
            <MultiStepLoader loadingStates={loadingStates} loading={isLoading} duration={2000} />
        </div>
    );
}
