import { defineComponent } from "vue";
import { onUnmounted, reactive, ref } from "vue";

import DeviceStatistics from "./device-statistics";
import modalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import scrollParmas from "@/features/panel-shell/tables/roll-table/scroll-params";
import { Vue3SeamlessScroll } from "@/features/panel-shell/tables/seamless-scroll";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import { buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./device-statistics-panel-exhibition.module.less";

export const DeviceStatisticsPanelExhibition = defineComponent({
  name: "DeviceStatisticsPanelExhibition",
  setup(_props, ctx) {
    const { step, waitTime } = scrollParmas();
    /**
     * 设备统计
     */
    const deviceStatisticsData = reactive({
      title: "设备总数",
      total: 3345,
      itemize: [
        {
          label: "离线",
          value: 234,
          key: "OFFLINE",
        },
      ],
      list: [
        { img: getAssetsImage("overView5.png"), typeName: "监控设备", total: "333", offlineNum: "33" },
        { img: getAssetsImage("overView5.png"), typeName: "叫号机", total: "33", offlineNum: "33" },
        { img: getAssetsImage("overView5.png"), typeName: "签到机", total: "233", offlineNum: "33" },
        { img: getAssetsImage("overView5.png"), typeName: "叫号机", total: "33", offlineNum: "33" },
      ],
    });

    const handelClickItemize = () => {
      deviceAllModalShow.value = true;
    };
    const deviceAllModalShow = ref<boolean>(false);
    const { globalState } = useStateStore();
    const deviceAllParameter = reactive({
      areaId: globalState.business.currentAreaId,
      tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
      filterAreaIds: [],
      deviceState: undefined,
      dateRange: [],
    });
    let timer = null;

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
              <span> 类型图片</span>
              <span> 设备类型</span>
              <span> 设备总数</span>
              <span> 离线数</span>
            </div>
            <div class="table-body">
              <vue3-seamless-scroll list={deviceStatisticsData.list} step={step} hover singleHeight={36} waitTime={waitTime}>
                {deviceStatisticsData.list.map((item, index) => (
                  <div class="item" key={index} style={{ backgroundColor: index % 2 === 0 ? "rgba(171,177,189,0.12)" : "" }}>
                    <span>
                      {" "}
                      <img src={item.img}></img>
                    </span>
                    <span> {item.typeName}</span>
                    <span> {item.total}</span>
                    <span> {item.offlineNum}</span>
                  </div>
                ))}
              </vue3-seamless-scroll>
            </div>
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

export default DeviceStatisticsPanelExhibition;
