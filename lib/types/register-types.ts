import { PersonFormData } from "@/lib/domain/entities/person";
import { Address } from "@/lib/domain/entities/address";

export type FormData = Partial<Omit<PersonFormData, 'domicilio_particular'>> & {
    domicilio_particular?: Partial<Address>;
};

export type DocumentType = "pasaporte" | "ine" | "licencia" | "cartilla_militar";

export type AddressType = "domicilio_particular";

export interface RegistrationFormProps {
    user: { id?: number } | null;
    setShowRegistration: (show: boolean) => void;
    onSuccess?: () => void;
}

export interface StepNavigationProps {
    onBack: () => void;
    onNext: () => void;
    isFirst?: boolean;
    isLast?: boolean;
    isLoading?: boolean;
}

export interface FormFieldProps {
    id: string;
    label: string;
    error?: string;
    required?: boolean;
}

export interface TextFieldProps extends FormFieldProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: "text" | "email" | "tel" | "number" | "date" | "password";
    placeholder?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
    pattern?: string;
}

export interface FileFieldProps extends FormFieldProps {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear?: () => void;
    fileName?: string;
}

export interface SelectFieldProps extends FormFieldProps {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    options: { value: string; label: string }[];
}
