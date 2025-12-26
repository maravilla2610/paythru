import { SesEmailProvider } from "../../lib/providers/ses-email-provider";

/**
 * Integration tests for SesEmailProvider.
 * 
 * Prerequisites:
 * 1. Valid AWS credentials in .env (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION)
 * 2. A verified sender email in AWS SES (AWS_SES_FROM_EMAIL)
 * 3. A TEST_EMAIL_RECIPIENT environment variable set to a valid email address to receive the test.
 */
describe("SesEmailProvider Integration", () => {
  // Skip tests if necessary environment variables are missing
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.TEST_EMAIL_RECIPIENT || !process.env.AWS_SES_FROM_EMAIL) {
    console.warn("Skipping SES integration tests. Set AWS_ACCESS_KEY_ID, AWS_SES_FROM_EMAIL, and TEST_EMAIL_RECIPIENT in .env to run them.");
    it.skip("skipping integration tests due to missing config", () => {});
    return;
  }

  const provider = new SesEmailProvider(process.env.AWS_SES_FROM_EMAIL);
  const recipient = process.env.TEST_EMAIL_RECIPIENT;

  it("should send a real email via AWS SES", async () => {
    const subject = "Integration Test: Real Email from Boost Landing";
    const timestamp = new Date().toISOString();
    const body = `This is a real email sent from the integration test suite at ${timestamp}.`;
    const html = `
      <h1>Integration Test</h1>
      <p>This is a <strong>real</strong> email sent from the integration test suite.</p>
      <p>Timestamp: ${timestamp}</p>
    `;

    console.log(`Attempting to send email to ${recipient}...`);
    
    await expect(
      provider.sendEmail(recipient, subject, body, html)
    ).resolves.not.toThrow();
    
    console.log("Email sent successfully.");
  }, 30000);
});
