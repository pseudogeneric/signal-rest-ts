// src/service/tests/Service.test.ts
import { Service } from '../src/service/Service';

describe('Service', () => {
  const initialApiUrl = 'http://initial-api.com';

  it('constructor should set API URL and getAPI should return it', () => {
    const service = new Service(initialApiUrl);
    expect(service.getAPI()).toBe(initialApiUrl);
  });

  it('setAPI should update the API URL', () => {
    const service = new Service(initialApiUrl);
    const newApiUrl = 'http://new-api.com';
    service.setAPI(newApiUrl);
    expect(service.getAPI()).toBe(newApiUrl);
  });
});
