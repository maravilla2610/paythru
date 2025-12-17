import { z } from 'zod';

export const companyStructureSchema = z.object({
    nombre_completo: z.string().min(1, 'Full name is required'),
    porcentaje: z.number().min(0, 'Percentage must be at least 0').max(100, 'Percentage cannot exceed 100'),
    rol_consejo:z.enum([
        'presidente',
        'secretario',
        'tesorero',
        'admin_unico',
        'otro',
    ]),
    propietario: z.boolean('Must be a boolean value'),
    apoderado: z.boolean('Must be a boolean value'),
    rol: z.string().optional(),
    documento: z.file().optional(),
    poder: z.file().optional(),
    proveedor_recursos: z.boolean('Must be a boolean value').optional(),
});

export type CompanyStructure = z.infer<typeof companyStructureSchema>;
