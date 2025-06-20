// src/service/tests/MessageService.test.ts
import { MessageService } from "../src/service/MessageService";
import { ApiServiceError } from "../src/errors/ApiServiceError";
import {
  SendMessageV2,
  SendMessageResponse,
  Reaction,
  Receipt,
} from "../src/types/Message";
import { SignalClient } from "../src/SignalClient";

describe("MessageService", () => {
  let service: MessageService;
  let client: SignalClient;
  const mockApiUrl = "http://fake-api.com";

  beforeEach(() => {
    client = new SignalClient("");
    service = new MessageService(mockApiUrl, client);
    (global.fetch as jest.Mock).mockClear();
  });

  describe("sendMessage", () => {
    const mockMessage: SendMessageV2 = {
      message: "Hello world",
      recipients: ["+1234567890"],
      number: "+0987654321",
    };
    const mockResponse: SendMessageResponse = {
      timestamp: "0",
    };

    it("should return SendMessageResponse on successful POST (201)", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      });

      const result = await service.sendMessage(mockMessage);
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(`${mockApiUrl}/v2/send`, {
        method: "POST",
        body: JSON.stringify(mockMessage),
      });
    });

    it("should throw ApiServiceError if status is not 201 (e.g. 400)", async () => {
      const errorMessage = "Bad Request";
      const errorStatus = 400;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage, // Or .json() if the error response is JSON
      });

      await expect(service.sendMessage(mockMessage)).rejects.toThrow(
        new ApiServiceError(errorMessage, errorStatus),
      );
      expect(global.fetch).toHaveBeenCalledWith(`${mockApiUrl}/v2/send`, {
        method: "POST",
        body: JSON.stringify(mockMessage),
      });
    });

    it("should throw ApiServiceError on other API error (e.g. 500)", async () => {
      const errorMessage = "Internal Server Error";
      const errorStatus = 500;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(service.sendMessage(mockMessage)).rejects.toThrow(
        new ApiServiceError(errorMessage, errorStatus),
      );
      expect(global.fetch).toHaveBeenCalledWith(`${mockApiUrl}/v2/send`, {
        method: "POST",
        body: JSON.stringify(mockMessage),
      });
    });
  });

  describe("showTypingIndicator", () => {
    const account = "+444444";
    const recipient = "+12345";

    it("should return showTypingIndicatorResponse on successful PUT (201)", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = service.showTypingIndicator(account, recipient);
      expect(result).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/typing-indicator/${account}`,
        {
          method: "PUT",
          body: JSON.stringify({ recipient: recipient }),
        },
      );
    });

    it("should throw ApiServiceError if status is not 201 (e.g. 400)", async () => {
      const errorMessage = "Bad Request";
      const errorStatus = 400;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage, // Or .json() if the error response is JSON
      });

      await expect(
        service.showTypingIndicator(account, recipient),
      ).rejects.toThrow(new ApiServiceError(errorMessage, errorStatus));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/typing-indicator/${account}`,
        {
          method: "PUT",
          body: JSON.stringify({ recipient: recipient }),
        },
      );
    });

    it("should throw ApiServiceError on other API error (e.g. 500)", async () => {
      const errorMessage = "Internal Server Error";
      const errorStatus = 500;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(
        service.showTypingIndicator(account, recipient),
      ).rejects.toThrow(new ApiServiceError(errorMessage, errorStatus));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/typing-indicator/${account}`,
        {
          method: "PUT",
          body: JSON.stringify({ recipient: recipient }),
        },
      );
    });
  });

  describe("hideTypingIndicator", () => {
    const account = "+444444";
    const recipient = "+12345";

    it("should return hideTypingIndicatorResponse on successful DELETE (201)", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = service.hideTypingIndicator(account, recipient);
      expect(result).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/typing-indicator/${account}`,
        {
          method: "DELETE",
          body: JSON.stringify({ recipient: recipient }),
        },
      );
    });

    it("should throw ApiServiceError if status is not 201 (e.g. 400)", async () => {
      const errorMessage = "Bad Request";
      const errorStatus = 400;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage, // Or .json() if the error response is JSON
      });

      await expect(
        service.hideTypingIndicator(account, recipient),
      ).rejects.toThrow(new ApiServiceError(errorMessage, errorStatus));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/typing-indicator/${account}`,
        {
          method: "DELETE",
          body: JSON.stringify({ recipient: recipient }),
        },
      );
    });

    it("should throw ApiServiceError on other API error (e.g. 500)", async () => {
      const errorMessage = "Internal Server Error";
      const errorStatus = 500;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(
        service.hideTypingIndicator(account, recipient),
      ).rejects.toThrow(new ApiServiceError(errorMessage, errorStatus));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/typing-indicator/${account}`,
        {
          method: "DELETE",
          body: JSON.stringify({ recipient: recipient }),
        },
      );
    });
  });

  describe("addReaction", () => {
    const account = "+22222";

    const react: Reaction = {
      reaction: ":laughing_while_crying_emoji:",
      recipient: "+11111",
      target_author: "author",
      timestamp: 42,
    };

    it("should return addReactionResponse on successful DELETE (201)", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = service.addReaction(account, react);
      expect(result).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/reactions/${account}`,
        {
          method: "POST",
          body: JSON.stringify(react),
        },
      );
    });

    it("should throw ApiServiceError if status is not 201 (e.g. 400)", async () => {
      const errorMessage = "Bad Request";
      const errorStatus = 400;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage, // Or .json() if the error response is JSON
      });

      await expect(service.addReaction(account, react)).rejects.toThrow(
        new ApiServiceError(errorMessage, errorStatus),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/reactions/${account}`,
        {
          method: "POST",
          body: JSON.stringify(react),
        },
      );
    });

    it("should throw ApiServiceError on other API error (e.g. 500)", async () => {
      const errorMessage = "Internal Server Error";
      const errorStatus = 500;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(service.addReaction(account, react)).rejects.toThrow(
        new ApiServiceError(errorMessage, errorStatus),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/reactions/${account}`,
        {
          method: "POST",
          body: JSON.stringify(react),
        },
      );
    });
  });

  describe("removeReaction", () => {
    const account = "+22222";

    const react: Reaction = {
      reaction: ":laughing_while_crying_emoji:",
      recipient: "+11111",
      target_author: "author",
      timestamp: 42,
    };

    it("should return removeReactionResponse on successful DELETE (201)", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = service.removeReaction(account, react);
      expect(result).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/reactions/${account}`,
        {
          method: "DELETE",
          body: JSON.stringify(react),
        },
      );
    });

    it("should throw ApiServiceError if status is not 201 (e.g. 400)", async () => {
      const errorMessage = "Bad Request";
      const errorStatus = 400;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage, // Or .json() if the error response is JSON
      });

      await expect(service.removeReaction(account, react)).rejects.toThrow(
        new ApiServiceError(errorMessage, errorStatus),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/reactions/${account}`,
        {
          method: "DELETE",
          body: JSON.stringify(react),
        },
      );
    });

    it("should throw ApiServiceError on other API error (e.g. 500)", async () => {
      const errorMessage = "Internal Server Error";
      const errorStatus = 500;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(service.removeReaction(account, react)).rejects.toThrow(
        new ApiServiceError(errorMessage, errorStatus),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/reactions/${account}`,
        {
          method: "DELETE",
          body: JSON.stringify(react),
        },
      );
    });
  });

  describe("sendReadReceipt", () => {
    const account = "+22222";

    const receipt: Receipt = {
      receipt_type: "read",
      recipient: "+11111",
      timestamp: 12345,
    };

    it("should return sendReadReceiptResponse on successful DELETE (201)", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = service.sendReadReceipt(account, receipt);
      expect(result).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/receipts/${account}`,
        {
          method: "POST",
          body: JSON.stringify(receipt),
        },
      );
    });

    it("should throw ApiServiceError if status is not 201 (e.g. 400)", async () => {
      const errorMessage = "Bad Request";
      const errorStatus = 400;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage, // Or .json() if the error response is JSON
      });

      await expect(service.sendReadReceipt(account, receipt)).rejects.toThrow(
        new ApiServiceError(errorMessage, errorStatus),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/receipts/${account}`,
        {
          method: "POST",
          body: JSON.stringify(receipt),
        },
      );
    });

    it("should throw ApiServiceError on other API error (e.g. 500)", async () => {
      const errorMessage = "Internal Server Error";
      const errorStatus = 500;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(service.sendReadReceipt(account, receipt)).rejects.toThrow(
        new ApiServiceError(errorMessage, errorStatus),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/receipts/${account}`,
        {
          method: "POST",
          body: JSON.stringify(receipt),
        },
      );
    });
  });
});
