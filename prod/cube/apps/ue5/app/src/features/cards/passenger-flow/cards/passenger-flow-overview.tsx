import moment from "moment";
import { defineComponent } from "vue";
import { ref, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { passengerFlowStatistics } from "@/infrastructure/api/passenger-flow";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./passenger-flow-overview.module.less";

export const PassengerFlowOverview = defineComponent({
  name: "PassengerFlowOverview",
  setup(_props, ctx) {
    const { globalState } = useStateStore();

    //实时人数===========================================================================
    const passenger = ref([
      {
        title: "实时人数",
        value: 0,
      },
      {
        title: "进馆",
        value: 0,
        ratio: 0,
      },
      {
        title: "出馆",
        value: 0,
        ratio: 0,
      },
    ]);

    const getPassengerFlowStatistics = async () => {
      const date = [moment().format("YYYY-MM-DD 00:00:00"), moment().format("YYYY-MM-DD HH:mm:ss")].join(",");
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: date,
      };
      const res = await passengerFlowStatistics(params);
      passenger.value[0].value = res.inMuseum;
      passenger.value[1].value = res.inCount;
      passenger.value[2].value = res.outCount;
    };

    onMounted(() => {
      getPassengerFlowStatistics();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="客流总览">
          <div class="passenger-flow">
            {passenger.map((item, index) => (
              <div class="passenger-flow-box" key={item.title}>
                <div class="passenger-flow-title"> {item.title}</div>
                <div class="passenger-flow-value">
                  <CountTo startVal={0} endVal={item.value} duration={2000} separator />
                  <div class="ringRatio">
                    <div class={["downtriangle", (item.ratio as number) > 0 && "uptriangle"]}></div>
                    <div class={[(item.ratio as number) > 0 ? "up" : "down"]}> {item.ratio + "%"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default PassengerFlowOverview;
