// src/service/tests/Service.test.ts
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
});
