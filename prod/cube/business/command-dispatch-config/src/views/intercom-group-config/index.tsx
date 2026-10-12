import dayjs from "dayjs";
import { defineComponent, reactive, onMounted, ref } from "vue";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import { Form, FormItem, Input, Button, PopOver, PopConfirm, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import { AddGroup } from "./component/add-group";
import { AddMember } from "./component/add-member";
import { getInterComGroup, deleteInterComGroup } from "@/apis/intercom-group-config";
import { GLayout } from "@/components/common/layout";
import { GPagination } from "@/components/common/pagination";
interface IntercomGroupConfigQueryState {
  keyword: string;
  pageNumber: number;
  pageSize: number;
  total: number;
}

export const IntercomGroupConfig = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();

    const queryState = useCubeQueryState<IntercomGroupConfigQueryState>({
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
      editVisible: boolean;
      addMemberVisible: boolean;
      editTitle: string;
      addMemberGroupCode: string;
      editGroup: {
        id: string;
        code: string;
        name: string;
        isRecord: boolean;
        type: number;
        groupLevel: number;
      };
      rowSelectKeys: string[];
    }>({
      loading: false,
      dataSource: [],
      editTitle: "新增对讲组",
      editVisible: false,
      addMemberGroupCode: "",
      editGroup: {
        id: "",
        code: "",
        name: "",
        isRecord: false,
        type: 0,
        groupLevel: 0,
      },
      addMemberVisible: false,
      rowSelectKeys: [],
    });
    const periodRange = ref<string[]>([]);
    const getList = async (): Promise<void> => {
      try {
        state.loading = true;
        const { data } = await getInterComGroup(queryState.state);
        state.dataSource = data.records;
        queryState.update({ total: data.total });
        queryState.writeCache();
      } catch {
      } finally {
        state.loading = false;
      }
    };
    const handleDelete = async (record: Record<string, unknown>): Promise<void> => {
      await deleteInterComGroup({ code: record.code as string });
      message.success("删除成功");
      getList();
    };
    const handleEdit = async (record: Record<string, unknown>): Promise<void> => {
      state.editTitle = "编辑对讲组";
      state.editGroup = {
        id: record.id as string,
        type: record.type as number,
        code: record.code as string,
        isRecord: record.isRecord as boolean,
        groupLevel: record.groupLevel as number,
        name: record.name as string,
      };
      state.editVisible = true;
    };
    const columns = [
      {
        title: "对讲组名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "等级",
        dataIndex: "groupLevel",
        key: "groupLevel",
        customRender: ({ text }: { text: string }): string => text ?? "--",
      },
      {
        title: "组内成员",
        dataIndex: "devices",
        key: "devices",
        ellipsis: true,
        width: 300,
        customRender: ({ text }: { text: { id: string; name: string }[] }): JSX.Element => {
          const value = text ? text.map((item) => item.name).join(",") : "--";
          return <PopOver content={value}>{value}</PopOver>;
        },
      },
      {
        title: "创建时间",
        dataIndex: "createTime",
        key: "createTime",
        customRender: ({ text }: { text: string }): string => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : ""),
      },
      {
        title: "操作",
        dataIndex: "operate",
        key: "operate",
        customRender: ({ record }: { record: Record<string, string> }): JSX.Element => (
          <>
            <Button
              type="link"
              onClick={() => {
                handleEdit(record);
              }}
            >
              编辑
            </Button>
            <Button
              type="link"
              onClick={() => {
                handleAddMember(record);
              }}
            >
              添加成员
            </Button>
            <PopConfirm
              title="是否取消关联?"
              ok-text="确定"
              cancel-text="取消"
              onConfirm={async () => {
                handleDelete(record);
              }}
            >
              <Button type="link" danger>
                删除
              </Button>
            </PopConfirm>
          </>
        ),
      },
    ];
    const handleAddMember = (record: Record<string, unknown>): void => {
      state.rowSelectKeys = (record.devices as { id: string; code: string }[]).map((item) => item.code);
      state.addMemberGroupCode = record.code as string;
      state.addMemberVisible = true;
    };
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
      "header-btn": (): JSX.Element => (
        <Button
          type="primary"
          onClick={() => {
            state.editVisible = true;
            state.editTitle = "新增对讲组";
            state.editGroup = {
              id: "",
              code: "",
              name: "",
              isRecord: false,
              type: 0,
              groupLevel: 0,
            };
          }}
        >
          新增
        </Button>
      ),
      "content-search": (): JSX.Element => (
        <Form layout="inline">
          <FormItem>
            <Input placeholder="请输入名称/code" v-model:value={queryState.state.keyword} />
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
        <AddGroup title={state.editTitle} v-model:initFormState={state.editGroup} v-model:visible={state.editVisible} onGetList={getList} />
        <AddMember
          v-model:visible={state.addMemberVisible}
          selectedKeys={state.rowSelectKeys}
          groupCode={state.addMemberGroupCode}
          onGetList={getList}
        />
      </>
    );
  },
});
