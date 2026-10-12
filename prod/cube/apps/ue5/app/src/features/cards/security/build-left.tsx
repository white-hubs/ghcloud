import { defineComponent } from "vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmStatistics, statisticsLevel, statisticsEventTop } from "@/infrastructure/api/alarm";
import { AlarmLevelType, AlarmAreaTop } from "@/infrastructure/api/models/alarm";
import AlarmStatisticsItem from "@/shared-ui/panel/alarmStatisticsItem";
import Pie3D from "@/shared-ui/panel/charts/pie/pie";
import RatePie from "@/shared-ui/panel/charts/ratePie/ratePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./build-left.module.less";

export const BuildLeft = defineComponent({
  name: "BuildLeft",
  setup(_props, ctx) {
    interface AlarmHandlType {
      list: AlarmAreaTop[];
    }
    let timer = ref<any>(null);
    const { globalState } = useStateStore();
    let timeFrame = ref<ModelValueItf>();
    let topTimeFrame = ref<ModelValueItf>();
    let handleTime = ref<ModelValueItf>();

    const fakeData = ref<AlarmLevelType[]>([
      {
        alarmNum: 0,
        name: "一级报警",
        chainRatio: 0,
        isGrow: false,
      },
    ]);
    let alarmProportion = ref({
      handle: 0,
      really: 0,
    });
    const alarmRank = reactive<AlarmHandlType>({
      list: [],
    });
    watch(
      () => globalState.business.currentAreaId,
      () => {
        clearInterval(timer.value);
        timer.value = setInterval(
          () => {
            init();
          },
          (window as any).config.pageLoopRequestTime,
        );
        init();
      },
    );
    // 报警统计
    function changeTimeFrame() {
      getAlarmStatistics();
    }
    // 获取处理占比和真实占比
    async function getAlarmStatistics() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: timeFrame.value?.dateRange.join(","),
      };
      let res: any = await alarmStatistics(params);
      if (res.alarmNum && res.alarmNum !== 0) {
        alarmProportion.value.really = Math.round((res.alarmActualNum / res.alarmNum) * 10000) / 100.0;
        alarmProportion.value.handle = Math.round((res.alarmHandlerNum / res.alarmNum) * 10000) / 100.0;
      } else {
        alarmProportion.value.really = 0;
        alarmProportion.value.handle = 0;
      }
    }
    // 报警级别分布
    function changeTopTimeFrame() {
      getAlarmLevel();
    }
    // 获取报警级别分布数据
    async function getAlarmLevel() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: topTimeFrame.value?.dateRange.join(","),
        type: topTimeFrame.value?.timeType,
      };
      let res = await statisticsLevel(params);
      fakeData.value = res.map((item) => {
        item.chainRatio <= 0 ? (item.isGrow = false) : (item.isGrow = true);
        item.name += "报警";
        return item;
      });
    }
    // 报警事件排名
    function changeHandleTime() {
      getAlarmHandlTop();
    }
    async function getAlarmHandlTop() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: handleTime.value?.dateRange.join(","),
        type: handleTime.value?.timeType,
      };
      alarmRank.list = await statisticsEventTop(params);
    }
    function init() {
      getAlarmLevel();
      getAlarmHandlTop();
      getAlarmStatistics();
    }
    onMounted(() => {
      timer.value = setInterval(
        () => {
          init();
        },
        (window as any).config.pageLoopRequestTime,
      );
    });
    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="报警统计">
            <div class="header">
              {" "}
              <DateInlineForm
                modelValue={timeFrame.value}
                onUpdate:modelValue={(v) => {
                  timeFrame.value = v;
                }}
                onSearch={changeTimeFrame}
              />
            </div>
            <div class="rate-pie-chart">
              <RatePie value={alarmProportion.handle} title="报警处理占比" color="#5AD0EA" class="rate-pie" />
              <RatePie value={alarmProportion.really} title="报警真实占比" class="rate-pie" />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警级别统计" class="alarm-level">
            <div class="header">
              {" "}
              <DateInlineForm
                modelValue={topTimeFrame.value}
                onUpdate:modelValue={(v) => {
                  topTimeFrame.value = v;
                }}
                onSearch={changeTopTimeFrame}
              ></DateInlineForm>
            </div>
            <div class="body">
              <div class="chart">
                {" "}
                <Pie3D data={fakeData.value} label-key="name" value-key="alarmNum" />
              </div>
              <div class="footer">
                {fakeData.map((item, index) => (
                  <AlarmStatisticsItem
                    key={item.name}
                    level={index + 1}
                    alarmNum={item.alarmNum}
                    chainRatio={item.chainRatio}
                    name={item.name}
                    is-grow={item.isGrow}
                  />
                ))}
              </div>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警事件top5" class="alarm-event">
            <div class="header">
              {" "}
              <DateInlineForm
                modelValue={handleTime.value}
                onUpdate:modelValue={(v) => {
                  handleTime.value = v;
                }}
                onSearch={changeHandleTime}
              ></DateInlineForm>
            </div>
            <div class="body" style="min-height: 250px">
              {alarmRank.list.map((item, index) => (
                <EventAlarmItem
                  key={item.id}
                  sort={index + 1}
                  name={item.name}
                  linkRatio={item.chainRatio}
                  count={item.alarmNum}
                  ratio={item.ratio + "%"}
                />
              ))}
            </div>
            <div class="body">
              {" "}
              <noData></noData>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default BuildLeft;
