import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import LightingRound from "@/features/cards/intelligent-lighting/components/lighting-round";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { abnormalPassage } from "@/infrastructure/utils/requestData/accessControl";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./access-overview.module.less";

export const AccessOverview = defineComponent({
  name: "AccessOverview",
  setup(_props, ctx) {
    const overviewTime = ref<ModelValueItf>();

    let through = ref();
    let numberPasses = ref(0);
    const echartsData = reactive({
      xData: [],
      yData: [],
    });
    // 异常通行趋势
    const abnormalPassageInfo = async () => {
      let res = await abnormalPassage(through.value.timeType, "DO_REFUSE");
      echartsData.xData = res.xdata;
      echartsData.yData = res.series[0].value;
      numberPasses.value = 0;
      res.series[0].value.forEach((item) => {
        numberPasses.value += item;
      });
    };

    const changeHandleOverviewTime = () => {};
    const roundData = ref([
      {
        statistic: { icon: "overView13.png" },
        legendList: [
          { name: "进入", color: "#2AE8BD", value: 23 },
          { name: "离开", color: "#2989FF", value: 23 },
        ],
      },
      {
        statistic: { icon: "overView30.png" },
        legendList: [
          { name: "进入", color: "#2AE8BD", value: 23 },
          { name: "离开", color: "#2989FF", value: 23 },
        ],
      },
    ]);

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="人车出入情况 ">
          <template>
            {" "}
            <DateInlineForm
              modelValue={overviewTime}
              onUpdate:modelValue={(v) => {
                overviewTime.value = v;
              }}
              onSearch={changeHandleOverviewTime}
            ></DateInlineForm>
          </template>
          <LightingRound class="LightingBox" data={roundData}></LightingRound>
        </SubPanelTemplate>
        <SubPanelTemplate title="异常通行趋势" class="alarm-event">
          <template>
            {" "}
            <DateInlineForm
              modelValue={through}
              onUpdate:modelValue={(v) => {
                through.value = v;
              }}
              onSearch={abnormalPassageInfo}
            ></DateInlineForm>
          </template>
          <OperateDays value={numberPasses} title="通行总次数"></OperateDays>
          <div class="chart">
            <LineChart
              x-data={echartsData.xData}
              series={[
                {
                  data: echartsData.yData,
                  linearGradientColor: ["rgb(255, 162, 0.1)", "rgb(255, 222, 165,1)"],
                },
              ]}
            />
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default AccessOverview;
