import {
  Button,
  Checkbox,
  CheckboxGroup,
  DropdownItem,
  DropdownMenu,
  Empty,
  List,
  Popup,
  PullRefresh,
  Search,
  Tag,
  showConfirmDialog,
  showToast,
} from "vant";
import { defineComponent, onMounted, reactive, ref, watch, type VNode } from "vue";
import { useRouter } from "vue-router";

import type { PersonPoolUserVO, PersonVO } from "@ghcloud/cube-service-interface/safety-personnel";
import { deletePerson, linkPersons, pagePersonPool, pagePersons } from "@ghcloud/cube-services-client/safety-personnel.client";

import { Bar } from "@/components/bar/bar";
import { PERSON_TYPE_LABEL, PERSON_TYPE_OPTIONS, type PersonnelTypeCode } from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { getPageRecords, getPageTotal, maskPhone, pickFirstText } from "@/utils";

import styles from "./personnel.module.less";

const PAGE_SIZE = 10;
const personTypeDropdownOptions = PERSON_TYPE_OPTIONS.map((item) => ({
  text: item.label,
  value: item.value,
}));

function typeLabels(typeCodes?: string[]): string[] {
  return (typeCodes ?? []).map((code) => PERSON_TYPE_LABEL[code as PersonnelTypeCode] ?? code).filter(Boolean);
}

