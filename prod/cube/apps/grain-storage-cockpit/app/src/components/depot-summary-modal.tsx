import { defineComponent, type PropType } from "vue";

import { AntModal, Button, CloseOutlined } from "@ghcloud/cube-ui";

import { RiskTag } from "./risk-tag";
import type { DepotSummary } from "@/types/cockpit";

export const DepotSummaryModal = defineComponent({
  name: "DepotSummaryModal",
  props: {
    visible: { type: Boolean, required: true },
    depot: { type: Object as PropType<DepotSummary>, required: true },
  },
  emits: {
    close: (): boolean => true,
    enter: (): boolean => true,
  },
  setup: (props, { emit }) => {
    const metrics = [
      ["当前库存", `${props.depot.stock} 万吨`, "cyan"],
      ["风险影响库存", `${props.depot.riskStock} 万吨`, "orange"],
      ["未闭环事件", `${props.depot.open} 起`, "yellow"],
      ["入库任务", `${props.depot.inTasks} 项`, "blue"],
      ["出库任务", `${props.depot.outTasks} 项`, "blue"],
      ["设备在线率", `${props.depot.online}%`, "green"],
    ];

    return (): JSX.Element => (
      <AntModal
        open={props.visible}
        centered
        width={390}
        zIndex={2200}
        title={null}
        footer={null}
        closable={false}
        destroyOnClose
        maskClosable
        keyboard
        wrapClassName="grain-depot-modal"
        getContainer={() => document.body}
        onCancel={() => emit("close")}
      >
        <div class="depot-summary">
          <header>
            <div>
              <strong>{props.depot.name}</strong>
              <RiskTag level={props.depot.level} />
            </div>
            <Button class="depot-summary__close" type="text" onClick={() => emit("close")}>
              <CloseOutlined />
            </Button>
          </header>
          <div class="depot-summary__metrics">
            {metrics.map(([label, value, tone]) => (
              <div key={label}>
                <span>{label}</span>
                <b class={`tone-${tone}`}>{value}</b>
              </div>
            ))}
          </div>
          <div class="depot-summary__jobs">
            <span>正在进行的危险作业</span>
            <div>
              {props.depot.jobs.map((job) => (
                <RiskTag key={job} level="橙" text={job} />
              ))}
            </div>
          </div>
          <Button class="cockpit-gradient-button" type="primary" onClick={() => emit("enter")}>
            进入库区详情 →
          </Button>
        </div>
      </AntModal>
    );
  },
});
