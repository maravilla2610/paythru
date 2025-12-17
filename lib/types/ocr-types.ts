import { AnalyzeDocumentCommandOutput, Block } from "@aws-sdk/client-textract";
import { Address } from "../domain/entities/address";
import { DocumentType } from "./register-types";


export type BlockMap = Record<string, Block>;

export interface DocumentImp {
    nombre_representante_legal?: string;
    apellido_representante_legal?: string;
    fecha_de_nacimiento?: string;
    rfc?: string;
    curp?: string;
    numero_documento?: number;
    tipo_documento?: DocumentType;
    nacionalidad?: string;
    direccion_fiscal?: Address;
    giro_mercantil?: string;
}

export interface CompanyDocumentImp {
    nombre_compañia?: string;
    nombre_legal_compañia?: string;
    fecha_de_constitucion?: string;
    rfc_entidad_legal?: string;
    direccion_fiscal?: Address;
    direccion_operativa?: Address;
    giro_mercantil?: string;
}

export interface OCRResult<T> {
    success: boolean;
    data?: T;
    error?: string;
    rawText?: string;
}

export interface TextractArtifacts {
    blocks: Block[];
    keyValues: Record<string, string>;
    documentText: string;
}

export type AnalyzeStrategy = (args: { file?: File; documentBytes: Buffer }) => Promise<AnalyzeDocumentCommandOutput>;

export type NormalizedEntry = { key: string; lowerKey: string; value: string };
