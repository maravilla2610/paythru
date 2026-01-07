import { z } from 'zod';
import { direccion } from './address';
import { fileOrString, optionalFileOrString } from './file-schema';

export const personSchema = z.object({
    fecha_de_nacimiento: z.date().min(1, 'Date of establishment is required'),
    rfc: z.string().min(1, 'RFC is required'),
    pais: z.string().min(1, 'Country is required'),
    curp: z.string().min(1, 'CURP is required'),
    e_firma: z.string().optional(),
    no_sello: z.string().optional(),
    direccion_fiscal: direccion,
    direccion_fiscal_completa: z.string().optional(),
    comprobante_domicilio_fiscal: fileOrString,
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
    documento: fileOrString,
    csf:  fileOrString,
    contrato: optionalFileOrString,
    kyc: optionalFileOrString,
    manifestacion: optionalFileOrString,
    firma: optionalFileOrString,
    user_id: z.number().min(1, 'User ID is required'),
    origen: z.enum([
        'paythru',
        'boost',
        'bitrus',
        'lite'
    ]),
    nacionalidad: z.string(),
    moral: z.boolean('Type must be boolean').optional(),
    giro_mercantil: z.string().min(1, 'Business activity is required'),
    telefono: z.string(),
    origen_recursos: z.string(),
    destino_recursos: z.string(),
    volumen_transaccional_mxn: z.number().min(1, 'Transaction volume is required'),
    volumen_transaccional_crypto: z.number().min(1, 'Crypto transaction volume is required'),
    moneda_crypto: z.string().min(1, 'Crypto currency is required'),
    operaciones_approximadas: z.string(),
    nombre_institucion_clabe: z.string().min(1, 'CLABE institution name is required'),
    clabe: z.string().regex(/^\d{18}$/, 'CLABE must be exactly 18 digits'),
    wallet: z.string().optional(),
})
export type PersonFormData = z.infer<typeof personSchema>;
