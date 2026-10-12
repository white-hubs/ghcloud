import { defineComponent, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { TrackListModel } from "@ghcloud/cube-drone-service";
import { Button, Page, PopOver } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeDroneService } from "@/api/server";

import styles from "./track-list.module.less";

const trackStatusTextMap: Record<number, string> = {
  0: "待执行",
  1: "执行中",
  2: "已完成",
  3: "已暂停",
};
const trackTypeTextMap: Record<number, string> = {
  1: "一维航迹",
  2: "二维航迹",
  3: "三维航迹",
  11: "电力航迹",
};

const renderText = (text?: number | string): JSX.Element => {
  const content = text === 0 ? "0" : text || "--";
  return <PopOver content={content}>{content}</PopOver>;
};

export const TrackList = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const router = useRouter();
    const tableCode = route.path.replaceAll("/", "");
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      keyword: "",
      total: 0,
    });

    const columns = [
      {
        title: "航线名称",
        dataIndex: "trackName",
        width: 200,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => renderText(text),
      },
      {
        title: "航点数",
        dataIndex: "waypointCount",
        width: 120,
        align: "center",
        customRender: ({ text }: { text: number }): JSX.Element => renderText(text),
      },
      {
        title: "航线长度",
        dataIndex: "trackLength",
        width: 120,
        align: "center",
        customRender: ({ text }: { text: number }): JSX.Element => renderText(text),
      },
      {
        title: "项目名称",
        dataIndex: "projectName",
        width: 200,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => renderText(text),
      },
      {
        title: "状态",
        dataIndex: "status",
        width: 120,
        align: "center",
        customRender: ({ text }: { text: number }): JSX.Element => {
          const statusText = trackStatusTextMap[text] || "--";
          return renderText(statusText);
        },
      },
      {
        title: "类型",
        dataIndex: "type",
        width: 120,
        align: "center",
        customRender: ({ text }: { text: number }): JSX.Element => renderText(trackTypeTextMap[text] || "--"),
      },
      {
        title: "机库",
        dataIndex: "nestName",
        width: 120,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => renderText(text),
      },
      {
        title: "操作",
        dataIndex: "action",
        fixed: "right",
        width: 100,
        align: "center",
        customRender: ({ record }: { record: TrackListModel }): JSX.Element => (
          <Button
            type="link"
            size="small"
            class={styles.detailButton}
            onClick={() => {
              sessionStorage.setItem("trackInfo", JSON.stringify(record));
              router.push({ path: "/track-detail", query: { id: record.id } });
            }}
          >
            详情
          </Button>
        ),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: "id",
      fetchApi: async () => {
        const params = {
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          trackName: searchParams.keyword ?? "",
        };
        return cubeDroneService.getTrackListPage(params);
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total;
      },
    });

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber;
      searchParams.pageSize = pageSize;
      tableApi.query();
    };

    const formSchema = [
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "航线名称",
        },
      },
    ];

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      schema: formSchema,
      showCollapseButton: true,
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
      handleSubmit: (data: Record<string, unknown>) => {
        searchParams.keyword = data.keyword ? (data.keyword as string) : "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.keyword = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
    });
    formApi.updateSchema(formSchema);

    const slots = {
      "layout-content": (): JSX.Element => (
        <div class={styles.content}>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          current={searchParams.pageNumber}
          pageSize={searchParams.pageSize}
          total={searchParams.total}
          hideOnSinglePage={false}
          onPageChange={handlePageChange}
        />
      ),
    };

    return (): JSX.Element => <CubeLayout title={pageTitle} v-slots={slots} showTableXScroll />;
  },
});
