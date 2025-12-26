import { z } from 'zod';
import { direccion } from './address';
import { companyStructureSchema } from './company-structure';
import { fileOrString, optionalFileOrString } from './file-schema';


export const companySchema = z.object({
    nombre_compañia: z.string().min(1, 'Company name is required'),
    nombre_legal_compañia: z.string().min(1, 'Legal name is required'),
    fecha_de_constitucion: z.date().min(1, 'Incorporation date is required'),
    fecha_de_nacimiento: z.date().min(1, 'Date of establishment is required'),
    rfc: z.string().min(1, 'RFC is required'),
    curp: z.string(),
    e_firma: z.string().optional(),
    no_sello: z.string().optional(),
    pais: z.string().min(1, 'Country is required'),
    direccion_fiscal: direccion,
    direccion_fiscal_completa: z.string().min(1, 'Complete fiscal address is required'),
    direccion_operativa: direccion,
    direccion_operativa_completa: z.string().min(1, 'Complete operational address is required'),
    comprobante_domicilio_fiscal: fileOrString,
    comprobante_domicilio_operativo: optionalFileOrString,
    correo: z.email().optional(),
    nombre_representante_legal: z.string().min(1, 'Legal representative name is required'),
    apellido_representante_legal: z.string().min(1, 'Legal representative surname is required'),
    numero_documento: z.number().optional(),
    tipo_documento: z.enum([
        'pasaporte',
        'ine',
        'licencia',
        'cartilla_militar'
    ]),
    rfc_entidad_legal: z.string().min(1, 'Legal entity RFC is required'),
    documento: fileOrString,
    poder: fileOrString,
    acta_constitutiva: fileOrString,
    csf:  fileOrString,
    contrato: optionalFileOrString,
    kyc: optionalFileOrString,
    manifestacion: optionalFileOrString,
    firma: optionalFileOrString,
    user_id: z.number().min(1, 'User ID is required'),
    origen: z.enum([
        'boost',
        'bitrus',
        'lite'
    ]),
    nacionalidad: z.string().optional(),
    moral: z.boolean('Type must be boolean').optional(),
    giro_mercantil: z.string().min(1, 'Business activity is required'),
    telefono: z.string().optional(),
    origen_recursos: z.string().min(1, 'Source of funds is required'),
    destino_recursos: z.string().min(1, 'Destination of funds is required'),
    volumen_transaccional_mxn: z.number().min(1, 'Transaction volume is required'),
    volumen_transaccional_crypto: z.number().min(1, 'Crypto transaction volume is required'),
    moneda_crypto: z.string().min(1, 'Crypto currency is required'),
    operaciones_approximadas: z.string().optional(),
    nombre_institucion_clabe: z.string().min(1, 'CLABE institution name is required'),
    clabe: z.string().regex(/^\d{18}$/, 'CLABE must be exactly 18 digits'),
    wallet: z.string().optional(),
    estructura_societaria: z.array(companyStructureSchema),
    acta_asamblea: optionalFileOrString,
})

export type CompanyFormData = z.infer<typeof companySchema>;
