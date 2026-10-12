import { computed, defineComponent, onMounted, reactive, ref, Teleport, watch } from "vue";

import type { SceneTypeMenu } from "@ghcloud/cube-service-interface/mdata";
import { listSceneTypeMenus } from "@ghcloud/cube-services-client/mdata.client";
import { Empty, Radio, RadioGroup, Spin, Tree, message } from "@ghcloud/cube-ui";

import { CONFIG_SHELL_TITLE_EXTRA_ID } from "../../config-shell";
import { BatchSave, type PanelSelectApi } from "./components/batch-save";
import { PanelSelect } from "./components/panel-select";
import { useAuthRequest } from "@/hooks/auth-request";
import { useProjectId } from "@/hooks/use-project-id";

import styles from "./panel-config.module.less";

type TreeNode = {
  key: string;
  title: string;
  children?: TreeNode[];
};

const AREA_LEVELS = [
  { label: "一级区域", value: "1" },
  { label: "二级区域", value: "2" },
  { label: "三级区域", value: "3" },
  { label: "四级区域", value: "4" },
];

const toTreeNodes = (menus: SceneTypeMenu[]): TreeNode[] =>
  menus.map((item) => ({
    key: item.id,
    title: item.name,
    children: item.children?.length ? toTreeNodes(item.children) : undefined,
  }));

/**
 * 面板配置：业务菜单树 + 区域层级 + 左右面板卡片编辑（对齐原 visual-config）。
 */
export const PanelConfig = defineComponent({
  name: "PanelConfig",
  setup() {
    const { projectId, ensureProjectId } = useProjectId();
    const loading = ref(false);
    const menuTree = ref<TreeNode[]>([]);
    const selectedKeys = ref<string[]>([]);
    const panelSelectRef = ref<PanelSelectApi | null>(null);
    const titleExtraReady = ref(false);
    const state = reactive({
      areaId: "1",
    });

    const sceneType = computed(() => selectedKeys.value[0] || "");

    const loadMenus = async (): Promise<void> => {
      if (!projectId.value) {
        menuTree.value = [];
        return;
      }
      loading.value = true;
      try {
        const list = await useAuthRequest(() => listSceneTypeMenus({ projectId: projectId.value }));
        menuTree.value = toTreeNodes(list);
      } catch {
        message.error("加载业务菜单失败");
        menuTree.value = [];
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      titleExtraReady.value = Boolean(document.getElementById(CONFIG_SHELL_TITLE_EXTRA_ID));
      if (ensureProjectId()) {
        void loadMenus();
      }
    });

    watch(projectId, (id, prev) => {
      if (id && id !== prev) {
        selectedKeys.value = [];
        void loadMenus();
      }
    });

    const renderTitleActions = (): JSX.Element => (
      <div class={styles.toolbarActions}>
        <RadioGroup
          value={state.areaId}
          optionType="button"
          buttonStyle="solid"
          onUpdate:value={(val: string | number) => {
            state.areaId = String(val);
          }}
        >
          {AREA_LEVELS.map((item) => (
            <Radio key={item.value} value={item.value}>
              {item.label}
            </Radio>
          ))}
        </RadioGroup>
        <BatchSave areaId={state.areaId} sceneType={sceneType.value} panelSelectRef={panelSelectRef} />
      </div>
    );

    return () => (
      <div class={styles.root}>
        {titleExtraReady.value ? <Teleport to={`#${CONFIG_SHELL_TITLE_EXTRA_ID}`}>{renderTitleActions()}</Teleport> : null}
        <Spin spinning={loading.value}>
          <div class={styles.layout}>
            <aside class={styles.tree}>
              {menuTree.value.length ? (
                <Tree
                  treeData={menuTree.value}
                  selectedKeys={selectedKeys.value}
                  defaultExpandAll
                  onSelect={(keys: Array<string | number>) => {
                    selectedKeys.value = keys.map(String).slice(0, 1);
                  }}
                />
              ) : (
                <Empty description="暂无业务菜单，请先配置" />
              )}
            </aside>

            <main class={styles.main}>
              {!sceneType.value ? (
                <Empty class={styles.empty} description="请选择左侧菜单" />
              ) : (
                <div class={styles.workspace}>
                  <PanelSelect ref={panelSelectRef} areaId={state.areaId} sceneType={sceneType.value} />
                </div>
              )}
            </main>
          </div>
        </Spin>
      </div>
    );
  },
});

export default PanelConfig;
