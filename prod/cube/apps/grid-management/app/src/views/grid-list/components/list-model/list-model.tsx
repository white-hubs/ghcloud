import styles from "./list-model.module.less";
import { cubeGridManagementService } from "@/api/server";
import { CardAlarmInfo } from "@/components/card-alarm-info/card-alarm-info";
import { CardBaseInfo } from "@/components/card-base-info/card-base-info";
import { CardTaskInfo } from "@/components/card-task-info/card-task-info";
import { ModelRender } from "@/components/model-render/model-render";
import { AreaTree } from "@ghcloud/cube-app-design";
import type { ModelConfig } from "@ghcloud/cube-grid-management-service";
import type { AreaTree as AreaTreeType } from "@ghcloud/cube-mdata-service";
import { ArrowRightOutlined, Empty, SearchOutlined, Spin } from "@ghcloud/cube-ui";
import { defineComponent, onMounted, ref } from "vue";

export const ListModel = defineComponent({
  name: "ListModel",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:show"],
  setup(props, { emit }) {
    const queryLoading = ref(true);
    const showError = ref(false);
    const modelConfig = ref<ModelConfig>();

    const filterAreaName = ref("");
    const selectArea = ref<AreaTreeType>();

    onMounted(async () => {
      // 查询网格模型配置
      cubeGridManagementService.getGridModelVisualizationConfig().then((res) => {
        if (!res) {
          showError.value = true;
        }
        modelConfig.value = res as ModelConfig;
        queryLoading.value = false;
      });
    });

    return () => (
      <div class={styles["grid-list"]} style={{ display: props.show ? "block" : "none" }}>
        {queryLoading.value ? (
          <div class={styles["list-loading"]}>
            {showError.value ? <Empty description="请检查网格模型配置" /> : <Spin tip="正在获取网格列表" />}
          </div>
        ) : (
          <>
            <div class={styles["left"]}>
              <div class={styles["area-search"]}>
                <input class={styles["search-input"]} v-model={filterAreaName.value} type="text" placeholder="请输入网格名称" />
                <div class={styles["search-icon"]}>
                  <SearchOutlined style={{ color: "#9ca3af", fontSize: "16px" }} />
                </div>
              </div>
              <div class={styles["area-tree"]}>
                <AreaTree
                  filterName={filterAreaName.value}
                  onSelect={(_keys, items) => {
                    if (!items.length) {
                      return;
                    }
                    if (items[0].id === selectArea.value?.id) {
                      return;
                    }
                    selectArea.value = items[0];
                  }}
                  onGetAreaTreeData={(data: AreaTreeType[]) => {
                    // 递归查询节点与模型配置相匹配的
                    const matchNode = (nodes: AreaTreeType[]): AreaTreeType | null => {
                      for (const node of nodes) {
                        if (modelConfig.value?.three.modelServer.find((item) => item.area.includes(node.id))) {
                          return node;
                        }
                        if (node.children?.length) {
                          const childNode = matchNode(node.children);
                          if (childNode) {
                            return childNode;
                          }
                        }
                      }
                      return null;
                    };

                    const selectedNode = matchNode(data);
                    if (selectedNode) {
                      selectArea.value = selectedNode;
                    } else {
                      showError.value = true;
                    }
                  }}
                />
              </div>
            </div>
            <div class={styles["glb-viewer"]}>
              {props.show && (
                <ModelRender
                  areaId={selectArea.value?.id as string}
                  smartCameraPaddingFactor={1}
                  pitchDegrees={60}
                  onLabelClick={(labelText) => {
                    if (!selectArea.value) {
                      return;
                    }
                    // 查找子节点 名称匹配的
                    const matchChidNode = (nodes: AreaTreeType[]): AreaTreeType | null => {
                      for (const node of nodes) {
                        if (node.name === labelText) {
                          return node;
                        }
                        if (node.children?.length) {
                          const childNode = matchChidNode(node.children);
                          if (childNode) {
                            return childNode;
                          }
                        }
                      }
                      return null;
                    };
                    const matchNode = matchChidNode(selectArea.value?.children ?? []);
                    if (matchNode) {
                      selectArea.value = matchNode;
                    } else {
                      showError.value = true;
                    }
                  }}
                />
              )}
            </div>
            <div class={styles["right"]}>
              <CardBaseInfo areaId={selectArea.value?.id as string} />
              <CardTaskInfo areaId={selectArea.value?.id as string} />
              <CardAlarmInfo areaId={selectArea.value?.id as string} />
            </div>
            <div
              class={styles["view-change-btn"]}
              onClick={() => {
                emit("update:show", false);
              }}
            >
              <ArrowRightOutlined />
              <span>列表</span>
            </div>
          </>
        )}
      </div>
    );
  },
});
