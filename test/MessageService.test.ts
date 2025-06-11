// src/service/tests/MessageService.test.ts
import { MessageService } from '../src/service/MessageService';
import { ApiServiceError } from '../src/errors/ApiServiceError';
import { SendMessageV2, SendMessageResponse } from '../src/types/Message';

describe('MessageService', () => {
  let service: MessageService;
  const mockApiUrl = 'http://fake-api.com';

  beforeEach(() => {
    service = new MessageService(mockApiUrl);
    (global.fetch as jest.Mock).mockClear();
  });

  describe('sendMessage', () => {
    const mockMessage: SendMessageV2 = {
      message: 'Hello world',
      recipients: ['+1234567890'],
      number: '+0987654321',
    };
    const mockResponse: SendMessageResponse = {
      timestamp: '0'
    };

    it('should return SendMessageResponse on successful POST (201)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      });

      const result = await service.sendMessage(mockMessage);
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v2/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockMessage),
        }
      );
    });

    it('should throw ApiServiceError if status is not 201 (e.g. 400)', async () => {
      const errorMessage = 'Bad Request';
      const errorStatus = 400;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage, // Or .json() if the error response is JSON
      });

      await expect(service.sendMessage(mockMessage)).rejects.toThrow(
        new ApiServiceError(errorMessage, errorStatus)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v2/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockMessage),
        }
      );
    });

    it('should throw ApiServiceError on other API error (e.g. 500)', async () => {
        const errorMessage = 'Internal Server Error';
        const errorStatus = 500;
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: errorStatus,
          text: async () => errorMessage,
        });

        await expect(service.sendMessage(mockMessage)).rejects.toThrow(
          new ApiServiceError(errorMessage, errorStatus)
        );
        expect(global.fetch).toHaveBeenCalledWith(
            `${mockApiUrl}/v2/send`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(mockMessage),
            }
          );
      });

    it('should throw ApiServiceError on network error', async () => {
      const networkError = new Error('Network connection lost');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(service.sendMessage(mockMessage)).rejects.toThrow(
        new ApiServiceError(networkError.message, -1)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v2/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockMessage),
        }
      );
    });
  });
});
