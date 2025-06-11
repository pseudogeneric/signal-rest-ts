// src/service/tests/AccountService.test.ts
import { AccountService } from "../src/service/AccountService";
import { ApiServiceError } from "../src/errors/ApiServiceError";
import {
  SetPinRequest,
  UpdateAccountSettingsRequest,
  UsernameInfo,
} from "../src/types/Account";

describe("AccountService", () => {
  let service: AccountService;
  const mockApiUrl = "http://fake-api.com";
  const mockNumber = "12345";

  beforeEach(() => {
    service = new AccountService(mockApiUrl);
    (global.fetch as jest.Mock).mockClear();
  });

  // --- getAccounts ---
  describe("getAccounts", () => {
    it("should return account list on successful fetch", async () => {
      const mockAccounts = ["account1", "account2"];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockAccounts,
      });

      const result = await service.getAccounts();
      expect(result).toEqual(mockAccounts);
      expect(global.fetch).toHaveBeenCalledWith(`${mockApiUrl}/v1/accounts`);
    });

    it("should throw ApiServiceError on API error", async () => {
      const errorMessage = "Failed to fetch accounts";
      const errorStatus = 500;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(service.getAccounts()).rejects.toThrow(
        new ApiServiceError(errorMessage, errorStatus)
      );
      expect(global.fetch).toHaveBeenCalledWith(`${mockApiUrl}/v1/accounts`);
    });

    it("should throw ApiServiceError on network error", async () => {
      const networkError = new Error("Network down");
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(service.getAccounts()).rejects.toThrow(
        new ApiServiceError(networkError.message, -1)
      );
      expect(global.fetch).toHaveBeenCalledWith(`${mockApiUrl}/v1/accounts`);
    });
  });

  // --- setUsername ---
  describe("setUsername", () => {
    const newName = "newUsername";
    const mockUsernameInfo: UsernameInfo = {
      username: newName,
      username_link: `link/${newName}`,
    };

    it("should return username info on successful post", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockUsernameInfo,
      });

      const result = await service.setUsername(mockNumber, newName);
      expect(result).toEqual(mockUsernameInfo);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/accounts/${mockNumber}/username`,
        {
          method: "POST",
          body: JSON.stringify({ username: newName }),
        }
      );
    });

    it("should throw ApiServiceError on API error", async () => {
      const errorMessage = "Failed to set username";
      const errorStatus = 400;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(service.setUsername(mockNumber, newName)).rejects.toThrow(
        new ApiServiceError(errorMessage, errorStatus)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/accounts/${mockNumber}/username`,
        {
          method: "POST",
          body: JSON.stringify({ username: newName }),
        }
      );
    });

    it("should throw ApiServiceError on network error", async () => {
      const networkError = new Error("Network failed");
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      try {
        await service.setUsername(mockNumber, newName);
        fail("Expected to throw");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiServiceError);
        // expect(error.message).toBe(networkError.message);
        // expect(error.statusCode).toBe(-1);
      }

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/accounts/${mockNumber}/username`,
        {
          method: "POST",
          body: JSON.stringify({ username: newName }),
        }
      );
    });

    describe("deleteUsername", () => {
      it("should resolve on successful delete (204)", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 204,
        });

        await expect(
          service.deleteUsername(mockNumber)
        ).resolves.toBeUndefined();
        expect(global.fetch).toHaveBeenCalledWith(
          `${mockApiUrl}/v1/accounts/${mockNumber}/username`,
          {
            method: "DELETE",
          }
        );
      });

      it("should throw ApiServiceError if status is not 204", async () => {
        const errorMessage = "Delete failed";
        const errorStatus = 400;
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: errorStatus,
          text: async () => errorMessage,
        });

        await expect(service.deleteUsername(mockNumber)).rejects.toThrow(
          new ApiServiceError(errorMessage, errorStatus)
        );
        expect(global.fetch).toHaveBeenCalledWith(
          `${mockApiUrl}/v1/accounts/${mockNumber}/username`,
          {
            method: "DELETE",
          }
        );
      });

      it("should throw ApiServiceError on API error", async () => {
        const errorMessage = "Failed to delete username";
        const errorStatus = 500;
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: errorStatus,
          text: async () => errorMessage,
        });

        await expect(service.deleteUsername(mockNumber)).rejects.toThrow(
          new ApiServiceError(errorMessage, errorStatus)
        );
        expect(global.fetch).toHaveBeenCalledWith(
          `${mockApiUrl}/v1/accounts/${mockNumber}/username`,
          {
            method: "DELETE",
          }
        );
      });

    });

    // --- updateAccountSettings ---
    describe("updateAccountSettings", () => {
      const settings: UpdateAccountSettingsRequest = {
        discoverable_by_number: true,
        share_number: true,
      };

      it("should resolve on successful PUT (204)", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 204,
        });

        await expect(
          service.updateAccountSettings(mockNumber, settings)
        ).resolves.toBeUndefined();
        expect(global.fetch).toHaveBeenCalledWith(
          `${mockApiUrl}/v1/accounts/${mockNumber}/settings`,
          {
            method: "PUT",
            body: JSON.stringify(settings),
          }
        );
      });

      it("should throw ApiServiceError if status is not 204", async () => {
        const errorMessage = "Update failed";
        const errorStatus = 400;
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: errorStatus,
          text: async () => errorMessage,
        });

        await expect(
          service.updateAccountSettings(mockNumber, settings)
        ).rejects.toThrow(new ApiServiceError(errorMessage, errorStatus));
        expect(global.fetch).toHaveBeenCalledWith(
          `${mockApiUrl}/v1/accounts/${mockNumber}/settings`,
          {
            method: "PUT",
            body: JSON.stringify(settings),
          }
        );
      });

      it("should throw ApiServiceError on API error", async () => {
        const errorMessage = "Failed to update settings";
        const errorStatus = 500;
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: errorStatus,
          text: async () => errorMessage,
        });

        await expect(
          service.updateAccountSettings(mockNumber, settings)
        ).rejects.toThrow(new ApiServiceError(errorMessage, errorStatus));
        expect(global.fetch).toHaveBeenCalledWith(
          `${mockApiUrl}/v1/accounts/${mockNumber}/settings`,
          {
            method: "PUT",
            body: JSON.stringify(settings),
          }
        );
      });


    });

    // --- setPin ---
    describe("setPin", () => {
      const pinRequest: SetPinRequest = { pin: "1234" };

      it("should resolve on successful POST (204)", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true, // --- deleteUsername ---
        });

        await expect(
          service.setPin(mockNumber, pinRequest)
        ).resolves.toBeUndefined();
        expect(global.fetch).toHaveBeenCalledWith(
          `${mockApiUrl}/v1/accounts/${mockNumber}/pin`,
          {
            method: "POST",
            body: JSON.stringify(pinRequest),
          }
        );
      });

      it("should throw ApiServiceError if status is not 204", async () => {
        const errorMessage = "Set PIN failed";
        const errorStatus = 400;
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: errorStatus,
          text: async () => errorMessage,
        });

        await expect(service.setPin(mockNumber, pinRequest)).rejects.toThrow(
          new ApiServiceError(errorMessage, errorStatus)
        );
        expect(global.fetch).toHaveBeenCalledWith(
          `${mockApiUrl}/v1/accounts/${mockNumber}/pin`,
          {
            method: "POST",
            body: JSON.stringify(pinRequest),
          }
        );
      });

      it("should throw ApiServiceError on API error", async () => {
        const errorMessage = "Failed to set PIN";
        const errorStatus = 500;
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: errorStatus,
          text: async () => errorMessage,
        });

        await expect(service.setPin(mockNumber, pinRequest)).rejects.toThrow(
          new ApiServiceError(errorMessage, errorStatus)
        );
        expect(global.fetch).toHaveBeenCalledWith(
          `${mockApiUrl}/v1/accounts/${mockNumber}/pin`,
          {
            method: "POST",
            body: JSON.stringify(pinRequest),
          }
        );
      });

      it("should throw ApiServiceError on network error", async () => {
        const networkError = new Error("Network failed");
        (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

        await expect(service.setPin(mockNumber, pinRequest)).rejects.toThrow(
          new ApiServiceError(networkError.message, -1)
        );
        expect(global.fetch).toHaveBeenCalledWith(
          `${mockApiUrl}/v1/accounts/${mockNumber}/pin`,
          {
            method: "POST",
            body: JSON.stringify(pinRequest),
          }
        );
      });
    });

    // --- removePin ---
    describe("removePin", () => {
      it("should resolve on successful DELETE (204)", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 204,
        });

        await expect(service.removePin(mockNumber)).resolves.toBeUndefined();
        expect(global.fetch).toHaveBeenCalledWith(
          `${mockApiUrl}/v1/accounts/${mockNumber}/pin`,
          {
            method: "DELETE",
          }
        );
      });

      it("should throw ApiServiceError if status is not 204", async () => {
        const errorMessage = "Remove PIN failed";
        const errorStatus = 400;
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: errorStatus,
          text: async () => errorMessage,
        });

        await expect(service.removePin(mockNumber)).rejects.toThrow(
          new ApiServiceError(errorMessage, errorStatus)
        );
        expect(global.fetch).toHaveBeenCalledWith(
          `${mockApiUrl}/v1/accounts/${mockNumber}/pin`,
          {
            method: "DELETE",
          }
        );
      });

      it("should throw ApiServiceError on API error", async () => {
        const errorMessage = "Failed to remove PIN";
        const errorStatus = 500;
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: errorStatus,
          text: async () => errorMessage,
        });

        await expect(service.removePin(mockNumber)).rejects.toThrow(
          new ApiServiceError(errorMessage, errorStatus)
        );
        expect(global.fetch).toHaveBeenCalledWith(
          `${mockApiUrl}/v1/accounts/${mockNumber}/pin`,
          {
            method: "DELETE",
          }
        );
      });

      it("should throw ApiServiceError on network error", async () => {
        const networkError = new Error("Network failed");
        (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

        await expect(service.removePin(mockNumber)).rejects.toThrow(
          new ApiServiceError(networkError.message, -1)
        );
        expect(global.fetch).toHaveBeenCalledWith(
          `${mockApiUrl}/v1/accounts/${mockNumber}/pin`,
          {
            method: "DELETE",
          }
        );
      });
    });
  });
});
