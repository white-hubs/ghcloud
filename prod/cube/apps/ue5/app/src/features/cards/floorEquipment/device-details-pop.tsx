import { CloseOutlined } from "@ant-design/icons-vue";
import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import EquipmentDetailPanel from "@/features/equipment/equipmentdetails/index";
import { getSecurityDevicePage } from "@/infrastructure/api/securitymanagement";
import { cubeDeviceCenterService } from "@/infrastructure/api/service";
import bus from "@/infrastructure/utils/bus";
import { setSpecialCamera } from "@/visualization-core/scene/scene-actions";
import { storeMarket } from "@/visualization-core/stores/other";

import styles from "./device-details-pop.module.less";

export const DeviceDetailsPop = defineComponent({
  name: "DeviceDetailsPop",
  props: {
    id: {
      type: [String],
      default: "",
    },
  },
  setup(props, ctx) {
    const activeData = ref("基本信息");
    const showDetailPanel = ref(false);
    const modal = reactive({
      visible: false,
      name: "设备名称",
      status: "NORMAL",
      code: "",
      areaName: "",
      productInfo: "",
      id: "",
    });
    const isPaly = ref(false);
    const getSecurityDevicePagData = async () => {
      const res = await getSecurityDevicePage("BROADCAST_CENTER", {
        pageNumber: 1,
        pageSize: 999,
      });
      const ids = res.records.map((e) => e.deviceId);
      if (ids.includes(props.id)) {
        isPaly.value = true;
      }
    };
    const playEvent = () => {
      activeData.value = "广播播放";
      showDetailPanel.value = true;
    };
    const details = (data) => {
      activeData.value = "基本信息";
      if (data.productInfo === "门禁") {
        bus.emit("setPanel", {
          rightPanelName: "",
          leftPanelName: "deviceDetailsPanel",
        });
        piniaStoreMarket.panelCurrentDeviceId = data.id;
      } else {
        showDetailPanel.value = true;
      }
      modal.visible = false;
    };
    const closeModal = () => {
      modal.visible = false;
      ueClient.backViewPoint();
    };
    const deviceClose = () => {
      showDetailPanel.value = false;
      // modal.visible = true
    };
    const positioning = async (data) => {
      setSpecialCamera(data.productInfo, data.code);
    };
    const getData = async () => {
      const data = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: props.id });
      modal.areaName = data.baseArchivesInfo.area?.name || "暂无";
      modal.name = data.baseArchivesInfo.name;
      modal.code = data.baseArchivesInfo.code;
      modal.id = data.baseArchivesInfo.id;
      modal.productInfo = data.productInfo.productCategory.name;
      modal.status = data.baseArchivesInfo.status.onlineState ? "NORMAL" : "OFFLINE";
      // modal.visible = true
      showDetailPanel.value = true;
    };
    onMounted(() => {
      getData();
      getSecurityDevicePagData();
    });

    return (): JSX.Element => (
      <>
        <div class="alarmDetail-wrap">
          <div class="alarmDetail-modal">
            <div class="alarmDetail-modal-header">
              <div class="header-title"> {modal.name}</div>
              <div class="header-operate">
                {" "}
                <div class="header-close" onClick={closeModal}>
                  {" "}
                  <CloseOutlined />
                </div>
              </div>
            </div>
            <div class="alarmDetail-modal-content flex-column">
              <div class="conent-body">
                <div>
                  <span style="margin-right: 10px;"> {modal.code}</span>
                  <span style="color: #58FAB6;"> 在线</span>
                  <span style="color: #D9E7FF;"> 离线</span>
                </div>
                <div> {modal.areaName}</div>
                <div class="details-box">
                  {isPaly && (
                    <div class="details" onClick={playEvent()}>
                      {" "}
                      播放
                    </div>
                  )}
                  <div class="details" onClick={positioning(modal)}>
                    {" "}
                    定位
                  </div>
                  <div class="details" onClick={details(modal)}>
                    {" "}
                    详情
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {showDetailPanel && <EquipmentDetailPanel activeData={activeData} id={modal.id} onClose={deviceClose}></EquipmentDetailPanel>}
      </>
    );
  },
});

export default DeviceDetailsPop;
