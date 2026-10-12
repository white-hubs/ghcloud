import dayjs from "dayjs";
import { Empty, Loading } from "vant";
import { defineComponent, type PropType } from "vue";

import type { FaultApplyDTO, FaultApplyHomePageStatisticsDTO } from "@ghcloud/cube-grid-management-service";

import styles from "./index.module.less";

export type WorkOrderPeriod = "year" | "month" | "week" | "day";

export interface WorkOrderInfo {
  workOrderList: FaultApplyDTO[];
  workOrderStat: FaultApplyHomePageStatisticsDTO;
}

const DONE_STATUS = new Set(["DONE", "FINISH", "FINISHED", "COMPLETED", "END", "CLOSED"]);

const getWorkOrderTitle = (item: FaultApplyDTO): string => item.instanceName || item.name || item.objName || item.hiddenObjName || "--";

const getWorkOrderTime = (item: FaultApplyDTO): string => {
  const time = item.submitedTime || item.submitTime || item.createTime;
  return time ? dayjs(time).format("YYYY-MM-DD HH:mm:ss") : "--";
};

const getWorkOrderStatusName = (item: FaultApplyDTO): string => {
  if (item.statusName) {
    return item.statusName;
  }
  return DONE_STATUS.has(item.status || "") ? "已完成" : "待处理";
};

const periodOptions: { label: string; value: WorkOrderPeriod }[] = [
  { label: "年", value: "year" },
  { label: "月", value: "month" },
  { label: "周", value: "week" },
  { label: "日", value: "day" },
];

const createStreamEngineUrl = (path: string, query: Record<string, string | undefined>): string => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  const queryString = params.toString();
  return `/streamengineH5${path}${queryString ? `?${queryString}` : ""}`;
};

export const WorkOrderUI = defineComponent({
  props: {
    gridAreaId: {
      type: String,
      required: true,
    },
    period: {
      type: String as PropType<WorkOrderPeriod>,
      required: true,
    },
    workOrderInfo: {
      type: Object as PropType<WorkOrderInfo>,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    finished: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["periodChange", "loadMore"],
  setup: (props, { emit }) => {
    const toList = (status?: string): void => {
      window.location.href = createStreamEngineUrl("/personal-order-list", {
        businessType: "FAULT",
        status,
      });
    };
    const toDetail = (item: FaultApplyDTO): void => {
      const processId = item.processInstanceId || String(item.id || item.formInstanceId || "");
      if (!processId) {
        return;
      }
      window.location.href = createStreamEngineUrl("/initiating-work-order", {
        businessType: item.businessType || "FAULT",
        processType: "HANDLING",
        processId,
      });
    };
    const handleScroll = (event: Event): void => {
      const target = event.currentTarget as HTMLElement;
      const reachedBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 20;
      if (reachedBottom && !props.loading && !props.finished) {
        emit("loadMore");
      }
    };
    return (): JSX.Element => (
      <div class={styles["work-order-card"]}>
        <div class={styles["toolbar"]}>
          <div>工单信息</div>
          <div class={styles["period-filter"]}>
            {periodOptions.map((item) => (
              <button
                class={[styles["period-filter-item"], props.period === item.value && styles["active"]]}
                key={item.value}
                type="button"
                onClick={() => emit("periodChange", item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div class={styles["stat"]}>
          <div class={[styles["stat-item"], styles["total"]]} onClick={() => toList()}>
            <div class={styles["label"]}>工单总数</div>
            <div class={styles["value"]}>{props.workOrderInfo.workOrderStat.orderCount}</div>
          </div>
          <div class={[styles["stat-item"], styles["doing"]]} onClick={() => toList("ACTIVE")}>
            <div class={styles["label"]}>处理中</div>
            <div class={styles["value"]}>{props.workOrderInfo.workOrderStat.processOrder}</div>
          </div>
          <div class={[styles["stat-item"], styles["done"]]} onClick={() => toList("FINISHED")}>
            <div class={styles["label"]}>已完成</div>
            <div class={styles["value"]}>{props.workOrderInfo.workOrderStat.finishOrder}</div>
          </div>
        </div>
        <div class={styles["list"]} onScroll={handleScroll}>
          {props.workOrderInfo.workOrderList.length !== 0 &&
            props.workOrderInfo.workOrderList.map((item) => (
              <div class={styles["item"]} key={item.id || item.formInstanceId || item.processInstanceId} onClick={() => toDetail(item)}>
                <div class={styles["item-header"]}>
                  <div class={styles["title"]}>{getWorkOrderTitle(item)}</div>
                  <div class={[styles["status"], styles[item.status || ""]]}>{getWorkOrderStatusName(item)}</div>
                </div>
                <div class={styles["content"]}>
                  <div class={styles["content-item"]}>
                    <span>工单时间:</span>
                    <span>{getWorkOrderTime(item)}</span>
                  </div>
                </div>
              </div>
            ))}
          {!props.loading && !props.workOrderInfo.workOrderList.length && <Empty description="暂无数据" />}
          {props.loading && (
            <div class={styles["load-status"]}>
              <Loading size="18px">加载中...</Loading>
            </div>
          )}
          {!props.loading && props.finished && props.workOrderInfo.workOrderList.length > 0 && (
            <div class={styles["load-status"]}>没有更多了</div>
          )}
        </div>
      </div>
    );
  },
});

export const WorkOrderCard = defineComponent({
  props: {
    title: {
      type: String,
      default: "工单信息",
    },
    gridAreaId: {
      type: String,
      required: true,
    },
    period: {
      type: String as PropType<WorkOrderPeriod>,
      required: true,
    },
    workOrderInfo: {
      type: Object as PropType<WorkOrderInfo>,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    finished: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["periodChange", "loadMore"],
  setup: (props, { emit }) => {
    return (): JSX.Element => (
      <WorkOrderUI
        gridAreaId={props.gridAreaId}
        period={props.period}
        workOrderInfo={props.workOrderInfo}
        loading={props.loading}
        finished={props.finished}
        onPeriodChange={(period: WorkOrderPeriod) => emit("periodChange", period)}
        onLoadMore={() => emit("loadMore")}
      />
    );
  },
});
