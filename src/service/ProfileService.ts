import { RestService } from "./RestService";
import { SignalApiServiceError } from "../errors/SignalApiServiceError";
import { UpdateProfileRequest } from "../types/Profile";

class ProfileService extends RestService {
  updateProfile = async (
    account: string,
    profileUpdate: UpdateProfileRequest,
  ): Promise<void> => {
    let response;
    try {
      response = await fetch(this.getAPI() + "/v1/profiles/" + account, {
        method: "PUT",
        body: JSON.stringify(profileUpdate),
      });
    } catch (e) {
      throw this.unknownError(e);
    }

    if (response.status !== 204) {
      const error = await response.text();
      throw new SignalApiServiceError(error, response.status);
    }
  };
}

export { ProfileService };
