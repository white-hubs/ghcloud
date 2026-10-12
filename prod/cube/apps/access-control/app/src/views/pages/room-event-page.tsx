import dayjs, { type Dayjs } from "dayjs";
import { defineComponent, reactive } from "vue";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { getAbnormalEvent } from "@ghcloud/cube-services-client/access-control.client";
import { Page, PopOver } from "@ghcloud/cube-ui";

const formatDateTime = (value: unknown): string => (value ? dayjs(value as string).format("YYYY-MM-DD HH:mm:ss") : "--");
const textCell = (value: unknown) => <PopOver content={String(value || "")}>{String(value || "--")}</PopOver>;

export default defineComponent({
  name: "RoomEventPage",
  setup: () => {
    const search = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      keyword: "",
      startTime: "",
      endTime: "",
    });

    const [CubeTable, tableApi] = useCubeTable({
      rowKey: "id",
      tableCode: "ROOM_EVENT",
      columns: [
        {
          title: "时间",
          dataIndex: "eventTime",
          ellipsis: true,
          customRender: ({ text }: { text: unknown }) => textCell(formatDateTime(text)),
        },
        {
          title: "门禁名称",
          dataIndex: "doorName",
          ellipsis: true,
          customRender: ({ text }: { text: unknown }) => textCell(text),
        },
        {
          title: "异常事件描述",
          dataIndex: "eventType",
          ellipsis: true,
          customRender: ({ text }: { text: unknown }) => textCell(text),
        },
      ],
      fetchApi: () =>
        getAbnormalEvent({
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          keyword: search.keyword,
          startTime: search.startTime,
          endTime: search.endTime,
        }),
      fetchLoaded: (data) => {
        search.total = data.total;
      },
    });

    const [CubeForm] = useCubeForm({
      layout: "horizontal",
      schema: [
        {
          component: "Input",
          fieldName: "keyword",
          label: "门禁名称",
          defaultValue: "",
          componentProps: { placeholder: "请输入门禁名称", allowClear: true },
        },
        {
          component: "DateRangePicker",
          fieldName: "date",
          label: "时间范围",
          componentProps: { showTime: true },
        },
      ],
      handleSubmit: (values) => {
        const date = (values.date || []) as Dayjs[];
        search.keyword = String(values.keyword || "");
        search.startTime = date[0]?.format("YYYY-MM-DD HH:mm:ss") || "";
        search.endTime = date[1]?.format("YYYY-MM-DD HH:mm:ss") || "";
        search.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        search.keyword = "";
        search.startTime = "";
        search.endTime = "";
        search.pageNumber = 1;
        tableApi.query();
      },
    });

    const slots = {
      "layout-content": () => (
        <>
          <CubeForm />
          <CubeTable />
        </>
      ),
      "footer-page": () => (
        <Page
          current={search.pageNumber}
          pageSize={search.pageSize}
          total={search.total}
          showQuickJumper={false}
          showSizeChanger
          showTotal={(total: number) => `共 ${total} 条`}
          pageSizeOptions={["10", "20", "50", "100"]}
          onPageChange={(pageNumber: number, pageSize: number) => {
            search.pageNumber = pageNumber;
            search.pageSize = pageSize;
            tableApi.query();
          }}
        />
      ),
    };

    return () => <CubeLayout title="异常事件" v-slots={slots} showTableXScroll />;
  },
});
