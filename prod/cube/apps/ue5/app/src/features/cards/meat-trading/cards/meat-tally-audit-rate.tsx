import { defineComponent, reactive, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { arrangedata } from "@/infrastructure/api/slide";
import { setTimeType } from "@/infrastructure/utils/common";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./meat-trading-v2-shared.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card meat-v2-panel";

interface AuditMetric {
  title: string;
  count: number;
  rate: number;
  qoq: number;
  status: "passed" | "failed";
}

export const MeatTallyAuditRate = defineComponent({
  name: "MeatTallyAuditRate",
  setup() {
    const auditTime = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [],
    });

    const timeList = [
      { label: "近7天", value: "THIS_WEEK" },
      { label: "近30天", value: "THIS_MONTH" },
      { label: "近1年", value: "THIS_YEAR" },
    ];

    const arranged = reactive({
      total: 0,
      porkArrangeAuditPassedNum: 0,
      porkArrangeAuditPassed: 0,
      qoqPorkArrangeAuditPassed: 0,
      porkArrangeAuditFailedNum: 0,
      porkArrangeAuditFailed: 0,
      qoqPorkArrangeAuditFailed: 0,
    });

    const normalizeNumber = (value: unknown): number => {
      const numericValue = Number(value ?? 0);
      return Number.isFinite(numericValue) ? numericValue : 0;
    };

    const changeAuditTime = async () => {
      const data = await arrangedata({ type: setTimeType(auditTime.value.timeType) });
      Object.assign(arranged, {
        total: normalizeNumber(data.total),
        porkArrangeAuditPassedNum: normalizeNumber(data.porkArrangeAuditPassedNum),
        porkArrangeAuditPassed: normalizeNumber(data.porkArrangeAuditPassed),
        qoqPorkArrangeAuditPassed: normalizeNumber(data.qoqPorkArrangeAuditPassed),
        porkArrangeAuditFailedNum: normalizeNumber(data.porkArrangeAuditFailedNum),
        porkArrangeAuditFailed: normalizeNumber(data.porkArrangeAuditFailed),
        qoqPorkArrangeAuditFailed: normalizeNumber(data.qoqPorkArrangeAuditFailed),
      });
    };

    const renderAuditMetric = (item: AuditMetric): JSX.Element => (
      <div class={["meat-v2-audit-card", "meat-v2-surface", `is-${item.status}`]} key={item.title}>
        <div class="meat-v2-audit-head">
          <span class="meat-v2-metric-title">
            <span class="meat-v2-dot" aria-hidden="true" />
            {item.title}
          </span>
          <span class={["meat-v2-qoq", item.qoq > 0 ? "is-up" : ""]}>
            <span>环比</span>
            <span class="meat-v2-qoq-mark" aria-hidden="true" />
            <span class="meat-v2-qoq-value">{item.qoq}%</span>
          </span>
        </div>
        <div class="meat-v2-audit-main">
          <span class="meat-v2-value">
            <CountTo startVal={0} endVal={item.count} duration={1600} separator="," />
          </span>
          <span class="meat-v2-unit">条</span>
          <span class="meat-v2-audit-rate">{item.rate}%</span>
        </div>
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => {
      const auditMetrics: AuditMetric[] = [
        {
          title: "理货合格数",
          count: arranged.porkArrangeAuditPassedNum,
          rate: arranged.porkArrangeAuditPassed,
          qoq: arranged.qoqPorkArrangeAuditPassed,
          status: "passed",
        },
        {
          title: "理货不合格数",
          count: arranged.porkArrangeAuditFailedNum,
          rate: arranged.porkArrangeAuditFailed,
          qoq: arranged.qoqPorkArrangeAuditFailed,
          status: "failed",
        },
      ];

      return (
        <div class={["meat-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
          <div class={["meat-v2-audit-layout", isZoom ? "is-zoom" : ""]}>
            <div class={["meat-v2-audit-total", "meat-v2-surface"]}>
              <span class="meat-v2-metric-title">
                <span class="meat-v2-dot" aria-hidden="true" />
                理货审核总数
              </span>
              <span class="meat-v2-metric-main">
                <span class="meat-v2-value">
                  <CountTo startVal={0} endVal={arranged.total} duration={1600} separator="," />
                </span>
                <span class="meat-v2-unit">条</span>
              </span>
            </div>
            <div class="meat-v2-audit-side">{auditMetrics.map((item) => renderAuditMetric(item))}</div>
          </div>
        </div>
      );
    };

    return (): JSX.Element => (
      <div class="meat-v2-root">
        <SubPanelTemplate
          title="理货审核率"
          class={PANEL_CLASS}
          zoomable
          zoom-title="理货审核率详情"
          zoom-width={860}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="meat-audit" />,
            extra: () => (
              <div class="meat-v2-toolbar" data-no-zoom>
                <DateInlineForm
                  timeList={timeList}
                  modelValue={auditTime.value}
                  onUpdate:modelValue={(v) => {
                    auditTime.value = v;
                  }}
                  onSearch={changeAuditTime}
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

export default MeatTallyAuditRate;
