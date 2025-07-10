import { RestService } from "./RestService";
import { AboutInfo } from "../types/About";
import { SignalApiServiceError } from "../errors/SignalApiServiceError";

class AboutService extends RestService {
  aboutServer = async (): Promise<AboutInfo> => {
    let response;
    try {
      response = await fetch(this.getAPI() + "/v1/about");
    } catch (e) {
      throw this.unknownError(e);
    }

    if (!response.ok) {
      const errorText = await response.text();

      throw new SignalApiServiceError(errorText, response.status);
    }
    return response.json() as AboutInfo;
  };
}

export { AboutService };
