"use client";

import { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import {
    personSchema,
    PersonFormData,
} from "@/lib/domain/entities/person";
import { registerUser } from "@/lib/actions/register";
import { createClient } from "@/lib/providers/supabase/client";
import { RegisterCompanyService } from "@/lib/services/register";
import { FormData, AddressType } from "../types/register-types";
import { toast } from "sonner"
import { triggerFireworks } from "@/lib/utils";
import { updateCrmStatus } from "@/lib/actions/crm";
import { CrmStatus } from "@/lib/domain/enums/crm-status";
import { User } from "../domain/entities/user";


interface UseRegistrationFormProps {
    user: User | null;
    onSuccess?: () => void;
    onClose: () => void;
}

export function useRegistrationForm({ user, onSuccess, onClose }: UseRegistrationFormProps) {
    const [formData, setFormData] = useState<FormData>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [activeStep, setActiveStep] = useState<string | null>("general");


    useEffect(() => {
        const crmId = localStorage.getItem('crm_lead_id');
        if (crmId) {
            updateCrmStatus(crmId, CrmStatus.started);
        }
    }, []);

    const clearFieldError = useCallback((fieldName: string) => {
        if (errors[fieldName]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    }, [errors]);

    const handleChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        // Preserve strings for text inputs like CLABE to keep leading zeros.
        const parsedValue: string | number | boolean | undefined | Date = (() => {
            if (type === "checkbox") return (e.target as HTMLInputElement).checked;
            if (type === "number") return value === "" ? undefined : Number(value);
            if (type === "date") return value ? new Date(value) : undefined;
            return value;
        })();

        setFormData((prev) => ({
            ...prev,
            [name]: parsedValue,
        }));

        clearFieldError(name);
    }, [clearFieldError]);

    const handleSelectChange = useCallback((name: string, value: string | boolean) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        clearFieldError(name);
    }, [clearFieldError]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files.length > 0) {
            setFormData((prev) => ({
                ...prev,
                [name]: files[0],
            }));
            clearFieldError(name);
        }
    }, [clearFieldError]);

    const handleAddressChange = useCallback((
        addressType: AddressType,
        field: string,
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            [addressType]: {
                ...(prev[addressType] || {}),
                [field]: value,
            },
        }));

        const errorKey = `${addressType}.${field}`;
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[errorKey];
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    const validateStep = useCallback((fields: string[]): boolean => {
        const newErrors: Record<string, string> = {};
        let isValid = true;
        const schema = personSchema;

        fields.forEach((field) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fieldSchema = (schema as any).pick({ [field]: true });
            const result = fieldSchema.safeParse({ [field]: formData[field as keyof typeof formData] });

            if (!result.success) {
                const zodError = result.error;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const issues = zodError.issues || (zodError as any).errors || [];

                if (Array.isArray(issues) && issues.length > 0) {
                    issues.forEach((issue: z.ZodIssue) => {
                        const errorPath = issue.path.join(".");
                        const errorKey = errorPath || field;
                        const shortKey = issue.path.length > 1 ? issue.path[issue.path.length - 1] : field;
                        newErrors[errorKey] = issue.message;
                        newErrors[shortKey as string] = issue.message;
                        isValid = false;
                    });
                }
            }
        });

        setErrors((prev) => {
            const nextErrors = { ...prev };
            fields.forEach((f) => delete nextErrors[f]);
            return { ...nextErrors, ...newErrors };
        });

        return isValid;
    }, [formData]);

    const handleNext = useCallback((
        nextStepId: string,
        fieldsToValidate: string[]
    ) => {
        if (validateStep(fieldsToValidate)) {
            setActiveStep(nextStepId);
        }
    }, [validateStep]);

    const handleBack = useCallback((prevStepId: string) => {
        setActiveStep(prevStepId);
    }, []);

    const handleSubmit = useCallback(async () => {
        setIsLoading(true);
        try {
            const submissionData = { ...formData };

            const schema = personSchema;
            schema.parse(submissionData);

            const supabase = createClient();
            const service = new RegisterCompanyService(supabase);
            const dataWithFiles = await service.uploadAllFiles(submissionData as unknown as Record<string, unknown>);

            await registerUser(dataWithFiles as PersonFormData, user?.id || undefined);

            const crmId = localStorage.getItem('crm_lead_id');
            if (crmId) {
                await updateCrmStatus(crmId, CrmStatus.completed);
                localStorage.removeItem('crm_lead_id');
                localStorage.removeItem('new_onboarding_email');
            }

            toast.success("Company registered successfully!");
            triggerFireworks();
            setFormData({});
            onClose();
            onSuccess?.();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const issues = error.issues || (error as any).errors || [];

                issues.forEach((issue: z.ZodIssue) => {
                    const path = issue.path.join(".");
                    if (path) {
                        newErrors[path] = issue.message;
                    }
                });

                setErrors(newErrors);
                toast.error("Please fix the errors before submitting.");
            } else {
                console.error(error);
                toast.error("An error occurred while registering the company.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [formData, user?.id, onClose, onSuccess]);


    const handleFieldUpdate = useCallback((
        field: string,
        value: string | number | boolean | Date | undefined
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        clearFieldError(field);
    }, [clearFieldError]);

    return {
        formData,
        setFormData,
        errors,
        isLoading,
        activeStep,
        setActiveStep,
        handleChange,
        handleSelectChange,
        handleFileChange,
        handleAddressChange,
        handleFieldUpdate,
        handleNext,
        handleBack,
        handleSubmit,
    };
}
