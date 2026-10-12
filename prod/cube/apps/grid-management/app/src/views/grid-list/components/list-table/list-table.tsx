import styles from "./list-table.module.less";
import { cubeGridManagementService } from "@/api/server";
import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { GridDTO } from "@ghcloud/cube-grid-management-service";
import { ArrowLeftOutlined, Button, Page, PopOver } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { defineComponent, reactive, ref } from "vue";
import { useRoute } from "vue-router";

export const ListTable = defineComponent({
  name: "ListTable",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:show"],
  setup(props, { emit }) {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const { pageTitle } = usePageName();
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      keyword: "",
    });
    const total = ref(0);

    const columns = [
      {
        sort: 0,
        title: "网格名称",
        dataIndex: "gridName",
        align: "center",
        ellipsis: true,
        defaultVisible: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        sort: 1,
        title: "网格长",
        dataIndex: "gridManagers",
        align: "center",
        ellipsis: true,
        defaultVisible: true,
        customRender: ({ text }: { text: { gridManagerName: string; gridManagerId: string; mobile: string }[] }): JSX.Element => {
          const showText = text.map((item) => item.gridManagerName).join("、");
          return <PopOver content={showText || ""}>{showText || "--"}</PopOver>;
        },
      },
      {
        sort: 2,
        title: "联系方式",
        dataIndex: "gridManagers",
        align: "center",
        ellipsis: true,
        defaultVisible: true,
        customRender: ({ text }: { text: { gridManagerName: string; gridManagerId: string; mobile: string }[] }): JSX.Element => {
          const showText = text.map((item) => item.mobile).join("、");
          return <PopOver content={showText || ""}>{showText || "--"}</PopOver>;
        },
      },
      {
        sort: 3,
        title: "网格员",
        dataIndex: "gridMembers",
        align: "center",
        ellipsis: true,
        defaultVisible: true,
        customRender: ({ text }: { text: { name: string; mobile: string }[] }): JSX.Element => {
          const showText = text.map((item) => item.name).join("、");
          return <PopOver content={showText || ""}>{showText || "--"}</PopOver>;
        },
      },
      {
        sort: 4,
        title: "下属区域",
        dataIndex: "childAreaName",
        align: "center",
        ellipsis: true,
        defaultVisible: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        sort: 5,
        title: "操作",
        dataIndex: "action",
        fixed: "right",
        defaultVisible: true,
        customRender: ({ record }: { record: GridDTO }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                sessionStorage.setItem("gridInfo", JSON.stringify(record));
                history.pushState({}, "", `/portal/grid-manage/grid-detail?id=${record.gridAreaId}`);
              }}
            >
              详情
            </Button>
          </>
        ),
      },
    ];
    const fetchDataApi = async () =>
      await cubeGridManagementService.getGridList({
        pageNumber: searchParams.pageNumber,
        pageSize: searchParams.pageSize,
        keyword: searchParams.keyword,
      });
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: "id",
      fetchApi: fetchDataApi,
      fetchLoaded: (data) => {
        total.value = data.total;
      },
    });

    const handleChange = (pageNumber: number, pageSize: number): void => {
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
          placeholder: "网格名称",
        },
      },
    ];
    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      handleSubmit: (data) => {
        searchParams.keyword = data.keyword ? (data.keyword as string) : "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.pageNumber = 1;
        searchParams.keyword = "";
        tableApi.query();
      },
      schema: formSchema,
      showCollapseButton: true,
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
    });
    formApi.updateSchema(formSchema);

    return (): JSX.Element => (
      <div class={styles["grid-list-table"]} style={{ display: props.show ? "block" : "none" }}>
        <CubeLayout
          title={pageTitle}
          v-slots={{
            "layout-header": () => (
              <div
                class={styles["view-change-btn"]}
                onClick={() => {
                  emit("update:show", false);
                }}
              >
                <ArrowLeftOutlined />
                <span>模型</span>
              </div>
            ),
            "layout-content": () => (
              <>
                <CubeForm />
                <CubeTable />
              </>
            ),
            "footer-page": (): JSX.Element => (
              <Page current={searchParams.pageNumber} pageSize={searchParams.pageSize} total={total.value} onPageChange={handleChange} />
            ),
          }}
        />
      </div>
    );
  },
});
