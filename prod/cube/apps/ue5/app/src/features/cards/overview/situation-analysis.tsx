import { defineComponent } from "vue";
import { CountTo } from "vue3-count-to";

import { getAssetsImage } from "@/infrastructure/utils/getImage";

import "./situation-analysis.module.less";

export const SituationAnalysis = defineComponent({
  name: "SituationAnalysis",
  props: {
    imgPath: { type: String, required: true },
    statistic: { type: Object, required: true },
  },
  emits: ["clickNum"],
  setup(props, { emit }) {
    interface Item {
      label: string;
      value: number;
      color: string;
    }
    interface Props {
      imgPath: string;
      statistic: {
        title: string;
        total: number;
        itemize: Item[];
      };
    }
    const clickNum = (item?: any) => {
      emit("clickNum", item);
    };

    return (): JSX.Element => (
      <div class="situation-analysis">
        <button
          type="button"
          class="situation-total-card"
          onClick={() => {
            clickNum();
          }}
        >
          <span class="situation-total-icon">
            <img src={getAssetsImage(props.imgPath)} alt="" />
          </span>
          <span class="situation-total-content">
            <span class="situation-total-label">{(props.statistic as Props["statistic"]).title}</span>
            <span class="situation-total-value" title={`${(props.statistic as Props["statistic"]).total}`}>
              <CountTo startVal={0} endVal={(props.statistic as Props["statistic"]).total} duration={1200} class="scroll-number" />
            </span>
          </span>
        </button>
        <div class="situation-status-grid">
          {((props.statistic as Props["statistic"]).itemize || []).map((item) => (
            <button
              type="button"
              class="situation-status-item"
              key={item.label}
              onClick={() => {
                clickNum(item);
              }}
            >
              <span class="situation-status-label">
                <i class="situation-status-dot" style={{ backgroundColor: item.color }} />
                <span class="situation-status-name">{item.label}</span>
              </span>
              <span class="situation-status-value" style={{ color: item.color }} title={`${item.value}`}>
                <CountTo startVal={0} endVal={item.value} duration={1200} class="scroll-number" />
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  },
});

export default SituationAnalysis;
