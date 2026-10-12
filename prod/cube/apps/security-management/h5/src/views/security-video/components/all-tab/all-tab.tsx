import { Cell, CellGroup, Checkbox, CheckboxGroup, DropdownItem, DropdownMenu, Empty, List, Loading, PullRefresh } from "vant";
import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import type { TagType } from "@ghcloud/cube-iot-center-service";
import type { MonitorAreaTreeItem, MultipleVideoDevice } from "@ghcloud/cube-security-management-service";

import { VideoItem } from "../video-item/video-item";
import { AreaTreePanel } from "./area-tree-panel";
import { cubeDeviceCenterService, cubeSecurityManagementService } from "@/api/server";

import styles from "./all-tab.module.less";

interface Props {
  keyword?: string;
}

export const AllTab = defineComponent({
  props: ["keyword"],
  emits: ["totalChange", "collectChange"],
  setup: (props: Props, { expose, emit }) => {
    const DropdownMenuRef = ref();
    const refreshing = ref(false);
    const loading = ref(false);
    const searching = ref(false);
    const finished = ref(false);
    const dataSource = ref<MultipleVideoDevice[]>([]);
    const search = reactive<{
      status: undefined | boolean;
      areaId: string;
      area: string;
      tagSelect: string[];
      pageNumber: number;
      pageSize: number;
      total: number;
    }>({
      status: undefined,
      areaId: "",
      area: "",
      tagSelect: [],
      pageNumber: 0,
      total: 1,
      pageSize: 20,
    });
    const tagTypeList = ref<TagType[]>([]);
    const areaTree = ref<MonitorAreaTreeItem[]>([]);
    const pendingArea = ref({ id: "", name: "" });
    const statusText = computed(() => {
      if (typeof search.status === "boolean") {
        return search.status ? "在线" : "离线";
      }
      return "设备状态";
    });

    const onRefresh = async (): Promise<void> => {
      search.pageNumber = 0;
      finished.value = false;
      searching.value = true;
      dataSource.value = [];
      await onLoad();
    };

    const onLoad = async (): Promise<void> => {
      try {
        const isFirstPage = search.pageNumber === 0;
        if (!isFirstPage) {
          loading.value = true;
        }
        search.pageNumber++;
        const res = await cubeSecurityManagementService.getMultipleVideoDevicesPage({
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          keyword: props.keyword ?? "",
          areaId: search.areaId,
          status: search.status as unknown as boolean,
          tagCodes: search.tagSelect,
        });
        emit("totalChange", res.total);
        if (res.total <= search.pageSize) {
          finished.value = true;
        }
        if (res.records.length < search.pageSize) {
          finished.value = true;
        }
        if (res.pages <= search.pageNumber) {
          finished.value = true;
        }
        if (search.pageNumber === 1) {
          dataSource.value = [];
        }
        dataSource.value = [...dataSource.value, ...res.records];
      } catch {
        finished.value = true;
      } finally {
        loading.value = false;
        searching.value = false;
        refreshing.value = false;
      }
    };

    onMounted(() => {
      cubeSecurityManagementService.getMonitorAreaTree().then((res) => {
        areaTree.value = [
          {
            id: "",
            name: "全部",
          } as MonitorAreaTreeItem,
          ...removeEmptyAreaBranches(res),
        ];
      });
      cubeDeviceCenterService
        .getRefDeviceTagList({ tagCode: "builtin.app::SECURITY_MONITORING", prefixCodes: ["custom.app::deviceCenter", "builtin.usage"] })
        .then((res) => {
          tagTypeList.value = res;
        });
    });

    function removeEmptyAreaBranches(nodes: MonitorAreaTreeItem[]): MonitorAreaTreeItem[] {
      return nodes.reduce<MonitorAreaTreeItem[]>((visibleNodes, node) => {
        if (node.deviceCount === 0 || node.deviceCount === null) {
          return visibleNodes;
        }
        visibleNodes.push({
          ...node,
          children: removeEmptyAreaBranches(node.children ?? []),
        });
        return visibleNodes;
      }, []);
    }
    const confirmArea = (): void => {
      search.areaId = pendingArea.value.id;
      search.area = pendingArea.value.name;
      DropdownMenuRef.value?.close();
      void onRefresh();
    };
    expose({
      onRefresh,
    });
    return (): JSX.Element => (
      <>
        <DropdownMenu direction="down" overlay={false} ref={DropdownMenuRef} class={styles["dropdown-menu"]}>
          <DropdownItem
            title={search.areaId ? search.area : "所在区域"}
            onOpen={() => {
              pendingArea.value = { id: search.areaId, name: search.area };
            }}
          >
            <AreaTreePanel
              nodes={areaTree.value}
              selectedId={pendingArea.value.id}
              onSelect={(node) => {
                pendingArea.value = node;
              }}
              onCancel={() => {
                DropdownMenuRef.value?.close();
              }}
              onReset={() => {
                pendingArea.value = { id: "", name: "全部" };
                confirmArea();
              }}
              onConfirm={confirmArea}
            />
          </DropdownItem>
          <DropdownItem
            v-model={search.status}
            title={statusText.value}
            options={[
              { text: "全部", value: undefined },
              { text: "在线", value: true },
              { text: "离线", value: false },
            ]}
            onClose={() => {
              DropdownMenuRef.value?.close();
              onRefresh();
            }}
          />
          <DropdownItem title={search.tagSelect.length > 0 ? `已选择(${search.tagSelect.length})` : "设备标签"}>
            <div style={{ minHeight: "30vh", maxHeight: "50vh", overflowY: "auto" }}>
              <CheckboxGroup v-model={search.tagSelect}>
                <CellGroup inset style="width:100%;margin:0">
                  {tagTypeList.value.map((e) => (
                    <Cell
                      clickable
                      key={e.tagCode}
                      title={e.tagName}
                      onClick={() => {
                        if (!search.tagSelect.includes(e.tagCode)) {
                          search.tagSelect.push(e.tagCode);
                        } else {
                          search.tagSelect.splice(search.tagSelect.indexOf(e.tagCode), 1);
                        }
                        onRefresh();
                      }}
                      v-slots={{
                        "right-icon": () => (
                          <Checkbox
                            name={e.tagCode}
                            onClick={(event: Event) => {
                              event.stopPropagation();
                            }}
                          />
                        ),
                      }}
                    />
                  ))}
                </CellGroup>
              </CheckboxGroup>

              {tagTypeList.value.length === 0 && <Empty description="暂无可用标签" />}
            </div>
          </DropdownItem>
        </DropdownMenu>
        <div class={styles["scroll-area"]}>
          <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles.content}>
            {searching.value && (
              <div class={styles["loading-wrap"]}>
                <Loading vertical>加载中...</Loading>
              </div>
            )}
            <List
              v-model:loading={loading.value}
              finished={finished.value}
              finished-text={dataSource.value.length === 0 ? "" : "暂无更多数据"}
              onLoad={onLoad}
            >
              {dataSource.value.map((e) => (
                <VideoItem
                  key={e.id}
                  {...e}
                  onCollectChange={() => {
                    emit("collectChange");
                  }}
                />
              ))}
              {dataSource.value.length === 0 && search.pageNumber === 1 && !searching.value && !loading.value && (
                <Empty description="暂无数据" />
              )}
            </List>
          </PullRefresh>
        </div>
      </>
    );
  },
});
