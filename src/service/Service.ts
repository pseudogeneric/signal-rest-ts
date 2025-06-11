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

  unknownError = (e: any): APIError => {
    return {message: e || "Unknown Error", statusCode: -1};
  };
}



export { Service };
