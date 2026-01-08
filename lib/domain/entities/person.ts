import { z } from 'zod';
import { direccion } from './address';
import { fileOrString } from './file-schema';

export const personSchema = z.object({
    fecha_nacimiento: z.date().min(new Date('1900-01-01'), 'Invalid date of birth').max(new Date(), 'Date of birth cannot be in the future'),
    nacionalidad: z.string().min(1, 'Nationality is required'),
    pais_nacimiento: z.string().min(1, 'Country of birth is required'),
    nombre_completo: z.string().min(1, 'Full name is required'),
    ine: fileOrString,
    geolocation: z.string().optional(),
    domicilio_particular: direccion,
    nombre_completo_ordenante: z.string().min(1, 'Full name of the originator is required'),
})
export type PersonFormData = z.infer<typeof personSchema>;