export const PersonnelListPage = defineComponent({
  name: "PersonnelListPage",
  setup() {
    const router = useRouter();
    const rows = ref<PersonVO[]>([]);
    const poolRows = ref<PersonPoolUserVO[]>([]);
    const refreshing = ref(false);
    const loading = ref(false);
    const finished = ref(false);
    const poolLoading = ref(false);
    const poolVisible = ref(false);
    const checkedUserIds = ref<string[]>([]);

    const state = reactive({
      keyword: "",
      typeCode: "ALL" as PersonnelTypeCode,
      pageNumber: 1,
      total: 0,
      poolKeyword: "",
      poolPageNumber: 1,
      poolFinished: false,
    });
    let listRequestSeq = 0;
    let poolRequestSeq = 0;

    const loadList = async (reset = false): Promise<void> => {
      if (loading.value && !reset) return;
      const seq = ++listRequestSeq;
      if (reset) {
        state.pageNumber = 1;
        finished.value = false;
        rows.value = [];
      }
      loading.value = true;
      try {
        const currentPage = state.pageNumber;
        const result = await useAuthRequest(() =>
          pagePersons({
            pageNumber: currentPage,
            pageSize: PAGE_SIZE,
            keyword: state.keyword.trim() || undefined,
            typeCode: state.typeCode === "ALL" ? undefined : state.typeCode,
          }),
        );
        if (seq !== listRequestSeq) return;
        const records = getPageRecords<PersonVO>(result);
        state.total = getPageTotal(result);
        rows.value = reset ? records : [...rows.value, ...records];
        state.pageNumber = currentPage + 1;
        finished.value = rows.value.length >= state.total || records.length < PAGE_SIZE;
      } finally {
        if (seq === listRequestSeq) {
          loading.value = false;
          refreshing.value = false;
        }
      }
    };

    const onRefresh = async (): Promise<void> => {
      refreshing.value = true;
      await loadList(true);
    };

    const loadPool = async (reset = false): Promise<void> => {
      if (state.typeCode === "ALL") {
        showToast("请选择具体人员类型后关联");
        return;
      }
      if (poolLoading.value && !reset) return;
      const seq = ++poolRequestSeq;
      if (reset) {
        state.poolPageNumber = 1;
        state.poolFinished = false;
        poolRows.value = [];
      }
      poolLoading.value = true;
      try {
        const currentPage = state.poolPageNumber;
        const result = await useAuthRequest(() =>
          pagePersonPool({
            pageNumber: currentPage,
            pageSize: PAGE_SIZE,
            keyword: state.poolKeyword.trim() || undefined,
            typeCode: state.typeCode,
            enabled: true,
          }),
        );
        if (seq !== poolRequestSeq) return;
        const records = getPageRecords<PersonPoolUserVO>(result);
        const total = getPageTotal(result);
        poolRows.value = reset ? records : [...poolRows.value, ...records];
        state.poolPageNumber = currentPage + 1;
        state.poolFinished = poolRows.value.length >= total || records.length < PAGE_SIZE;
      } finally {
        if (seq === poolRequestSeq) {
          poolLoading.value = false;
        }
      }
    };

    const openPool = (): void => {
      if (state.typeCode === "ALL") {
        showToast("请先选择安全/特种/应急人员类型");
        return;
      }
      checkedUserIds.value = [];
      state.poolKeyword = "";
      poolVisible.value = true;
      void loadPool(true);
    };

    const confirmLink = async (): Promise<void> => {
      if (!checkedUserIds.value.length) {
        showToast("请选择人员");
        return;
      }
      await useAuthRequest(() => linkPersons({ userIds: checkedUserIds.value, typeCode: state.typeCode }));
      showToast("关联成功");
      poolVisible.value = false;
      await loadList(true);
    };

    const removePerson = async (person: PersonVO): Promise<void> => {
      const id = person.id ?? person.userId;
      if (!id) return;
      await showConfirmDialog({
        title: "移除人员",
        message: `确认移除 ${person.userName ?? "该人员"}？`,
      });
      await useAuthRequest(() => deletePerson(id));
      showToast("已移除");
      await loadList(true);
    };

    onMounted(() => {
      void loadList(true);
    });

    watch(
      () => state.typeCode,
      () => {
        void loadList(true);
      },
    );

    const renderTypeFilter = (): VNode => (
      <DropdownMenu class={styles.filterMenu} activeColor="#1677ff">
        <DropdownItem v-model={state.typeCode} title="人员类型" options={personTypeDropdownOptions} />
      </DropdownMenu>
    );

    const renderCard = (person: PersonVO): VNode => {
      const id = person.id ?? person.userId;
      return (
        <div class={styles.personCard} key={id} onClick={() => void router.push({ path: "/personnel/detail", query: { id } })}>
          <div class={styles.cardHeader}>
            <div>
              <div class={styles.name}>{pickFirstText(person.userName)}</div>
              <div class={styles.phone}>{maskPhone(person.phone)}</div>
            </div>
            <div class={styles.tags}>
              {typeLabels(person.typeCodes).map((label) => (
                <Tag key={label} type="primary" plain>
                  {label}
                </Tag>
              ))}
            </div>
          </div>
          <div class={styles.metaGrid}>
            <span>单位：{pickFirstText(person.companyName)}</span>
            <span>部门：{pickFirstText(person.deptName)}</span>
            <span>岗位：{pickFirstText(person.postName)}</span>
          </div>
          <div class={styles.actions}>
            <Button
              size="small"
              type="primary"
              plain
              onClick={(e) => {
                e.stopPropagation();
                void router.push({ path: "/personnel/detail", query: { id } });
              }}
            >
              详情
            </Button>
            <Button
              size="small"
              type="danger"
              plain
              onClick={(e) => {
                e.stopPropagation();
                void removePerson(person);
              }}
            >
              移除
            </Button>
          </div>
        </div>
      );
    };

    return (): VNode => (
      <div class="page">
        <Bar
          name="安全人员"
          v-slots={{
            right: () => (
              <button type="button" class={styles.navAction} onClick={openPool}>
                关联人员
              </button>
            ),
          }}
        />
        <div class={styles.toolbar}>
          <Search
            v-model={state.keyword}
            placeholder="搜索姓名、手机号、部门"
            shape="round"
            onSearch={() => void loadList(true)}
            onClear={() => void loadList(true)}
          />
          {renderTypeFilter()}
        </div>
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finishedText={rows.value.length ? "没有更多了" : ""}
            onLoad={() => void loadList()}
          >
            <div class={styles.list}>
              {rows.value.length ? rows.value.map(renderCard) : !loading.value ? <Empty description="暂无安全人员" /> : null}
            </div>
          </List>
        </PullRefresh>
        <Popup v-model:show={poolVisible.value} position="bottom" round class={styles.poolPopup}>
          <div class={styles.popupTitle}>关联{PERSON_TYPE_LABEL[state.typeCode]}</div>
          <Search
            v-model={state.poolKeyword}
            placeholder="搜索人员池"
            shape="round"
            onSearch={() => void loadPool(true)}
            onClear={() => void loadPool(true)}
          />
          <CheckboxGroup v-model={checkedUserIds.value}>
            <List
              v-model:loading={poolLoading.value}
              finished={state.poolFinished}
              finishedText="没有更多了"
              onLoad={() => void loadPool()}
            >
              <div class={styles.poolList}>
                {poolRows.value.map((person) => (
                  <Checkbox class={styles.poolItem} name={String(person.userId)} key={person.userId}>
                    <div class={styles.poolName}>{person.userName || "-"}</div>
                    <div class={styles.poolMeta}>
                      {maskPhone(person.phone)} · {pickFirstText(person.deptName, person.postName)}
                    </div>
                  </Checkbox>
                ))}
              </div>
            </List>
          </CheckboxGroup>
          <div class={styles.popupActions}>
            <Button
              block
              onClick={() => {
                poolVisible.value = false;
              }}
            >
              取消
            </Button>
            <Button block type="primary" onClick={() => void confirmLink()}>
              确认关联
            </Button>
          </div>
        </Popup>
      </div>
    );
  },
});
