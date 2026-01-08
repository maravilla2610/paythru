"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface StepNavigationProps {
    onBack?: () => void;
    onNext?: () => void;
    showBack?: boolean;
    isSubmit?: boolean;
    isLoading?: boolean;
    backLabel?: string;
    nextLabel?: string;
}

export function StepNavigation({
    onBack,
    onNext,
    showBack = true,
    isSubmit = false,
    isLoading = false,
    backLabel = "Atrás",
    nextLabel = "Siguiente",
}: StepNavigationProps) {
    return (
        <div className="flex justify-between mt-4">
            {showBack && onBack ? (
                <Button variant="outline" onClick={onBack}>
                    {backLabel}
                </Button>
            ) : (
                <div />
            )}
            {isSubmit ? (
                <Button
                    onClick={onNext}
                    className="w-full md:w-auto"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registrando...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Registrar Compañía
                        </>
                    )}
                </Button>
            ) : (
                <Button onClick={onNext}>{nextLabel}</Button>
            )}
        </div>
    );
}
