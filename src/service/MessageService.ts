import { SendMessageResponse, SendMessageV2 } from "../types/Message";
import { Service } from "./Service";
import ApiServiceError from "../errors/ApiServiceError";

class MessageService extends Service {
  sendMessage = async (
    message: SendMessageV2
  ): Promise<SendMessageResponse> => {
    try {
      const response = await fetch(this.getAPI() + "/v2/send", {
        method: "POST",
        body: JSON.stringify(message),
      });
      if (response.status !== 201) {
        const error = await response.text();
        throw new ApiServiceError(error, response.status);
      }
      return await response.json() as SendMessageResponse;
    } catch (e) {
      throw this.unknownError(e);
    }
  };
}

export { MessageService };
