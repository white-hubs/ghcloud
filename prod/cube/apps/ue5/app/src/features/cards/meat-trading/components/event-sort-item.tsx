import { defineComponent } from "vue";
import { computed } from "vue";

import styles from "./event-sort-item.module.less";

export const EventSortItem = defineComponent({
  name: "EventSortItem",
  props: {
    sort: { type: Number, required: true, default: 1 },
    name: { type: String, required: true, default: "事件" },
    count: { type: Number, required: true, default: 0 },
    modes: { type: String, required: true, default: "环比" },
    ratio: { type: String, required: true, default: "3%" },
    linkRatio: { type: Number, required: true, default: 0 },
    code: { type: Number, required: false },
    sn: { type: Boolean, required: false, default: true },
    other: { type: String, required: false },
  },
  setup(props, ctx) {
    // 格式化 linkRatio，将小数转为整数显示
    const formatLinkRatio = (value: number): string => {
      if (value === null || value === undefined) return "0%";
      // 四舍五入取整数
      return `${Math.round(value)}%`;
    };

    const proStyle = computed(() => (width) => {
      return {
        width: width,
      };
    });

    return (): JSX.Element => (
      <>
        <div class="eventSortItem">
          <div class="top">
            <div class="left">
              <div class="sort" class={{ up_sort: props.sort > 3 }}>
                {" "}
                {props.sort}
              </div>
              <div class="name">
                {" "}
                <div title={props.name}> {props.name}</div>
              </div>
            </div>
            <div class="middle">
              {" "}
              <div> {props.other}</div>
            </div>
            <div class="right">
              <div class="count" class={{ up_count: props.sort > 3 }}>
                {" "}
                {props.count || ""}
              </div>
              {props.sn && <div class="modes"> {props.modes}</div>}
              {props.sn && <div class={["downtriangle", props.linkRatio > 0 && "uptriangle"]}></div>}
              {props.sn && <div class={[props.linkRatio > 0 ? "up" : "down"]}> {formatLinkRatio(props.linkRatio)}</div>}
            </div>
          </div>
          <div class="line">
            <div class="progress" class={{ up_proress: props.sort > 3 }} style={proStyle(props.ratio)}></div>
            <div class="light_dot"></div>
          </div>
        </div>
      </>
    );
  },
});

export default EventSortItem;
