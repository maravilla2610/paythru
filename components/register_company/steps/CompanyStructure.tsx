"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StepNavigation } from "../components/StepNavigation";
import { FormData } from "../../../lib/types/register-types";
import { CompanyStructure } from "@/lib/domain/entities/company-structure";
import { FileField } from "../components/FormFields";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CompanyStructureStepProps {
	formData: FormData;
	errors: Record<string, string>;
	onFieldUpdate: (field: string, value: string | number | boolean | Date | CompanyStructure[] | undefined) => void;
	onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onBack: () => void;
	onNext: () => void;
}

const DEFAULT_MEMBER: CompanyStructure = {
	nombre_completo: "",
	porcentaje: 0,
	rol_consejo: "otro",
	propietario: false,
	apoderado: false,
	rol: "",
	proveedor_recursos: false,
};

const ROL_CONSEJO_OPTIONS = [
	{ value: "presidente", label: "Presidente" },
	{ value: "secretario", label: "Secretario" },
	{ value: "tesorero", label: "Tesorero" },
	{ value: "admin_unico", label: "Administrador Único" },
	{ value: "otro", label: "Otro" },
];

export function CompanyStructureStep({ formData, errors, onFieldUpdate, onFileChange, onBack, onNext }: CompanyStructureStepProps) {
	const initialMembers = formData.estructura_societaria?.length
		? formData.estructura_societaria.map((member) => ({ proveedor_recursos: false, ...member }))
		: [{ ...DEFAULT_MEMBER }];

	const [members, setMembers] = useState<CompanyStructure[]>(initialMembers);
	const [rowErrors, setRowErrors] = useState<Record<number, string>>({});
	const [globalError, setGlobalError] = useState<string>("");

	const totalPercentage = useMemo(
		() => members.reduce((sum, m) => sum + (Number(m.porcentaje) || 0), 0),
		[members]
	);

	useEffect(() => {
		onFieldUpdate("estructura_societaria", members);
	}, [members, onFieldUpdate]);

	const handleMemberChange = (index: number, field: keyof CompanyStructure, value: CompanyStructure[keyof CompanyStructure]) => {
		setMembers((prev) => {
			const next = [...prev];
			next[index] = { ...next[index], [field]: value } as CompanyStructure;
			return next;
		});
	};

	const handleAddMember = () => {
		setMembers((prev) => [...prev, { ...DEFAULT_MEMBER }]);
	};

	const handleRemoveMember = (index: number) => {
		setMembers((prev) => {
			if (prev.length === 1) return prev;
			const next = [...prev];
			next.splice(index, 1);
			return next;
		});
	};

	const validateMembers = () => {
		const newRowErrors: Record<number, string> = {};
		let valid = true;

		members.forEach((member, idx) => {
			if (!member.nombre_completo?.trim()) {
				newRowErrors[idx] = "Ingresa el nombre completo.";
				valid = false;
			}

			const pct = Number(member.porcentaje);
			if (Number.isNaN(pct)) {
				newRowErrors[idx] = "Ingresa el porcentaje de participación.";
				valid = false;
			} else if (pct < 0 || pct > 100) {
				newRowErrors[idx] = "El porcentaje debe estar entre 0 y 100.";
				valid = false;
			}
		});

		if (Math.abs(totalPercentage - 100) > 0.001) {
			setGlobalError("La suma de los porcentajes debe ser 100%.");
			valid = false;
		} else {
			setGlobalError("");
		}

		setRowErrors(newRowErrors);
		return valid;
	};

	const validateAndContinue = () => {
		if (validateMembers()) {
			onNext();
		}
	};

	return (
		<div className="space-y-6">

			<div className="flex items-center justify-between rounded-md border p-4">
				<div>
					<p className="text-sm font-medium">Porcentaje total</p>
					<p className="text-2xl font-semibold">{totalPercentage.toFixed(2)}%</p>
				</div>
				<Button type="button" variant="outline" onClick={handleAddMember}>
					<Plus className="h-4 w-4 mr-2" /> Añadir persona
				</Button>
			</div>

			{globalError && <p className="text-sm text-red-600">{globalError}</p>}
			{errors.estructura_societaria && <p className="text-sm text-red-600">{errors.estructura_societaria}</p>}

			<div className="space-y-4">
				{members.map((member, index) => {
					const needsDocs = (Number(member.porcentaje) || 0) > 25;
					return (
						<div key={index} className="border rounded-lg p-4 shadow-sm">
							<div className="flex items-center justify-between mb-3">
								<h4 className="font-semibold">Integrante #{index + 1}</h4>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => handleRemoveMember(index)}
									disabled={members.length === 1}
								>
									<Trash2 className="h-4 w-4 mr-1" />
									Remover
								</Button>
							</div>

							{needsDocs && (
								<div className="mb-3 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-900">
									Este integrante tiene más del 25% de participación. Solicita y sube su <strong>poder</strong> y <strong>documento de identidad</strong> en los pasos correspondientes.
								</div>
							)}

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor={`nombre_${index}`}>Nombre completo</Label>
									<Input
										id={`nombre_${index}`}
										value={member.nombre_completo}
										onChange={(e) => handleMemberChange(index, "nombre_completo", e.target.value)}
										placeholder="Nombre y apellidos"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor={`porcentaje_${index}`}>Porcentaje de participación (%)</Label>
									<Input
										id={`porcentaje_${index}`}
										type="number"
										min={0}
										max={100}
										step="0.01"
										value={member.porcentaje ?? ""}
										onChange={(e) => handleMemberChange(index, "porcentaje", Number(e.target.value))}
										placeholder="0 - 100"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor={`rol_${index}`}>Rol en el consejo</Label>
									<Select
										value={member.rol_consejo}
										onValueChange={(value) => handleMemberChange(index, "rol_consejo", value as CompanyStructure["rol_consejo"])}
									>
										<SelectTrigger className="w-[180px]">
											<SelectValue placeholder="Selecciona un rol" />
										</SelectTrigger>
										<SelectContent>
											{ROL_CONSEJO_OPTIONS.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor={`rol_extra_${index}`}>Rol/puesto (opcional)</Label>
									<Input
										id={`rol_extra_${index}`}
										value={member.rol || ""}
										onChange={(e) => handleMemberChange(index, "rol", e.target.value)}
										placeholder="Socio, CFO, etc."
									/>
								</div>
								{needsDocs && (
									<div className="space-y-3 md:col-span-2">
										<FileField
											id="poder"
											label="Poder Notarial"
											onChange={onFileChange}
											error={errors.poder}
											fileName={(formData.poder as File)?.name}
											required
										/>
										<FileField
											id="documento"
											label="Documento de Identidad"
											onChange={onFileChange}
											error={errors.documento}
											fileName={(formData.documento as File)?.name}
											required
										/>
									</div>
								)}
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
								<label className="flex items-center gap-2 text-sm">
									<input
										type="checkbox"
										checked={member.propietario}
										onChange={(e) => handleMemberChange(index, "propietario", e.target.checked)}
									/>
									Propietario beneficiario
								</label>
								<label className="flex items-center gap-2 text-sm">
									<input
										type="checkbox"
										checked={member.apoderado}
										onChange={(e) => handleMemberChange(index, "apoderado", e.target.checked)}
									/>
									Apoderado
								</label>
								<label className="flex items-center gap-2 text-sm">
									<input
										type="checkbox"
										checked={member.proveedor_recursos || false}
										onChange={(e) => handleMemberChange(index, "proveedor_recursos", e.target.checked)}
									/>
									Proveedor de recursos
								</label>
							</div>

							{rowErrors[index] && (
								<p className="text-xs text-red-500 mt-2">{rowErrors[index]}</p>
							)}
						</div>
					);
				})}
			</div>

			<StepNavigation
				onBack={onBack}
				onNext={validateAndContinue}
				backLabel="Regresar"
				nextLabel="Continuar"
			/>
		</div>
	);
}
