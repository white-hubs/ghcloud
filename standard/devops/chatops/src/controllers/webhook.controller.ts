import { GitLabClient } from "../clients/gitlab-client";
import { ChatOpsService } from "../services/chatops.service";
import { EventLogService } from "../services/event-log.service";
import {
  Body,
  Controller,
  POST,
  Inject,
  CONFIG_SERVICE_TOKEN,
  CONTEXT_SERVICE_TOKEN,
  LOGGER_TOKEN,
  ConfigService,
  ContextService,
  type Logger,
} from "@dangao/bun-server";

/**
 * GitLab Webhook 事件类型
 */
interface GitLabWebhookEvent {
  object_kind: string;
  project?: {
    id: number;
    name: string;
    path_with_namespace: string;
  };
  merge_request?: {
    id: number;
    iid: number;
    title: string;
    state: string;
    source_branch: string;
    target_branch: string;
    author: {
      id: number;
      username: string;
      name: string;
    };
    assignees?: {
      id: number;
      username: string;
      name: string;
    }[];
    reviewers?: {
      id: number;
      username: string;
      name: string;
    }[];
    changes?: {
      title?: {
        previous?: string;
        current?: string;
      };
      reviewers?: {
        previous?: { id: number; username: string }[];
        current?: { id: number; username: string }[];
      };
    };
  };
  object_attributes?: {
    id?: number;
    iid?: number;
    title?: string;
    state?: string;
    source_branch?: string;
    target_branch?: string;
    note?: string;
    noteable_type?: string;
    noteable_id?: number;
    ref?: string;
    status?: string;
    action?: string; // merge_request 事件的动作类型：open, update, approved, etc.
    detailed_status?: {
      id: string;
    };
    merge_request?: {
      id: number;
      iid: number;
    };
  };
  changes?: {
    title?: {
      previous?: string;
      current?: string;
    };
    reviewers?: {
      previous?: { id: number; username: string }[];
      current?: { id: number; username: string }[];
    };
  };
  reviewers?: {
    id: number;
    username: string;
    name: string;
  }[];
  user?: {
    id: number;
    username: string;
    name: string;
  };
  pipeline?: {
    id: number;
    ref: string;
    status: string;
    detailed_status?: {
      id: string;
    };
  };
}

/**
 * Webhook 控制器
 */
@Controller("/webhook")
export class WebhookController {
  private readonly webhookSecret?: string;

  constructor(
    private readonly chatOpsService: ChatOpsService,
    private readonly gitlabClient: GitLabClient,
    private readonly eventLogService: EventLogService,
    @Inject(CONFIG_SERVICE_TOKEN) private readonly configService: ConfigService,
    @Inject(CONTEXT_SERVICE_TOKEN) private readonly contextService: ContextService,
    @Inject(LOGGER_TOKEN) private readonly logger: Logger,
  ) {
    const config = this.configService.get<any>("app");
    this.webhookSecret = config.gitlabWebhookSecret;
  }

  /**
   * 从 Context 获取请求头
   */
  private getHeader(name: string): string | null {
    const context = this.contextService.getContext();
    if (!context) {
      return null;
    }
    // Context 应该有 request 属性，从中获取 headers
    const request = (context as any).request as Request | undefined;
    if (!request) {
      return null;
    }
    return request.headers.get(name);
  }

  /**
   * 验证 Webhook 签名（如果配置了 secret）
   * GitLab 使用 X-Gitlab-Token header 进行验证
   */
  private verifyWebhookSignature(): boolean {
    if (!this.webhookSecret) {
      // 如果没有配置 secret，跳过验证
      return true;
    }

    const token = this.getHeader("x-gitlab-token");
    if (!token) {
      this.logger.warn("Missing X-Gitlab-Token header");
      return false;
    }

    // GitLab 使用 X-Gitlab-Token header 进行验证
    const isValid = token === this.webhookSecret;
    if (!isValid) {
      this.logger.warn("Invalid X-Gitlab-Token");
    }
    return isValid;
  }

