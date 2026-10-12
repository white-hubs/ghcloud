import { defineComponent } from "vue";
import { ref, reactive } from "vue";

import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmHandleTop, statisticsSituation } from "@/infrastructure/api/alarm";
import { AlarmAreaTop } from "@/infrastructure/api/models/alarm";
import { alarmTrend } from "@/infrastructure/utils/requestData/alarm";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import displayPanel from "@/shared-ui/panel/display-panelsafty";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import LineChart from "@/shared-ui/panel/lineChart";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    interface AlarmHandlType {
      list: AlarmAreaTop[];
    }
    const { globalState } = useStateStore();
    const parameter = reactive({
      userId: "",
    });
    //报警情况统计====================================================================================================
    let alarmtimeType = ref({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const alarmModalShow = ref<boolean>();
    const contentList = ref([
      {
        name: "报警超时率",
        value: 0,
      },
      {
        name: "报警正确率",
        value: 0,
      },
      {
        name: "报警处理率",
        value: 0,
      },
      {
        name: "报警响应率",
        value: 0,
      },
      {
        name: "用气报警占比",
        value: 0,
      },
    ]);
    const changeDate = async () => {
      const res = await statisticsSituation({
        areaId: globalState.business.currentAreaId,
        period: alarmtimeType.value.dateRange.join(","),
        sceneType: globalState.business.currentMenu,
      });
      contentList.value[0].value = Number(res.timeoutRatio);
      contentList.value[1].value = Number(res.actualRatio);
      contentList.value[2].value = Number(res.handlerRatio);
      contentList.value[3].value = Number(res.confirmedRatio);
      contentList.value[4].value = Number(res.ratio);
    };
    //报警趋势====================================================================================================
    const trend = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const xData = reactive({
      arr: ["1时", "2时", "3时", "4时", "5时"],
    });
    const series = reactive([
      {
        data: [110, 21, 31, 44, 51],
        smooth: false,
        linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
      },
    ]);
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
    //报警处理排名====================================================================================================
    let handleTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const alarmRank = reactive<AlarmHandlType>({
      list: [],
    });
    // 报警处理排名
    async function changeHandleTime() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: handleTime.value.dateRange.join(","),
        type: handleTime.value.timeType,
      };
      alarmRank.list = await alarmHandleTop(params);
    }
    const closeModal = () => {
      alarmModalShow.value = false;
    };
    const handleClickItem = (item: AlarmAreaTop) => {
      parameter.userId = item.id;
      alarmModalShow.value = true;
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
          <SubPanelTemplate title="报警趋势" class="alarm-event">
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
            <LineChart class="line_char" x-data={xData.arr} series={series}></LineChart>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警处理排名">
            <template>
              {" "}
              <DateInlineForm
                modelValue={handleTime.value}
                onUpdate:modelValue={(v) => {
                  handleTime.value = v;
                }}
                onSearch={changeHandleTime}
              ></DateInlineForm>
            </template>
            <div class="body" style="min-height: 250px;">
              {alarmRank.list.map((item, index) => (
                <EventAlarmItem
                  onClick={handleClickItem(item)}
                  key={item.id}
                  sort={index + 1}
                  name={item.name}
                  linkRatio={item.chainRatio}
                  count={item.alarmNum}
                  ratio={item.ratio + "%"}
                />
              ))}
            </div>
            <div class="body" style="min-height: 150px;">
              {" "}
              <noData></noData>
            </div>
          </SubPanelTemplate>
          <modal-alarm-table show-modal={alarmModalShow.value} onClose={closeModal} parameter={parameter}></modal-alarm-table>
        </div>
      </>
    );
  },
});

export default Left;
