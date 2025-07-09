import { SignalClient } from "../SignalClient";

export interface ReceiveOptions {
  timeout?: string;
  ignore_attachments?: string;
  ignore_stories?: string;
  max_messages?: string;
  send_read_receipts?: string;
}

export interface MessageContext {
  message: string;
  sourceUuid: string;
  rawMessage: object; // type this out..
  account: string;
  client?: SignalClient;
  reply: (message: string) => Promise<void>;
  react: (emoji: string) => Promise<void>;
}
