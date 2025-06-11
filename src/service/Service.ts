import { ApiServiceError } from "../errors/ApiServiceError";

class Service {
  API = "";

  constructor(api: string) {
    this.setAPI(api);
  }

  getAPI = () => {
    return this.API;
  };

  setAPI = (api: string): void => {
    this.API = api;
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



export { Service };
