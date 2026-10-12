import { defineComponent, type PropType } from "vue";

import { EchartsProgressBar } from "./echarts-progress-bar";
import { RiskTag } from "./risk-tag";
import type { InventoryItem } from "@/types/cockpit";

const PROGRESS_COLORS = ["#13c2c2", "#36cfc9", "#faad14", "#b37feb"];

export const InventoryBars = defineComponent({
  name: "InventoryBars",
  props: {
    items: { type: Array as PropType<InventoryItem[]>, required: true },
    showRiskCount: { type: Boolean, default: false },
  },
  setup: (props) => {
    return (): JSX.Element => (
      <div class="inventory-bars">
        {props.items.map((item, index) => (
          <div class="inventory-bars__item" key={item.name}>
            <div class="inventory-bars__meta">
              <span>{item.name}</span>
              <span>
                <b>{item.amount}</b> 万吨 · {item.percentage}%
              </span>
              {props.showRiskCount ? (
                item.riskBatches ? (
                  <RiskTag level={item.riskBatches >= 3 ? "红" : "橙"} text={String(item.riskBatches)} />
                ) : (
                  <small>0</small>
                )
              ) : null}
            </div>
            <EchartsProgressBar
              class="inventory-bars__chart"
              percent={item.percentage}
              color={PROGRESS_COLORS[index]}
              height={6}
              label={`${item.name}库存占比`}
            />
          </div>
        ))}
      </div>
    );
  },
});
