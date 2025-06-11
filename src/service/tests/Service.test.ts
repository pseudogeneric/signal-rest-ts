// src/service/tests/Service.test.ts
import { Service } from '../Service';
import { ApiServiceError } from '../../errors/ApiServiceError';

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

  it('setAPI should allow undefined to be passed (clearing API)', () => {
    const service = new Service(initialApiUrl);
    service.setAPI(undefined);
    expect(service.getAPI()).toBeUndefined();
  });

  describe('unknownError', () => {
    let service: Service;

    beforeEach(() => {
      // Service can be instantiated without a URL for unknownError tests
      service = new Service();
    });

    it('should throw ApiServiceError with error message and status -1 for Error object', () => {
      const error = new Error('Specific error message');
      // Test that the thrown error is an instance of ApiServiceError
      // and that its properties match
      try {
        service.unknownError(error);
      } catch (e) {
        expect(e).toBeInstanceOf(ApiServiceError);
        const apiError = e as ApiServiceError;
        expect(apiError.message).toBe(error.message);
        expect(apiError.status).toBe(-1);
      }
    });

    it('should throw ApiServiceError with string message and status -1 for string input', () => {
      const message = 'A string error';
      try {
        service.unknownError(message);
      } catch (e) {
        expect(e).toBeInstanceOf(ApiServiceError);
        const apiError = e as ApiServiceError;
        expect(apiError.message).toBe(message);
        expect(apiError.status).toBe(-1);
      }
    });

    it('should throw ApiServiceError with "Unknown Error" and status -1 for null input', () => {
      try {
        service.unknownError(null);
      } catch (e) {
        expect(e).toBeInstanceOf(ApiServiceError);
        const apiError = e as ApiServiceError;
        expect(apiError.message).toBe('Unknown Error');
        expect(apiError.status).toBe(-1);
      }
    });

    it('should throw ApiServiceError with "Unknown Error" and status -1 for undefined input', () => {
      try {
        service.unknownError(undefined);
      } catch (e) {
        expect(e).toBeInstanceOf(ApiServiceError);
        const apiError = e as ApiServiceError;
        expect(apiError.message).toBe('Unknown Error');
        expect(apiError.status).toBe(-1);
      }
    });

    it('should throw ApiServiceError with "Unknown Error" and status -1 for non-Error object input', () => {
        const notAnError = { someProperty: 'someValue' };
        try {
          service.unknownError(notAnError);
        } catch (e) {
          expect(e).toBeInstanceOf(ApiServiceError);
          const apiError = e as ApiServiceError;
          expect(apiError.message).toBe('Unknown Error');
          expect(apiError.status).toBe(-1);
        }
      });
  });
});
