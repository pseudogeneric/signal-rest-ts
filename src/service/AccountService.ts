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
      return { message: "Unknown Error", statusCode: -1 } as APIError;
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
      return { message: "Unknown Error", statusCode: -1 } as APIError;
    }
  };

  deleteUsername = async (number: string): Promise<void | APIError> => {
    try {
      fetch(this.getAPI() + "/v1/accounts/" + number + "/username", {
        method: "DELETE",
      });
    } catch (e) {
      return { message: "Unknown Error", statusCode: -1 } as APIError;
    }
  };
}

export { AccountService };
