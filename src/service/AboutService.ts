import { Service } from "./Service";
import { AboutInfo } from "../types/About";
import { ApiServiceError } from "../errors/ApiServiceError"; // Import ApiServiceError

class AboutService extends Service {
  aboutServer = async (): Promise<AboutInfo> => {
    try {
      const response = await fetch(this.getAPI() + "/v1/about"); // Added await here
      if (!response.ok) { // Check if the response is ok
        const errorText = await response.text();
        throw new ApiServiceError(errorText, response.status);
      }
      return response.json() as AboutInfo; // No need for (await response).json() due to await above
    } catch (e) {
      throw this.unknownError(e);
    }
  };
}

export { AboutService };
