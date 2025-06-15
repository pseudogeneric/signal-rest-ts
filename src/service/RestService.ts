import { ApiServiceError } from "../errors/ApiServiceError";
import { SignalClient } from "../SignalClient";

class RestService {
  private API: string = "";
  private client?: SignalClient;

  constructor(api: string, client: SignalClient) {
    this.setAPI(api);
    this.setClient(client);
  }

  getAPI = () => {
    return this.API;
  };

  setAPI = (api: string): void => {
    this.API = api;
  };

  getClient = () => {
    return this.client;
  };

  setClient = (client: SignalClient) => {
    this.client = client;
  };

  unknownError = (e: any): never => {
    let message = "Unknown Error";
    if (e) {
      if (e instanceof Error) {
        message = e.message;
      } else {
        message = String(e);
      }
    }
    throw new ApiServiceError(message, -1);
  };
}

export { RestService };
