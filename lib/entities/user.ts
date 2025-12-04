import z from "zod";


export const userSchema = z.object({
    id: z.number(),
    auth_id: z.uuid(),
    correo: z.email(),
    nombre: z.string(),
    apellido: z.string().optional(),
    nombre_completo: z.string().optional(),
    telefono: z.number().optional(),
    foto: z.file().optional(),
    rol_trabajo: z.string().optional(),
    rol_systema: z.enum([
        'admin',
        'client',
        'operador'
    ]),
    companies: z.array(z.string()).optional(),
    estado: z.enum([
        'activo',
        'inactivo',
        'pendiente'
    ]).optional(),
});

export type User = z.infer<typeof userSchema>;