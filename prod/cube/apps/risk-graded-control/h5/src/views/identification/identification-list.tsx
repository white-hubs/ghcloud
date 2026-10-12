import { Button, DropdownItem, DropdownMenu, List, PullRefresh, Search, Tag, showToast } from "vant";
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

import { pageIdentificationUnits } from "@ghcloud/cube-services-client/risk-graded-control.client";

import { Bar } from "@/components/bar/bar";
import { IDENTIFICATION_STATUS_LABEL, IDENTIFICATION_STATUS_TAG, unitAvatarText } from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import type { IdentificationStatus, IdentificationUnitVO } from "@/types/risk";
import { showApiError } from "@/utils/api-error";
import { enrichIdentificationUnitFromApi, loadAreaAndUnitTypeNameMaps } from "@/utils/hydrate-unit-display";
import { mapIdentificationFromApi, mapIdentificationStatusToApi } from "@/utils/risk-control-mapper";

import styles from "./identification-list.module.less";

const STATUS_OPTIONS: Array<{ text: string; value: IdentificationStatus | "" }> = [
  { text: "全部", value: "" },
  { text: "辨识中", value: "IDENTIFYING" },
  { text: "待审核", value: "PENDING_REVIEW" },
  { text: "已审核", value: "REVIEWED" },
];

const PAGE_SIZE = 10;

export const IdentificationListPage = defineComponent({
  name: "IdentificationListPage",
  setup() {
    const router = useRouter();
    const source = ref<IdentificationUnitVO[]>([]);
    const statusFilter = ref<IdentificationStatus | "">("");
    const refreshing = ref(false);
    const loading = ref(false);
    const finished = ref(false);
    const pageNumber = ref(1);
    const total = ref(0);
    const keyword = ref("");
    let requestSeq = 0;
    const statusFilterText = computed(() => STATUS_OPTIONS.find((item) => item.value === statusFilter.value)?.text ?? "全部");

    const loadList = async (reset = false): Promise<void> => {
      if (loading.value && !reset) return;
      const seq = ++requestSeq;
      if (reset) {
        pageNumber.value = 1;
        total.value = 0;
        source.value = [];
        finished.value = false;
      }
      loading.value = true;
      try {
        const currentPage = pageNumber.value;
        const [page, maps] = await Promise.all([
          useAuthRequest(() =>
            pageIdentificationUnits({
              pageNumber: currentPage,
              pageSize: PAGE_SIZE,
              keyword: keyword.value.trim() || undefined,
              status: mapIdentificationStatusToApi(statusFilter.value || undefined),
            }),
          ),
          loadAreaAndUnitTypeNameMaps(useAuthRequest),
        ]);
        if (seq !== requestSeq) return;
        const mapped = page.records.map((vo) => enrichIdentificationUnitFromApi(vo, mapIdentificationFromApi(vo), maps));
        total.value = page.total ?? 0;
        source.value = reset ? mapped : [...source.value, ...mapped];
        pageNumber.value = currentPage + 1;
        finished.value = (total.value > 0 && source.value.length >= total.value) || mapped.length < PAGE_SIZE;
      } catch (e) {
        if (seq === requestSeq) {
          showApiError(e);
          source.value = [];
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
      document.title = "风险辨识管理";
      void loadList(true);
    });

    watch(statusFilter, () => {
      void loadList(true);
    });

    const onRefresh = async (): Promise<void> => {
      refreshing.value = true;
      await loadList(true);
    };

    const goEntry = (record: IdentificationUnitVO): void => {
      if (record.status === "PENDING_REVIEW" && record.rejectedCount <= 0) {
        return;
      }
      if (record.status === "REVIEWED") {
        viewDetail(record);
        return;
      }
      router.push({
        name: "identification-entry",
        query: { unitId: record.id },
      });
    };

    const viewDetail = (record: IdentificationUnitVO): void => {
      if (!record.id) {
        showToast("未找到风险单元");
        return;
      }
      void router.push({
        path: "/identifications/detail",
        query: { unitId: record.id },
      });
    };

    return (): JSX.Element => (
      <div class={styles.page}>
        <Bar name="风险辨识管理" isShowRight={false} />

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
          </DropdownMenu>
        </div>

        <PullRefresh modelValue={refreshing.value || loading.value} onRefresh={onRefresh}>
          <List
            class={styles.list}
            v-model:loading={loading.value}
            finished={finished.value}
            finishedText={source.value.length ? "— 没有更多了 —" : "暂无辨识任务"}
            onLoad={() => void loadList()}
          >
            {source.value.map((item) => (
              <div key={item.id} class={styles.card} onClick={() => viewDetail(item)}>
                <div class={styles.cardHeader}>
                  <div class={styles.titleRow}>
                    <span class={styles.avatar}>{unitAvatarText(item.unitName)}</span>
                    <span class={styles.unitName}>{item.unitName}</span>
                  </div>
                  <Tag type={IDENTIFICATION_STATUS_TAG[item.status]} plain>
                    {IDENTIFICATION_STATUS_LABEL[item.status]}
                  </Tag>
                </div>
                <div class={styles.metaGrid}>
                  <div class={styles.metaRow}>
                    <span class={styles.metaLabel}>单元类型</span>
                    <span class={styles.metaValue}>{item.unitType || "--"}</span>
                  </div>
                  <div class={styles.metaRow}>
                    <span class={styles.metaLabel}>所属区域</span>
                    <span class={styles.metaValue}>{item.zoneName || "--"}</span>
                  </div>
                  <div class={styles.metaRow}>
                    <span class={styles.metaLabel}>辨识人员</span>
                    <span class={styles.metaValue}>{item.identifyUsers.join("、") || "--"}</span>
                  </div>
                </div>
                <div class={styles.footer}>
                  <div class={styles.stats}>
                    <span class={styles.statsLabel}>风险对象</span>
                    <span class={styles.statsValue}>{item.objectCount}个</span>
                    {item.submitTime && <span class={styles.submitTime}>{item.submitTime.split(" ")[0]} 提交</span>}
                    {item.rejectedCount > 0 && <span class={styles.rejected}>驳回 {item.rejectedCount}</span>}
                  </div>
                  {item.status === "REVIEWED" ? (
                    <span
                      class={styles.viewLink}
                      onClick={(e: Event) => {
                        e.stopPropagation();
                        viewDetail(item);
                      }}
                    >
                      查看详情 →
                    </span>
                  ) : item.status === "PENDING_REVIEW" && item.rejectedCount <= 0 ? (
                    <Button size="small" round disabled>
                      审核中
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      type="primary"
                      round
                      onClick={(e: Event) => {
                        e.stopPropagation();
                        goEntry(item);
                      }}
                    >
                      {item.status === "PENDING_REVIEW" ? "再次辨识" : "辨识"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </List>
        </PullRefresh>
      </div>
    );
  },
});
