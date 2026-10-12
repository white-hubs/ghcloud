import { Button, DropdownItem, DropdownMenu, List, PullRefresh, Search, Tag } from "vant";
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

import type { RiskAssessmentTaskVO } from "@ghcloud/cube-service-interface/risk-graded-control";
import { pageAreas, pageAssessmentTasks, pageUnitTypes } from "@ghcloud/cube-services-client/risk-graded-control.client";

import { Bar } from "@/components/bar/bar";
import { RiskLevelBadge } from "@/components/risk-level-badge/risk-level-badge";
import { useAuthRequest } from "@/hooks/use-auth-request";
import type { RiskLevel, ZoneVO } from "@/types/risk";
import { showApiError } from "@/utils/api-error";
import { mapRiskLevelFromApi, mapZoneFromApi, optionDisplayName, toId } from "@/utils/risk-control-mapper";

import styles from "./assessment-list.module.less";

type AssessmentStatus = "PENDING" | "ASSESSING" | "COMPLETED";

interface AssessmentRow {
  id: string;
  unitName: string;
  unitType: string;
  zoneName: string;
  inherentRiskLevel?: RiskLevel;
  controlRiskLevel?: RiskLevel;
  objectCount: number;
  completedCount: number;
  status: AssessmentStatus;
}

const STATUS_OPTIONS: Array<{ text: string; value: AssessmentStatus | "" }> = [
  { text: "全部", value: "" },
  { text: "待评估", value: "PENDING" },
  { text: "评估中", value: "ASSESSING" },
  { text: "已完成", value: "COMPLETED" },
];

const STATUS_LABEL: Record<AssessmentStatus, string> = {
  PENDING: "待评估",
  ASSESSING: "评估中",
  COMPLETED: "已完成",
};

const STATUS_TAG: Record<AssessmentStatus, "default" | "primary" | "success"> = {
  PENDING: "default",
  ASSESSING: "primary",
  COMPLETED: "success",
};

const PAGE_SIZE = 10;

function resolveStatus(vo: RiskAssessmentTaskVO): AssessmentStatus {
  const raw = String(vo.status ?? "").toUpperCase();
  if (raw === "COMPLETED" || raw === "ASSESSING" || raw === "PENDING") return raw;
  const total = vo.objectCount ?? 0;
  const done = vo.completedCount ?? 0;
  if (total > 0 && done >= total) return "COMPLETED";
  if (done > 0) return "ASSESSING";
  return "PENDING";
}

function optionNameById(map: ReadonlyMap<string, string>, id?: string): string {
  return id ? (map.get(id) ?? "") : "";
}

function mapAssessmentRow(
  vo: RiskAssessmentTaskVO,
  areaNames: ReadonlyMap<string, string>,
  unitTypeNames: ReadonlyMap<string, string>,
): AssessmentRow {
  const objectCount = vo.objectCount ?? 0;
  const completedCount = vo.completedCount ?? 0;
  const areaId = toId(vo.areaId ?? vo.area?.id);
  const unitTypeId = toId(vo.unitTypeId ?? vo.unitType?.id);
  return {
    id: toId(vo.unitId ?? vo.id),
    unitName: optionDisplayName(vo.unit) || String(vo.unitName ?? vo.name ?? vo.objectName ?? "").trim() || "--",
    unitType: optionDisplayName(vo.unitType) || optionNameById(unitTypeNames, unitTypeId) || String(vo.type ?? "").trim() || "--",
    zoneName: optionDisplayName(vo.area) || optionNameById(areaNames, areaId) || String(vo.locationDesc ?? "").trim() || "--",
    inherentRiskLevel: mapRiskLevelFromApi(vo.inherentRiskLevel),
    controlRiskLevel: mapRiskLevelFromApi(vo.controlRiskLevel),
    objectCount,
    completedCount,
    status: resolveStatus(vo),
  };
}

