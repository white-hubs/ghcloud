import { defineComponent, ref } from "vue";

import { useCubeModal } from "@ghcloud/cube-app-design";
import { Alert, Button, Empty, Input, Tag } from "@ghcloud/cube-ui";

import { PERSON_SOURCES } from "@/constants/positioning";
import type { PositioningPerson } from "@/models/positioning";
import { usePositioningStore } from "@/stores/positioning";
import { StaticTable, asCubeTableColumns } from "@/utils/table-columns";

import "./person-search-modal.less";

export function useTrajectoryPersonSearch(onSelected: (person: PositioningPerson) => void) {
  const store = usePositioningStore();
  const keyword = ref("");
  const activeKeyword = ref("");
  const searched = ref(false);
  const people = ref<PositioningPerson[]>([]);
  const pageNumber = ref(1);
  const total = ref(0);
  const loading = ref(false);
  const error = ref("");
  let requestVersion = 0;
  async function search(page = 1): Promise<void> {
    const text = page === 1 ? keyword.value.trim() : activeKeyword.value;
    if (!text) {
      requestVersion++;
      searched.value = false;
      people.value = [];
      total.value = 0;
      activeKeyword.value = "";
      loading.value = false;
      error.value = "";
      return;
    }
    const version = ++requestVersion;
    searched.value = true;
    activeKeyword.value = text;
    pageNumber.value = page;
    loading.value = true;
    error.value = "";
    try {
      const result = await store.queryPersons({ keyword: text, pageNumber: page, pageSize: 10 });
      if (version !== requestVersion) return;
      people.value = result.records;
      total.value = result.total;
    } catch {
      if (version === requestVersion) error.value = "定位对象查询失败，请重试";
    } finally {
      if (version === requestVersion) loading.value = false;
    }
  }
  const [CubeModal, modal] = useCubeModal({ title: "搜索定位对象", width: "800px", wrapperClass: "pp-trajectory-person-search" });
  function select(person: PositioningPerson): void {
    onSelected(person);
    modal.close();
  }
  const columns = [
    {
      title: "人员编号",
      dataIndex: "personNumber",
      width: 145,
      customRender: ({ record }: { record: PositioningPerson }) => record.personNumber || record.id,
    },
    { title: "姓名", dataIndex: "name", width: 100 },
    {
      title: "人员类型",
      dataIndex: "source",
      width: 110,
      customRender: ({ record }: { record: PositioningPerson }) => (
        <Tag color={PERSON_SOURCES[record.source].color}>{PERSON_SOURCES[record.source].personType}</Tag>
      ),
    },
    { title: "所属组织", dataIndex: "organization", width: 160 },
    {
      title: "操作",
      dataIndex: "actions",
      width: 85,
      customRender: ({ record }: { record: PositioningPerson }) => (
        <Button type="link" onClick={() => select(record)}>
          选择
        </Button>
      ),
    },
  ];
  const PersonSearchModal = defineComponent({
    name: "TrajectoryPersonSearchModal",
    setup: () => () => (
      <CubeModal
        v-slots={{
          default: () => (
            <>
              <div class="pp-trajectory-person-search__query">
                <Input
                  aria-label="搜索定位对象"
                  placeholder="输入姓名或人员编号"
                  maxlength={100}
                  showCount={false}
                  v-model:value={keyword.value}
                  onPressEnter={() => void search()}
                />
                <Button type="primary" loading={loading.value} onClick={() => void search()}>
                  搜索
                </Button>
              </div>
              {error.value && <Alert type="warning" showIcon message={error.value} />}
              {searched.value ? (
                <StaticTable
                  columns={asCubeTableColumns(columns)}
                  dataSource={people.value}
                  rowKey="id"
                  loading={loading.value}
                  size="small"
                  scrollY={300}
                  pagination={{
                    current: pageNumber.value,
                    pageSize: 10,
                    total: total.value,
                    showSizeChanger: false,
                    onChange: (value: number) => {
                      void search(value);
                    },
                  }}
                />
              ) : (
                <Empty description="请输入姓名或人员编号搜索定位对象" />
              )}
              <p class="pp-muted">支持查询当前未绑定人员的历史轨迹。</p>
            </>
          ),
          footer: () => <Button onClick={() => modal.close()}>取消</Button>,
        }}
      />
    ),
  });
  return {
    PersonSearchModal,
    open: (value = "") => {
      requestVersion++;
      keyword.value = value;
      activeKeyword.value = "";
      pageNumber.value = 1;
      searched.value = Boolean(value.trim());
      people.value = [];
      total.value = 0;
      error.value = "";
      modal.open();
      if (value.trim()) void search();
    },
  };
}
