declare interface CubeBridgeMessage {
  api: string;
  data: string;
  callbackId: string;
}

declare interface Window {
  /**
   * 定义 cube app 访问桥梁
   */
  cubeAppBridge?: {
    /**
     * @param message 发送的消息，应为标准 JSON 字符串
     */
    postMessage: (message: string) => void;
  };
  /**
   * @param message 接收的消息，应为标准 JSON 字符串
   * 定义 cube h5 对外提供数据接口（一般只在嵌入 app 时提供通道）
   */
  cubeH5Bridge?: {
    receiveMessage: (message: CubeBridgeMessage) => void;
  };
  __wxjs_environment: 'miniprogram' | 'miniprogram-appservice';
  WeixinJSBridge?: {
    invoke: unknown;
  };
}

declare const __ENV__: {
  baseApiUrL: string;
  isAppEmbedMode: boolean;
  // 自定义验证信息，一般为开发时填充
  authHeaders?: Record<string, string>;
}
