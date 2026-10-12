import { HttpException } from "@dangao/bun-server";

export type FetchErrorCode =
  | "FETCH_SSRF_BLOCKED"
  | "FETCH_INVALID_URL"
  | "FETCH_BODY_TOO_LARGE"
  | "FETCH_REQUEST_BODY_TOO_LARGE"
  | "FETCH_NETWORK_ERROR"
  | "FETCH_TIMEOUT"
  | "FETCH_REDIRECT_ERROR"
  | "FETCH_BOT_CHALLENGE";

export class FetchHttpException extends HttpException {
  public readonly fetchCode: FetchErrorCode;

  public constructor(status: number, message: string, fetchCode: FetchErrorCode) {
    super(status, message);
    this.fetchCode = fetchCode;
  }
}

export class FetchSsrfError extends FetchHttpException {
  public constructor(message = "SSRF blocked: target resolves to a forbidden address") {
    super(403, message, "FETCH_SSRF_BLOCKED");
  }
}

export class FetchUrlError extends FetchHttpException {
  public constructor(message: string) {
    super(400, message, "FETCH_INVALID_URL");
  }
}

export class FetchBodyTooLargeError extends FetchHttpException {
  public constructor(maxBytes: number) {
    super(413, `Response body exceeds limit of ${maxBytes} bytes`, "FETCH_BODY_TOO_LARGE");
  }
}

export class FetchRequestBodyTooLargeError extends FetchHttpException {
  public constructor(maxBytes: number) {
    super(413, `request body exceeds limit of ${maxBytes} bytes`, "FETCH_REQUEST_BODY_TOO_LARGE");
  }
}

export class FetchNetworkError extends FetchHttpException {
  public constructor(message: string) {
    super(502, message, "FETCH_NETWORK_ERROR");
  }
}

export class FetchTimeoutError extends FetchHttpException {
  public constructor(timeoutMs: number) {
    super(502, `Request timed out after ${timeoutMs}ms`, "FETCH_TIMEOUT");
  }
}

export class FetchRedirectError extends FetchHttpException {
  public constructor(message: string) {
    super(400, message, "FETCH_REDIRECT_ERROR");
  }
}

export class FetchBotChallengeError extends FetchHttpException {
  public constructor(message: string) {
    super(502, message, "FETCH_BOT_CHALLENGE");
  }
}
