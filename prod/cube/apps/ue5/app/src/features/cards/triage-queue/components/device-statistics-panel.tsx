import { defineComponent } from "vue";
import { onMounted, onUnmounted, reactive, ref } from "vue";

import DeviceStatistics from "./device-statistics";
import modalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import scrollParmas from "@/features/panel-shell/tables/roll-table/scroll-params";
import { Vue3SeamlessScroll } from "@/features/panel-shell/tables/seamless-scroll";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { classification } from "@/infrastructure/api/device";
import { buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import NoData from "@/shared-ui/panel/noData";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./device-statistics-panel.module.less";

export const DeviceStatisticsPanel = defineComponent({
  name: "DeviceStatisticsPanel",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const { step, waitTime } = scrollParmas();
    const deviceAllModalShow = ref<boolean>(false);
    const deviceAllParameter = reactive({
      areaId: globalState.business.currentAreaId,
      tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
      filterAreaIds: [],
      deviceState: undefined,
      dateRange: [],
    });
    /**
     * 设备统计
     */
    const deviceStatisticsData = reactive({
      title: "设备总数",
      total: 0,
      itemize: [
        {
          label: "离线",
          value: 0,
          key: "OFFLINE",
        },
      ],
      list: [],
    });

    let timer = null;

    const { getEquipmentNumber } = useCommon();
    const getEquipmentInfo = async () => {
      let res: any = await getEquipmentNumber();
      if (!res.deviceNum) {
        return;
      }
      deviceStatisticsData.total = res.deviceNum;
      res.deviceStatusNums.forEach((item) => {
        if (item.name === "OFFLINE" && res.deviceNum !== 0) {
          deviceStatisticsData.itemize[0].value = item.num;
        }
      });
    };
    const getdevice = async () => {
      deviceStatisticsData.list = [];
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
      };
      let data = await classification(params);
      data.forEach((item) => {
        deviceStatisticsData.list.push({
          typeName: item.type || "分诊屏",
          total: item.num,
          offlineNum: item.offLineNum,
        });
      });
    };
    const handelClickItemize = () => {
      deviceAllModalShow.value = true;
    };
    onMounted(() => {
      getEquipmentInfo();
      getdevice();
    });

    onUnmounted(() => {
      clearInterval(timer);
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="设备统计" class="device-statistics">
          <DeviceStatistics
            onHandelClickItemize={handelClickItemize}
            imgPath="business-icon/triage-queue/6.png"
            statistic={deviceStatisticsData}
          ></DeviceStatistics>
          <div class="device-statistics-table">
            <div class="table-header">
              <span> 设备类型</span>
              <span> 设备总数</span>
              <span> 离线数</span>
            </div>
            <div class="table-body">
              <vue3-seamless-scroll list={deviceStatisticsData.list} step={step} hover singleHeight={36} waitTime={waitTime}>
                {deviceStatisticsData.list.map((item, index) => (
                  <div class="item" key={index} style={{ backgroundColor: index % 2 === 0 ? "rgba(171,177,189,0.12)" : "" }}>
                    <span> {item.typeName}</span>
                    <span> {item.total}</span>
                    <span> {item.offlineNum}</span>
                  </div>
                ))}
              </vue3-seamless-scroll>
            </div>
            <NoData />
          </div>
        </SubPanelTemplate>
        <modal-equipmentAll-table
          show-modal={deviceAllModalShow.value}
          onClose={() => {
            deviceAllModalShow.value = false;
          }}
          parameter={deviceAllParameter}
        ></modal-equipmentAll-table>
      </>
    );
  },
});

export default DeviceStatisticsPanel;
