class CustomError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "CustomError";
    this.statusCode = statusCode;
  }
}

export const errorHandler = (
  statusCode: number,
  message: string
): CustomError => {
  return new CustomError(statusCode, message);
};
