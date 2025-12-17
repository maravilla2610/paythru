import { CompanyFormData } from "@/lib/domain/entities/company";
import { PersonFormData } from "@/lib/domain/entities/person";
import { CompanyStructure } from "@/lib/domain/entities/company-structure";

export type FormData = Partial<CompanyFormData & PersonFormData> & {
    estructura_societaria?: CompanyStructure[];
};

export type DocumentType = "pasaporte" | "ine" | "licencia" | "cartilla_militar";

export type AddressType = "direccion_fiscal" | "direccion_operativa";

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
