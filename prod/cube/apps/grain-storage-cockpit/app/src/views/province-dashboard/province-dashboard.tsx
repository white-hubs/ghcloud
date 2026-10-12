import { computed, defineComponent, reactive, shallowRef } from "vue";
import { useRouter } from "vue-router";

import { CockpitHeader } from "@/components/cockpit-header";
import { CockpitPanel } from "@/components/cockpit-panel";
import { DepotSummaryModal } from "@/components/depot-summary-modal";
import { EchartsProgressBar } from "@/components/echarts-progress-bar";
import { HunanDepotMap } from "@/components/hunan-depot-map";
import { InventoryBars } from "@/components/inventory-bars";
import { RiskEventList } from "@/components/risk-event-list";
import { RiskTag } from "@/components/risk-tag";
import { useCockpitClock } from "@/hooks/use-cockpit-clock";
import {
  CONCERN_BATCHES,
  DEPOTS,
  INVENTORY_ITEMS,
  LIFECYCLE_STAGES,
  PROVINCE_ACTIVE_TASKS,
  PROVINCE_KPIS,
  PROVINCE_SPECIAL_JOBS,
  RISK_EVENTS,
  RISK_META,
} from "@/mocks/cockpit-data";
import type { CockpitFilters } from "@/types/cockpit";
import { filterConcernBatches, filterRiskEvents } from "@/utils/cockpit";

const mapLegend = [
  ["重大风险", "#ff4d4f"],
  ["较大风险", "#fa8c16"],
  ["一般风险", "#faad14"],
  ["关注", "#1677ff"],
  ["正常", "#52c41a"],
];

const activeSpecialJobCount = PROVINCE_SPECIAL_JOBS.reduce((total, job) => total + Number(job.value), 0);

