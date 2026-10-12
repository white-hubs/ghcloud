import { defineComponent } from "vue";
import { ref, reactive } from "vue";

import SecurityAlarmEventRatio from "../security-monitoring-safty/cards/security-alarm-event-ratio";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsSituation } from "@/infrastructure/api/alarm";
import { alarmTrend } from "@/infrastructure/utils/requestData/alarm";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import displayPanel from "@/shared-ui/panel/display-panelsafty";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./electrical-left.module.less";

export const ElectricalLeft = defineComponent({
  name: "ElectricalLeft",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const alarmtimeType = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const trend = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const contentList = ref([
      {
        name: "报警超时率",
        field: "timeoutRatio",
        value: 0,
      },
      {
        name: "报警正确率",
        field: "actualRatio",
        value: 0,
      },
      {
        name: "电气报警占比",
        field: "ratio",
        value: 0,
      },
      {
        name: "报警处理率",
        field: "handlerRatio",
        value: 0,
      },
    ]);
    const xData = reactive({
      arr: ["1时", "2时", "3时", "4时", "5时"],
    });
    const series = reactive([
      {
        data: [0],
        linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
      },
    ]);

    const changeDate = async () => {
      getAlarmSituation();
    };
    // 获取报警情况统计
    const getAlarmSituation = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: alarmtimeType.value.dateRange.join(","),
      };
      let res = await statisticsSituation(params);
      contentList.value = contentList.value.map((item) => {
        return {
          ...item,
          value: +res[item.field],
        };
      });
    };
    // 设备报警趋势
    const alarmTrendInfo = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: trend.value.dateRange.join(","),
        type: trend.value.timeType,
      };
      let res: any = await alarmTrend(param);
      xData.arr = res.xdata;
      series[0].data = res.ydata;
    };

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="报警情况统计">
            <template>
              {" "}
              <DateInlineForm
                modelValue={alarmtimeType.value}
                onUpdate:modelValue={(v) => {
                  alarmtimeType.value = v;
                }}
                onSearch={changeDate}
              ></DateInlineForm>
            </template>
            <displayPanel bg-img={"overView16.png"} content-list={contentList.value} showimg={false}></displayPanel>
          </SubPanelTemplate>
          <SecurityAlarmEventRatio />
          <SubPanelTemplate title="设备报警趋势" class="alarm-event">
            <template>
              {" "}
              <DateInlineForm
                modelValue={trend.value}
                onUpdate:modelValue={(v) => {
                  trend.value = v;
                }}
                onSearch={alarmTrendInfo}
              ></DateInlineForm>
            </template>
            <LineChart class="line_char" x-data={xData.arr} series={series} title={"次"}></LineChart>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default ElectricalLeft;
