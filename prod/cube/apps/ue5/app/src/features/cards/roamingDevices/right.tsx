import { ProfileOutlined } from "@ant-design/icons-vue";
import { defineComponent } from "vue";
import { ref, reactive, onMounted, computed } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import Equ from "@/features/equipment/equipmentdetails/index";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { roamingDevices } from "@/visualization-core/stores/roamingDevices";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const ueClient = UeClient.getInstance();

    const equId = ref("");
    const show = ref(false);
    const piniaRoamingDevices = roamingDevices();
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
        width: 100,
      },
      {
        title: "状态",
        dataIndex: "deviceStatus",
        width: 100,
      },
      {
        title: "操作",
        dataIndex: "operate",
        width: 90,
      },
    ];
    const columnNum = computed(() => {
      return 100 / column.length;
    });
    const closeModal = () => {
      show.value = false;
      equId.value = "";
      piniaRoamingDevices.isRoaming = true;
    };
    const clickTableRow = (data) => {
      show.value = true;
      equId.value = data.id;
      piniaRoamingDevices.isRoaming = false;
    };

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="设备数据" class="device_panel">
            <div class="device_list">
              <div class="header flex-between">
                {column.map((td, index) => (
                  <div class="table-th" key={index} style={styleItem(td)}>
                    {" "}
                    {td.title}
                  </div>
                ))}
              </div>
              <div class="device_item">
                {piniaRoamingDevices.roamingDevicesArr.map((tr, index) => (
                  <template key={tr?.key || index}>
                    <div class="table-tr flex-between">
                      {column.map((td, j) => (
                        <div class="table-td" key={index + "_" + j} style={styleItem(td)}>
                          {td.dataIndex === "deviceStatus" && (
                            <template>
                              <span style="color: #58FAB6;"> 正常</span>
                              <span style="color: #D9E7FF;"> 离线</span>
                              <span style="color: #FFAB10"> 故障</span>
                              <span style="color: #F14545"> 报警</span>
                            </template>
                          )}
                          {td.dataIndex === "operate" ? (
                            <div style="color: #2989FF;justify-content: center;" class="flex-between">
                              <div onClick={clickTableRow(tr)}>
                                <profile-outlined />
                                <span> 详情</span>
                              </div>
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
            {show && <Equ id={equId.value} onClose={closeModal} isequ={true}></Equ>}
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Right;
