import type { TRAJECTORY_EVENT_TYPES } from "../constants/trajectory";
import type { PositionPoint } from "./positioning";

export interface PositionSceneEvent {
  id: string;
  personId: string;
  kind: "enter" | "leave" | "switch";
  at: string;
  sceneId: string;
  sceneName: string;
  description: string;
}
export interface TrajectorySegment {
  id: string;
  bindingId: string;
  sceneId: string;
  scene: string;
  points: PositionPoint[];
  gapBefore: boolean;
}
export interface TrajectoryEvent {
  id: string;
  kind: keyof typeof TRAJECTORY_EVENT_TYPES;
  at: string;
  endAt?: string;
  sceneId: string;
  sceneName: string;
  title: string;
  description: string;
  coordinateText?: string;
  regionName?: string;
  alarmId?: string;
}
