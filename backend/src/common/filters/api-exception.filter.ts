import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";
import type { Response } from "express";
import { AppError } from "../errors/app-error";

type ErrorBody = {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPrismaUniqueError(error: unknown): boolean {
  return isRecord(error) && error.code === "P2002";
}

function getValidationFields(error: BadRequestException) {
  const response = error.getResponse();

  if (!isRecord(response) || !Array.isArray(response.message)) {
    return undefined;
  }

  return {
    request: response.message.filter(
      (message): message is string => typeof message === "string",
    ),
  };
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = this.getStatus(exception);
    const body = this.getBody(exception, status);

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error(exception);
    }

    response.status(status).json(body);
  }

  private getStatus(exception: unknown): number {
    if (exception instanceof AppError) {
      return exception.status;
    }

    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (isPrismaUniqueError(exception)) {
      return HttpStatus.CONFLICT;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getBody(exception: unknown, status: number): ErrorBody {
    if (exception instanceof AppError) {
      return {
        error: {
          code: exception.code,
          message: exception.message,
        },
      };
    }

    if (exception instanceof BadRequestException) {
      return {
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed.",
          fields: getValidationFields(exception),
        },
      };
    }

    if (exception instanceof UnauthorizedException) {
      return {
        error: {
          code: "AUTHENTICATION_REQUIRED",
          message: "Authentication is required.",
        },
      };
    }

    if (isPrismaUniqueError(exception)) {
      return {
        error: {
          code: "EMAIL_ALREADY_EXISTS",
          message: "A user with this email already exists.",
        },
      };
    }

    return {
      error: {
        code:
          status === HttpStatus.INTERNAL_SERVER_ERROR
            ? "INTERNAL_ERROR"
            : "RESOURCE_NOT_FOUND",
        message:
          status === HttpStatus.INTERNAL_SERVER_ERROR
            ? "An unexpected error occurred."
            : "Resource not found.",
      },
    };
  }
}
