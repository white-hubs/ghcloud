import { describe, expect, test } from "bun:test";

import {
  COPY_MODEL_COMMAND_FAIL,
  COPY_MODEL_COMMAND_NON_TWIN,
  COPY_MODEL_COMMAND_RECOGNIZED,
  COPY_MODEL_COMMAND_SUCCESS,
  formatModelCommandAck,
  isTwinAssistantHost,
  parseAssistantCommandFromContent,
  resolveAssistantCommandDisplay,
} from "./assistant-command";

describe("parseAssistantCommandFromContent", () => {
  test("parses bare JSON command", () => {
    const cmd = parseAssistantCommandFromContent(JSON.stringify({ action: "changeModelTime", params: { value: "day" } }));
    expect(cmd).toEqual({ action: "changeModelTime", params: { value: "9:00:00" } });
  });

  test("normalizes UE5 title-bar time values 上午/下午/晚上/自动", () => {
    expect(parseAssistantCommandFromContent(JSON.stringify({ action: "changeModelTime", params: { value: "上午" } }))).toEqual({
      action: "changeModelTime",
      params: { value: "9:00:00" },
    });
    expect(parseAssistantCommandFromContent(JSON.stringify({ action: "changeModelTime", params: { value: "下午" } }))).toEqual({
      action: "changeModelTime",
      params: { value: "15:00:00" },
    });
    expect(parseAssistantCommandFromContent(JSON.stringify({ action: "changeModelTime", params: { value: "晚上" } }))).toEqual({
      action: "changeModelTime",
      params: { value: "22:00:00" },
    });
    expect(parseAssistantCommandFromContent(JSON.stringify({ action: "changeModelTime", params: { value: "自动" } }))).toEqual({
      action: "changeModelTime",
      params: { value: "auto" },
    });
  });

  test("normalizes morning/afternoon/evening aliases", () => {
    expect(parseAssistantCommandFromContent(JSON.stringify({ action: "set_time", params: { value: "afternoon" } }))).toEqual({
      action: "changeModelTime",
      params: { value: "15:00:00" },
    });
  });

  test("parses json fence", () => {
    const cmd = parseAssistantCommandFromContent('```json\n{"action":"toggleCloseRoam"}\n```');
    expect(cmd).toEqual({ action: "toggleCloseRoam" });
  });

  test("normalizes set_weather alias and cloudy value", () => {
    const cmd = parseAssistantCommandFromContent(JSON.stringify({ action: "set_weather", params: { value: "cloudy" } }));
    expect(cmd).toEqual({ action: "changeModelWeather", params: { value: "Cloudy" } });
  });

  test("normalizes Chinese weather value", () => {
    const cmd = parseAssistantCommandFromContent(JSON.stringify({ action: "changeModelWeather", params: { value: "多云" } }));
    expect(cmd).toEqual({ action: "changeModelWeather", params: { value: "Cloudy" } });
  });

  test("normalizes weather key and 暴雨", () => {
    const cmd = parseAssistantCommandFromContent(JSON.stringify({ action: "changeModelWeather", params: { weather: "暴雨" } }));
    expect(cmd).toEqual({ action: "changeModelWeather", params: { value: "RainThunderStorm" } });
  });

  test("normalizes weatherType key used by model", () => {
    const cmd = parseAssistantCommandFromContent(JSON.stringify({ action: "changeModelWeather", params: { weatherType: "暴雨" } }));
    expect(cmd).toEqual({ action: "changeModelWeather", params: { value: "RainThunderStorm" } });
  });

  test("coerces stringified params JSON", () => {
    const cmd = parseAssistantCommandFromContent(
      JSON.stringify({ action: "changeModelWeather", params: JSON.stringify({ value: "暴雨" }) }),
    );
    expect(cmd).toEqual({ action: "changeModelWeather", params: { value: "RainThunderStorm" } });
  });

  test("lifts top-level value without params wrapper", () => {
    const cmd = parseAssistantCommandFromContent(JSON.stringify({ action: "changeModelWeather", value: "Cloudy" }));
    expect(cmd).toEqual({ action: "changeModelWeather", params: { value: "Cloudy" } });
  });

  test("parses command JSON embedded in prose", () => {
    const cmd = parseAssistantCommandFromContent('指令如下：{"action":"changeModelWeather","params":{"value":"RainThunderStorm"}}');
    expect(cmd).toEqual({ action: "changeModelWeather", params: { value: "RainThunderStorm" } });
  });

  test("normalizes enterRoamRoute alias to toggleStartRoam", () => {
    const cmd = parseAssistantCommandFromContent(JSON.stringify({ action: "enterRoamRoute", params: { value: "办公区漫游" } }));
    expect(cmd).toEqual({ action: "toggleStartRoam", params: { value: "办公区漫游" } });
  });

  test("normalizes startRoundTour (环游) to toggleRevolve with value true", () => {
    const cmd = parseAssistantCommandFromContent(JSON.stringify({ action: "startRoundTour" }));
    expect(cmd).toEqual({ action: "toggleRevolve", params: { value: true } });
  });

  test("normalizes startTourAround to toggleRevolve", () => {
    const cmd = parseAssistantCommandFromContent(JSON.stringify({ action: "startTourAround", params: { value: true } }));
    expect(cmd).toEqual({ action: "toggleRevolve", params: { value: true } });
  });

  test("normalizes closeRoundTour to toggleRevolve with value false", () => {
    const cmd = parseAssistantCommandFromContent(JSON.stringify({ action: "closeRoundTour" }));
    expect(cmd).toEqual({ action: "toggleRevolve", params: { value: false } });
  });

  test("toggleRevolve without params defaults to open", () => {
    const cmd = parseAssistantCommandFromContent(JSON.stringify({ action: "toggleRevolve" }));
    expect(cmd).toEqual({ action: "toggleRevolve", params: { value: true } });
  });

  test("normalizes buildingName to value for changePerspectiveBuilding", () => {
    const cmd = parseAssistantCommandFromContent(
      JSON.stringify({ action: "changePerspectiveBuilding", params: { buildingName: "华威一号楼" } }),
    );
    expect(cmd).toEqual({ action: "changePerspectiveBuilding", params: { value: "华威一号楼" } });
  });

  test("normalizes changePerspectiveFloor buildingName + floor", () => {
    const cmd = parseAssistantCommandFromContent(
      JSON.stringify({
        action: "changePerspectiveFloor",
        params: { buildingName: "华威一号楼", floor: "顶层" },
      }),
    );
    expect(cmd).toEqual({
      action: "changePerspectiveFloor",
      params: { building: "华威一号楼", floor: "顶层" },
    });
  });

  test("normalizes enterOfficeRoamingRoute and backfills 办公区", () => {
    const cmd = parseAssistantCommandFromContent(JSON.stringify({ action: "enterOfficeRoamingRoute" }));
    expect(cmd).toEqual({ action: "toggleStartRoam", params: { value: "办公区" } });
  });

  test("returns null for plain prose", () => {
    expect(parseAssistantCommandFromContent("今天天气不错")).toBeNull();
  });
});

