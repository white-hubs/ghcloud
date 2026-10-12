import { HttpException, type Context, type ExceptionFilter } from "@dangao/bun-server";

import { FetchHttpException } from "../fetch-core/fetch-errors";

interface ErrorBody {
  status: number;
  code?: string;
  message: string;
  timestamp: number;
}

export class FetchErrorFilter implements ExceptionFilter {
  public catch(error: unknown, context: Context): Response | undefined {
    if (error instanceof HttpException) {
      const code = error instanceof FetchHttpException ? error.fetchCode : error.code;
      const body: ErrorBody = {
        status: error.status,
        code,
        message: error.message,
        timestamp: Date.now(),
      };
      context.setStatus(error.status);
      return context.createResponse(body, { status: error.status });
    }

    if (error instanceof Error) {
      const body: ErrorBody = {
        status: 500,
        message: "Internal Server Error",
        timestamp: Date.now(),
      };
      context.setStatus(500);
      return context.createResponse(body, { status: 500 });
    }

    return undefined;
  }
}
