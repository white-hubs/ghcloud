import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout, useCubeForm } from "@ghcloud/cube-app-design";
import type { BusinessTagModel } from "@ghcloud/cube-business-tag-service";
import { hasPermission } from "@ghcloud/cube-permission-codes";
import { Button, PopOver, PopConfirm, message, Table, DateRangePicker } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { TagEditModal } from "./tag-edit-modal";
import { cubeBusinessTagService } from "@/api/server";
import { TagAssociatedObjectSelectModal } from "@/components/tag-associated-object-select/tag-associated-object-select-modal";
import { appFunctionCodes } from "@/permission/index";

import styles from "./tag-list.module.less";

export const TagList = defineComponent({
  setup: () => {
    const permission = appFunctionCodes.businessTag ?? null;
    const hasAddPermission = permission && hasPermission(permission.add);
    const hasEditPermission = permission && hasPermission(permission.edit);
    const hasDeletedPermission = permission && hasPermission(permission.deleted);

    const { pageTitle } = usePageName();
    const router = useRouter();
    const searchFormSchema = [
      {
        component: DateRangePicker,
        label: "时间范围",
        fieldName: "period",
        defaultValue: null,
      },
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "标签名称",
        },
      },
    ];

    const searchParams = reactive({
      keyword: "",
      period: null as string | null,
    });

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      schema: searchFormSchema,
      showCollapseButton: true,
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        getDataSource();
      },
      handleSubmit: (data) => {
        searchParams.keyword = (data.keyword as string) ?? "";
        searchParams.period = data.period ? (data.period as [string, string]).join(",") : null;
        getDataSource();
      },
      handleReset: () => {
        searchParams.keyword = "";
        searchParams.period = null;
        getDataSource();
      },
    });

    const columns = [
      {
        title: "标签名称",
        dataIndex: "name",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "标签描述",
        dataIndex: "description",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "编辑时间",
        dataIndex: "updateTime",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = dayjs(text).format("YYYY-MM-DD HH:mm:ss");
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        slots: {
          customRender: "action",
        },
        width: 250,
        customRender: ({ record }: { record: BusinessTagModel }): JSX.Element => (
          <>
            {canAddSub(record) && hasAddPermission && (
              <Button
                type="link"
                size="small"
                onClick={() => {
                  handleAddSub(record);
                }}
              >
                新增下级
              </Button>
            )}
            {hasEditPermission && (
              <Button
                type="link"
                size="small"
                onClick={() => {
                  editRow(record);
                }}
              >
                编辑
              </Button>
            )}
            {hasEditPermission && (
              <Button
                type="link"
                size="small"
                onClick={() => {
                  handleAssociate(record);
                }}
              >
                标签关联
              </Button>
            )}
            <Button
              type="link"
              size="small"
              onClick={() => {
                handleDetails(record);
              }}
            >
              详情
            </Button>
            {hasDeletedPermission && (
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
            )}
          </>
        ),
      },
    ];

    // 最多新增3级标签
    const canAddSub = (record: BusinessTagModel): boolean => record.level <= 2;

    const dataSource = ref<BusinessTagModel[]>([]);
    const formatPeriod = (period: string | null): string => {
      if (!period) {
        return "";
      }
      const [start, end] = period.split(",");
      if (!start || !end) {
        return "";
      }
      return `${start} 00:00:00,${end} 23:59:59`;
    };

    const getDataSource = async (): Promise<void> => {
      const params = {
        name: searchParams.keyword,
        period: formatPeriod(searchParams.period),
      };
      const data = await cubeBusinessTagService.getTagTreeList(params);
      dataSource.value = data;
    };
    onMounted(async () => {
      await getDataSource();
    });

    const spaceModalRef = ref<{ openModal: (record?: BusinessTagModel, addSub?: boolean) => void }>();
    const objectModalRef = ref<{ openModal: (tagId?: string) => void }>();
    const currentTag = ref<BusinessTagModel>();
    const selected = ref<
      {
        id: string;
        name: string;
        type: string;
      }[]
    >([]);

    const handleAdd = (): void => {
      spaceModalRef.value?.openModal();
    };
    const handleAddSub = (record: BusinessTagModel): void => {
      spaceModalRef.value?.openModal(record, true);
    };
    const handleAssociate = (record: BusinessTagModel): void => {
      currentTag.value = record;
      objectModalRef.value?.openModal(record.id);
    };
    const handleDetails = (record: BusinessTagModel): void => {
      router.push({
        path: "/tag-details",
        query: {
          id: record?.id ?? "",
        },
      });
    };
    const editRow = (record: BusinessTagModel): void => {
      spaceModalRef.value?.openModal(record);
    };
    const deleteRow = async (record: BusinessTagModel): Promise<void> => {
      try {
        if (record?.childList && record?.childList?.length > 0) {
          message.warn("当前标签有下属标签，无法删除");
          return;
        }
        await cubeBusinessTagService.deleteTag(record?.id ?? "");
        message.success("操作成功");
        getDataSource();
      } catch {
        message.error("操作失败");
      }
    };

    const addAssociatedObject = async (): Promise<void> => {
      try {
        if (!currentTag.value) {
          return;
        }
        if (!selected.value || selected.value.length === 0) {
          message.warn("请选择关联对象");
          return;
        }
        const params = {
          tagId: currentTag.value?.id ?? "",
          refRequests: selected.value.map((item) => ({
            tagRefType: item.type,
            refId: item.id,
          })),
        };
        await cubeBusinessTagService.addTagAssociate(params);
        selected.value = [];
        message.success("操作成功");
      } catch {
        message.error("操作失败");
      }
    };

    const slots = {
      "layout-header": (): JSX.Element => (
        <div class={styles.btns}>
          <Button type="primary" onClick={handleAdd}>
            新增
          </Button>
        </div>
      ),
      "layout-content": (): JSX.Element => (
        <div>
          <CubeForm />
          <Table
            class={styles.typeTable}
            rowKey="id"
            childrenColumnName="childList"
            columns={columns}
            dataSource={dataSource.value}
            pagination={false}
            size="small"
          />
        </div>
      ),
    };
    return (): JSX.Element => (
      <CubeLayout title={pageTitle ?? "业务标签管理"} v-slots={slots}>
        <TagEditModal
          ref={spaceModalRef}
          title={pageTitle ?? "业务标签编辑"}
          onEnter={() => {
            getDataSource();
          }}
        />
        <TagAssociatedObjectSelectModal
          ref={objectModalRef}
          title="业务标签关联"
          v-model:value={selected.value}
          multiple
          onEnter={async (value: { id: string; name: string; type: string }[]) => {
            selected.value = value;
            await addAssociatedObject();
          }}
        />
      </CubeLayout>
    );
  },
});
