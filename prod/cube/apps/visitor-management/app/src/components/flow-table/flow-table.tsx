import { cubeFlowService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";
import { logger } from "@/logger";
import { Button, DateRangePicker, Form, FormItem, Input, Page, PopOver, RadioButton, RadioGroup, Select } from "@ghcloud/cube-ui";
import { queryParameter } from "@ghcloud/cube-utils";
import { AliasTable, DeptTreeSelect } from "@ghcloud/generic-component";
import dayjs from "dayjs";
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

interface Props {
  title: string;
  flowCode: string;
  permission: Record<string, string>;
}

/** 流程列表页表格组件 */
export const FlowListTable = defineComponent({
  props: ["title", "flowCode", "permission"],
  setup: (props: Props) => {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    /** 跳转到流引擎新增 */
    const addFlow = (): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/stream-engine-render/index?businessType=${props.flowCode}&type=add&title=${props.title}`,
      );
    };
    /** 跳转到详情页 */
    const goDetail = (record: unknown): void => {
      const { processInstanceId, currentTaskId, status } = record as { processInstanceId: string; currentTaskId: string; status: string };
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/stream-engine-render/index?businessType=${props.flowCode}&processInstanceId=${processInstanceId}&currentTaskId=${currentTaskId}&status=${status}&type=detail&title=${props.title}`,
      );
    };
    const formState = reactive({
      type: queryParameter.getQuery()?.type ?? "ALL",
      status: queryParameter.getQuery()?.status ?? undefined,
      organizationId: queryParameter.getQuery()?.organizationId ?? undefined,
      username: queryParameter.getQuery()?.username ?? undefined,
      submitTime: queryParameter.getQuery()?.submitTime ? (queryParameter.getQuery()!.submitTime as string).split(",") : undefined,
    });
    const handleTypeChange = (val: string): void => {
      formState.type = val;
      pagination.value.pageNumber = 1;
      queryParameter.setAddressQuery({
        ...formState,
        ...{ pageSize: pagination.value.pageSize, pageNumber: pagination.value.pageNumber },
      });
      getTableData();
    };

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
    const columns = [
      {
        title: "编号",
        dataIndex: "formNo",
        key: "formNo",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "发起部门",
        dataIndex: "organizationName",
        key: "organizationName",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "发起人",
        dataIndex: "startUserName",
        key: "startUserName",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "发起时间",
        dataIndex: "submitedTime",
        key: "submitedTime",
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-";
          return <PopOver content={time}>{time}</PopOver>;
        },
      },
      {
        title: "处理状态",
        dataIndex: "status",
        key: "status",
        customRender: ({ text }: { text: string }): JSX.Element => {
          text = text ? statusText(text) : "-";
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "处理进度",
        dataIndex: "activeNodeName",
        key: "activeNodeName",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "操作",
        dataIndex: "action",
        key: "action",
        fixed: "right",
        customRender: ({ record }: { record: unknown }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                goDetail(record);
              }}
            >
              详情
            </Button>
          </>
        ),
      },
    ];

    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const pagination = ref({
      pageSize: queryParameter.getQuery()?.pageSize ?? 10,
      pageNumber: queryParameter.getQuery()?.pageNumber ?? 1,
      total: queryParameter.getQuery()?.total ?? 0,
    });

    const period = computed(() => {
      if (formState?.submitTime?.[0] && formState?.submitTime?.[1]) {
        return `${formState.submitTime[0] + " 00:00:00"},${formState.submitTime[1] + " 23:59:59"}`;
      }
      return undefined;
    });
    const getTableData = async (urlCache = false): Promise<void> => {
      try {
        loading.value = true;
        const res = await cubeFlowService.getFlowProcessPage({
          pageNumber: pagination.value.pageNumber as number,
          pageSize: pagination.value.pageSize as number,
          organizationId: formState.organizationId as number,
          status: formState.status as string,
          type: formState.type as string,
          username: formState.username as string,
          submitTime: period.value || "",
          businessType: props.flowCode,
        });
        if (res) {
          const { records, total } = res;
          dataSource.value = records;
          pagination.value.total = total;
          urlCache && setUrl();
        }
      } catch (error) {
        logger.error(error);
      } finally {
        loading.value = false;
      }
    };
    const setUrl = (): void => {
      queryParameter.setAddressQuery({
        ...formState,
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
        total: pagination.value.total,
      });
    };
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData(true);
    };

    const queryForm = (): void => {
      pagination.value.pageNumber = 1;
      getTableData(true);
    };
    const reset = (): void => {
      formState.type = "ALL";
      formState.submitTime = undefined;
      formState.status = undefined;
      formState.username = undefined;
      formState.organizationId = [];
      queryForm();
    };
    const { scrollY } = useTableScroll();

    onMounted(() => {
      getTableData();
    });

    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <Button type="primary" onClick={addFlow}>
          新增
        </Button>
      ),
      "layout-content": (): JSX.Element => (
        <>
          <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <RadioGroup v-model:value={formState.type} button-style="solid" onChange={handleTypeChange}>
                <RadioButton value="ALL">全部</RadioButton>
                <RadioButton value="WAITING">待我处理</RadioButton>
                <RadioButton value="SUBMIT">我发起的</RadioButton>
                <RadioButton value="SERVED">抄送给我</RadioButton>
                <RadioButton value="PROCESSED">已处理</RadioButton>
              </RadioGroup>
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="状态">
              <Select
                v-model:value={formState.status}
                placeholder="请选择"
                style="width:180px"
                options={[
                  { value: "ACTIVE", label: "处理中" },
                  { value: "REJECT", label: "驳回" },
                  { value: "UNDO", label: "撤销" },
                  { value: "FINISHED", label: "完成" },
                ]}
              />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="发起时间">
              <DateRangePicker v-model:value={formState.submitTime} value-format="YYYY-MM-DD" />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="发起部门">
              <DeptTreeSelect v-model:value={formState.organizationId} style="width:180px" />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="发起人">
              <Input v-model:value={formState.username} placeholder="人员姓名" showCount={false} />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Button type="primary" onClick={queryForm}>
                查询
              </Button>
              <Button style={{ marginLeft: "10px" }} onClick={reset}>
                重置
              </Button>
            </FormItem>
          </Form>
          <AliasTable
            rowKey="id"
            columns={columns}
            loading={loading.value}
            dataSource={dataSource.value}
            pagination={false}
            scrollY={scrollY.value}
            tableCode={tableCode}
            applicationCode={__ENV__.applicationCode}
          />
        </>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          v-model:current={pagination.value.pageNumber}
          v-model:pageSize={pagination.value.pageSize}
          v-model:total={pagination.value.total}
          onPageChange={pageChange}
        />
      ),
    };

    return (): JSX.Element => <Layout title={props.title} v-slots={layoutSlots} />;
  },
});
