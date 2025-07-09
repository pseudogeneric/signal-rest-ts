import { MessageContext, ReceiveOptions } from "../types/Receive";
import { RestService } from "./RestService";

interface MessageHandlerRegistration {
  id: symbol;
  handler: (ctx: MessageContext) => Promise<void>;
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
    callback: (ctx: MessageContext) => Promise<void>,
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

  private processMessage = (message: any) => {
    if (message.envelope && message.envelope.dataMessage) {
      const dm = message.envelope.dataMessage;
      const patternMap: Map<RegExp, MessageHandlerRegistration[]> =
        this.handlerStore.get(message.account) || new Map();

      patternMap.forEach((handlerRegistry, pattern) => {
        if (pattern instanceof RegExp && pattern.test(dm.message)) {
          Promise.all(
            handlerRegistry.map((patternHandler) => {
              const createReplyHandler = (
                account: string,
                destination: string,
              ): ((reply_text: string, quote?: boolean) => Promise<void>) => {
                return async (reply_text: string) => {
                  await this.getClient()
                    ?.message()
                    .sendMessage({
                      number: account,
                      message: reply_text,
                      recipients: [destination],
                    });
                };
              };

              const createReactionHandler = (
                account: string,
                destination: string,
                timestamp: number,
              ): ((emoji: string) => Promise<void>) => {
                return async (emoji: string) => {
                  await this.getClient()?.message().addReaction(account, {
                    reaction: emoji,
                    recipient: destination,
                    target_author: destination,
                    timestamp: timestamp,
                  });
                };
              };

              patternHandler.handler({
                message: dm.message,
                account: message.account,
                sourceUuid: message.envelope.sourceUuid,
                rawMessage: message,
                reply: createReplyHandler(
                  message.account,
                  message.envelope.sourceUuid,
                ),
                react: createReactionHandler(
                  message.account,
                  message.envelope.sourceUuid,
                  message.envelope.timestamp,
                ),
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

  private optionsToUrlString = (options: ReceiveOptions): string => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(options)) {
      params.set(key, value);
    }
    return params.toString();
  };

  startReceiving = (account: string, receiveOptions?: ReceiveOptions): void => {
    if (this.isReceiving.includes(account) || !this.handlerStore.has(account))
      return;
    try {
      let socketPath = this.getAPI() + "/v1/receive/" + account;
      if (
        receiveOptions !== undefined &&
        Object.keys(receiveOptions).length > 0
      ) {
        socketPath = socketPath.concat(
          "?" + this.optionsToUrlString(receiveOptions),
        );
      }
      const accountSocket = new WebSocket(socketPath);
      accountSocket.onmessage = (event: MessageEvent) => {
        this.processMessage(JSON.parse(event.data));
      };
      this.accountSockets.set(account, accountSocket);
      this.isReceiving.push(account);
    } catch (e) {
      throw e;
    }
  };

  stopReceiving = (account: string): void => {
    if (!this.isReceiving.includes(account)) return;
    this.accountSockets.get(account)?.close();
    if (this.accountSockets.has(account)) this.accountSockets.delete(account);
    this.accountSockets.values;
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
