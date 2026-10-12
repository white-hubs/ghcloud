import { GitLabClient } from "../clients/gitlab-client";
import { UserMappingService } from "../config/user-mapping.config";
import { CIConfigService } from "./ci-config.service";
import { CodeReviewService } from "./code-review.service";
import { CommentCommandService, CommentCommand } from "./comment-command.service";
import { DingTalkService } from "./dingtalk.service";
import { OpenCubeService } from "./open-cube.service";
import { Injectable, Inject, LOGGER_TOKEN, CONFIG_SERVICE_TOKEN, ConfigService, type Logger } from "@dangao/bun-server";

/**
 * ChatOps 核心业务服务
 */
@Injectable()
export class ChatOpsService {
  private readonly enableDingtalkNotification: boolean;
  private readonly enableOpenimNotification: boolean;
  private readonly userMappingService?: UserMappingService;
  private readonly openimGroupIds?: string[];
  private readonly openimSendId: string;
  private readonly openimShowAtMentionInText: boolean;

  constructor(
    private readonly gitlabClient: GitLabClient,
    private readonly dingtalkService: DingTalkService,
    private readonly openCubeService: OpenCubeService,
    private readonly commentCommandService: CommentCommandService,
    private readonly ciConfigService: CIConfigService,
    private readonly codeReviewService: CodeReviewService,
    @Inject(CONFIG_SERVICE_TOKEN) private readonly configService: ConfigService,
    @Inject(LOGGER_TOKEN) private readonly logger: Logger,
  ) {
    const config = this.configService.get<any>("app");
    this.enableDingtalkNotification = config.enableDingtalkNotification ?? true;
    this.enableOpenimNotification = config.enableOpenimNotification ?? true;
    this.userMappingService = config.userMappingService;
    this.openimGroupIds = config.openim?.webhookGroupIds;
    this.openimSendId = config.openim?.sendId ?? "chatops-bot";
    this.openimShowAtMentionInText = config.openim?.showAtMentionInText ?? false;

    this.logger.info(
      `Notification settings: DingTalk=${this.enableDingtalkNotification}, OpenIM=${this.enableOpenimNotification}, OpenIM showAtMentionInText=${this.openimShowAtMentionInText}`,
    );
  }

  /**
   * 发送 OpenIM 消息（内部方法）
   * @param content 消息内容
   * @param atUsernames GitLab 用户名列表（用于 @ 提及）
   */
  private async sendOpenimMessage(content: string, atUsernames?: string[]): Promise<void> {
    if (!this.enableOpenimNotification) {
      this.logger.debug("OpenIM notification is disabled, skipping");
      return;
    }

    if (!this.openCubeService.isOpenApiSendEnabled()) {
      this.logger.debug("OpenIM API is not configured, skipping OpenIM notification");
      return;
    }

    // 获取要发送消息的群 ID（取第一个配置的群）
    const groupId = this.openimGroupIds?.[0];
    if (!groupId) {
      this.logger.warn("No OpenIM group ID configured, skipping OpenIM notification");
      return;
    }

    // 获取要 @ 的 OpenIM userID 列表
    let atUserList: string[] | undefined;
    if (atUsernames && atUsernames.length > 0 && this.userMappingService) {
      atUserList = this.userMappingService.getOpenimUserIdsBatch(atUsernames);
      this.logger.info(`Mapped GitLab users ${atUsernames.join(", ")} to OpenIM userIDs: ${atUserList.join(", ")}`);
    }

    try {
      // 判断是否需要发送 @ 消息
      const hasAtUsers = atUserList && atUserList.length > 0;

      // 如果启用了在文本中显示 @ 标记，在消息开头添加 @用户名
      let messageText = content;
      if (hasAtUsers && this.openimShowAtMentionInText && atUsernames && atUsernames.length > 0) {
        const atMentions = atUsernames.map((username) => `@${username}`).join(" ");
        messageText = `${atMentions} ${content}`;
      }

      // OpenIM 消息类型常量
      const CONTENT_TYPE_TEXT = 101;
      const CONTENT_TYPE_AT = 106;
      const SESSION_TYPE_GROUP = 3;

      const result = await this.openCubeService.forwardSendMessageToWebhookServer({
        sendID: this.openimSendId,
        groupID: groupId,
        // 如果有 @ 用户，使用 contentType=106（@ 消息），content 为对象格式
        // 否则使用 contentType=101（文本消息），content 为字符串
        content: hasAtUsers
          ? {
              text: messageText,
              atUserList: atUserList!,
              isAtSelf: false,
            }
          : messageText,
        contentType: hasAtUsers ? CONTENT_TYPE_AT : CONTENT_TYPE_TEXT,
        sessionType: SESSION_TYPE_GROUP,
      });

      if (result.errCode === 0) {
        this.logger.info(
          `OpenIM notification sent successfully to group ${groupId}${hasAtUsers ? ` with @ users: ${atUserList!.join(", ")}` : ""}`,
        );
      } else {
        this.logger.error(`OpenIM notification failed: ${result.errMsg}`);
      }
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      this.logger.error(`Failed to send OpenIM notification: ${errorMsg}`);
    }
  }

