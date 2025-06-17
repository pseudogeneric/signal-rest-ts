export {};

// Define a basic MockWebSocket class
class BasicMockWebSocket {
  url: string | URL;
  onmessage: ((event: { data: any }) => void) | null = null;
  onopen = jest.fn();
  onerror = jest.fn();
  close = jest.fn();
  send = jest.fn();

  constructor(url: string | URL) {
    this.url = url;
    // Simulating async connection opening
    setTimeout(() => {
      if (this.onopen) {
        this.onopen();
      }
    }, 0);
  }

  // Method to simulate receiving a message
  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage({ data });
    }
  }

  // Method to simulate an error
  simulateError(error: any) {
    if (this.onerror) {
      this.onerror(error);
    }
  }
}

declare global {
  namespace NodeJS {
    interface Global {
      fetch: any;
      WebSocket: any; // Add WebSocket to global type
    }
  }
  // Also declare WebSocket on window for environments that might check it (though less common for node)
  interface Window {
    WebSocket: any;
  }
}

if (typeof global.WebSocket === "undefined") {
  (global as any).WebSocket = BasicMockWebSocket;
}
if (typeof window !== "undefined" && typeof window.WebSocket === "undefined") {
  (window as any).WebSocket = BasicMockWebSocket;
}

global.fetch = jest.fn();