export const AssessmentListPage = defineComponent({
  name: "AssessmentListPage",
  setup() {
    const router = useRouter();
    const rows = ref<AssessmentRow[]>([]);
    const refreshing = ref(false);
    const loading = ref(false);
    const finished = ref(false);
    const pageNumber = ref(1);
    const total = ref(0);
    const keyword = ref("");
    const statusFilter = ref<AssessmentStatus | "">("");
    const zoneFilter = ref("");
    const zones = ref<ZoneVO[]>([]);
    const areaNames = ref<ReadonlyMap<string, string>>(new Map());
    const unitTypeNames = ref<ReadonlyMap<string, string>>(new Map());
    let requestSeq = 0;

    const loadFilterOptions = async (): Promise<void> => {
      try {
        const [areaPage, unitTypePage] = await Promise.all([
          useAuthRequest(() => pageAreas({ pageNumber: 1, pageSize: 500, view: "option" })),
          useAuthRequest(() => pageUnitTypes({ pageNumber: 1, pageSize: 500, view: "option" })),
        ]);
        zones.value = areaPage.records.map(mapZoneFromApi);
        areaNames.value = new Map(
          areaPage.records.map((item) => [toId(item.id), String(item.name ?? "").trim()]).filter(([id, name]) => id && name),
        );
        unitTypeNames.value = new Map(
          unitTypePage.records.map((item) => [toId(item.id), String(item.name ?? "").trim()]).filter(([id, name]) => id && name),
        );
      } catch (e) {
        showApiError(e);
        zones.value = [];
        areaNames.value = new Map();
        unitTypeNames.value = new Map();
      }
    };

    const loadList = async (reset = false): Promise<void> => {
      if (loading.value && !reset) return;
      const seq = ++requestSeq;
      if (reset) {
        pageNumber.value = 1;
        total.value = 0;
        rows.value = [];
        finished.value = false;
      }
      loading.value = true;
      try {
        const currentPage = pageNumber.value;
        const page = await useAuthRequest(() =>
          pageAssessmentTasks({
            pageNumber: currentPage,
            pageSize: PAGE_SIZE,
            keyword: keyword.value.trim() || undefined,
            status: statusFilter.value || undefined,
            areaId: zoneFilter.value || undefined,
          }),
        );
        if (seq !== requestSeq) return;
        const mapped = page.records.map((record) => mapAssessmentRow(record, areaNames.value, unitTypeNames.value));
        total.value = page.total ?? 0;
        rows.value = reset ? mapped : [...rows.value, ...mapped];
        pageNumber.value = currentPage + 1;
        finished.value = (total.value > 0 && rows.value.length >= total.value) || mapped.length < PAGE_SIZE;
      } catch (e) {
        if (seq === requestSeq) {
          showApiError(e);
          rows.value = [];
          finished.value = true;
        }
      } finally {
        if (seq === requestSeq) {
          loading.value = false;
          refreshing.value = false;
        }
      }
    };

    onMounted(() => {
      document.title = "风险评估管理";
      void loadFilterOptions().finally(() => {
        void loadList(true);
      });
    });

    watch([statusFilter, zoneFilter], () => {
      void loadList(true);
    });

    const filteredRows = computed(() => {
      return rows.value;
    });
    const statusFilterText = computed(() => STATUS_OPTIONS.find((item) => item.value === statusFilter.value)?.text ?? "全部");
    const zoneOptions = computed(() => [
      { text: "全部区域", value: "" },
      ...zones.value.map((zone) => ({ text: zone.name, value: zone.id })),
    ]);
    const zoneFilterText = computed(() => zoneOptions.value.find((item) => item.value === zoneFilter.value)?.text ?? "全部区域");

    const onRefresh = async (): Promise<void> => {
      refreshing.value = true;
      await loadList(true);
    };

    const riskTag = (level?: RiskLevel): JSX.Element => {
      return <RiskLevelBadge level={level} emptyText="待评估" />;
    };

    return (): JSX.Element => (
      <div class={styles.page}>
        <Bar name="风险评估管理" isShowRight={false} />

        <div class={styles.searchBar}>
          <Search
            v-model={keyword.value}
            placeholder="搜索风险单元"
            shape="round"
            class={styles.search}
            onSearch={() => void loadList(true)}
            onClear={() => void loadList(true)}
          />
        </div>

        <div class={styles.filterBar}>
          <DropdownMenu overlay={false} class={styles.dropdownMenu}>
            <DropdownItem v-model={statusFilter.value} title={`状态：${statusFilterText.value}`} options={STATUS_OPTIONS} />
            <DropdownItem v-model={zoneFilter.value} title={`区域：${zoneFilterText.value}`} options={zoneOptions.value} />
          </DropdownMenu>
        </div>

        <PullRefresh modelValue={refreshing.value || loading.value} onRefresh={onRefresh}>
          <List
            class={styles.list}
            v-model:loading={loading.value}
            finished={finished.value}
            finishedText={filteredRows.value.length ? "— 没有更多了 —" : "暂无评估任务"}
            onLoad={() => void loadList()}
          >
            {filteredRows.value.map((item) => (
              <div key={item.id} class={styles.card}>
                <div class={styles.cardHeader}>
                  <div class={styles.unitName}>{item.unitName}</div>
                  <Tag type={STATUS_TAG[item.status]} plain>
                    {STATUS_LABEL[item.status]}
                  </Tag>
                </div>
                <div class={styles.metaGrid}>
                  <div class={styles.metaItem}>
                    <div class={styles.metaLabel}>单元类型</div>
                    <div class={styles.metaValue}>{item.unitType}</div>
                  </div>
                  <div class={styles.metaItem}>
                    <div class={styles.metaLabel}>所属区域</div>
                    <div class={styles.metaValue}>{item.zoneName}</div>
                  </div>
                  <div class={styles.metaItem}>
                    <div class={styles.metaLabel}>固有风险</div>
                    <div class={styles.metaValue}>{riskTag(item.inherentRiskLevel)}</div>
                  </div>
                  <div class={styles.metaItem}>
                    <div class={styles.metaLabel}>控制风险</div>
                    <div class={styles.metaValue}>{riskTag(item.controlRiskLevel)}</div>
                  </div>
                </div>
                <div class={styles.progressLine}>
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => {
                      void router.push({ name: "assessmentDetail", query: { unitId: item.id } });
                    }}
                  >
                    进入评估
                  </Button>
                </div>
              </div>
            ))}
            {!loading.value && !filteredRows.value.length && <div class={styles.empty}>暂无评估任务</div>}
          </List>
        </PullRefresh>
      </div>
    );
  },
});
