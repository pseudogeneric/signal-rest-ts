// src/service/tests/AboutService.test.ts
import { AboutService } from "../src/service/AboutService";
import { AboutInfo } from "../src/types/About";
import { ApiServiceError } from "../src/errors/ApiServiceError";
import { SignalClient } from "../src/SignalClient";
import { InstalledStickerPacksResponse } from "../src/types/Sticker";
import { StickerService } from "../src/service/StickerService";

describe("AboutService", () => {
  let service: StickerService;
  let client: SignalClient;
  const mockApiUrl = "http://fake-api.com";
  const mockNumber = "user123";

  const stickerPackList: InstalledStickerPacksResponse[] = [
    {
      author: "nobody",
      installed: true,
      pack_id: "123",
      title: "none",
      url: "none://nope",
    },
  ];

  beforeEach(() => {
    client = new SignalClient("");
    service = new StickerService(mockApiUrl, client);
    (global.fetch as jest.Mock).mockClear();
  });

  describe("getStickerPack", () => {
    it("should resolve on successful GET", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => stickerPackList,
      });

      await expect(service.getStickerPacks(mockNumber)).resolves.toEqual(
        stickerPackList,
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/sticker-packs/${mockNumber}`,
      );
    });

    it("should throw ApiServiceError on network error", async () => {
      const networkError = new Error(
        "Server connection lost while blocking group",
      );
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(service.getStickerPacks(mockNumber)).rejects.toThrow(
        new ApiServiceError(networkError.message, -1),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/sticker-packs/${mockNumber}`,
      );
    });

    it("should throw ApiServiceError on API error (e.g. 404 admin not found)", async () => {
      const errorMessage = "Group to block not found";
      const errorStatus = 404;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(service.getStickerPacks(mockNumber)).rejects.toThrow(
        new ApiServiceError(errorMessage, errorStatus),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/sticker-packs/${mockNumber}`,
      );
    });
  });

  describe("addStickerPack", () => {
    const mockPackId = "123";
    const mockPackKey = "456";

    it("should resolve on successful GET", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => stickerPackList,
      });

      await expect(
        service.addStickerPack(mockNumber, mockPackId, mockPackKey),
      ).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/sticker-packs/${mockNumber}`,
        {
          method: "POST",
          body: JSON.stringify({ pack_id: mockPackId, pack_key: mockPackKey }),
        },
      );
    });

    it("should throw ApiServiceError on network error", async () => {
      const networkError = new Error(
        "Server connection lost while blocking group",
      );
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(
        service.addStickerPack(mockNumber, mockPackId, mockPackKey),
      ).rejects.toThrow(new ApiServiceError(networkError.message, -1));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/sticker-packs/${mockNumber}`,
        {
          method: "POST",
          body: JSON.stringify({ pack_id: mockPackId, pack_key: mockPackKey }),
        },
      );
    });

    it("should throw ApiServiceError on API error (e.g. 404 admin not found)", async () => {
      const errorMessage = "Group to block not found";
      const errorStatus = 404;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(
        service.addStickerPack(mockNumber, mockPackId, mockPackKey),
      ).rejects.toThrow(new ApiServiceError(errorMessage, errorStatus));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/sticker-packs/${mockNumber}`,
        {
          method: "POST",
          body: JSON.stringify({ pack_id: mockPackId, pack_key: mockPackKey }),
        },
      );
    });
  });
});
