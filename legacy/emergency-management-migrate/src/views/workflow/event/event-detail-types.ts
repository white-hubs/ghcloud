export interface EventDetailRecord {
  id: string;
  name?: string;
  sortNo?: number;
  eventCode?: string;
  sourceType?: "ALARM" | "FILE";
  levelCode?: string;
  commanderName?: string;
  commanderId?: string;
  occurredAt?: string;
  terminatedAt?: string;
  status?: "WAITING_RESPONSE" | "RUNNING" | "COMPLETED" | "TERMINATED";
}

export interface EventTaskRecord {
  id: string;
  name?: string;
  planId?: string;
  planName?: string;
  planContentHtml?: string;
  executorName?: string;
  executorId?: string;
  deadline?: string;
  firstOperatedAt?: string;
  completedAt?: string;
  locationDesc?: string;
  longitude?: number;
  latitude?: number;
  executionContent?: string;
  equipment?: string;
  devices?: Array<{ deviceName?: string; deviceCode?: string }>;
  status?: "WAITING" | "EXECUTING" | "COMPLETED" | "STOPPED";
}

export interface EventPlanSnapshot {
  id: string;
  name: string;
  contentHtml?: string;
}

export interface EventTaskFeedbackRecord {
  id: string;
  feedbackType?: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "LOCATION";
  content?: string;
  fileName?: string;
  filePath?: string;
  createTime?: string;
}
