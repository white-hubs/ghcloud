import { isIP } from "node:net";

import { FetchSsrfError } from "./fetch-errors";

const LOCALHOST_NAMES = new Set(["localhost", "localhost.localdomain"]);

function parseIpv4Octets(ip: string): number[] | null {
  const parts = ip.split(".");
  if (parts.length !== 4) {
    return null;
  }
  const octets: number[] = [];
  for (const part of parts) {
    const value = Number(part);
    if (!Number.isInteger(value) || value < 0 || value > 255) {
      return null;
    }
    octets.push(value);
  }
  return octets;
}

function isBlockedIpv4(ip: string): boolean {
  const octets = parseIpv4Octets(ip);
  if (!octets) {
    return true;
  }
  const [a, b] = octets;
  if (a === 0 || a === 10 || a === 127) {
    return true;
  }
  if (a === 100 && b !== undefined && b >= 64 && b <= 127) {
    return true;
  }
  if (a === 169 && b === 254) {
    return true;
  }
  if (a === 172 && b !== undefined && b >= 16 && b <= 31) {
    return true;
  }
  if (a === 192 && b === 168) {
    return true;
  }
  return false;
}

function normalizeIpv6(ip: string): string {
  return ip.toLowerCase().split("%")[0] ?? ip.toLowerCase();
}

function parseIpv6Hextets(ip: string): number[] | null {
  let normalized = normalizeIpv6(ip);
  if (normalized.includes(".")) {
    const lastColon = normalized.lastIndexOf(":");
    if (lastColon < 0) {
      return null;
    }
    const ipv4 = normalized.slice(lastColon + 1);
    const octets = parseIpv4Octets(ipv4);
    if (!octets) {
      return null;
    }
    const high = (octets[0] ?? 0) * 256 + (octets[1] ?? 0);
    const low = (octets[2] ?? 0) * 256 + (octets[3] ?? 0);
    normalized = `${normalized.slice(0, lastColon)}:${high.toString(16)}:${low.toString(16)}`;
  }

  const compressionParts = normalized.split("::");
  if (compressionParts.length > 2) {
    return null;
  }

  const readParts = (value: string): number[] | null => {
    if (value === "") {
      return [];
    }
    const parts = value.split(":");
    const values: number[] = [];
    for (const part of parts) {
      if (!/^[0-9a-f]{1,4}$/i.test(part)) {
        return null;
      }
      values.push(parseInt(part, 16));
    }
    return values;
  };

  const head = readParts(compressionParts[0] ?? "");
  const tail = readParts(compressionParts[1] ?? "");
  if (!head || !tail) {
    return null;
  }

  if (compressionParts.length === 1) {
    return head.length === 8 ? head : null;
  }

  const missing = 8 - head.length - tail.length;
  if (missing < 1) {
    return null;
  }
  return [...head, ...Array.from({ length: missing }, () => 0), ...tail];
}

function ipv6ToBigInt(ip: string): bigint | null {
  const hextets = parseIpv6Hextets(ip);
  if (!hextets) {
    return null;
  }
  return hextets.reduce((value, part) => (value << 16n) + BigInt(part), 0n);
}

function ipv4FromLowBits(value: bigint): string {
  const octets = [Number((value >> 24n) & 0xffn), Number((value >> 16n) & 0xffn), Number((value >> 8n) & 0xffn), Number(value & 0xffn)];
  return octets.join(".");
}

function isIpv6InRange(value: bigint, prefix: bigint, prefixLength: number): boolean {
  const shift = BigInt(128 - prefixLength);
  return value >> shift === prefix >> shift;
}

function isBlockedIpv6(ip: string): boolean {
  const value = ipv6ToBigInt(ip);
  if (value === null) {
    return true;
  }

  if (value === 0n || value === 1n) {
    return true;
  }

  if (isIpv6InRange(value, 0xfe80n << 112n, 10)) {
    return true;
  }
  if (isIpv6InRange(value, 0xfc00n << 112n, 7)) {
    return true;
  }
  if (isIpv6InRange(value, 0xff00n << 112n, 8)) {
    return true;
  }

  if (isIpv6InRange(value, 0xffffn << 32n, 96)) {
    return isBlockedIpv4(ipv4FromLowBits(value & 0xffffffffn));
  }

  if (value >> 32n === 0n && (value & 0xffffffffn) !== 0n) {
    return isBlockedIpv4(ipv4FromLowBits(value & 0xffffffffn));
  }

  return false;
}

export function isBlockedIpAddress(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) {
    return isBlockedIpv4(ip);
  }
  if (version === 6) {
    return isBlockedIpv6(ip);
  }
  return true;
}

export function assertHostnameAllowed(hostname: string): void {
  const normalized = hostname.trim().toLowerCase();
  if (LOCALHOST_NAMES.has(normalized) || normalized.endsWith(".localhost")) {
    throw new FetchSsrfError("SSRF blocked: localhost is not allowed");
  }

  const ipVersion = isIP(normalized);
  if (ipVersion === 4 || ipVersion === 6) {
    if (isBlockedIpAddress(normalized)) {
      throw new FetchSsrfError(`SSRF blocked: forbidden IP address ${normalized}`);
    }
  }
}

export interface ResolvedAddress {
  address: string;
  family: 4 | 6;
}

export type DnsResolver = (hostname: string) => Promise<ResolvedAddress[]>;

const defaultDnsResolver: DnsResolver = async (hostname) => {
  const { resolve4, resolve6 } = await import("node:dns/promises");
  const results: ResolvedAddress[] = [];

  try {
    const v4 = await resolve4(hostname);
    for (const address of v4) {
      results.push({ address, family: 4 });
    }
  } catch {
    // ignore missing A records
  }

  try {
    const v6 = await resolve6(hostname);
    for (const address of v6) {
      results.push({ address, family: 6 });
    }
  } catch {
    // ignore missing AAAA records
  }

  return results;
};

export async function resolveAndValidateHost(hostname: string, resolver: DnsResolver = defaultDnsResolver): Promise<ResolvedAddress[]> {
  assertHostnameAllowed(hostname);

  const addresses = await resolver(hostname);
  if (addresses.length === 0) {
    throw new FetchSsrfError(`SSRF blocked: unable to resolve host ${hostname}`);
  }

  const allowed = addresses.filter((entry) => !isBlockedIpAddress(entry.address));
  if (allowed.length === 0) {
    throw new FetchSsrfError(`SSRF blocked: all resolved addresses for ${hostname} are forbidden`);
  }

  return allowed;
}
