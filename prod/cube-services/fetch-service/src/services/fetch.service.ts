import { BadRequestException, Injectable } from "@dangao/bun-server";

import type { AppConfig } from "../config/app.config";
import { loadAppConfig } from "../config/app.config";
import type { FetchArticleRequest, FetchCommonOptions, FetchIndexRequest, FetchItem, FetchResponse } from "../contracts/types";
import { applyLimit } from "../extractors/apply-limit";
import { detectContentKind } from "../extractors/detect-content-kind";
import { extractHtmlIndexItems } from "../extractors/html-index-extractor";
import { extractJsonItems } from "../extractors/json-extractor";
import { extractRssItems } from "../extractors/rss-extractor";
import { detectBotChallenge } from "../fetch-core/bot-challenge-detector";
import { decodeResponseBody, detectCharset } from "../fetch-core/content-normalizer";
import { FetchBotChallengeError } from "../fetch-core/fetch-errors";
import { fetchUrl, type FetchHttpResult } from "../fetch-core/http-client";
import { buildSinglePageItem } from "../fetch-core/single-page-item";
import { buildNormalizedContent, summarizeWebFetch, truncateItemsForPrompt } from "../fetch-core/summarize-fetched-content";
import { extractTitle } from "../fetch-core/title-extractor";

interface LoadedFetchBody {
  httpResult: FetchHttpResult;
  decodedBody: string;
  contentKind: ReturnType<typeof detectContentKind>;
  pageTitle?: string;
}

@Injectable()
export class FetchService {
  private readonly config: AppConfig;

  public constructor() {
    this.config = loadAppConfig();
  }

  public async fetchIndex(input: FetchIndexRequest): Promise<FetchResponse> {
    this.assertLimit(input.limit);
    this.assertHttpOptions(input.timeoutMs, input.maxRedirects);

    const loaded = await this.loadUrl(input);
    let rawItems: FetchItem[] = [];

    switch (loaded.contentKind) {
      case "rss":
        rawItems = extractRssItems(loaded.decodedBody);
        break;
      case "json":
        rawItems = extractJsonItems(loaded.decodedBody);
        break;
      case "html":
        rawItems = extractHtmlIndexItems(loaded.decodedBody, loaded.httpResult.finalUrl);
        break;
      default:
        throw new BadRequestException(
          `fetch/index does not support content kind "${loaded.contentKind}"; use fetch/article for single-page text`,
        );
    }

    const limited = applyLimit(rawItems, input.limit);
    const response: FetchResponse = {
      url: loaded.httpResult.finalUrl,
      contentKind: loaded.contentKind,
      items: limited.items,
      totalMatched: limited.totalMatched,
      pageTitle: loaded.pageTitle,
    };

    if (input.includeRaw) {
      response.rawBody = loaded.decodedBody;
    }

    return response;
  }

  public async fetchArticle(input: FetchArticleRequest): Promise<FetchResponse> {
    this.assertHttpOptions(input.timeoutMs, input.maxRedirects);

    const loaded = await this.loadUrl(input);
    const challenge = detectBotChallenge(loaded.decodedBody, loaded.httpResult.contentType);
    if (challenge) {
      throw new FetchBotChallengeError(
        `${challenge}. Static HTTP fetch cannot execute JavaScript; use a browser session or alternate URL (e.g. RSS).`,
      );
    }

    const item = buildSinglePageItem({
      decodedBody: loaded.decodedBody,
      contentKind: loaded.contentKind,
      finalUrl: loaded.httpResult.finalUrl,
      contentType: loaded.httpResult.contentType,
      pageTitle: loaded.pageTitle,
    });

    if (!item.content && !item.title) {
      throw new BadRequestException("unable to extract content from response body");
    }

    const prompt = input.prompt?.trim();
    const response: FetchResponse = {
      url: loaded.httpResult.finalUrl,
      contentKind: loaded.contentKind,
      items: prompt ? truncateItemsForPrompt([item], prompt) : [item],
      totalMatched: 1,
      pageTitle: loaded.pageTitle ?? item.title,
    };

    if (prompt) {
      const normalizedContent = buildNormalizedContent({
        contentKind: loaded.contentKind,
        decodedBody: loaded.decodedBody,
        contentType: loaded.httpResult.contentType,
        items: [item],
      });
      response.result = summarizeWebFetch({
        url: loaded.httpResult.finalUrl,
        prompt,
        normalizedContent,
        rawBody: loaded.decodedBody,
        contentType: loaded.httpResult.contentType,
      });
    }

    if (input.includeRaw) {
      response.rawBody = loaded.decodedBody;
    }

    return response;
  }

  private assertLimit(limit: number): void {
    if (!Number.isInteger(limit) || limit < 1 || limit > this.config.maxLimit) {
      throw new BadRequestException(`limit must be an integer between 1 and ${this.config.maxLimit}`);
    }
  }

  private assertHttpOptions(timeoutMs: number | undefined, maxRedirects: number | undefined): void {
    const resolvedTimeout = timeoutMs ?? this.config.defaultTimeoutMs;
    const resolvedRedirects = maxRedirects ?? this.config.defaultMaxRedirects;

    if (!Number.isInteger(resolvedTimeout) || resolvedTimeout < 1000 || resolvedTimeout > this.config.maxTimeoutMs) {
      throw new BadRequestException(`timeoutMs must be an integer between 1000 and ${this.config.maxTimeoutMs}`);
    }

    if (!Number.isInteger(resolvedRedirects) || resolvedRedirects < 0 || resolvedRedirects > this.config.maxRedirects) {
      throw new BadRequestException(`maxRedirects must be an integer between 0 and ${this.config.maxRedirects}`);
    }
  }

  private async loadUrl(input: FetchCommonOptions & { url: string }): Promise<LoadedFetchBody> {
    const timeoutMs = input.timeoutMs ?? this.config.defaultTimeoutMs;
    const maxRedirects = input.maxRedirects ?? this.config.defaultMaxRedirects;
    const userAgent = input.userAgent ?? this.config.defaultUserAgent;

    const httpResult = await fetchUrl({
      url: input.url,
      timeoutMs,
      maxRedirects,
      userAgent,
      maxBodyBytes: this.config.maxBodyBytes,
    });

    const charset = detectCharset(httpResult.contentType, httpResult.arrayBuffer);
    const decodedBody = decodeResponseBody(httpResult.arrayBuffer, charset);
    const contentKind = detectContentKind(httpResult.contentType, decodedBody);

    return {
      httpResult,
      decodedBody,
      contentKind,
      pageTitle: contentKind === "html" ? extractTitle(decodedBody) : undefined,
    };
  }
}
