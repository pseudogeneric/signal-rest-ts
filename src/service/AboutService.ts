import { Service } from "./Service";
import { AboutInfo } from "../types/About";

class AboutService extends Service {
  aboutServer = async (): Promise<AboutInfo> => {
    try {
      const response = fetch(this.getAPI() + "/v1/about");
      return (await response).json() as AboutInfo;
    } catch (e) {
      throw this.unknownError(e);
    }
  };
}

export { AboutService };
