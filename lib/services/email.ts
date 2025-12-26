

import { EmailProvider } from "@/lib/domain/interfaces/email-provider";

export class EmailService {
    private provider: EmailProvider;

    constructor(provider: EmailProvider) {
        this.provider = provider;
    }

    async sendEmail(to: string | string[], subject: string, body: string, html?: string): Promise<void> {
        await this.provider.sendEmail(to, subject, body, html);
    }
}