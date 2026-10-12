import { computed, defineComponent, onMounted, ref, watch } from "vue";

import type { BusinessAreaNode, SceneTypeMenu } from "@ghcloud/cube-service-interface/mdata";
import { listBusinessAreas, listSceneTypeMenus } from "@ghcloud/cube-services-client/mdata.client";
import { Empty, Spin, Tree, message } from "@ghcloud/cube-ui";

import type { AssociationDataType } from "./association.types";
import { DevicePanel } from "./device-panel";
import { PropertyPanel } from "./property-panel";
import { RiskPanel } from "./risk-panel";
import { StallPanel } from "./stall-panel";
import { useAuthRequest } from "@/hooks/auth-request";
import { useProjectId } from "@/hooks/use-project-id";

import styles from "./device-association.module.less";

type TreeNode = {
  key: string;
  title: string;
  children?: TreeNode[];
};

const toTreeNodes = (menus: SceneTypeMenu[]): TreeNode[] =>
  menus.map((item) => ({
    key: item.id,
    title: item.name,
    children: item.children?.length ? toTreeNodes(item.children) : undefined,
  }));

/**
 * 设备关联：业务菜单树 + 设备/档位/资产/风险源关联。
 */
export const DeviceAssociation = defineComponent({
  name: "DeviceAssociation",
  setup() {
    const { projectId, ensureProjectId } = useProjectId();
    const loading = ref(false);
    const menuTree = ref<TreeNode[]>([]);
    const selectedKeys = ref<string[]>([]);
    const areaOptions = ref<BusinessAreaNode[]>([]);
    const dataType = ref<AssociationDataType>("DEVICE");

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

    const loadAreas = async (): Promise<void> => {
      try {
        areaOptions.value = await useAuthRequest(() => listBusinessAreas());
      } catch {
        areaOptions.value = [];
      }
    };

    const handleDataTypeChange = (value: AssociationDataType): void => {
      dataType.value = value;
    };

    onMounted(() => {
      if (ensureProjectId()) {
        void loadMenus();
        void loadAreas();
      }
    });

    watch(projectId, (id, prev) => {
      if (id && id !== prev) {
        selectedKeys.value = [];
        dataType.value = "DEVICE";
        void loadMenus();
        void loadAreas();
      }
    });

    return () => (
      <div class={styles.root}>
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
                <Empty description="暂无业务菜单" />
              )}
            </aside>

            <main class={styles.main}>
              {!sceneType.value ? (
                <Empty class={styles.empty} description="请选择左侧菜单" />
              ) : (
                <>
                  {dataType.value === "DEVICE" ? (
                    <DevicePanel
                      sceneType={sceneType.value}
                      areaOptions={areaOptions.value}
                      dataType={dataType.value}
                      onDataTypeChange={handleDataTypeChange}
                    />
                  ) : null}
                  {dataType.value === "STALL" ? (
                    <StallPanel
                      sceneType={sceneType.value}
                      areaOptions={areaOptions.value}
                      dataType={dataType.value}
                      onDataTypeChange={handleDataTypeChange}
                    />
                  ) : null}
                  {dataType.value === "PROPERTY" ? (
                    <PropertyPanel
                      sceneType={sceneType.value}
                      areaOptions={areaOptions.value}
                      dataType={dataType.value}
                      onDataTypeChange={handleDataTypeChange}
                    />
                  ) : null}
                  {dataType.value === "RISK_SOURCE" ? (
                    <RiskPanel
                      sceneType={sceneType.value}
                      areaOptions={areaOptions.value}
                      dataType={dataType.value}
                      onDataTypeChange={handleDataTypeChange}
                    />
                  ) : null}
                </>
              )}
            </main>
          </div>
        </Spin>
      </div>
    );
  },
});

export default DeviceAssociation;
