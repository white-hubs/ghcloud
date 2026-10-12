import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import type { OperationLogVO, PaginationOperationLogVO } from "@ghcloud/cube-mdata-service/src/type";
import { Button, DateRangePicker, Form, FormItem, Input, Page, PopOver, Select, message } from "@ghcloud/cube-ui";
import { usePageName, queryParameter } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import { cubeMdataService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";

export const HandleRecord = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const formState = reactive({
      period: [dayjs().startOf("month").format("YYYY-MM-DD"), dayjs().endOf("month").format("YYYY-MM-DD")],
      userName: undefined,
      method: undefined,
      result: undefined,
    });

    const columns = [
      {
        title: "操作人",
        dataIndex: "userName",
        ellipsis: true,
        width: 120,
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "操作时间",
        dataIndex: "createTime",
        ellipsis: true,
        width: 120,
        customRender: ({ text }: { text: string }) => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          return <PopOver content={time}>{time}</PopOver>;
        },
      },
      {
        title: "请求地址",
        dataIndex: "url",
        ellipsis: true,
        width: 240,
        customRender: ({ text }: { text: string }) => {
          const tag = text ? <p style={{ maxWidth: "400px", wordBreak: "break-word" }} v-html={text} /> : "--";
          return <PopOver content={tag as string}>{tag}</PopOver>;
        },
      },
      {
        title: "请求方式",
        dataIndex: "method",
        ellipsis: true,
        width: 90,
        customRender: ({ text }: { text: string }) => {
          const curState = methodOptions.find((e) => e.value === text || e.value.includes(text));
          return (
            <>
              <PopOver content={curState?.label || "--"}>{curState?.label ? curState.label : "--"}</PopOver>
            </>
          );
        },
      },
      {
        title: "请求状态码",
        dataIndex: "statusCode",
        ellipsis: true,
        width: 90,
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "请求参数",
        dataIndex: "parameters",
        ellipsis: true,
        width: 240,
        customRender: ({ text }: { text: string }) => {
          const tag = text ? <p style={{ maxWidth: "400px", wordBreak: "break-word" }} v-html={text} /> : "--";
          return <PopOver content={tag as string}>{tag}</PopOver>;
        },
      },
      {
        title: "请求结果",
        dataIndex: "result",
        ellipsis: true,
        width: 120,
        customRender: ({ text }: { text: string }) => {
          const curState = resultOptions.find((e) => e.value === text || e.value.includes(text));
          return (
            <>
              <PopOver content={curState?.label || "--"}>{curState?.label ? curState.label : "--"}</PopOver>
            </>
          );
        },
      },
    ];

    const loading = ref(false);
    const dataSource = ref<OperationLogVO[]>([]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const queryDefaults = {
      pageNumber: 1,
      pageSize: 10,
      period: [dayjs().startOf("month").format("YYYY-MM-DD"), dayjs().endOf("month").format("YYYY-MM-DD")] as string[],
      userName: undefined as string | undefined,
      method: undefined as string | undefined,
      result: undefined as string | undefined,
    };

    const writeCache = (): void => {
      const query: Record<string, unknown> = {
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
        period: formState.period.length ? formState.period.join(",") : undefined,
        userName: formState.userName,
        method: formState.method,
        result: formState.result,
      };
      if (query.pageNumber === 1) delete query.pageNumber;
      if (query.pageSize === 10) delete query.pageSize;
      if (!query.period) delete query.period;
      if (!query.userName) delete query.userName;
      if (!query.method) delete query.method;
      if (!query.result) delete query.result;
      queryParameter.setAddressQuery(query);
    };

    const readCache = (): void => {
      const cache = queryParameter.getQuery() || {};
      if (cache.pageNumber) {
        pagination.value.pageNumber = Number(cache.pageNumber);
      }
      if (cache.pageSize) {
        pagination.value.pageSize = Number(cache.pageSize);
      }
      if (cache.period) {
        formState.period = String(cache.period).split(",").filter(Boolean);
      }
      if (cache.userName !== undefined) {
        formState.userName = String(cache.userName);
      }
      if (cache.method !== undefined) {
        formState.method = String(cache.method);
      }
      if (cache.result !== undefined) {
        formState.result = String(cache.result);
      }
    };
    readCache();

    const resultOptions = [
      { value: "OK", label: "成功" },
      { value: "FAIL", label: "失败" },
    ];
    const methodOptions = [
      { value: "GET", label: "GET" },
      { value: "POST", label: "POST" },
      { value: "PUT", label: "PUT" },
      { value: "DELETE", label: "DELETE" },
    ];

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res: PaginationOperationLogVO = await cubeMdataService.getOperationLogRecord({
          userName: formState.userName,
          method: formState.method,
          result: formState.result,
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          period: formState.period.join(","),
        });
        if (res) {
          const { records, total } = res;
          dataSource.value = records ?? [];
          pagination.value.total = total ?? 0;
        }
      } catch {
      } finally {
        loading.value = false;
      }
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData();
      writeCache();
    };

    const queryForm = (): void => {
      pagination.value.pageNumber = 1;
      getTableData();
      writeCache();
    };
    const reset = (): void => {
      formState.period = [...queryDefaults.period];
      formState.method = queryDefaults.method;
      formState.result = queryDefaults.result;
      formState.userName = queryDefaults.userName;
      pagination.value.pageNumber = queryDefaults.pageNumber;
      pagination.value.pageSize = queryDefaults.pageSize;
      getTableData();
      queryParameter.setAddressQuery({});
    };
    const { scrollY } = useTableScroll();

    onMounted(() => {
      getTableData();
    });

    const layoutSlots = {
      "layout-content": () => {
        return (
          <>
            <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="时间范围">
                <DateRangePicker v-model:value={formState.period} allowClear={false} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="请求结果">
                <Select
                  style={{ width: "160px" }}
                  v-model:value={formState.result}
                  placeholder="请选择请求结果"
                  options={resultOptions}
                  allowClear
                />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="请求方式">
                <Select
                  style={{ width: "160px" }}
                  v-model:value={formState.method}
                  placeholder="请选择请求方式"
                  options={methodOptions}
                  allowClear
                />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <Input v-model:value={formState.userName} placeholder="请输入操作人名称" showCount={false} />
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
              scrollY={scrollY.value}
              tableCode={tableCode}
              applicationCode="LOGMANAGEMENT"
            />
          </>
        );
      },
      "footer-page": () => {
        return (
          <Page
            v-model:current={pagination.value.pageNumber}
            v-model:pageSize={pagination.value.pageSize}
            v-model:total={pagination.value.total}
            onPageChange={pageChange}
          />
        );
      },
    };
    return () => (
      <>
        <Layout title={pageTitle ?? "操作日志记录"} v-slots={layoutSlots} />
      </>
    );
  },
});
