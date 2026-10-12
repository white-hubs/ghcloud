export interface ReviewPlan {
  id: number;
  name?: string;
  version?: number;
}

export interface ReviewTimelineItem {
  id: number;
  taskId?: number;
  occurredAt?: string;
  operationType?: string;
  operationName?: string;
  taskName?: string;
}

export interface ReviewTask {
  id: number;
  name?: string;
  deadline?: string;
  firstOperatedAt?: string;
  completedAt?: string;
  lagMinutes?: number;
  executorId?: number;
  status?: "WAITING" | "EXECUTING" | "COMPLETED" | "STOPPED";
}

export interface RectificationItem {
  id?: string;
  content: string;
  sourceType: "AI" | "MANUAL";
  accepted?: boolean;
  rectificationTaskId?: string;
  rectificationResponsibleUserId?: string;
  rectificationResponsibleUserName?: string;
  rectificationDeadline?: string;
  rectificationDescription?: string;
  rectificationStatus?: "PENDING" | "OVERDUE" | "COMPLETED";
  reasoningSource?: string;
}

export interface AiSuggestion {
  problemDescription: string;
  improvementSuggestion: string;
  reasoningSource?: string;
}

export interface ReviewDetail {
  id: number;
  name?: string;
  eventCode?: string;
  sourceType?: "ALARM" | "FILE";
  levelCode?: string;
  occurredAt?: string;
  terminatedAt?: string;
  commanderId?: number;
  durationMinutes?: number;
  averageResponseSeconds?: number;
  reviewStatus?: "PENDING" | "COMPLETED";
  reviewScore?: number;
  responseSpeedScore?: number;
  taskCompletionRateScore?: number;
  reviewSummary?: string;
  plans?: ReviewPlan[];
  timeline?: ReviewTimelineItem[];
  tasks?: ReviewTask[];
  rectificationItems?: RectificationItem[];
}
