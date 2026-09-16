import type { ErrorRequestHandler } from "express";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const statusCode = typeof error?.statusCode === "number" ? error.statusCode : 500;
  const message = statusCode === 500 ? "Internal server error" : error.message;

  if (statusCode === 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    success: false,
    message,
  });
};