  /**
   * 处理 GitLab Webhook 事件
   */
  @POST("/gitlab")
  public async handleGitLabWebhook(@Body() event: GitLabWebhookEvent) {
    // 验证签名
    if (!this.verifyWebhookSignature()) {
      return {
        status: "error",
        message: "Invalid webhook signature",
      };
    }

    const objectKind = event.object_kind;

    this.logger.info(`Received webhook event: ${objectKind}`);

    // 记录事件（异步，不阻塞主流程）
    this.recordEvent(event, objectKind).catch((error: any) => {
      this.logger.error(`Failed to record event: ${error.message || String(error)}`);
    });

    try {
      // 处理不同的 Webhook 事件类型
      switch (objectKind) {
        case "merge_request": {
          this.logger.debug("Processing merge_request event");
          await this.handleMergeRequestEvent(event);
          break;
        }
        case "note": {
          this.logger.debug("Processing note event");
          await this.handleNoteEvent(event);
          break;
        }
        case "pipeline": {
          this.logger.debug("Processing pipeline event");
          await this.handlePipelineEvent(event);
          break;
        }
        default: {
          this.logger.debug(`Unhandled event type: ${objectKind}`);
        }
      }

      return {
        status: "ok",
        message: "Webhook processed successfully",
      };
    } catch (error: any) {
      this.logger.error("Error processing webhook:", error);
      return {
        status: "error",
        message: error.message || String(error),
      };
    }
  }

  /**
   * 记录事件
   */
  private async recordEvent(event: GitLabWebhookEvent, eventType: string): Promise<void> {
    try {
      // 构建事件概要
      let summary = eventType;
      const project = event.project;
      const mergeRequest = event.merge_request;
      const objectAttributes = event.object_attributes;

      if (eventType === "merge_request" && objectAttributes) {
        const action = objectAttributes.action || "update";
        const state = objectAttributes.state || "";
        const mrIid = objectAttributes.iid || mergeRequest?.iid;
        summary = `MR ${action}${mrIid ? ` !${mrIid}` : ""} - ${state}`;
        if (objectAttributes.title) {
          summary += `: ${objectAttributes.title}`;
        }
      } else if (eventType === "note" && objectAttributes) {
        const noteableType = objectAttributes.noteable_type || "";
        const mrIid = mergeRequest?.iid;
        summary = `Comment on ${noteableType}${mrIid ? ` !${mrIid}` : ""}`;
      } else if (eventType === "pipeline") {
        const pipeline = event.pipeline || objectAttributes;
        const status = (pipeline as any)?.status || "";
        const mrIid = mergeRequest?.iid;
        summary = `Pipeline ${status}${mrIid ? ` for MR !${mrIid}` : ""}`;
      }

      // 记录事件
      const eventLogData = this.eventLogService.extractEventLogData(event, eventType, summary);
      await this.eventLogService.logEvent(eventLogData);
    } catch (error: any) {
      // 记录错误但不抛出，避免影响主流程
      this.logger.error(`Failed to record event: ${error.message || String(error)}`);
    }
  }

