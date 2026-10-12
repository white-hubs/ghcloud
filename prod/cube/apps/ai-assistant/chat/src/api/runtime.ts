import { useXAgent, useXChat } from "@ant-design/x";
import type { XAgent } from "@ant-design/x/es/use-x-agent";
import type { MessageInfo } from "@ant-design/x/es/use-x-chat";

import { useChatUtils } from "@/hook/use-chat";
import { type Command, type CommandExecuteResult, PostMessageEvent } from "@/register";
// Import { message } from 'antd'
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import type { Agent } from "@ghcloud/cube-ai-assistant-app/src/api/type";

import { authStore } from "./auth-store";
import { RAG_FLOW_CONFIG } from "./dictionary-config";
import type { RootState } from "@/store";

interface AgentContextType {
  agent: XAgent<string>;
  loading: boolean;
  mode: "CHAT" | "COMMAND";
  currentChatAgent: Agent | undefined;
  messages: MessageInfo<string>[];
  onRequest: (message: string) => void;
  setMessages: (action: React.SetStateAction<MessageInfo<string>[]>) => void;
  changeChatAgent: (agentId: string) => void;
  cancelChat: () => void;
}
export enum AnswerType {
  COMMAND = "command",
  TEXT = "text",
  MARKDOWN = "markdown",
}

const GENERATING_COMMAND_TEXT = "正在生成指令... ⏳";
const INVALID_COMMAND_TEXT = "我暂时无法理解您的意思";
const COMMAND_NOT_SUPPORTED_TEXT = "我暂时无法理解您的意思";
const CHAT_CANCELLED_TEXT = "对话已取消";
const CHAT_ERROR_TEXT = "响应失败";
const CANCEL_FETCH_REASON = "user_cancel_fetch";
const AgentContext = React.createContext<AgentContextType | null>(null);

