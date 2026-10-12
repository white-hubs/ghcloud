import { CaretDownOutlined, EnvironmentOutlined, ProfileOutlined, SearchOutlined } from "@ant-design/icons-vue";
import { Input, Select, message } from "ant-design-vue";
import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import UniversalPanelCardIcon from "../_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS } from "../_shared/universal-panel-v2";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { openDeviceModalSimplify } from "@/features/widgets/modal/device-model-simplify/device-model-simplify";
import { getDeviceListBuyScene } from "@/infrastructure/api/device";
import bus from "@/infrastructure/utils/bus";
import MonitorGridsModal from "@/shared-ui/modals/monitor-grids-modal/monitor-grids-modal";
import NoData from "@/shared-ui/panel/noData";
import { eventInstance } from "@/visualization-core/event/event";
import { storeMarket } from "@/visualization-core/stores/other";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./floor-device-list.module.less";

export const FloorDeviceList = defineComponent({
  name: "FloorDeviceList",
  setup() {
    const { globalState } = useStateStore();

    const deviceQuery = reactive({
      status: null as string | null,
      keyword: "",
      pageSize: 20,
      pageNumber: 1,
      total: 0,
      pages: 0,
    });
    const loopInterval = ref<ReturnType<typeof setInterval>>();
    const allChecked = ref(false);
    const cameraList = ref<any[]>([]);
    const visible = ref(false);
    const piniaStoreMarket = storeMarket();
    const modal = reactive({
      visible: false,
      name: "设备名称",
      status: "NORMAL",
      code: "",
      areaName: "",
    });

    const column = [
      { title: "设备名称", dataIndex: "name", flex: 1, align: "left" as const },
      { title: "状态", dataIndex: "status", width: 70, align: "center" as const },
      { title: "操作", dataIndex: "operate", width: 110, align: "center" as const },
    ];

    const styleItem = computed(() => (item: (typeof column)[number]) => {
      const style: Record<string, string | number> = {
        textAlign: item.align || "left",
        boxSizing: "border-box",
        minWidth: 0,
      };
      if (item.flex !== undefined) {
        style.flex = `${item.flex} 1 0%`;
        style.width = "auto";
      } else if (item.width != null) {
        style.flex = `0 0 ${item.width}px`;
        style.width = `${item.width}px`;
        style.maxWidth = `${item.width}px`;
      }
      return style;
    });

    const tableData = ref<any[]>([]);
    const lastIndex = ref(0);

    const getPopupContainer = (): HTMLElement => (document.querySelector(".view") as HTMLElement) || document.body;

    const positioning = async (data: any): Promise<void> => {
      openDeviceModalSimplify({
        title: data.name,
        deviceId: data.id,
        onClose: () => {
          eventInstance.emitEvent("verifyModelStatus");
        },
      });
      eventInstance.emitEvent("locateToDevice", {
        deviceCode: data.code,
      });
    };

    const backModal = (): void => {
      modal.visible = false;
    };

    watch(
      () => [piniaStoreMarket.selectDevice, globalState.business.currentAreaId],
      () => {
        getData();
      },
    );

    const getData = async (): Promise<void> => {
      const query = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        pageNumber: deviceQuery.pageNumber,
        pageSize: deviceQuery.pageSize,
        status: deviceQuery.status,
        keyword: deviceQuery.keyword,
      };
      const DEVICE = await getDeviceListBuyScene(query);
      tableData.value = DEVICE.records;
      tableData.value.forEach((e) => {
        e.status = e.status.onlineState ? "NORMAL" : "OFFLINE";
        if (piniaStoreMarket.selectDevice.id === e.id) {
          e.checked = true;
        } else {
          e.checked = false;
        }
        e.isCheck = Boolean(e?.prodCategory?.name?.includes("摄像"));
      });
      deviceQuery.total = DEVICE.total;
      deviceQuery.pages = DEVICE.pages;
    };

    const detailsRow = (tr: any): void => {
      modal.visible = false;
      globalState.panel.rightPanelName = "";
      globalState.panel.leftPanelName = "deviceDetailsPanel";
      globalState.panel.universalPanelVo.left = null;
      globalState.panel.universalPanelVo.right = null;
      globalState.business.panelCurrentDeviceId = tr.id;
    };

    const allChangeCheck = (): void => {
      let isChecked = 0;
      tableData.value.forEach((e) => {
        if (e.isCheck && allChecked.value && isChecked < 9) {
          e.checked = true;
          isChecked++;
        } else if (e.isCheck && !allChecked.value) {
          e.checked = false;
        }
      });
      changeCheck();
    };

    const changeCheck = (tr?: any): void => {
      clearInterval(loopInterval.value);
      backModal();
      const arr = tableData.value.filter((e) => e.isCheck && e.checked);
      allChecked.value = arr.length === tableData.value.filter((e) => e.isCheck).length && arr.length > 0;
      if (arr.length > 9) {
        if (tr) tr.checked = false;
        message.warning("最多选择9个设备");
        return;
      }
      cameraList.value = arr;
      if (cameraList.value.length) {
        visible.value = true;
        loopInterval.value = setInterval(
          () => {
            loopVideoEvent();
          },
          1000 * 60 * 10,
        );
      } else {
        visible.value = false;
        clearInterval(loopInterval.value);
      }
    };

    const loopVideoEvent = async (): Promise<void> => {
      const totalDevices = tableData.value.length;
      const selectedCount = cameraList.value.length;
      if (totalDevices === 0 || selectedCount === 0) return;

      tableData.value.forEach((e) => (e.checked = false));
      const newSelectedDevices: any[] = [];
      let remainingDevices = selectedCount;

      while (remainingDevices > 0) {
        const availableDevices = totalDevices - lastIndex.value;
        const count = Math.min(remainingDevices, availableDevices);
        for (let i = 0; i < count; i++) {
          const index = lastIndex.value + i;
          if (tableData.value[index]) {
            tableData.value[index].checked = true;
          }
          newSelectedDevices.push(tableData.value[index]);
        }
        remainingDevices -= count;
        if (remainingDevices > 0) {
          deviceQuery.pageNumber += 1;
          await getData();
          lastIndex.value = 0;
        } else {
          lastIndex.value += count;
        }
      }

      cameraList.value = newSelectedDevices;
      if (deviceQuery.pageNumber > deviceQuery.pages) {
        deviceQuery.pageNumber = 1;
        await getData();
        lastIndex.value = 0;
      }
    };

    const clickTableRow = async (event: MouseEvent, data: any): Promise<void> => {
      bus.emit("closeDevicePanel");
      if ((event.target as HTMLElement).className === "ant-checkbox-input") return;
      await UeClient.getInstance().saveNowViewPoint();
      Object.assign(modal, data);
      modal.visible = true;
    };

    onMounted(() => {
      getData();
    });

    onBeforeUnmount(() => {
      clearInterval(loopInterval.value);
    });

    const renderSearchBar = (isZoom: boolean): JSX.Element => (
      <div class={["search-bar", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <Select
          value={deviceQuery.status}
          placeholder="设备状态"
          class="panel-filter-select status-select"
          popupClassName="date-inline-dropdown"
          getPopupContainer={getPopupContainer}
          allowClear
          dropdownMatchSelectWidth={false}
          onChange={(value: string) => {
            deviceQuery.status = value ?? null;
            deviceQuery.pageNumber = 1;
            getData();
          }}
          v-slots={{
            suffixIcon: () => <CaretDownOutlined class="filter-arrow" />,
          }}
        >
          <Select.Option value="ONLINE">在线</Select.Option>
          <Select.Option value="OFFLINE">离线</Select.Option>
        </Select>
        <div class="keyword-search">
          <Input
            value={deviceQuery.keyword}
            class="keyword-input"
            allowClear
            placeholder="按设备名称搜索"
            onUpdate:value={(value: string) => {
              deviceQuery.keyword = value;
            }}
            onPressEnter={() => {
              deviceQuery.pageNumber = 1;
              getData();
            }}
          />
          <button
            type="button"
            class="keyword-search-btn"
            aria-label="搜索"
            onClick={() => {
              deviceQuery.pageNumber = 1;
              getData();
            }}
          >
            <SearchOutlined />
          </button>
        </div>
      </div>
    );

    const renderTable = (isZoom: boolean): JSX.Element => (
      <div class={["device-table", "device-roll-table", "visual-v2-roll-table", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {tableData.value.length > 0 ? (
          <div class="roll-table flex-column">
            <div class="header table-row flex-between">
              {column.map((td, index) => (
                <div class="table-th" key={index} style={styleItem.value(td)}>
                  {td.dataIndex === "name" ? (
                    <a-checkbox
                      class="checkbox-box name-header-checkbox"
                      onChange={allChangeCheck}
                      checked={allChecked.value}
                      onUpdate:checked={(v: boolean) => {
                        allChecked.value = v;
                      }}
                      onClick={(e: Event) => e.stopPropagation()}
                    >
                      {td.title}
                    </a-checkbox>
                  ) : (
                    <span>{td.title}</span>
                  )}
                </div>
              ))}
            </div>
            <div class={["device_item", isZoom ? "device_item-zoom" : ""]}>
              {tableData.value.map((tr, index) => (
                <div class="table-tr table-row flex-between" key={tr?.key || index} onClick={($event) => clickTableRow($event, tr)}>
                  {column.map((td, j) => (
                    <div class="table-td" key={`${index}_${j}`} style={styleItem.value(td)}>
                      {td.dataIndex === "status" &&
                        (tr.status === "NORMAL" ? <span class="status-online">在线</span> : <span class="status-offline">离线</span>)}
                      {td.dataIndex === "operate" ? (
                        <div class="operate-actions flex-between">
                          <div
                            class="operate-link"
                            onClick={(e: Event) => {
                              e.stopPropagation();
                              void positioning(tr);
                            }}
                          >
                            <EnvironmentOutlined />
                            <span>定位</span>
                          </div>
                          <div
                            class="operate-link"
                            onClick={(e: Event) => {
                              e.stopPropagation();
                              detailsRow(tr);
                            }}
                          >
                            <ProfileOutlined />
                            <span>详情</span>
                          </div>
                        </div>
                      ) : null}
                      {td.dataIndex === "name" ? (
                        <div class="device-name-cell flex-between">
                          {tr.isCheck ? (
                            <a-checkbox
                              checked={tr.checked}
                              onUpdate:checked={(v: boolean) => {
                                tr.checked = v;
                              }}
                              onChange={() => changeCheck(tr)}
                              onClick={(e: Event) => e.stopPropagation()}
                            >
                              {tr[td.dataIndex]}
                            </a-checkbox>
                          ) : (
                            <span class="device-name-text">{tr[td.dataIndex]}</span>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div class="up-empty">
            <NoData />
          </div>
        )}
      </div>
    );

    const renderPagination = (): JSX.Element | null =>
      tableData.value.length > 0 ? (
        <a-pagination
          class="device-pagination"
          onChange={getData}
          current={deviceQuery.pageNumber}
          onUpdate:current={(v: number) => {
            deviceQuery.pageNumber = v;
          }}
          pageSize={deviceQuery.pageSize}
          onUpdate:pageSize={(v: number) => {
            deviceQuery.pageSize = v;
          }}
          total={deviceQuery.total}
          show-less-items
          showSizeChanger={false}
        />
      ) : null;

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["device-list-v2", "floor-device-list-v2-panel", isZoom ? "is-zoom floor-device-list-zoom" : ""]}>
        {renderSearchBar(isZoom)}
        {renderTable(isZoom)}
        {renderPagination()}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root floor-device-list-v2-root">
        <SubPanelTemplate
          title="设备数据"
          class={`${UNIVERSAL_PANEL_V2_CLASS} floor-device-list-v2-panel`}
          zoomable
          zoom-title="设备数据详情"
          zoom-width={860}
          v-slots={{
            titleIcon: () => <UniversalPanelCardIcon name="device" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
        <MonitorGridsModal
          visible={visible.value}
          onUpdate:visible={(v: boolean) => {
            visible.value = v;
          }}
          cameraList={cameraList.value}
        />
      </div>
    );
  },
});

export default FloorDeviceList;
