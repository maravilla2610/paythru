"use client";

import { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import {
    companySchema,
    CompanyFormData,
} from "@/lib/domain/entities/company";
import { CompanyStructure } from "@/lib/domain/entities/company-structure";
import {
    personSchema,
    PersonFormData,
} from "@/lib/domain/entities/person";
import { direccion, direccion_completa } from "@/lib/domain/entities/address";
import { registerCompany } from "@/lib/actions/register-company";
import { createClient } from "@/lib/providers/supabase/client";
import { RegisterCompanyService } from "@/lib/services/register-company";
import { FormData, AddressType, DocumentType } from "../types/register-types";

interface UseRegistrationFormProps {
    userId?: number;
    onSuccess?: () => void;
    onClose: () => void;
}

export function useRegistrationForm({ userId, onSuccess, onClose }: UseRegistrationFormProps) {
    const [formData, setFormData] = useState<FormData>({
        origen: "boost",
        moral: false,
        user_id: userId,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [sameAddress, setSameAddress] = useState(false);
    const [activeStep, setActiveStep] = useState<string | null>("type");

    useEffect(() => {
        if (sameAddress && formData.moral && formData.direccion_fiscal) {
            setFormData((prev) => ({
                ...prev,
                direccion_operativa: {
                    direccion: prev.direccion_fiscal?.direccion || "",
                    colonia: prev.direccion_fiscal?.colonia || "",
                    ciudad: prev.direccion_fiscal?.ciudad || "",
                    estado: prev.direccion_fiscal?.estado || "",
                    pais: prev.direccion_fiscal?.pais || "",
                    codigo_postal: prev.direccion_fiscal?.codigo_postal || "",
                },
            }));
        }
    }, [sameAddress, formData.direccion_fiscal, formData.moral]);

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

    const handleDocumentTypeChange = useCallback((value: DocumentType) => {
        setFormData((prev) => ({
            ...prev,
            tipo_documento: value,
        }));
        clearFieldError("tipo_documento");
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
                ...prev[addressType],
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
        const schema = formData.moral ? companySchema : personSchema;

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
            
            submissionData.direccion_fiscal_completa = direccion_completa(
                submissionData.direccion_fiscal as z.infer<typeof direccion>
            );
            
            if (submissionData.direccion_operativa) {
                submissionData.direccion_operativa_completa = direccion_completa(
                    submissionData.direccion_operativa as z.infer<typeof direccion>
                );
            }

            const schema = submissionData.moral ? companySchema : personSchema;
            schema.parse(submissionData);

            const supabase = createClient();
            const service = new RegisterCompanyService(supabase);
            console.log("Submission data:", submissionData);
            const dataWithFiles = await service.uploadAllFiles(submissionData as unknown as Record<string, unknown>);
            console.log("Data with files:", dataWithFiles);

            await registerCompany(dataWithFiles as CompanyFormData | PersonFormData);

            alert("Company registered successfully!");
            setFormData({});
            onClose();
            onSuccess?.();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const issues = error.issues || (error as any).errors || [];

                issues.forEach((issue: z.ZodIssue) => {
                    if (issue.path.length > 0) {
                        const fieldName = issue.path[0] as string;
                        newErrors[fieldName] = issue.message;
                    }
                });

                setErrors(newErrors);
                alert("Please fix the errors before submitting.");
            } else {
                console.error(error);
                alert("An error occurred while registering the company.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [formData, onClose, onSuccess]);

    const handleSameAddressChange = useCallback((checked: boolean) => {
        setSameAddress(checked);
        if (checked && formData.direccion_fiscal) {
            setFormData((prev) => ({
                ...prev,
                direccion_operativa: {
                    direccion: prev.direccion_fiscal?.direccion || "",
                    colonia: prev.direccion_fiscal?.colonia || "",
                    ciudad: prev.direccion_fiscal?.ciudad || "",
                    estado: prev.direccion_fiscal?.estado || "",
                    pais: prev.direccion_fiscal?.pais || "",
                    codigo_postal: prev.direccion_fiscal?.codigo_postal || "",
                },
            }));
        }
    }, [formData.direccion_fiscal]);

    const handleFieldUpdate = useCallback((
        field: string,
        value: string | number | boolean | Date | CompanyStructure[] | undefined
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
    };
}
