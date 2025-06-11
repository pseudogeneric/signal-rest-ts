import { SendMessageResponse, SendMessageV2 } from "../types/Message";
import { Service } from "./Service";

class MessageService extends Service {
  sendMessage = async (
    message: SendMessageV2
  ): Promise<SendMessageResponse | APIError> => {
    try {
      const response = await fetch(this.getAPI() + "/v2/send", {
        method: "POST",
        body: JSON.stringify(message),
      });
      if (response.status !== 201) {
        const error = await response.text();
        return { message: error, statusCode: response.status } as APIError;
      }
      return await response.json() as SendMessageResponse;
    } catch (e) {
      return this.unknownError(e);
    }
  };
}

export { MessageService };
