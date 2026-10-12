import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/assistant",
  },
  {
    name: "assistant",
    path: "/assistant",
    meta: {
      title: "AI 助手",
    },
    component: async () => (await import("@/views/assistant/assistant-chat")).AssistantChat,
  },
  {
    name: "flow-list",
    path: "/flows",
    meta: {
      title: "流程画布",
    },
    component: async () => (await import("@/views/flow-list/flow-list")).FlowList,
  },
  {
    name: "agents",
    path: "/agents",
    meta: {
      title: "智能体",
    },
    component: async () => (await import("@/views/agent-management/agent-hub-page")).AgentHubPage,
  },
  {
    name: "agent-library",
    path: "/agents/library",
    redirect: { path: "/agents", query: { tab: "library" } },
  },
  {
    name: "my-agent",
    path: "/agents/my",
    redirect: "/agents",
  },
  {
    name: "agent-create",
    path: "/agents/create",
    meta: {
      title: "创建智能体",
    },
    component: async () => (await import("@/views/agent-management/agent-create-page")).AgentCreatePage,
  },
  {
    name: "agent-edit",
    path: "/agents/edit/:id",
    meta: {
      title: "编辑智能体",
    },
    component: async () => (await import("@/views/agent-management/agent-create-page")).AgentCreatePage,
  },
  {
    name: "flow-editor",
    path: "/flows/:flowId/editor",
    meta: {
      title: "流程编辑",
    },
    component: async () => (await import("@/views/flow-editor/flow-editor")).FlowEditor,
  },
  {
    name: "knowledge-document-list",
    path: "/knowledge-documents",
    meta: {
      title: "知识文档",
    },
    component: async () => (await import("@/views/knowledge-document-list/knowledge-document-list")).KnowledgeDocumentList,
  },
  {
    name: "knowledge-base",
    path: "/knowledge-base",
    meta: {
      title: "知识库",
    },
    component: async () => (await import("@/views/knowledge-base/knowledge-base")).KnowledgeBase,
  },
  {
    name: "knowledge-search-result",
    path: "/knowledge-search",
    meta: {
      title: "搜索结果",
    },
    component: async () => (await import("@/views/knowledge-search-result/knowledge-search-result")).KnowledgeSearchResult,
  },
  {
    name: "knowledge-search-detail",
    path: "/knowledge-search/detail",
    meta: {
      title: "段落详情",
    },
    component: async () => (await import("@/views/knowledge-search-detail/knowledge-search-detail")).KnowledgeSearchDetail,
  },
  {
    name: "knowledge-segmentation",
    path: "/knowledge-documents/:bizDocumentId/segmentation",
    meta: {
      title: "文档分段",
    },
    component: async () => (await import("@/views/knowledge-segmentation/knowledge-segmentation")).KnowledgeSegmentation,
  },
  {
    name: "knowledge-retrieval-test",
    path: "/knowledge-documents/:bizDocumentId/retrieval-test",
    meta: {
      title: "召回测试",
    },
    component: async () => (await import("@/views/knowledge-retrieval-test/knowledge-retrieval-test")).KnowledgeRetrievalTest,
  },
  {
    name: "model-management",
    path: "/model-management",
    meta: {
      title: "模型管理",
    },
    component: async () => (await import("@/views/model-management/model-management")).ModelManagement,
  },
  {
    name: "skills",
    path: "/skills",
    meta: {
      title: "技能中心",
    },
    component: async () => (await import("@/views/skill-management/skill-hub-page")).SkillHubPage,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/assistant",
  },
];
