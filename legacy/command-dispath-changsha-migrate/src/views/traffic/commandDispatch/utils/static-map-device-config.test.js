import { describe, expect, test } from "bun:test";

import { mergeStaticMapDevices, parseStaticMapDeviceDictionary } from "./static-map-device-config";

describe("static map device tenant dictionary", () => {
  test("parses the staticMapDevices dictionary variable", () => {
    const result = parseStaticMapDeviceDictionary([
      {
        itemCode: "CHANGSHA_CUSTOM_CONFIG",
        code: "commandDispatchStaticMapDevices",
        variable: JSON.stringify([
          { deviceId: "device-a", x: 0.466, y: 0.203 },
          { deviceId: "device-b", x: "0.415", y: "0.729" },
        ]),
      },
    ]);

    expect(result).toEqual([
      { deviceId: "device-a", x: 0.466, y: 0.203 },
      { deviceId: "device-b", x: 0.415, y: 0.729 },
    ]);
  });

  test("filters invalid point records", () => {
    const result = parseStaticMapDeviceDictionary([
      {
        variable: JSON.stringify([
          { deviceId: "", x: 0.5, y: 0.5 },
          { deviceId: "outside-x", x: 1.1, y: 0.5 },
          { deviceId: "outside-y", x: 0.5, y: -0.1 },
          { deviceId: "invalid-number", x: "x", y: 0.5 },
          { id: "valid-id-alias", x: 0, y: 1 },
        ]),
      },
    ]);

    expect(result).toEqual([{ deviceId: "valid-id-alias", x: 0, y: 1 }]);
  });

  test("returns an empty list for missing or malformed dictionary values", () => {
    expect(parseStaticMapDeviceDictionary([])).toEqual([]);
    expect(parseStaticMapDeviceDictionary([{ variable: "" }])).toEqual([]);
    expect(parseStaticMapDeviceDictionary([{ variable: "{invalid" }])).toEqual([]);
    expect(parseStaticMapDeviceDictionary([{ variable: "{}" }])).toEqual([]);
  });

  test("merges configured points with the paged device list by device id", () => {
    const result = mergeStaticMapDevices(
      [
        { deviceId: "device-b", x: 0.4, y: 0.7 },
        { deviceId: "missing-device", x: 0.2, y: 0.3 },
        { deviceId: "device-a", x: 0.1, y: 0.2 },
      ],
      [
        { id: "device-a", name: "设备 A" },
        { id: "device-b", name: "设备 B" },
        { id: "not-configured", name: "未配置设备" },
      ],
    );

    expect(result).toEqual([
      { id: "device-a", name: "设备 A", x: 0.1, y: 0.2 },
      { id: "device-b", name: "设备 B", x: 0.4, y: 0.7 },
    ]);
  });

  test("renders each paged device once and uses its latest point configuration", () => {
    const result = mergeStaticMapDevices(
      [
        { deviceId: " device-a ", x: 0.1, y: 0.2 },
        { deviceId: "device-a", x: 0.6, y: 0.8 },
      ],
      [
        { id: "device-a", name: "设备 A" },
        { id: "device-b", name: "设备 B" },
      ],
    );

    expect(result).toEqual([{ id: "device-a", name: "设备 A", x: 0.6, y: 0.8 }]);
  });
});
