import dayjs from "dayjs";
import { defineComponent, reactive, onMounted, ref } from "vue";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import { Form, FormItem, Input, Button, PopOver } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import { getFusionCommunicateAccount } from "@/apis/intercom-group-config";
import { GLayout } from "@/components/common/layout";
import { GPagination } from "@/components/common/pagination";
interface AccountConfigQueryState {
  keyword: string;
  pageNumber: number;
  pageSize: number;
  total: number;
}

export const AccountConfig = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();

    const queryState = useCubeQueryState<AccountConfigQueryState>({
      initialState: {
        keyword: "",
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      storage: "url",
      cacheFields: ["keyword", "pageNumber", "pageSize"],
      resolveValue: (field, raw) => {
        if (field === "pageNumber" || field === "pageSize") {
          return Number(raw);
        }
        return raw;
      },
    });

    const state = reactive<{
      loading: boolean;
      dataSource: unknown[];
      editAccount: {
        id: string;
        name: string;
        code: string;
        password: string;
        type: string;
        isRecord: boolean;
        isVideo: boolean;
        deviceLevel: number;
      };
    }>({
      loading: false,
      dataSource: [],
      editAccount: {
        id: "",
        name: "",
        code: "",
        password: "",
        type: "",
        isRecord: false,
        isVideo: false,
        deviceLevel: 0,
      },
    });
    const periodRange = ref<string[]>([]);
    const getList = async (): Promise<void> => {
      try {
        state.loading = true;
        const { data } = await getFusionCommunicateAccount(queryState.state);
        state.dataSource = data.records;
        queryState.update({ total: data.total });
        queryState.writeCache();
      } catch {
      } finally {
        state.loading = false;
      }
    };
    const statusList: Record<string, { title: string; color: string }> = {
      IN_USED: { title: "在用", color: "#52c41a" },
      UNUSED: { title: "闲置", color: "#f5222d" },
    };
    const columns = [
      {
        title: "账号名称",
        dataIndex: "name",
        key: "name",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "号码",
        dataIndex: "code",
        key: "code",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "账号等级",
        dataIndex: "level",
        key: "level",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "状态",
        dataIndex: "usageState",
        key: "usageState",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const valTxt = statusList[text].title;
          const valColor = statusList[text].color;
          return (
            <>
              <PopOver content={valTxt || "--"}>
                <span style={{ color: valColor }}>{valTxt || "--"}</span>
              </PopOver>
            </>
          );
        },
      },
      {
        title: "创建时间",
        dataIndex: "createTime",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          text = text ? dayjs(text).format("YYYY-MM-DD hh:mm:ss") : "";
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
    ];
    const handleSearch = (): void => {
      queryState.resetPage();
      queryState.writeCache();
      getList();
    };
    const handleReset = (): void => {
      queryState.update({
        keyword: "",
      });
      queryState.resetPage();
      queryState.clearCache();
      periodRange.value = [];
      getList();
    };
    const changePage = (pageNumber: number, pageSize: number): void => {
      queryState.setPage(pageNumber, pageSize);
      getList();
    };
    onMounted(() => {
      getList();
    });
    const layoutSlots = {
      "content-search": (): JSX.Element => (
        <Form layout="inline">
          <FormItem>
            <Input placeholder="账号名称/号码" v-model:value={queryState.state.keyword} />
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
      ),
      "content-table": (): JSX.Element => (
        <AliasTable
          columns={columns}
          scrollY={500}
          loading={state.loading}
          dataSource={state.dataSource}
          pagination={false}
          applicationCode="COMMAND_DISPATCH"
          tableCode="INTERCOM_GROUP_CONFIG"
        />
      ),
      "footer-page": (): JSX.Element => (
        <GPagination
          current={queryState.state.pageNumber}
          pageSize={queryState.state.pageSize}
          total={queryState.state.total ?? 0}
          onChange={changePage}
        />
      ),
    };
    return (): JSX.Element => (
      <>
        <GLayout title={pageTitle} v-slots={layoutSlots} />
      </>
    );
  },
});
