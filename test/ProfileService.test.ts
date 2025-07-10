// src/service/tests/ProfileService.test.ts
import { ProfileService } from "../src/service/ProfileService";
import { SignalApiServiceError } from "../src/errors/SignalApiServiceError";
import { SignalClient } from "../src/SignalClient";

// Mock type, as it's not defined in the provided snippet for ProfileService.ts
// Based on ProfileService.ts, it takes a name and optionally a base64Avatar.
interface UpdateProfileRequest {
  name: string;
  base64Avatar?: string;
  // email?: string; // Removed as it's not in the ProfileService.ts implementation
}

describe("ProfileService", () => {
  let service: ProfileService;
  let client: SignalClient;
  const mockApiUrl = "http://fake-api.com";
  const mockUserNumber = "user789";

  beforeEach(() => {
    client = new SignalClient("");
    service = new ProfileService(mockApiUrl, client);
    (global.fetch as jest.Mock).mockClear();
  });

  describe("updateProfile", () => {
    const mockProfileUpdate: UpdateProfileRequest = {
      name: "Jane Doe",
    };

    it("should resolve on successful PUT (204) without avatar", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await expect(
        service.updateProfile(mockUserNumber, mockProfileUpdate),
      ).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/profiles/${mockUserNumber}`,
        {
          method: "PUT",
          body: JSON.stringify({ name: mockProfileUpdate.name }), // Service sends object {name: ...}
        },
      );
    });

    it("should throw SignalApiServiceError if status is not 204 (e.g. 401 Unauthorized)", async () => {
      const errorMessage = "Unauthorized";
      const errorStatus = 401;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(
        service.updateProfile(mockUserNumber, mockProfileUpdate),
      ).rejects.toThrow(new SignalApiServiceError(errorMessage, errorStatus));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/profiles/${mockUserNumber}`,
        {
          method: "PUT",
          body: JSON.stringify({ name: mockProfileUpdate.name }),
        },
      );
    });

    it("should throw SignalApiServiceError on server error (e.g. 500)", async () => {
      const errorMessage = "Internal Server Error";
      const errorStatus = 500;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(
        service.updateProfile(mockUserNumber, mockProfileUpdate),
      ).rejects.toThrow(new SignalApiServiceError(errorMessage, errorStatus));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/profiles/${mockUserNumber}`,
        {
          method: "PUT",
          body: JSON.stringify({ name: mockProfileUpdate.name }),
        },
      );
    });

    it("should throw SignalApiServiceError on network error", async () => {
      const networkError = new Error("Server is down");
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(
        service.updateProfile(mockUserNumber, mockProfileUpdate),
      ).rejects.toThrow(new SignalApiServiceError(networkError.message, -1));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/profiles/${mockUserNumber}`,
        {
          method: "PUT",
          body: JSON.stringify({ name: mockProfileUpdate.name }),
        },
      );
    });
  });
});
