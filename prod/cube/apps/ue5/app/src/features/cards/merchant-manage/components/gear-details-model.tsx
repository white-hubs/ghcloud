import { computed, defineComponent, ref, watch } from "vue";

import Modal from "@/features/equipment/modal-table/modal-layout";
import { stallScoreTotal } from "@/infrastructure/api/merchant";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "@/features/equipment/modal-table/modal-equipmentAll-table.module.less";
import "../cards/merchant-v2-shared.module.less";

import styles from "./gear-details-model.module.less";

export const GearDetailsModel = defineComponent({
  name: "GearDetailsModel",
  props: {
    id: { type: String, required: false, default: "" },
    code: { type: String, required: false, default: "" },
    show: { type: Boolean, required: false, default: false },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const { currentTheme } = useVisualTheme();
    const gearTitle = ref("档位详情");
    const gearDetails = ref<Record<string, any>>({});
    const loading = ref(false);
    const modalWrapClassName = computed(
      () => `modal-table-device equipment-data-list-modal traffic-records-modal device-records-theme-${currentTheme.value}`,
    );

    const getGearDetails = async (): Promise<void> => {
      if (!props.id && !props.code) {
        gearTitle.value = "档位详情";
        gearDetails.value = {};
        return;
      }
      loading.value = true;
      try {
        // 对齐旧版：stallId + bimId
        const res = await stallScoreTotal({
          stallId: props.id,
          bimId: props.code,
        });
        const detail = Array.isArray(res?.records) ? res.records[0] || {} : {};
        gearTitle.value = detail?.name || "档位详情";
        gearDetails.value = detail;
      } catch {
        gearTitle.value = "档位详情";
        gearDetails.value = {};
      } finally {
        loading.value = false;
      }
    };

    watch(
      () => [props.show, props.id, props.code],
      () => {
        if (props.show) void getGearDetails();
      },
      { immediate: true },
    );

    const renderValue = (value: unknown, suffix = ""): string => {
      if (value === null || value === undefined || value === "") return "--";
      return `${value}${suffix}`;
    };

    const items = computed(() => [
      { label: "商户名称", value: renderValue(gearDetails.value.companyName), wide: true },
      { label: "巡检异常数", value: renderValue(gearDetails.value.inspTotal) },
      { label: "诚信经营值", value: renderValue(gearDetails.value.honestyScore, "星") },
      { label: "商品质量", value: renderValue(gearDetails.value.zScoreAvg, "星") },
      { label: "诚实守信", value: renderValue(gearDetails.value.sScoreAvg, "星") },
      { label: "服务态度", value: renderValue(gearDetails.value.tScoreAvg, "星") },
      { label: "环境卫生", value: renderValue(gearDetails.value.wScoreAvg, "星") },
    ]);

    const close = (): void => {
      emit("close");
    };

    return (): JSX.Element => (
      <Modal
        title={gearTitle.value}
        width={720}
        modelValue={props.show}
        onUpdate:modelValue={(v: boolean) => {
          if (!v) close();
        }}
        onClose={close}
        wrapClassName={modalWrapClassName.value}
      >
        <div class={["device-records-content", styles.detailContent]}>
          {loading.value ? (
            <div class={styles.loading}>加载中...</div>
          ) : (
            <div class={styles.detailGrid}>
              {items.value.map((item) => (
                <div class={[styles.detailCard, item.wide ? styles.isWide : ""]} key={item.label}>
                  <span class={styles.detailLabel}>{item.label}</span>
                  <span class={styles.detailValue} title={item.value}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    );
  },
});

export default GearDetailsModel;
