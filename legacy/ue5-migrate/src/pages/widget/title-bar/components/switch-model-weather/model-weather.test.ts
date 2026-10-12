import { describe, expect, test } from "bun:test";

import { extractWeatherRaw, resolveModelWeatherOption } from "./model-weather";

describe("resolveModelWeatherOption", () => {
  test("Sunny maps to 晴, not 自动", () => {
    expect(resolveModelWeatherOption("Sunny")?.label).toBe("晴");
    expect(resolveModelWeatherOption("sunny")?.label).toBe("晴");
  });

  test("Chinese sunny aliases", () => {
    expect(resolveModelWeatherOption("晴")?.label).toBe("晴");
    expect(resolveModelWeatherOption("晴天")?.label).toBe("晴");
  });

  test("auto still resolves to 自动", () => {
    expect(resolveModelWeatherOption("自动")?.label).toBe("自动");
    expect(resolveModelWeatherOption("auto")?.label).toBe("自动");
  });

  test("cloudy", () => {
    expect(resolveModelWeatherOption("Cloudy")?.label).toBe("多云");
    expect(resolveModelWeatherOption("多云")?.label).toBe("多云");
  });

  test("暴雨 / RainThunderStorm", () => {
    expect(resolveModelWeatherOption("暴雨")?.value).toBe("RainThunderStorm");
    expect(resolveModelWeatherOption("RainThunderStorm")?.label).toBe("暴雨");
  });

  test("accepts params object with weather key", () => {
    expect(resolveModelWeatherOption({ weather: "暴雨" })?.value).toBe("RainThunderStorm");
    expect(resolveModelWeatherOption({ value: "RainThunderStorm" })?.label).toBe("暴雨");
  });

  test("accepts weatherType key from model output", () => {
    expect(resolveModelWeatherOption({ weatherType: "暴雨" })?.value).toBe("RainThunderStorm");
  });

  test("accepts stringified params and nested value object", () => {
    expect(resolveModelWeatherOption(JSON.stringify({ value: "暴雨" }))?.label).toBe("暴雨");
    expect(resolveModelWeatherOption({ value: { weather: "Cloudy" } })?.label).toBe("多云");
  });

  test("substring in natural phrase", () => {
    expect(resolveModelWeatherOption("天气切换为暴雨")?.label).toBe("暴雨");
  });
});

describe("extractWeatherRaw", () => {
  test("reads common param keys", () => {
    expect(extractWeatherRaw({ value: "Cloudy" })).toBe("Cloudy");
    expect(extractWeatherRaw({ weather: "暴雨" })).toBe("暴雨");
    expect(extractWeatherRaw("Sunny")).toBe("Sunny");
  });
});
