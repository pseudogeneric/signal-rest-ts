export interface LinkPreviewType {
  base64_thumbnail?: string;
  description?: string;
  title?: string;
  url?: string;
}

export interface MessageMention {
  author?: string;
  length?: number;
  start?: number;
}

export interface SendMessageV2 {
  base64_attachments?: string[];
  edit_timestamp?: number;
  link_preview?: LinkPreviewType;
  mentions?: MessageMention[];
  message: string;
  notify_self?: boolean;
  number: string;
  quote_author?: string;
  quote_mentions?: MessageMention[];
  quote_message?: string;
  quote_timestamp?: number;
  recipients?: string[];
  sticker?: string;
  text_mode?: "normal" | "styled";
}
export interface SendMessageResponse {
  timestamp: string;
}

export interface Reaction {
  reaction: string;
  recipient: string;
  target_author: string;
  timestamp: number;
}

export interface Receipt {
  receipt_type: "read" | "viewed";
  recipient: string;
  timestamp: number;
}
