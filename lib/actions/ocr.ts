"use server";
import { TextractService } from "../services/ocr";
import { DocumentImp, CompanyDocumentImp, OCRResult } from "../types/ocr-types";
import { getUser } from "./user";

type RateEntry = { count: number; resetAt: number };

const TEXTRACT_LIMIT = 5;
const TEXTRACT_WINDOW_MS = 60 * 60 * 1000; // 1 hour window

// Persist in-memory across hot reloads where possible
const rateStore: Map<string, RateEntry> =
    (globalThis as unknown as { __textractRateStore?: Map<string, RateEntry> }).__textractRateStore ||
    ((globalThis as unknown as { __textractRateStore: Map<string, RateEntry> }).__textractRateStore = new Map());

function checkAndIncrementTextractUsage(key: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const existing = rateStore.get(key);

    if (!existing || existing.resetAt <= now) {
        const resetAt = now + TEXTRACT_WINDOW_MS;
        rateStore.set(key, { count: 1, resetAt });
        return { allowed: true, remaining: TEXTRACT_LIMIT - 1, resetAt };
    }

    if (existing.count >= TEXTRACT_LIMIT) {
        return { allowed: false, remaining: 0, resetAt: existing.resetAt };
    }

    existing.count += 1;
    rateStore.set(key, existing);
    return { allowed: true, remaining: TEXTRACT_LIMIT - existing.count, resetAt: existing.resetAt };
}

export async function extractDocumentData(file: File): Promise<OCRResult<DocumentImp>> {
        const user = await getUser();
        const rateKey = user?.correo || "anonymous";
        const { allowed, resetAt } = checkAndIncrementTextractUsage(rateKey);
        const devEnv = process.env.NODE_ENV === "development";

        if (!allowed && !devEnv) {
            return {
                success: false,
                error: `Has alcanzado el límite de ${TEXTRACT_LIMIT} análisis por hora. Vuelve después de ${new Date(resetAt).toLocaleString()}.`,
            };
        }

        const textractService = new TextractService();
        try {
            const { keyValues, documentText } = await textractService.extractArtifacts(file);
            const data = textractService.buildPersonData(keyValues, documentText);
            console.log("Extracted Key-Values:", keyValues);
            return { success: true, data, rawText: documentText };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to extract document data",
            };
        }
    }

export async function extractCsfData(file: File, isMoral: boolean): Promise<OCRResult<CompanyDocumentImp | DocumentImp>> {
        const user = await getUser();
        const rateKey = user?.correo || "anonymous";
        const { allowed, resetAt } = checkAndIncrementTextractUsage(rateKey);
        const devEnv = process.env.NODE_ENV === "development";

        if (!allowed && !devEnv) {
            return {
                success: false,
                error: `Has alcanzado el límite de ${TEXTRACT_LIMIT} análisis por hora. Vuelve después de ${new Date(resetAt).toLocaleString()}.`,
            };
        }

    const textractService= new TextractService();
    try {
        const { keyValues, documentText } = await textractService.extractArtifacts(file);
        console.log("Extracted Key-Values:", keyValues);
        console.log("Extracted Document Text:", documentText);
        if (isMoral) {
            const data = textractService.buildCompanyData(keyValues);
            return { success: true, data, rawText: documentText };
        }
        const data = textractService.buildPersonDataFromCsf(keyValues);
        return { success: true, data, rawText: documentText };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to extract company data",
        };
    }
}