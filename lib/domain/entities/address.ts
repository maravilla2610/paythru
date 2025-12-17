import { z } from 'zod';

export const direccion = z.object({
    direccion: z.string().min(1, 'Address is required'),
    colonia: z.string(),
    ciudad: z.string(),
    estado: z.string(),
    pais: z.string(),
    codigo_postal: z.string(),
})

export function direccion_completa(direccion_completa: z.infer<typeof direccion>) {
    return `${direccion_completa.direccion}, ${direccion_completa.colonia}, ${direccion_completa.ciudad}, ${direccion_completa.estado}, ${direccion_completa.pais}, ${direccion_completa.codigo_postal}`;
}

export type Address = z.infer<typeof direccion>;
