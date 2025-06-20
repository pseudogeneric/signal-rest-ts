import {
  Reaction,
  Receipt,
  SendMessageResponse,
  SendMessageV2,
} from "../types/Message";
import { RestService } from "./RestService";
import { ApiServiceError } from "../errors/ApiServiceError";

class MessageService extends RestService {
  sendMessage = async (
    message: SendMessageV2,
  ): Promise<SendMessageResponse> => {
    let response;
    try {
      response = await fetch(this.getAPI() + "/v2/send", {
        method: "POST",
        body: JSON.stringify(message),
      });
    } catch (e) {
      throw this.unknownError(e);
    }

    if (!response.ok) {
      const error = await response.text();
      throw new ApiServiceError(error, response.status);
    }
    return (await response.json()) as SendMessageResponse;
  };

  showTypingIndicator = async (
    account: string,
    recipient: string,
  ): Promise<void> => {
    let response;
    try {
      response = await fetch(
        this.getAPI() + "/v1/typing-indicator/" + account,
        {
          method: "PUT",
          body: JSON.stringify({ recipient: recipient }),
        },
      );
    } catch (e) {
      throw this.unknownError(e);
    }
    if (!response.ok) {
      const error = await response.text();
      throw new ApiServiceError(error, response.status);
    }
  };

  hideTypingIndicator = async (
    account: string,
    recipient: string,
  ): Promise<void> => {
    let response;
    try {
      response = await fetch(
        this.getAPI() + "/v1/typing-indicator/" + account,
        {
          method: "DELETE",
          body: JSON.stringify({ recipient: recipient }),
        },
      );
    } catch (e) {
      throw this.unknownError(e);
    }
    if (!response.ok) {
      const error = await response.text();
      throw new ApiServiceError(error, response.status);
    }
  };

  addReaction = async (account: string, reaction: Reaction): Promise<void> => {
    let response;
    try {
      response = await fetch(this.getAPI() + "/v1/reactions/" + account, {
        method: "POST",
        body: JSON.stringify(reaction),
      });
    } catch (e) {
      throw this.unknownError(e);
    }

    if (!response.ok) {
      const error = await response?.text();
      throw new ApiServiceError(error, response?.status);
    }
  };

  removeReaction = async (
    account: string,
    reaction: Reaction,
  ): Promise<void> => {
    let response;
    try {
      response = await fetch(this.getAPI() + "/v1/reactions/" + account, {
        method: "DELETE",
        body: JSON.stringify(reaction),
      });
    } catch (e) {
      throw this.unknownError(e);
    }

    if (!response.ok) {
      const error = await response?.text();
      throw new ApiServiceError(error, response?.status);
    }
  };

  sendReadReceipt = async (
    account: string,
    receipt: Receipt,
  ): Promise<void> => {
    let response;
    try {
      response = await fetch(this.getAPI() + "/v1/receipts/" + account, {
        method: "POST",
        body: JSON.stringify(receipt),
      });
    } catch (e) {
      throw this.unknownError(e);
    }

    if (!response.ok) {
      const error = await response?.text();
      throw new ApiServiceError(error, response?.status);
    }
  };
}

export { MessageService };
