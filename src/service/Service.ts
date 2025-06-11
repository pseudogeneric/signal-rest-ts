class Service {
  getAPI = () => {
    return API;
  };

  unknownError = (): APIError => {
    return {message: "Unknown Error", statusCode: -1};
  }
}

const API = "http://192.168.1.50:8080";

export { Service };
