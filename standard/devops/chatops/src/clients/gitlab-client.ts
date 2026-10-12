import { Injectable, Inject, CONFIG_SERVICE_TOKEN, ConfigService } from "@dangao/bun-server";

/**
 * GitLab API 客户端
 */
@Injectable()
export class GitLabClient {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(@Inject(CONFIG_SERVICE_TOKEN) private readonly configService: ConfigService) {
    const config = this.configService.get<any>("app");
    this.baseUrl = config.gitlabUrl;
    this.token = config.gitlabToken;
  }

  /**
   * 获取 GitLab 基础 URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * 获取请求头
   */
  private getHeaders(): Record<string, string> {
    return {
      "PRIVATE-TOKEN": this.token,
      "Content-Type": "application/json",
    };
  }

  /**
   * 触发 Merge Request 的 CI Pipeline
   */
  async triggerMRPipeline(projectId: string | number, mrIid: number): Promise<any> {
    const url = `${this.baseUrl}/api/v4/projects/${projectId}/merge_requests/${mrIid}/pipelines`;
    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to trigger pipeline: ${error}`);
    }

    return await response.json();
  }

  /**
   * 获取 Merge Request 信息
   */
  async getMR(projectId: string | number, mrIid: number): Promise<any> {
    const url = `${this.baseUrl}/api/v4/projects/${projectId}/merge_requests/${mrIid}`;
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get MR: ${error}`);
    }

    return await response.json();
  }

  /**
   * 获取 Merge Request 的 Pipeline 状态
   */
  async getMRPipelines(projectId: string | number, mrIid: number): Promise<any[]> {
    const url = `${this.baseUrl}/api/v4/projects/${projectId}/merge_requests/${mrIid}/pipelines`;
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get pipelines: ${error}`);
    }

    const result = await response.json();
    return Array.isArray(result) ? result : [];
  }

  /**
   * 合并 Merge Request
   */
  async mergeMR(
    projectId: string | number,
    mrIid: number,
    options?: {
      mergeCommitMessage?: string;
      squash?: boolean;
      squashCommitMessage?: string;
      shouldRemoveSourceBranch?: boolean;
      mergeWhenPipelineSucceeds?: boolean;
    },
  ): Promise<any> {
    const url = `${this.baseUrl}/api/v4/projects/${projectId}/merge_requests/${mrIid}/merge`;
    const response = await fetch(url, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify({
        merge_commit_message: options?.mergeCommitMessage,
        squash: options?.squash,
        squash_commit_message: options?.squashCommitMessage,
        should_remove_source_branch: options?.shouldRemoveSourceBranch,
        merge_when_pipeline_succeeds: options?.mergeWhenPipelineSucceeds ?? false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to merge MR: ${error}`);
    }

    return await response.json();
  }

  /**
   * 在 Merge Request 中添加评论
   */
  async createMRNote(
    projectId: string | number,
    mrIid: number,
    body: string,
    options?: {
      internal?: boolean;
    },
  ): Promise<any> {
    const url = `${this.baseUrl}/api/v4/projects/${projectId}/merge_requests/${mrIid}/notes`;
    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        body,
        internal: options?.internal ?? false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create note: ${error}`);
    }

    return await response.json();
  }

  /**
   * 获取 Merge Request 的审核者信息
   */
  async getMRApprovals(projectId: string | number, mrIid: number): Promise<any> {
    const url = `${this.baseUrl}/api/v4/projects/${projectId}/merge_requests/${mrIid}/approvals`;
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get approvals: ${error}`);
    }

    return await response.json();
  }

  /**
   * 获取项目信息
   */
  async getProject(projectId: string | number): Promise<any> {
    const url = `${this.baseUrl}/api/v4/projects/${projectId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get project: ${error}`);
    }

    return await response.json();
  }

  /**
   * 取消/停止流水线
   */
  async cancelPipeline(projectId: string | number, pipelineId: number): Promise<any> {
    const url = `${this.baseUrl}/api/v4/projects/${projectId}/pipelines/${pipelineId}/cancel`;
    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to cancel pipeline: ${error}`);
    }

    return await response.json();
  }

  /**
   * 获取 Merge Request 的变更信息（包括变更文件列表）
   */
  async getMRChanges(projectId: string | number, mrIid: number): Promise<any> {
    const url = `${this.baseUrl}/api/v4/projects/${projectId}/merge_requests/${mrIid}/changes`;
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get MR changes: ${error}`);
    }

    return await response.json();
  }

  /**
   * 获取 Pipeline 的变量
   * @param projectId 项目 ID
   * @param pipelineId Pipeline ID
   * @returns Pipeline 变量数组
   */
  async getPipelineVariables(projectId: string | number, pipelineId: number): Promise<Array<{ key: string; value: string }>> {
    const url = `${this.baseUrl}/api/v4/projects/${projectId}/pipelines/${pipelineId}/variables`;
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      // 如果 API 返回 404 或 403，说明可能没有权限或变量不存在，返回空数组
      if (response.status === 404 || response.status === 403) {
        return [];
      }
      const error = await response.text();
      throw new Error(`Failed to get pipeline variables: ${error}`);
    }

    const result = await response.json();
    return Array.isArray(result) ? result : [];
  }

  /**
   * 获取 Pipeline 的 Jobs
   * @param projectId 项目 ID
   * @param pipelineId Pipeline ID
   * @returns Pipeline Jobs 数组
   */
  async getPipelineJobs(projectId: string | number, pipelineId: number): Promise<Array<{ id: number; name: string; stage: string; status: string }>> {
    const url = `${this.baseUrl}/api/v4/projects/${projectId}/pipelines/${pipelineId}/jobs`;
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      // 如果 API 返回 404 或 403，说明可能没有权限，返回空数组
      if (response.status === 404 || response.status === 403) {
        return [];
      }
      const error = await response.text();
      throw new Error(`Failed to get pipeline jobs: ${error}`);
    }

    const result = await response.json();
    return Array.isArray(result) ? result : [];
  }

  /**
   * 获取项目文件内容
   * @param projectId 项目 ID
   * @param filePath 文件路径（相对于项目根目录）
   * @param ref 分支或 tag（可选，默认为默认分支）
   * @returns 文件内容（base64 编码）
   */
  async getRepositoryFile(projectId: string | number, filePath: string, ref?: string): Promise<string> {
    const encodedPath = encodeURIComponent(filePath);
    const url = ref
      ? `${this.baseUrl}/api/v4/projects/${projectId}/repository/files/${encodedPath}/raw?ref=${encodeURIComponent(ref)}`
      : `${this.baseUrl}/api/v4/projects/${projectId}/repository/files/${encodedPath}/raw`;
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get repository file: ${error}`);
    }

    return await response.text();
  }
}
