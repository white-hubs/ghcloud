import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import { Button, Form, FormItem, Input, Page, PopOver, DateRangePicker, Select, Switch, message } from "@ghcloud/cube-ui";
import { AliasTable } from "@ghcloud/generic-component";

import { cubeDeviceCenterInternalService } from "@/api/service";
import { Layout } from "@/components/layout/layout";

/** 系统标签 */
export const TabSystemTag = defineComponent({
  setup: () => {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const queryState = useCubeQueryState({
      storage: "url",
      initialState: {
        sysTagName: "",
        sysStatus: "",
        sysPeriod: "",
        sysPageNumber: 1,
        sysPageSize: 10,
        sysTotal: 0,
      },
      cacheFields: ["sysTagName", "sysStatus", "sysPeriod", "sysPageNumber", "sysPageSize"],
      resolveValue: (field, raw) => {
        if (field === "sysPageNumber" || field === "sysPageSize") {
          return Number(raw);
        }
        return raw ?? "";
      },
    });
    const formState = reactive<{
      tagName: string;
      status: string | number | undefined;
      period: string[];
    }>({
      tagName: queryState.state.sysTagName,
      status: queryState.state.sysStatus || undefined,
      period: queryState.state.sysPeriod ? queryState.state.sysPeriod.split(",").filter(Boolean) : [],
    });
    const statusOptions = [
      { value: "1", label: "启用" },
      { value: "0", label: "禁用" },
    ];

    const selectedRowKeysData = ref<string[]>([]);
    const selectedRowsData = ref<{ id: string; deviceCode: string; deviceName: string }[]>([]);
    const columns = [
      {
        title: "序号",
        width: 70,
        align: "center",
        customRender: ({ index }: { index: number }): string => `${index + 1}`,
      },
      {
        title: "标签名称",
        dataIndex: "tagName",
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "标签描述",
        width: 200,
        dataIndex: "description",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "编辑时间",
        dataIndex: "updateTime",
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          return <PopOver content={time}>{time}</PopOver>;
        },
      },
      {
        title: "状态",
        dataIndex: "enableStatus",
        ellipsis: true,
        width: 200,
        customRender: ({ record }: { record: { id: string; enableStatus: boolean | null } }): JSX.Element => (
          <Switch
            v-model:value={record.enableStatus}
            checkedChildren="启用"
            unCheckedChildren="禁用"
            onChange={(val) => {
              handleSwitch(typeof val === "boolean" ? Number(val).toString() : val, record);
            }}
          />
        ),
      },
    ];

    const handleSwitch = async (val: string, record: { id: string; enableStatus: boolean | null }): Promise<void> => {
      cubeDeviceCenterInternalService
        .updateTagStatus(val, record.id as unknown as string)
        .then(() => {
          message.success("操作成功");
          getTableData();
        })
        .catch((error) => {
          message.error(error?.errorMessage ?? "操作失败");
          record.enableStatus = !val;
        });
    };
    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const params = {
          pageNumber: queryState.state.sysPageNumber,
          pageSize: queryState.state.sysPageSize,
          tagName: formState.tagName,
          period: formState.period ? formState.period.join(",") : "",
          status: formState.status ?? "",
        };
        const res = await cubeDeviceCenterInternalService.getTagPageByType("SYSTEM", params);
        if (res) {
          const { records, total } = res;
          dataSource.value = records;
          queryState.state.sysTotal = total;
          queryState.writeCache();
        }
      } catch {
      } finally {
        loading.value = false;
      }
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      selectedRowKeysData.value.length = 0;
      selectedRowsData.value.length = 0;
      queryState.setPage(pageNumber || 1, pageSize);
      getTableData();
    };

    const queryForm = (): void => {
      queryState.resetPage();
      queryState.update({
        sysTagName: formState.tagName,
        sysStatus: (formState.status ?? "") as string,
        sysPeriod: formState.period.join(","),
      });
      queryState.writeCache();
      getTableData();
    };
    const reset = (): void => {
      formState.tagName = "";
      formState.status = undefined;
      formState.period = [];
      queryState.update({ sysTagName: "", sysStatus: "", sysPeriod: "" });
      queryState.clearCache();
      getTableData();
    };
    const scrollY = ref(500);
    /* 获取table高度 */
    const getScrollHeight = (): void => {
      const contentBody = document.getElementsByClassName("device-center-layout-content")[0];
      const tabNav = document.getElementsByClassName("device-center-tabs-nav")[0];
      const pageHeight = 70;
      scrollY.value = contentBody.clientHeight - tabNav.clientHeight - pageHeight;
    };
    onMounted(() => {
      getTableData();
      getScrollHeight();
    });
    const layoutSlots = {
      "layout-content": (): JSX.Element => (
        <>
          <Form layout="inline" style={{ margin: "10px 0 " }}>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="时间范围">
              <DateRangePicker v-model:value={formState.period} allowClear />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="状态">
              <Select
                style={{ width: "160px" }}
                v-model:value={formState.status}
                placeholder="请选择状态"
                options={statusOptions}
                allowClear
              />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Input v-model:value={formState.tagName} placeholder="标签名称" showCount={false} allowClear />
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
            tableCode={`${tableCode}System`}
            pagination={false}
            scrollY={scrollY.value}
            scrollX={1000}
            style={{ height: scrollY.value }}
            applicationCode={__ENV__.applicationCode}
          />
        </>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          v-model:current={queryState.state.sysPageNumber}
          v-model:pageSize={queryState.state.sysPageSize}
          v-model:total={queryState.state.sysTotal}
          onPageChange={pageChange}
        />
      ),
    };
    return (): JSX.Element => (
      <>
        <Layout title="标签管理" v-slots={layoutSlots} />
      </>
    );
  },
});
