import { z } from 'zod';

export const fileOrString = z.custom<File | string>((val) => {
    return val instanceof File || typeof val === 'string';
}, "Must be a File or a string path");

export const optionalFileOrString = fileOrString.optional();
