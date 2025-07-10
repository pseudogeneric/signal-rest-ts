// src/service/tests/AboutService.test.ts
import { AboutService } from "../src/service/AboutService";
import { AboutInfo } from "../src/types/About";
import { SignalApiServiceError } from "../src/errors/SignalApiServiceError";
import { SignalClient } from "../src/SignalClient";

describe("AboutService", () => {
  let service: AboutService;
  let client: SignalClient;
  const mockApiUrl = "http://fake-api.com";

  beforeEach(() => {
    client = new SignalClient("");
    service = new AboutService(mockApiUrl, client);
    (global.fetch as jest.Mock).mockClear();
  });

  describe("aboutServer", () => {
    it("should return AboutInfo on successful fetch", async () => {
      const mockAboutInfo: AboutInfo = { version: "1.0.0", build: 123 };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAboutInfo,
      });

      const result = await service.aboutServer();
      expect(result).toEqual(mockAboutInfo);
      expect(global.fetch).toHaveBeenCalledWith(`${mockApiUrl}/v1/about`);
    });

    it("should throw SignalApiServiceError on API error", async () => {
      const errorMessage = "Internal Server Error";
      const errorStatus = 500;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(service.aboutServer()).rejects.toThrow(
        new SignalApiServiceError(errorMessage, errorStatus),
      );
      expect(global.fetch).toHaveBeenCalledWith(`${mockApiUrl}/v1/about`);
    });

    it("should throw SignalApiServiceError on network error", async () => {
      const networkError = new Error("Network failed");
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(service.aboutServer()).rejects.toThrow(
        new SignalApiServiceError(networkError.message, -1),
      );
      expect(global.fetch).toHaveBeenCalledWith(`${mockApiUrl}/v1/about`);
    });
  });
});
