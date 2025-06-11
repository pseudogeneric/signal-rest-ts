import { Service } from "./Service";
import { AboutInfo } from "../types/About";

class AboutService extends Service {
  aboutServer = async (): Promise<AboutInfo | APIError> => {
    try {
      const response = fetch(this.getAPI() + "/v1/about");
      return (await response).json() as AboutInfo;
    } catch (e) {
      return { message: "Unknown Error", statusCode: -1 } as APIError;
    }
  };
}

export { AboutService };
