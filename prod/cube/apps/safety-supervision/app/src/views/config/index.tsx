import { defineComponent, onMounted, reactive, ref } from "vue";

import { Button, FormItem, Input, Page, PopOver, Switch, Table } from "@ghcloud/cube-ui";
import { usePageName, useListQueryCache } from "@ghcloud/cube-utils";
import { Layout } from "@ghcloud/generic-component";

import { deletelevels, getalarmlist, getlevels, putlevels } from "@/api/alarm";
import { useTableScroll } from "@/hook/use-table-scroll";

import "./index.less";

export const Manage = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const formState = reactive({
      pageSize: 10,
      pageNumber: 1,
      keyword: "",
    });
    const visible = ref(false);
    const columns = [
      {
        title: "序号",
        align: "center",
        width: 70,
        customRender: ({ index }: { index: number }): number => index + 1,
      },

      {
        title: "报警分类",
        align: "center",
        dataIndex: "alarmTypeName",
        ellipsis: true,
        width: 250,
        customRender: ({ text }: { text: string }): string => {
          return text || "--";
        },
      },
      {
        title: "说明",
        align: "center",
        dataIndex: "remark",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 500,
        align: "center",
        customRender: ({ record }: { record: { alarmTypeCode: string } }): JSX.Element => {
          return (
            <div onClick={getevent} style="position: relative;">
              <Button type="link" size="small" onClick={async () => todetail(record.alarmTypeCode)}>
                推送配置
              </Button>
            </div>
          );
        },
      },
    ];
    const levels = [
      { name: "一级报警", check: false, value: "one_level", timeout: false },
      { value: "two_level", name: "二级报警", check: false, timeout: false },
      { value: "three_level", name: "三级报警", check: false, timeout: false },
      { value: "four_level", name: "四级报警", check: false, timeout: false },
    ];

    const checkChange = async (id: string): Promise<void> => {
      visible.value = true;
      if (levelsdata.value.map((e) => e.alarmLevelCode).includes(id)) {
        await deletelevels(currentalarmTypeCode.value, id);
        todetail(currentalarmTypeCode.value);
      } else {
        await putlevels(currentalarmTypeCode.value, id);
        todetail(currentalarmTypeCode.value);
      }
    };
    const timeoutChange = async (id: string, timeout: boolean): Promise<void> => {
      visible.value = true;
      await putlevels(currentalarmTypeCode.value, id, timeout);
      todetail(currentalarmTypeCode.value);
    };
    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const queryCache = useListQueryCache({
      defaults: {
        keyword: "",
        pageNumber: 1,
        pageSize: 10,
      },
      getState: () => ({
        keyword: formState.keyword,
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
      }),
      setState: (next) => {
        formState.keyword = (next.keyword as string) ?? "";
        formState.pageNumber = Number(next.pageNumber ?? 1);
        formState.pageSize = Number(next.pageSize ?? 10);
        pagination.value.pageNumber = formState.pageNumber;
        pagination.value.pageSize = formState.pageSize;
      },
    });

    const levelsdata = ref<{ alarmLevelCode: string; timeout: boolean }[]>([]);
    const currentalarmTypeCode = ref();
    const address = reactive({
      x: 0,
      y: 0,
    });
    const getevent = (event: { x: number; y: number }): void => {
      Object.assign(address, {
        x: event.x - 300,
        y: event.y - 80,
      });
    };
    const todetail = async (id: string): Promise<void> => {
      currentalarmTypeCode.value = id;
      const { data } = await getlevels(id);
      visible.value = true;
      levelsdata.value = data;
    };
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const { data } = await getalarmlist(formState);
        dataSource.value = data.records;
        pagination.value.total = data.total;
      } catch {
      } finally {
        loading.value = false;
      }
    };
    const reset = async (): Promise<void> => {
      await queryCache.reset();
      await getTableData();
    };
    const handleSearch = async (): Promise<void> => {
      pagination.value.pageNumber = 1;
      formState.pageNumber = 1;
      await getTableData();
      await queryCache.sync();
    };
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      formState.pageNumber = pagination.value.pageNumber;
      formState.pageSize = pagination.value.pageSize;
      getTableData().then(() => {
        queryCache.sync();
      });
    };

    const { scorllY } = useTableScroll();

    onMounted(async () => {
      await queryCache.hydrateAndQuery(getTableData);
    });

    const layoutSlots = {
      "layout-content": (): JSX.Element => {
        return (
          <>
            <div
              onClick={() => {
                visible.value = false;
              }}
            >
              <div style="display:flex;margin-top:10px;">
                <div style="width:400px;">
                  <FormItem label="应用名称:">
                    <Input v-model:value={formState.keyword} />
                  </FormItem>
                </div>
                <Button type="primary" onClick={handleSearch}>
                  查询
                </Button>
                <Button style="margin-left:10px" onClick={reset}>
                  重置
                </Button>
              </div>
              <Table
                columns={columns}
                loading={loading.value}
                dataSource={dataSource.value}
                pagination={false}
                size="middle"
                scrollY={scorllY.value}
              />
            </div>
          </>
        );
      },
      "footer-page": (): JSX.Element => {
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
    return (): JSX.Element => (
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
        {visible.value ? (
          <div class="drop" style={{ top: `${address.y}px`, left: `${address.x}px` }}>
            <div class="drop_title">报警推送配置</div>
            {levels.map((item) => {
              item.check = levelsdata.value.map((e) => e.alarmLevelCode).includes(item.value);
              const cur = levelsdata.value.find((e) => e.alarmLevelCode === item.value);
              item.timeout = cur ? cur.timeout : false;
              return (
                <div class="drop_content" key={item.name}>
                  <div>
                    <span>{item.name}</span> <Switch v-model:checked={item.check} onChange={async () => checkChange(item.value)} />
                  </div>
                  <div>
                    超时推送 <Switch v-model:checked={item.timeout} onChange={async () => timeoutChange(item.value, item.timeout)} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <span />
        )}
      </>
    );
  },
});
