import { ApiServiceError } from "../errors/ApiServiceError";
import { SetPinRequest, UpdateAccountSettingsRequest, UsernameInfo } from "../types/Account";
import { Service } from "./Service";

class AccountService extends Service {
  getAccounts = async (): Promise<string[]> => {
    try {
      const response = await fetch(this.getAPI() + "/v1/accounts");
      if (response.status === 200) {
        return (await response.json()) as string[];
      } else {
        const errorMessage = await response.text();
        throw new ApiServiceError(errorMessage, response.status);
      }
    } catch (e) {
      throw this.unknownError(e);
    }
  };

  setUsername = async (
    number: string,
    newName: string
  ): Promise<UsernameInfo> => {
    try {
      const response = await fetch(
        this.getAPI() + "/v1/accounts/" + number + "/username",
        {
          method: "POST",
          body: JSON.stringify({ username: newName }),
        }
      );
      if (!response.ok) {
        const error = await response.text();
        throw new ApiServiceError(error, response.status);
      }
      return (await response.json()) as UsernameInfo;
    } catch (e) {
      throw this.unknownError(e);
    }
  };

  deleteUsername = async (number: string): Promise<void> => {
    try {
      const response = await fetch(this.getAPI() + "/v1/accounts/" + number + "/username", {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.text();
        throw new ApiServiceError(error, response.status);
      }
    } catch (e) {
      throw this.unknownError(e);
    }
  };

  updateAccountSettings = async (
    number: string,
    updateSettings: UpdateAccountSettingsRequest
  ): Promise<void> => {
    try {
      const response = await fetch(
        this.getAPI() + "/v1/accounts/" + number + "/settings",
        {
          method: "PUT",
          body: JSON.stringify(updateSettings),
        }
      );
      if (response.status !== 204) {
        const error = await response.text();
        throw new ApiServiceError(error, response.status);
      }
    } catch (e) {
      throw this.unknownError(e);
    }
  };

  setPin = async (
    number: string,
    pin: SetPinRequest
  ): Promise<void> => {
    try {
      const response = await fetch(
        this.getAPI() + "/v1/accounts/" + number + "/pin",
        {
          method: "POST",
          body: JSON.stringify(pin),
        }
      );
      if (!response.ok) {
        const error = await response.text();
        throw new ApiServiceError(error, response.status);
      }
    } catch (e) {
      throw this.unknownError(e);
    }
  };

  removePin = async (number: string): Promise<void> => {
    try {
      const response = await fetch(
        this.getAPI() + "/v1/accounts/" + number + "/pin",
        {
          method: "DELETE",
        }
      );
      if (response.status !== 204) {
        const error = await response.text();
        throw new ApiServiceError(error, response.status);
      }
    } catch (e) {
      throw this.unknownError(e);
    }
  };

}

export { AccountService };
