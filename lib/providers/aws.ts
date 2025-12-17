
import { S3Client } from "@aws-sdk/client-s3";
import { TextractClient } from "@aws-sdk/client-textract";

export class AwsClient {
    private s3Client: S3Client;
    private awsConfig: {
        region: string;
        maxSyncBytes?: number;
        bucket?: string;
    };
    private textractClient: TextractClient;

    constructor() {
        const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
        const credentials = accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined;

        this.awsConfig = {
            region,
            maxSyncBytes: process.env.AWS_MAX_SYNC_BYTES
                ? parseInt(process.env.AWS_MAX_SYNC_BYTES, 10)
                : 5 * 1024 * 1024,
            bucket: process.env.AWS_TEXTRACT_BUCKET || "",
        };

        const baseClientConfig = credentials ? { region, credentials } : { region };
        this.s3Client = new S3Client(baseClientConfig);
        this.textractClient = new TextractClient(baseClientConfig);
    }
    getS3Client(): S3Client {
        return this.s3Client;
    }
    getTextractClient(): TextractClient {
        return this.textractClient;
    }

    getAwsConfig() {
        return this.awsConfig;
    }

    getBucket(): string {
        return this.awsConfig.bucket || "";
    }
}