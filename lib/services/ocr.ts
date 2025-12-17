import {
    AnalyzeDocumentCommand,
    type AnalyzeDocumentCommandOutput,
    type Block,
    StartDocumentAnalysisCommand,
    GetDocumentAnalysisCommand,
} from "@aws-sdk/client-textract";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { DocumentType } from "@/lib/types/register-types";
import { Address } from "@/lib/domain/entities/address";
import {
    AnalyzeStrategy,
    DocumentImp,
    CompanyDocumentImp,
    TextractArtifacts,
    BlockMap,
    NormalizedEntry
} from "@/lib/types/ocr-types";
import { AwsClient } from "../providers/aws";

export class TextractService {
    private readonly syncStrategy: AnalyzeStrategy;
    private readonly asyncStrategy: AnalyzeStrategy;
    private readonly awsClient = new AwsClient();

    constructor() {
        this.syncStrategy = ({ documentBytes }) => this.runSync(documentBytes);
        this.asyncStrategy = ({ file, documentBytes }) => this.runAsync(file as File, documentBytes);
    }

    async analyze(file: File): Promise<TextractArtifacts> {
        this.ensureSupportedFile(file);

        const documentBytes = await this.fileToBuffer(file);
        const strategy = this.resolveStrategy(file, documentBytes);
        const response = await strategy({ file, documentBytes });
        const blocks = response.Blocks ?? [];

        return {
            blocks,
            keyValues: this.extractKeyValuePairs(blocks),
            documentText: this.collectDocumentText(blocks),
        };
    }

    private resolveStrategy(file: File, documentBytes: Buffer): AnalyzeStrategy {
        const { maxSyncBytes = 5 * 1024 * 1024 } = this.awsClient.getAwsConfig();
        const needsAsync = this.isPdfFile(file) || documentBytes.length > maxSyncBytes;
        return needsAsync ? this.asyncStrategy : this.syncStrategy;
    }

    private async runSync(documentBytes: Buffer): Promise<AnalyzeDocumentCommandOutput> {
        try {
            const command = new AnalyzeDocumentCommand({
                Document: { Bytes: documentBytes },
                FeatureTypes: ["FORMS", "TABLES"],
            });

            return await this.awsClient.getTextractClient().send(command);
        } catch (err) {
            const error = err as Error & { name?: string };
            if (error.name === "UnsupportedDocumentException") {
                throw new Error("Textract rechazó el documento: formato no soportado (PDF cifrado/corrupto o fuera de límites). Usa PDF sin contraseña, <=5MB, o una imagen.");
            }
            throw error;
        }
    }

    private async runAsync(file: File, documentBytes: Buffer): Promise<AnalyzeDocumentCommandOutput> {
        const bucket = this.awsClient.getBucket();
        if (!bucket) {
            throw new Error("Falta configurar AWS_TEXTRACT_BUCKET para usar el flujo asíncrono de Textract.");
        }

        let key: string | undefined;

        try {
            key = await this.uploadToS3ForTextract(this.awsClient, file, documentBytes);
            const startCommand = new StartDocumentAnalysisCommand({
                DocumentLocation: { S3Object: { Bucket: bucket, Name: key } },
                FeatureTypes: ["FORMS", "TABLES"],
            });

            const { JobId } = await this.awsClient.getTextractClient().send(startCommand);
            if (!JobId) {
                throw new Error("No se pudo iniciar el trabajo asíncrono de Textract (JobId ausente).");
            }

            return await this.pollJob(JobId);
        } finally {
            if (key) {
                try {
                    await this.deleteFromS3(this.awsClient, key);
                } catch (cleanupError) {
                    console.error("No se pudo eliminar el archivo temporal de Textract en S3", cleanupError);
                }
            }
        }
    }

    private async pollJob(jobId: string): Promise<AnalyzeDocumentCommandOutput> {
        const maxAttempts = 20;
        const delayMs = 1500;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const getCommand = new GetDocumentAnalysisCommand({ JobId: jobId });
            const result = await this.awsClient.getTextractClient().send(getCommand);

            if (result.JobStatus === "SUCCEEDED") return result;
            if (result.JobStatus === "FAILED") {
                throw new Error(`Textract async job failed: ${result.StatusMessage || "unknown error"}`);
            }

            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }

