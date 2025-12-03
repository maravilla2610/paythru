"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { Building2, MapPin, FileText, Wallet, Save } from "lucide-react";
import ToolbarExpandable from "@/components/ui/toolbar-expandable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { companySchema, personSchema, CompanyFormData, PersonFormData } from "@/lib/entities/company";
import { User } from "@/lib/entities/user";
import { countries } from "@/lib/entities/countries";
import { registerCompany } from "@/app/actions/register-company";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function RegistrationForm({ user, setShowRegistration }: { user: User | null, setShowRegistration: (show: boolean) => void }) {
    const [formData, setFormData] = useState<Partial<CompanyFormData & PersonFormData>>({
        origen: "boost",
        moral_fisica: false,
        user_id: user?.id
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [activeStep, setActiveStep] = useState<string | null>("type");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        let parsedValue: string | number | boolean | undefined | Date = value;

        if (type === "checkbox") {
            parsedValue = (e.target as HTMLInputElement).checked;
        } else if (type === "number") {
            parsedValue = value === "" ? undefined : Number(value);
        } else if (type === "date") {
            parsedValue = value ? new Date(value) : undefined;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: parsedValue,
        }));

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files.length > 0) {
            setFormData((prev) => ({
                ...prev,
                [name]: files[0],
            }));
            if (errors[name]) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                });
            }
        }
    };

    const validateStep = (fields: string[]) => {
        const newErrors: Record<string, string> = {};
        let isValid = true;
        const schema = formData.moral_fisica ? companySchema : personSchema;

        fields.forEach((field) => {
            try {
                // Create a partial schema for the specific field to validate
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const fieldSchema = (schema as any).pick({ [field]: true });
                fieldSchema.parse({ [field]: formData[field as keyof typeof formData] });
            } catch (error) {
                if (error instanceof z.ZodError) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    newErrors[field] = (error as any).errors[0].message;
                    isValid = false;
                }
            }
        });

        setErrors((prev) => ({ ...prev, ...newErrors }));
        return isValid;
    };

    const handleNext = (
        currentStepId: string,
        nextStepId: string,
        fieldsToValidate: string[]
    ) => {
        if (validateStep(fieldsToValidate)) {
            setActiveStep(nextStepId);
        }
    };

    const handleBack = (prevStepId: string) => {
        setActiveStep(prevStepId);
    };

    const handleSubmit = async () => {
        try {
            const schema = formData.moral_fisica ? companySchema : personSchema;
            schema.parse(formData);
            console.log("Submitting form data:", formData);
            await registerCompany(formData as CompanyFormData | PersonFormData);
            alert("Company registered successfully!");
            setFormData({});
            setShowRegistration(false);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                console.log("Validation errors:", error);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (error as any).errors.forEach((err: any) => {
                    if (err.path[0]) {
                        newErrors[err.path[0] as string] = err.message;
                    }
                });
                setErrors(newErrors);
                alert("Please fix the errors before submitting.");
            }
        }
    };

    const steps = [
        {
            id: "type",
            title: "Tipo de cuenta",
            description: "Seleccione el tipo de cuenta",
            icon: FileText,
            content: (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="moral_fisica">Tipo de Cuenta</Label>
                            <Select
                                value={formData.moral_fisica ? "moral" : "fisica"}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        moral_fisica: value === "moral",
                                    }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccione el tipo de cuenta" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="moral">Persona Moral</SelectItem>
                                    <SelectItem value="fisica">Persona Física</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pais">Country</Label>
                            <Select
                                value={formData.pais || ""}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        pais: value,
                                    }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccionar país" />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map((country) => (
                                        <SelectItem key={country.code} value={country.code}>
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button
                            onClick={() =>
                                handleNext("type", "general", ["moral_fisica", "pais"])
                            }
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            )
        },
        {
            id: "general",
            title: "Información General",
            description: "Datos básicos " + `${formData.moral_fisica ? "de la empresa" : "de la persona"}`,
            icon: Building2,
            content: (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.moral_fisica ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="nombre_compañia">Nombre de la Compañía</Label>
                                    <Input
                                        id="nombre_compañia"
                                        name="nombre_compañia"
                                        value={formData.nombre_compañia || ""}
                                        onChange={handleChange}
                                        className={errors.nombre_compañia ? "border-red-500" : ""}
                                    />
                                    {errors.nombre_compañia && (
                                        <p className="text-xs text-red-500">
                                            {errors.nombre_compañia}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nombre_legal_compañia">Nombre Legal</Label>
                                    <Input
                                        id="nombre_legal_compañia"
                                        name="nombre_legal_compañia"
                                        value={formData.nombre_legal_compañia || ""}
                                        onChange={handleChange}
                                        className={errors.nombre_legal_compañia ? "border-red-500" : ""}
                                    />
                                    {errors.nombre_legal_compañia && (
                                        <p className="text-xs text-red-500">{errors.nombre_legal_compañia}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fecha_de_constitucion">
                                        Fecha de Constitución
                                    </Label>
                                    <Input
                                        id="fecha_de_constitucion"
                                        name="fecha_de_constitucion"
                                        type="date"
                                        value={
                                            formData.fecha_de_constitucion instanceof Date
                                                ? formData.fecha_de_constitucion
                                                    .toISOString()
                                                    .split("T")[0]
                                                : ""
                                        }
                                        onChange={handleChange}
                                        className={
                                            errors.fecha_de_constitucion ? "border-red-500" : ""
                                        }
                                    />
                                    {errors.fecha_de_constitucion && (
                                        <p className="text-xs text-red-500">
                                            {errors.fecha_de_constitucion}
                                        </p>
                                    )}
                                </div>
                                {formData.pais === "MX" ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="rfc">RFC</Label>
                                        <Input
                                            id="rfc"
                                            name="rfc"
                                            value={formData.rfc || ""}
                                            onChange={handleChange}
                                            className={errors.rfc ? "border-red-500" : ""}
                                        />
                                        {errors.rfc && (
                                            <p className="text-xs text-red-500">{errors.rfc}</p>
                                        )}
                                    </div>
                                ) : null}
                                <div className="space-y-2">
                                    <Label htmlFor="correo">Correo Electrónico</Label>
                                    <Input
                                        id="correo"
                                        name="correo"
                                        type="email"
                                        value={formData.correo || ""}
                                        onChange={handleChange}
                                        className={errors.correo ? "border-red-500" : ""}
                                    />
                                    {errors.correo && (
                                        <p className="text-xs text-red-500">{errors.correo}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="giro_mercantil">Giro Mercantil</Label>
                                    <Input
                                        id="giro_mercantil"
                                        name="giro_mercantil"
                                        value={formData.giro_mercantil || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="csf">Constancia de Situación Fiscal</Label>
                                    <Input
                                        id="csf"
                                        name="csf"
                                        type="file"
                                        onChange={handleFileChange}
                                    />
                                    {formData.csf && (
                                        <p className="text-sm text-muted-foreground">
                                            Archivo seleccionado: {(formData.csf as File).name}
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="nombre_representante_legal">Nombre</Label>
                                    <Input
                                        id="nombre_representante_legal"
                                        name="nombre_representante_legal"
                                        value={formData.nombre_representante_legal || ""}
                                        onChange={handleChange}
                                        className={errors.nombre_representante_legal ? "border-red-500" : ""}
                                    />
                                    {errors.nombre_representante_legal && (
                                        <p className="text-xs text-red-500">{errors.nombre_representante_legal}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apellido_representante_legal">Apellido</Label>
                                    <Input
                                        id="apellido_representante_legal"
                                        name="apellido_representante_legal"
                                        value={formData.apellido_representante_legal || ""}
                                        onChange={handleChange}
                                        className={errors.apellido_representante_legal ? "border-red-500" : ""}
                                    />
                                    {errors.apellido_representante_legal && (
                                        <p className="text-xs text-red-500">{errors.apellido_representante_legal}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fecha_de_nacimiento">
                                        Fecha de Nacimiento
                                    </Label>
                                    <Input
                                        id="fecha_de_nacimiento"
                                        name="fecha_de_nacimiento"
                                        type="date"
                                        value={
                                            formData.fecha_de_nacimiento instanceof Date
                                                ? formData.fecha_de_nacimiento
                                                    .toISOString()
                                                    .split("T")[0]
                                                : ""
                                        }
                                        onChange={handleChange}
                                        className={
                                            errors.fecha_de_nacimiento ? "border-red-500" : ""
                                        }
                                    />
                                    {errors.fecha_de_nacimiento && (
                                        <p className="text-xs text-red-500">
                                            {errors.fecha_de_nacimiento}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tipo_documento">Tipo de Documento</Label>
                                    <Select
                                        value={formData.tipo_documento || ""}
                                        onValueChange={(value) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                tipo_documento: value as "pasaporte" | "ine" | "licencia" | "cartilla_militar",
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pasaporte">Pasaporte</SelectItem>
                                            <SelectItem value="ine">INE</SelectItem>
                                            <SelectItem value="licencia">Licencia</SelectItem>
                                            <SelectItem value="cartilla_militar">Cartilla Militar</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="documento">Legal Document</Label>
                                    <Input
                                        id="documento"
                                        name="documento"
                                        type="file"
                                        onChange={handleFileChange}
                                    />
                                    {formData.documento && (
                                        <p className="text-sm text-muted-foreground">
                                            Archivo seleccionado: {(formData.documento as File).name}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="numero_documento">Número de Documento</Label>
                                    <Input
                                        id="numero_documento"
                                        name="numero_documento"
                                        value={formData.numero_documento || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="curp">CURP</Label>
                                    <Input
                                        id="curp"
                                        name="curp"
                                        value={formData.curp || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rfc">RFC</Label>
                                    <Input
                                        id="rfc"
                                        name="rfc"
                                        value={formData.rfc || ""}
                                        onChange={handleChange}
                                        className={errors.rfc ? "border-red-500" : ""}
                                    />
                                    {errors.rfc && (
                                        <p className="text-xs text-red-500">{errors.rfc}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="correo">Correo Electrónico</Label>
                                    <Input
                                        id="correo"
                                        name="correo"
                                        type="email"
                                        value={formData.correo || ""}
                                        onChange={handleChange}
                                        className={errors.correo ? "border-red-500" : ""}
                                    />
                                    {errors.correo && (
                                        <p className="text-xs text-red-500">{errors.correo}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="csf">Constancia de Situación Fiscal</Label>
                                    <Input
                                        id="csf"
                                        name="csf"
                                        type="file"
                                        onChange={handleFileChange}
                                    />
                                    {formData.csf && (
                                        <p className="text-sm text-muted-foreground">
                                            Archivo seleccionado: {(formData.csf as File).name}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex justify-between mt-4">
                        <Button variant="outline" onClick={() => handleBack("type")}>
                            Atrás
                        </Button>
                        <Button
                            onClick={() =>
                                handleNext(
                                    "general",
                                    "address",
                                    formData.moral_fisica
                                        ? [
                                            "nombre_compañia",
                                            "nombre_legal_compañia",
                                            "fecha_de_constitucion",
                                            "rfc",
                                            "correo",
                                        ]
                                        : [
                                            "nombre_representante_legal",
                                            "apellido_representante_legal",
                                            "fecha_de_nacimiento",
                                            "rfc",
                                            "correo",
                                        ]
                                )
                            }
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            ),
        },
        {
            id: "address",
            title: "Dirección",
            description: "Dirección fiscal " + `${formData.moral_fisica ? "de la empresa" : "de la persona"}`,
            icon: MapPin,
            content: (
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="direccion">Calle y Número</Label>
                        <Input
                            id="direccion"
                            name="direccion"
                            value={formData.direccion || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="colonia">Colonia</Label>
                            <Input
                                id="colonia"
                                name="colonia"
                                value={formData.colonia || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="codigo_postal">Código Postal</Label>
                            <Input
                                id="codigo_postal"
                                name="codigo_postal"
                                value={formData.codigo_postal || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ciudad">Ciudad</Label>
                            <Input
                                id="ciudad"
                                name="ciudad"
                                value={formData.ciudad || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="estado">Estado</Label>
                            <Input
                                id="estado"
                                name="estado"
                                value={formData.estado || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pais">País</Label>
                            <Select
                                value={formData.pais || ""}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        pais: value,
                                    }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccionar país" />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map((country) => (
                                        <SelectItem key={country.code} value={country.code}>
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="comprobante_domicilio">
                                Comprobante de Domicilio
                            </Label>
                            <Input
                                id="comprobante_domicilio"
                                name="comprobante_domicilio"
                                type="file"
                                onChange={handleFileChange}
                            />
                            {formData.comprobante_domicilio && (
                                <p className="text-sm text-muted-foreground">
                                    Archivo seleccionado: {(formData.comprobante_domicilio as File).name}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between mt-4">
                        <Button variant="outline" onClick={() => handleBack("general")}>
                            Atrás
                        </Button>
                        <Button onClick={() => handleNext("address", formData.moral_fisica ? "representative" : "financial", [])}>
                            Siguiente
                        </Button>
                    </div>
                </div>
            ),
        },
        {
            id: "representative",
            title: "Representante Legal",
            description: "Datos del representante legal",
            icon: FileText,
            content: (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nombre_representante_legal">Nombre(s)</Label>
                            <Input
                                id="nombre_representante_legal"
                                name="nombre_representante_legal"
                                value={formData.nombre_representante_legal || ""}
                                onChange={handleChange}
                                className={
                                    errors.nombre_representante_legal ? "border-red-500" : ""
                                }
                            />
                            {errors.nombre_representante_legal && (
                                <p className="text-xs text-red-500">
                                    {errors.nombre_representante_legal}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="apellido_representante_legal">Apellidos</Label>
                            <Input
                                id="apellido_representante_legal"
                                name="apellido_representante_legal"
                                value={formData.apellido_representante_legal || ""}
                                onChange={handleChange}
                                className={
                                    errors.apellido_representante_legal ? "border-red-500" : ""
                                }
                            />
                            {errors.apellido_representante_legal && (
                                <p className="text-xs text-red-500">
                                    {errors.apellido_representante_legal}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fecha_de_nacimiento">
                                Fecha de Nacimiento
                            </Label>
                            <Input
                                id="fecha_de_nacimiento"
                                name="fecha_de_nacimiento"
                                type="date"
                                value={
                                    formData.fecha_de_nacimiento instanceof Date
                                        ? formData.fecha_de_nacimiento
                                            .toISOString()
                                            .split("T")[0]
                                        : ""
                                }
                                onChange={handleChange}
                                className={
                                    errors.fecha_de_nacimiento ? "border-red-500" : ""
                                }
                            />
                            {errors.fecha_de_nacimiento && (
                                <p className="text-xs text-red-500">
                                    {errors.fecha_de_nacimiento}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tipo_documento">Tipo de Documento</Label>
                            <Select
                                value={formData.tipo_documento || ""}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        tipo_documento: value as "pasaporte" | "ine" | "licencia" | "cartilla_militar",
                                    }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pasaporte">Pasaporte</SelectItem>
                                    <SelectItem value="ine">INE</SelectItem>
                                    <SelectItem value="licencia">Licencia</SelectItem>
                                    <SelectItem value="cartilla_militar">Cartilla Militar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="documento">Legal Document</Label>
                            <Input
                                id="documento"
                                name="documento"
                                type="file"
                                onChange={handleFileChange}
                            />
                            {formData.documento && (
                                <p className="text-sm text-muted-foreground">
                                    Archivo seleccionado: {(formData.documento as File).name}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="numero_documento">Número de Documento</Label>
                            <Input
                                id="numero_documento"
                                name="numero_documento"
                                value={formData.numero_documento || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="curp">CURP</Label>
                            <Input
                                id="curp"
                                name="curp"
                                value={formData.curp || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rfc">RFC</Label>
                            <Input
                                id="rfc"
                                name="rfc"
                                value={formData.rfc || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nacionalidad">Nacionalidad</Label>
                            <Input
                                id="nacionalidad"
                                name="nacionalidad"
                                value={formData.nacionalidad || ""}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="poder">Poder Notarial</Label>
                        <Input
                            id="poder"
                            name="poder"
                            type="file"
                            onChange={handleFileChange}
                        />
                        {formData.poder && (
                            <p className="text-sm text-muted-foreground">
                                Archivo seleccionado: {(formData.poder as File).name}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-between mt-4">
                        <Button variant="outline" onClick={() => handleBack("address")}>
                            Atrás
                        </Button>
                        <Button
                            onClick={() =>
                                handleNext("representative", "financial", [
                                    "nombre_representante_legal",
                                    "apellido_representante_legal",
                                ])
                            }
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            ),
        },
        {
            id: "financial",
            title: "Financiero",
            description: "Información financiera y operativa",
            icon: Wallet,
            content: (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="clabe">CLABE</Label>
                            <Input
                                id="clabe"
                                name="clabe"
                                type="number"
                                value={formData.clabe || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="wallet">Wallet Address</Label>
                            <Input
                                id="wallet"
                                name="wallet"
                                value={formData.wallet || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="origen_recursos">Origen de Recursos</Label>
                            <Input
                                id="origen_recursos"
                                name="origen_recursos"
                                value={formData.origen_recursos || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="destino_recursos">Destino de Recursos</Label>
                            <Input
                                id="destino_recursos"
                                name="destino_recursos"
                                value={formData.destino_recursos || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="volumen_transaccional">
                                Volumen Transaccional
                            </Label>
                            <Input
                                id="volumen_transaccional"
                                name="volumen_transaccional"
                                type="number"
                                value={formData.volumen_transaccional || ""}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="flex justify-between mt-4">
                        <Button variant="outline" onClick={() => handleBack(formData.moral_fisica ? "representative" : "address")}>
                            Atrás
                        </Button>
                        <Button onClick={handleSubmit} className="w-full md:w-auto">
                            <Save className="mr-2 h-4 w-4" />
                            Registrar Compañía
                        </Button>
                    </div>
                </div>
            ),
        },
    ];

    if (!formData.moral_fisica) {
        steps.splice(3, 1);
    }

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
        </div>
    );
}
