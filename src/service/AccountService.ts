import { ApiServiceError } from "../errors/ApiServiceError";
import {
  SetPinRequest,
  UpdateAccountSettingsRequest,
  UsernameInfo,
} from "../types/Account";
import { RestService } from "./RestService";

class AccountService extends RestService {
  getAccounts = async (): Promise<string[]> => {
    let response;
    try {
      response = await fetch(this.getAPI() + "/v1/accounts");
    } catch (e) {
      throw this.unknownError(e);
    }
    if (response.status === 200) {
      return (await response.json()) as string[];
    } else {
      const errorMessage = await response.text();
      throw new ApiServiceError(errorMessage, response.status);
    }
  };

  setUsername = async (
    account: string,
    newName: string,
  ): Promise<UsernameInfo> => {
    let response;
    try {
      response = await fetch(
        this.getAPI() + "/v1/accounts/" + account + "/username",
        {
          method: "POST",
          body: JSON.stringify({ username: newName }),
        },
      );
    } catch (e) {
      throw this.unknownError(e);
    }

    if (!response.ok) {
      const error = await response.text();
      throw new ApiServiceError(error, response.status);
    }
    return (await response.json()) as UsernameInfo;
  };

  deleteUsername = async (account: string): Promise<void> => {
    let response;
    try {
      response = await fetch(
        this.getAPI() + "/v1/accounts/" + account + "/username",
        {
          method: "DELETE",
        },
      );
    } catch (e) {
      throw this.unknownError(e);
    }

    if (!response.ok) {
      const error = await response.text();
      throw new ApiServiceError(error, response.status);
    }
  };

  updateAccountSettings = async (
    account: string,
    updateSettings: UpdateAccountSettingsRequest,
  ): Promise<void> => {
    let response;
    try {
      response = await fetch(
        this.getAPI() + "/v1/accounts/" + account + "/settings",
        {
          method: "PUT",
          body: JSON.stringify(updateSettings),
        },
      );
    } catch (e) {
      throw this.unknownError(e);
    }

    if (response.status !== 204) {
      const error = await response.text();
      throw new ApiServiceError(error, response.status);
    }
  };

  setPin = async (account: string, pin: SetPinRequest): Promise<void> => {
    let response;
    try {
      response = await fetch(
        this.getAPI() + "/v1/accounts/" + account + "/pin",
        {
          method: "POST",
          body: JSON.stringify(pin),
        },
      );
    } catch (e) {
      throw this.unknownError(e);
    }

    if (!response.ok) {
      const error = await response.text();
      throw new ApiServiceError(error, response.status);
    }
  };

  removePin = async (account: string): Promise<void> => {
    let response;
    try {
      response = await fetch(
        this.getAPI() + "/v1/accounts/" + account + "/pin",
        {
          method: "DELETE",
        },
      );
    } catch (e) {
      throw this.unknownError(e);
    }

    if (response.status !== 204) {
      const error = await response.text();
      throw new ApiServiceError(error, response.status);
    }
  };
}

export { AccountService };
