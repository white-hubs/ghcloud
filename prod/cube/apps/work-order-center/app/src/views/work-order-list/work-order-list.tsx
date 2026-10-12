import { defineComponent, reactive, ref } from "vue";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { PopOver, Page, Space, Button, message, Modal, Input } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeWorkOrderCenterService } from "@/api/service";
import { BusinessTypeSelect } from "@/components/business-type-select/business-type-select";
// import { hasPermission } from '@ghcloud/cube-permission-codes'
// import { appFunctionCodes } from '@/permission/index'
import dayjs from "dayjs";

/** 工单统计列表 */
export const WorkOrderStatisticsList = defineComponent({
  setup: () => {
    // const permission = appFunctionCodes.flowApprovalRecord ?? null

    const { pageTitle } = usePageName();
    const statusText = (str: string): string => {
      const statusMap = new Map([
        ["SUBMIT", "提交"],
        ["UNDO", "撤销"],
        ["REPEAT", "重新提交"],
        ["APPROVAL", "审批"],
        ["BACK", "撤回"],
        ["COPY", "抄送"],
        ["REJECT", "驳回"],
        ["FINISHED", "完成"],
      ]);
      return statusMap.get(str) || "处理中";
    };

    // 删除确认弹窗相关状态
    const deleteModalVisible = ref(false);
    const deleteModalTitle = ref("");
    const deleteModalContent = ref("");
    const deleteIds = ref<string[]>([]);

    /**
     * 执行删除工单操作
     */
    const deleteWorkOrder = async (ids: string[]): Promise<void> => {
      deleteLoading.value = true;
      try {
        await cubeWorkOrderCenterService.deleteWorkOrder(ids);
        message.success("删除成功");
        tableApi.query();
      } catch {
        message.error("删除失败");
      } finally {
        deleteLoading.value = false;
        closeDeleteModal();
      }
    };

    /**
     * 打开删除确认弹窗（批量删除）
     */
    const openBatchDeleteModal = (): void => {
      if (selectedRowKeysData.value.length === 0) {
        return;
      }
      deleteModalTitle.value = "确认删除";
      deleteModalContent.value = `确定要删除选中的 ${selectedRowKeysData.value.length} 项工单吗？`;
      deleteIds.value = [...selectedRowKeysData.value];
      deleteModalVisible.value = true;
    };

    /**
     * 关闭删除确认弹窗
     */
    const closeDeleteModal = (): void => {
      deleteModalVisible.value = false;
      deleteModalTitle.value = "";
      deleteModalContent.value = "";
      deleteIds.value = [];
    };

    /**
     * 确认删除操作
     */
    const confirmDelete = (): void => {
      if (deleteIds.value.length > 0) {
        deleteWorkOrder(deleteIds.value);
      }
    };

    const columns = [
      {
        title: "编号",
        dataIndex: "formNo",
        ellipsis: true,
        width: 200,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        title: "申请名称",
        dataIndex: "instanceName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text ?? "--"}>{text ?? "--"}</PopOver>,
      },
      {
        title: "发起人",
        dataIndex: "startUserName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text ?? "--"}>{text ?? "--"}</PopOver>,
      },
      {
        title: "发起部门",
        dataIndex: "organizationName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text ?? "--"}>{text ?? "--"}</PopOver>,
      },
      {
        title: "发起时间",
        dataIndex: "submitedTime",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          const value = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-";

          return <PopOver content={value}>{value}</PopOver>;
        },
      },
      {
        title: "处理状态",
        dataIndex: "status",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          const value = text ? statusText(text) : "-";
          return <PopOver content={value}>{value}</PopOver>;
        },
      },
    ];

    const searchFormSchema = [
      {
        component: BusinessTypeSelect,
        label: "工单类型",
        fieldName: "businessType",
        defaultValue: null,
        componentProps: {},
      },
      {
        component: Input,
        label: "发起人",
        fieldName: "username",
        defaultValue: null,
        componentProps: {},
      },
    ];

    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      businessType: null as string | null,
      username: null as string | null,
    });

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      schema: searchFormSchema,
      showCollapseButton: true,
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
      handleSubmit: (data) => {
        searchParams.businessType = (data.businessType as string | null) ?? null;
        searchParams.username = (data.username as string | null) ?? null;
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.businessType = null;
        searchParams.username = null;
        searchParams.pageNumber = 1;
        tableApi.query();
      },
    });

    const selectedRowKeysData = ref<string[]>([]);

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: "processInstanceId",
      rowSelection: "checkbox",
      fetchApi: async () => {
        const params = {
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          businessType: searchParams.businessType ?? "",
          username: searchParams.username ?? "",
        };
        return cubeWorkOrderCenterService.getWorkOrderList(params);
      },
      rowSelectionChange: (keys) => {
        selectedRowKeysData.value = keys as string[];
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
    const deleteLoading = ref(false);

    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <Space>
          {
            // (!permission || hasPermission(permission.info)) ? <Button
            //   disabled={ selectedRowKeysData.value.length === 0}
            //   type='primary' danger onClick={openBatchDeleteModal}
            //   loading={deleteLoading.value}
            // >批量删除
            // </Button> : <div></div>
            <Button
              disabled={selectedRowKeysData.value.length === 0}
              type="primary"
              danger
              onClick={openBatchDeleteModal}
              loading={deleteLoading.value}
            >
              批量删除
            </Button>
          }
        </Space>
      ),
      "layout-content": (): JSX.Element => (
        <div>
          <CubeForm />
          <CubeTable />

          {/* 删除确认弹窗 */}
          <Modal
            visible={deleteModalVisible.value}
            title={deleteModalTitle.value}
            onCancel={closeDeleteModal}
            width={400}
            footer={
              <>
                <Button onClick={closeDeleteModal}>取消</Button>
                <Button type="primary" danger onClick={confirmDelete} loading={deleteLoading.value}>
                  确认
                </Button>
              </>
            }
          >
            <p>{deleteModalContent.value}</p>
          </Modal>
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          v-show={searchParams.total > 0}
          current={searchParams.pageNumber}
          pageSize={searchParams.pageSize}
          total={searchParams.total}
          onPageChange={handleChange}
        />
      ),
      "footer-btn": (): JSX.Element => (
        <>
          <span style={{ marginRight: "10px" }}>已选{selectedRowKeysData.value.length}项</span>
        </>
      ),
    };
    return (): JSX.Element => <CubeLayout title={pageTitle} v-slots={layoutSlots} />;
  },
});
