import { GitLabClient } from "../clients/gitlab-client";
import { Injectable, Inject, CONFIG_SERVICE_TOKEN, LOGGER_TOKEN, ConfigService, type Logger } from "@dangao/bun-server";

/**
 * 配置文件内容最大长度（字符数）
 */
const MAX_CONFIG_FILE_LENGTH = 1000;

/**
 * 代码审查服务
 */
@Injectable()
export class CodeReviewService {
  private readonly apiKey?: string;
  private readonly baseURL: string;
  private readonly model: string;
  private readonly crPromptTemplatePath?: string;
  private readonly includeFiles?: string[];
  private readonly excludeFiles: string[];

  constructor(
    @Inject(CONFIG_SERVICE_TOKEN) private readonly configService: ConfigService,
    @Inject(LOGGER_TOKEN) private readonly logger: Logger,
    private readonly gitlabClient: GitLabClient,
  ) {
    const config = this.configService.get<{
      openai?: {
        apiKey?: string;
        baseURL?: string;
        model?: string;
        crPromptTemplatePath?: string;
        includeFiles?: string[];
        excludeFiles?: string[];
      };
    }>("app");
    const openaiConfig = config?.openai || {};
    this.apiKey = openaiConfig.apiKey;
    this.baseURL = openaiConfig.baseURL || "https://dashscope.aliyuncs.com/compatible-mode/v1";
    this.model = openaiConfig.model || "qwen-plus";
    this.crPromptTemplatePath = openaiConfig.crPromptTemplatePath;
    this.includeFiles = openaiConfig.includeFiles;
    this.excludeFiles = openaiConfig.excludeFiles || ["bun.lock", "yarn.lock", "package-lock.json", "pnpm-lock.yaml"];
  }

  /**
   * 将 glob 模式转换为正则表达式
   * @param pattern glob 模式
   * @returns 正则表达式
   */
  private globToRegex(pattern: string): RegExp {
    // 转义特殊字符，但保留 glob 通配符
    // 转义正则表达式特殊字符
    let regexStr = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    // 临时替换 **
    regexStr = regexStr.replace(/\*\*/g, "___DOUBLE_STAR___");
    // * 匹配除 / 外的任意字符
    regexStr = regexStr.replace(/\*/g, "[^/]*");
    // ** 匹配任意字符（包括 /）
    regexStr = regexStr.replace(/___DOUBLE_STAR___/g, ".*");
    // ? 匹配单个字符（除 / 外）
    regexStr = regexStr.replace(/\?/g, "[^/]");

    // 如果模式以 / 开头，从路径开始匹配
    if (pattern.startsWith("/")) {
      regexStr = `^${regexStr}`;
    } else {
      // 否则允许匹配路径的任何部分
      regexStr = `(^|/)${regexStr}`;
    }

    // 如果模式以 / 结尾，匹配到路径末尾
    if (pattern.endsWith("/")) {
      regexStr = `${regexStr}$`;
    } else {
      // 否则允许匹配到路径末尾或目录
      regexStr = `${regexStr}(/|$)`;
    }

    return new RegExp(regexStr);
  }

  /**
   * 检查文件路径是否匹配 glob 模式
   * @param filePath 文件路径
   * @param pattern glob 模式
   * @returns 如果匹配则返回 true
   */
  private matchesGlobPattern(filePath: string, pattern: string): boolean {
    // 精确匹配
    if (filePath === pattern) {
      return true;
    }

    // 如果模式包含通配符，使用 glob 匹配
    if (pattern.includes("*") || pattern.includes("?") || pattern.includes("**")) {
      const regex = this.globToRegex(pattern);
      return regex.test(filePath);
    }

    // 简单字符串匹配（向后兼容）
    return filePath.includes(pattern);
  }

