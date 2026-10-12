import { describe, expect, test } from "bun:test";

import { parsePlanDraftState } from "./planDraft";

describe("预案编辑进度恢复", () => {
  test("保留不完整任务、稳定标识、空步骤和未确认的采纳编辑", () => {
    const task = {
      clientKey: "stable-task-key",
      name: "",
      locationDesc: "",
      remark: "",
      sortNo: 1,
      durationMinutes: null,
      executionContents: ["", "待补充动作"],
      equipment: [""],
      sourceType: "MANUAL",
      executors: [{ clientKey: "stable-executor-key", executorId: "", executorType: "PERSON" }],
    };
    const state = {
      schemaVersion: 1,
      currentStep: 5,
      editMode: true,
      planGenerated: true,
      generatedPlanMetadata: { title: "预案标题", metadata: "生成信息", missingInfo: ["待补充"] },
      planTasks: [task],
      taskCandidates: [{ ...task, clientKey: "candidate-key" }],
      taskWarnings: ["尚未选择执行人员"],
      taskDrawer: { visible: true, mode: "candidates", editingCandidateKey: "candidate-key" },
      taskAdoption: { visible: true, candidate: task, stepsText: "尚未确认的步骤\n", equipmentText: "尚未确认的装备" },
    };

    expect(parsePlanDraftState(JSON.stringify(state))).toEqual(state);
  });

  test("损坏或版本不支持的快照不能被当作可恢复进度", () => {
    expect(parsePlanDraftState("{")).toBeNull();
    expect(parsePlanDraftState('{"schemaVersion":2}')).toBeNull();
    expect(parsePlanDraftState(null)).toBeNull();
  });
});
