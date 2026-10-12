import { defineComponent } from "vue";

import "@/features/equipment/modal-table/modal-equipmentAll-table.module.less";
import "./tip-modal.module.less";

type WeightRow = { label: string; weight: string };
type RangeRow = { range: string; score: string };

const ALARM_WEIGHT: WeightRow[] = [
  { label: "一级报警", weight: "200%" },
  { label: "二级报警", weight: "50%" },
  { label: "三/四级报警", weight: "20%" },
];

const RESPONSE_WEIGHT: WeightRow[] = [
  { label: "一级报警", weight: "200%" },
  { label: "二级报警", weight: "50%" },
  { label: "三/四级报警", weight: "20%" },
  { label: "隐患数量", weight: "50%" },
  { label: "隐患响应情况", weight: "80%" },
];

const SCORE_RANGES: { title: string; total: string; rows: RangeRow[] }[] = [
  {
    title: "安全报警数量",
    total: "总分值 30 分",
    rows: [
      { range: "0.13 以上", score: "30" },
      { range: "0.08 - 0.13", score: "20 - 30" },
      { range: "0.03 - 0.08", score: "10 - 20" },
      { range: "0.01 - 0.03", score: "5 - 10" },
      { range: "0 - 0.01", score: "0 - 5" },
    ],
  },
  {
    title: "报警响应数据",
    total: "总分值 30 分",
    rows: [
      { range: "1.6 - 2", score: "30" },
      { range: "1 - 1.6", score: "20 - 30" },
      { range: "0.5 - 1", score: "10 - 20" },
      { range: "0.1 - 0.5", score: "5 - 10" },
      { range: "0 - 0.1", score: "0 - 5" },
    ],
  },
  {
    title: "风险隐患数据",
    total: "总分值 10 分",
    rows: [
      { range: "5 以上", score: "10" },
      { range: "2.5 - 5", score: "3 - 5" },
      { range: "2 - 2.5", score: "1 - 3" },
      { range: "0 - 2", score: "0 - 1" },
    ],
  },
  {
    title: "隐患响应数量",
    total: "总分值 10 分",
    rows: [
      { range: "0.64 - 0.8", score: "5 - 10" },
      { range: "0.4 - 0.64", score: "2 - 5" },
      { range: "0.16 - 0.4", score: "1 - 2" },
      { range: "0 - 0.16", score: "0 - 1" },
    ],
  },
  {
    title: "风险源建档数据",
    total: "总分值 20 分",
    rows: [
      { range: "易燃设备未建档", score: "5" },
      { range: "消防设备未建档", score: "10" },
      { range: "电动车未建档", score: "5" },
    ],
  },
];

const LEVELS = [
  { key: "high", range: "0 - 60 分", title: "高风险", desc: "需要重点关注" },
  { key: "mid", range: "61 - 80 分", title: "中等风险", desc: "可选择性关注" },
  { key: "good", range: "81 - 100 分", title: "运行良好", desc: "持续保持" },
];

const DIMENSIONS = ["安全报警数据", "报警响应数据", "风险隐患数据", "隐患响应数据", "风险源建档数据"];

const FORMULAS = [
  {
    name: "安全报警数据",
    formula: "安全报警数量 × 报警权重 / 报警设备数",
    note: "分别计算一级、二级、三/四级报警指数值",
  },
  {
    name: "报警响应数据",
    formula: "报警未响应率 × 报警响应权重",
    note: "分别计算各级报警响应指数值",
  },
  {
    name: "风险隐患数据",
    formula: "隐患数量 × 隐患权重 / 市场面积",
    note: "",
  },
  {
    name: "隐患响应数据",
    formula: "隐患未处理率 × 隐患响应权重",
    note: "",
  },
  {
    name: "风险源建档",
    formula: "查询建档情况，若未建档则赋分值",
    note: "",
  },
];

const renderWeightTable = (title: string, rows: WeightRow[]): JSX.Element => (
  <div class="risk-tip-table-card">
    <div class="risk-tip-table-title">{title}</div>
    <div class="risk-tip-table">
      <div class="risk-tip-table-head">
        <span>指标项</span>
        <span>权重占比</span>
      </div>
      {rows.map((row) => (
        <div class="risk-tip-table-row" key={`${title}-${row.label}`}>
          <span>{row.label}</span>
          <span class="is-weight">{row.weight}</span>
        </div>
      ))}
    </div>
  </div>
);

