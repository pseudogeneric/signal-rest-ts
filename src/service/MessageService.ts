import { SendMessageResponse, SendMessageV2 } from "../types/Message";
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
}

export { MessageService };
