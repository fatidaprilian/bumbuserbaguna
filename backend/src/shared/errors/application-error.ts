export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export class ApplicationError extends Error {
  public readonly errorCode: ErrorCode;
  public readonly isOperational: boolean;

  constructor(errorCode: ErrorCode, message: string, isOperational = true) {
    super(message);
    this.name = "ApplicationError";
    this.errorCode = errorCode;
    this.isOperational = isOperational;
  }
}
