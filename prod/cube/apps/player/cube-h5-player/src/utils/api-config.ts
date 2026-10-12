import { getQueryParameters } from "./url-utils.ts";

/**
 * 全局 API 配置
 * 用于支持动态切换不同环境的接口地址
 *
 * 注意：cube-player 内部使用的 CubeGateway 是基于原生 fetch 的，
 * 所以需要同时拦截 fetch 和 axios
 */
class ApiConfig {
  private _baseUrl: string = "";
  private originalFetch: typeof fetch | null = null;

  /** 获取当前环境的基础 URL */
  get baseUrl(): string {
    return this._baseUrl;
  }

  /**
   * 从 URL 参数初始化环境配置
   * 如果 URL 中包含 envUrl 参数，则使用该地址作为接口前缀
   * 例如：?envUrl=https://sn-jj.guheyun.cn:40201
   */
  init(): void {
    const { envUrl } = getQueryParameters();

    if (envUrl) {
      // 解码 URL 参数（可能被 encodeURIComponent 编码）
      this._baseUrl = decodeURIComponent(envUrl);
      // 移除末尾的斜杠
      if (this._baseUrl.endsWith("/")) {
        this._baseUrl = this._baseUrl.slice(0, -1);
      }
      // 设置 fetch 拦截器（CubeGateway 使用 fetch）
      this.setupFetchInterceptor();
    }
  }

  /**
   * 拦截全局 fetch，将相对路径转换为绝对路径
   * CubeGateway 和各 service 都是通过 fetch 发起请求的
   */
  private setupFetchInterceptor(): void {
    // 保存原始 fetch
    this.originalFetch = window.fetch.bind(window);

    // 重写全局 fetch
    const interceptedFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      let url: string;

      if (typeof input === "string") {
        url = input;
      } else if (input instanceof URL) {
        url = input.toString();
      } else if (input instanceof Request) {
        url = input.url;
      } else {
        url = String(input);
      }

      // 如果是相对路径（以 / 开头且不是 //），添加环境前缀
      if (url.startsWith("/") && !url.startsWith("//") && this._baseUrl) {
        const newUrl = `${this._baseUrl}${url}`;

        // 重新构建请求
        if (typeof input === "string") {
          return this.originalFetch!(newUrl, init);
        } else if (input instanceof Request) {
          // 克隆 Request 对象并修改 URL
          const newRequest = new Request(newUrl, input);
          return this.originalFetch!(newRequest, init);
        }
        return this.originalFetch!(newUrl, init);
      }

      // 非相对路径，直接使用原始 fetch
      return this.originalFetch!(input, init);
    };

    // 赋值给 window.fetch
    window.fetch = interceptedFetch as typeof fetch;
  }
}

export const apiConfig = new ApiConfig();