        throw new Error("El trabajo asíncrono de Textract no finalizó a tiempo. Intenta de nuevo o reduce el tamaño del documento.");
    }
    private async fileToBuffer(file: File): Promise<Buffer> {
        const arrayBuffer = await file.arrayBuffer();
        return Buffer.from(arrayBuffer);
        }   

    private async uploadToS3ForTextract(awsClient: AwsClient, file: File, body: Buffer): Promise<string> {
        const key = `textract/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
        const bucket = awsClient.getBucket();
        if (!bucket) {
            throw new Error("Falta configurar AWS_TEXTRACT_BUCKET para usar el flujo asíncrono de Textract.");
        }

        await awsClient.getS3Client().send(new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: file.type,
        }));

        return key;
    }

    private async deleteFromS3(awsClient: AwsClient, key: string): Promise<void> {
        const bucket = awsClient.getBucket();
        if (!bucket) {
            throw new Error("Falta configurar AWS_TEXTRACT_BUCKET para usar el flujo asíncrono de Textract.");
        }
        await awsClient.getS3Client().send(new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        }));
    }

    private isImageFile(file: File): boolean {
        return file.type.startsWith("image/");
    }

    private isPdfFile(file: File): boolean {
        return file.type === "application/pdf";
    }

    private isSupportedFile(file: File): boolean {
        return this.isImageFile(file) || this.isPdfFile(file);
    }

    private ensureSupportedFile(file: File): void {
        if (!this.isSupportedFile(file)) {
            throw new Error("Formato de archivo no soportado. Por favor sube una imagen (PNG, JPEG, GIF, WEBP) o PDF.");
        }
    }

    private buildBlockMap(blocks: Block[]): BlockMap {
        return blocks.reduce<BlockMap>((acc, block) => {
            if (block.Id) acc[block.Id] = block;
            return acc;
        }, {});
    }

    private extractTextFromRelationships(block: Block | undefined, blockMap: BlockMap): string {
        if (!block?.Relationships) return "";

        const texts: string[] = [];

        for (const rel of block.Relationships) {
            if (rel.Type !== "CHILD") continue;
            for (const id of rel.Ids ?? []) {
                const child = blockMap[id];
                if (!child) continue;

                if (child.BlockType === "WORD" || child.BlockType === "LINE") {
                    if (child.Text) texts.push(child.Text);
                } else if (child.BlockType === "SELECTION_ELEMENT" && child.SelectionStatus === "SELECTED") {
                    texts.push("☑");
                }
            }
        }

        return texts.join(" ").trim();
    }

    private extractKeyValuePairs(blocks: Block[]): Record<string, string> {
        const blockMap = this.buildBlockMap(blocks);
        const keyValues: Record<string, string> = {};

        for (const block of blocks) {
            if (block.BlockType !== "KEY_VALUE_SET" || !block.EntityTypes?.includes("KEY")) continue;

            const keyText = this.extractTextFromRelationships(block, blockMap);
            if (!keyText) continue;

            const valueRelationship = block.Relationships?.find((rel) => rel.Type === "VALUE");
            if (!valueRelationship?.Ids?.length) continue;

            const valueTexts = valueRelationship.Ids
                .map((id) => this.extractTextFromRelationships(blockMap[id], blockMap))
                .filter(Boolean);

            const valueText = valueTexts.join(" ").trim();
            keyValues[keyText] = valueText;
        }

        return keyValues;
    }

    private collectDocumentText(blocks: Block[]): string {
        return blocks
            .filter((block) => block.BlockType === "LINE" && block.Text)
            .map((block) => block.Text as string)
            .join("\n")
            .trim();
    }
    private normalizeEntries(keyValues: Record<string, string>): NormalizedEntry[] {
        return Object.entries(keyValues).map(([key, value]) => ({
            key,
            lowerKey: key.toLowerCase(),
            value: value.trim(),
        }));
    }

    private firstMatch(entries: NormalizedEntry[], predicates: ((key: string) => boolean)[]): string | undefined {
        return entries.find(({ lowerKey }) => predicates.some((predicate) => predicate(lowerKey)))?.value || undefined;
    }

    private containsAny(needles: string[]): (key: string) => boolean {
        return (key) => {
            const normalize = (value: string) =>
                value
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/\p{Diacritic}/gu, "");

            const normalizedKey = normalize(key);
            return needles.some((needle) => normalizedKey.includes(normalize(needle)));
        };
    }

    private parseAddress(addressText: string): Address | undefined {
        if (!addressText) return undefined;

        const lines = addressText.split(/[\,\n]+/).map((l) => l.trim()).filter(Boolean);

        return {
            direccion: lines[0] || "",
            colonia: lines[1] || "",
            ciudad: lines[2] || "",
            estado: lines[3] || "",
            pais: "México",
            codigo_postal: lines[lines.length - 1]?.match(/\d{5}/)?.[0] || "",
        };
    }

    private buildAddressFromCsf(entries: NormalizedEntry[]): Address | undefined {
        const find = (needles: string[]) => this.firstMatch(entries, [this.containsAny(needles)]);

        const vialidad = find(["nombre de vialidad"]);
        const tipoVialidad = find(["tipo de vialidad"]);
        const numeroExterior = find(["número exterior", "numero exterior"]);
        const numeroInterior = find(["número interior", "numero interior"]);
        const colonia = find(["nombre de la colonia"]);
        const localidad = find(["nombre de la localidad"]);
        const municipio = find(["nombre del municipio", "nombre del municipio o demarcación territorial"]);
        const estado = find(["nombre de la entidad federativa"]);
        let codigoPostal = find(["código postal", "codigo postal"]);
        const entreCalle = find(["entre calle"]);
        const yCalle = find(["y calle"]);

        if (!codigoPostal) {
            const inlineCp = entries.find(({ lowerKey }) => lowerKey.includes("codigo postal"))?.key;
            codigoPostal = inlineCp?.match(/\d{5}/)?.[0];
        }

        const direccionParts = [
            [tipoVialidad, vialidad].filter(Boolean).join(" ").trim(),
            numeroExterior ? `#${numeroExterior}` : undefined,
            numeroInterior ? `Int ${numeroInterior}` : undefined,
            (() => {
                if (!entreCalle && !yCalle) return undefined;
                if (entreCalle && yCalle) return `Entre ${entreCalle} y ${yCalle}`;
                return entreCalle ? `Entre ${entreCalle}` : `Cerca de ${yCalle}`;
            })(),
        ].filter(Boolean) as string[];

        const direccion = direccionParts.join(", ");
        const ciudad = localidad || municipio || "";

        if (!direccion && !colonia && !ciudad && !estado && !codigoPostal) return undefined;

        return {
            direccion,
            colonia: colonia || "",
            ciudad,
            estado: estado || "",
            pais: "México",
            codigo_postal: codigoPostal || "",
        };
    }

    private parseDate(dateText: string): string | undefined {
        const trimmed = dateText?.trim();
        if (!trimmed) return undefined;

        const pad = (value: string) => value.padStart(2, "0");

        const monthMap: Record<string, string> = {
            enero: "01",
            febrero: "02",
            marzo: "03",
            abril: "04",
            mayo: "05",
            junio: "06",
            julio: "07",
            agosto: "08",
            septiembre: "09",
            setiembre: "09",
            octubre: "10",
            noviembre: "11",
            diciembre: "12",
        };

        const normalized = trimmed
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .replace(/[,\.]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        const numericFormats = [
            /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // dd/mm/yyyy
            /(\d{4})-(\d{1,2})-(\d{1,2})/,   // yyyy-mm-dd
            /(\d{1,2})-(\d{1,2})-(\d{4})/,  // dd-mm-yyyy
            /(\d{4})\/(\d{1,2})\/(\d{1,2})/, // yyyy/mm/dd
        ];

        for (const format of numericFormats) {
            const match = normalized.match(format);
            if (!match) continue;

            if (format === numericFormats[1] || format === numericFormats[3]) {
                const [, y, m, d] = match;
                return `${y}-${pad(m)}-${pad(d)}`;
            }

            const [, d, m, y] = match;
            return `${y}-${pad(m)}-${pad(d)}`;
        }

        const textual = normalized.match(/(\d{1,2})\s*(?:de\s*)?([a-zñ]+)\s*(?:de\s*)?(\d{4})/);
        if (textual) {
            const [, d, monthName, y] = textual;
            const mm = monthMap[monthName];
            if (mm) {
                return `${y}-${mm}-${pad(d)}`;
            }
        }

        return undefined;
    }

    private detectDocumentType(text: string): DocumentType | undefined {
        const lowerText = text.toLowerCase();
        const map: Record<string, DocumentType> = {
            pasaporte: "pasaporte",
            passport: "pasaporte",
            ine: "ine",
            "credencial para votar": "ine",
            "licencia de conducir": "licencia",
            driver: "licencia",
            "cartilla militar": "cartilla_militar",
            military: "cartilla_militar",
        };

        const entry = Object.entries(map).find(([needle]) => lowerText.includes(needle));
        return entry ? entry[1] : undefined;
    }

    private parseIdentifiers(text: string): Pick<DocumentImp, "rfc" | "curp"> {
        const rfc = text.match(/[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}/i)?.[0];
        const curp = text.match(/[A-Z]{4}\d{6}[HM][A-Z]{5}\d{2}/i)?.[0];
        return { rfc: rfc || undefined, curp: curp || undefined };
    }

    buildPersonData(keyValues: Record<string, string>, documentText: string): DocumentImp {
        const entries = this.normalizeEntries(keyValues).filter(({ value }) => value);
        const find = (needles: string[]) => this.firstMatch(entries, [this.containsAny(needles)]);

        const data: DocumentImp = {
            nombre_representante_legal: find(["nombre"]),
            apellido_representante_legal: find(["apellido"]),
            fecha_de_nacimiento: this.parseDate(find(["fecha", "nacimiento", "dob"]) || ""),
            curp: find(["curp"]),
            numero_documento: (() => {
                const raw = find(["documento", "id"]);
                const numeric = raw?.replace(/\D/g, "");
                const parsed = numeric ? parseInt(numeric, 10) : NaN;
                return Number.isNaN(parsed) ? undefined : parsed;
            })(),
            nacionalidad: find(["nacionalidad"]),
        };

        if (!data.rfc || !data.curp) {
            const identifiers = this.parseIdentifiers(documentText);
            data.rfc ||= identifiers.rfc;
            data.curp ||= identifiers.curp;
        }

        data.tipo_documento ||= this.detectDocumentType(documentText);
        if (!data.nacionalidad && documentText.toLowerCase().includes("méxico")) {
            data.nacionalidad = "Mexicana";
        }

        return data;
    }

    buildCompanyData(keyValues: Record<string, string>): CompanyDocumentImp {
        const rawEntries = this.normalizeEntries(keyValues);
        const entries = rawEntries.filter(({ value }) => value);
        const find = (predicates: ((key: string) => boolean)[]) => this.firstMatch(entries, predicates);
        const csfAddress = this.buildAddressFromCsf(rawEntries);

        const pickConstitutionDate = () => {
            const match = entries.find((entry: NormalizedEntry) => entry.lowerKey.includes("inicio de operaciones"));
            if (match?.value) return match.value;
            return undefined;
        };

        const razonPredicates = [this.containsAny(["denominación", "razón social", "razon social", "legal"])];
        const namePredicates = [
            (key: string) => key.includes("nombre comercial"),
            (key: string) => key.includes("denominación") || key.includes("razón social") || key.includes("razon social"),
        ];

        const data: CompanyDocumentImp = {
            nombre_legal_compañia: find(razonPredicates),
            nombre_compañia: find(namePredicates) || find([this.containsAny(["nombre comercial"])]) || find(razonPredicates),
            rfc_entidad_legal: find([this.containsAny(["rfc"])]),
            giro_mercantil: find([this.containsAny(["giro", "actividad"])]),
            fecha_de_constitucion: this.parseDate(pickConstitutionDate() || ""),
            direccion_fiscal: (() => {
                const value = find([this.containsAny(["domicilio fiscal", "dirección fiscal", "direccion fiscal"])]);
                return value ? this.parseAddress(value) : csfAddress;
            })(),
            direccion_operativa: (() => {
                const value = entries.find(({ lowerKey }) => lowerKey.includes("domicilio") && lowerKey.includes("operativa"))?.value;
                return value ? this.parseAddress(value) : undefined;
            })(),
        };
        console.log("Company Data Built:", data);

        if (!data.nombre_legal_compañia) {
            data.nombre_legal_compañia = find([this.containsAny(["razon"])]) || undefined;
        }

        return data;
    }

    buildPersonDataFromCsf(keyValues: Record<string, string>): DocumentImp {
        const entries = this.normalizeEntries(keyValues).filter(({ value }) => value);
        const find = (needles: string[]) => this.firstMatch(entries, [this.containsAny(needles)]);
        const csfAddress = this.buildAddressFromCsf(entries);

        return {
            nombre_representante_legal: find(["nombre (s)"]),
            apellido_representante_legal: [find(["Primer Apellido"]), find(["Segundo Apellido"])].filter(Boolean).join(" ") || undefined,
            numero_documento: find(["idCIF"]) ? parseInt(find(["idCIF"]) || "", 10) : undefined,
            curp: find(["curp"]),
            rfc: find(["rfc"]),
            giro_mercantil: find(["giro", "actividad"]),
            direccion_fiscal: csfAddress || (() => {
                const address = find(["domicilio", "dirección", "direccion"]);
                return address ? this.parseAddress(address) : undefined;
            })(),
        };
    }

    async extractArtifacts(file: File): Promise<TextractArtifacts> {
        return this.analyze(file);
    }

}