const renderRangeTable = (item: (typeof SCORE_RANGES)[number]): JSX.Element => (
  <div class="risk-tip-table-card" key={item.title}>
    <div class="risk-tip-table-title">
      <span>{item.title}</span>
      <em>{item.total}</em>
    </div>
    <div class="risk-tip-table">
      <div class="risk-tip-table-head">
        <span>区间值</span>
        <span>分数</span>
      </div>
      {item.rows.map((row) => (
        <div class="risk-tip-table-row" key={`${item.title}-${row.range}`}>
          <span>{row.range}</span>
          <span class="is-score">{row.score}</span>
        </div>
      ))}
    </div>
  </div>
);

export const TipModal = defineComponent({
  name: "TipModal",
  setup() {
    return (): JSX.Element => (
      <div class="risk-tip-modal">
        <section class="risk-tip-section">
          <div class="risk-tip-section-title">风险指数说明</div>
          <p class="risk-tip-text">
            通过安全报警数据、报警响应数据、风险隐患数据、隐患响应数据、危险源建档数据等数据指标，综合评估各市场的安全风险值。
          </p>
        </section>

        <section class="risk-tip-section">
          <div class="risk-tip-section-title">
            得分说明
            <span class="risk-tip-badge">总分 100 分</span>
          </div>
          <div class="risk-tip-level-grid">
            {LEVELS.map((item) => (
              <div class={["risk-tip-level-card", `is-${item.key}`]} key={item.key}>
                <div class="risk-tip-level-range">{item.range}</div>
                <div class="risk-tip-level-name">{item.title}</div>
                <div class="risk-tip-level-desc">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section class="risk-tip-section">
          <div class="risk-tip-section-title">指标解释</div>
          <div class="risk-tip-subtitle">1、分析维度</div>
          <p class="risk-tip-text">通过以下 5 大类指标数据，分别设置权重、计算公式计算得出指数：</p>
          <div class="risk-tip-chip-row">
            {DIMENSIONS.map((item) => (
              <span class="risk-tip-chip" key={item}>
                {item}
              </span>
            ))}
          </div>
          <div class="risk-tip-table-grid is-two">
            {renderWeightTable("报警数据", ALARM_WEIGHT)}
            {renderWeightTable("报警响应", RESPONSE_WEIGHT)}
          </div>

          <div class="risk-tip-subtitle">2、整体计算步骤</div>
          <div class="risk-tip-step">
            <span class="risk-tip-step-index">01</span>
            <div class="risk-tip-step-body">
              <div class="risk-tip-step-title">按既定公式分别计算 5 类指标指数值</div>
              <div class="risk-tip-formula-list">
                {FORMULAS.map((item) => (
                  <div class="risk-tip-formula-item" key={item.name}>
                    <div class="risk-tip-formula-name">{item.name}</div>
                    <div class="risk-tip-formula-value">{item.formula}</div>
                    {item.note ? <div class="risk-tip-formula-note">{item.note}</div> : null}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div class="risk-tip-step">
            <span class="risk-tip-step-index">02</span>
            <div class="risk-tip-step-body">
              <div class="risk-tip-step-title">根据实际数据量测算，设置指标值对应得分区间</div>
              <div class="risk-tip-table-grid is-three">{SCORE_RANGES.map((item) => renderRangeTable(item))}</div>
            </div>
          </div>

          <div class="risk-tip-step is-simple">
            <span class="risk-tip-step-index">03</span>
            <div class="risk-tip-step-body">
              <div class="risk-tip-step-title">根据指数值区间与既定分数区间，应用斜率公式计算最终得分</div>
            </div>
          </div>

          <div class="risk-tip-step is-simple">
            <span class="risk-tip-step-index">04</span>
            <div class="risk-tip-step-body">
              <div class="risk-tip-step-title">汇总 5 类指标得分，得出安全风险分数并取反值</div>
            </div>
          </div>
        </section>
      </div>
    );
  },
});

export default TipModal;
