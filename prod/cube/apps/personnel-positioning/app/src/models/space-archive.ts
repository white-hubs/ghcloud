export type SpaceKind = "area" | "building" | "floor" | "room";

export interface SpaceDraft {
  parentId: string | null;
  kind: SpaceKind;
  code: string;
  name: string;
  usage: string;
  floorNumber: number | null;
  enabled: boolean;
  remark: string;
}

export interface SpaceNode extends SpaceDraft {
  id: string;
  references: string[];
  currentPlanId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FloorPlanDraft {
  floorId: string;
  fileName: string;
  size: number;
  url: string;
  version: string;
  remark: string;
  setCurrent: boolean;
}

export interface FloorPlan extends Omit<FloorPlanDraft, "setCurrent"> {
  id: string;
  uploadedAt: string;
}

export interface SpaceArchiveState {
  nodes: SpaceNode[];
  plans: FloorPlan[];
}
