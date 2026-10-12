import { computed, defineComponent, type PropType } from "vue";

import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";

export type EnergyRankItem = {
  name: string;
  value: number;
};

const topColors = ["#f14545", "#ff9f18", "#2f7bff"];
const barColors = ["#3d8fff", "#35c56f", "#ff9f18", "#7c61ff", "#ec5ca8", "#13c2c2"];

const getBadgeClass = (index: number): string => {
  if (index === 0) return "is-first";
  if (index === 1) return "is-second";
  if (index === 2) return "is-third";
  return "";
};

const getBarGradient = (index: number): string => {
  if (index < 3) {
    const color = topColors[index];
    return `linear-gradient(90deg, ${color}aa, ${color})`;
  }
  const color = barColors[index % barColors.length];
  return `linear-gradient(90deg, ${color}99, ${color})`;
};

export const EnergyRankList = defineComponent({
  name: "EnergyRankList",
  props: {
    list: { type: Array as PropType<EnergyRankItem[]>, required: true },
    unit: { type: String, default: "" },
    isZoom: { type: Boolean, default: false },
  },
  setup(props) {
    const maxValue = computed(() => {
      const values = props.list.map((item) => Number(item.value) || 0);
      return values.length ? Math.max(...values) : 0;
    });

    const getBarPercent = (value?: number): number => {
      if (!maxValue.value) return 0;
      return Math.min(100, Math.max(4, ((value || 0) / maxValue.value) * 100));
    };

    return (): JSX.Element => {
      if (!props.list.length) {
        return <NoData />;
      }

      return (
        <div class={["energy-v2-rank-list", props.isZoom ? "is-zoom" : ""]}>
          {props.list.map((item, index) => (
            <div class="energy-v2-rank-row" key={`${props.isZoom ? "zoom-" : ""}${item.name}-${index}`}>
              <span class={["energy-v2-rank-badge", getBadgeClass(index)]}>{index + 1}</span>
              <div class="energy-v2-rank-main">
                <div class="energy-v2-rank-name" title={item.name}>
                  {item.name}
                </div>
                <div class="energy-v2-rank-bar-track">
                  <div
                    class="energy-v2-rank-bar-fill"
                    style={{
                      width: `${getBarPercent(item.value)}%`,
                      background: getBarGradient(index),
                    }}
                  />
                </div>
              </div>
              <div class="energy-v2-rank-value">
                <CountTo startVal={0} endVal={Number(item.value) || 0} duration={1200} separator="" />
                {props.unit ? <span style={{ marginLeft: "2px", fontSize: "12px", fontWeight: 600 }}>{props.unit}</span> : null}
              </div>
            </div>
          ))}
        </div>
      );
    };
  },
});

export default EnergyRankList;