describe("isTwinAssistantHost", () => {
  test("accepts ue5 / ue5-voice / twin", () => {
    expect(isTwinAssistantHost({ source: "ue5" })).toBe(true);
    expect(isTwinAssistantHost({ source: "ue5-voice" })).toBe(true);
    expect(isTwinAssistantHost({ source: "twin" })).toBe(true);
  });

  test("rejects other hosts", () => {
    expect(isTwinAssistantHost({})).toBe(false);
    expect(isTwinAssistantHost({ source: "pc" })).toBe(false);
    expect(isTwinAssistantHost(null)).toBe(false);
  });
});

describe("resolveAssistantCommandDisplay", () => {
  const cmd = '```json\n{"action":"changeModelWeather","params":{"value":"Sunny"}}\n```';

  test("non-twin shows fixed tip", () => {
    expect(resolveAssistantCommandDisplay(cmd, {})).toBe(COPY_MODEL_COMMAND_NON_TWIN);
    expect(resolveAssistantCommandDisplay(cmd)).toBe(COPY_MODEL_COMMAND_NON_TWIN);
  });

  test("twin shows recognized placeholder", () => {
    expect(resolveAssistantCommandDisplay(cmd, { source: "ue5" })).toBe(COPY_MODEL_COMMAND_RECOGNIZED);
  });

  test("non-command returns null", () => {
    expect(resolveAssistantCommandDisplay("普通回答", { source: "ue5" })).toBeNull();
  });
});

describe("formatModelCommandAck", () => {
  test("formats success and fail with optional action", () => {
    expect(formatModelCommandAck(true)).toBe(COPY_MODEL_COMMAND_SUCCESS);
    expect(formatModelCommandAck(false, "toggleRevolve")).toBe(`${COPY_MODEL_COMMAND_FAIL}（toggleRevolve）`);
  });
});
