import { SesEmailProvider } from "../../lib/providers/ses-email-provider";
import { AwsClient } from "@/lib/providers/aws";
import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";

// Mock the AwsClient
jest.mock("@/lib/providers/aws");
// Mock the SESClient and SendEmailCommand
jest.mock("@aws-sdk/client-ses");

describe("SesEmailProvider", () => {
  let provider: SesEmailProvider;
  let mockSesClient: SESClient;
  let mockSend: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock SES client
    mockSend = jest.fn();
    mockSesClient = {
      send: mockSend,
    };

    // Setup AwsClient mock to return the mock SES client
    (AwsClient as jest.Mock).mockImplementation(() => ({
      getSesClient: jest.fn().mockReturnValue(mockSesClient),
    }));

    provider = new SesEmailProvider("test@example.com");
  });

  it("should send an email successfully", async () => {
    const to = "recipient@example.com";
    const subject = "Test Subject";
    const body = "Test Body";

    await provider.sendEmail(to, subject, body);

    expect(AwsClient).toHaveBeenCalledTimes(1);
    expect(mockSesClient.send).toHaveBeenCalledTimes(1);
    
    // Check if SendEmailCommand was instantiated with correct arguments
    expect(SendEmailCommand).toHaveBeenCalledWith({
      Source: "test@example.com",
      Destination: {
        ToAddresses: [to],
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
        },
      },
    });
  });

  it("should handle array of recipients", async () => {
    const to = ["recipient1@example.com", "recipient2@example.com"];
    const subject = "Test Subject";
    const body = "Test Body";

    await provider.sendEmail(to, subject, body);

    expect(SendEmailCommand).toHaveBeenCalledWith(expect.objectContaining({
      Destination: {
        ToAddresses: to,
      },
    }));
  });

  it("should include HTML content if provided", async () => {
    const to = "recipient@example.com";
    const subject = "Test Subject";
    const body = "Test Body";
    const html = "<p>Test HTML</p>";

    await provider.sendEmail(to, subject, body, html);

    expect(SendEmailCommand).toHaveBeenCalledWith(expect.objectContaining({
      Message: expect.objectContaining({
        Body: expect.objectContaining({
          Html: {
            Data: html,
            Charset: "UTF-8",
          },
        }),
      }),
    }));
  });

  it("should throw error if sending fails", async () => {
    const error = new Error("SES Error");
    mockSend.mockRejectedValue(error);

    await expect(provider.sendEmail("to@example.com", "sub", "body"))
      .rejects.toThrow("SES Error");
  });
});
