class SignalApiServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = "SignalApiServiceError";
  }
}

export { SignalApiServiceError };
