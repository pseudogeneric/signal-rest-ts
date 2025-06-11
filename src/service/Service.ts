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
    throw new ApiServiceError(e || "Unknown Error", -1);
  };
}



export { Service };
