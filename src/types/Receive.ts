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
  replyTo: string; // where reply or react handlers will respond (user if DM, group if group)
  client?: SignalClient;
  reply: (message: string, attachments?: string[]) => Promise<void>;
  react: (emoji: string) => Promise<void>;
}