  /**
   * 构建审核通知的 OpenIM 消息内容
   */
  private buildReviewNotificationOpenimContent(
    projectName: string,
    mrTitle: string,
    mrUrl: string,
    reviewers: string[],
    author: string,
    isFirstCreate: boolean,
    description?: string,
    changes?: any,
  ): string {
    const titlePrefix = isFirstCreate ? "【创建】" : "【变更】";
    let content = `🔔 【CI】${titlePrefix}代码审核通知\n\n`;
    content += `项目: ${projectName}\n`;
    content += `合并请求: ${mrTitle}\n`;
    content += `链接: ${mrUrl}\n`;
    if (author) {
      content += `发起人: ${author}\n`;
    }
    content += `审核者: ${reviewers.join("、")}\n`;

    if (isFirstCreate && description) {
      content += `\n描述: ${description}\n`;
    }

    if (isFirstCreate && changes?.changes && Array.isArray(changes.changes)) {
      const fileChanges = changes.changes;
      const maxFiles = 5;
      const displayedFiles = fileChanges.slice(0, maxFiles);
      const remainingCount = fileChanges.length - maxFiles;

      if (displayedFiles.length > 0) {
        content += `\n变更文件 (共 ${fileChanges.length} 个):\n`;
        for (const file of displayedFiles) {
          const filePath = file.new_path || file.old_path || "未知文件";
          const status = file.new_file ? "新增" : file.deleted_file ? "删除" : "修改";
          content += `- ${status}: ${filePath}\n`;
        }
        if (remainingCount > 0) {
          content += `- ... 还有 ${remainingCount} 个文件\n`;
        }
      }
    }

    content += `\n请及时进行代码审核。`;
    return content;
  }

  /**
   * 停止正在运行的 CI Pipeline（内部方法）
   */
  private async stopRunningPipelines(projectId: string | number, mrIid: number): Promise<void> {
    try {
      // 获取 MR 的所有流水线
      const pipelines = await this.gitlabClient.getMRPipelines(projectId, mrIid);

      if (pipelines.length === 0) {
        this.logger.debug(`No pipelines found for MR !${mrIid}, nothing to cancel`);
        return;
      }

      // 查找正在运行或等待中的流水线
      const runningPipelines = pipelines.filter((p: any) => p.status === "running" || p.status === "pending" || p.status === "created");

      if (runningPipelines.length === 0) {
        this.logger.debug(`No running pipelines found for MR !${mrIid}, nothing to cancel`);
        return;
      }

      // 取消所有正在运行的流水线
      for (const pipeline of runningPipelines) {
        try {
          this.logger.info(`Canceling pipeline ${pipeline.id} for MR !${mrIid} before triggering new one`);
          await this.gitlabClient.cancelPipeline(projectId, pipeline.id);
        } catch (error: any) {
          // 如果取消失败（可能是流水线已经完成），记录日志但不抛出错误
          this.logger.warn(`Failed to cancel pipeline ${pipeline.id}: ${error.message || String(error)}`);
        }
      }

      this.logger.info(`Successfully canceled ${runningPipelines.length} pipeline(s) for MR !${mrIid}`);
    } catch (error: any) {
      // 如果获取流水线失败（可能是仓库没有配置 CI），记录日志但不抛出错误
      const errorMsg = error.message || String(error);
      this.logger.debug(`Failed to get pipelines for MR !${mrIid}: ${errorMsg}, assuming no CI configured`);
    }
  }

