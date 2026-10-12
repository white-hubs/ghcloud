import { getOperateLogList } from "@/api/index";
import { GLayout } from "@/components/common/layout";
import { GPagination } from "@/components/common/pagination";
import { Form, FormItem, Input, Button, DateRangePicker, Table } from "@ghcloud/cube-ui";
import { defineComponent, onMounted, reactive, ref } from "vue";
// Import moment from 'moment'
import dayjs from "dayjs";
export const OperateRecord = defineComponent({
  setup: () => {
    const state = reactive({
      loading: false,
      dataSource: [],
      searchParams: {
        pageNumber: 1,
        pageSize: 10,
        total: 0,
        keyword: "",
      },
    });
    const period = ref<string[]>([dayjs().format("YYYY-MM-DD 00:00:01"), dayjs().format("YYYY-MM-DD 23:59:59")]);
    const columns = [
      {
        dataIndex: "department",
        title: "部门",
      },
      {
        dataIndex: "name",
        title: "姓名",
      },
      {
        dataIndex: "logTime",
        title: "操作时间",
        customRender: ({ text }: { text: string }): string => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--"),
      },
      {
        dataIndex: "remark",
        title: "操作内容",
      },
    ];
    const getList = async (): Promise<void> => {
      try {
        state.loading = true;
        const params = {
          ...state.searchParams,
          logTypeEnum: "BUSINESS_LOG",
          period: period.value ? period.value.join(",") : "",
        };
        const { data } = await getOperateLogList(params);
        state.dataSource = data.records;
        state.searchParams.total = data.total;
      } catch {
      } finally {
        state.loading = false;
      }
    };
    onMounted(() => {
      getList();
    });
    const changePage = (page: number, pageSize: number): void => {
      state.searchParams.pageNumber = page;
      state.searchParams.pageSize = pageSize;
      getList();
    };
    const handleChangePicker = (value: string[]): void => {
      period.value = [dayjs(value[0]).format("YYYY-MM-DD 00:00:01"), dayjs(value[1]).format("YYYY-MM-DD 23:59:59")];
    };
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1;
      getList();
    };
    const handleReset = (): void => {
      state.searchParams.pageNumber = 1;
      state.searchParams.pageSize = 10;
      state.searchParams.keyword = "";
      period.value = [dayjs().format("YYYY-MM-DD 00:00:01"), dayjs().format("YYYY-MM-DD 23:59:59")];
      getList();
    };
    const layoutSlots = {
      "content-search": (): JSX.Element => (
        <>
          <Form layout="inline">
            <FormItem>
              <Input v-model:value={state.searchParams.keyword} placeholder="姓名" />
            </FormItem>
            <FormItem>
              <DateRangePicker picker="date" v-model:value={period.value} onChangePicker={handleChangePicker} />
            </FormItem>
            <FormItem>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Button type="primary" onClick={handleSearch}>
                  查询
                </Button>
                <Button onClick={handleReset}>重置</Button>
              </div>
            </FormItem>
          </Form>
        </>
      ),
      "content-table": (): JSX.Element => (
        <Table dataSource={state.dataSource} columns={columns} loading={state.loading} pagination={false} />
      ),
      "footer-page": (): JSX.Element => (
        <>
          <GPagination
            current={state.searchParams.pageNumber}
            pageSize={state.searchParams.pageSize}
            total={state.searchParams.total ?? 0}
            onChange={changePage}
          />
        </>
      ),
    };
    return (): JSX.Element => (
      // <div>操作记录</div>
      <GLayout title="操作记录" v-slots={layoutSlots} />
    );
  },
});
