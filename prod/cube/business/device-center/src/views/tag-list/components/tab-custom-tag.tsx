import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import type { CustomerTagVO } from "@ghcloud/cube-iot-center-service";
import { Button, Form, FormItem, Input, Page, PopOver, message, PopConfirm, DateRangePicker, Select, Switch } from "@ghcloud/cube-ui";
import { AliasTable } from "@ghcloud/generic-component";

import { TagModel } from "./tag-modal";
import { cubeDeviceCenterInternalService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { useTableDelete } from "@/hook/use-table-delete";

/** 自定义标签 */
export const TabCustomTag = defineComponent({
  setup: () => {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const queryState = useCubeQueryState({
      storage: "url",
      initialState: {
        cusTagName: "",
        cusStatus: "",
        cusPeriod: "",
        cusPageNumber: 1,
        cusPageSize: 10,
        cusTotal: 0,
      },
      cacheFields: ["cusTagName", "cusStatus", "cusPeriod", "cusPageNumber", "cusPageSize"],
      resolveValue: (field, raw) => {
        if (field === "cusPageNumber" || field === "cusPageSize") {
          return Number(raw);
        }
        return raw ?? "";
      },
    });
    const { getCurrentPage } = useTableDelete();
    const useRemoved = (delList: unknown[]): void => {
      const newPagination = getCurrentPage(
        { pageNumber: queryState.state.cusPageNumber, pageSize: queryState.state.cusPageSize, total: queryState.state.cusTotal },
        delList,
        dataSource.value,
      );
      queryState.setPage(newPagination.pageNumber, newPagination.pageSize);
      queryState.state.cusTotal = newPagination.total ?? 0;
      queryState.writeCache();
      getTableData();
    };
    const formState = reactive<{
      tagName: string;
      status: string | number | undefined;
      period: string[];
    }>({
      tagName: queryState.state.cusTagName,
      status: queryState.state.cusStatus || undefined,
      period: queryState.state.cusPeriod ? queryState.state.cusPeriod.split(",").filter(Boolean) : [],
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
        customRender: ({ record }: { record: CustomerTagVO }): JSX.Element => (
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
      {
        title: "操作",
        dataIndex: "action",
        width: 230,
        customRender: ({ record }: { record: CustomerTagVO }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                editRow(record);
              }}
            >
              编辑
            </Button>
            <PopConfirm
              title="确认删除该项？"
              onConfirm={() => {
                delRow(record);
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

    const handleSwitch = async (val: string, record: CustomerTagVO): Promise<void> => {
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
    const dataSource = ref<CustomerTagVO[]>([]);

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const params = {
          pageNumber: queryState.state.cusPageNumber,
          pageSize: queryState.state.cusPageSize,
          tagName: formState.tagName,
          status: formState.status ?? "",
          period: formState.period ? formState.period.join(",") : "",
        };
        const res = await cubeDeviceCenterInternalService.getTagPageByType("CUSTOMER", params);
        if (res) {
          const { records, total } = res;
          dataSource.value = records;
          queryState.state.cusTotal = total;
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
        cusTagName: formState.tagName,
        cusStatus: (formState.status ?? "") as string,
        cusPeriod: formState.period.join(","),
      });
      queryState.writeCache();
      getTableData();
    };
    const reset = (): void => {
      formState.tagName = "";
      formState.status = undefined;
      formState.period = [];
      queryState.update({ cusTagName: "", cusStatus: "", cusPeriod: "" });
      queryState.clearCache();
      getTableData();
    };

    const delRow = async (record: CustomerTagVO): Promise<void> => {
      try {
        await cubeDeviceCenterInternalService.delCustomerTag(record.id as unknown as string);
        message.success("删除成功");
        useRemoved([record.id]);
      } catch {}
    };

    const tagModelRef = ref<{ openModal: (args?: unknown) => void }>();
    const add = (): void => {
      tagModelRef.value?.openModal();
    };
    const editRow = (record: CustomerTagVO): void => {
      tagModelRef.value?.openModal(record);
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
      "layout-header": (): JSX.Element => (
        <>
          <div>
            <Button type="primary" onClick={add}>
              新增
            </Button>
          </div>
        </>
      ),
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
            tableCode={`${tableCode}Custom`}
            pagination={false}
            scrollY={scrollY.value}
            scrollX={1000}
            applicationCode={__ENV__.applicationCode}
          />
        </>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          v-model:current={queryState.state.cusPageNumber}
          v-model:pageSize={queryState.state.cusPageSize}
          v-model:total={queryState.state.cusTotal}
          onPageChange={pageChange}
        />
      ),
    };
    return (): JSX.Element => (
      <>
        <Layout title="标签管理" v-slots={layoutSlots} />
        <TagModel ref={tagModelRef} onEnter={getTableData} />
      </>
    );
  },
});
