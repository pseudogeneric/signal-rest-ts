import { RestService } from "./RestService";
import { ApiServiceError } from "../errors/ApiServiceError";
import { UpdateProfileRequest } from "../types/Profile";

class ProfileService extends RestService {
  updateProfile = async (
    number: string,
    profileUpdate: UpdateProfileRequest,
  ): Promise<void> => {
    try {
      const response = await fetch(this.getAPI() + "/v1/profiles/" + number, {
        method: "PUT",
        body: JSON.stringify(profileUpdate),
      });
      if (response.status !== 204) {
        const error = await response.text();
        throw new ApiServiceError(error, response.status);
      }
    } catch (e) {
      throw this.unknownError(e);
    }
  };
}

export { ProfileService };
