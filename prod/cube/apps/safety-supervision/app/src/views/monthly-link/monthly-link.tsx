import { defineComponent, onMounted, reactive } from "vue";
import useClipboard from "vue-clipboard3";

import { Button, Form, FormItem, Input, Page, PopOver, Switch, Table, message } from "@ghcloud/cube-ui";
import { usePageName, useListQueryCache } from "@ghcloud/cube-utils";
import { Layout } from "@ghcloud/generic-component";

import { getmonthReportUrl } from "@/api/alarm";
import { changeMonthlyReportLinkStatus } from "@/api/report";
import { useTableScroll } from "@/hook/use-table-scroll";

import "@/styles/monthly-report.less";

export const MonthlyLink = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const { toClipboard } = useClipboard();
    const copy = async (text: string): Promise<void> => {
      try {
        await toClipboard(text); // 实现复制
        message.success("复制成功");
      } catch (e) {}
    };
    const columns = [
      {
        title: "序号",
        align: "center",
        width: "80px",
        customRender: ({ index }: { index: number }): string => `${index + 1}`,
      },
      {
        title: "市场名称",
        dataIndex: "marketName",
        width: 300,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "链接地址",
        dataIndex: "url",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const path = text;
          return (
            <PopOver content="复制链接">
              <Button
                type="link"
                block
                onClick={() => {
                  copy(path);
                }}
              >
                <div class="address">{path || "--"}</div>
              </Button>
            </PopOver>
          );
        },
      },
      {
        title: "是否启用",
        ellipsis: true,
        width: 100,
        align: "center",
        customRender: ({ record }: { record: { enabled: boolean; id: string } }): JSX.Element => {
          return (
            <Switch
              v-model:value={record.enabled}
              onChange={(value: boolean) => {
                changeEnable(record.id, value);
              }}
            />
          );
        },
      },
    ];
    const state = reactive({
      dataSource: [],
      loading: false,
      exportLoading: false,
      pendingVisible: false,
      handlerVisible: false,
      searchParams: {
        pageNumber: 1,
        pageSize: 10,
        keyword: "",
        total: 0,
      },
      selectRow: "",
    });
    const queryCache = useListQueryCache({
      defaults: {
        pageNumber: 1,
        pageSize: 10,
        keyword: "",
      },
      getState: () => ({
        pageNumber: state.searchParams.pageNumber,
        pageSize: state.searchParams.pageSize,
        keyword: state.searchParams.keyword,
      }),
      setState: (next) => {
        state.searchParams.pageNumber = Number(next.pageNumber ?? 1);
        state.searchParams.pageSize = Number(next.pageSize ?? 10);
        state.searchParams.keyword = (next.keyword as string) ?? "";
      },
    });
    const changePage = (page: number, pageSize: number): void => {
      state.searchParams.pageNumber = page;
      state.searchParams.pageSize = pageSize;
      getTableData().then(() => {
        queryCache.sync();
      });
    };
    const handleSearch = async (): Promise<void> => {
      state.searchParams.pageNumber = 1;
      await getTableData();
      await queryCache.sync();
    };
    const reset = async (): Promise<void> => {
      await queryCache.reset();
      await getTableData();
    };
    const getTableData = async (): Promise<void> => {
      state.loading = true;
      try {
        const params: Record<string, string | boolean | number | null> = {
          ...state.searchParams,
        };
        const { data } = await getmonthReportUrl(params);
        state.dataSource = data.records.map((item: { marketName: string; marketTenant: string; id: string; enabled: boolean }) => {
          return {
            id: item.id,
            enabled: !!item.enabled,
            marketName: item.marketName,
            url: `${location.origin}/apps/safety-manage-head/viewreport?marketTenant=${item.marketTenant}&linkId=${item.id}`,
          };
        });
        state.searchParams.total = data.total;
      } catch {
      } finally {
        state.loading = false;
      }
    };
    const changeEnable = async (id: string, enabled: boolean): Promise<void> => {
      try {
        message.loading("操作中");
        await changeMonthlyReportLinkStatus(id, enabled);
        message.destroy();
        message.success("操作成功");
      } catch {
        message.destroy();
      } finally {
        getTableData();
      }
    };
    const { scorllY } = useTableScroll();
    onMounted(async () => {
      await queryCache.hydrateAndQuery(getTableData);
    });

    const layoutSlots = {
      "layout-content": (): JSX.Element => {
        return (
          <>
            <Form layout="inline" style="margin: 16px 0;">
              <FormItem class="search-item">
                <Input v-model:value={state.searchParams.keyword} placeholder="请输入月报标题" showCount={false} />
              </FormItem>
              <FormItem class="search-item">
                <Button type="primary" onClick={handleSearch}>
                  查询
                </Button>
                <Button style={{ marginLeft: "10px" }} onClick={reset}>
                  重置
                </Button>
              </FormItem>
            </Form>
            <Table
              dataSource={state.dataSource}
              columns={columns}
              loading={state.loading}
              pagination={false}
              size="small"
              scrollX={1000}
              scrollY={scorllY.value}
            />
          </>
        );
      },
      "footer-page": (): JSX.Element => {
        return (
          <Page
            v-model:current={state.searchParams.pageNumber}
            v-model:pageSize={state.searchParams.pageSize}
            v-model:total={state.searchParams.total}
            onPageChange={changePage}
          />
        );
      },
    };
    return (): JSX.Element => (
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
      </>
    );
  },
});
