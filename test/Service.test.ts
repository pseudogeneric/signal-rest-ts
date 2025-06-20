// src/service/tests/Service.test.ts
import { ApiServiceError } from "../src/errors/ApiServiceError";
import { RestService } from "../src/service/RestService";
import { SignalClient } from "../src/SignalClient";

describe("Service", () => {
  const initialApiUrl = "http://initial-api.com";
  const client = new SignalClient("");

  it("constructor should set API URL and getAPI should return it", () => {
    const service = new RestService(initialApiUrl, client);
    expect(service.getAPI()).toBe(initialApiUrl);
  });

  it("setAPI should update the API URL", () => {
    const service = new RestService(initialApiUrl, client);
    const newApiUrl = "http://new-api.com";
    service.setAPI(newApiUrl);
    expect(service.getAPI()).toBe(newApiUrl);
  });

  it("should make a string of argument if not an error", () => {
    const e = "test";
    const service = new RestService(initialApiUrl, client);

    expect(() => service.unknownError(e)).toThrow(
      new ApiServiceError("test", -1),
    );
  });
});
