export const useChatUtils = (): {
  scrollChatListToBottom: () => void;
  mode: "CHAT" | "COMMAND";
  snFlag: boolean;
} => {
  function scrollChatListToBottom(): void {
    setTimeout(() => {
      document.querySelector(".chat-message-list")?.scrollTo({
        top: document.querySelector(".chat-message-list")?.scrollHeight,
        behavior: "smooth",
      });
    }, 0);
  }

  // 如果链接上指定了mode，则使用指定的mode，否则使用默认为COMMAND
  let mode = (new URLSearchParams(window.location.search).get("mode") as "CHAT" | "COMMAND") ?? "COMMAND";
  // 如果mode不是一个有效值，则使用默认值
  if (mode !== "CHAT" && mode !== "COMMAND") {
    mode = "COMMAND";
  }

  const snFlag = !!new URLSearchParams(window.location.search).get("snFlag");
  return {
    scrollChatListToBottom,
    mode,
    snFlag,
  };
};
