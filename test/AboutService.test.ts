import { AboutService } from "../src/service/AboutService";
import { AboutInfo } from "../src/types/About";
import { ApiServiceError } from "../src/errors/ApiServiceError";


global.fetch = jest.fn();

describe("AboutService", () => {
  let aboutService: AboutService;
  const mockApiPath = "http://localhost:8080";

  beforeEach(() => {

    (global.fetch as jest.Mock).mockClear();
    aboutService = new AboutService(mockApiPath);
  });

  describe("aboutServer", () => {
    it("should fetch and return about information successfully", async () => {
      const mockAboutInfo: AboutInfo = {
        build: 1,
        version: "1.0.0",
        capabilities: new Map([
          ["some-capability", ["true"]],
        ]),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAboutInfo,
      } as Response);

      const result = await aboutService.aboutServer();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(`${mockApiPath}/v1/about`);
      expect(result).toEqual(mockAboutInfo);
    });

    it("should throw an ApiServiceError if the fetch call fails", async () => {
      const errorMessage = "Network error";
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage)
      );

      await expect(aboutService.aboutServer()).rejects.toThrow(ApiServiceError);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(`${mockApiPath}/v1/about`);
    });

    it("should throw an ApiServiceError if the response is not ok", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({ message: "Not Found" }),
      } as Response);

      await expect(aboutService.aboutServer()).rejects.toThrow(ApiServiceError);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(`${mockApiPath}/v1/about`);
    });
  });
});
