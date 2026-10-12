import { describe, expect, test } from "bun:test";

import { assertHostnameAllowed, isBlockedIpAddress, resolveAndValidateHost } from "../src/fetch-core/dns-guard";
import { FetchSsrfError } from "../src/fetch-core/fetch-errors";

describe("dns-guard", () => {
  test("blocks private IPv4 addresses", () => {
    expect(isBlockedIpAddress("10.0.0.1")).toBe(true);
    expect(isBlockedIpAddress("192.168.1.1")).toBe(true);
    expect(isBlockedIpAddress("127.0.0.1")).toBe(true);
    expect(isBlockedIpAddress("169.254.169.254")).toBe(true);
  });

  test("allows public IPv4 addresses", () => {
    expect(isBlockedIpAddress("8.8.8.8")).toBe(false);
    expect(isBlockedIpAddress("1.1.1.1")).toBe(false);
  });

  test("blocks IPv6 localhost, mapped localhost, link-local, and multicast ranges", () => {
    expect(isBlockedIpAddress("::1")).toBe(true);
    expect(isBlockedIpAddress("::ffff:127.0.0.1")).toBe(true);
    expect(isBlockedIpAddress("::ffff:7f00:1")).toBe(true);
    expect(isBlockedIpAddress("fe80::1")).toBe(true);
    expect(isBlockedIpAddress("fe90::1")).toBe(true);
    expect(isBlockedIpAddress("febf::1")).toBe(true);
    expect(isBlockedIpAddress("ff02::1")).toBe(true);
  });

  test("blocks localhost hostname", () => {
    expect(() => assertHostnameAllowed("localhost")).toThrow(FetchSsrfError);
  });

  test("resolveAndValidateHost rejects all forbidden resolved addresses", async () => {
    const resolver = async () => [{ address: "127.0.0.1", family: 4 as const }];
    await expect(resolveAndValidateHost("example.com", resolver)).rejects.toThrow(FetchSsrfError);
  });

  test("resolveAndValidateHost returns allowed addresses", async () => {
    const resolver = async () => [
      { address: "93.184.216.34", family: 4 as const },
      { address: "127.0.0.1", family: 4 as const },
    ];
    const allowed = await resolveAndValidateHost("example.com", resolver);
    expect(allowed).toEqual([{ address: "93.184.216.34", family: 4 }]);
  });
});
