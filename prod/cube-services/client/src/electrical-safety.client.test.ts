import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

import { authRequest, DEV_MOCK_AUTH } from "./auth-request";
import {
  deleteElectricalCenterScadaBinding,
  deleteFacilityScadaBinding,
  getElectricalCenterScadaBinding,
  getFacilityScadaBinding,
  saveElectricalCenterScadaBinding,
  saveFacilityScadaBinding,
} from "./electrical-safety.client";

interface CapturedRequest {
  url: string;
  init?: RequestInit;
}

const originalFetch = globalThis.fetch;
let requests: CapturedRequest[] = [];

beforeEach(() => {
  requests = [];
  authRequest.updateAuth(DEV_MOCK_AUTH);
  globalThis.fetch = mock(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    requests.push({ url, init });
    if (url.endsWith("/monitoring/facilities/unbound/scada-binding")) {
      return new Response(JSON.stringify({ message: "设施房未绑定二维组态" }), { status: 404 });
    }
    if (url.endsWith("/monitoring/facilities/server-error/scada-binding")) {
      return new Response(JSON.stringify({ message: "服务异常" }), { status: 500 });
    }
    const binding = url.includes("/monitoring/facilities/")
      ? {
          pageId: "facility-page-1",
          elementDeviceIds: { "element-1": "device-1" },
          elementPropertyCodes: { "element-1": ["temperature"] },
        }
      : {
          pageId: "center-page-1",
          elementFacilityIds: { "element-1": "facility-1" },
          elementPropertyCodes: { "element-1": ["facilityName"] },
        };
    const body =
      init?.method === "GET"
        ? {
            data: {
              content: JSON.stringify(binding),
            },
          }
        : undefined;
    return new Response(body ? JSON.stringify(body) : undefined, { status: 200 });
  }) as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("electrical-center SCADA binding client", () => {
  it("loads the tenant electrical-center binding", async () => {
    await expect(getElectricalCenterScadaBinding()).resolves.toEqual({
      content: JSON.stringify({
        pageId: "center-page-1",
        elementFacilityIds: { "element-1": "facility-1" },
        elementPropertyCodes: { "element-1": ["facilityName"] },
      }),
    });

    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe("/api/electrical-management/monitoring/scada-binding");
    expect(requests[0]?.init?.method).toBe("GET");
    expect(requests[0]?.init?.body).toBeUndefined();
  });

  it("saves the serialized electrical-center binding in content", async () => {
    const content = JSON.stringify({
      pageId: "center-page-1",
      elementFacilityIds: { "element-1": "facility-1" },
      elementPropertyCodes: { "element-1": ["facilityName", "temperature"] },
    });
    await saveElectricalCenterScadaBinding({
      content,
    });

    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe("/api/electrical-management/monitoring/scada-binding");
    expect(requests[0]?.init?.method).toBe("PUT");
    expect(JSON.parse(String(requests[0]?.init?.body))).toEqual({
      content,
    });
    expect(String(requests[0]?.init?.body)).not.toContain("revision");
  });

  it("deletes the electrical-center binding without a request body", async () => {
    await deleteElectricalCenterScadaBinding();

    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe("/api/electrical-management/monitoring/scada-binding");
    expect(requests[0]?.init?.method).toBe("DELETE");
    expect(requests[0]?.init?.body).toBeUndefined();
  });
});

describe("facility SCADA binding client", () => {
  it("treats an unbound facility response as empty", async () => {
    await expect(getFacilityScadaBinding("unbound")).resolves.toBeNull();

    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe("/api/electrical-management/monitoring/facilities/unbound/scada-binding");
    expect(requests[0]?.init?.method).toBe("GET");
  });

  it("keeps reporting real facility binding request failures", async () => {
    await expect(getFacilityScadaBinding("server-error")).rejects.toThrow("服务异常");
  });

  it("loads one facility binding content", async () => {
    await expect(getFacilityScadaBinding("facility/1")).resolves.toEqual({
      content: JSON.stringify({
        pageId: "facility-page-1",
        elementDeviceIds: { "element-1": "device-1" },
        elementPropertyCodes: { "element-1": ["temperature"] },
      }),
    });

    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe("/api/electrical-management/monitoring/facilities/facility%2F1/scada-binding");
    expect(requests[0]?.init?.method).toBe("GET");
    expect(requests[0]?.init?.body).toBeUndefined();
  });

  it("saves one facility binding as content", async () => {
    const content = JSON.stringify({
      pageId: "facility-page-1",
      elementDeviceIds: { "element-1": "device-1" },
      elementPropertyCodes: { "element-1": ["deviceName", "temperature"] },
    });
    await saveFacilityScadaBinding("facility-1", { content });

    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe("/api/electrical-management/monitoring/facilities/facility-1/scada-binding");
    expect(requests[0]?.init?.method).toBe("PUT");
    expect(JSON.parse(String(requests[0]?.init?.body))).toEqual({ content });
  });

  it("deletes one facility binding without a request body", async () => {
    await deleteFacilityScadaBinding("facility-1");

    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe("/api/electrical-management/monitoring/facilities/facility-1/scada-binding");
    expect(requests[0]?.init?.method).toBe("DELETE");
    expect(requests[0]?.init?.body).toBeUndefined();
  });
});
