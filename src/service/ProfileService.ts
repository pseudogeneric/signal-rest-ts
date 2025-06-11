import { Service } from "./Service";
import ApiServiceError from "../errors/ApiServiceError";
import { UpdateProfileRequest } from "../types/Profile"; // Assuming this path

class ProfileService extends Service {
  updateProfile = async (
    number: string,
    profileUpdate: UpdateProfileRequest
  ): Promise<void> => {
    try {
      const response = await fetch(this.getAPI() + "/v1/profiles/" + number, { // Added missing slash
        method: "PUT",
        body: JSON.stringify(profileUpdate),
      });
      if (response.status !== 204) {
        const error = await response.text();
        throw new ApiServiceError(error, response.status);
      }
    } catch (e) {
        throw this.unknownError(e); // Pass error and throw
    }
  };
}

export { ProfileService };
