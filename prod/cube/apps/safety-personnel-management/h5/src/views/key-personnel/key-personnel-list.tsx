import { Button, DropdownItem, DropdownMenu, Empty, List, PullRefresh, Search, Tag, showConfirmDialog, showToast } from "vant";
import { defineComponent, onMounted, reactive, ref, watch, type VNode } from "vue";
import { useRouter } from "vue-router";

import type { KeyPersonPageVO, KeyPersonRiskLevel } from "@ghcloud/cube-service-interface/safety-personnel";
import { deleteKeyPerson, pageKeyPersons } from "@ghcloud/cube-services-client/safety-personnel.client";

import { Bar } from "@/components/bar/bar";
import { KEY_PERSON_RISK_LEVEL_LABEL, KEY_PERSON_RISK_LEVEL_OPTIONS } from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { getPageRecords, getPageTotal, maskPhone, pickFirstText } from "@/utils";

import styles from "./key-personnel.module.less";

const PAGE_SIZE = 10;
const riskLevelDropdownOptions = KEY_PERSON_RISK_LEVEL_OPTIONS.map((item) => ({
  text: item.label,
  value: item.value,
}));

function riskTagType(level: KeyPersonRiskLevel): "danger" | "warning" | "primary" {
  if (level === "HIGH") return "danger";
  if (level === "MEDIUM") return "warning";
  return "primary";
}

export const KeyPersonnelListPage = defineComponent({
  name: "KeyPersonnelListPage",
  setup() {
    const router = useRouter();
    const rows = ref<KeyPersonPageVO[]>([]);
    const loading = ref(false);
    const refreshing = ref(false);
    const finished = ref(false);
    const state = reactive({
      keyword: "",
      riskLevel: "" as KeyPersonRiskLevel | "",
      pageNumber: 1,
      total: 0,
    });
    let requestSeq = 0;

    const loadList = async (reset = false): Promise<void> => {
      if (loading.value && !reset) return;
      const seq = ++requestSeq;
      if (reset) {
        state.pageNumber = 1;
        finished.value = false;
        rows.value = [];
      }
      loading.value = true;
      try {
        const currentPage = state.pageNumber;
        const result = await useAuthRequest(() =>
          pageKeyPersons({
            pageNumber: currentPage,
            pageSize: PAGE_SIZE,
            keyword: state.keyword.trim() || undefined,
            riskLevel: state.riskLevel || undefined,
          }),
        );
        if (seq !== requestSeq) return;
        const records = getPageRecords<KeyPersonPageVO>(result);
        state.total = getPageTotal(result);
        rows.value = reset ? records : [...rows.value, ...records];
        state.pageNumber = currentPage + 1;
        finished.value = rows.value.length >= state.total || records.length < PAGE_SIZE;
      } finally {
        if (seq === requestSeq) {
          loading.value = false;
          refreshing.value = false;
        }
      }
    };

    const deleteRecord = async (record: KeyPersonPageVO): Promise<void> => {
      await showConfirmDialog({
        title: "删除重点人员",
        message: `确认删除 ${record.name}？`,
      });
      await useAuthRequest(() => deleteKeyPerson(record.id));
      showToast("已删除");
      await loadList(true);
    };

    const goDetail = (record: KeyPersonPageVO): void => {
      if (!record.id) {
        showToast("重点人员参数无效");
        return;
      }
      void router.push({ path: "/key-personnel/detail", query: { id: record.id } });
    };

    onMounted(() => {
      void loadList(true);
    });

    watch(
      () => state.riskLevel,
      () => {
        void loadList(true);
      },
    );

    const renderCard = (item: KeyPersonPageVO): VNode => (
      <div class={styles.personCard} key={item.id} onClick={() => goDetail(item)}>
        <div class={styles.cardHeader}>
          <div>
            <div class={styles.code}>{item.personCode || "-"}</div>
            <div class={styles.name}>{item.name || "-"}</div>
            <div class={styles.phone}>{maskPhone(item.phone)}</div>
          </div>
          <Tag type={riskTagType(item.riskLevel)}>{item.riskLevelName || KEY_PERSON_RISK_LEVEL_LABEL[item.riskLevel]}</Tag>
        </div>
        <div class={styles.metaGrid}>
          <span>区域：{pickFirstText(item.areaName)}</span>
          <span>监管人：{pickFirstText(item.supervisorName)}</span>
          <span class={styles.reason}>原因：{pickFirstText(item.supervisionReason)}</span>
        </div>
        <div class={styles.actions}>
          <Button
            size="small"
            type="primary"
            plain
            onClick={(e) => {
              e.stopPropagation();
              goDetail(item);
            }}
          >
            详情
          </Button>
          <Button
            size="small"
            type="primary"
            plain
            onClick={(e) => {
              e.stopPropagation();
              void router.push({ path: "/key-personnel/report", query: { id: item.id, name: item.name } });
            }}
          >
            上报
          </Button>
          <Button
            size="small"
            plain
            onClick={(e) => {
              e.stopPropagation();
              void router.push({ path: "/key-personnel/form", query: { id: item.id } });
            }}
          >
            编辑
          </Button>
          <Button
            size="small"
            type="danger"
            plain
            onClick={(e) => {
              e.stopPropagation();
              void deleteRecord(item);
            }}
          >
            删除
          </Button>
        </div>
      </div>
    );

    return (): VNode => (
      <div class="page">
        <Bar
          name="重点人员"
          v-slots={{
            right: () => (
              <button type="button" class={styles.navAction} onClick={() => void router.push("/key-personnel/form")}>
                新增
              </button>
            ),
          }}
        />
        <div class={styles.toolbar}>
          <Search
            v-model={state.keyword}
            placeholder="搜索姓名、手机号、编号"
            shape="round"
            onSearch={() => void loadList(true)}
            onClear={() => void loadList(true)}
          />
          <DropdownMenu class={styles.filterMenu} activeColor="#1677ff">
            <DropdownItem v-model={state.riskLevel} title="风险等级" options={riskLevelDropdownOptions} />
          </DropdownMenu>
        </div>
        <PullRefresh
          v-model={refreshing.value}
          onRefresh={async () => {
            refreshing.value = true;
            await loadList(true);
          }}
        >
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finishedText={rows.value.length ? "没有更多了" : ""}
            onLoad={() => void loadList()}
          >
            <div class={styles.list}>
              {rows.value.length ? rows.value.map(renderCard) : !loading.value ? <Empty description="暂无重点人员" /> : null}
            </div>
          </List>
        </PullRefresh>
      </div>
    );
  },
});
