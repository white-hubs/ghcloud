import { FLOOR_PLAN_EXTENSIONS, FLOOR_PLAN_MAX_BYTES, SPACE_KINDS, SPACE_PARK_NAME, planExtension } from "../constants/space-archive";
import type { FloorPlan, FloorPlanDraft, SpaceArchiveState, SpaceDraft, SpaceNode } from "../models/space-archive";

/** 本地演示仓库；统一维护空间关系与图纸版本，后续由基础管理接口替换。 */
export function createSpaceArchiveRepository(state: SpaceArchiveState) {
  const findNode = (id: string): SpaceNode | undefined => state.nodes.find((node) => node.id === id);
  const children = (parentId: string | null): SpaceNode[] => state.nodes.filter((node) => node.parentId === parentId);
  const plansFor = (floorId: string): FloorPlan[] =>
    state.plans
      .filter((plan) => plan.floorId === floorId)
      .slice()
      .reverse();
  const currentPlan = (floorId: string): FloorPlan | undefined =>
    state.plans.find((plan) => plan.floorId === floorId && plan.id === findNode(floorId)?.currentPlanId);

  function requireNode(id: string): SpaceNode {
    const node = findNode(id);
    if (!node) {
      throw new Error("空间不存在或已删除，请刷新后重试");
    }
    return node;
  }
  function pathOf(id: string | null): string {
    const names: string[] = [];
    let node = id ? findNode(id) : undefined;
    while (node) {
      names.unshift(node.name);
      node = node.parentId ? findNode(node.parentId) : undefined;
    }
    return [SPACE_PARK_NAME, ...names].join(" / ");
  }
  function saveNode(draft: SpaceDraft, originalId?: string): SpaceNode {
    const original = originalId ? requireNode(originalId) : undefined;
    if (original && (original.parentId !== draft.parentId || original.kind !== draft.kind)) {
      throw new Error("编辑时不能改变节点类型和上级空间");
    }
    const parent = draft.parentId ? requireNode(draft.parentId) : undefined;
    if ((parent ? SPACE_KINDS[parent.kind].child : "area") !== draft.kind) {
      throw new Error("请按区域、楼栋、楼层、房间的层级新增空间");
    }
    const code = draft.code.trim();
    const name = draft.name.trim();
    if (!code || !name) {
      throw new Error("请填写空间编号和空间名称");
    }
    if (code.length > 40 || name.length > 60) {
      throw new Error("空间编号最多40字，空间名称最多60字");
    }
    if (state.nodes.some((node) => node.id !== originalId && node.code.toLowerCase() === code.toLowerCase())) {
      throw new Error("空间编号已存在，请使用唯一编号");
    }
    if (
      draft.kind === "floor" &&
      (!Number.isInteger(draft.floorNumber) || !draft.floorNumber || draft.floorNumber < -20 || draft.floorNumber > 200)
    ) {
      throw new Error("实际层数须为 -20 至 200 之间的非零整数");
    }
    if (
      draft.kind === "floor" &&
      state.nodes.some(
        (node) =>
          node.id !== originalId && node.parentId === draft.parentId && node.kind === "floor" && node.floorNumber === draft.floorNumber,
      )
    ) {
      throw new Error("该楼栋已存在相同实际层数的楼层");
    }
    const values: SpaceDraft = {
      ...draft,
      code,
      name,
      usage: draft.kind === "floor" ? "" : draft.usage.trim(),
      floorNumber: draft.kind === "floor" ? draft.floorNumber : null,
      remark: draft.remark.trim(),
    };
    const now = new Date().toISOString();
    if (original) {
      Object.assign(original, values, { updatedAt: now });
      return original;
    }
    const node: SpaceNode = {
      ...values,
      id: `space-${crypto.randomUUID()}`,
      references: [],
      currentPlanId: null,
      createdAt: now,
      updatedAt: now,
    };
    state.nodes.push(node);
    return node;
  }
  function deletionBlock(id: string): string {
    const node = requireNode(id);
    if (children(id).length) {
      return "该空间下还有子节点，请先处理下级空间。";
    }
    if (node.references.length) {
      return `该空间已被业务引用：${node.references.join("、")}。请先解除关联。`;
    }
    return "";
  }
  function deleteNode(id: string): void {
    const block = deletionBlock(id);
    if (block) {
      throw new Error(block);
    }
    state.nodes = state.nodes.filter((node) => node.id !== id);
    state.plans = state.plans.filter((plan) => plan.floorId !== id);
  }
  function requireFloor(id: string): SpaceNode {
    const node = requireNode(id);
    if (node.kind !== "floor") {
      throw new Error("只有楼层可以配置平面图");
    }
    return node;
  }
  function addPlan(draft: FloorPlanDraft): FloorPlan {
    const floor = requireFloor(draft.floorId);
    if (!FLOOR_PLAN_EXTENSIONS.includes(planExtension(draft.fileName))) {
      throw new Error("请选择 PNG、JPG、JPEG、DWG 或 DXF 文件");
    }
    if (draft.size <= 0 || draft.size > FLOOR_PLAN_MAX_BYTES) {
      throw new Error("文件不能为空，且不得超过20 MB");
    }
    if (!draft.url.startsWith("data:")) {
      throw new Error("图纸文件尚未读取完成，请重新选择文件");
    }
    const version = draft.version.trim();
    if (!version || version.length > 30) {
      throw new Error("请填写版本号，最多30字");
    }
    if (plansFor(draft.floorId).some((plan) => plan.version.toLowerCase() === version.toLowerCase())) {
      throw new Error("该楼层已存在相同版本号，请填写新版本号");
    }
    const now = new Date().toISOString();
    const plan: FloorPlan = {
      id: `plan-${crypto.randomUUID()}`,
      floorId: draft.floorId,
      fileName: draft.fileName,
      size: draft.size,
      url: draft.url,
      version,
      remark: draft.remark.trim(),
      uploadedAt: now,
    };
    state.plans.push(plan);
    if (draft.setCurrent) {
      floor.currentPlanId = plan.id;
    }
    floor.updatedAt = now;
    return plan;
  }
  function activatePlan(floorId: string, planId: string): void {
    const floor = requireFloor(floorId);
    if (!state.plans.some((plan) => plan.floorId === floorId && plan.id === planId)) {
      throw new Error("图纸版本不属于当前楼层");
    }
    floor.currentPlanId = planId;
    floor.updatedAt = new Date().toISOString();
  }
  return { state, findNode, children, pathOf, saveNode, deletionBlock, deleteNode, plansFor, currentPlan, addPlan, activatePlan };
}
