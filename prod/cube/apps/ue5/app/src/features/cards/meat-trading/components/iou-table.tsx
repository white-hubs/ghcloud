import type { TableColumnType } from "ant-design-vue";
import { computed, defineComponent, reactive, watch } from "vue";

import TableData from "./tableData";
import Modal from "@/features/equipment/modal-table/modal";
import { ResTransactionWeightListponse } from "@/infrastructure/api/models/slide";
import { summaryWeightList } from "@/infrastructure/api/slide";
import { setTimeType } from "@/infrastructure/utils/common";

import "./iou-table.module.less";

export const IouTable = defineComponent({
  name: "IouTable",
  props: {
    title: { type: String, required: true, default: "交易信息详情" },
    showModal: { type: Boolean, required: true, default: false },
    time: { type: null, required: true, default: "TODAY" },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const tradingWeight = reactive<ResTransactionWeightListponse>({
      currentDateWeightList: [],
      currentWeight: 0,
      lastDateWeightList: [],
      lastWeight: 0,
      qoqTradeWeight: 0,
    });

    const columns: TableColumnType[] = [
      {
        title: "时间",
        dataIndex: "summaryDate",
      },
      {
        title: "重量(kg)",
        dataIndex: "summaryWeight",
      },
    ];

    const closeModal = () => {
      emit("close");
    };

    const normalizeNumber = (value: unknown): number => {
      const numericValue = Number(value ?? 0);
      return Number.isFinite(numericValue) ? numericValue : 0;
    };

    const formatNumber = (value: unknown, fractionDigits = 2): string => {
      const numericValue = Number(value ?? 0);
      if (!Number.isFinite(numericValue)) return "0";
      return numericValue.toLocaleString(undefined, {
        maximumFractionDigits: fractionDigits,
      });
    };

    const qoqValue = computed(() => normalizeNumber(tradingWeight.qoqTradeWeight));
    const qoqClass = computed(() => (qoqValue.value > 0 ? "is-up" : "is-down"));

    const getTableData = async () => {
      const res = await summaryWeightList({ type: setTimeType(props.time) });
      Object.assign(tradingWeight, {
        currentDateWeightList: Array.isArray(res?.currentDateWeightList) ? res.currentDateWeightList : [],
        currentWeight: normalizeNumber(res?.currentWeight),
        lastDateWeightList: Array.isArray(res?.lastDateWeightList) ? res.lastDateWeightList : [],
        lastWeight: normalizeNumber(res?.lastWeight),
        qoqTradeWeight: normalizeNumber(res?.qoqTradeWeight),
      });
    };

    watch(
      () => [props.showModal, props.time],
      () => {
        if (props.showModal) {
          getTableData();
        }
      },
      { immediate: true },
    );

    return (): JSX.Element => (
      <Modal
        title={props.title}
        width="980px"
        show={props.showModal}
        onClose={closeModal}
        wrapClassName="meat-transaction-detail-modal"
        destroyOnClose
      >
        <div class="meat-transaction-detail">
          <div class="meat-transaction-detail__summary">
            <div class="meat-transaction-detail__summary-main">
              <span class="meat-transaction-detail__label">交易重量</span>
              <span class="meat-transaction-detail__value">
                {formatNumber(tradingWeight.currentWeight)}
                <span class="meat-transaction-detail__unit">kg</span>
              </span>
            </div>
            <div class="meat-transaction-detail__summary-card">
              <span class="meat-transaction-detail__label">对比周期重量</span>
              <span class="meat-transaction-detail__sub-value">{formatNumber(tradingWeight.lastWeight)} kg</span>
            </div>
            <div class={["meat-transaction-detail__summary-card", "meat-transaction-detail__qoq", qoqClass.value]}>
              <span class="meat-transaction-detail__label">环比</span>
              <span class="meat-transaction-detail__sub-value">
                <span class="meat-transaction-detail__qoq-arrow" aria-hidden="true" />
                {formatNumber(qoqValue.value)}%
              </span>
            </div>
          </div>

          <div class="meat-transaction-detail__tables">
            <section class="meat-transaction-detail__table-panel">
              <div class="meat-transaction-detail__table-title">
                <span class="meat-transaction-detail__dot" aria-hidden="true" />
                当前周期
              </div>
              <TableData dataSource={tradingWeight.currentDateWeightList} columns={columns} />
            </section>

            <div class="meat-transaction-detail__vs" aria-hidden="true">
              VS
            </div>

            <section class="meat-transaction-detail__table-panel">
              <div class="meat-transaction-detail__table-title">
                <span class="meat-transaction-detail__dot is-compare" aria-hidden="true" />
                对比周期
              </div>
              <TableData dataSource={tradingWeight.lastDateWeightList} columns={columns} />
            </section>
          </div>
        </div>
      </Modal>
    );
  },
});

export default IouTable;
