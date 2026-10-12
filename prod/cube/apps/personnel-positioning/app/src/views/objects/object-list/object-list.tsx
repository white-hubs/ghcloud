import { computed, defineComponent, onMounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { Button, DownloadOutlined, Page, PlusOutlined, Space, Tag, message } from "@ghcloud/cube-ui";

import { BINDING_STATES, PERSON_SOURCES, SOURCE_OPTIONS, optionsOf } from "@/constants/positioning";
import type { PositioningPerson } from "@/models/positioning";
import { usePositioningStore } from "@/stores/positioning";
import { downloadCsv, positiveInt } from "@/utils/positioning";
import { useBindingModal } from "@/views/objects/binding-modal/binding-modal";
import { useSourcePeopleModal } from "@/views/objects/source-people-modal/source-people-modal";
import { useSourceProfileModal } from "@/views/objects/source-profile-modal/source-profile-modal";
import { useUnbindModal } from "@/views/objects/unbind-modal/unbind-modal";

import "./object-list.less";

const textValue = (value: unknown): string => (typeof value === "string" ? value : "");

export const ObjectList = defineComponent({
  name: "PositioningObjectList",
  setup() {
    const store = usePositioningStore();
    const route = useRoute();
    const router = useRouter();
    const search = reactive({
      keyword: textValue(route.query.keyword),
      source: textValue(route.query.source),
      organization: textValue(route.query.organization),
      binding: textValue(route.query.binding),
      pageNumber: positiveInt(route.query.pageNumber, 1),
      pageSize: positiveInt(route.query.pageSize, 10),
      total: 0,
    });

    const isBound = (person: PositioningPerson): boolean => {
      const bindings = store.history(person.id);
      return bindings.length ? Boolean(store.currentBinding(person.id)) : Boolean(person.bound);
    };
    const summary = computed(() => ({
      total: store.state.persons.length,
      bound: store.state.persons.filter(isBound).length,
    }));

    function queryParams(pageNumber = search.pageNumber, pageSize = search.pageSize): Record<string, unknown> {
      return {
        pageNumber,
        pageSize,
        keyword: search.keyword || undefined,
        source: search.source === "organization" ? "EMPLOYEE_MANAGEMENT" : undefined,
        organizationId: search.organization || undefined,
        bound: search.binding ? search.binding === "bound" : undefined,
      };
    }

    function writeQuery(): void {
      const { total: _ignoreTotal, ...values } = search;
      void router.replace({
        query: Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value === "" ? undefined : String(value)])),
      });
    }
    function refresh(): void {
      tableApi.query();
    }
    function locate(person: PositioningPerson): void {
      if (!isBound(person) && !store.history(person.id).length) return;
      void router.push({
        name: isBound(person) ? "person-detail" : "trajectory",
        params: { id: person.id },
        query: { returnTo: route.fullPath },
      });
    }

    const { BindingModal, open: openBinding } = useBindingModal(refresh);
    const { UnbindModal, open: openUnbind } = useUnbindModal(refresh);
    const { SourceProfileModal, open: openProfile } = useSourceProfileModal();
    const { SourcePeopleModal, open: openAcquire } = useSourcePeopleModal(() => {
      search.pageNumber = 1;
      writeQuery();
      refresh();
    });

    const renderText = (value: unknown, className?: string) => {
      const text = String(value || "—");
      return (
        <span class={["pp-cell-ellipsis", className]} title={text}>
          {text}
        </span>
      );
    };

    const columns = [
      {
        title: "人员编号",
        dataIndex: "personNumber",
        width: 160,
        customRender: ({ text }: { text: unknown }) => renderText(text, "pp-monospace"),
      },
      { title: "姓名", dataIndex: "name", width: 110, customRender: ({ text }: { text: unknown }) => renderText(text) },
      {
        title: "人员类型",
        dataIndex: "personType",
        width: 100,
        customRender: ({ record }: { record: PositioningPerson }) => (
          <Tag color={PERSON_SOURCES[record.source].color}>{PERSON_SOURCES[record.source].personType}</Tag>
        ),
      },
      {
        title: "来源应用",
        dataIndex: "source",
        width: 120,
        customRender: ({ record }: { record: PositioningPerson }) => renderText(PERSON_SOURCES[record.source].label),
      },
      { title: "所属组织", dataIndex: "organization", width: 170, customRender: ({ text }: { text: unknown }) => renderText(text) },
      {
        title: "绑定终端",
        dataIndex: "terminal",
        width: 190,
        customRender: ({ record }: { record: PositioningPerson }) => {
          const binding = store.currentBinding(record.id);
          const device = store.state.devices.find((item) => item.id === binding?.terminalId);
          const terminalNumber = isBound(record) ? device?.deviceNumber || binding?.terminalNumber || record.deviceNumber : undefined;
          return terminalNumber ? (
            <span class="pp-terminal-cell" title={terminalNumber}>
              <span class="pp-cell-ellipsis pp-monospace">{terminalNumber}</span>
              {device && !device.enabled && <Tag>停用</Tag>}
            </span>
          ) : (
            <span class="pp-muted">—</span>
          );
        },
      },
      {
        title: "绑定状态",
        dataIndex: "binding",
        width: 100,
        customRender: ({ record }: { record: PositioningPerson }) => (
          <Tag color={isBound(record) ? "green" : "default"}>{isBound(record) ? "已绑定" : "未绑定"}</Tag>
        ),
      },
      {
        title: "操作",
        dataIndex: "actions",
        width: 290,
        customRender: ({ record }: { record: PositioningPerson }) => {
          const bound = isBound(record);
          const hasHistory = store.history(record.id).length > 0;
          return (
            <div class="pp-actions">
              {bound || hasHistory ? (
                <Button type="link" size="small" onClick={() => locate(record)}>
                  {bound ? "查看定位" : "历史轨迹"}
                </Button>
              ) : (
                <span title="尚未绑定过终端，暂无定位记录">
                  <Button type="link" size="small" disabled>
                    暂无定位
                  </Button>
                </span>
              )}
              <Button type="link" size="small" onClick={() => openBinding(record)}>
                {bound ? "更换终端" : "绑定终端"}
              </Button>
              {bound && (
                <Button type="link" size="small" danger onClick={() => openUnbind(record)}>
                  解绑
                </Button>
              )}
              <Button type="link" size="small" onClick={() => openProfile(record)}>
                来源档案
              </Button>
            </div>
          );
        },
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      tableCode: "PERSONNEL_POSITIONING_OBJECTS",
      rowKey: "id",
      autoFetch: false,
      columns,
      fetchApi: () => store.queryPersons(queryParams()),
      fetchLoaded: (result) => {
        search.total = result.total;
      },
    });

    const organizations = computed(() => {
      const options = new Map<string, string>();
      store.state.persons.forEach((person) => {
        if (person.organizationId !== undefined) options.set(String(person.organizationId), person.organization);
      });
      return [...options].map(([value, label]) => ({ value, label }));
    });
    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      isCollapsed: false,
      cache: false,
      schema: [
        {
          component: "Input",
          fieldName: "keyword",
          label: "关键词",
          componentProps: { placeholder: "姓名、人员编号、来源编号", allowClear: true },
        },
        {
          component: "Select",
          fieldName: "source",
          label: "来源应用",
          componentProps: { placeholder: "全部", allowClear: true, showSearch: true, options: SOURCE_OPTIONS, onChange: () => undefined },
        },
        {
          component: "Select",
          fieldName: "organization",
          label: "所属组织",
          componentProps: {
            placeholder: "全部",
            allowClear: true,
            showSearch: true,
            options: organizations.value,
            onChange: () => undefined,
          },
        },
        {
          component: "Select",
          fieldName: "binding",
          label: "绑定状态",
          componentProps: { placeholder: "全部", allowClear: true, options: optionsOf(BINDING_STATES), onChange: () => undefined },
        },
      ],
      handleSubmit: (values) => {
        for (const key of ["keyword", "source", "organization", "binding"] as const) {
          search[key] = String(values[key] ?? "");
        }
        search.pageNumber = 1;
        writeQuery();
        refresh();
      },
      handleReset: () => {
        Object.assign(search, { keyword: "", source: "", organization: "", binding: "", pageNumber: 1 });
        writeQuery();
        refresh();
      },
    });
    formApi.setFormValues({
      keyword: search.keyword,
      source: search.source || undefined,
      organization: search.organization || undefined,
      binding: search.binding || undefined,
    });

    function changePage(pageNumber: number, pageSize: number): void {
      search.pageNumber = pageNumber;
      search.pageSize = pageSize;
      writeQuery();
      refresh();
    }
    async function exportRows(): Promise<void> {
      const result = await store.queryPersons(queryParams(1, 10000));
      if (!result.records.length) {
        message.info("当前筛选条件下没有可导出的人员");
        return;
      }
      downloadCsv("定位对象.csv", [
        ["人员编号", "姓名", "人员类型", "来源应用", "来源人员编号", "所属组织", "岗位", "绑定终端", "绑定状态"],
        ...result.records.map((person) => [
          person.personNumber || person.id,
          person.name,
          PERSON_SOURCES[person.source].personType,
          PERSON_SOURCES[person.source].label,
          person.sourceId,
          person.organization,
          person.post,
          store.currentBinding(person.id)?.terminalNumber || person.deviceNumber || "",
          isBound(person) ? "已绑定" : "未绑定",
        ]),
      ]);
      message.success(`已导出 ${result.records.length} 名定位对象`);
    }

    onMounted(() => {
      void store
        .refreshPersons()
        .then(() => {
          formApi.updateFieldSchema({
            component: "Select",
            fieldName: "organization",
            label: "所属组织",
            componentProps: {
              placeholder: "全部",
              allowClear: true,
              showSearch: true,
              options: organizations.value,
              onChange: () => undefined,
            },
          });
          refresh();
        })
        .catch((error: unknown) => message.error((error as Error).message));
    });

    return () => (
      <CubeLayout
        title="定位对象"
        class="pp-object-list"
        showTableXScroll
        v-slots={{
          "layout-header": () => (
            <Space>
              <Button onClick={() => void exportRows()}>
                <DownloadOutlined />
                导出
              </Button>
              <Button type="primary" onClick={openAcquire}>
                <PlusOutlined />
                从来源应用获取人员
              </Button>
            </Space>
          ),
          "layout-content": () => (
            <>
              <div class="pp-summary-strip">
                <span>
                  定位对象 <strong>{summary.value.total}</strong> 人
                </span>
                <span>
                  已绑定 <strong>{summary.value.bound}</strong> 人
                </span>
                <span>
                  未绑定 <strong>{summary.value.total - summary.value.bound}</strong> 人
                </span>
              </div>
              <CubeForm />
              <CubeTable />
            </>
          ),
          "footer-page": () => (
            <Page current={search.pageNumber} pageSize={search.pageSize} total={search.total} syncToUrl={false} onPageChange={changePage} />
          ),
          default: () => (
            <>
              <SourcePeopleModal />
              <BindingModal />
              <UnbindModal />
              <SourceProfileModal />
            </>
          ),
        }}
      />
    );
  },
});
