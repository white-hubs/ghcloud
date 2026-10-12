import { defineComponent, type PropType } from "vue";

import type { TrafficDetectionDeviceStatVO } from "@ghcloud/cube-traffic-detection-service";

import { Vue3SeamlessScroll } from "@/features/panel-shell/tables/seamless-scroll";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { ProgressBar } from "@/shared-ui/panel/progress-bar/progress-bar";

import "./point-list-body.module.less";

export type PointFlowItem = TrafficDetectionDeviceStatVO & {
  key: string;
  label: string;
  value: number;
};

export const PointListBody = defineComponent({
  name: "PointListBody",
  props: {
    list: { type: Array as PropType<PointFlowItem[]>, required: true },
    total: { type: Number, required: true },
    pointCount: { type: Number, required: true },
    scrollThreshold: { type: Number, default: 5 },
    isZoom: { type: Boolean, default: false },
  },
  emits: ["select"],
  setup(props, { emit }) {
    const renderItem = (item: PointFlowItem, index: number, keyPrefix = "") => (
      <div class="point-item" key={`${keyPrefix}${item.key}`}>
        <ProgressBar
          detailMode="share"
          valueLabel="当前人次"
          totalLabel="总人次"
          unit="人次"
          total={props.total}
          label={item.label}
          rank={index + 1}
          showRank
          value={item.value}
          onClick={() => emit("select", item)}
        />
      </div>
    );

    return () => (
      <div class={["point-list-body", "people-flow-point-v2-panel", props.isZoom ? "is-zoom" : ""]}>
        <div class="summary-row">
          <div class="summary-card is-points">
            <div class="summary-label">点位数量</div>
            <div class="summary-value-row">
              <CountTo class="summary-value" startVal={0} endVal={props.pointCount} separator="" duration={1600} />
              <span class="summary-unit">个</span>
            </div>
          </div>
          <div class="summary-card is-total">
            <div class="summary-label">总人次</div>
            <div class="summary-value-row">
              <CountTo class="summary-value" startVal={0} endVal={props.total} separator="" duration={2000} />
              <span class="summary-unit">人次</span>
            </div>
          </div>
        </div>

        <div class="list-hint">点击点位可定位并查看热力分布</div>

        <div class={["point-list-surface", props.isZoom ? "is-zoom" : ""]}>
          {props.list.length === 0 ? (
            <NoData />
          ) : props.isZoom || props.list.length < props.scrollThreshold ? (
            <div class={["point-list", props.isZoom ? "is-zoom" : ""]}>{props.list.map((item, index) => renderItem(item, index))}</div>
          ) : (
            <Vue3SeamlessScroll list={props.list} step={0.5} hover class="point-list point-scroll">
              {props.list.map((item, index) => renderItem(item, index, "scroll-"))}
            </Vue3SeamlessScroll>
          )}
        </div>
      </div>
    );
  },
});
