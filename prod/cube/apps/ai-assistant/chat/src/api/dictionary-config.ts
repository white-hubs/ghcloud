import { getAgentList } from "@ghcloud/cube-ai-assistant-app/src/api/server";
import type { Agent } from "@ghcloud/cube-ai-assistant-app/src/api/type";

import { useChatUtils } from "@/hook/use-chat";

export const RAG_FLOW_CONFIG = {
  AGENT_LIST: [] as Agent[],
};

export const mockData = async (): Promise<void> => {
  try {
    const { mode } = useChatUtils();
    let res = await getAgentList();
    if (mode === "COMMAND") {
      res = res.filter((item) => item.useInUE);
    }
    RAG_FLOW_CONFIG.AGENT_LIST = res;
  } catch (error) {
    console.warn("[cube-ai-assistant-chat] load agent list failed", error);
    RAG_FLOW_CONFIG.AGENT_LIST = [];
  }
};

export const snMockData = (message: string): string => {
  const questionMap: Record<string, string> = {
    "今年安防监控报警最多的市场是？": "南昌公司",
    本月有哪些市场产生了明火烟雾报警: "成都公司、福田公司",
    "今年各二级市场处理率前三名和后三名的市场是哪些？":
      "南昌公司100%、福田公司96%、岳阳公司92%；处理最低的三个市场是：成都公司60%、宁夏海吉星58%、沈阳海吉星58%",
    "4、今年处理效率最高的三位处置人员和最低的三位处置人员是？":
      "处理效最高的三名员工是：南昌公司张三100%、福田公司夏洛90%、岳阳公司马冬梅80%；处理最低的三个市场是：成都公司陈红10%、宁夏海吉星孙彤彤12%、沈阳海吉星周海星15%",
    "今年产生一级报警数量最多的市场是？": "成都公司",
  };

  for (const e of Object.keys(questionMap)) {
    if (e.includes(message)) {
      return questionMap[e];
    }
  }
  return "1111";
};