  /**
   * 检查文件是否匹配包含列表
   * @param filePath 文件路径
   * @returns 如果文件匹配包含列表则返回 true
   */
  private matchesIncludePattern(filePath: string): boolean {
    if (!this.includeFiles || this.includeFiles.length === 0) {
      // 如果没有配置包含列表，所有文件都视为匹配
      return true;
    }

    // 检查是否匹配包含列表中的任何模式
    for (const includePattern of this.includeFiles) {
      if (this.matchesGlobPattern(filePath, includePattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 检查文件是否应该被排除
   * @param filePath 文件路径
   * @returns 如果文件应该被排除则返回 true
   */
  private shouldExcludeFile(filePath: string): boolean {
    if (!filePath) {
      return false;
    }

    // 如果配置了包含列表，先检查文件是否在包含列表中
    if (this.includeFiles && this.includeFiles.length > 0) {
      // 检查是否匹配包含列表中的任何模式
      let matchesInclude = false;
      for (const includePattern of this.includeFiles) {
        if (this.matchesGlobPattern(filePath, includePattern)) {
          matchesInclude = true;
          break;
        }
      }
      // 如果文件不在包含列表中，直接排除
      if (!matchesInclude) {
        return true;
      }
    }

    // 检查是否匹配排除列表中的任何模式（排除列表优先级更高）
    for (const excludePattern of this.excludeFiles) {
      if (this.matchesGlobPattern(filePath, excludePattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 从文件读取提示词模板
   * @param filePath 模板文件路径
   * @returns 模板内容，如果文件不存在则返回 null
   */
  private async loadPromptTemplateFromFile(filePath: string): Promise<string | null> {
    try {
      // 尝试在多个可能的位置查找文件
      const possiblePaths: string[] = [];

      if (filePath.startsWith("/") || filePath.match(/^[A-Z]:/)) {
        // 绝对路径
        possiblePaths.push(filePath);
      } else {
        // 相对路径，尝试多个位置
        const currentDir = process.cwd();
        // 当前目录
        possiblePaths.push(filePath);
        // 当前工作目录下的文件
        possiblePaths.push(`${currentDir}/${filePath}`);
        // 从项目根目录运行时的路径
        possiblePaths.push(`${currentDir}/standard/devops/chatops/${filePath}`);
      }

      // 尝试读取文件
      for (const possiblePath of possiblePaths) {
        try {
          const file = Bun.file(possiblePath);
          if (await file.exists()) {
            const content = await file.text();
            this.logger.debug(`从文件加载提示词模板：${possiblePath}`);
            return content.trim();
          }
        } catch {
          // 继续尝试下一个路径
        }
      }

      this.logger.debug(`提示词模板文件未找到，尝试的路径：${possiblePaths.join(", ")}`);
      return null;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.debug(`无法从文件加载提示词模板 ${filePath}：${errorMsg}`);
      return null;
    }
  }

  /**
   * 获取提示词模板（优先从文件读取，如果文件不存在则使用默认模板）
   */
  private async getPromptTemplate(): Promise<string> {
    // 如果配置了模板文件路径，尝试从文件读取
    if (this.crPromptTemplatePath) {
      const fileTemplate = await this.loadPromptTemplateFromFile(this.crPromptTemplatePath);
      if (fileTemplate) {
        return fileTemplate;
      }
      this.logger.warn(`提示词模板文件 ${this.crPromptTemplatePath} 不存在，使用默认模板`);
    }

    // 使用默认模板
    return this.getDefaultPromptTemplate();
  }

  /**
   * 获取默认的 CR 提示词模板
   */
  private getDefaultPromptTemplate(): string {
    return `你是一位经验丰富的代码审查专家。请对以下代码变更进行全面的代码审查。

## 审查要求

1. **代码质量**：检查代码逻辑、可读性、可维护性
2. **安全性**：识别潜在的安全漏洞和风险
3. **性能**：评估性能影响和优化建议
4. **最佳实践**：检查是否符合行业最佳实践和项目规范
5. **测试覆盖**：评估测试充分性

## 审查报告格式

请按照以下格式生成审查报告：

### 总体评分
- 评分：X/10（X 为 1-10 的整数）
- 总体评价：简要总结代码质量

### 问题分类统计
- **严重问题**：X 个（需要立即修复）
- **重要问题**：X 个（建议尽快修复）
- **一般问题**：X 个（可以后续优化）
- **建议**：X 个（可选优化项）

### 详细问题列表

按优先级从高到低列出所有问题：

#### 严重问题
1. [问题描述]
   - 位置：文件路径:行号
   - 说明：[详细说明]
   - 建议：[修复建议]

#### 重要问题
1. [问题描述]
   - 位置：文件路径:行号
   - 说明：[详细说明]
   - 建议：[修复建议]

#### 一般问题
1. [问题描述]
   - 位置：文件路径:行号
   - 说明：[详细说明]
   - 建议：[修复建议]

#### 建议
1. [建议内容]
   - 位置：文件路径:行号（如适用）
   - 说明：[详细说明]

### 修复优先级
- **P0（紧急）**：需要立即修复的问题（严重问题）
- **P1（高）**：建议尽快修复的问题（重要问题）
- **P2（中）**：可以后续优化的问题（一般问题）
- **P3（低）**：可选优化项（建议）

### 总结
[对本次代码变更的总体评价和建议]

---

请开始审查以下代码变更：`;
  }

  /**
   * 构建完整的提示词
   */
  private async buildPrompt(
    mrInfo: { title: string; description?: string; target_branch: string; source_branch: string; author?: { username?: string } },
    changes: { changes?: { new_path?: string; old_path?: string; diff?: string }[] },
    projectInfo: { id: string | number; name?: string; path_with_namespace: string },
  ): Promise<string> {
    // 获取提示词模板（优先从文件读取，如果文件不存在则使用默认模板）
    const prompt = await this.getPromptTemplate();

    // 添加项目上下文信息
    const projectContext = `
## 项目信息
- 项目名称：${projectInfo.name || projectInfo.path_with_namespace}
- 项目路径：${projectInfo.path_with_namespace}
- 目标分支：${mrInfo.target_branch}
- 源分支：${mrInfo.source_branch}
`;

    // 添加 MR 信息
    const authorUsername = mrInfo.author?.username || "未知";
    const mrContext = `
## Merge Request 信息
- 标题：${mrInfo.title}
- 描述：${mrInfo.description || "（无描述）"}
- 作者：${authorUsername}
`;

    // 添加变更文件信息
    let changesContext = "\n## 代码变更\n\n";
    if (changes?.changes && Array.isArray(changes.changes)) {
      const filteredChanges = changes.changes.filter((change) => {
        const filePath = change.new_path || change.old_path || "";
        return !this.shouldExcludeFile(filePath);
      });

      if (filteredChanges.length === 0) {
        changesContext += "（所有变更文件均被排除，或无法获取变更详情）\n";
      } else {
        const excludedCount = changes.changes.length - filteredChanges.length;
        if (excludedCount > 0) {
          changesContext += `> 已排除 ${excludedCount} 个文件（根据配置的排除规则）\n\n`;
        }

        for (const change of filteredChanges) {
          const filePath = change.new_path || change.old_path || "未知文件";
          const diff = change.diff || "";
          changesContext += `### 文件：${filePath}\n\n`;
          changesContext += `\`\`\`diff\n${diff}\n\`\`\`\n\n`;
        }
      }
    } else {
      changesContext += "（无法获取变更详情）\n";
    }

    // 尝试获取项目配置文件作为上下文
    let projectFilesContext = "";
    try {
      // 尝试读取常见的配置文件（并行获取以提高性能）
      const configFiles = [".oxlintrc.json", "package.json", "tsconfig.json", "README.md"];
      const filePromises = configFiles.map(async (configFile) => {
        try {
          const content = await this.gitlabClient.getRepositoryFile(projectInfo.id, configFile, mrInfo.target_branch);
          return { file: configFile, content: content.substring(0, MAX_CONFIG_FILE_LENGTH) };
        } catch {
          // 忽略文件不存在的错误
          return null;
        }
      });

      const fileResults = await Promise.all(filePromises);
      for (const result of fileResults) {
        if (result) {
          projectFilesContext += `\n### ${result.file}\n\`\`\`\n${result.content}\n\`\`\`\n`;
        }
      }
    } catch {
      // 忽略获取配置文件失败的错误
    }

    if (projectFilesContext) {
      projectFilesContext = `\n## 项目配置文件（参考）\n${projectFilesContext}`;
    }

    // 组合完整的提示词
    return `${prompt}${projectContext}${mrContext}${changesContext}${projectFilesContext}`;
  }

  /**
   * 调用 OpenAI API 进行代码审查
   */
  async reviewCode(projectId: string | number, mrIid: number): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OpenAI API Key 未配置，请设置 OPENAI_API_KEY 环境变量或 --openai-api-key 参数");
    }

    this.logger.info(`开始代码审查：MR !${mrIid}`);

    try {
      // 获取 MR 信息
      const mrInfo = await this.gitlabClient.getMR(projectId, mrIid);
      this.logger.debug(`获取到 MR 信息：${mrInfo.title}`);

      // 获取项目信息
      const projectInfo = await this.gitlabClient.getProject(projectId);
      this.logger.debug(`获取到项目信息：${projectInfo.name}`);

      // 获取变更信息
      const changes = await this.gitlabClient.getMRChanges(projectId, mrIid);
      this.logger.debug(`获取到变更信息，共 ${changes?.changes?.length || 0} 个文件变更`);

      // 构建提示词
      const prompt = await this.buildPrompt(mrInfo, changes, projectInfo);
      this.logger.debug(`构建提示词完成，长度：${prompt.length}`);

      // 调用 OpenAI API
      const apiURL = `${this.baseURL}/chat/completions`;
      const response = await fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              // 系统提示：定义 AI 的角色和能力
              content: "你是一位经验丰富的代码审查专家，擅长发现代码问题并提供建设性的改进建议。",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          // 降低温度以获得更一致和准确的审查结果
          temperature: 0.3,
          // 允许较长的回复以包含详细的审查报告
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`OpenAI API 调用失败：${response.status} ${response.statusText}`);
        this.logger.error(`错误详情：${errorText}`);
        throw new Error(`OpenAI API 调用失败：${response.status} ${errorText}`);
      }

      const result = (await response.json()) as { choices?: { message?: { content?: string } }[] };
      const reviewContent = result.choices?.[0]?.message?.content;

      if (!reviewContent) {
        throw new Error("OpenAI API 返回结果为空");
      }

      this.logger.info(`代码审查完成：MR !${mrIid}`);
      return reviewContent;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`代码审查失败：${errorMsg}`);
      throw error;
    }
  }
}
