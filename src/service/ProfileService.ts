import { Service } from "./Service";

class ProfileService extends Service {
  updateProfile = async (
    number: string,
    profileUpdate: UpdateProfileRequest
  ): Promise<void | APIError> => {
    try {
      const response = await fetch(this.getAPI() + "/v1/profiles" + number, {
        method: "PUT",
        body: JSON.stringify(profileUpdate),
      });
      if (response.status !== 204) {
        const error = await response.text();
        return { message: error, statusCode: response.status } as APIError;
      }
    } catch (e) {
        this.unknownError();
    }
  };
}

export { ProfileService };
