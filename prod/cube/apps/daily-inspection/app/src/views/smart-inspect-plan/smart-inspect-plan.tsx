import dayjs from "dayjs";
import { defineComponent, onMounted, reactive } from "vue";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { PlanStatusColor, PlanStatusMap, PlanStatusOptions } from "@ghcloud/cube-daily-inspection-service";
import { Button, AntModal, Page, PopConfirm, PopOver, Switch, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeDailyInspectionService } from "@/api/server";
import {
  getSmartExecutorLabel,
  getSmartTargetCategories,
  getSmartTargetDisplayItems,
  getSmartTargetLabel,
  SMART_INSPECT_PLAN_TABLE_CODE,
  SMART_INSPECT_PORTAL_PREFIX,
  smartInspectTargetCategoryOptions,
  type SmartInspectTargetCategory,
} from "@/views/smart-inspect-common/types";

import pageStyles from "@/views/smart-inspect-common/smart-inspect-page.module.less";

const formatTime = (value: unknown): string => {
  if (!value) return "--";
  return dayjs(value as string | number | Date).format("YYYY-MM-DD HH:mm:ss");
};

const renderText = (value: unknown): JSX.Element => {
  const text = value ? String(value) : "--";
  return <PopOver content={text}>{text}</PopOver>;
};

const renderTargetTags = (record: Record<string, unknown>): JSX.Element => {
  const items = getSmartTargetDisplayItems(record);
  if (!items.length) return renderText(getSmartTargetLabel(record));
  return (
    <span class={pageStyles["target-tags"]}>
      {items.map((item) => (
        <span
          key={item.key}
          class={pageStyles["target-tag"]}
          style={{
            color: item.color,
          }}
        >
          {item.label}
        </span>
      ))}
    </span>
  );
};