let fetchController: AbortController | null = null;

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const { scrollChatListToBottom, mode } = useChatUtils();
  const [currentChatAgent, setCurrentChatAgent] = useState<Agent | undefined>();
  const currentChatAgentRef = useRef(currentChatAgent);
  useEffect(() => {
    currentChatAgentRef.current = currentChatAgent;
  }, [currentChatAgent]);

  // 从Redux获取当前会话ID
  const currentConversationId = useSelector((state: RootState) => state.conversation.currentConversationId);

  // 使用ref存储当前会话ID，以便在普通函数中访问
  const currentConversationIdRef = useRef(currentConversationId);

  // 当currentConversationId变化时更新ref
  useEffect(() => {
    currentConversationIdRef.current = currentConversationId;
  }, [currentConversationId]);

  const [agent] = useXAgent({
    request: async ({ message }, { onUpdate, onError, onSuccess }) => {
      if (!message) {
        return;
      }
      onUpdate(""); // 这里是为了向message插入一条消息，否则对话loading会展示在用户发送的消息上
      setLoading(true);
      const response = await customFetch(message).catch((error) => {
        setLoading(false);
        if (error === CANCEL_FETCH_REASON) {
          aiResponse(AnswerType.TEXT, CHAT_CANCELLED_TEXT, onSuccess);
        } else {
          aiResponse(AnswerType.TEXT, CHAT_ERROR_TEXT, onSuccess);
        }
        throw error;
      });
      fetchController &&
        fetchController.signal.addEventListener("abort", () => {
          setLoading(false);
          aiResponse(AnswerType.TEXT, CHAT_CANCELLED_TEXT, onSuccess);
        });
      let responseText = "";
      let sessionId = "";

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const processLine = (line: string): void => {
        const trimmed = line.trim();
        if (!trimmed) {
          return;
        }
        try {
          const parsed = JSON.parse(trimmed);
          const event = parsed.event as string;
          const { data } = parsed;

          // token 流式输出（data 层有 chunk 字段）
          if (typeof data?.chunk === "string") {
            setLoading(false);
            responseText += data.chunk;
            let displayText = responseText;
            if (displayText.startsWith("<think>")) {
              displayText = displayText.replaceAll("<think>", "").replaceAll("</think>", "");
              inIframe() && window.parent.postMessage({ type: PostMessageEvent.AI_THINKING, data: displayText }, "*");
            }
            if (displayText.includes("</think>")) {
              displayText = responseText = displayText.replaceAll(/<think>[\s\S]*?<\/think>/g, "");
            }
            if (displayText.startsWith("{")) {
              displayText = GENERATING_COMMAND_TEXT;
            }
            aiResponse(distinguishAnswerType(displayText), displayText, onUpdate, false);
            return;
          }

          if (event === "add_message" && data) {
            // session_id 同步（任意一条 add_message 即可）
            if (data.session_id && !sessionId) {
              sessionId = data.session_id;
              window.dispatchEvent(
                new CustomEvent("update_conversation", {
                  detail: {
                    conversation_id: sessionId,
                    message: [],
                    name: message,
                    modelId: currentChatAgentRef.current?.id || "",
                  },
                }),
              );
            }
            // 取 Machine 发出的消息作为最终回复（覆盖 token 流累积内容，格式更完整）
            if (data.sender === "Machine" && data.text) {
              responseText = data.text;
            }
          }

          if (event === "end" && data?.result) {
            // 从 end 事件提取文本（当没有 token 流时兼容）
            if (!responseText) {
              const { outputs } = data.result;
              if (outputs?.[0]?.outputs?.[0]?.messages?.[0]?.message) {
                responseText = outputs[0].outputs[0].messages[0].message;
              } else if (outputs?.[0]?.outputs?.[0]?.results?.message?.text) {
                responseText = outputs[0].outputs[0].results.message.text;
              }
            }
          }
        } catch {
          // 当前行不是 JSON，忽略
        }
      };

      if (reader) {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            processLine(line);
          }
        }
        // 处理残余 buffer
        if (buffer) {
          processLine(buffer);
        }
      }

      // 流式结束后统一回调
      setLoading(false);
      console.log("[Langflow] responseText:", responseText);
      const jsonObj = getJSONObject(responseText);
      if (jsonObj) {
        if (jsonObj.action) {
          mode === "COMMAND" ? commandDispatch(jsonObj, onSuccess) : aiResponse(AnswerType.TEXT, COMMAND_NOT_SUPPORTED_TEXT, onSuccess);
        } else {
          aiResponse(AnswerType.TEXT, INVALID_COMMAND_TEXT, onSuccess);
        }
      } else {
        aiResponse(distinguishAnswerType(responseText), responseText, onSuccess, true);
      }
    },
  });
  const { onRequest, messages, setMessages } = useXChat({ agent });
  useEffect(() => {
    if (hasDuplicateIds(messages)) {
      setMessages(resetMessage(messages));
    }
  }, [messages]);
  const messagesRef = useRef(messages);
  const messageHandler = useCallback(({ data }: { data: { type: PostMessageEvent; data: unknown } }) => {
    if (data.type === PostMessageEvent.COMMAND_EXECUTE_RESULT) {
      const newMessages = handleMessage(data.data as CommandExecuteResult);
      if (newMessages) {
        setMessages(newMessages);
      }
    }
    if (data.type === PostMessageEvent.SUBMIT_MESSAGE) {
      onRequest(data.data as string);
    }
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (inIframe()) {
      window.parent.postMessage({ type: PostMessageEvent.ONLOAD }, "*");
      window.addEventListener("message", messageHandler, false);
      return (): void => {
        window.removeEventListener("message", messageHandler);
      };
    }
  }, []);

  return React.createElement(
    AgentContext.Provider,
    {
      value: {
        agent,
        currentChatAgent,
        loading,
        mode,
        messages,
        onRequest,
        setMessages,
        changeChatAgent: (agentId: string) => {
          const findAgent = RAG_FLOW_CONFIG.AGENT_LIST.find((agent) => agent.id === agentId);
          if (findAgent) {
            setCurrentChatAgent(findAgent);
          } else {
            RAG_FLOW_CONFIG.AGENT_LIST && setCurrentChatAgent(RAG_FLOW_CONFIG.AGENT_LIST[0]);
          }
        },
        cancelChat: () => {
          fetchController && fetchController.abort(CANCEL_FETCH_REASON);
        },
      },
    },
    children,
  );

  /** 自定义 AI 请求 - Langflow 实现 */
  async function customFetch(message: string): Promise<Response> {
    fetchController = new AbortController();

    function buildRunUrl(flowIdOrName: string): string {
      // 统一走 /api 代理（vite dev proxy / 生产同域网关），避免依赖字典里的 baseUrl
      const safeId = encodeURIComponent(flowIdOrName);
      return `/api/cube-flow/api/v1/run/${safeId}?stream=true`;
    }

    // 直接从 ref 中获取当前会话 ID
    let sessionId = currentConversationIdRef.current || "";
    if (sessionId.startsWith("default_")) {
      sessionId = "";
    }
    const flowIdOrName = currentChatAgentRef.current?.flowId || currentChatAgentRef.current?.id || "";
    const url = buildRunUrl(flowIdOrName);
    const token = authStore.token.trim();
    const authorization = token === "" ? "" : token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`;
    return fetch(url, {
      method: "POST",
      body: JSON.stringify({
        input_value: message,
        input_type: "chat",
        output_type: "chat",
        output_component: "chat_output",
        session_id: sessionId || undefined,
      }),
      headers: {
        "Content-Type": "application/json",
        tenant: authStore.tenant,
        terminal: String(authStore.terminal),
        authorization,
      },
      signal: fetchController.signal,
    });
  }

  // 提取 JSON 字符串，无论是直接的 JSON 还是 Markdown 代码块中的 JSON
  function extractJSON(str: string): string | null {
    if (typeof str !== "string") {
      return null;
    }

    // 尝试匹配 Markdown 代码块中的 JSON
    const markdownJsonRegex = /```(?:json)?\s*\n?([\s\S]*?)\n?```/;
    const markdownMatch = str.match(markdownJsonRegex);

    if (markdownMatch && markdownMatch[1]) {
      // 返回代码块中的内容
      return markdownMatch[1].trim();
    }

    // 如果不是 Markdown 代码块，直接返回原字符串
    return str;
  }

  // 检查字符串是否可以解析为 JSON
  function isJSON(str: string): boolean {
    if (typeof str !== "string") {
      return false;
    }

    try {
      JSON.parse(str);
      return true;
    } catch {
      // 尝试从 Markdown 代码块中提取 JSON
      const extracted = extractJSON(str);
      if (extracted && extracted !== str) {
        try {
          JSON.parse(extracted);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }

  // 获取 JSON 对象，无论输入是什么格式
  function getJSONObject(str: string): Command | null {
    if (!str) {
      return null;
    }

    // 直接尝试解析
    try {
      return JSON.parse(str);
    } catch {
      // 尝试从 Markdown 代码块中提取并解析
      const extracted = extractJSON(str);
      if (extracted && extracted !== str) {
        try {
          return JSON.parse(extracted);
        } catch {
          return null;
        }
      }
      return null;
    }
  }
  function hasDuplicateIds(obj: MessageInfo<string>[]): boolean {
    const idSet = new Set<string | number>();
    const items = Object.values(obj);

    for (const item of items) {
      if (idSet.has(item.id)) {
        return true; // 发现重复立即返回
      }
      idSet.add(item.id);
    }
    return false;
  }
  function resetMessage(obj: MessageInfo<string>[]): MessageInfo<string>[] {
    return obj.map((item, index) => ({
      ...item,
      id: `msg_${index}`,
    }));
  }
  function guid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replaceAll(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /** AI回复回显 */
  function aiResponse(type: AnswerType, message: string, successCallback: (message: string) => void, postMessage = true): void {
    const data = JSON.stringify({
      type,
      value: message,
    });
    successCallback(data);
    scrollChatListToBottom();
    inIframe() && postMessage && window.parent.postMessage({ type: PostMessageEvent.AI_RESPONSE, data }, "*");
  }

  /** 指令下发 */
  function commandDispatch(message: Command, successCallback: (message: string) => void): void {
    const command: Command = { ...message, callbackId: guid() };
    aiResponse(AnswerType.COMMAND, JSON.stringify({ ...command, executeResult: "waiting" }), successCallback);
  }

  /** 处理指令执行结果消息回调 */
  function handleMessage(callbackData: CommandExecuteResult): MessageInfo<string>[] {
    return messagesRef.current.map((messageItem) => {
      try {
        // 使用可选链和条件判断简化嵌套
        if (!isJSON(messageItem.message)) {
          return messageItem;
        }

        const parsedMessage = JSON.parse(messageItem.message);
        if (parsedMessage.type !== "command") {
          return messageItem;
        }

        const valueObj = JSON.parse(parsedMessage.value);
        if (valueObj.callbackId !== callbackData.callbackId) {
          return messageItem;
        }

        // 合并更新逻辑
        return {
          ...messageItem,
          message: JSON.stringify({
            ...parsedMessage,
            value: JSON.stringify({
              ...valueObj,
              executeResult: callbackData.result,
              message: callbackData.message,
            }),
          }),
        };
      } catch {
        return messageItem; // 保持原始数据不变
      }
    });
  }

  function inIframe(): boolean {
    return window !== window.top;
  }

  function distinguishAnswerType(message: string): AnswerType {
    if (message.startsWith("{")) {
      return AnswerType.COMMAND;
    } else if (message.startsWith("\n") || message.startsWith("```")) {
      return AnswerType.MARKDOWN;
    }
    return AnswerType.MARKDOWN;
  }
};

export const getAgentTool = (): AgentContextType => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error("getAgentTool must be used within an AgentProvider");
  }
  return context;
};
