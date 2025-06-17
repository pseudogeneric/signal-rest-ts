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
      const handler1 = jest.fn();

      const account2 = "account2";
      const pattern2 = /pattern2/;
      const handler2 = jest.fn();

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

  describe("processMessage", () => {
    const testAccount = "test-account";
    const testSourceUuid = "test-source-uuid";
    const testPattern = /hello/;
    let mockHandler: jest.Mock;

    beforeEach(() => {
      mockHandler = jest.fn();
      // Register a default handler for most tests
      service.registerHandler(testAccount, testPattern, mockHandler);
    });

    const createMockMessage = (
      messageText: string,
      account: string = testAccount,
      sourceUuid: string = testSourceUuid,
    ) => ({
      account,
      envelope: {
        sourceUuid,
        dataMessage: {
          message: messageText,
        },
      },
    });

    it("should call the handler for a matching message pattern", async () => {
      const messageText = "hello world";
      const rawMessage = createMockMessage(messageText);
      await service.processMessage(rawMessage);

      expect(mockHandler).toHaveBeenCalledTimes(1);
      const expectedContext: Partial<MessageContext> = {
        message: messageText,
        account: testAccount,
        sourceUuid: testSourceUuid,
        rawMessage: rawMessage,
        // client: mockSignalClient, // client is part of the context
      };
      const calledContext = mockHandler.mock.calls[0][0];
      expect(calledContext).toMatchObject(expectedContext);
      expect(typeof calledContext.reply).toBe("function");
      expect(calledContext.client).toBe(mockSignalClient);
    });

    it("should not call the handler for a non-matching message pattern", async () => {
      const rawMessage = createMockMessage("goodbye world");
      await service.processMessage(rawMessage);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("should not call the handler if the account does not match", async () => {
      const rawMessage = createMockMessage("hello world", "other-account");
      await service.processMessage(rawMessage);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("should call multiple handlers for the same pattern", async () => {
      const anotherMockHandler = jest.fn();
      service.registerHandler(testAccount, testPattern, anotherMockHandler);
      const messageText = "hello there";
      const rawMessage = createMockMessage(messageText);
      await service.processMessage(rawMessage);

      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(anotherMockHandler).toHaveBeenCalledTimes(1);
    });

    it("reply function should call SignalClient.message().sendMessage with correct parameters", async () => {
      const replyText = "this is a reply";
      mockHandler.mockImplementation(async (ctx: MessageContext) => {
        await ctx.reply(replyText);
      });

      const messageText = "hello reply test";
      const rawMessage = createMockMessage(messageText);
      await service.processMessage(rawMessage);

      expect(mockHandler).toHaveBeenCalled();
      expect(mockSendMessageHandler).toHaveBeenCalledTimes(1);
      expect(mockSendMessageHandler).toHaveBeenCalledWith({
        number: testAccount,
        message: replyText,
        recipients: [testSourceUuid],
      });
    });

    it("should not throw and not call handlers if message structure is incorrect (missing envelope.dataMessage)", async () => {
      const malformedMessage = {
        account: testAccount,
        envelope: {
          sourceUuid: testSourceUuid,
          // dataMessage is missing
        },
      };
      await service.processMessage(malformedMessage);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("should not throw and not call handlers if message structure is incorrect (missing envelope)", async () => {
      const malformedMessage = {
        account: testAccount,
        // envelope is missing
      };
      await service.processMessage(malformedMessage);
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe("startReceiving", () => {
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

      // Clear processMessage spy
      jest.spyOn(service, "processMessage").mockClear();
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
  });
});
