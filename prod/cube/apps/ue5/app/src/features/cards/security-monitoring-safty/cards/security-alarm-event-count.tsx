import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import OverviewChartBar from "@/features/cards/hospital/overview-chartBar";
import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmEventTypeStatisticsc } from "@/infrastructure/api/alarm";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./security-alarm-event-count.module.less";

const alarmEventIcon = getThemeImage("alarm-event.png");

type AlarmEventItem = {
  id: string;
  name: string;
  totalNum: number;
};

export const SecurityAlarmEventCount = defineComponent({
  name: "SecurityAlarmEventCount",
  props: {
    title: { type: String, default: "报警事件统计" },
  },
  setup(props) {
    const { globalState } = useStateStore();
    const alarmModalShow = ref(false);
    let eventDataList: AlarmEventItem[] = [];
    const timeType = ref({
      timeType: "THIS_YEAR",
      dateRange: [] as string[],
    });
    const parameter = reactive({
      alarmEventTypeId: "",
      dateRange: [] as string[],
    });

    const barData = reactive({
      xData: [] as string[],
      yData: [
        {
          data: [] as number[],
          name: "",
          color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
        },
      ],
    });
    const hasChartData = computed(
      () => barData.xData.length > 0 && barData.yData.some((series) => series.data.some((value) => Number(value) !== 0)),
    );

    const closeModal = (): void => {
      alarmModalShow.value = false;
    };

    const timeDate = async (): Promise<void> => {
      barData.xData = [];
      barData.yData[0].data = [];
      eventDataList = [];
      const data = await alarmEventTypeStatisticsc({
        areaId: globalState.business.currentAreaId,
        period: timeType.value.dateRange.join(","),
        sceneType: globalState.business.currentMenu,
        type: timeType.value.timeType,
      });
      barData.xData = data.map((res) => res.name);
      barData.yData[0].data = data.map((res) => res.totalNum);
      eventDataList = data;
    };

    onMounted(() => {
      void timeDate();
    });

    const alarmClickBar = (value: { name: string }): void => {
      const { name } = value;
      const findItem = eventDataList.find((item) => item.name === name);
      if (findItem) {
        parameter.alarmEventTypeId = findItem.id;
        parameter.dateRange = timeType.value.dateRange;
        alarmModalShow.value = true;
      }
    };

    const renderChartBody = (isZoom: boolean): JSX.Element => (
      <div class={["security-alarm-event-count-v2", "security-alarm-event-count-v2-panel", isZoom ? "is-zoom" : ""]}>
        <div class={["chart-panel", isZoom ? "is-zoom" : ""]} data-no-zoom>
          {hasChartData.value ? (
            <OverviewChartBar
              bottom="8"
              title=""
              gridTop={isZoom ? 16 : 12}
              xRotate={0}
              xData={barData.xData}
              yData={barData.yData}
              height="100%"
              scrollable={false}
              onClickbar={alarmClickBar}
            />
          ) : (
            <NoData />
          )}
        </div>
      </div>
    );

    return () => (
      <div class="v2-panel-root security-alarm-event-count-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card security-alarm-event-count-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={720}
          v-slots={{
            titleIcon: () => <img src={alarmEventIcon} alt="" class="title-icon-img" />,
            extra: () => (
              <DateInlineForm
                modelValue={timeType.value}
                onUpdate:modelValue={(v) => {
                  timeType.value = v;
                }}
                onSearch={timeDate}
                data-no-zoom
              />
            ),
            default: () => renderChartBody(false),
            "zoom-content": () => renderChartBody(true),
          }}
        />
        <modalAlarmTable show-modal={alarmModalShow.value} parameter={parameter} onClose={closeModal} />
      </div>
    );
  },
});

export default SecurityAlarmEventCount;
