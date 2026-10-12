import { Button, showConfirmDialog, showNotify } from "vant";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { SuppliesVO } from "@ghcloud/cube-service-interface/emergency-supplies";

import { service, statusLabel } from "@/shared";
import { formatDate } from "@/utils/format-datetime";
import { SuppliesFields } from "@/views/supplies-form/supplies-fields";
import {
  assertForm,
  buildPayload,
  createInitialForm,
  expiryClassNames,
  fillForm,
  formatCoordinateValue,
  statusClassNames,
  type SuppliesFormState,
} from "@/views/supplies-list/supplies-shared";

import styles from "./supplies-detail.module.less";

export const SuppliesDetail = defineComponent({
  name: "SuppliesDetail",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const detail = ref<SuppliesVO>();
    const loading = ref(true);
    const editing = ref(false);
    const submitLoading = ref(false);
    const form = reactive<SuppliesFormState>(createInitialForm());

    const suppliesId = (): string => String(route.params.id ?? "");

    const loadDetail = async (): Promise<void> => {
      loading.value = true;
      try {
        detail.value = await service.getSuppliesDetail(suppliesId());
      } catch (error) {
        showNotify({
          type: "danger",
          message: (error as Error)?.message ?? "物资详情加载失败",
        });
        router.back();
      } finally {
        loading.value = false;
      }
    };

    const enterEdit = (): void => {
      if (!detail.value) return;
      fillForm(form, detail.value);
      editing.value = true;
    };

    const cancelEdit = (): void => {
      editing.value = false;
    };

    const submit = async (): Promise<void> => {
      try {
        assertForm(form);
      } catch (error) {
        showNotify({ type: "warning", message: (error as Error).message });
        return;
      }
      submitLoading.value = true;
      try {
        await service.updateSupplies(form.id, buildPayload(form));
        showNotify({ type: "success", message: "操作成功" });
        editing.value = false;
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

    const confirmChangeStatus = async (status: string, title: string): Promise<void> => {
      try {
        await showConfirmDialog({
          title,
          message: `确认${title}该物资？`,
        });
      } catch {
        return;
      }
      try {
        await service.changeSuppliesStatus(suppliesId(), status);
        showNotify({ type: "success", message: "操作成功" });
        await loadDetail();
      } catch (error) {
        showNotify({
          type: "danger",
          message: (error as Error)?.message ?? "操作失败",
        });
      }
    };

    onMounted(() => {
      void loadDetail();
    });

    const renderDetailRow = (label: string, value: string | number) => (
      <div class={styles.detail}>
        <span>{label}</span>
        <b>{value}</b>
      </div>
    );

    const renderView = () => (
      <section class={styles.contentBlock}>
        {renderDetailRow("编码", detail.value?.code ?? "--")}
        {renderDetailRow("类别", detail.value?.typeName ?? "--")}
        {renderDetailRow("规格", detail.value?.specification ?? "--")}
        {renderDetailRow("单位", detail.value?.unit ?? "--")}
        <div class={styles.detail}>
          <span>总库存</span>
          <b class={styles.stockHighlight}>
            {detail.value?.totalQuantity ?? detail.value?.quantity ?? 0} {detail.value?.unit}
          </b>
        </div>
        <div class={styles.detail}>
          <span>状态</span>
          <b>
            <span class={statusClassNames(styles, detail.value?.status)}>{statusLabel(detail.value?.status)}</span>
          </b>
        </div>
        {renderDetailRow("安全库存下限", detail.value?.safetyStockMin != null ? String(detail.value.safetyStockMin) : "--")}
        {renderDetailRow("仓库", detail.value?.warehouseName ?? "--")}
        {renderDetailRow("位置描述", detail.value?.locationDesc ?? "--")}
        {renderDetailRow("经纬度坐标", formatCoordinateValue(detail.value?.longitude, detail.value?.latitude))}
        <div class={styles.detail}>
          <span>有效期至</span>
          <b>
            <span class={expiryClassNames(styles, detail.value?.expiryWarningLevel)}>
              {formatDate(detail.value?.expiryDate ?? detail.value?.earliestExpiryDate) || "无库存"}
            </span>
          </b>
        </div>
        {renderDetailRow("生产日期", formatDate(detail.value?.productionDate) || "--")}
        {renderDetailRow("供应商", detail.value?.supplier ?? "--")}
        {renderDetailRow("供应商联系方式", detail.value?.supplierContact ?? "--")}
        {renderDetailRow("备注", detail.value?.remark ?? "--")}

        <div class={styles.batchTitle}>库存信息</div>
        <div class={styles.batchList}>
          <div class={styles.batch}>
            <span>{detail.value?.warehouseName ?? "--"}</span>
            <b>
              {detail.value?.quantity ?? detail.value?.totalQuantity ?? 0}
              {detail.value?.unit}
            </b>
            <em>{detail.value?.expiryDate ?? detail.value?.earliestExpiryDate ?? "--"}</em>
          </div>
        </div>
      </section>
    );

    const renderEdit = () => (
      <section class={styles.editBlock}>
        <SuppliesFields form={form} codeDisabled />
      </section>
    );

    return () => (
      <div class={styles.page}>
        <header class={styles.appHeader}>
          <button class={styles.backButton} type="button" onClick={() => (editing.value ? cancelEdit() : router.back())}>
            <span>‹</span>
            返回
          </button>
          <h1>{editing.value ? "编辑物资" : (detail.value?.name ?? "物资详情")}</h1>
          <i />
        </header>

        {loading.value ? <div class={styles.loading}>加载中...</div> : editing.value ? renderEdit() : renderView()}

        {!loading.value && editing.value && (
          <div class={styles.footerActions}>
            <div class={styles.actionRow}>
              <Button class={styles.secondaryButton} block onClick={cancelEdit}>
                取消
              </Button>
              <Button class={styles.primaryButton} block loading={submitLoading.value} onClick={submit}>
                保存
              </Button>
            </div>
          </div>
        )}

        {!loading.value && !editing.value && detail.value?.status !== "SCRAPPED" && (
          <div class={styles.footerActions}>
            <div class={styles.actionRow}>
              <Button class={styles.primaryButton} block onClick={enterEdit}>
                编辑
              </Button>
              {detail.value?.status === "ENABLED" ? (
                <Button class={styles.warnButton} block onClick={() => confirmChangeStatus("DISABLED", "停用")}>
                  停用
                </Button>
              ) : (
                <Button class={styles.secondaryButton} block onClick={() => confirmChangeStatus("ENABLED", "启用")}>
                  启用
                </Button>
              )}
            </div>
            <Button class={styles.dangerButton} block onClick={() => confirmChangeStatus("SCRAPPED", "报废")}>
              报废
            </Button>
          </div>
        )}
      </div>
    );
  },
});
