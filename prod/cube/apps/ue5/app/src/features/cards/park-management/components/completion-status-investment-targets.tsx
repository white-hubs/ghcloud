import dayjs from "dayjs";
import { defineComponent, onMounted, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { investmentPlanPage } from "@/infrastructure/api/youxianqu-park";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "../cards/park-management-v2-shared.module.less";
import "./completion-status-investment-targets.module.less";

type TimeOption = { label: string; value: string };
type MetricItem = { name: string; value: number; className: string };

/** 与 legacy 一致：当年 1 月～当前月 */
const buildMonthOptions = (): TimeOption[] => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const options: TimeOption[] = [];
  for (let index = 1; index <= month; index++) {
    options.push({
      label: `${index}月`,
      value: dayjs(`${year}-${index}`).format("YYYY-MM"),
    });
  }
  return options;
};

export const CompletionStatusInvestmentTargets = defineComponent({
  name: "CompletionStatusInvestmentTargets",
  props: {
    title: { type: String, required: false, default: "招商目标完成情况" },
  },
  setup(props) {
    const timeList = ref<TimeOption[]>(buildMonthOptions());
    const currentMonth = dayjs().format("YYYY-MM");
    // legacy：timeType 即 planMonth（YYYY-MM），非 THIS_YEAR
    const through = ref<ModelValueItf>({
      timeType: currentMonth,
      dateRange: ["", ""],
    });
    const metrics = ref<MetricItem[]>([
      { name: "租赁完成", value: 0, className: "is-available" },
      { name: "销售完成", value: 0, className: "is-sale" },
      { name: "购地完成", value: 0, className: "is-land" },
    ]);

    /** 对齐 legacy：investmentPlanPage({ targetType, planMonth }) */
    const changeDate = async (): Promise<void> => {
      try {
        const planMonth = through.value?.timeType || currentMonth;
        if (!planMonth) return;
        const [purchase, lease, sale] = await Promise.all([
          investmentPlanPage({ targetType: "1", planMonth }),
          investmentPlanPage({ targetType: "2", planMonth }),
          investmentPlanPage({ targetType: "3", planMonth }),
        ]);
        // legacy 赋值顺序：租赁=targetType2，销售=targetType3，购地=targetType1
        metrics.value[0].value = Number(lease?.total) || 0;
        metrics.value[1].value = Number(sale?.total) || 0;
        metrics.value[2].value = Number(purchase?.total) || 0;
      } catch {
        metrics.value[0].value = 0;
        metrics.value[1].value = 0;
        metrics.value[2].value = 0;
      }
    };

    onMounted(() => {
      void changeDate();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["park-manage-v2-body invest-target-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class={["park-manage-metric-grid", "is-three", isZoom ? "is-zoom" : ""]} data-no-zoom>
          {metrics.value.map((item) => (
            <div class={["park-manage-metric-card", item.className]} key={item.name}>
              <span class="park-manage-metric-label">{item.name}</span>
              <span class="park-manage-metric-value">
                <CountTo startVal={0} endVal={item.value} duration={1600} separator="" />
              </span>
            </div>
          ))}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root park-manage-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme park-manage-v2-panel invest-target-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={760}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-management" />,
            extra: () => (
              <div class="access-control-header-toolbar" data-no-zoom>
                <DateInlineForm
                  timeList={timeList.value}
                  modelValue={through.value}
                  onUpdate:modelValue={(v) => {
                    through.value = v;
                  }}
                  onSearch={changeDate}
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

export default CompletionStatusInvestmentTargets;