  /**
   * 处理 Merge Request 标题变化
   */
  async handleMRTitleChange(projectId: string | number, mrIid: number): Promise<void> {
    this.logger.info(`MR title changed, triggering CI for MR !${mrIid}`);
    // 先停止正在运行的 CI
    await this.stopRunningPipelines(projectId, mrIid);
    // 然后触发新的 CI
    await this.gitlabClient.triggerMRPipeline(projectId, mrIid);
  }

  /**
   * 处理 Merge Request 关闭事件
   * 停止相关的 CI 流水线（如果存在）
   */
  async handleMRClose(projectId: string | number, mrIid: number): Promise<void> {
    this.logger.info(`MR closed, attempting to stop pipelines for MR !${mrIid}`);
    try {
      // 获取 MR 的所有流水线
      const pipelines = await this.gitlabClient.getMRPipelines(projectId, mrIid);

      if (pipelines.length === 0) {
        this.logger.info(`No pipelines found for MR !${mrIid}, skipping cancel`);
        return;
      }

      // 查找正在运行或等待中的流水线
      const runningPipelines = pipelines.filter((p: any) => p.status === "running" || p.status === "pending" || p.status === "created");

      if (runningPipelines.length === 0) {
        this.logger.info(`No running pipelines found for MR !${mrIid}, skipping cancel`);
        return;
      }

      // 取消所有正在运行的流水线
      for (const pipeline of runningPipelines) {
        try {
          this.logger.info(`Canceling pipeline ${pipeline.id} for MR !${mrIid}`);
          await this.gitlabClient.cancelPipeline(projectId, pipeline.id);
        } catch (error: any) {
          // 如果取消失败（可能是流水线已经完成），记录日志但不抛出错误
          this.logger.warn(`Failed to cancel pipeline ${pipeline.id}: ${error.message || String(error)}`);
        }
      }

      this.logger.info(`Successfully canceled ${runningPipelines.length} pipeline(s) for MR !${mrIid}`);
    } catch (error: any) {
      // 如果获取流水线失败（可能是仓库没有配置 CI），记录日志但不抛出错误
      const errorMsg = error.message || String(error);
      this.logger.debug(`Failed to get pipelines for MR !${mrIid}: ${errorMsg}, assuming no CI configured`);
    }
  }

  /**
   * 处理 Merge Request 审核状态变化
   * @param skipNotification 是否跳过通知（用于批准事件，只触发 CI，不发送通知）
   */
  async handleMRReviewStatusChange(
    projectId: string | number,
    mrIid: number,
    addedReviewers?: { username: string; name?: string }[],
    authorUsername?: string,
    isFirstCreate: boolean = false,
    skipNotification: boolean = false,
  ): Promise<void> {
    this.logger.info(
      `MR review status changed, triggering CI for MR !${mrIid}, isFirstCreate: ${isFirstCreate}, skipNotification: ${skipNotification}`,
    );

    // 先停止正在运行的 CI
    await this.stopRunningPipelines(projectId, mrIid);
    // 然后触发新的 CI
    await this.gitlabClient.triggerMRPipeline(projectId, mrIid).catch((error: any) => {
      this.logger.error(`Failed to trigger pipeline: ${error.message || String(error)}`);
    });

    // 如果跳过通知（如批准事件），直接返回
    if (skipNotification) {
      this.logger.info(`Skipping notification for MR !${mrIid} (approval event)`);
      return;
    }

    // 发送审核通知（如果有新增的审核者）
    if (addedReviewers && addedReviewers.length > 0) {
      try {
        await this.notifyReviewers(
          projectId,
          mrIid,
          addedReviewers.map((r) => r.username),
          authorUsername,
          isFirstCreate,
        );
      } catch (error: any) {
        const errorMsg = error.message || String(error);
        this.logger.error(`Failed to send reviewer notification: ${errorMsg}`);
        // 不抛出错误，因为 CI 触发已经成功
      }
    } else {
      // 如果没有提供审核者列表，尝试从 API 获取
      try {
        await this.notifyReviewers(projectId, mrIid, undefined, authorUsername, isFirstCreate);
      } catch (error: any) {
        const errorMsg = error.message || String(error);
        this.logger.error(`Failed to send reviewer notification: ${errorMsg}`);
        // 不抛出错误，因为 CI 触发已经成功
      }
    }
  }

