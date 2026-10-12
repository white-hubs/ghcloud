import { defineComponent, shallowRef } from "vue";
import { useRouter } from "vue-router";

import { CockpitHeader } from "@/components/cockpit-header";
import { CockpitPanel } from "@/components/cockpit-panel";
import { DepotPlanImage } from "@/components/depot-plan-image";
import { EchartsProgressBar } from "@/components/echarts-progress-bar";
import { InventoryBars } from "@/components/inventory-bars";
import { RiskTag } from "@/components/risk-tag";
import { WarehouseSummaryModal } from "@/components/warehouse-summary-modal";
import { useCockpitClock } from "@/hooks/use-cockpit-clock";
import { DETAIL_RISKS, INVENTORY_ITEMS, OPERATION_TASKS, P01_WAREHOUSE, RISK_META } from "@/mocks/cockpit-data";

const detailLegends = [
  { label: "正常保管", color: "#52c41a" },
  { label: "重点关注", color: "#1677ff" },
  { label: "一般风险", color: "#faad14" },
  { label: "较大风险", color: "#fa8c16" },
  { label: "重大风险", color: "#ff4d4f" },
  { label: "设备/数据中断", color: "#64748b" },
];

export const DetailsDashboard = defineComponent({
  name: "DetailsDashboard",
  setup: () => {
    const router = useRouter();
    const { clock, updateTime } = useCockpitClock();
    const modalVisible = shallowRef(false);

    return (): JSX.Element => (
      <div class="grain-cockpit grain-cockpit--details">
        <CockpitHeader
          title="霞凝直属库 · 在库保管驾驶舱"
          subtitle="仓房粮情 · 保粮作业 · 风险闭环 一屏统管"
          clock={clock.value}
          updateTime={updateTime.value}
          legends={detailLegends}
          showBack
          onBack={() => {
            void router.push("/");
          }}
        />

        <div class="details-plan-backdrop">
          <DepotPlanImage
            onOpen={() => {
              modalVisible.value = true;
            }}
          />
        </div>

        <main class="cockpit-columns cockpit-columns--details">
          <aside class="cockpit-column cockpit-column--side cockpit-column--detail-left">
            <CockpitPanel title="库区保管总览" subtitle="实时汇总">
              <div class="depot-overview">
                {[
                  ["当前在库量", "18.6", "万吨", "cyan"],
                  ["仓房 / 货位 / 批次", "24/96/132", "", "blue"],
                  ["粮情正常仓房", "19", "/24", "green"],
                  ["风险影响库存", "1.42", "万吨", "orange"],
                  ["设备在线率", "97.8", "%", "green"],
                  ["账实差异关注货位", "2", "个", "yellow"],
                ].map(([label, value, unit, tone]) => (
                  <div class={`depot-overview__${tone}`} key={label}>
                    <span>{label}</span>
                    <b>
                      {value}
                      <small>{unit}</small>
                    </b>
                  </div>
                ))}
              </div>
            </CockpitPanel>

            <CockpitPanel title="品种与库存结构" subtitle="库存 · 风险批次">
              <InventoryBars items={INVENTORY_ITEMS} showRiskCount />
              <p class="inventory-total">
                合计 <b>18.6 万吨</b> · 风险批次 <strong>5</strong> 个
              </p>
            </CockpitPanel>

            <CockpitPanel title="今日保管任务" subtitle="完成进度 · 待办督办" grow bodyClass="daily-tasks">
              {[
                ["粮情巡检", "已完成 18 / 应完成 24 仓", 75, "#13c2c2"],
                ["质量检查", "已完成 5 / 待完成 3 项", 62.5, "#36cfc9"],
                ["设备巡检", "已完成 9 / 待完成 3 项", 75, "#52c41a"],
              ].map(([label, text, percent, color]) => (
                <div class="daily-task" key={String(label)}>
                  <div>
                    <span>{label}</span>
                    <small>{text}</small>
                  </div>
                  <EchartsProgressBar
                    class="daily-task__chart"
                    percent={Number(percent)}
                    color={String(color)}
                    height={7}
                    label={`${label}完成进度`}
                  />
                </div>
              ))}
              <div class="daily-task-alerts">
                <div>
                  <span>告警复核待处理</span>
                  <b>2</b>
                </div>
                <div>
                  <span>隐患整改超时</span>
                  <b class="is-pulsing">2</b>
                </div>
              </div>
              <p>
                未巡检仓房：P13 · P15 · P17 · Q01-Q03（截止 18:00）
                <br />
                超时整改：P03 雷达差异复核 · P09 超限装粮核查
              </p>
            </CockpitPanel>
          </aside>

          <section class="details-plan-stage">
            <div class="details-plan-stage__hint">点击库区背景图查看粮仓详情</div>
          </section>

          <aside class="cockpit-column cockpit-column--side cockpit-column--detail-right">
            <CockpitPanel title="实时粮情风险" subtitle="● 上报省级 4 · 库区全量 7" grow bodyClass="cockpit-panel__body--scroll">
              <div class="detail-risk-list">
                {DETAIL_RISKS.map((risk) => (
                  <article class="detail-risk" key={`${risk.type}-${risk.warehouse}`}>
                    <div>
                      <span>
                        <RiskTag level={risk.level} text={risk.levelText} />
                        <strong>{risk.type}</strong>
                      </span>
                      <em class={risk.overtime ? "is-overtime" : ""}>{risk.duration}</em>
                    </div>
                    <p>{risk.warehouse}</p>
                    <div>
                      <span>
                        影响 <b style={{ color: RISK_META[risk.level].color }}>{risk.tons}</b>
                        {risk.tons === "—" ? "" : " 吨"}
                      </span>
                      <span>
                        最新 <b style={{ color: RISK_META[risk.level].color }}>{risk.value}</b> / {risk.threshold}
                      </span>
                    </div>
                    <div>
                      <span>
                        保管员 <b>{risk.owner}</b>
                      </span>
                      <em style={{ color: RISK_META[risk.level].color }}>{risk.status}</em>
                    </div>
                  </article>
                ))}
              </div>
            </CockpitPanel>

            <CockpitPanel title="保粮作业" subtitle="进行中 5 项 · 只读监视" grow bodyClass="operation-task-list">
              {OPERATION_TASKS.map((task) => (
                <article class={["operation-task", task.blinking && "operation-task--blinking"]} key={task.title}>
                  <div>
                    <span>
                      <RiskTag level={task.level} text={task.category} />
                      {task.title}
                    </span>
                    <RiskTag level={task.level} text={task.status} />
                  </div>
                  <p>{task.detail}</p>
                </article>
              ))}
            </CockpitPanel>

            <CockpitPanel title="闭环状态" subtitle="在办 7 起">
              <div class="closure-states">
                {[
                  [1, "待确认", "blue"],
                  [1, "已派单", "cyan"],
                  [4, "处理中", "yellow"],
                  [1, "待复核", "purple"],
                  [2, "超时事件", "red"],
                ].map(([value, label, tone]) => (
                  <div class={`closure-states__${tone}`} key={String(label)}>
                    <b>{value}</b>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <div class="closure-rate">
                <div>
                  <span>
                    今日闭环率 <small>（今日 22 起 · 已闭环 15）</small>
                  </span>
                  <b>68.2%</b>
                </div>
                <EchartsProgressBar class="closure-rate__chart" percent={68.2} color="#faad14" height={7} label="今日闭环率" />
                <p>重点风险库区 · 省级督办中</p>
              </div>
            </CockpitPanel>
          </aside>
        </main>

        <WarehouseSummaryModal
          visible={modalVisible.value}
          warehouse={P01_WAREHOUSE}
          onClose={() => {
            modalVisible.value = false;
          }}
        />
      </div>
    );
  },
});