  /**
   * 处理 Merge Request 事件
   */
  private async handleMergeRequestEvent(event: GitLabWebhookEvent) {
    const project = event.project;
    const objectAttributes = event.object_attributes;
    const mergeRequest = event.merge_request;

    if (!project || !objectAttributes) {
      this.logger.warn("Missing project or object_attributes in event");
      this.logger.debug(
        `Event structure: ${JSON.stringify({ project: !!project, object_attributes: !!objectAttributes, merge_request: !!event.merge_request, changes: !!event.changes })}`,
      );
      return;
    }

    const projectId = project.id;
    const mrIid = objectAttributes.iid;
    if (!mrIid) {
      this.logger.warn("Missing MR IID in event");
      return;
    }
    const state = objectAttributes.state;

    this.logger.info(`Processing MR event for MR !${mrIid}, project: ${project.name}, state: ${state}`);
    this.logger.debug(`Event changes: ${JSON.stringify(event.changes || {})}`);

    // 获取发起人信息（优先从 merge_request.author 获取，否则从 event.user 获取）
    const authorUsername = mergeRequest?.author?.username || event.user?.username;

    // 处理 MR 关闭或合并事件 - 只处理关闭事件（停止 CI），合并事件直接跳过
    if (state === "closed") {
      this.logger.info(`MR !${mrIid} closed, attempting to stop pipelines`);
      await this.chatOpsService.handleMRClose(projectId, mrIid);
      // 关闭事件不发送审批通知，直接返回
      return;
    }

    // 如果 MR 已经合并，跳过所有后续处理（避免触发 CI 和通知）
    if (state === "merged") {
      this.logger.info(`MR !${mrIid} already merged, skipping all processing`);
      return;
    }

    // 只处理打开状态的 MR
    if (state !== "opened") {
      this.logger.info(`MR !${mrIid} is not in opened state (current: ${state}), skipping processing`);
      return;
    }

    // 检查是否是首次创建
    // 首次创建的条件：state 为 opened，且没有 reviewers 变化（即 event.changes?.reviewers 不存在）
    // 如果有 event.changes?.reviewers，说明是后续更新，不是首次创建
    const hasReviewersChange = !!event.changes?.reviewers;
    const isFirstCreate = state === "opened" && !hasReviewersChange && JSON.stringify(event.changes) !== "{}";

    // 检查标题是否变化
    if (event.changes?.title) {
      const oldTitle = event.changes.title.previous;
      const newTitle = event.changes.title.current;

      if (oldTitle !== newTitle) {
        this.logger.info(`MR title changed: "${oldTitle}" -> "${newTitle}"`);
        await this.chatOpsService.handleMRTitleChange(projectId, mrIid);
      }
    }

    // 检查是否是批准事件（通过 object_attributes.action 判断）
    const action = objectAttributes.action;
    const isApprovalEvent = action === "approved";

    // 如果是批准事件，只触发 CI，不发送通知
    if (isApprovalEvent) {
      this.logger.info(`MR !${mrIid} approved, triggering CI without notification`);
      await this.chatOpsService.handleMRReviewStatusChange(projectId, mrIid, undefined, authorUsername, false, true);
      return;
    }

    // 检查审核者是否变化
    if (hasReviewersChange && event.changes?.reviewers) {
      const oldReviewers = event.changes.reviewers.previous || [];
      const newReviewers = event.changes.reviewers.current || [];

      this.logger.debug(`Reviewers changed - old: ${oldReviewers.length}, new: ${newReviewers.length}`);
      this.logger.debug(`Old reviewers: ${JSON.stringify(oldReviewers.map((r) => ({ id: r.id, username: r.username })))}`);
      this.logger.debug(`New reviewers: ${JSON.stringify(newReviewers.map((r) => ({ id: r.id, username: r.username })))}`);

      const oldIds = new Set(oldReviewers.map((r) => r.id));
      const newIds = new Set(newReviewers.map((r) => r.id));

      // 检查是否有新增的审核者
      const addedReviewers = newReviewers.filter((r) => !oldIds.has(r.id));
      const removedReviewers = oldReviewers.filter((r) => !newIds.has(r.id));

      this.logger.debug(`Added reviewers: ${addedReviewers.length}, Removed reviewers: ${removedReviewers.length}`);

      // 如果有新增的审核者，发送通知（后续更新，isFirstCreate = false）
      if (addedReviewers.length > 0) {
        const addedUsernames = addedReviewers.map((r) => r.username).filter(Boolean);
        this.logger.info(`MR reviewers added for MR !${mrIid}: ${addedUsernames.join(", ")}, isFirstCreate: false`);
        await this.chatOpsService.handleMRReviewStatusChange(projectId, mrIid, addedReviewers, authorUsername, false);
      } else if (removedReviewers.length > 0) {
        this.logger.info(`MR reviewers removed for MR !${mrIid}: ${removedReviewers.map((r) => r.username).join(", ")}`);
        // 移除审核者时只触发 CI，不发送通知
        await this.chatOpsService.handleMRTitleChange(projectId, mrIid);
      }
    } else {
      // 首次创建 MR 时，检查是否有配置 reviewer
      // 从 merge_request 对象或 reviewers 字段获取
      const reviewers = mergeRequest?.reviewers || event.reviewers || [];

      const reviewerUsernames = reviewers.map((r: any) => r.username).filter(Boolean);
      this.logger.info(`First create MR !${mrIid} with reviewers: ${reviewerUsernames.join(", ")}`);
      // 首次创建时，触发 CI 并发送通知
      await this.chatOpsService.handleMRReviewStatusChange(
        projectId,
        mrIid,
        reviewers.map((r: any) => ({ username: r.username, name: r.name })),
        authorUsername,
        isFirstCreate, // 是首次创建
      );
    }
  }

