export type RevisionTodoType = "FORCED" | "REJECTED" | "SUGGESTED" | "PERIODIC";

export interface RevisionTodoItem {
  id: string;
  emergencyFileId: string;
  emergencyFileName?: string;
  sourceVersion: number;
  sourceVersionText: string;
  baseVersion: number;
  revisionType: RevisionTodoType;
  triggerSourceType: "EVENT_REVIEW" | "EVENT_IMPROVEMENT" | "APPROVAL" | "EXPIRATION" | "MANUAL";
  triggerSourceId?: string;
  reason: string;
  revisionDeadline?: string;
  status: "PENDING" | "REJECTED" | "APPROVING";
  overdue: boolean;
  createTime?: string;
}

export interface RevisionTodoGroupData {
  revisionType: RevisionTodoType;
  count: number;
  items: RevisionTodoItem[];
}

export interface RevisionTodoResponse {
  groups: RevisionTodoGroupData[];
}

export interface RevisionStartResult {
  revisionId: string;
  emergencyFileId: string;
  baseVersion: number;
  baseVersionText: string;
  lockToken: string;
  revisions: RevisionTodoItem[];
}
