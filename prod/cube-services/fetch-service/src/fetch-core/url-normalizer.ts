import { assertHostnameAllowed } from "./dns-guard";
import { FetchUrlError } from "./fetch-errors";

const LOCALHOST_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

function isLocalhostHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return LOCALHOST_HOSTS.has(normalized) || normalized.endsWith(".localhost");
}

export function normalizeFetchUrl(input: string): URL {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new FetchUrlError("Invalid URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new FetchUrlError("URL must use http or https scheme");
  }

  if (url.username !== "" || url.password !== "") {
    throw new FetchUrlError("URL must not contain credentials");
  }

  assertHostnameAllowed(url.hostname);

  if (url.protocol === "http:" && !isLocalhostHost(url.hostname)) {
    url.protocol = "https:";
  }

  return url;
}
