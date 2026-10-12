import { BadRequestException } from "@dangao/bun-server";

import { loadAppConfig } from "../config/app.config";
import type { FetchArticleRequest, FetchCommonOptions, FetchIndexRequest } from "../contracts/types";

function isProvided(value: unknown): boolean {
  return value !== undefined && value !== null;
}

function readCommonOptions(record: Record<string, unknown>): FetchCommonOptions {
  const config = loadAppConfig();
  const options: FetchCommonOptions = {};

  if (isProvided(record.timeoutMs)) {
    if (
      typeof record.timeoutMs !== "number" ||
      !Number.isInteger(record.timeoutMs) ||
      record.timeoutMs < 1000 ||
      record.timeoutMs > config.maxTimeoutMs
    ) {
      throw new BadRequestException(`timeoutMs must be between 1000 and ${config.maxTimeoutMs}`);
    }
    options.timeoutMs = record.timeoutMs;
  }

  if (isProvided(record.maxRedirects)) {
    if (
      typeof record.maxRedirects !== "number" ||
      !Number.isInteger(record.maxRedirects) ||
      record.maxRedirects < 0 ||
      record.maxRedirects > config.maxRedirects
    ) {
      throw new BadRequestException(`maxRedirects must be between 0 and ${config.maxRedirects}`);
    }
    options.maxRedirects = record.maxRedirects;
  }

  if (isProvided(record.userAgent)) {
    if (typeof record.userAgent !== "string" || record.userAgent.trim() === "") {
      throw new BadRequestException("userAgent must be a non-empty string");
    }
    options.userAgent = record.userAgent.trim();
  }

  if (isProvided(record.includeRaw)) {
    if (typeof record.includeRaw !== "boolean") {
      throw new BadRequestException("includeRaw must be a boolean");
    }
    options.includeRaw = record.includeRaw;
  }

  return options;
}

function readUrl(record: Record<string, unknown>): string {
  const url = record.url;
  if (typeof url !== "string" || url.trim() === "") {
    throw new BadRequestException("url is required");
  }
  return url.trim();
}

export function validateFetchIndexRequest(body: unknown): FetchIndexRequest {
  if (typeof body !== "object" || body === null) {
    throw new BadRequestException("Request body must be a JSON object");
  }

  const record = body as Record<string, unknown>;
  const limit = record.limit;
  if (typeof limit !== "number" || !Number.isInteger(limit)) {
    throw new BadRequestException("limit must be an integer");
  }

  const config = loadAppConfig();
  if (limit < 1 || limit > config.maxLimit) {
    throw new BadRequestException(`limit must be between 1 and ${config.maxLimit}`);
  }

  return {
    url: readUrl(record),
    limit,
    ...readCommonOptions(record),
  };
}

export function validateFetchArticleRequest(body: unknown): FetchArticleRequest {
  if (typeof body !== "object" || body === null) {
    throw new BadRequestException("Request body must be a JSON object");
  }

  const record = body as Record<string, unknown>;
  const request: FetchArticleRequest = {
    url: readUrl(record),
    ...readCommonOptions(record),
  };

  if (isProvided(record.prompt)) {
    if (typeof record.prompt !== "string" || record.prompt.trim() === "") {
      throw new BadRequestException("prompt must be a non-empty string");
    }
    request.prompt = record.prompt.trim();
  }

  return request;
}
