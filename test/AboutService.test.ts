// src/service/tests/AboutService.test.ts
import { AboutService } from '../src/service/AboutService';
import { AboutInfo } from '../src/types/About';
import { ApiServiceError } from '../src/errors/ApiServiceError';

describe('AboutService', () => {
  let service: AboutService;
  const mockApiUrl = 'http://fake-api.com';

  beforeEach(() => {
    service = new AboutService(mockApiUrl);
    (global.fetch as jest.Mock).mockClear();
  });

  describe('aboutServer', () => {
    it('should return AboutInfo on successful fetch', async () => {
      const mockAboutInfo: AboutInfo = { version: '1.0.0', build: '123' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAboutInfo,
      });

      const result = await service.aboutServer();
      expect(result).toEqual(mockAboutInfo);
      expect(global.fetch).toHaveBeenCalledWith(`${mockApiUrl}/v1/about`);
    });

    it('should throw ApiServiceError on API error', async () => {
      const errorMessage = 'Internal Server Error';
      const errorStatus = 500;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(service.aboutServer()).rejects.toThrow(
        new ApiServiceError(errorMessage, errorStatus)
      );
      expect(global.fetch).toHaveBeenCalledWith(`${mockApiUrl}/v1/about`);
    });

    it('should throw ApiServiceError on network error', async () => {
      const networkError = new Error('Network failed');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(service.aboutServer()).rejects.toThrow(
        new ApiServiceError(networkError.message, -1)
      );
      expect(global.fetch).toHaveBeenCalledWith(`${mockApiUrl}/v1/about`);
    });
  });
});
