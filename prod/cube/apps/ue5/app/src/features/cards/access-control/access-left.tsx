import { defineComponent } from "vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { deviceStatus, alarmEvent, abnormalPassage } from "@/infrastructure/utils/requestData/accessControl";
import changeBar from "@/shared-ui/panel/changeBar";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import LineChart from "@/shared-ui/panel/lineChart";
import noData from "@/shared-ui/panel/noData";
import pieList from "@/shared-ui/panel/pieList";
import { storeArea } from "@/visualization-core/stores/area";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./access-left.module.less";

export const AccessLeft = defineComponent({
  name: "AccessLeft",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const roundPieData: any = reactive({
      arr: [],
    });
    let timer: any = reactive(null);
    let event = ref();
    let through = ref();
    let numberPasses = ref(0);
    const eventNum = ref<number>(0);
    const unusual = reactive({
      arr: [],
    });
    const ecahrtsData = reactive({
      xData: [],
      yData: [],
    });
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
    // 设备实时状态
    const deviceRealTimeStatus = async () => {
      let res: any = await deviceStatus();
      eventNum.value = res.total;
      roundPieData.arr = res.data;
    };
    // 报警事件top5
    const alarmEventTop = async () => {
      unusual.arr = await alarmEvent(event.value.timeType);
    };
    // 异常通行趋势
    const abnormalPassageInfo = async () => {
      let res = await abnormalPassage(through.value.timeType, "DO_REFUSE");
      ecahrtsData.xData = res.xdata;
      ecahrtsData.yData = res.series[0].value;
      numberPasses.value = 0;
      res.series[0].value.forEach((item) => {
        numberPasses.value += item;
      });
    };
    const init = () => {
      deviceRealTimeStatus();
    };
    onMounted(() => {
      alarmEventTop();
      abnormalPassageInfo();
      deviceRealTimeStatus();
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
        <div>
          <SubPanelTemplate title="设备实时状态">
            <div class="equipmentAlarm">
              <RoundPie eventNum={eventNum.value} data={roundPieData.arr}>
                <div class="content">
                  <span> {eventNum.value}</span>
                  <br />
                  设备总数
                </div>
              </RoundPie>
              <pieList roundPieData={roundPieData.arr}></pieList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="异常事件top5" class="alarm-event">
            <template>
              {" "}
              <DateInlineForm
                modelValue={event.value}
                onUpdate:modelValue={(v) => {
                  event.value = v;
                }}
                onSearch={alarmEventTop}
              ></DateInlineForm>
            </template>
            <div class="body" style="min-height: 250px">
              {unusual.arr.map((item, index) => (
                <EventAlarmItem sort={1} name={item.name} linkRatio={item.ringRatio} count={item.value} />
              ))}
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="异常通行趋势" class="alarm-event">
            <template>
              {" "}
              <DateInlineForm
                modelValue={through.value}
                onUpdate:modelValue={(v) => {
                  through.value = v;
                }}
                onSearch={abnormalPassageInfo}
              ></DateInlineForm>
            </template>
            <OperateDays value={numberPasses.value} title="通行总次数"></OperateDays>
            <div class="chart">
              <LineChart
                x-data={ecahrtsData.xData}
                series={[
                  {
                    data: ecahrtsData.yData,
                    linearGradientColor: ["rgb(255, 162, 0.1)", "rgb(255, 222, 165,1)"],
                  },
                ]}
              />
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default AccessLeft;
