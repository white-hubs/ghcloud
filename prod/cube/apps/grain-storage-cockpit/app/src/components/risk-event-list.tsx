import { defineComponent, type PropType } from "vue";

import { Empty } from "@ghcloud/cube-ui";

import { RiskTag } from "./risk-tag";
import { RISK_META } from "@/mocks/cockpit-data";
import type { RiskEvent } from "@/types/cockpit";

export const RiskEventList = defineComponent({
  name: "RiskEventList",
  props: {
    events: { type: Array as PropType<RiskEvent[]>, required: true },
  },
  setup: (props) => {
    return (): JSX.Element =>
      props.events.length > 0 ? (
        <div class="cockpit-list">
          {props.events.map((event) => (
            <article class="cockpit-list__item" key={`${event.type}-${event.position}`}>
              <div class="cockpit-list__title">
                <div>
                  <RiskTag level={event.level} />
                  <RiskTag level={event.level} text={event.category} category />
                  <strong>{event.type}</strong>
                </div>
                <span class={event.overtime ? "is-overtime" : ""}>{event.duration}</span>
              </div>
              <p>{event.position}</p>
              <div class="cockpit-list__footer">
                <span>
                  影响 <b style={{ color: RISK_META[event.level].color }}>{event.tons}</b>
                  {event.tons === "—" ? "" : " 吨"}
                </span>
                <span>
                  责任人 <em>{event.owner}</em>
                </span>
                <span style={{ color: RISK_META[event.level].color }}>{event.status}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty class="cockpit-empty" description="暂无匹配的风险事件" />
      );
  },
});
