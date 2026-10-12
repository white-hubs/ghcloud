import { EnvironmentOutlined, ProfileOutlined } from "@ant-design/icons-vue";
import { defineComponent } from "vue";
import { ref, reactive, onMounted, computed, watch } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getDeviceListBuyScene } from "@/infrastructure/api/device";
import { getNorthDeviceDetail } from "@/infrastructure/api/iot";
import bus from "@/infrastructure/utils/bus";
import MonitorGridsModal from "@/shared-ui/modals/monitor-grids-modal/monitor-grids-modal";
import { setSpecialCamera } from "@/visualization-core/scene/scene-actions";
import { storeMarket } from "@/visualization-core/stores/other";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./floorPipeGalleryEquipment.module.less";

export const FloorPipeGalleryEquipment = defineComponent({
  name: "FloorPipeGalleryEquipment",
  setup(_props, ctx) {
    const ueClient = UeClient.getInstance();
    const { globalState } = useStateStore();
    const deviceQuery = reactive({
      status: null,
      keyword: "",
      pageSize: 20,
      pageNumber: 1,
      total: 0,
    });
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
        width: 200,
      },
      {
        title: "状态",
        dataIndex: "status",
        width: 100,
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
      const obj = {
        alarmTargetCode: data.code,
        alarmTargetKey: data.id,
        viewLocation: true,
        prodCategory: data.prodCategory.name,
        modalType: "EquipmentAbbreviationsPanel",
      };
      setSpecialCamera(data.prodCategory.name, data.code);
      bus.emit("openDevicePopup", obj);
    };
    watch(
      () => piniaStoreMarket.selectDevice,
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
      });

      deviceQuery.total = DEVICE.total;
      handleLampStatus();
    };
    // 集体处理灯状态
    const handleLampStatus = () => {
      if (tableData.value.length) {
        let deviceInfoData = [];
        for (let i = 0; i < tableData.value.length; i++) {
          deviceInfoData.push(
            new Promise(async (resolve, reject) => {
              try {
                const params = { deviceId: tableData.value[i].id, withPropertySpec: true, withSnapShot: true };
                const result = await getNorthDeviceDetail(params);
                result.productPropVoList.forEach((e) => {
                  result.snapshots.forEach((item) => {
                    if (e.propCode === item.key && e.propCode === "status") {
                      result.preValue = item.preValue;
                    }
                  });
                });
                resolve(result);
              } catch (error) {}
            }),
          );
        }
        Promise.all(deviceInfoData).then((res) => {
          const colorType = {
            "0": { color: 4, flash: true },
            "1": { color: 1, flash: false },
            "2": { color: 2, flash: false },
            "3": { color: 4, flash: true },
            "4": { color: 4, flash: true },
          };
          const turnOnTheLight = res.map((e) => {
            return { id: e.deviceNumber, on: true, color: colorType[e.preValue].color, flash: colorType[e.preValue].flash };
          });
          ueClient.send(
            "switchLight",
            turnOnTheLight.filter((e) => e),
          );
        });
      }
    };
    const detailsRow = (tr) => {
      modal.visible = false;
      const obj = {
        alarmTargetCode: tr.code,
        alarmTargetKey: tr.id,
        viewLocation: true,
      };
      ueClient.saveNowViewPoint();
      ueClient.send("removeActorPoi", { targetActorId: tr.code });
      bus.emit("openDevicePopup", obj);
    };

    const clickTableRow = async (event, data) => {
      bus.emit("closeDevicePanel");
      if (event.target.className === "ant-checkbox-input") return;
      //保存当前视角
      await ueClient.saveNowViewPoint();
      Object.assign(modal, data);
      modal.visible = true;
    };
    onMounted(() => {
      getData();
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
                    {" "}
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
                            <div title={tr[td.dataIndex]} class="flex-between device_name">
                              {" "}
                              {tr[td.dataIndex].length > 15 ? tr[td.dataIndex].substring(0, 12) + "..." : tr[td.dataIndex]}
                            </div>
                          ) : null}
                          <span> {tr[td.dataIndex] || "--"}</span>
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

export default FloorPipeGalleryEquipment;