export const SmartInspectPlan = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      status: "",
      typeId: "",
      keyword: "",
      targetCategory: "" as "" | SmartInspectTargetCategory,
      total: 0,
    });

    const columns = [
      {
        dataIndex: "name",
        title: "计划名称",
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => renderText(text),
      },
      {
        dataIndex: "typeName",
        title: "巡检类型",
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => renderText(text),
      },
      {
        dataIndex: "targetCategory",
        title: "巡检对象类型",
        align: "center",
        ellipsis: true,
        customRender: ({ record }: { record: Record<string, unknown> }): JSX.Element => renderTargetTags(record),
      },
      {
        dataIndex: "executor",
        title: "执行人或设备",
        align: "center",
        ellipsis: true,
        customRender: ({ record }: { record: Record<string, unknown> }): JSX.Element => renderText(getSmartExecutorLabel(record)),
      },
      {
        dataIndex: "cycleText",
        title: "周期",
        align: "center",
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: Record<string, unknown> }): JSX.Element => {
          const fallback = record.cycle ? "周期执行" : "立即执行";
          return renderText(text || fallback);
        },
      },
      {
        dataIndex: "targetNum",
        title: "巡检对象数",
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => renderText(text),
      },
      {
        dataIndex: "validEndTime",
        title: "失效时间",
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: number }): JSX.Element => renderText(formatTime(text)),
      },
      {
        dataIndex: "status",
        title: "状态",
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const textVal = text ? PlanStatusMap.get(text) : "";
          return (
            <PopOver content={textVal || "--"}>
              <span style={{ color: PlanStatusColor.get(text || "") }}>{textVal || "--"}</span>
            </PopOver>
          );
        },
      },
      {
        dataIndex: "createByName",
        title: "创建人",
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => renderText(text),
      },
      {
        dataIndex: "createTime",
        title: "创建时间",
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: number }): JSX.Element => renderText(formatTime(text)),
      },
      {
        dataIndex: "enable",
        title: "停用/启用",
        align: "center",
        fixed: "right",
        width: 120,
        customRender: ({ record }: { record: Record<string, unknown> & { enable?: boolean; name: string; id: string } }): JSX.Element => (
          <Switch
            v-model:checked={record.enable}
            checkedValue
            unCheckedValue={false}
            onChange={() => {
              AntModal.confirm({
                title: `是否确认${record.enable ? "启用" : "禁用"}计划${record.name}`,
                onOk: async () => {
                  try {
                    await cubeDailyInspectionService.updatePlanStatus({
                      id: record.id,
                      startFlag: Boolean(record.enable),
                    });
                    message.success(`${record.enable ? "启用" : "禁用"}成功`);
                    tableApi.query();
                  } catch (error) {
                    const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
                    message.error(errorMessage || "请求失败");
                  }
                },
                onCancel: () => {
                  record.enable = !record.enable;
                },
              });
            }}
            checked-children="启用"
            un-checked-children="禁用"
          />
        ),
      },
      {
        dataIndex: "action",
        title: "操作",
        align: "center",
        fixed: "right",
        width: 220,
        customRender: ({ record }: { record: Record<string, string> }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                history.pushState({}, "", `${SMART_INSPECT_PORTAL_PREFIX}/smart-inspect-plan-info?id=${record.id}`);
              }}
            >
              详情
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                history.pushState({}, "", `${SMART_INSPECT_PORTAL_PREFIX}/smart-inspect-plan-edit?type=edit&id=${record.id}`);
              }}
            >
              编辑
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                history.pushState({}, "", `${SMART_INSPECT_PORTAL_PREFIX}/smart-inspect-plan-edit?type=copy&id=${record.id}`);
              }}
            >
              复制
            </Button>
            <PopConfirm
              title="确认删除该项？"
              onConfirm={async () => {
                try {
                  await cubeDailyInspectionService.deleteInspectPlan(record.id);
                  message.success("删除成功");
                  tableApi.query();
                } catch (error) {
                  const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
                  message.error(errorMessage || "请求失败");
                }
              }}
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </PopConfirm>
          </>
        ),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode: SMART_INSPECT_PLAN_TABLE_CODE,
      rowKey: "id",
      fetchApi: async () => {
        const targetCategory = searchParams.targetCategory;
        const result = await cubeDailyInspectionService.getInspectPlanList({
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          status: searchParams.status,
          keywords: searchParams.keyword,
          typeId: searchParams.typeId,
        });
        // pageV2 暂不支持自动巡检对象类型过滤，先按当前页 inspectionMode 做客户端过滤。
        if (targetCategory === "DRONE" || targetCategory === "ROBOT_DOG") {
          const autoRecords = result.records.filter((item) => getSmartTargetCategories(item).includes(targetCategory));
          return { ...result, records: autoRecords, total: autoRecords.length };
        }
        return result;
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total;
      },
    });

    const handleChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber;
      searchParams.pageSize = pageSize;
      tableApi.query();
    };

    const formSchema = [
      {
        component: "Select",
        label: "状态",
        fieldName: "status",
        defaultValue: "",
        componentProps: {
          allowClear: true,
          options: [
            { label: "全部", value: "" },
            ...Object.keys(PlanStatusOptions).map((item) => ({
              label: PlanStatusOptions[item as keyof typeof PlanStatusOptions],
              value: item,
            })),
          ],
          onChange: (value: string): void => {
            searchParams.pageNumber = 1;
            searchParams.status = value;
            tableApi.query();
          },
        },
      },
      {
        component: "Select",
        label: "对象类型",
        fieldName: "targetCategory",
        defaultValue: "",
        componentProps: {
          allowClear: true,
          options: smartInspectTargetCategoryOptions,
          onChange: (value: "" | SmartInspectTargetCategory): void => {
            searchParams.pageNumber = 1;
            searchParams.targetCategory = value || "";
            tableApi.query();
          },
        },
      },
      {
        component: "Select",
        label: "巡检类型",
        fieldName: "typeId",
        componentProps: {},
      },
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "计划名称",
        },
      },
    ];

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
      handleSubmit: (data) => {
        searchParams.keyword = data.keyword ? (data.keyword as string) : "";
        searchParams.targetCategory = data.targetCategory ? (data.targetCategory as SmartInspectTargetCategory) : "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.pageNumber = 1;
        searchParams.keyword = "";
        searchParams.status = "";
        searchParams.typeId = "";
        searchParams.targetCategory = "";
        tableApi.query();
      },
      schema: formSchema,
      showCollapseButton: true,
    });

    onMounted(async () => {
      const result = await cubeDailyInspectionService.getInspectTypeList();
      formApi.updateFieldSchema({
        component: "Select",
        label: "巡检类型",
        fieldName: "typeId",
        defaultValue: "",
        componentProps: {
          options: result,
          placeholder: "请选择",
          allowClear: true,
          fieldNames: { label: "name", value: "id" },
          onChange: (value: string): void => {
            searchParams.pageNumber = 1;
            searchParams.typeId = value;
            tableApi.query();
          },
        },
      });
      formApi.formValues.typeId = searchParams.typeId;
    });

    const slots = {
      "layout-header": (): JSX.Element => (
        <Button
          type="primary"
          onClick={() => {
            history.pushState({}, "", `${SMART_INSPECT_PORTAL_PREFIX}/smart-inspect-plan-edit?type=create`);
          }}
        >
          新增
        </Button>
      ),
      "layout-content": (): JSX.Element => (
        <div>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          current={searchParams.pageNumber}
          pageSize={searchParams.pageSize}
          total={searchParams.total}
          showQuickJumper={false}
          showSizeChanger
          showTotal={(total: number) => `总共 ${total} 条数据`}
          pageSizeOptions={["10", "20", "50", "100"]}
          onPageChange={handleChange}
        />
      ),
    };

    return (): JSX.Element => <CubeLayout title={pageTitle || "巡检计划"} v-slots={slots} showTableXScroll />;
  },
});
