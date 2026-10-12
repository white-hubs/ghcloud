import { defineComponent, onMounted, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsSituation } from "@/infrastructure/api/alarm";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./security-alarm-count.module.less";

const alarmAccuracyRateIcon = getThemeImage("alarm-accuracy-rate.png");
const alarmHandlingRateIcon = getThemeImage("alarm-handling-rate.png");
const alarmCountIcon = getThemeImage("alarm-record.png");
const alarmResponseRateIcon = getThemeImage("alarm-response-rate.png");
const alarmTimeoutRateIcon = getThemeImage("alarm-timeout-rate.png");
const fireAlarmProportionIcon = getThemeImage("fire-alarm-proportion.png");

type AlarmMetricItem = {
  name: string;
  value: number;
  iconClass: string;
  iconSrc: string;
  accentColor: string;
};

const clampPercent = (value: number): number => Math.max(0, Math.min(Number(value) || 0, 100));

export const SecurityAlarmCount = defineComponent({
  name: "SecurityAlarmCount",
  props: {
    title: { type: String, default: "报警情况统计" },
  },
  setup(props) {
    const { globalState } = useStateStore();
    const alarmtimeType = ref({
      timeType: "THIS_YEAR",
      dateRange: [] as string[],
    });

    const contentList = ref<AlarmMetricItem[]>([
      {
        name: "报警超时率",
        value: 0,
        iconClass: "is-timeout",
        iconSrc: alarmTimeoutRateIcon,
        accentColor: "#faad14",
      },
      {
        name: "报警正确率",
        value: 0,
        iconClass: "is-accuracy",
        iconSrc: alarmAccuracyRateIcon,
        accentColor: "#3ecf8e",
      },
      {
        name: "消防报警占比",
        value: 0,
        iconClass: "is-ratio",
        iconSrc: fireAlarmProportionIcon,
        accentColor: "#3f8fe8",
      },
      {
        name: "报警响应率",
        value: 0,
        iconClass: "is-response",
        iconSrc: alarmResponseRateIcon,
        accentColor: "#26c2bc",
      },
      {
        name: "报警处理率",
        value: 0,
        iconClass: "is-handle",
        iconSrc: alarmHandlingRateIcon,
        accentColor: "#5b9ce2",
      },
    ]);

    const changeDate = async (): Promise<void> => {
      const data = await statisticsSituation({
        areaId: globalState.business.currentAreaId,
        period: alarmtimeType.value.dateRange.join(","),
        type: alarmtimeType.value.timeType,
        sceneType: globalState.business.currentMenu,
      });

      contentList.value[0].value = Number(data.timeoutRatio);
      contentList.value[1].value = Number(data.actualRatio);
      contentList.value[2].value = Number(data.ratio);
      contentList.value[3].value = Number(data.confirmedRatio);
      contentList.value[4].value = Number(data.handlerRatio);
    };

    onMounted(() => {
      void changeDate();
    });

    const renderMetricBody = (isZoom: boolean): JSX.Element => (
      <div class={["security-alarm-count-v2", "security-alarm-count-v2-panel", isZoom ? "is-zoom" : ""]}>
        <div class={["alarm-metric-panel", isZoom ? "is-zoom" : ""]} data-no-zoom>
          {contentList.value.map((item) => (
            <div class={["alarm-metric-row", item.iconClass]} key={`${isZoom ? "zoom-" : ""}${item.name}`}>
              <div class={["row-icon", item.iconClass]}>
                <img src={item.iconSrc} alt="" class="row-icon-img" />
              </div>
              <div class="row-body">
                <div class="row-head">
                  <span class="row-label">{item.name}</span>
                  <span class={["row-value", `${item.iconClass}-value`]}>
                    <CountTo startVal={0} endVal={Number(item.value)} separator="" duration={2000} />
                    <span class="row-unit">%</span>
                  </span>
                </div>
                <div class="row-track">
                  <div
                    class="row-fill"
                    style={{
                      width: `${clampPercent(item.value)}%`,
                      background: item.accentColor,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    return () => (
      <div class="v2-panel-root security-alarm-count-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card security-alarm-count-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={720}
          v-slots={{
            titleIcon: () => <img src={alarmCountIcon} alt="" class="title-icon-img" />,
            extra: () => (
              <DateInlineForm
                modelValue={alarmtimeType.value}
                onUpdate:modelValue={(v) => {
                  alarmtimeType.value = v;
                }}
                onSearch={changeDate}
                data-no-zoom
              />
            ),
            default: () => renderMetricBody(false),
            "zoom-content": () => renderMetricBody(true),
          }}
        />
      </div>
    );
  },
});

export default SecurityAlarmCount;
