import dayjs from "dayjs";
import { defineComponent, ref, reactive } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { FormFlowDetailVO } from "@ghcloud/cube-form-audit-service";
import { Button, PopOver, PopConfirm, message, Page, Select, Switch } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { WorkOrderShareModal } from "./work-order-share-modal";
import { cubeFormAuditService } from "@/api/service";
import { FormGroupTree, type FormGroupSelectMeta } from "@/components/form-group-tree/form-group-tree";
import { getCurrentApplicationCode } from "@/utils/current-application";

import styles from "./form-audit-config.module.less";

export const FormAuditConfig = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const placeSelectRef = ref();
    const tableCode = route.path.replaceAll("/", "");
    const typeId = ref<string | number | undefined>("");
    const canAddForm = ref(false);
    const lastQueryGroupId = ref<string | undefined>(undefined);
    const shareModalRef = ref<{ openModal: (record: FormFlowDetailVO) => void }>();

    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });
    let searchFormSchema = [
      {
        component: Select,
        label: "启用",
        fieldName: "enable",
        componentProps: {
          placeholder: "是否启用",
          options: [
            { value: "true", label: "已启用" },
            { value: "false", label: "已禁用" },
          ],
        },
      },
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "表单名称",
        },
      },
    ];

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      handleSubmit: () => {
        tableApi.query();
      },
      handleReset: () => {
        tableApi.query();
      },
      schema: searchFormSchema,
      showCollapseButton: true,
    });
    const columns = [
      {
        title: "序号",
        dataIndex: "",
        ellipsis: true,
        align: "center",
        width: 70,
        customRender: ({ index }: { index: number }): JSX.Element => {
          return <PopOver content={index + 1 || "--"}>{index + 1 || "--"}</PopOver>;
        },
      },
      {
        title: "名称",
        dataIndex: "name",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "分组",
        dataIndex: "formGroupName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "说明",
        dataIndex: "remark",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "最后更新",
        dataIndex: "updateTime",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: number }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        title: "开关",
        dataIndex: "enable",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: FormFlowDetailVO }): JSX.Element => {
          return (
            <Switch
              v-model:value={record.enable}
              checkedChildren="启用"
              unCheckedChildren="禁用"
              onChange={(val) => {
                handleSwitch(val, record);
              }}
            />
          );
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        slots: {
          customRender: "action",
        },
        width: 250,
        align: "center",
        customRender: ({ record }: { record: FormFlowDetailVO }): JSX.Element => {
          return (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  handleEditRow(record);
                }}
              >
                编辑
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  handleCopyRow(record);
                }}
              >
                复制
              </Button>
              {record.publicForm === 1 && record.status === "IN_USE" && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    handleShare(record);
                  }}
                >
                  分享
                </Button>
              )}
              <PopConfirm
                title="确认删除该项？"
                onConfirm={() => {
                  deleteRow(record);
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
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: "id",
      fetchApi: async () => {
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          fromGroupId: typeId.value == "0" ? undefined : (typeId.value ?? undefined),
          keyword: (formApi.formValues.keyword as string) ?? undefined,
          enable: (formApi.formValues.enable as boolean) ?? undefined,
          application: getCurrentApplicationCode(),
        };
        return cubeFormAuditService.getFormFlowPageList(params);
      },
      fetchLoaded: (data) => {
        page.total = data.total;
      },
    });

    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber;
      page.pageSize = pageSize;
      tableApi.query();
    };

    const handleAdd = (): void => {
      if (!canAddForm.value) {
        message.warning("请选择二级分组后再新增表单");
        return;
      }
      const returnUrl = encodeURIComponent(window.location.href);
      const designUrl = "/portal/flow-engine/admin/workOrderDesign?type=CUSTOM_FORM&returnUrl=" + returnUrl;
      window.location.href = designUrl;
    };

    const handleEditRow = (record: FormFlowDetailVO): void => {
      if (!record.id) {
        return;
      }
      const returnUrl = encodeURIComponent(window.location.href);
      const designUrl = "/portal/flow-engine/admin/workOrderDesign?type=CUSTOM_FORM&id=" + record.id + "&returnUrl=" + returnUrl;
      window.location.href = designUrl;
    };

    const handleSwitch = async (enable: boolean, record: FormFlowDetailVO): Promise<void> => {
      try {
        await cubeFormAuditService.updateFormFlowEnable({ id: record.id, enable });
        message.success("操作成功");
      } catch {
        message.error("操作失败");
      }
    };

    const handleShare = async (record: FormFlowDetailVO): Promise<void> => {
      shareModalRef.value?.openModal(record);
    };

    const handleCopyRow = (record: FormFlowDetailVO): void => {
      if (!record.id) {
        return;
      }
      const returnUrl = encodeURIComponent(window.location.href);
      const designUrl =
        "/portal/flow-engine/admin/workOrderDesign?type=CUSTOM_FORM&isCopy=true&id=" + record.id + "&returnUrl=" + returnUrl;
      window.location.href = designUrl;
    };

    const deleteRow = async (record: FormFlowDetailVO): Promise<void> => {
      try {
        await cubeFormAuditService.deleteFormFlow(record.id);
        placeSelectRef.value?.getTypeData();
        message.success("操作成功");
        tableApi.query();
      } catch {
        message.error("操作失败");
      }
    };

    const formGroupSelect = (id: string | number | undefined, meta?: FormGroupSelectMeta): void => {
      const nextGroupId = id === "0" || id === 0 || id === undefined ? undefined : String(id);
      page.pageNumber = 1;
      typeId.value = id;
      canAddForm.value = meta?.canAddForm ?? false;
      if (lastQueryGroupId.value === nextGroupId) {
        return;
      }
      lastQueryGroupId.value = nextGroupId;
      tableApi.query();
    };
    const slots = {
      "layout-header": (): JSX.Element => {
        return (
          <div class={styles["layout-header-item"]}>
            <Button type="primary" disabled={!canAddForm.value} onClick={handleAdd}>
              新增
            </Button>
          </div>
        );
      },
      "layout-content": (): JSX.Element => {
        return (
          <div class={styles["layout-content-main"]}>
            <div class={styles["main-left"]}>
              <FormGroupTree title={"表单分组"} ref={placeSelectRef} onSelect={formGroupSelect} />
            </div>
            <div class={styles["main-right"]}>
              <CubeForm />
              <CubeTable />
            </div>
          </div>
        );
      },
      "footer-page": (): JSX.Element => {
        return <Page current={page.pageNumber} pageSize={page.pageSize} total={page.total} onPageChange={handleChange} />;
      },
    };
    return (): JSX.Element => (
      <>
        <CubeLayout title={pageTitle ?? "工单配置"} v-slots={slots}></CubeLayout>
        <WorkOrderShareModal title={"工单分享"} ref={shareModalRef} />
      </>
    );
  },
});
