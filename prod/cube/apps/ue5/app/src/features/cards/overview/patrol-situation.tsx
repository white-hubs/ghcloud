import { defineComponent } from "vue";
import { CountTo } from "vue3-count-to";

import { getAssetsImage } from "@/infrastructure/utils/getImage";

import "./patrol-situation.module.less";

export const PatrolSituation = defineComponent({
  name: "PatrolSituation",
  props: {
    statistic: { type: Object, required: true },
    zoom: { type: Boolean, default: false },
  },
  setup(props) {
    interface Item {
      label: string;
      value: number;
      color: string;
    }
    interface Props {
      statistic: {
        title: string;
        total: number;
        itemize: Item[];
      };
    }
    return (): JSX.Element => (
      <div class={["patrol-situation", props.zoom ? "is-zoom" : ""]}>
        <div class="patrol-summary-card">
          <div class="patrol-orb" aria-hidden="true">
            <span class="patrol-orb-halo" />
            <img src={getAssetsImage("overView7.png")} alt="" />
          </div>
          <div class="patrol-total-content">
            <div class="patrol-total-label">{(props.statistic as Props["statistic"]).title}</div>
            <div class="patrol-total-row">
              <CountTo
                startVal={0}
                endVal={(props.statistic as Props["statistic"]).total}
                duration={1200}
                class="patrol-total-value scroll-number"
              />
              <span class="patrol-total-unit">项</span>
            </div>
          </div>
        </div>

        <div class="patrol-status-grid">
          {((props.statistic as Props["statistic"]).itemize || []).map((item) => (
            <div class="patrol-status-card" key={item.label} style={{ "--patrol-color": item.color }}>
              <div class="patrol-status-label">
                <i class="patrol-status-dot" />
                <span title={item.label}>{item.label}</span>
              </div>
              <div class="patrol-status-value-row">
                <CountTo startVal={0} endVal={item.value} duration={1200} class="patrol-status-value scroll-number" />
                <span class="patrol-status-unit">项</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
});

export default PatrolSituation;
