import { SetPinRequest, UpdateAccountSettingsRequest } from "../types/Account";
import { Service } from "./Service";

interface UsernameInfo {
  username?: string;
  username_link?: string;
}

class AccountService extends Service {
  getAccounts = async (): Promise<string[] | APIError> => {
    try {
      const response = await fetch(this.getAPI() + "/v1/accounts");
      if (response.status === 200) {
        return (await response.json()) as string[];
      } else {
        const errorMessage = await response.text();
        return {
          message: errorMessage,
          statusCode: response.status,
        } as APIError;
      }
    } catch (e) {
      return this.unknownError();
    }
  };

  setUsername = async (
    number: string,
    newName: string
  ): Promise<UsernameInfo | APIError> => {
    try {
      const response = await fetch(
        this.getAPI() + "/v1/accounts/" + number + "/username",
        {
          method: "POST",
          body: JSON.stringify({ username: newName }),
        }
      );
      return (await response.json()) as UsernameInfo;
    } catch (e) {
      return this.unknownError();
    }
  };

  deleteUsername = async (number: string): Promise<void | APIError> => {
    try {
      fetch(this.getAPI() + "/v1/accounts/" + number + "/username", {
        method: "DELETE",
      });
    } catch (e) {
      return this.unknownError();
    }
  };

  updateAccountSettings = async (
    number: string,
    updateSettings: UpdateAccountSettingsRequest
  ): Promise<void | APIError> => {
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
        return { message: error, statusCode: response.status } as APIError;
      }
    } catch (e) {
      return this.unknownError();
    }
  };

  setPin = async (
    number: string,
    pin: SetPinRequest
  ): Promise<void | APIError> => {
    try {
      const response = await fetch(
        this.getAPI() + "/v1/accounts/" + number + "/pin",
        {
          method: "POST",
          body: JSON.stringify(pin),
        }
      );
      if (response.status !== 201) {
        const error = await response.text();
        return { message: error, statusCode: response.status } as APIError;
      }
    } catch (e) {
      return this.unknownError();
    }
  };

  removePin = async (number: string): Promise<void | APIError> => {
    try {
      const response = await fetch(
        this.getAPI() + "/v1/accounts" + number + "/pin",
        {
          method: "DELETE",
        }
      );
      if (response.status !== 204) {
        const error = await response.text();
        return { message: error, statusCode: response.status } as APIError;
      }
    } catch (e) {
      return this.unknownError();
    }
  };

}

export { AccountService };