  /**
   * 处理 Pipeline 成功事件
   */
  async handlePipelineSuccess(projectId: string | number, mrIid: number): Promise<void> {
    this.logger.info(`Pipeline succeeded for MR !${mrIid}, notifying author`);

    try {
      // 获取 MR 信息
      const mr = await this.gitlabClient.getMR(projectId, mrIid);
      const project = await this.gitlabClient.getProject(projectId);

      const author = (mr as any).author?.username;
      if (!author) {
        this.logger.warn(`No author found for MR !${mrIid}`);
        return;
      }

      // 构建 MR URL
      const gitlabUrl = this.gitlabClient.getBaseUrl();
      const mrUrl = `${gitlabUrl}/${project.path_with_namespace}/-/merge_requests/${mrIid}`;
      const projectName = project.name || project.path_with_namespace;

      // 发送钉钉通知给发起人
      if (this.enableDingtalkNotification) {
        await this.dingtalkService.sendPipelineSuccessNotification(mr.title, mrUrl, projectName, author);
        this.logger.info(`DingTalk pipeline success notification sent to author: ${author}`);
      }

      // 发送 OpenIM 通知给发起人
      if (this.enableOpenimNotification) {
        let openimContent = `✅ 【CI】CI 检查通过\n\n`;
        openimContent += `项目: ${projectName}\n`;
        openimContent += `合并请求: ${mr.title}\n`;
        openimContent += `链接: ${mrUrl}\n`;
        openimContent += `状态: CI Pipeline 已全部通过\n\n`;
        openimContent += `您可以使用 /submit 命令提交合并。`;

        await this.sendOpenimMessage(openimContent, [author]);
        this.logger.info(`OpenIM pipeline success notification sent to author: ${author}`);
      }
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      this.logger.error(`Failed to send pipeline success notification: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * 处理 Pipeline 失败事件
   * @param projectId 项目 ID
   * @param mrIid MR IID
   * @param pipelineId Pipeline ID（可选，用于检查变量和失败的 jobs）
   */
  async handlePipelineFailure(projectId: string | number, mrIid: number, pipelineId?: number): Promise<void> {
    this.logger.info(`Pipeline failed for MR !${mrIid}${pipelineId ? ` (pipeline ${pipelineId})` : ""}`);

    // 如果提供了 pipelineId，检查是否需要跳过通知
    if (pipelineId) {
      try {
        // 1. 检查是否有 SKIP_NOTIFICATION 变量
        const variables = await this.gitlabClient.getPipelineVariables(projectId, pipelineId);
        const skipNotification = variables.find((v) => v.key === "SKIP_NOTIFICATION")?.value === "true";

        if (skipNotification) {
          this.logger.info(`Pipeline ${pipelineId} has SKIP_NOTIFICATION=true, skipping notification for MR !${mrIid}`);
          return;
        }

        // 2. 检查失败的 jobs 是否属于配置的跳过通知的 stage
        const jobs = await this.gitlabClient.getPipelineJobs(projectId, pipelineId);
        const failedJobs = jobs.filter((job) => job.status === "failed");
        const failedStages = new Set(failedJobs.map((job) => job.stage));

        // 获取项目配置的跳过通知的 stage 列表
        const skipNotificationStages = await this.ciConfigService.getSkipNotificationStages(projectId);

        // 如果所有失败的 stage 都在跳过列表中，跳过通知
        if (failedStages.size > 0 && skipNotificationStages.length > 0) {
          const allFailedStagesSkipped = Array.from(failedStages).every((stage) => skipNotificationStages.includes(stage));
          if (allFailedStagesSkipped) {
            this.logger.info(
              `Pipeline ${pipelineId} failed only in skipped stages (${Array.from(failedStages).join(", ")}), skipping notification for MR !${mrIid}`,
            );
            return;
          }
        }

        // 3. 兼容旧逻辑：如果只有 approval-check stage 失败，跳过通知（向后兼容）
        if (failedStages.size === 1 && failedStages.has("approval-check")) {
          this.logger.info(`Pipeline ${pipelineId} failed only in approval-check stage, skipping notification for MR !${mrIid}`);
          return;
        }
      } catch (error: any) {
        // 如果获取变量或 jobs 失败（可能是权限问题或 API 不可用），记录警告但继续发送通知
        const errorMsg = error.message || String(error);
        this.logger.warn(`Failed to get pipeline info for pipeline ${pipelineId}: ${errorMsg}, proceeding with notification`);
      }
    }

    try {
      // 获取 MR 信息
      const mr = await this.gitlabClient.getMR(projectId, mrIid);
      const project = await this.gitlabClient.getProject(projectId);

      const author = (mr as any).author?.username;
      if (!author) {
        this.logger.warn(`No author found for MR !${mrIid}`);
        return;
      }

      // 构建 MR URL
      const gitlabUrl = this.gitlabClient.getBaseUrl();
      const mrUrl = `${gitlabUrl}/${project.path_with_namespace}/-/merge_requests/${mrIid}`;
      const projectName = project.name || project.path_with_namespace;

      // 发送钉钉通知给发起人
      if (this.enableDingtalkNotification) {
        await this.dingtalkService.sendPipelineFailureNotification(mr.title, mrUrl, projectName, author);
        this.logger.info(`DingTalk pipeline failure notification sent to author: ${author}`);
      }

      // 发送 OpenIM 通知给发起人
      if (this.enableOpenimNotification) {
        let openimContent = `❌ 【CI】CI 检查失败\n\n`;
        openimContent += `项目: ${projectName}\n`;
        openimContent += `合并请求: ${mr.title}\n`;
        openimContent += `链接: ${mrUrl}\n`;
        openimContent += `状态: CI Pipeline 执行失败\n\n`;
        openimContent += `请检查 CI 日志并修复问题后重新提交。`;

        await this.sendOpenimMessage(openimContent, [author]);
        this.logger.info(`OpenIM pipeline failure notification sent to author: ${author}`);
      }
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      this.logger.error(`Failed to send pipeline failure notification: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * 通知审核者（内部方法）
   */
  private async notifyReviewers(
    projectId: string | number,
    mrIid: number,
    reviewerUsernames?: string[],
    authorUsername?: string,
    isFirstCreate: boolean = false,
  ): Promise<void> {
    this.logger.debug(`notifyReviewers called for MR !${mrIid}, provided reviewers: ${reviewerUsernames?.join(", ") || "none"}`);
    try {
      // 获取 MR 和项目信息
      const [mr, project] = await Promise.all([this.gitlabClient.getMR(projectId, mrIid), this.gitlabClient.getProject(projectId)]);

      this.logger.debug(`Got MR and project info for MR !${mrIid}`);

      // 获取审核者列表
      let reviewers: string[] = [];

      // 如果提供了审核者用户名列表，直接使用
      if (reviewerUsernames && reviewerUsernames.length > 0) {
        reviewers = reviewerUsernames;
        this.logger.debug(`Using provided reviewers: ${reviewers.join(", ")}`);
      } else {
        // 尝试从 approvals API 获取审核者
        try {
          const approvals = await this.gitlabClient.getMRApprovals(projectId, mrIid);
          if (approvals?.approved_by && Array.isArray(approvals.approved_by)) {
            for (const approver of approvals.approved_by) {
              if (approver?.user?.username) {
                reviewers.push(approver.user.username);
              }
            }
          }
        } catch (error) {
          this.logger.debug(`Failed to get approvals, trying alternative method: ${error}`);
        }

        // 如果 approvals API 没有返回审核者，尝试从 MR 对象获取
        if (reviewers.length === 0) {
          // GitLab MR API 可能返回 reviewers 字段
          if ((mr as any).reviewers && Array.isArray((mr as any).reviewers)) {
            for (const reviewer of (mr as any).reviewers) {
              if (reviewer?.username) {
                reviewers.push(reviewer.username);
              }
            }
          }
        }
      }

      if (reviewers.length === 0) {
        this.logger.info(`No reviewers found for MR !${mrIid}, skipping notification`);
        return;
      }

      // 获取发起人信息（优先使用传入的，否则从 MR 对象获取）
      const author = authorUsername || (mr as any).author?.username || "";

      // 构建 MR URL
      const gitlabUrl = this.gitlabClient.getBaseUrl();
      const mrUrl = `${gitlabUrl}/${project.path_with_namespace}/-/merge_requests/${mrIid}`;
      const projectName = project.name || project.path_with_namespace;

      // 获取变更文件信息（仅在首次创建时）
      let changes: any = null;
      if (isFirstCreate) {
        try {
          changes = await this.gitlabClient.getMRChanges(projectId, mrIid);
          this.logger.debug(`Got MR changes for MR !${mrIid}`);
        } catch (error: any) {
          this.logger.warn(`Failed to get MR changes: ${error.message || String(error)}`);
        }
      }

      // 发送钉钉通知
      if (this.enableDingtalkNotification) {
        this.logger.info(`Sending DingTalk notification to reviewers: ${reviewers.join(", ")}, isFirstCreate: ${isFirstCreate}`);
        await this.dingtalkService.sendReviewNotification(
          mr.title,
          mrUrl,
          projectName,
          reviewers,
          author,
          isFirstCreate,
          changes,
          (mr as any).description || "",
        );
        this.logger.info(`DingTalk notification sent successfully`);
      } else {
        this.logger.debug("DingTalk notification is disabled");
      }

      // 发送 OpenIM 通知
      if (this.enableOpenimNotification) {
        const description = (mr as any).description || "";
        const openimContent = this.buildReviewNotificationOpenimContent(
          projectName,
          mr.title,
          mrUrl,
          reviewers,
          author,
          isFirstCreate,
          description,
          changes,
        );
        await this.sendOpenimMessage(openimContent, reviewers);
      }
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      this.logger.error(`Failed to notify reviewers: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * 处理 /submit 命令
   */
  async handleSubmitCommand(projectId: string | number, mrIid: number): Promise<string> {
    this.logger.info(`Processing /submit command for MR !${mrIid}`);

    // 1. 获取 MR 信息，检查状态
    const mr = await this.gitlabClient.getMR(projectId, mrIid);
    const mrState = (mr as any).state;

    // 如果 MR 已经合并或关闭，直接返回
    if (mrState === "merged") {
      this.logger.info(`MR !${mrIid} already merged, skipping /submit command`);
      return "✅ MR 已经合并，无需操作。";
    }
    if (mrState === "closed") {
      this.logger.info(`MR !${mrIid} is closed, skipping /submit command`);
      return "❌ MR 已关闭，无法执行 /submit 命令。";
    }

    // 2. 获取最新的 Pipeline 状态
    const pipelines = await this.gitlabClient.getMRPipelines(projectId, mrIid);
    const latestPipeline = pipelines[0];

    if (!latestPipeline) {
      // 没有 Pipeline，先停止正在运行的 CI，然后触发一个新的
      this.logger.info(`No pipeline found, stopping any running pipelines and triggering new pipeline for MR !${mrIid}`);
      await this.stopRunningPipelines(projectId, mrIid);
      await this.gitlabClient.triggerMRPipeline(projectId, mrIid);
      return "已触发新的 CI Pipeline，请等待完成后再次使用 /submit 命令。";
    }

    // 检查 Pipeline 状态
    const { status } = latestPipeline;
    const detailedStatus = latestPipeline.detailed_status;

    if (status === "success" || detailedStatus?.id === "success") {
      // CI 通过，直接合并（不重新触发 CI）
      try {
        this.logger.info(`CI passed, attempting to merge MR !${mrIid} without triggering new pipeline`);
        await this.gitlabClient.mergeMR(projectId, mrIid, {
          mergeWhenPipelineSucceeds: false,
        });
        return "✅ CI 检查通过，MR 已自动合并！";
      } catch (error: any) {
        const errorMsg = error.message || String(error);
        this.logger.error(`Failed to merge MR: ${errorMsg}`);
        return `❌ CI 检查通过，但合并失败：${errorMsg}`;
      }
    } else if (status === "failed" || detailedStatus?.id === "failed") {
      // CI 失败，先停止正在运行的 CI，然后重新触发
      this.logger.info(`CI failed, stopping any running pipelines and triggering new pipeline for MR !${mrIid}`);
      await this.stopRunningPipelines(projectId, mrIid);
      await this.gitlabClient.triggerMRPipeline(projectId, mrIid);
      return "❌ CI 检查未通过，已重新触发 Pipeline，请修复问题后再次使用 /submit 命令。";
    } else if (status === "running" || status === "pending" || status === "created") {
      // CI 还在运行中或等待中
      return `⏳ CI Pipeline 正在运行中，请等待完成后再次使用 /submit 命令。当前状态：${status}`;
    } else {
      // 其他状态（如 canceled, skipped 等），先停止正在运行的 CI，然后重新触发
      this.logger.info(`Pipeline status is ${status}, stopping any running pipelines and triggering new pipeline for MR !${mrIid}`);
      await this.stopRunningPipelines(projectId, mrIid);
      await this.gitlabClient.triggerMRPipeline(projectId, mrIid);
      return `Pipeline 状态为 ${status}，已重新触发 Pipeline，请等待完成后再次使用 /submit 命令。`;
    }
  }

  /**
   * 处理 /reviewer 命令
   */
  async handleReviewerCommand(projectId: string | number, mrIid: number, reviewers: string[]): Promise<string> {
    this.logger.info(`Processing /reviewer command for MR !${mrIid}, reviewers: ${reviewers.join(", ")}`);

    if (reviewers.length === 0) {
      return "❌ 请指定至少一个审核者，例如：/reviewer @username1 @username2";
    }

    try {
      // 获取 MR 和项目信息
      const [mr, project] = await Promise.all([this.gitlabClient.getMR(projectId, mrIid), this.gitlabClient.getProject(projectId)]);

      // 构建 MR URL
      const gitlabUrl = this.gitlabClient.getBaseUrl();
      const mrUrl = `${gitlabUrl}/${project.path_with_namespace}/-/merge_requests/${mrIid}`;
      const projectName = project.name || project.path_with_namespace;

      // 获取发起人信息
      const author = (mr as any).author?.username || "";

      // 发送钉钉通知
      if (this.enableDingtalkNotification) {
        await this.dingtalkService.sendReviewNotification(mr.title, mrUrl, projectName, reviewers, author);
      }

      // 发送 OpenIM 通知
      if (this.enableOpenimNotification) {
        let openimContent = `🔔 【CI】代码审核通知\n\n`;
        openimContent += `项目: ${projectName}\n`;
        openimContent += `合并请求: ${mr.title}\n`;
        openimContent += `链接: ${mrUrl}\n`;
        if (author) {
          openimContent += `发起人: ${author}\n`;
        }
        openimContent += `审核者: ${reviewers.join("、")}\n\n`;
        openimContent += `请及时进行代码审核。`;

        await this.sendOpenimMessage(openimContent, reviewers);
      }

      return `✅ 已通知审核者：${reviewers.join("、")}，请等待审核。`;
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      this.logger.error(`Failed to send reviewer notification: ${errorMsg}`);
      return `❌ 发送审核通知失败：${errorMsg}`;
    }
  }

  /**
   * 处理 /cc 命令
   */
  async handleCCCommand(projectId: string | number, mrIid: number, ccUsers: string[], extraMessage?: string): Promise<string> {
    this.logger.info(`Processing /cc command for MR !${mrIid}, CC users: ${ccUsers.join(", ")}, extra message: ${extraMessage || "none"}`);

    if (ccUsers.length === 0) {
      return "❌ 请指定至少一个抄送用户，例如：/cc @username1 @username2 [额外消息]";
    }

    try {
      // 获取 MR 和项目信息
      const [mr, project] = await Promise.all([this.gitlabClient.getMR(projectId, mrIid), this.gitlabClient.getProject(projectId)]);

      // 构建 MR URL
      const gitlabUrl = this.gitlabClient.getBaseUrl();
      const mrUrl = `${gitlabUrl}/${project.path_with_namespace}/-/merge_requests/${mrIid}`;
      const projectName = project.name || project.path_with_namespace;

      // 获取发起人信息
      const author = (mr as any).author?.username || "";

      // 发送钉钉抄送通知
      if (this.enableDingtalkNotification) {
        await this.dingtalkService.sendCCNotification(mr.title, mrUrl, projectName, ccUsers, author, extraMessage);
      }

      // 发送 OpenIM 抄送通知
      if (this.enableOpenimNotification) {
        let openimContent = `📢 【CI】抄送通知\n\n`;
        openimContent += `项目: ${projectName}\n`;
        openimContent += `合并请求: ${mr.title}\n`;
        openimContent += `链接: ${mrUrl}\n`;
        if (author) {
          openimContent += `发起人: ${author}\n`;
        }
        openimContent += `抄送: ${ccUsers.join("、")}\n`;
        if (extraMessage) {
          openimContent += `\n消息: ${extraMessage}\n`;
        }
        openimContent += `\n请知悉。`;

        await this.sendOpenimMessage(openimContent, ccUsers);
      }

      const message = extraMessage ? `，附带消息：${extraMessage}` : "";
      return `✅ 已发送抄送通知给：${ccUsers.join("、")}${message}。`;
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      this.logger.error(`Failed to send CC notification: ${errorMsg}`);
      return `❌ 发送抄送通知失败：${errorMsg}`;
    }
  }

  /**
   * 处理 /ci 命令
   */
  async handleCICommand(projectId: string | number, mrIid: number): Promise<string> {
    this.logger.info(`Processing /ci command for MR !${mrIid}`);

    try {
      // 先停止正在运行的 CI
      await this.stopRunningPipelines(projectId, mrIid);
      // 然后触发新的 CI Pipeline
      await this.gitlabClient.triggerMRPipeline(projectId, mrIid);
      return "✅ 已重新触发 CI Pipeline，请等待完成。";
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      this.logger.error(`Failed to trigger CI pipeline: ${errorMsg}`);
      return `❌ 触发 CI Pipeline 失败：${errorMsg}`;
    }
  }

  /**
   * 处理 /review 命令
   */
  async handleReviewCommand(projectId: string | number, mrIid: number): Promise<string> {
    this.logger.info(`Processing /review command for MR !${mrIid}`);

    try {
      // 调用代码审查服务
      const reviewResult = await this.codeReviewService.reviewCode(projectId, mrIid);
      return `## 🤖 AI 代码审查报告\n\n${reviewResult}`;
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      this.logger.error(`Failed to perform code review: ${errorMsg}`);
      return `❌ 代码审查失败：${errorMsg}`;
    }
  }

  /**
   * 解析评论中的命令（供外部调用，用于检查是否包含命令）
   */
  parseCommand(body: string): { command: CommentCommand | null; args: string[] } {
    return this.commentCommandService.parseCommand(body);
  }

  /**
   * 处理评论命令
   */
  async handleCommentCommand(projectId: string | number, mrIid: number, body: string): Promise<string | null> {
    const { command } = this.commentCommandService.parseCommand(body);

    if (!command) {
      return null;
    }

    switch (command) {
      case CommentCommand.SUBMIT:
        return await this.handleSubmitCommand(projectId, mrIid);

      case CommentCommand.HELP:
        return this.commentCommandService.getHelpMessage();

      case CommentCommand.REVIEWER: {
        const mentions = this.commentCommandService.extractMentions(body);
        return await this.handleReviewerCommand(projectId, mrIid, mentions);
      }

      case CommentCommand.CC: {
        const mentions = this.commentCommandService.extractMentions(body);
        const extraMessage = this.commentCommandService.extractExtraMessage(body, CommentCommand.CC);
        return await this.handleCCCommand(projectId, mrIid, mentions, extraMessage);
      }

      case CommentCommand.CI:
        return await this.handleCICommand(projectId, mrIid);

      case CommentCommand.REVIEW:
        return await this.handleReviewCommand(projectId, mrIid);

      default:
        return null;
    }
  }
}
