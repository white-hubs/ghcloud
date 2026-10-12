import { computed, defineComponent, onMounted, ref } from "vue";

import Pie from "../components/pie";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { suspicion } from "@/infrastructure/api/slide";
import { setTimeType } from "@/infrastructure/utils/common";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./meat-trading-v2-shared.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card meat-v2-panel";

export const TianjinBatchSuspicionRate = defineComponent({
  name: "TianjinBatchSuspicionRate",
  setup() {
    const suspicionTime = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [],
    });

    const timeList = [
      { label: "今日", value: "TODAY" },
      { label: "近7天", value: "THIS_WEEK" },
      { label: "近30天", value: "THIS_MONTH" },
      { label: "近1年", value: "THIS_YEAR" },
    ];

    const pieData = ref<any[]>([]);

    const normalizeNumber = (value: unknown): number => {
      const numericValue = Number(value ?? 0);
      return Number.isFinite(numericValue) ? numericValue : 0;
    };

    const hasData = computed(() => {
      const list = pieData.value[0]?.data;
      return Array.isArray(list) && list.some((item) => normalizeNumber(item?.value) > 0);
    });

    const changeSuspicionTime = (): void => {
      getSuspicion();
    };

    const getSuspicion = async (): Promise<void> => {
      const data = await suspicion({ type: setTimeType(suspicionTime.value.timeType) });
      pieData.value = [
        {
          name: "",
          type: "pie",
          radius: [56, 76],
          center: ["50%", "50%"],
          data: [
            {
              value: normalizeNumber(data.suspicionNum),
              name: `有嫌疑（${normalizeNumber(data.suspicion)}%）`,
              pop: normalizeNumber(data.qoqSuspicion),
              itemStyle: {
                color: "#FFAB10",
              },
            },
            {
              value: normalizeNumber(data.noDoubtNum),
              name: `无嫌疑（${normalizeNumber(data.noDoubt)}%）`,
              pop: normalizeNumber(data.qoqNoDoubt),
              itemStyle: {
                color: "#58FAB6",
              },
            },
          ],
        },
      ];
    };

    onMounted(() => {
      getSuspicion();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["meat-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {hasData.value ? (
          <div class={["meat-v2-chart", "meat-v2-surface", "meat-v2-pie-chart", isZoom ? "is-zoom" : ""]}>
            <Pie title="" colorLsit={["#FFAB10", "#58FAB6"]} data={pieData.value} xData={[]} />
          </div>
        ) : (
          <div class={["meat-v2-empty", "meat-v2-surface", isZoom ? "is-zoom" : ""]}>
            <NoData />
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="meat-v2-root">
        <SubPanelTemplate
          title="批次作弊嫌疑率"
          class={PANEL_CLASS}
          zoomable
          zoom-title="批次作弊嫌疑率详情"
          zoom-width={820}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="meat-batch" />,
            extra: () => (
              <div class="meat-v2-toolbar" data-no-zoom>
                <DateInlineForm
                  timeList={timeList}
                  modelValue={suspicionTime.value}
                  onUpdate:modelValue={(v) => {
                    suspicionTime.value = v;
                  }}
                  onSearch={changeSuspicionTime}
                />
              </div>
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default TianjinBatchSuspicionRate;
