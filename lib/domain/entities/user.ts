import z from "zod";


export const userSchema = z.object({
    id: z.number(),
    correo: z.email(),
    nombre_completo: z.string(),
    pais_nacimiento: z.string().nullable(),
    fecha_nacimiento: z.string().nullable(),
    nacionalidad: z.string().nullable(),
    nombre_completo_ordenante: z.string().nullable(),
    onboarding: z.boolean(),
    domicilio_particular: z.string().nullable(),
});

export type User = z.infer<typeof userSchema>;