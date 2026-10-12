import { computed, defineComponent, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, InspectStandardModalTable, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { InspectBusinessType } from "@ghcloud/cube-daily-inspection-service";
import { Button, Empty, InputSearch, PopOver, Page, PopConfirm, message, Spin, Switch, TabPane, Tabs } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import {
  cubeAssetManagementService,
  cubeDailyInspectionService,
  cubeDeviceCenterService,
  cubeMaintainService,
  cubeMdataService,
  cubeRiskTypeService,
  cubeSmallEngineeringService,
} from "@/api/server";
import { filterEmptyValues } from "@/hook/utils";

import styles from "./inspect-standard.module.less";

type TargetCategory = "DEVICE" | "STALL" | "PROPERTY" | "SITE_POINT" | "RISK_SOURCE" | "SMALL_ENGINEERING";

interface ObjectNode {
  id: string;
  name: string;
  children?: ObjectNode[];
}

interface SourceNode {
  id?: string | number;
  name?: string;
  categoryName?: string;
  categoryCode?: string;
  categoryCodeConcat?: string;
  children?: SourceNode[];
  nextList?: SourceNode[];
}

const tabList: { key: TargetCategory; name: string }[] = [
  { key: "DEVICE", name: "设备" },
  { key: "STALL", name: "档位" },
  { key: "PROPERTY", name: "资产" },
  { key: "SITE_POINT", name: "现场点" },
  { key: "RISK_SOURCE", name: "风险源" },
  { key: "SMALL_ENGINEERING", name: "小散工程" },
];

const mapNodes = (list: SourceNode[] = [], childrenField: "children" | "nextList" = "children"): ObjectNode[] => {
  return list
    .map((item) => {
      const children = item[childrenField]?.length ? mapNodes(item[childrenField], childrenField) : [];
      return {
        id: String(item.id ?? item.categoryCodeConcat ?? item.categoryCode ?? ""),
        name: item.name ?? item.categoryName ?? "--",
        ...(children.length ? { children } : {}),
      };
    })
    .filter((item) => item.id);
};

const filterNodes = (list: ObjectNode[], keyword: string): ObjectNode[] => {
  if (!keyword) return list;
  return list
    .map((item) => {
      const children = item.children ? filterNodes(item.children, keyword) : [];
      if (item.name.includes(keyword) || children.length) {
        return { ...item, children };
      }
      return null;
    })
    .filter(Boolean) as ObjectNode[];
};

export const InspectStandard = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      keyword: "",
      targetType: "",
    });

    const targetType = ref(searchParams.targetType);
    const targetCategory = ref<TargetCategory>("DEVICE");
    const leftKeyword = ref("");
    const leftLoading = ref(false);
    const objectData = ref<ObjectNode[]>([]);
    const visibleTabs = ref<TargetCategory[]>(tabList.map((item) => item.key));

    const searchFormSchema = [
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "巡检标准",
        },
      },
    ];
    const [CubeForm, formApi] = useCubeForm({
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
      layout: "horizontal",
      handleSubmit: (data) => {
        searchParams.keyword = data.keyword ? (data.keyword as string) : "";
        searchParams.pageNumber = 1;
        page.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.keyword = "";
        searchParams.pageNumber = 1;
        page.pageNumber = 1;
        tableApi.query();
      },
      schema: searchFormSchema,
      showCollapseButton: true,
    });

    const columns = [
      {
        title: "巡检标准",
        dataIndex: "name",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "设为默认巡检标准",
        dataIndex: "defaultStandard",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: { defaultStandard: boolean; id: string } }): JSX.Element => {
          return (
            <Switch
              v-model:checked={record.defaultStandard}
              class={styles["default-switch"]}
              checked-children="启用"
              un-checked-children="停用"
              onChange={async (e) => handleSwitch(e, record)}
            />
          );
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        slots: {
          customRender: "action",
        },
        fixed: "right",
        width: 180,
        customRender: ({ record }: { record: { id: string } }): JSX.Element => {
          return (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  detailRow(record.id);
                }}
              >
                详情
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  editRow(record.id);
                }}
              >
                编辑
              </Button>
              <PopConfirm
                title="确认删除该项？"
                onConfirm={() => {
                  deleteRow(record.id);
                }}
              >
                <Button type="link" size="small" danger>
                  删除
                </Button>
              </PopConfirm>
            </>
          );
        },
      },
    ];
    const page = reactive({
      pageNumber: searchParams.pageNumber,
      pageSize: searchParams.pageSize,
      total: 0,
    });
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: "id",
      fetchApi: async () => {
        const params = {
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          keyword: searchParams.keyword,
          targetTypeEq: true,
          targetType: targetType.value as string,
          businessType: InspectBusinessType.DAILY_INSPECTION,
        };
        return cubeDailyInspectionService.getInspectStandardPage(filterEmptyValues(params));
      },
      fetchLoaded: (data) => {
        page.total = data.total;
        page.pageNumber = searchParams.pageNumber;
        page.pageSize = searchParams.pageSize;
      },
    });
    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber;
      page.pageSize = pageSize;
      searchParams.pageNumber = pageNumber;
      searchParams.pageSize = pageSize;
      tableApi.query();
    };
    const handleAdd = (): void => {
      history.pushState({ current: location.pathname + location.search }, "", "/portal/daily-inspection/inspect-standard-form?type=add");
    };
    const handleAiGenerate = (): void => {
      history.pushState({ current: location.pathname + location.search }, "", "/portal/daily-inspection/inspect-standard-ai");
    };
    const editRow = (id: string): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/daily-inspection/inspect-standard-form?type=edit&id=${id}`,
      );
    };
    const detailRow = (id: string): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/daily-inspection/inspect-standard-form?type=detail&id=${id}`,
      );
    };
    const handleSwitch = async (enable: boolean, record: { defaultStandard: boolean; id: string }): Promise<void> => {
      if (!record?.id) return;
      if (!targetType.value) {
        message.warning("请选择关联标准");
        record.defaultStandard = !enable;
        return;
      }
      try {
        const params = {
          defaultStandard: Number(enable),
          standardId: record?.id,
          targetType: targetType.value + "",
          targetCategory: targetCategory.value,
          businessType: InspectBusinessType.DAILY_INSPECTION,
        };
        await cubeDailyInspectionService.setDefaultStandard(params);
        message.success("操作成功");
        tableApi.query();
      } catch (error) {
        record.defaultStandard = !enable;
        message.error((error as { errorMessage: string })?.errorMessage ?? "操作失败");
      }
    };
    const deleteRow = async (id: string): Promise<void> => {
      try {
        await cubeDailyInspectionService.deleteInspectStandard(id, { businessType: InspectBusinessType.DAILY_INSPECTION });
        message.success("操作成功");
        tableApi.query();
      } catch (error) {
        message.error((error as { errorMessage: string })?.errorMessage ?? "操作失败");
      }
    };
    const queryObjectData = async (): Promise<void> => {
      leftLoading.value = true;
      try {
        switch (targetCategory.value) {
          case "DEVICE": {
            const res = await cubeDeviceCenterService.getIotProductCategoryTree();
            objectData.value = filterNodes(mapNodes(res as unknown as SourceNode[], "children"), leftKeyword.value);
            break;
          }
          case "STALL": {
            const res = await cubeMdataService.stallTypeList({ enabled: true });
            objectData.value = filterNodes(mapNodes(res as unknown as SourceNode[]), leftKeyword.value);
            break;
          }
          case "PROPERTY": {
            const res = await cubeAssetManagementService.getAssemblyClassifyPage({ pageNumber: 1, pageSize: 1000, type: "assetType" });
            objectData.value = filterNodes(mapNodes((res?.records ?? []) as SourceNode[]), leftKeyword.value);
            break;
          }
          case "SITE_POINT": {
            const res = await cubeMaintainService.inspectPointTypeList();
            objectData.value = filterNodes(mapNodes(res as unknown as SourceNode[]), leftKeyword.value);
            break;
          }
          case "RISK_SOURCE": {
            const res = await cubeRiskTypeService.getRiskSourceType({ itemCode: "risk-source-type", pageNumber: 1, pageSize: 1000 });
            objectData.value = filterNodes(mapNodes(res as unknown as SourceNode[], "nextList"), leftKeyword.value);
            break;
          }
          case "SMALL_ENGINEERING": {
            const res = await cubeSmallEngineeringService.getProjectTypeList({ name: leftKeyword.value });
            objectData.value = filterNodes(mapNodes(res as unknown as SourceNode[]), leftKeyword.value);
            break;
          }
        }
      } catch {
        objectData.value = [];
      } finally {
        leftLoading.value = false;
      }
    };
    const handleSelectObject = (item: ObjectNode): void => {
      const nextSelected = targetType.value !== item.id;
      targetType.value = nextSelected ? item.id : "";
      searchParams.targetType = targetType.value;
      tableApi.query();
    };
    const handleRelation = (item: ObjectNode): void => {
      targetType.value = item.id;
      searchParams.targetType = targetType.value;
      inspectStandardModalTableRef.value?.openModal(item.id, item.name, targetCategory.value);
    };
    const renderObjectNodes = (items: ObjectNode[], level = 0): JSX.Element => {
      return (
        <ul class={styles["object-list"]}>
          {items.map((item) => (
            <li key={item.id}>
              <div
                class={[styles["object-item"], targetType.value === item.id && styles.active]}
                style={{ paddingLeft: `${8 + level * 12}px` }}
                onClick={() => handleSelectObject(item)}
              >
                <span class={styles["object-name"]} title={item.name}>
                  {item.name}
                </span>
                <Button
                  type="link"
                  size="small"
                  onClick={(event: Event) => {
                    event.stopPropagation();
                    handleRelation(item);
                  }}
                >
                  关联标准
                </Button>
              </div>
              {item.children?.length ? renderObjectNodes(item.children, level + 1) : null}
            </li>
          ))}
        </ul>
      );
    };
    watch(targetCategory, () => {
      targetType.value = "";
      searchParams.targetType = "";
      leftKeyword.value = "";
      queryObjectData();
      tableApi.query();
    });
    onMounted(() => {
      queryObjectData();
    });
    const inspectStandardModalTableRef = ref<{ openModal: (type: string, name: string, category?: string) => void }>();
    const objectPanel = computed(() => (
      <div class={styles["object-panel"]}>
        <InputSearch
          v-model:value={leftKeyword.value}
          allowClear
          placeholder="请输入关键字"
          onSearch={queryObjectData}
          class={styles["left-search"]}
        />
        <Tabs v-model:activeKey={targetCategory.value} class={styles["object-tabs"]}>
          {tabList
            .filter((item) => visibleTabs.value.includes(item.key))
            .map((item) => (
              <TabPane key={item.key} tab={item.name}>
                <Spin spinning={leftLoading.value}>{objectData.value.length ? renderObjectNodes(objectData.value) : <Empty />}</Spin>
              </TabPane>
            ))}
        </Tabs>
      </div>
    ));
    const slots = {
      "layout-header": (): JSX.Element => {
        return (
          <div class={styles["header-actions"]}>
            <Button onClick={handleAiGenerate}>AI自动生成</Button>
            <Button type="primary" onClick={handleAdd}>
              新增
            </Button>
          </div>
        );
      },
      "layout-content": (): JSX.Element => {
        return (
          <>
            <div class={styles["page-flex"]}>
              <div class={styles["page-left"]}>{objectPanel.value}</div>
              <div class={styles["page-right"]}>
                <div class={styles["section-title"]}>列表名称</div>
                <div class={styles["table-search"]}>
                  <CubeForm />
                </div>
                <CubeTable />
              </div>
            </div>
          </>
        );
      },
      "footer-page": (): JSX.Element => {
        return <Page current={page.pageNumber} pageSize={page.pageSize} total={page.total} onPageChange={handleChange} />;
      },
    };
    return (): JSX.Element => (
      <>
        <CubeLayout title={pageTitle} v-slots={slots} />
        <InspectStandardModalTable
          ref={inspectStandardModalTableRef}
          businessType={InspectBusinessType.DAILY_INSPECTION}
          onEnter={() => {
            tableApi.query();
          }}
        />
      </>
    );
  },
});
