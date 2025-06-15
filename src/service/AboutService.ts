import { RestService } from "./RestService";
import { AboutInfo } from "../types/About";
import { ApiServiceError } from "../errors/ApiServiceError";

class AboutService extends RestService {
  aboutServer = async (): Promise<AboutInfo> => {
    try {
      const response = await fetch(this.getAPI() + "/v1/about");
      if (!response.ok) {
        const errorText = await response.text();

        throw new ApiServiceError(errorText, response.status);
      }
      return response.json() as AboutInfo;
    } catch (e) {
      throw this.unknownError(e);
    }
  };
}

export { AboutService };
