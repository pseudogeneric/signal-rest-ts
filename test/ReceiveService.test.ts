import { ReceiveService } from "../src/service/ReceiveService";
import { SignalClient } from "../src/SignalClient";
import { MessageContext } from "../src/types/Receive";

class MockWebSocket {
  url: string;
  onmessage: ((event: { data: any }) => void) | null = null;
  close = jest.fn();
  send = jest.fn();

  constructor(url: string) {
    this.url = url;
  }

  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage({ data });
    }
  }
}

describe("ReceiveService", () => {
  let mockWebSocketInstance: MockWebSocket;
  let service: ReceiveService;
  let mockSignalClient: SignalClient;

  beforeAll(() => {
    jest.spyOn(global, "WebSocket").mockImplementation((url: string | URL) => {
      if (url instanceof URL) return;
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

    it("should call console.error if a handler throws an error", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const errorMessage = "handler error";
      mockHandler.mockImplementation(async () => {
        throw new Error(errorMessage);
      });

      const rawMessage = createMockMessage("hello error test");
      // We need to wait for the promises within processMessage to settle
      await new Promise<void>((resolve) => {
        service.processMessage(rawMessage);
        // Give time for async handler execution and error catching
        setImmediate(() => {
          expect(mockHandler).toHaveBeenCalled();
          expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
          expect(consoleErrorSpy.mock.calls[0][0].message).toBe(errorMessage);
          consoleErrorSpy.mockRestore();
          resolve();
        });
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
      // Ensure there's at least one handler for testAccount to allow starting
      service.registerHandler(testAccount, /.*/, jest.fn());
      // Reset the mock WebSocket implementation for each test to ensure clean state
      // Spy on processMessage for some tests
      jest.spyOn(service, "processMessage");
    });

    afterEach(() => {
      // Clean up any running listeners
      service.stopAllReceiving();
      jest.restoreAllMocks(); // Restore any mocks, including console.error if used
    });

    it("should create a WebSocket, set onmessage, and update internal state", () => {
      service.startReceiving(testAccount);

      const expectedUrl = `${testApiUrl}/v1/receive/${testAccount}`;
      expect(global.WebSocket).toHaveBeenCalledWith(expectedUrl);
      expect(mockWebSocketInstance).not.toBeNull();
      expect(mockWebSocketInstance.onmessage).toBeInstanceOf(Function);

      expect((service as any).isReceiving).toContain(testAccount);
      expect((service as any).accountSockets.get(testAccount)).toBe(
        mockWebSocketInstance,
      );
    });

    it("should call processMessage when a message is received on WebSocket", () => {
      service.startReceiving(testAccount);

      const messageData = { type: "testMessage", payload: "hello" };
      expect(mockWebSocketInstance).not.toBeNull();
      mockWebSocketInstance.simulateMessage(JSON.stringify(messageData));

      expect(service.processMessage).toHaveBeenCalledWith(messageData);
    });

    it("should not create a new WebSocket if already receiving for the account", () => {
      service.startReceiving(testAccount); // First call
      expect(global.WebSocket).toHaveBeenCalledTimes(1);

      service.startReceiving(testAccount); // Second call
      expect(global.WebSocket).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it("should not create a WebSocket if no handlers are registered for the account", () => {
      const newAccount = "no-handler-account";
      // Ensure no handlers for newAccount by clearing and not re-registering for it
      service.clearHandlers();

      service.startReceiving(newAccount);

      expect(global.WebSocket).not.toHaveBeenCalled();
      expect((service as any).isReceiving).not.toContain(newAccount);
      expect((service as any).accountSockets.has(newAccount)).toBe(false);
    });

    it("should re-register a handler for the test account after clearing for other tests", () => {
      // This test is to ensure that the default testAccount handler is back for subsequent tests
      // if it was cleared by 'no handlers registered' test.
      service.clearHandlers();
      service.registerHandler(testAccount, /.*/, jest.fn());
      service.startReceiving(testAccount);
      const expectedUrl = `${testApiUrl}/v1/receive/${testAccount}`;
      expect(global.WebSocket).toHaveBeenCalledWith(expectedUrl);
    });
  });

  describe("stopReceiving", () => {
    const testAccount = "test-account-ws-stop";
    const testApiUrl = "ws://localhost:8080";

    beforeEach(() => {
      // Register a handler and start receiving to have an active socket
      service.registerHandler(testAccount, /.*/, jest.fn());
      service.startReceiving(testAccount);
      // Ensure mockWebSocketInstance is populated by startReceiving
      // This relies on the global mock correctly assigning to mockWebSocketInstance
    });

    afterEach(() => {
      service.stopAllReceiving(); // Clean up any remaining listeners
      jest.restoreAllMocks();
    });

    it("should close the WebSocket and remove account from internal state", () => {
      const currentSocketInstance = (service as any).accountSockets.get(
        testAccount,
      );
      expect(currentSocketInstance).toBeDefined(); // Ensure socket exists before stopping

      service.stopReceiving(testAccount);

      expect(currentSocketInstance.close).toHaveBeenCalledTimes(1);
      expect((service as any).isReceiving).not.toContain(testAccount);
      expect((service as any).accountSockets.has(testAccount)).toBe(false);
    });

    it("should not throw and not call close if listener is not active", () => {
      const inactiveAccount = "inactive-account";
      // Ensure no socket instance is mistakenly retrieved or methods called on undefined
      const currentSocketInstance = (service as any).accountSockets.get(
        testAccount,
      ); // Get the active one

      service.stopReceiving(inactiveAccount); // Try to stop an inactive one

      expect(currentSocketInstance.close).not.toHaveBeenCalled(); // The active one should not be closed
      // No specific close check for inactiveAccount as it shouldn't have a socket

      // Verify internal state remains consistent for the active account
      expect((service as any).isReceiving).toContain(testAccount);
      expect((service as any).accountSockets.has(testAccount)).toBe(true);
    });

    it("should do nothing if called multiple times on the same stopped account", () => {
      const currentSocketInstance = (service as any).accountSockets.get(
        testAccount,
      );
      service.stopReceiving(testAccount); // First stop
      expect(currentSocketInstance.close).toHaveBeenCalledTimes(1);

      service.stopReceiving(testAccount); // Second stop
      expect(currentSocketInstance.close).toHaveBeenCalledTimes(1); // Should still be 1

      expect((service as any).isReceiving).not.toContain(testAccount);
      expect((service as any).accountSockets.has(testAccount)).toBe(false);
    });
  });

  describe("stopAllReceiving", () => {
    const account1 = "multi-stop-account1";
    const account2 = "multi-stop-account2";
    let socket1: MockWebSocket | undefined;
    let socket2: MockWebSocket | undefined;

    beforeEach(() => {
      // Setup for account1
      service.registerHandler(account1, /.*/, jest.fn());
      service.startReceiving(account1);
      socket1 = (service as any).accountSockets.get(account1);

      // Setup for account2
      // Need to ensure the global mock will return a *new* instance for the second call
      (global.WebSocket as unknown as jest.Mock).mockImplementationOnce(
        (url: string) => {
          const newSock = new MockWebSocket(url);
          mockWebSocketInstance = newSock; // Update global ref if needed by other parts, though direct ref is better
          return newSock as any;
        },
      );
      service.registerHandler(account2, /.*/, jest.fn());
      service.startReceiving(account2);
      socket2 = (service as any).accountSockets.get(account2);

      // Restore the default implementation for any subsequent WebSocket creations if necessary
      // This is tricky because startReceiving in these tests uses the return of the mockImplementation
      // The mockWebSocketInstance will be the last one created (socket2 here)
      // For checking close calls, we stored socket1 and socket2 explicitly.
      (global.WebSocket as unknown as jest.Mock).mockImplementation(
        (url: string) => {
          mockWebSocketInstance = new MockWebSocket(url);
          return mockWebSocketInstance as any;
        },
      );
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should close all active WebSockets and clear internal state", () => {
      expect((service as any).isReceiving.length).toBe(2);
      expect((service as any).accountSockets.size).toBe(2);
      expect(socket1).toBeDefined();
      expect(socket2).toBeDefined();

      service.stopAllReceiving();

      expect(socket1?.close).toHaveBeenCalledTimes(1);
      expect(socket2?.close).toHaveBeenCalledTimes(1);
      expect((service as any).isReceiving.length).toBe(0);
      expect((service as any).accountSockets.size).toBe(0);
    });

    it("should do nothing if no listeners are active", () => {
      // First, stop them all to be sure
      service.stopAllReceiving();

      // Clear mocks from the previous stopAllReceiving call
      socket1?.close.mockClear();
      socket2?.close.mockClear();

      expect((service as any).isReceiving.length).toBe(0);
      expect((service as any).accountSockets.size).toBe(0);

      service.stopAllReceiving(); // Call again when empty

      expect(socket1?.close).not.toHaveBeenCalled();
      expect(socket2?.close).not.toHaveBeenCalled();
      expect((service as any).isReceiving.length).toBe(0);
      expect((service as any).accountSockets.size).toBe(0);
    });
  });
});
