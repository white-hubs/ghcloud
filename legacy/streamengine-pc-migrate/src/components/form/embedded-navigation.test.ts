import { describe, expect, mock, test } from "bun:test";

import { performFlowDetailBack } from "./embedded-navigation";

describe("performFlowDetailBack", () => {
  test("uses the embedded host callback without changing browser history", () => {
    const onEmbeddedBack = mock(() => {});
    const historyApi = {
      back: mock(() => {}),
      go: mock((_delta: number) => {}),
    };
    const removeRepeatData = mock(() => {});

    performFlowDetailBack({
      onEmbeddedBack,
      repeat: true,
      historyApi,
      removeRepeatData,
    });

    expect(onEmbeddedBack).toHaveBeenCalledTimes(1);
    expect(historyApi.back).not.toHaveBeenCalled();
    expect(historyApi.go).not.toHaveBeenCalled();
    expect(removeRepeatData).not.toHaveBeenCalled();
  });

  test("keeps browser back behavior for a standalone detail page", () => {
    const historyApi = {
      back: mock(() => {}),
      go: mock((_delta: number) => {}),
    };

    performFlowDetailBack({
      repeat: false,
      historyApi,
      removeRepeatData: mock(() => {}),
    });

    expect(historyApi.back).toHaveBeenCalledTimes(1);
    expect(historyApi.go).not.toHaveBeenCalled();
  });

  test("keeps the standalone repeat-flow history behavior", () => {
    const historyApi = {
      back: mock(() => {}),
      go: mock((_delta: number) => {}),
    };
    const removeRepeatData = mock(() => {});

    performFlowDetailBack({
      repeat: true,
      historyApi,
      removeRepeatData,
    });

    expect(removeRepeatData).toHaveBeenCalledTimes(1);
    expect(historyApi.go).toHaveBeenCalledWith(-3);
    expect(historyApi.back).not.toHaveBeenCalled();
  });
});