export const ProvinceDashboard = defineComponent({
  name: "ProvinceDashboard",
  setup: () => {
    const router = useRouter();
    const { clock, updateTime } = useCockpitClock();
    const filters = reactive<CockpitFilters>({ depot: "全部", grain: "全部", level: "全部" });
    const selectedDepot = shallowRef(false);
    const visibleEvents = computed(() => filterRiskEvents(RISK_EVENTS, filters));
    const visibleBatches = computed(() => filterConcernBatches(CONCERN_BATCHES, filters));
    const mapDimmed = computed(() => filters.depot !== "全部" && filters.depot !== DEPOTS[0].name);

    const applyFilters = (next: CockpitFilters): void => {
      Object.assign(filters, next);
    };

    return (): JSX.Element => (
      <div class="grain-cockpit grain-cockpit--province">
        <CockpitHeader
          title="集团储量安全驾驶舱"
          subtitle="政府储备粮全生命周期安全监管"
          clock={clock.value}
          updateTime={updateTime.value}
          filters={filters}
          onFilterChange={applyFilters}
        />

        <section class="province-kpis">
          {PROVINCE_KPIS.map((metric) => (
            <article class="cockpit-kpi" key={metric.label}>
              <span>{metric.label}</span>
              <div>
                <strong class={`tone-${metric.tone}`}>{metric.value}</strong>
                <em>{metric.unit}</em>
              </div>
              <small>{metric.note}</small>
            </article>
          ))}
        </section>

        <main class="cockpit-columns">
          <aside class="cockpit-column cockpit-column--side">
            <CockpitPanel title="储粮生命周期" subtitle="任务数 / 涉及吨位">
              <div class="lifecycle-stages">
                {LIFECYCLE_STAGES.map((stage, index) => (
                  <div class="lifecycle-stages__fragment" key={stage.name}>
                    <div class={["lifecycle-stage", stage.active && "lifecycle-stage--active"]}>
                      <span>{stage.name}</span>
                      <b>{stage.count}</b>
                      <small>{stage.tons}</small>
                    </div>
                    {index < LIFECYCLE_STAGES.length - 1 ? <i>›</i> : null}
                  </div>
                ))}
              </div>
            </CockpitPanel>

            <CockpitPanel title="在库保管概况" subtitle="库存结构 · 账实差异">
              <InventoryBars items={INVENTORY_ITEMS} />
              <div class="inventory-balance">
                <div>
                  <span>
                    雷达测算 <b>18.55</b> 万吨
                  </span>
                  <i />
                  <span>
                    账面 <b>18.60</b> 万吨
                  </span>
                </div>
                <div>
                  <span>
                    总差异 <strong>-0.05 万吨（-0.27%）</strong>
                  </span>
                  <span>
                    超差货位 <em>2</em> 个
                  </span>
                </div>
              </div>
            </CockpitPanel>

            <CockpitPanel title="重点关注批次" subtitle={`${visibleBatches.value.length} 条`} grow bodyClass="cockpit-panel__body--scroll">
              {visibleBatches.value.length ? (
                visibleBatches.value.map((batch) => (
                  <article class="batch-item" key={`${batch.warehouse}-${batch.slot}`}>
                    <div>
                      <strong>
                        {batch.warehouse} · {batch.slot}
                      </strong>
                      <RiskTag level={batch.level} />
                    </div>
                    <div>
                      <span>
                        {batch.grain} · <b>{batch.tons}</b> 吨
                      </span>
                      <em style={{ color: RISK_META[batch.level].color }}>{batch.risk}</em>
                    </div>
                    <div>
                      <span>
                        责任人 <b>{batch.owner}</b>
                      </span>
                      <span>{batch.status}</span>
                    </div>
                  </article>
                ))
              ) : (
                <div class="cockpit-placeholder">暂无匹配的关注批次</div>
              )}
            </CockpitPanel>
          </aside>

          <section class="cockpit-panel cockpit-map-panel">
            <div class="cockpit-map-panel__heading">
              <h2>全省库区态势分布</h2>
              <div>
                {mapLegend.map(([label, color]) => (
                  <span key={label}>
                    <i style={{ backgroundColor: color }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div class="cockpit-map-panel__rules">
              点位大小 = 库存量
              <br />
              点位颜色 = 当前最高风险等级
              <br />
              外圈闪烁 = 存在重大风险 / 超时事件
            </div>
            <HunanDepotMap
              depot={DEPOTS[0]}
              dimmed={mapDimmed.value || selectedDepot.value}
              onSelectDepot={() => {
                selectedDepot.value = true;
              }}
            />
            <div class="cockpit-map-panel__watermark">开河平台 · 湖南省行政区划 · 点击库区点位查看摘要</div>
          </section>

          <aside class="cockpit-column cockpit-column--side">
            <CockpitPanel
              title="实时风险事件"
              subtitle={`● 未闭环 ${visibleEvents.value.length} 起`}
              grow
              bodyClass="cockpit-panel__body--scroll"
            >
              <RiskEventList events={visibleEvents.value} />
            </CockpitPanel>

            <CockpitPanel title="当前作业与闭环" subtitle="出入库 · 特殊作业 · 闭环督办" grow bodyClass="operation-overview">
              <div class="closure-summary">
                <div>
                  <span>今日闭环率</span>
                  <b class="tone-yellow">
                    68.2<small>%</small>
                  </b>
                  <EchartsProgressBar class="closure-summary__chart" percent={68.2} color="#faad14" height={6} label="今日闭环率" />
                </div>
                <div>
                  <span>待复核事件</span>
                  <b class="tone-blue">1</b>
                  <small>处置完成待验收</small>
                </div>
                <div>
                  <span>超时隐患</span>
                  <b class="tone-red is-pulsing">2</b>
                  <small>超整改期限未闭环</small>
                </div>
              </div>
              <h3 class="section-caption">
                <i />
                进行中出入库任务 <small>{PROVINCE_ACTIVE_TASKS.length} 项</small>
              </h3>
              <div class="active-tasks">
                {PROVINCE_ACTIVE_TASKS.map((task) => (
                  <div key={`${task.category}-${task.warehouse}`}>
                    <div>
                      <RiskTag level="蓝" text={task.category} category={task.category === "出库"} />
                      <span>{task.warehouse}</span>
                      <small>{task.detail}</small>
                    </div>
                    <EchartsProgressBar
                      class="active-tasks__chart"
                      percent={task.percent}
                      color={task.color}
                      height={6}
                      label={`${task.warehouse}${task.category}进度`}
                    />
                  </div>
                ))}
              </div>
              <h3 class="section-caption section-caption--orange">
                <i />
                进行中特殊作业 <small>{activeSpecialJobCount} 项</small>
              </h3>
              <div class="special-jobs">
                {PROVINCE_SPECIAL_JOBS.map((job) => (
                  <div class={`special-jobs__${job.tone}`} key={job.label}>
                    <b>{job.value}</b>
                    <span>{job.label}</span>
                  </div>
                ))}
              </div>
              <p class="operation-note">熏蒸：P12仓气体监护 · 高处：P14仓风机检修 · 临电：P18仓测温缆更换 · 动火：机修间审批中</p>
            </CockpitPanel>
          </aside>
        </main>

        <DepotSummaryModal
          visible={selectedDepot.value}
          depot={DEPOTS[0]}
          onClose={() => {
            selectedDepot.value = false;
          }}
          onEnter={() => {
            void router.push("/details");
          }}
        />
      </div>
    );
  },
});
