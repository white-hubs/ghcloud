import { showToast } from "vant";
import { defineComponent, onActivated, onMounted, shallowRef, watch, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import { cubeAppService } from "@ghcloud/cube-app-js-sdk";

import { fetchAssistantSessionCount } from "../chat/assistant-session-service";
import { AgentSquarePanel } from "./components/agent-square-panel";
import { AiCenterHeader } from "./components/ai-center-header";
import { AiCenterTabs } from "./components/ai-center-tabs";
import { MyAssetsPanel } from "./components/my-assets-panel";
import { SkillLibraryPanel } from "./components/skill-library-panel";
import type { AiCenterTabKey } from "./types";
import { useAiCenter } from "./use-ai-center";

import styles from "./ai-center.module.less";

function resolveTabQuery(value: unknown): AiCenterTabKey | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "agents" || raw === "skills" || raw === "mine") {
    return raw;
  }
  return null;
}

export const AiCenter = defineComponent({
  name: "AiCenter",
  setup: (): (() => VNode) => {
    const route = useRoute();
    const router = useRouter();
    const center = useAiCenter();
    const chatSessionCount = shallowRef(0);
    const loadingChatSessionCount = shallowRef(false);
    let skipInitialActivated = true;

    const handleBack = (): void => {
      cubeAppService.closePage().catch(() => {
        router.back();
      });
    };

    const openChat = (): void => {
      void router.push({ path: "/chat", query: { from: "ai-center" } });
    };

    const viewAgent = (id: string): void => {
      void router.push({ path: `/agent-detail/${encodeURIComponent(id)}` });
    };

    const addAgent = async (id: string): Promise<void> => {
      try {
        await center.addAgent(id);
        showToast("已添加到我的智能体");
      } catch (error) {
        showToast(error instanceof Error ? error.message : "添加智能体失败");
      }
    };

    const addSkill = async (id: string): Promise<void> => {
      try {
        await center.addSkill(id);
        showToast("已添加到我的技能");
      } catch (error) {
        showToast(error instanceof Error ? error.message : "添加技能失败");
      }
    };

    const loadChatSessionCount = async (): Promise<void> => {
      loadingChatSessionCount.value = true;
      try {
        chatSessionCount.value = await fetchAssistantSessionCount();
      } catch {
        chatSessionCount.value = 0;
      } finally {
        loadingChatSessionCount.value = false;
      }
    };

    onMounted(() => {
      void loadChatSessionCount();
    });

    watch(
      () => route.query.tab,
      (tab) => {
        const routeTab = resolveTabQuery(tab);
        if (routeTab) {
          center.activeTab.value = routeTab;
        }
      },
      { immediate: true },
    );

    onActivated(() => {
      if (skipInitialActivated) {
        skipInitialActivated = false;
        return;
      }
      void loadChatSessionCount();
    });

    const renderPanel = (): VNode => {
      if (center.activeTab.value === "skills") {
        return (
          <SkillLibraryPanel
            activeCategoryId={center.activeSkillCategoryId.value}
            categories={center.skillCategories.value}
            skills={center.visibleSkills.value}
            mySkillIds={center.mySkillIdSet.value}
            loading={center.loadingSkills.value}
            error={center.skillError.value}
            onChangeCategory={(id: string) => {
              center.activeSkillCategoryId.value = id;
            }}
            onAddSkill={addSkill}
          />
        );
      }
      if (center.activeTab.value === "mine") {
        return (
          <MyAssetsPanel
            agents={center.myAgents.value}
            skills={center.mySkills.value}
            getSkillCategory={center.getSkillCategory}
            loadingAgents={center.loadingMyAgents.value}
            agentError={center.myAgentError.value}
            loadingSkills={center.loadingMySkills.value}
            skillError={center.mySkillError.value}
            onRemoveAgent={async (id: string) => {
              try {
                await center.removeAgent(id);
                showToast("已移除智能体");
              } catch (error) {
                showToast(error instanceof Error ? error.message : "移除智能体失败");
              }
            }}
            onViewAgent={viewAgent}
            onRemoveSkill={async (id: string) => {
              try {
                await center.removeSkill(id);
                showToast("已移除技能");
              } catch (error) {
                showToast(error instanceof Error ? error.message : "移除技能失败");
              }
            }}
          />
        );
      }
      return (
        <AgentSquarePanel
          keyword={center.agentKeyword.value}
          groups={center.groupedAgents.value}
          myAgentIds={center.myAgentIdSet.value}
          loading={center.loadingAgents.value}
          error={center.agentError.value}
          onUpdateKeyword={(value: string) => {
            center.agentKeyword.value = value;
          }}
          onAddAgent={addAgent}
          onViewAgent={viewAgent}
        />
      );
    };

    return (): VNode => (
      <div class={styles.page}>
        <AiCenterHeader onBack={handleBack} />
        <button type="button" class={styles.chatEntry} onClick={openChat}>
          <span class={styles.chatEntryTitle}>对话助手</span>
          <span class={styles.chatEntryCount}>{loadingChatSessionCount.value ? "加载中" : `${chatSessionCount.value}个会话`}</span>
        </button>
        <AiCenterTabs
          active={center.activeTab.value}
          onChange={(key: AiCenterTabKey) => {
            center.activeTab.value = key;
          }}
        />
        <main class={styles.content}>{renderPanel()}</main>
      </div>
    );
  },
});
