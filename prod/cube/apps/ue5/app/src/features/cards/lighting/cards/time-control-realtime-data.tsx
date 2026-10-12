import { defineComponent } from "vue";
import { ref, reactive, onMounted, onBeforeUnmount, watch } from "vue";

import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import { timeControlled } from "@/infrastructure/utils/requestData/lighting";
import planPie from "@/shared-ui/panel/charts/pie/planePie";
import pieList from "@/shared-ui/panel/pieList";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./time-control-realtime-data.module.less";

export const TimeControlRealtimeData = defineComponent({
  name: "TimeControlRealtimeData",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const controlledDataList = reactive({
      arr: [],
    });
    const controlledNum = ref(0);
    let timer: any = reactive(null);

    watch(
      () => globalState.business.currentAreaId,
      () => {
        clearInterval(timer);
        timer = setInterval(
          () => {
            init();
          },
          (window as any).config.pageLoopRequestTime,
        );
        init();
      },
    );

    // 时控实时数据
    const controlledData = async () => {
      let res = await timeControlled();
      controlledDataList.arr = res.arr;
      controlledNum.value = res.total;
    };

    const init = () => {
      controlledData();
    };

    onMounted(() => {
      init();
      timer = setInterval(
        () => {
          init();
        },
        (window as any).config.pageLoopRequestTime,
      );
    });

    onBeforeUnmount(() => {
      clearInterval(timer);
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="时控实时数据">
          <OperateDays style="margin: 10px 0" value={controlledNum.value} title="时控计划"></OperateDays>
          <div class="equipmentAlarm">
            <planPie pieData={controlledDataList.arr}>
              {" "}
              <div class="content">
                {" "}
                <img src={getAssetsImage("timeControl.png")} />
              </div>
            </planPie>
            <pieList roundPieData={controlledDataList.arr}></pieList>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default TimeControlRealtimeData;
