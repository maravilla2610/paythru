import { SendEmailCommand } from "@aws-sdk/client-ses";
import { EmailProvider } from "@/lib/domain/interfaces/email-provider";
import { AwsClient } from "@/lib/providers/aws";

export class SesEmailProvider implements EmailProvider {
    private awsClient: AwsClient;
    private fromAddress: string;

    constructor(fromAddress: string = process.env.AWS_SES_FROM_EMAIL || "noreply@example.com") {
        this.awsClient = new AwsClient();
        this.fromAddress = fromAddress;
    }

    async sendEmail(to: string | string[], subject: string, body: string, html?: string): Promise<void> {
        const client = this.awsClient.getSesClient();
        const toAddresses = Array.isArray(to) ? to : [to];

        const command = new SendEmailCommand({
            Source: this.fromAddress,
            Destination: {
                ToAddresses: toAddresses,
            },
            Message: {
                Subject: {
                    Data: subject,
                    Charset: "UTF-8",
                },
                Body: {
                    Text: {
                        Data: body,
                        Charset: "UTF-8",
                    },
                    ...(html && {
                        Html: {
                            Data: html,
                            Charset: "UTF-8",
                        },
                    }),
                },
            },
        });

        try {
            await client.send(command);
        } catch (error) {
            console.error("Failed to send email via SES:", error);
            throw error;
        }
    }
}
