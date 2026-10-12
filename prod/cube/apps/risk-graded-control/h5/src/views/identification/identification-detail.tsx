import { Button, Field, Loading, Tag } from "vant";
import { computed, defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { getUnit, pageIdentificationUnits } from "@ghcloud/cube-services-client/risk-graded-control.client";

import { Bar } from "@/components/bar/bar";
import { IDENTIFICATION_STATUS_LABEL, IDENTIFICATION_STATUS_TAG } from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import type { IdentificationUnitVO, RiskObjectVO, UnitVO } from "@/types/risk";
import { showApiError } from "@/utils/api-error";
import { enrichIdentificationUnitFromApi, enrichUnitVoFromApi, loadAreaAndUnitTypeNameMaps } from "@/utils/hydrate-unit-display";
import { mapIdentificationFromApi, mapUnitFromApi } from "@/utils/risk-control-mapper";
import { loadUnitRiskObjects } from "@/utils/unit-risk-objects";

import styles from "./identification-detail.module.less";

function summaryFromUnit(unit: UnitVO): IdentificationUnitVO {
  return {
    id: unit.id,
    code: unit.code,
    unitName: unit.name,
    unitType: unit.unitType,
    zoneName: unit.zoneName,
    identifyUsers: unit.identifyUsers,
    status: unit.identifyStatus ?? "IDENTIFYING",
    objectCount: unit.objectCount ?? 0,
    rejectedCount: unit.rejectedCount ?? 0,
    submitTime: unit.lastIdentifySubmitTime,
  };
}

export const IdentificationDetailPage = defineComponent({
  name: "IdentificationDetailPage",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const loading = ref(false);
    const unit = ref<UnitVO | null>(null);
    const summary = ref<IdentificationUnitVO | null>(null);
    const objects = ref<RiskObjectVO[]>([]);

    const unitId = computed(() => (route.query.unitId as string | undefined) ?? "");

    const canIdentify = computed(() => {
      const record = summary.value;
      if (!record) return false;
      if (record.status === "REVIEWED") return false;
      if (record.status === "PENDING_REVIEW" && record.rejectedCount <= 0) return false;
      return true;
    });

    const actionText = computed(() => (summary.value?.status === "PENDING_REVIEW" ? "再次辨识" : "发起辨识"));

    const loadSummary = async (
      fallback: IdentificationUnitVO,
      maps: Awaited<ReturnType<typeof loadAreaAndUnitTypeNameMaps>>,
    ): Promise<void> => {
      summary.value = fallback;
      try {
        const page = await useAuthRequest(() =>
          pageIdentificationUnits({
            unitId: fallback.id,
            pageNumber: 1,
            pageSize: 10,
          }),
        );
        const raw = page.records.find((item) => String(item.unitId ?? item.id) === fallback.id) ?? page.records[0];
        const mapped = raw ? enrichIdentificationUnitFromApi(raw, mapIdentificationFromApi(raw), maps) : fallback;
        summary.value = mapped.id === fallback.id ? mapped : fallback;
      } catch {
        summary.value = fallback;
      }
    };

    const loadData = async (): Promise<void> => {
      if (!unitId.value) return;
      loading.value = true;
      try {
        const [unitVo, maps] = await Promise.all([
          useAuthRequest(() => getUnit(unitId.value)),
          loadAreaAndUnitTypeNameMaps(useAuthRequest),
        ]);
        const mappedUnit = enrichUnitVoFromApi(unitVo, mapUnitFromApi(unitVo), maps);
        unit.value = mappedUnit;
        await loadSummary(summaryFromUnit(mappedUnit), maps);
        objects.value = await loadUnitRiskObjects(unitId.value, useAuthRequest);
      } catch (e) {
        showApiError(e);
        unit.value = null;
        summary.value = null;
        objects.value = [];
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      document.title = "辨识详情";
      void loadData();
    });

    const goEntry = (): void => {
      if (!unitId.value || !canIdentify.value) return;
      router.push({
        name: "identification-entry",
        query: { unitId: unitId.value },
      });
    };

    return (): JSX.Element => (
      <div class={styles.page}>
        <Bar name="辨识详情" isShowRight={false} />

        {loading.value ? (
          <div class={styles.loading}>
            <Loading type="spinner" />
          </div>
        ) : !unit.value || !summary.value ? (
          <div class={styles.empty}>未找到风险单元</div>
        ) : (
          <>
            <section class={styles.section}>
              <div class={styles.sectionTitle}>单元信息</div>
              <div class={styles.infoCard}>
                <div class={styles.headerRow}>
                  <div>
                    <div class={styles.unitName}>{summary.value.unitName}</div>
                    <div class={styles.unitCode}>{summary.value.code || "--"}</div>
                  </div>
                  <Tag type={IDENTIFICATION_STATUS_TAG[summary.value.status]} plain>
                    {IDENTIFICATION_STATUS_LABEL[summary.value.status]}
                  </Tag>
                </div>
                <Field label="单元类型" modelValue={summary.value.unitType || "--"} readonly />
                <Field label="所属区域" modelValue={summary.value.zoneName || "--"} readonly />
                <Field label="辨识人员" modelValue={summary.value.identifyUsers.join("、") || "--"} readonly />
                <Field label="对象数量" modelValue={`${summary.value.objectCount || objects.value.length} 个`} readonly />
                <Field label="驳回数量" modelValue={`${summary.value.rejectedCount} 个`} readonly />
                <Field label="提交时间" modelValue={summary.value.submitTime || "--"} readonly />
                <Field label="下次辨识" modelValue={unit.value.nextIdentifyTime || "--"} readonly />
              </div>
            </section>

            <section class={styles.section}>
              <div class={styles.sectionTitle}>风险对象</div>
              {objects.value.length === 0 ? (
                <div class={styles.emptyCard}>暂无风险对象</div>
              ) : (
                objects.value.map((obj, index) => (
                  <div key={obj.id} class={styles.objectCard}>
                    <div class={styles.objectTitle}>
                      <span>
                        {index + 1}. {obj.name || "--"}
                      </span>
                    </div>
                    <Field label="危险源描述" modelValue={obj.hazardDesc || "--"} readonly type="textarea" rows={2} autosize />
                    <Field label="事故类型" modelValue={obj.accidentTypes.join("、") || "--"} readonly />
                    <Field label="致险因素" modelValue={obj.cause || "--"} readonly />
                    <Field label="触发因素" modelValue={obj.triggerFactors || "--"} readonly />
                    <Field label="应急措施" modelValue={obj.emergencyMeasures || "--"} readonly type="textarea" rows={2} autosize />
                    <Field label="管控责任人" modelValue={obj.responsibleUser || "--"} readonly />
                  </div>
                ))
              )}
            </section>

            <div class={styles.bottomBar}>
              {canIdentify.value ? (
                <Button type="primary" block onClick={goEntry}>
                  {actionText.value}
                </Button>
              ) : (
                <Button block disabled>
                  {summary.value.status === "PENDING_REVIEW" ? "审核中" : "已审核"}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    );
  },
});
