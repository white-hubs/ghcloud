import { describe, expect, test } from "bun:test";

import { describeApiError } from "./api-error";

class FakeAbstractServiceError extends Error {
  public constructor(
    public readonly errorCode: string,
    public readonly errorMessage: string,
  ) {
    // 复刻 @ghcloud/cube-gateway 的 AbstractServiceError：super() 不传 message，
    // 真正文案落在 errorMessage 上（这正是 describeApiError 要修的坑）。
    super();
  }
}

describe("describeApiError", () => {
  test("extracts errorMessage from a ServiceError-shaped object (message is empty)", () => {
    const error = new FakeAbstractServiceError("INVALID_ARGUMENT_DESCRIPTOR_NAME", "name 必须是合法 slug");
    expect(error.message).toBe("");
    expect(describeApiError(error)).toBe("name 必须是合法 slug");
  });

  test("falls back to Error.message for plain errors", () => {
    expect(describeApiError(new Error("network down"))).toBe("network down");
  });

  test("falls back to String(error) for non-Error values", () => {
    expect(describeApiError("boom")).toBe("boom");
    expect(describeApiError({ foo: "bar" })).toBe("[object Object]");
  });

  test("ignores an empty errorMessage and falls back", () => {
    const error = new FakeAbstractServiceError("UNKNOWN", "");
    expect(describeApiError(error)).toBe(String(error));
  });
});
