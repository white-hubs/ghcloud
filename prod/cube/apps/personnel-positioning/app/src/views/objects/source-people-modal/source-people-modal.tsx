import { defineComponent, reactive, ref, type FunctionalComponent } from "vue";

import { DeptCascaderSelect, useCubeModal } from "@ghcloud/cube-app-design";
import { Alert, Button, Form, FormItem, Input, Tag, message } from "@ghcloud/cube-ui";

import type { ApiStaff } from "@/api/positioning";
import { PERSON_SOURCES } from "@/constants/positioning";
import type { SourcePerson } from "@/models/positioning";
import { usePositioningStore } from "@/stores/positioning";
import { StaticTable, asCubeTableColumns } from "@/utils/table-columns";

import "./source-people-modal.less";

const DepartmentSelect = DeptCascaderSelect as unknown as FunctionalComponent<Record<string, unknown>>;

export function useSourcePeopleModal(onSynced: () => void) {
  const store = usePositioningStore();
  const keyword = ref("");
  const organizationId = ref("");
  const applied = reactive({ keyword: "", organizationId: "" });
  const page = reactive({ current: 1, pageSize: 10, total: 0 });
  const records = ref<SourcePerson[]>([]);
  const selected = ref<string[]>([]);
  const loading = ref(false);
  const isSynced = (person: SourcePerson): boolean => store.state.persons.some((item) => item.sourceId === person.sourceId);
  const [CubeModal, modal] = useCubeModal({ title: "从来源应用获取人员", width: "1080px", wrapperClass: "pp-source-modal" });
  const renderText = (value: unknown) => {
    const text = String(value || "—");
    return (
      <span class="pp-cell-ellipsis" title={text}>
        {text}
      </span>
    );
  };
  const columns = [
    { title: "来源人员编号", dataIndex: "sourceId", width: 160, customRender: ({ text }: { text: unknown }) => renderText(text) },
    { title: "姓名", dataIndex: "name", width: 100, customRender: ({ text }: { text: unknown }) => renderText(text) },
    { title: "电话号码", dataIndex: "mobile", width: 130, customRender: ({ text }: { text: unknown }) => renderText(text) },
    { title: "部门", dataIndex: "organization", width: 160, customRender: ({ text }: { text: unknown }) => renderText(text) },
    { title: "职位", dataIndex: "position", width: 130, customRender: ({ text }: { text: unknown }) => renderText(text) },
    { title: "岗位", dataIndex: "post", width: 140, customRender: ({ text }: { text: unknown }) => renderText(text) },
    {
      title: "同步状态",
      dataIndex: "syncState",
      width: 100,
      customRender: ({ record }: { record: SourcePerson }) => (
        <Tag color={isSynced(record) ? "green" : "default"}>{isSynced(record) ? "已同步" : "未同步"}</Tag>
      ),
    },
  ];
  const toSourcePerson = (person: ApiStaff): SourcePerson => ({
    sourceId: String(person.id),
    source: "organization",
    name: person.name || "—",
    mobile: person.mobile?.trim() || "—",
    organization: person.organizationName?.trim() || "—",
    position: person.appointmentName?.trim() || "—",
    post: person.postNames?.trim() || "—",
  });
  async function fetchPage(current = page.current, pageSize = page.pageSize): Promise<void> {
    try {
      const result = await store.queryStaff({
        pageNumber: current,
        pageSize,
        keyword: applied.keyword || undefined,
        organizationId: applied.organizationId || undefined,
      });
      records.value = result.records.map(toSourcePerson);
      page.current = current;
      page.pageSize = pageSize;
      page.total = result.total;
    } catch (error) {
      message.error((error as Error).message);
    }
  }
  function query(): void {
    applied.keyword = keyword.value.trim();
    applied.organizationId = organizationId.value ? String(organizationId.value) : "";
    void fetchPage(1, page.pageSize);
  }
  function reset(): void {
    keyword.value = "";
    organizationId.value = "";
    applied.keyword = "";
    applied.organizationId = "";
    void fetchPage(1, page.pageSize);
  }
  async function submit(): Promise<void> {
    if (!selected.value.length || loading.value) return;
    loading.value = true;
    try {
      const before = new Set(store.state.persons.map((person) => person.sourceId));
      const ids = await store.savePersons(selected.value);
      const added = selected.value.filter((id) => !before.has(id)).length;
      const skipped = selected.value.length - added;
      message.success(`已同步 ${ids.length ? added : 0} 名定位对象${skipped ? `，跳过 ${skipped} 名已同步人员` : ""}`);
      modal.close();
      onSynced();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      loading.value = false;
    }
  }
  const SourcePeopleModal = defineComponent({
    name: "SourcePeopleModal",
    setup: () => () => (
      <CubeModal
        v-slots={{
          default: () => (
            <>
              <Alert type="info" showIcon message="请选择员工管理中的人员，同步为定位对象后即可绑定定位终端。" />
              <div class="pp-source-options">
                <Button class={["pp-source-option", { "is-selected": true }]}>
                  <strong>{PERSON_SOURCES.organization.label}</strong>
                  <span>{PERSON_SOURCES.organization.personType} · 已接入</span>
                </Button>
              </div>
              <Form class="pp-source-filter-form" layout="inline">
                <FormItem label="关键词">
                  <Input
                    class="pp-source-filter-keyword"
                    aria-label="搜索来源人员"
                    placeholder="姓名、编号、电话或岗位"
                    allowClear
                    v-model:value={keyword.value}
                    onPressEnter={query}
                  />
                </FormItem>
                <FormItem label="部门">
                  <DepartmentSelect
                    class="pp-source-filter-department"
                    placeholder="请选择部门"
                    multiple={false}
                    readonly={false}
                    maxTagCount={1}
                    filterEnabled
                    treeDefaultExpandAll={false}
                    v-model:value={organizationId.value}
                  />
                </FormItem>
                <FormItem class="pp-source-filter-actions">
                  <Button type="primary" onClick={query}>
                    查询
                  </Button>
                  <Button onClick={reset}>重置</Button>
                </FormItem>
              </Form>
              <StaticTable
                columns={asCubeTableColumns(columns)}
                dataSource={records.value}
                loading={store.loading.staff}
                rowKey="sourceId"
                size="small"
                scrollY={320}
                pagination={{
                  current: page.current,
                  pageSize: page.pageSize,
                  total: page.total,
                  showSizeChanger: true,
                  onChange: (current: number, pageSize: number) => {
                    const nextPage = pageSize === page.pageSize ? current : 1;
                    void fetchPage(nextPage, pageSize);
                  },
                }}
                rowSelection={{
                  selectedRowKeys: selected.value,
                  preserveSelectedRowKeys: true,
                  onChange: (keys: (string | number)[]) => {
                    selected.value = keys.map(String);
                  },
                  getCheckboxProps: (record: unknown) => ({ disabled: isSynced(record as SourcePerson) }),
                }}
              />
              <p class="pp-muted">已同步人员不可重复选择。组织和岗位由员工管理查询返回。</p>
            </>
          ),
          footer: () => (
            <div class="pp-modal-footer">
              <span class="pp-selection-count">
                已选择 <strong>{selected.value.length}</strong> 人
              </span>
              <Button disabled={loading.value} onClick={() => modal.close()}>
                取消
              </Button>
              <Button type="primary" loading={loading.value} disabled={!selected.value.length} onClick={() => void submit()}>
                同步到定位对象
              </Button>
            </div>
          ),
        }}
      />
    ),
  });
  return {
    SourcePeopleModal,
    open: () => {
      keyword.value = "";
      organizationId.value = "";
      applied.keyword = "";
      applied.organizationId = "";
      Object.assign(page, { current: 1, pageSize: 10, total: 0 });
      records.value = [];
      selected.value = [];
      void fetchPage(1, 10);
      modal.open();
    },
  };
}
