import { ArrowLeftOutlined } from "@ant-design/icons-vue";
import { computed, defineComponent, onMounted, type PropType, type SlotsType } from "vue";
import { useRoute, useRouter } from "vue-router";

import { Button, Empty, Menu, MenuItem } from "@ghcloud/cube-ui";

import { buildProjectListLocation } from "@/hooks/use-list-return-query";
import { useProjectId } from "@/hooks/use-project-id";
import type { ConfigGroup } from "@/views/project/project.const";
import { BUSINESS_CONFIG_TABS, MODEL_CONFIG_TABS } from "@/views/project/project.const";

import styles from "./config-shell.module.less";

/** 页面向标题文字后方挂载状态、类型等辅助信息 */
export const CONFIG_SHELL_TITLE_META_ID = "cube-visualization-config-shell-title-meta";

/** 面板配置等页面向标题栏右侧挂载操作区 */
export const CONFIG_SHELL_TITLE_EXTRA_ID = "cube-visualization-config-shell-title-extra";

type ConfigTab = { readonly key: string; readonly label: string };

const TAB_MAP: Record<ConfigGroup, readonly ConfigTab[]> = {
  business: BUSINESS_CONFIG_TABS,
  model: MODEL_CONFIG_TABS,
};

const TITLE_MAP: Record<ConfigGroup, string> = {
  business: "业务配置",
  model: "模型配置",
};

const MODEL_TITLE_DIVIDER_TABS = new Set(["render", "models", "other", "guide"]);

type ShellSlotProps = {
  activeTab: string;
  activeLabel: string;
};

/**
 * 配置壳：顶栏返回 + 左侧 Tab 切换，组内同界面完成操作。
 */
export const ConfigShell = defineComponent({
  name: "ConfigShell",
  props: {
    group: {
      type: String as PropType<ConfigGroup>,
      required: true,
    },
    contentLoading: {
      type: Boolean,
      default: false,
    },
  },
  slots: Object as SlotsType<{
    default?: (props: ShellSlotProps) => unknown;
  }>,
  setup(props, { slots }) {
    const route = useRoute();
    const router = useRouter();
    const { projectId, ensureProjectId } = useProjectId();

    const tabs = computed(() => TAB_MAP[props.group]);
    const title = computed(() => TITLE_MAP[props.group]);
    const projectName = computed(() => {
      const raw = route.query.projectName;
      return typeof raw === "string" ? raw : "";
    });

    const activeTab = computed(() => {
      const raw = route.query.tab;
      const tab = typeof raw === "string" ? raw : "";
      const matched = tabs.value.find((item) => item.key === tab);
      return matched?.key ?? tabs.value[0]?.key ?? "";
    });

    const activeLabel = computed(() => tabs.value.find((item) => item.key === activeTab.value)?.label ?? "");

    const switchTab = (key: string): void => {
      if (key === activeTab.value) {
        return;
      }
      const nextQuery = {
        ...route.query,
        tab: key,
      };
      if (key !== "guide") {
        delete nextQuery.guideId;
        delete nextQuery.id;
      }
      void router.replace({
        path: route.path,
        query: nextQuery,
      });
    };

    const goBack = (): void => {
      void router.push(buildProjectListLocation());
    };

    onMounted(() => {
      ensureProjectId();
      const raw = route.query.tab;
      const tab = typeof raw === "string" ? raw : "";
      if (!tabs.value.some((item) => item.key === tab) && tabs.value[0]) {
        void router.replace({
          path: route.path,
          query: {
            ...route.query,
            tab: tabs.value[0].key,
          },
        });
      }
    });

    return () => (
      <div class={[styles.root, props.group === "business" ? styles.rootBusiness : styles.rootModel]}>
        <div class={styles.header}>
          <Button type="link" class={styles.back} onClick={goBack}>
            <ArrowLeftOutlined />
            返回项目管理
          </Button>
          <div class={styles.titleWrap}>
            <h1 class={styles.title}>{title.value}</h1>
            <span class={styles.titleDivider} aria-hidden="true" />
            <span class={styles.project} title={projectName.value || projectId.value || "--"}>
              {projectName.value || projectId.value || "--"}
            </span>
          </div>
        </div>

        <div class={styles.body}>
          <aside class={styles.sider}>
            <Menu mode="inline" selectedKeys={[activeTab.value]}>
              {tabs.value.map((tab) => (
                <MenuItem key={tab.key} eventkey={tab.key} onClick={() => switchTab(tab.key)}>
                  {tab.label}
                </MenuItem>
              ))}
            </Menu>
          </aside>
          <main class={styles.content}>
            <div class={[styles.panel, props.contentLoading ? styles.panelLoading : ""]}>
              <div
                class={[
                  styles.panelTitle,
                  props.group === "model" && MODEL_TITLE_DIVIDER_TABS.has(activeTab.value) ? styles.panelTitleSeparated : undefined,
                ]}
              >
                <div class={styles.panelTitleLead}>
                  <span class={styles.panelTitleText}>{activeLabel.value}</span>
                  <div id={CONFIG_SHELL_TITLE_META_ID} class={styles.panelTitleMeta} />
                </div>
                <div id={CONFIG_SHELL_TITLE_EXTRA_ID} class={styles.panelTitleExtra} />
              </div>
              <div
                class={[
                  styles.panelBody,
                  ["panel", "device", "models", "perspective", "roaming", "other"].includes(activeTab.value)
                    ? undefined
                    : styles.panelBodyScrollable,
                ]}
              >
                {slots.default ? (
                  slots.default({
                    activeTab: activeTab.value,
                    activeLabel: activeLabel.value,
                  })
                ) : (
                  <Empty class={styles.empty} description={`${activeLabel.value}功能迁移中，后续迭代将接入业务逻辑`}>
                    <div class={styles.meta}>
                      项目 ID：
                      {projectId.value || "--"}
                    </div>
                  </Empty>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  },
});

export default ConfigShell;