  /**
   * 处理评论（Note）事件
   */
  private async handleNoteEvent(event: GitLabWebhookEvent) {
    const attributes = event.object_attributes;
    const project = event.project;
    const mergeRequest = event.merge_request;

    if (!attributes || !project) {
      return;
    }

    // 只处理 Merge Request 的评论
    if (attributes.noteable_type !== "MergeRequest") {
      return;
    }

    // 从 merge_request 对象获取 MR 的 IID
    if (!mergeRequest || !mergeRequest.iid) {
      this.logger.warn("Missing merge_request.iid in note event");
      return;
    }

    const projectId = project.id;
    const mrIid = mergeRequest.iid;
    const noteBody = attributes.note || "";

    // 检查 MR 状态，只处理打开状态的 MR
    const mrState = mergeRequest.state;
    if (mrState !== "opened") {
      this.logger.info(`MR !${mrIid} is not in opened state (current: ${mrState}), skipping command processing`);
      return;
    }

    // 检查评论是否包含命令，如果不包含命令则跳过（避免处理系统自动添加的评论）
    const { command } = this.chatOpsService.parseCommand(noteBody);
    if (!command) {
      this.logger.debug(`Comment does not contain a command, skipping processing for MR !${mrIid}`);
      return;
    }

    // 处理命令
    const response = await this.chatOpsService.handleCommentCommand(projectId, mrIid, noteBody);

    // 如果有响应，在 MR 中添加评论回复（标记为内部评论，避免触发新的 webhook）
    if (response) {
      try {
        await this.gitlabClient.createMRNote(projectId, mrIid, response, { internal: true });
      } catch (error: any) {
        this.logger.error(`Failed to post response comment: ${error.message}`);
      }
    }
  }

  /**
   * 处理 Pipeline 事件
   */
  private async handlePipelineEvent(event: GitLabWebhookEvent) {
    const project = event.project;
    const pipeline = event.pipeline || event.object_attributes;
    const mergeRequest = event.merge_request;

    if (!project || !pipeline) {
      this.logger.warn("Missing project or pipeline in pipeline event");
      return;
    }

    const status = (pipeline as any).status || (pipeline as any).object_attributes?.status;
    const detailedStatus = (pipeline as any).detailed_status?.id || (pipeline as any).object_attributes?.detailed_status?.id || status;

    // 检查是否是 MR 相关的 pipeline
    const mrIid = mergeRequest?.iid || (pipeline as any).merge_request?.iid || (event.object_attributes as any)?.merge_request?.iid;
    if (!mrIid || typeof mrIid !== "number") {
      this.logger.debug("Pipeline is not associated with a merge request, skipping notification");
      return;
    }

    // 检查 MR 状态，如果已经合并或关闭，不发送通知
    const mrState = mergeRequest?.state;
    if (mrState === "merged" || mrState === "closed") {
      this.logger.info(`MR !${mrIid} is ${mrState}, skipping pipeline notification`);
      return;
    }

    const projectId = project.id;

    // 处理成功状态
    if (status === "success" || detailedStatus === "success") {
      this.logger.info(`Pipeline succeeded for MR !${mrIid}, notifying author`);
      try {
        await this.chatOpsService.handlePipelineSuccess(projectId, mrIid);
      } catch (error: any) {
        this.logger.error(`Failed to handle pipeline success: ${error.message || String(error)}`);
      }
      return;
    }

    // 处理失败状态
    if (status === "failed" || detailedStatus === "failed") {
      // 获取 pipeline ID
      const pipelineId = (pipeline as any).id || (pipeline as any).object_attributes?.id;
      this.logger.info(`Pipeline failed for MR !${mrIid}${pipelineId ? ` (pipeline ${pipelineId})` : ""}, checking notification`);
      try {
        await this.chatOpsService.handlePipelineFailure(projectId, mrIid, pipelineId);
      } catch (error: any) {
        this.logger.error(`Failed to handle pipeline failure: ${error.message || String(error)}`);
      }
      return;
    }

    // 其他状态（running, pending, created, canceled, skipped 等）不发送通知
    this.logger.debug(`Pipeline status is ${status}, skipping notification`);
  }
}
