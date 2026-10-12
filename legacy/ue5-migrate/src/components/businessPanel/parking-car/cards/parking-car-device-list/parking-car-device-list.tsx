import { EnvironmentOutlined, ProfileOutlined } from "@ant-design/icons-vue";
import { Select, Input, Checkbox, Pagination, message } from "ant-design-vue";
import { defineComponent, ref, reactive, onMounted, computed, watch, onBeforeUnmount } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import { parkingStore } from "../../store/parking";
import { getDeviceListBuyScene } from "@/api/device";
import { cubeParkingLotService } from "@/api/service";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import MonitorGridsModal from "@/components/monitor-grids-modal/monitor-grids-modal.vue";
import { eventInstance } from "@/pages/event/event";
import { useStateStore } from "@/pages/state/use-state-store";
import { openDeviceModalSimplify } from "@/pages/widget/modal/device-model-simplify/device-model-simplify";
import { storeMarket } from "@/piniaStore/other";
import bus from "@/utils/bus";

import styles from "./parking-car-device-list.module.less";

/** 车场设备列表 */
export const ParkingCarDeviceList = defineComponent({
  setup() {
    const store = parkingStore();
    const { globalState } = useStateStore();
    const deviceQuery = reactive({
      status: null,
      keyword: "",
      pageSize: 10,
      pageNumber: 1,
      total: 0,
      pages: 0,
    });
    const loopInterval = ref();
    const allChecked = ref(false);
    const cameraList = ref([]);
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
      {
        title: "设备名称",
        dataIndex: "name",
        width: 200,
      },
      {
        title: "状态",
        dataIndex: "status",
        width: 80,
      },
      {
        title: "操作",
        dataIndex: "operate",
        width: 80,
      },
    ];

    const tableData = ref([]);

    const styleItem = computed(() => (item) => {
      let style = {};
      if (item?.width) {
        style = { ...style, width: item.width + "px" };
      }
      if (item?.align) {
        style = { ...style, textAlign: item.align };
      }
      return style;
    });

    const getData = async () => {
      let query = {
        pageNumber: deviceQuery.pageNumber,
        pageSize: deviceQuery.pageSize,
        keyword: deviceQuery.keyword,
        deviceState: null,
      };
      if (deviceQuery.status !== null) {
        query.deviceState = deviceQuery.status === "NORMAL";
      } else {
        delete query.deviceState;
      }
      if (store.currentParking) {
        const res = await cubeParkingLotService.getParkingDevicesById(store.currentParking?.id, query);
        tableData.value = res.records;
        deviceQuery.total = res.total;
        deviceQuery.pages = res.pages;
      } else {
        const res = await cubeParkingLotService.getParkingMonitorDevices();
        tableData.value = [];
        res?.forEach((item) => {
          tableData.value.push(...item.devices);
        });
      }
      tableData.value.forEach((e) => {
        e.status = e.status.onlineState ? "NORMAL" : "OFFLINE";
      });
    };
    const detailsRow = (tr) => {
      modal.visible = false;
      globalState.panel.rightPanelName = "";
      globalState.panel.leftPanelName = "deviceDetailsPanel";
      globalState.panel.universalPanelVo.left = null;
      globalState.panel.universalPanelVo.right = null;
      globalState.business.panelCurrentDeviceId = tr.id;
    };
    const clickTableRow = async (event, data) => {
      bus.emit("closeDevicePanel");
      if (event.target.className === "ant-checkbox-input") return;
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

    const renderDeviceList = (isZoom: boolean = false) => {
      const searchClass = isZoom ? styles.zoomSearch : styles.search;
      const deviceListClass = isZoom ? styles.zoomDeviceList : styles.device_list;
      const headerClass = isZoom ? [styles.zoomHeader, "flex-between"].join(" ") : [styles.header, "flex-between"].join(" ");
      const tableTrClass = isZoom ? [styles.zoomTableTr, "flex-between"].join(" ") : [styles["table-tr"], "flex-between"].join(" ");
      const tableThClass = isZoom ? styles.zoomTableTh : styles["table-th"];
      const tableTdClass = isZoom ? styles.zoomTableTd : styles["table-td"];
      const deviceItemClass = isZoom ? styles.zoomDeviceItem : styles.device_item;
      return (
        <>
          {store.currentParking && (
            <div class={searchClass + " flex-between"} data-no-zoom>
              <a-select
                placeholder="设备状态"
                v-model:value={deviceQuery.status}
                style={isZoom ? "width: 30%" : "width: 40%"}
                onChange={getData}
                options={[
                  { value: "ONLINE", label: "在线" },
                  { value: "OFFLINE", label: "离线" },
                ]}
              />
              <a-input-search
                enter-button
                v-model:value={deviceQuery.keyword}
                placeholder="按设备名称搜索"
                style={isZoom ? "width: 65%;margin-left: 4px;" : "width: 55%;margin-left: 4px;"}
                onSearch={getData}
              />
            </div>
          )}
          <div class={deviceListClass} data-no-zoom>
            <div class={headerClass}>
              {column.map((td) => (
                <div class={tableThClass} style={styleItem.value(td)}>
                  <span>{td.title}</span>
                </div>
              ))}
            </div>
            <div class={deviceItemClass}>
              {tableData.value.map((tr, index) => (
                <div class={tableTrClass} onClick={(e) => clickTableRow(e, tr)}>
                  {column.map((td, j) => (
                    <div class={tableTdClass} style={styleItem.value(td)}>
                      {td.dataIndex === "status" ? (
                        <>
                          <span v-show={tr[td.dataIndex] === "NORMAL"} style="color: #58FAB6;">
                            在线
                          </span>
                          <span v-show={tr[td.dataIndex] === "OFFLINE"} style="color: #D9E7FF;">
                            离线
                          </span>
                        </>
                      ) : td.dataIndex === "operate" ? (
                        <div style="color: #2989FF;" class="flex-between">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              detailsRow(tr);
                            }}
                          >
                            {/* <ProfileOutlined /> */}
                            <span>详情</span>
                          </div>
                        </div>
                      ) : td.dataIndex === "name" ? (
                        <div class="flex-between">
                          <span>{tr[td.dataIndex]}</span>
                        </div>
                      ) : (
                        <span>{tr[td.dataIndex]}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          {store.currentParking && (
            <Pagination
              class={styles.pagination}
              onChange={getData}
              v-model:current={deviceQuery.pageNumber}
              v-model:pageSize={deviceQuery.pageSize}
              total={deviceQuery.total}
              show-less-items
              showSizeChanger={false}
            />
          )}
        </>
      );
    };

    return () => (
      <div>
        <SubPanelTemplate
          title="设备数据"
          class={styles.device_panel}
          style={{ paddingBottom: store.currentParking ? "40px" : "0" }}
          zoomable
          zoom-title="设备数据详情"
          v-slots={{
            "zoom-content": () => <div class={styles.zoomDevicePanel}>{renderDeviceList(true)}</div>,
          }}
        >
          {renderDeviceList(false)}
        </SubPanelTemplate>
        <MonitorGridsModal v-model:visible={visible.value} cameraList={cameraList.value} />
      </div>
    );
  },
});
