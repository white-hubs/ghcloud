import { CloseOutlined, RollbackOutlined } from "@ant-design/icons-vue";
import { defineComponent } from "vue";
import { ref, reactive, onMounted, computed, onBeforeUnmount } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAlarmDetail } from "@/infrastructure/api/alarm";
import { getDeviceListBuyScene } from "@/infrastructure/api/device";
import { sceneTypePage } from "@/infrastructure/api/mdata";
import { riskSceneStall } from "@/infrastructure/api/property";
import { cubeDeviceCenterService } from "@/infrastructure/api/service";
import bus from "@/infrastructure/utils/bus";
import { DeviceStatusCode, getDeviceTypeIcon } from "@/infrastructure/utils/enumeratie";
import MonitorGridsModal from "@/shared-ui/modals/monitor-grids-modal/monitor-grids-modal";
import { addDeviceIconPio } from "@/visualization-core/scene/scene-actions";
import { storeArea } from "@/visualization-core/stores/area";
import { storeMarket } from "@/visualization-core/stores/other";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  emits: ["openDevicePanelEmit"],
  setup(_props, { emit }) {
    const ueClient = UeClient.getInstance();
    const { globalState } = useStateStore();
    const piniaStoreMarket = storeMarket();
    const deviceQuery = reactive({
      status: null,
      keyword: "",
      pageSize: 20,
      pageNumber: 1,
      total: 0,
    });
    const isFullScreen = ref(false);
    const allChecked = ref(false);
    const cameraList = ref([]);
    const visible = ref(false);
    const alarmDeviceType = ref("");
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
      // {
      //   title:'操作',
      //   dataIndex:'operate',
      //   width:110,
      // },
    ];
    const columnNum = computed(() => {
      return 100 / column.length;
    });
    const tableData = ref([]);
    const getData = async () => {
      ueClient.send("removePoiByType", {
        type: "icon",
      });
      let res = await sceneTypePage();
      res = res.filter((e) => {
        return e.name === "总览";
      });
      let query = {
        sceneType: res[0].id,
        areaId: globalState.business.currentAreaId,
        pageNumber: deviceQuery.pageNumber,
        pageSize: deviceQuery.pageSize,
        status: deviceQuery.status,
        keyword: deviceQuery.keyword,
      };

      const DEVICE = await getDeviceListBuyScene(query);
      const risk = await riskSceneStall(query);
      piniaStoreMarket.alarmDeviceRisk = [{ label: "设备", value: "device" }];
      DEVICE.records.forEach((e) => (e.type = "device"));
      let arr = [];
      risk.records = risk.records.filter((e) => {
        e.type = "risk";
        arr.push({ label: e.typeName.split("/")[e.typeName.split("/").length - 1], value: e.typeCode });
        if (alarmDeviceType.value && alarmDeviceType.value !== "device") {
          return e.typeCode === alarmDeviceType.value;
        } else {
          return e;
        }
      });
      arr = arr.filter((item, index, self) => index === self.findIndex((t) => t.label === item.label));
      piniaStoreMarket.alarmDeviceRisk.push(...arr);
      if (!alarmDeviceType.value) {
        tableData.value = [...DEVICE.records, ...risk.records];
        deviceQuery.total = DEVICE.total + risk.total;
      } else if (alarmDeviceType.value === "device") {
        tableData.value = DEVICE.records;
        deviceQuery.total = DEVICE.total;
      } else {
        tableData.value = risk.records;
        deviceQuery.total = risk.total;
      }
      tableData.value.forEach((e) => {
        e.status = e?.status?.onlineState ? "NORMAL" : "OFFLINE";
        e.productName = e?.product?.name ? e?.product?.name : e.typeName;
        e.checked = false;
        if (e?.prodCategory?.name?.includes("摄像")) {
          e.isCheck = true;
        } else {
          e.isCheck = false;
        }
      });
      tableData.value.forEach(async (e) => {
        if (e.isCheck) {
          const data = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: e.id });
          e.token = data.baseArchivesInfo.thirdPartyId;
        }
      });
      tableData.value = tableData.value.sort((a, b) => {
        if (a.isCheck && !b.isCheck) {
          return -1;
        } else if (!a.isCheck && b.isCheck) {
          return 1;
        } else {
          return 0;
        }
      });

      if (DEVICE.records.length && (alarmDeviceType.value === "" || alarmDeviceType.value === "device")) {
        const deviceListPio = DEVICE.records.map(
          (item: {
            typeName: string;
            area: { key: string };
            code: any;
            genreName: string | number;
            status: any;
            id: any;
            genreId: any;
            product?: { name?: string; modelName?: string };
            prodCategory?: { name?: string };
          }) => {
            item.code = item.code.trim();
            if (globalState.business.currentAreaId === item?.area.key) {
              return {
                targetActorId: item.code,
                icon: getDeviceTypeIcon(item.product?.name, item.typeName, item.genreName, item.prodCategory?.name),
                color: DeviceStatusCode[item?.status],
                scale: window.config?.iconScale ? window.config.iconScale : 1,
                props: {
                  iconType: "device",
                  actorId: item.code,
                  id: item.id,
                  code: item.code,
                  genreId: item.genreId,
                  deviceData: item,
                },
              };
            }
          },
        );
        addDeviceIconPio(deviceListPio.filter((item) => item));
      }

      if (risk.records.length && alarmDeviceType.value !== "device") {
        const deviceListPio = risk.records.map((item) => {
          item.bimCode = item.bimCode.trim();
          if (globalState.business.currentAreaId === item?.areaId.split(",")[item?.areaId.split(",").length - 1]) {
            return {
              targetActorId: item.bimCode,
              icon: getDeviceTypeIcon(item.typeName),
              color: 0,
              scale: window.config?.iconScale ? window.config.iconScale : 1,
              props: {
                iconType: "risk_source",
                actorId: item.bimCode,
                id: item.riskSourceId,
                code: item.bimCode,
                genreId: item.bimCode,
              },
            };
          }
        });

        addDeviceIconPio(deviceListPio.filter((item) => item));
      }
    };
    const allChangeCheck = () => {
      tableData.value.forEach((e) => {
        if (e.isCheck && allChecked.value) {
          e.checked = true;
        } else if (e.isCheck && !allChecked.value) {
          e.checked = false;
        }
      });
      changeCheck();
    };
    const changeCheck = () => {
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
        cameraList.value = arr.slice(arr.length - 9);
      } else {
        cameraList.value = arr;
      }

      if (cameraList.value.length) {
        visible.value = true;
      } else {
        visible.value = false;
      }
    };
    const modal = reactive({
      visible: false,
      name: "设备名称",
      status: "NORMAL",
      code: "",
      areaName: "",
    });
    const clickTableRow = async (data) => {
      if (data.type === "risk") {
        bus.emit("openDevicePopup", { alarmTargetKey: data.id, modalType: "RiskDetailPanel" });
        return;
      }
      if (!data.isCheck) {
        //保存当前视角
        await ueClient.saveNowViewPoint();
        Object.assign(modal, data);
        visible.value = false;
        modal.visible = true;
      }
    };
    const backModal = () => {
      modal.visible = false;
    };
    const closeModal = () => {
      modal.visible = false;
      ueClient.backViewPoint();
    };
    const details = (data) => {
      const obj = {
        alarmTargetCode: data.code,
        alarmTargetKey: data.id,
        viewLocation: true,
      };
      bus.emit("openDevicePopup", obj);
      modal.visible = false;
    };
    /** 报警设备过滤 */
    bus.on("alarmDeviceFilter", (data: any): void => {
      alarmDeviceType.value = data.value.value;
      getData();
    });
    let timer: any = reactive(null);
    onMounted(() => {
      getData();
      timer = setInterval(async () => {
        const result = await getAlarmDetail(piniaStoreMarket.alarmBusinessKey);
        if (result.alarmStatusName === "已处理") {
          ueClient.send("removeEffectAll");
          clearInterval(timer);
        }
      }, 5000);
    });
    onBeforeUnmount(() => {
      clearInterval(timer);
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
                <a-select-option value="NORMAL"> 在线</a-select-option>
                <a-select-option value="OFFLINE"> 离线</a-select-option>
              </a-select>
              <a-input-search
                enter-button
                value={deviceQuery.keyword}
                onUpdate:value={(v) => {
                  deviceQuery.keyword = v;
                }}
                placeholder="按设备名称搜索"
                style="width: 55%; margin-left: 4px"
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
                        checked={allChecked}
                        onUpdate:checked={(v) => {
                          allChecked.value = v;
                        }}
                        style="color: #fff"
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
                    <div class="table-tr flex-between" onClick={clickTableRow(tr)}>
                      {column.map((td, j) => (
                        <div class="table-td" key={index + "_" + j} style={styleItem(td)}>
                          {td.dataIndex === "status" && (
                            <template>
                              <span style="color: #58fab6"> 在线</span>
                              <span style="color: #d9e7ff"> 离线</span>
                            </template>
                          )}
                          {td.dataIndex === "name" ? (
                            <div class="flex-between">
                              {tr.isCheck && (
                                <a-checkbox
                                  onChange={changeCheck}
                                  checked={tr.checked}
                                  onUpdate:checked={(v) => {
                                    tr.checked = v;
                                  }}
                                  style="color: #fff"
                                >
                                  {" "}
                                  {tr[td.dataIndex]}
                                </a-checkbox>
                              )}
                              <span style="margin-left: 20px"> {tr[td.dataIndex]}</span>
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
            />
          </SubPanelTemplate>
          <div class="alarmDetail-wrap">
            <div class="alarmDetail-modal">
              <div class="alarmDetail-modal-header">
                <div class="header-title"> {modal.name}</div>
                <div class="header-operate">
                  <div class="header-close" onClick={backModal}>
                    {" "}
                    <RollbackOutlined />
                  </div>
                  <div class="header-close" onClick={closeModal}>
                    {" "}
                    <CloseOutlined />
                  </div>
                </div>
              </div>
              <div class="alarmDetail-modal-content flex-column">
                <div class="conent-body">
                  <div>
                    <span style="margin-right: 10px"> {modal.code}</span>
                    <span style="color: #58fab6"> 在线</span>
                    <span style="color: #d9e7ff"> 离线</span>
                  </div>
                  <div> {modal.areaName}</div>
                  <div class="details" onClick={details(modal)}>
                    {" "}
                    详情{">>"}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <MonitorGridsModal
            visible={visible}
            onUpdate:visible={(v) => {
              visible.value = v;
            }}
            cameraList={cameraList}
          />
        </div>
      </>
    );
  },
});

export default Left;
