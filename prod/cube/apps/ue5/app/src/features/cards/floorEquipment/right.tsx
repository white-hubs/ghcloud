import { EnvironmentOutlined, ProfileOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { defineComponent } from "vue";
import { ref, reactive, onMounted, computed, watch, onBeforeUnmount } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { openDeviceModalSimplify } from "@/features/widgets/modal/device-model-simplify/device-model-simplify";
import { getDeviceListBuyScene } from "@/infrastructure/api/device";
import bus from "@/infrastructure/utils/bus";
import MonitorGridsModal from "@/shared-ui/modals/monitor-grids-modal/monitor-grids-modal";
import { eventInstance } from "@/visualization-core/event/event";
import { storeMarket } from "@/visualization-core/stores/other";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const { globalState } = useStateStore();

    const deviceQuery = reactive({
      status: null,
      keyword: "",
      pageSize: 20,
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
    const column = [
      {
        title: "设备名称",
        dataIndex: "name",
        width: 250,
      },
      {
        title: "状态",
        dataIndex: "status",
        width: 50,
      },
      {
        title: "操作",
        dataIndex: "operate",
        width: 110,
      },
    ];
    const columnNum = computed(() => {
      return 100 / column.length;
    });
    const tableData = ref([]);

    const positioning = async (data) => {
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
    const backModal = () => {
      modal.visible.value = false;
    };
    watch(
      () => [piniaStoreMarket.selectDevice, globalState.business.currentAreaId],
      () => {
        getData();
      },
    );
    const getData = async () => {
      let query = {
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
        //@ts-ignore
        if (piniaStoreMarket.selectDevice.id === e.id) {
          e.checked = true;
        } else {
          e.checked = false;
        }

        if (e?.prodCategory?.name?.includes("摄像")) {
          e.isCheck = true;
        } else {
          e.isCheck = false;
        }
      });
      deviceQuery.total = DEVICE.total;
      deviceQuery.pages = DEVICE.pages;
    };
    const detailsRow = (tr) => {
      modal.visible = false;
      globalState.panel.rightPanelName = "";
      // 缓存设备返回到预案面板
      // if (globalState.panel.rightPanelName = 'emergency-drill') {
      //   globalState.business.emergencyDeviceBack = {
      //     ...globalState.panel
      //   }
      //   globalState.panel.rightPanelName = 'emergency-drill'
      // } else {
      //   globalState.panel.rightPanelName = ''
      // }
      globalState.panel.leftPanelName = "deviceDetailsPanel";
      globalState.panel.universalPanelVo.left = null;
      globalState.panel.universalPanelVo.right = null;
      globalState.business.panelCurrentDeviceId = tr.id;
    };
    const allChangeCheck = () => {
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
    const changeCheck = (tr?) => {
      clearInterval(loopInterval.value);
      backModal();
      const arr = tableData.value.filter((e) => {
        return e.isCheck && e.checked;
      });
      if (arr.length === tableData.value.filter((e) => e.isCheck).length) {
        allChecked.value = true;
      } else {
        allChecked.value = false;
      }
      if (arr.length > 9) {
        tr.checked = false;
        message.warning("最多选择9个设备");
        return;
      } else {
        cameraList.value = arr;
      }
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
    const lastIndex = ref(0); // 记录当前页的选中位置

    const loopVideoEvent = async () => {
      const totalDevices = tableData.value.length;
      const selectedCount = cameraList.value.length;

      // 如果设备总数不足，直接返回
      if (totalDevices === 0 || selectedCount === 0) return;

      // 清空当前选中状态
      tableData.value.forEach((e) => (e.checked = false));

      // 从 lastIndex 开始，选中 selectedCount 个设备
      const newSelectedDevices = [];
      let remainingDevices = selectedCount;

      while (remainingDevices > 0) {
        // 当前页剩余设备数量
        const availableDevices = totalDevices - lastIndex.value;

        // 选中当前页的设备
        const count = Math.min(remainingDevices, availableDevices);
        for (let i = 0; i < count; i++) {
          const index = lastIndex.value + i;
          if (tableData.value[index]) {
            tableData.value[index].checked = true;
          }
          newSelectedDevices.push(tableData.value[index]);
        }

        // 更新剩余需要选中的设备数量
        remainingDevices -= count;

        // 如果当前页设备不足，加载下一页
        if (remainingDevices > 0) {
          // 增加页码
          deviceQuery.pageNumber += 1;

          // 加载下一页数据
          await getData();

          // 重置 lastIndex
          lastIndex.value = 0;
        } else {
          // 更新 lastIndex
          lastIndex.value += count;
        }
      }

      // 更新 cameraList
      cameraList.value = newSelectedDevices;
      // 如果已经是最后一页，回到第一页
      if (deviceQuery.pageNumber > deviceQuery.pages) {
        deviceQuery.pageNumber = 1;
        await getData();
        lastIndex.value = 0;
      }
    };
    const clickTableRow = async (event, data) => {
      bus.emit("closeDevicePanel");
      if (event.target.className === "ant-checkbox-input") return;
      //保存当前视角
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

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="设备数据" class="device_panel">
            <div class="search flex-between">
              <a-select
                placeholder="设备状态"
                ref="select"
                value={deviceQuery.status}
                onUpdate:value={(v) => {
                  deviceQuery.status = v;
                }}
                style="width: 40%"
                onChange={getData}
              >
                <a-select-option value="ONLINE"> 在线</a-select-option>
                <a-select-option value="OFFLINE"> 离线</a-select-option>
              </a-select>
              <a-input-search
                enter-button
                value={deviceQuery.keyword}
                onUpdate:value={(v) => {
                  deviceQuery.keyword = v;
                }}
                placeholder="按设备名称搜索"
                style="width: 55%;margin-left: 4px;"
                onSearch={getData}
              />
            </div>
            <div class="device_list">
              <div class="header flex-between">
                {column.map((td, index) => (
                  <div class="table-th" key={index} style={styleItem(td)}>
                    {td.dataIndex === "name" && (
                      <a-checkbox
                        class="checkbox-box"
                        onChange={allChangeCheck}
                        checked={allChecked.value}
                        onUpdate:checked={(v) => {
                          allChecked.value = v;
                        }}
                        style="color: #fff;"
                      >
                        {" "}
                        {td.title}
                      </a-checkbox>
                    )}
                    <span> {td.title}</span>
                  </div>
                ))}
              </div>
              <div class="device_item">
                {tableData.map((tr, index) => (
                  <template key={tr?.key || index}>
                    <div class="table-tr flex-between" onClick={($event) => clickTableRow($event, tr)}>
                      {column.map((td, j) => (
                        <div class="table-td" key={index + "_" + j} style={styleItem(td)}>
                          {td.dataIndex === "status" && (
                            <template>
                              <span style="color: #58FAB6;"> 在线</span>
                              <span style="color: #D9E7FF;"> 离线</span>
                            </template>
                          )}
                          {td.dataIndex === "operate" ? (
                            <div style="color: #2989FF;" class="flex-between">
                              <div onClick={positioning(tr)}>
                                <environment-outlined />
                                <span> 定位</span>
                              </div>
                              <div onClick={detailsRow(tr)}>
                                <profile-outlined />
                                <span> 详情</span>
                              </div>
                            </div>
                          ) : null}
                          {td.dataIndex === "name" ? (
                            <div class="flex-between">
                              {tr.isCheck && (
                                <a-checkbox
                                  onChange={changeCheck(tr)}
                                  checked={tr.checked}
                                  onUpdate:checked={(v) => {
                                    tr.checked = v;
                                  }}
                                  style="color: #fff;"
                                >
                                  {" "}
                                  {tr[td.dataIndex]}
                                </a-checkbox>
                              )}
                              <span style="margin-left: 20px;"> {tr[td.dataIndex]}</span>
                            </div>
                          ) : null}
                          <span> {tr[td.dataIndex]}</span>
                        </div>
                      ))}
                    </div>
                  </template>
                ))}
              </div>
            </div>
            <a-pagination
              class="pagination"
              onChange={getData}
              current={deviceQuery.pageNumber}
              onUpdate:current={(v) => {
                deviceQuery.pageNumber = v;
              }}
              pageSize={deviceQuery.pageSize}
              onUpdate:pageSize={(v) => {
                deviceQuery.pageSize = v;
              }}
              total={deviceQuery.total}
              show-less-items
              showSizeChanger={false}
            />
          </SubPanelTemplate>
          <MonitorGridsModal
            visible={visible.value}
            onUpdate:visible={(v) => {
              visible.value = v;
            }}
            cameraList={cameraList.value}
          />
        </div>
      </>
    );
  },
});

export default Right;
