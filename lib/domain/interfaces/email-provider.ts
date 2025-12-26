export interface EmailProvider {
    sendEmail(to: string | string[], subject: string, body: string, html?: string): Promise<void>;
}
