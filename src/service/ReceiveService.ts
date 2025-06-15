import { SignalClient } from "../SignalClient";
import { MessageContext } from "../types/Receive";
import { RestService } from "./RestService";

type MessageHandler = (ctx: MessageContext) => Promise<void>;

interface MessageHandlerRegistration {
  id: symbol;
  handler: MessageHandler;
}

class ReceiveService extends RestService {
  private handlerStore: Map<string, Map<RegExp, MessageHandlerRegistration[]>> =
    new Map();
  private handlerGuid: number = 0;
  private isReceiving: string[] = [];
  private accountSockets: Map<string, WebSocket> = new Map();

  registerHandler = (
    account: string,
    pattern: RegExp,
    callback: MessageHandler,
  ): (() => void) => {
    if (!this.handlerStore.has(account)) {
      this.handlerStore.set(account, new Map());
    }
    const patternMap = this.handlerStore.get(account)!;
    if (!patternMap.has(pattern)) {
      patternMap.set(pattern, []);
    }
    const handlers = patternMap.get(pattern)!;
    const handlerId = Symbol("handler#" + this.handlerGuid++);
    handlers.push({
      id: handlerId,
      handler: callback,
    });

    // click here to unsubscribe
    return (): void => {
      const handlers = patternMap.get(pattern) || [];
      const handlerIndex = handlers.findIndex((mhr) => mhr.id === handlerId);
      if (handlerIndex >= 0) handlers.splice(handlerIndex, 1);
    };
  };

  clearHandlers = (): void => {
    this.handlerStore = new Map();
  };

  processMessage = (message: any) => {
    if (message.envelope && message.envelope.dataMessage) {
      const dm = message.envelope.dataMessage;
      const patternMap: Map<RegExp, MessageHandlerRegistration[]> =
        this.handlerStore.get(message.account) || new Map();
      patternMap.forEach((register, pattern) => {
        if (pattern instanceof RegExp && pattern.test(dm.message)) {
          Promise.all(
            register.map((registration) => {
              registration.handler({
                message: dm.message,
                account: message.account,
                sourceUuid: message.envelope.sourceUuid,
                rawMessage: message,
                reply: async (r: string) => {
                  await this.getClient()
                    ?.message()
                    .sendMessage({
                      number: message.account,
                      message: r,
                      recipients: [message.envelope.sourceUuid],
                    });
                },
                client: this.getClient(),
              });
            }),
          ).catch((error) => {
            console.error(error);
          });
        }
      });
    }
  };

  startReceiving = (account: string): void => {
    if (this.isReceiving.includes(account) || !this.handlerStore.has(account))
      return;
    this.isReceiving.push(account);
    const accountSocket = new WebSocket(
      this.getAPI() + "/v1/receive/" + account,
    );
    accountSocket.onmessage = (event: MessageEvent) => {
      this.processMessage(JSON.parse(event.data));
    };
    this.accountSockets.set(account, accountSocket);
  };

  stopReceiving = (account: string): void => {
    if (!this.isReceiving.includes(account)) return;
    this.accountSockets.get(account)?.close();
    this.accountSockets.delete(account);
    const listenerIndex = this.isReceiving.findIndex((a) => a === account);
    if (listenerIndex >= 0) this.isReceiving.splice(listenerIndex, 1);
  };

  stopAllReceiving = (): void => {
    this.accountSockets.forEach((socket, account) => {
      socket.close();
      this.isReceiving = this.isReceiving.filter((a) => {
        return a !== account;
      });
    });
  };
}

export { ReceiveService };
