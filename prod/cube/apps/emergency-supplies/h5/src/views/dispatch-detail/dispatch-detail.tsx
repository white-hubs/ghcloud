import { Button, Field, Popup, showConfirmDialog, showNotify } from "vant";
import { computed, defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { DispatchOrderVO } from "@ghcloud/cube-service-interface/emergency-supplies";

import { DateTimeField } from "@/components/datetime-field/datetime-field";
import { service, statusLabel } from "@/shared";
import {
  actionTitle,
  dispatchStatusClassNames,
  firstItem,
  formatDateTime,
  formatDateTimeLocal,
  remainQuantity,
  type ActionType,
} from "@/views/dispatch-list/dispatch-shared";

import styles from "./dispatch-detail.module.less";

export const DispatchDetail = defineComponent({
  name: "DispatchDetail",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const order = ref<DispatchOrderVO>();
    const loading = ref(true);
    const actionVisible = ref(false);
    const actionType = ref<ActionType>("outbound");
    const submitLoading = ref(false);
    const actionForm = ref({
      quantity: 0,
      operateTime: formatDateTimeLocal(),
      reason: "USED",
      remark: "",
    });

    const orderId = (): string => String(route.params.id ?? "");
    const currentItem = computed(() => firstItem(order.value));

    const loadDetail = async (): Promise<void> => {
      loading.value = true;
      try {
        order.value = await service.getDispatchOrderDetail(orderId());
      } catch (error) {
        showNotify({
          type: "danger",
          message: (error as Error)?.message ?? "调用详情加载失败",
        });
        router.back();
      } finally {
        loading.value = false;
      }
    };

    const openAction = (type: ActionType): void => {
      const item = currentItem.value;
      actionType.value = type;
      actionForm.value = {
        quantity: type === "outbound" ? Number(item?.dispatchQuantity ?? 0) : remainQuantity(item),
        operateTime: formatDateTimeLocal(),
        reason: "USED",
        remark: "",
      };
      actionVisible.value = true;
    };

    const submitAction = async (): Promise<void> => {
      if (!order.value || !currentItem.value) return;
      if (!actionForm.value.quantity || actionForm.value.quantity <= 0) {
        showNotify({ type: "warning", message: "请输入数量" });
        return;
      }
      if (actionType.value === "writeoff" && !actionForm.value.reason) {
        showNotify({ type: "warning", message: "请选择核销原因" });
        return;
      }
      submitLoading.value = true;
      try {
        if (actionType.value === "outbound") {
          await service.confirmDispatchOutbound(order.value.id, {
            quantity: actionForm.value.quantity,
            outboundTime: actionForm.value.operateTime,
            remark: actionForm.value.remark,
          });
        } else if (actionType.value === "return") {
          await service.returnDispatchItem(currentItem.value.id, {
            quantity: actionForm.value.quantity,
            operateTime: actionForm.value.operateTime,
            remark: actionForm.value.remark,
          });
        } else {
          await service.writeoffDispatchItem(currentItem.value.id, {
            quantity: actionForm.value.quantity,
            operateTime: actionForm.value.operateTime,
            reason: actionForm.value.reason,
            remark: actionForm.value.remark,
          });
        }
        showNotify({ type: "success", message: "操作成功" });
        actionVisible.value = false;
        await loadDetail();
      } catch (error) {
        showNotify({
          type: "danger",
          message: (error as Error)?.message ?? "操作失败",
        });
      } finally {
        submitLoading.value = false;
      }
    };

    const confirmUsing = async (): Promise<void> => {
      await service.confirmDispatchUsing(orderId());
      showNotify({ type: "success", message: "操作成功" });
      await loadDetail();
    };

    const cancelOrder = async (): Promise<void> => {
      try {
        await showConfirmDialog({
          title: "取消调用",
          message: "确认取消该调用？",
        });
        await service.cancelDispatchOrder(orderId());
        showNotify({ type: "success", message: "操作成功" });
        router.back();
      } catch {
        // cancelled
      }
    };

    const confirmUsingAction = async (): Promise<void> => {
      try {
        await showConfirmDialog({
          title: "确认使用",
          message: "确认该物资已投入使用？",
        });
        await confirmUsing();
      } catch {
        // cancelled
      }
    };

    onMounted(() => {
      void loadDetail();
    });

    const renderRow = (label: string, value: string | number, valueClass = "") => (
      <div class={styles.detail}>
        <span>{label}</span>
        <b class={valueClass}>{value}</b>
      </div>
    );

    return () => {
      const item = currentItem.value;
      const status = order.value?.status;

      return (
        <div class={styles.page}>
          <header class={styles.appHeader}>
            <button class={styles.backButton} type="button" onClick={() => router.back()}>
              <span>‹</span>
              返回
            </button>
            <h1>{order.value?.code ?? "调用详情"}</h1>
            <i />
          </header>

          {loading.value ? (
            <div class={styles.loading}>加载中...</div>
          ) : (
            <section class={styles.contentBlock}>
              {renderRow("调用单号", order.value?.code ?? "--")}
              {renderRow("物资名称", item?.suppliesNameSnapshot ?? "--")}
              {renderRow("调用数量", item ? `${item.dispatchQuantity} ${item.unit}` : "--")}
              {renderRow("已归还", item ? `${item.totalReturned} ${item.unit}` : "--", styles.green)}
              {renderRow("已核销", item ? `${item.totalWriteoff} ${item.unit}` : "--")}
              {renderRow("未完结", item ? `${remainQuantity(item)} ${item.unit}` : "--", styles.red)}
              {renderRow("发起人", order.value?.dispatcherName ?? "--")}
              {renderRow("发起时间", formatDateTime(order.value?.dispatchTime))}
              {renderRow("出库确认人", order.value?.outboundConfirmerName ?? "--")}
              {renderRow("出库时间", formatDateTime(order.value?.outboundTime))}
              {renderRow("预计归还", formatDateTime(order.value?.expectedReturnTime))}
              {renderRow("备注", order.value?.remark ?? "--")}
              <div class={styles.detail}>
                <span>状态</span>
                <b>
                  <span class={dispatchStatusClassNames(styles, status)}>{statusLabel(status)}</span>
                </b>
              </div>
            </section>
          )}

          {!loading.value && (
            <div class={styles.footerActions}>
              {status === "PENDING" && (
                <div class={styles.actionRow}>
                  <Button class={styles.primaryButton} type="primary" block onClick={() => openAction("outbound")}>
                    确认出库
                  </Button>
                  <Button class={styles.dangerButton} type="danger" plain={false} block onClick={cancelOrder}>
                    取消
                  </Button>
                </div>
              )}
              {status === "OUTBOUND" && (
                <div class={styles.actionRow}>
                  <Button class={styles.primaryButton} type="primary" block onClick={confirmUsingAction}>
                    确认使用
                  </Button>
                  <Button class={styles.secondaryButton} block onClick={() => openAction("writeoff")}>
                    核销登记
                  </Button>
                </div>
              )}
              {(status === "USING" || status === "PARTIAL_RETURNED") && (
                <div class={styles.actionRow}>
                  <Button class={styles.primaryButton} type="primary" block onClick={() => openAction("return")}>
                    归还登记
                  </Button>
                  <Button class={styles.secondaryButton} block onClick={() => openAction("writeoff")}>
                    核销登记
                  </Button>
                </div>
              )}
            </div>
          )}

          <Popup v-model:show={actionVisible.value} position="bottom" round safeAreaInsetBottom>
            <div class={styles.popup}>
              <div class={styles.popupTitle}>
                {actionTitle(actionType.value)}
                <button
                  type="button"
                  onClick={() => {
                    actionVisible.value = false;
                  }}
                >
                  ×
                </button>
              </div>

              <div class={styles.actionSummary}>
                <p>
                  <span>调用单号</span>
                  <b>{order.value?.code ?? "--"}</b>
                </p>
                <p>
                  <span>物资名称</span>
                  <b>{item?.suppliesNameSnapshot ?? "--"}</b>
                </p>
                <p>
                  <span>{actionType.value === "outbound" ? "申请数量" : "出库数量"}</span>
                  <b>{item ? `${actionType.value === "outbound" ? item.dispatchQuantity : item.outboundQuantity} ${item.unit}` : "--"}</b>
                </p>
              </div>

              <Field
                v-model={actionForm.value.quantity}
                type="number"
                label={actionType.value === "outbound" ? "实际出库数量" : actionType.value === "return" ? "归还数量" : "核销数量"}
                required
              />
              {actionType.value === "writeoff" && (
                <Field label="核销原因" required>
                  <select v-model={actionForm.value.reason}>
                    <option value="USED">消耗使用</option>
                    <option value="DAMAGED">损坏报废</option>
                    <option value="LOST">遗失</option>
                  </select>
                </Field>
              )}
              <DateTimeField
                label={actionType.value === "outbound" ? "出库时间" : "操作时间"}
                title={actionType.value === "outbound" ? "选择出库时间" : "选择操作时间"}
                value={actionForm.value.operateTime}
                onChange={(value: string) => {
                  actionForm.value.operateTime = value;
                }}
              />
              <Field
                v-model={actionForm.value.remark}
                label="备注"
                placeholder={actionType.value === "outbound" ? "出库备注" : "操作备注"}
              />
              <Button type="primary" block loading={submitLoading.value} onClick={submitAction}>
                确认
              </Button>
            </div>
          </Popup>
        </div>
      );
    };
  },
});
