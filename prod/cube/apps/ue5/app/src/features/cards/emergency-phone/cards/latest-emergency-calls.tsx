import { defineComponent } from "vue";
import { ref, onMounted } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { emergencyPhone } from "@/infrastructure/api/securitymanagement";

import styles from "./latest-emergency-calls.module.less";

export const LatestEmergencyCalls = defineComponent({
  name: "LatestEmergencyCalls",
  setup(_props, ctx) {
    const column = [
      {
        title: "设备编号",
        dataIndex: "deviceCode",
        width: 100,
      },
      {
        title: "设备区域",
        dataIndex: "areaName",
        width: 120,
      },
      {
        title: "紧急电话内容",
        dataIndex: "fileUrl",
        slots: {
          customRender: "fileUrl",
        },
      },
    ];
    const listData = ref<{ label: string; value: number; color?: string }[]>([]);
    const audio = ref();

    const getEmergencyPhone = async () => {
      const res = await emergencyPhone({ pageSize: 10, pageNumber: 1 });
      listData.value = res.records;
    };

    const play = (data) => {
      audio.value = new Audio(data.fileUrl);
      audio.value.play();
    };
    const cease = () => {
      if (audio.value) {
        audio.value.pause();
      }
    };

    onMounted(() => {
      getEmergencyPhone();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="最新紧急电话">
          <div class="footer">
            <RollTable column={column} data={listData.value} showLength={5}>
              <template>
                <div class="operate">
                  <span onClick={play(record)}> 播放</span>
                  <span onClick={cease}> 停止</span>
                </div>
              </template>
            </RollTable>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default LatestEmergencyCalls;
