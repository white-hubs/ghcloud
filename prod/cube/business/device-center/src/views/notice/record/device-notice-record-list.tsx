import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import { Button, DateRangePicker, Form, FormItem, Input, Page, PopOver } from "@ghcloud/cube-ui";
import { AliasTable } from "@ghcloud/generic-component";

import { cubeDeviceSuperviseService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";
import { logger } from "@/logger";

interface DeviceNoticeRecordQueryState {
  keyword: string;
  period: string[];
  pageNumber: number;
  pageSize: number;
  total: number;
}

/** 设备通知 - 通知记录列表 */
export const DeviceNoticeRecordConfig = defineComponent({
  setup: () => {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");

    const queryState = useCubeQueryState<DeviceNoticeRecordQueryState>({
      initialState: {
        keyword: "",
        period: [],
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      storage: "url",
      cacheFields: ["keyword", "period", "pageNumber", "pageSize"],
      resolveValue: (field, raw) => {
        if (field === "pageNumber" || field === "pageSize") return Number(raw);
        if (field === "period") return raw ? raw.split(",").filter(Boolean) : [];
        return raw;
      },
    });

    const columns = [
      {
        title: "通知设备",
        dataIndex: "deviceName",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "所属产品",
        dataIndex: "prodName",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "产品品类",
        dataIndex: "productCategoryName",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "通知时间",
        dataIndex: "triggerTime",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          return <PopOver content={time}>{time}</PopOver>;
        },
      },
      {
        title: "触发条件",
        dataIndex: "triggerContent",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const shortContent = text.length > 20 ? `${text.substring(0, 20)}...` : text;
          const tooltipContent = text.length > 50 ? `${text.substring(0, 50)}...` : text;
          return <PopOver content={tooltipContent}>{shortContent}</PopOver>;
        },
      },
    ];
    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const periodStr = queryState.state.period?.length
          ? `${queryState.state.period[0]} 00:00:00,${queryState.state.period[1]} 23:59:59`
          : "";
        logger.debug(periodStr);
        const res = await cubeDeviceSuperviseService.getNotifyRecordPage({
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          keyword: queryState.state.keyword,
          period: periodStr,
        });
        if (res) {
          const { records, total } = res;
          dataSource.value = records;
          queryState.update({ total });
          queryState.writeCache();
        }
      } catch (error) {
        logger.debug(error);
      } finally {
        loading.value = false;
      }
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      queryState.setPage(pageNumber || 1, pageSize);
      getTableData();
    };

    const queryForm = (): void => {
      queryState.resetPage();
      queryState.writeCache();
      getTableData();
    };
    const reset = (): void => {
      queryState.update({
        keyword: "",
        period: [],
      });
      queryState.resetPage();
      queryState.clearCache();
      getTableData();
    };
    const { scrollY } = useTableScroll();

    onMounted(() => {
      getTableData();
    });

    const layoutSlots = {
      "layout-content": (): JSX.Element => (
        <>
          <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="">
              <Input v-model:value={queryState.state.keyword} placeholder="请输入设备名称搜索" showCount={false} />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="通知时间">
              <DateRangePicker v-model:value={queryState.state.period} allowClear={false} />
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
            tableCode={tableCode}
            pagination={false}
            scrollY={scrollY.value}
            applicationCode={__ENV__.applicationCode}
          />
        </>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          v-model:current={queryState.state.pageNumber}
          v-model:pageSize={queryState.state.pageSize}
          v-model:total={queryState.state.total}
          onPageChange={pageChange}
        />
      ),
    };
    return (): JSX.Element => (
      <>
        <Layout title="通知记录" v-slots={layoutSlots} />
      </>
    );
  },
});
