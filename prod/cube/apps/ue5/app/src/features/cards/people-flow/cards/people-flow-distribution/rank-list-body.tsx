import { defineComponent, type PropType } from "vue";

import type { TrafficDetectionAreaPersonFlowRankVO } from "@ghcloud/cube-traffic-detection-service";

import { Vue3SeamlessScroll } from "@/features/panel-shell/tables/seamless-scroll";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";

import "./rank-list-body.module.less";

export type RankItem = TrafficDetectionAreaPersonFlowRankVO & {
  id?: number | string;
  name?: string;
  totalPersonNumber?: number;
  avgPersonNumber?: number;
  peakPersonNumber?: number;
};

const topBadgeColors = ["#f14545", "#ff9f18", "#2f7bff"];
const barColors = ["#3d8fff", "#35c56f", "#ff9f18", "#7c61ff", "#ec5ca8", "#13c2c2"];

export const RankListBody = defineComponent({
  name: "RankListBody",
  props: {
    list: { type: Array as PropType<RankItem[]>, required: true },
    total: { type: Number, required: true },
    areaCount: { type: Number, required: true },
    peakMax: { type: Number, required: true },
    averageTitle: { type: String, required: true },
    peakTitle: { type: String, required: true },
    maxTotal: { type: Number, required: true },
    scrollThreshold: { type: Number, default: 4 },
    isZoom: { type: Boolean, default: false },
  },
  emits: ["select"],
  setup(props, { emit }) {
    const getBarPercent = (value?: number): number => {
      if (!props.maxTotal) return 0;
      const percent = ((value || 0) / props.maxTotal) * 100;
      return Math.min(100, Math.max(4, percent));
    };

    const getSharePercent = (value?: number): string => {
      if (!props.total) return "0%";
      return `${(((value || 0) / props.total) * 100).toFixed(0)}%`;
    };

    const getBarColor = (index: number): string => {
      if (index < 3) {
        return `linear-gradient(90deg, ${topBadgeColors[index]}aa, ${topBadgeColors[index]})`;
      }
      return `linear-gradient(90deg, ${barColors[index % barColors.length]}99, ${barColors[index % barColors.length]})`;
    };

    const getBadgeClass = (index: number): string => {
      if (index === 0) return "is-first";
      if (index === 1) return "is-second";
      if (index === 2) return "is-third";
      return "";
    };

    const getBadgeStyle = (index: number): Record<string, string> => {
      if (index < 3) {
        const color = topBadgeColors[index];
        return {
          background: color,
          color: "#ffffff",
          boxShadow: `0 2px 8px ${color}59`,
        };
      }
      return {
        background: "rgba(97, 148, 247, 0.28)",
        color: "#edf4ff",
        border: "1px solid rgba(121, 160, 208, 0.55)",
        boxShadow: "none",
      };
    };

    const renderRow = (item: RankItem, index: number, keyPrefix = "") => (
      <div class={["rank-metric-row", getBadgeClass(index)]} key={`${keyPrefix}${item.id}`} onClick={() => emit("select", item)}>
        <div class={["rank-badge", getBadgeClass(index)]} style={getBadgeStyle(index)}>
          {index + 1}
        </div>
        <div class="rank-row-body">
          <div class="rank-row-head">
            <span class="rank-area-name" title={item.name || "--"}>
              {item.name || "--"}
            </span>
            <span class="rank-total-value">
              <CountTo startVal={0} endVal={item.totalPersonNumber || 0} separator="" duration={2000} />
              <span class="rank-total-unit">人次</span>
            </span>
          </div>
          <div class="rank-track">
            <div
              class="rank-fill"
              style={{
                width: `${getBarPercent(item.totalPersonNumber)}%`,
                background: getBarColor(index),
              }}
            />
          </div>
          <div class="rank-meta">
            <span class="rank-meta-item">
              <span class="rank-meta-label">{props.averageTitle}</span>
              <span class="rank-meta-value">
                <CountTo startVal={0} endVal={item.avgPersonNumber || 0} separator="" duration={2000} />
              </span>
            </span>
            <span class="rank-meta-item">
              <span class="rank-meta-label">{props.peakTitle}</span>
              <span class="rank-meta-value">
                <CountTo startVal={0} endVal={item.peakPersonNumber || 0} separator="" duration={2000} />
              </span>
            </span>
            <span class="rank-meta-item">
              <span class="rank-meta-label">占比</span>
              <span class="rank-meta-value">{getSharePercent(item.totalPersonNumber)}</span>
            </span>
          </div>
        </div>
      </div>
    );

    return () => (
      <div class={["rank-list-body", "people-flow-distribution-v2-panel", props.isZoom ? "is-zoom" : ""]}>
        <div class="summary-bar">
          <div class="summary-inline is-areas">
            <span class="summary-inline-label">区域数量</span>
            <span class="summary-inline-value">
              <CountTo startVal={0} endVal={props.areaCount} separator="" duration={1600} />
              <span class="summary-inline-unit">个</span>
            </span>
          </div>
          <div class="summary-inline is-total">
            <span class="summary-inline-label">总人次</span>
            <span class="summary-inline-value">
              <CountTo startVal={0} endVal={props.total} separator="" duration={2000} />
              <span class="summary-inline-unit">人次</span>
            </span>
          </div>
          <div class="summary-inline is-peak">
            <span class="summary-inline-label">{props.peakTitle}</span>
            <span class="summary-inline-value">
              <CountTo startVal={0} endVal={props.peakMax} separator="" duration={2000} />
              <span class="summary-inline-unit">人次</span>
            </span>
          </div>
        </div>

        <div class="list-hint">点击区域可切换并查看热力分布</div>

        <div class={["rank-metric-panel", props.isZoom ? "is-zoom" : ""]}>
          {!props.list.length ? (
            <NoData />
          ) : props.isZoom || props.list.length < props.scrollThreshold ? (
            <div class={["rank-list", props.isZoom ? "is-zoom" : ""]}>{props.list.map((item, index) => renderRow(item, index))}</div>
          ) : (
            <Vue3SeamlessScroll list={props.list} step={0.5} hover class="rank-list rank-scroll">
              {props.list.map((item, index) => renderRow(item, index, "scroll-"))}
            </Vue3SeamlessScroll>
          )}
        </div>
      </div>
    );
  },
});
