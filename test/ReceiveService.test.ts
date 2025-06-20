import { ReceiveService } from "../src/service/ReceiveService";
import { SignalClient } from "../src/SignalClient";
import { MessageContext } from "../src/types/Receive";

class MockWebSocket {
  url: string | URL;
  onmessage: ((event: { data: any }) => void) | null = null;
  close = jest.fn();
  send = jest.fn();

  constructor(url: string | URL) {
    this.url = url;
  }

  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage({ data });
    }
  }
}

describe("ReceiveService", () => {
  let mockWebSocketInstance: MockWebSocket | null;
  let service: ReceiveService;
  let mockSignalClient: SignalClient;
  let webSocketSpy: jest.SpyInstance;

  beforeAll(() => {
    webSocketSpy = jest
      .spyOn(global, "WebSocket")
      .mockImplementation((url: string | URL) => {
        mockWebSocketInstance = new MockWebSocket(url);
        return mockWebSocketInstance as any;
      });
  });

  let mockSendMessageHandler: jest.Mock;

  beforeEach(() => {
    mockSendMessageHandler = jest.fn();
    // More robust mock for SignalClient for message sending
    mockSignalClient = {
      account: jest.fn(),
      about: jest.fn(),
      group: jest.fn(),
      message: jest
        .fn()
        .mockReturnValue({ sendMessage: mockSendMessageHandler }),
      profile: jest.fn(),
      receive: jest.fn(),
    } as unknown as SignalClient;
    service = new ReceiveService("ws://localhost:8080", mockSignalClient);
    // Clear handlers before each test
    service.clearHandlers();
    jest.clearAllMocks(); // Clear all mocks including global ones like WebSocket and console
  });

  describe("registerHandler", () => {
    const mockHandler = jest.fn() as (ctx: MessageContext) => Promise<void>;
    const testAccount = "test-account";
    const testPattern = /test-pattern/;

    it("should register a handler and add it to the handlerStore", () => {
      service.registerHandler(testAccount, testPattern, mockHandler);
      const accountHandlers = (service as any).handlerStore.get(testAccount);
      expect(accountHandlers).toBeDefined();
      const patternHandlers = accountHandlers.get(testPattern);
      expect(patternHandlers).toBeDefined();
      expect(patternHandlers.length).toBe(1);
      expect(patternHandlers[0].handler).toBe(mockHandler);
    });

    it("should return an unsubscribe function that removes the handler", () => {
      const unsubscribe = service.registerHandler(
        testAccount,
        testPattern,
        mockHandler,
      );
      unsubscribe();
      const accountHandlers = (service as any).handlerStore.get(testAccount);
      const patternHandlers = accountHandlers.get(testPattern);
      expect(patternHandlers).toBeDefined();
      expect(patternHandlers.length).toBe(0);
    });

    it("should allow registering multiple handlers for the same account and pattern", () => {
      const anotherMockHandler = jest.fn();
      service.registerHandler(testAccount, testPattern, mockHandler);
      service.registerHandler(testAccount, testPattern, anotherMockHandler);

      const accountHandlers = (service as any).handlerStore.get(testAccount);
      const patternHandlers = accountHandlers.get(testPattern);
      expect(patternHandlers.length).toBe(2);
      expect(patternHandlers[0].handler).toBe(mockHandler);
      expect(patternHandlers[1].handler).toBe(anotherMockHandler);
    });

    it("should correctly store handlers for different accounts and patterns", () => {
      const account1 = "account1";
      const pattern1 = /pattern1/;
      const handler1 = jest.fn() as (ctx: MessageContext) => Promise<void>;

      const account2 = "account2";
      const pattern2 = /pattern2/;
      const handler2 = jest.fn() as (ctx: MessageContext) => Promise<void>;

      service.registerHandler(account1, pattern1, handler1);
      service.registerHandler(account2, pattern2, handler2);

      const store = (service as any).handlerStore;
      expect(store.get(account1).get(pattern1)[0].handler).toBe(handler1);
      expect(store.get(account2).get(pattern2)[0].handler).toBe(handler2);
      expect(store.get(account1).get(pattern2)).toBeUndefined();
      expect(store.get(account2).get(pattern1)).toBeUndefined();
    });

    it("unsubscribe should not fail if handler is already removed or pattern/account does not exist", () => {
      const unsubscribe = service.registerHandler(
        testAccount,
        testPattern,
        mockHandler,
      );
      unsubscribe(); // First call removes it
      expect(() => unsubscribe()).not.toThrow(); // Second call should not throw

      const dummyUnsubscribe = service.registerHandler(
        "other-account",
        /other-pattern/,
        jest.fn(),
      );
      // Tamper with the store to simulate a missing pattern for the original unsubscribe
      (service as any).handlerStore.get(testAccount)?.delete(testPattern);
      expect(() => unsubscribe()).not.toThrow();

      // Tamper with the store to simulate a missing account
      (service as any).handlerStore.delete(testAccount);
      expect(() => unsubscribe()).not.toThrow();

      // Unsubscribe the dummy one to ensure no cross-talk
      expect(() => dummyUnsubscribe()).not.toThrow();
    });
  });

  describe("clearHandlers", () => {
    const mockHandler = jest.fn() as (ctx: MessageContext) => Promise<void>;
    const testAccount = "test-account";
    const testPattern = /test-pattern/;

    it("should remove all handlers from the handlerStore", () => {
      // Register a couple of handlers
      service.registerHandler(testAccount, testPattern, mockHandler);
      service.registerHandler("another-account", /another-pattern/, jest.fn());

      expect((service as any).handlerStore.size).toBeGreaterThan(0); // Ensure something is there

      service.clearHandlers();

      expect((service as any).handlerStore.size).toBe(0);
    });

    it("should not affect subsequent handler registration", () => {
      service.registerHandler(testAccount, testPattern, mockHandler);
      service.clearHandlers();

      // Register a new handler after clearing
      const newHandler = jest.fn();
      const newPattern = /new-pattern/;
      service.registerHandler(testAccount, newPattern, newHandler);

      const accountHandlers = (service as any).handlerStore.get(testAccount);
      expect(accountHandlers).toBeDefined();
      const patternHandlers = accountHandlers.get(newPattern);
      expect(patternHandlers).toBeDefined();
      expect(patternHandlers.length).toBe(1);
      expect(patternHandlers[0].handler).toBe(newHandler);
      // Ensure the old pattern is not there
      expect(accountHandlers.get(testPattern)).toBeUndefined();
    });
  });

  describe("Receiving", () => {
    const testAccount = "test-account-ws";
    const testApiUrl = "ws://localhost:8080"; // Ensure this matches service's api path

    beforeEach(() => {
      // Reset spy and its default implementation FIRST
      webSocketSpy.mockClear();
      webSocketSpy.mockImplementation((url: string | URL) => {
        mockWebSocketInstance = new MockWebSocket(url);
        return mockWebSocketInstance as any;
      });
      mockWebSocketInstance = null;

      // Clear service state
      service.stopAllReceiving();
      (service as any).accountSockets.clear();
      service.clearHandlers();

      // Register the default handler needed for most tests in this suite
      service.registerHandler(testAccount, /.*/, jest.fn());
    });

    afterEach(() => {
      // Clean up any running listeners
      service.stopAllReceiving();
      jest.restoreAllMocks(); // Restore any mocks, including console.error if used
    });

    it("should create a WebSocket, set onmessage, and update internal state", () => {
      service.startReceiving(testAccount);

      const expectedUrl = `${testApiUrl}/v1/receive/${testAccount}`;
      expect(webSocketSpy).toHaveBeenCalledWith(expectedUrl);
      const currentSocketInstance = (service as any).accountSockets.get(
        testAccount,
      );
      expect(currentSocketInstance).toBeDefined();
      expect(currentSocketInstance.onmessage).toBeInstanceOf(Function);
      // mockWebSocketInstance should also be this instance due to the spy's default behavior
      expect(mockWebSocketInstance).toBe(currentSocketInstance);

      expect((service as any).isReceiving).toContain(testAccount);
      expect((service as any).accountSockets.get(testAccount)).toBe(
        mockWebSocketInstance,
      );
    });

    it("should not create a WebSocket if no handlers are registered for the account", () => {
      const newAccount = "no-handler-account";
      // Ensure no handlers for newAccount by clearing and not re-registering for it
      service.clearHandlers();

      service.startReceiving(newAccount);

      expect(webSocketSpy).not.toHaveBeenCalled();
      expect((service as any).isReceiving).not.toContain(newAccount);
      expect((service as any).accountSockets.has(newAccount)).toBe(false);
    });

    it("should call handlers if receiving matching message", () => {
      const account1 = "account1";
      const pattern1 = /pattern1/;
      const handler1 = jest.fn() as (ctx: MessageContext) => Promise<void>;

      const account2 = "account2";
      const pattern2 = /pattern2/;
      const handler2 = jest.fn() as (ctx: MessageContext) => Promise<void>;

      const message1 = {
        envelope: {
          dataMessage: {
            message: "pattern1",
          },
          sourceUuid: "uuid1",
        },
        account: account1,
      };

      service.registerHandler(account1, pattern1, handler1);
      service.registerHandler(account2, pattern2, handler2);

      service.startReceiving(account1);
      service.startReceiving(account2);

      let socket1: MockWebSocket = (service as any).accountSockets.get(
        account1,
      );
      socket1.simulateMessage(JSON.stringify(message1));

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).not.toHaveBeenCalled();
    });

    it("should not have active socket if stopReceiving", () => {
      const account1 = "account1";
      const pattern1 = /pattern1/;
      const handler1 = jest.fn() as (ctx: MessageContext) => Promise<void>;

      service.registerHandler(account1, pattern1, handler1);
      service.startReceiving(account1);

      expect((service as any).accountSockets.size).toBe(1);

      service.stopReceiving(account1);
      expect((service as any).accountSockets.size).toBe(0);
    });
  });
});
