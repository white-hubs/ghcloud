import { qiankunWindow } from "vite-plugin-qiankun/dist/helper";
import { computed, defineComponent, type PropType } from "vue";

import { AntModal, Button, CloseOutlined, RightOutlined } from "@ghcloud/cube-ui";

import { RiskTag } from "./risk-tag";
import type { WarehouseSummary } from "@/types/cockpit";
import { resolvePalletCardUrl } from "@/utils/cockpit";

export const WarehouseSummaryModal = defineComponent({
  name: "WarehouseSummaryModal",
  props: {
    visible: { type: Boolean, required: true },
    warehouse: { type: Object as PropType<WarehouseSummary>, required: true },
  },
  emits: {
    close: (): boolean => true,
  },
  setup: (props, { emit }) => {
    const difference = computed(() => props.warehouse.radarTons - props.warehouse.bookTons);
    const differenceRate = computed(() => ((difference.value / props.warehouse.bookTons) * 100).toFixed(1));
    const palletCardUrl = resolvePalletCardUrl(Boolean(qiankunWindow.__POWERED_BY_QIANKUN__));

    return (): JSX.Element => (
      <AntModal
        open={props.visible}
        centered
        width={390}
        zIndex={2300}
        title={null}
        footer={null}
        closable={false}
        destroyOnClose
        wrapClassName="grain-warehouse-modal"
        maskClosable
        keyboard
        getContainer={() => document.body}
        onCancel={() => emit("close")}
      >
        <div class="warehouse-summary">
          <header class="warehouse-summary__header">
            <div>
              <strong>{props.warehouse.id} 仓</strong>
              <span>
                {props.warehouse.type} · {props.warehouse.grain}
              </span>
              <RiskTag level={props.warehouse.level} />
            </div>
            <Button type="text" class="warehouse-summary__close" onClick={() => emit("close")}>
              <CloseOutlined />
            </Button>
          </header>
          <div class="warehouse-summary__content">
            <div class="warehouse-summary__batch">
              <span>当前储粮批次（主批次）</span>
              <strong>
                {props.warehouse.batch}（共 {props.warehouse.batchCount} 个批次）
              </strong>
            </div>
            <div class="warehouse-summary__sensors">
              <div>
                <span>最高粮温</span>
                <b>{props.warehouse.maxTemperature}℃</b>
              </div>
              <div>
                <span>仓内湿度</span>
                <b>{props.warehouse.humidity}%RH</b>
              </div>
              <div>
                <span>气体状态</span>
                <b class="tone-green">{props.warehouse.gasStatus}</b>
              </div>
            </div>
            <div class="warehouse-summary__balance">
              <span>
                雷达 <b>{props.warehouse.radarTons.toLocaleString()}</b> 吨
              </span>
              <i />
              <span>
                账面 <b>{props.warehouse.bookTons.toLocaleString()}</b> 吨
              </span>
              <strong>
                差 {difference.value.toLocaleString()} 吨（{differenceRate.value}%）
              </strong>
            </div>
            <dl class="warehouse-summary__details">
              <div>
                <dt>最近巡检</dt>
                <dd>{props.warehouse.inspection}</dd>
              </div>
              <div>
                <dt>当前告警</dt>
                <dd class="tone-green">{props.warehouse.alarm ?? "无"}</dd>
              </div>
              <div>
                <dt>责任保管员</dt>
                <dd>{props.warehouse.owner}</dd>
              </div>
            </dl>
            <a
              class="cockpit-gradient-button warehouse-summary__pallet-link"
              href={palletCardUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              电子货位卡 <RightOutlined />
            </a>
          </div>
        </div>
      </AntModal>
    );
  },
});
