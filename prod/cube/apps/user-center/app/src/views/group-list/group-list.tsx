import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { Button, DateRangePicker, Form, FormItem, Input, Page, PopConfirm, PopOver, Select, message } from "@ghcloud/cube-ui";
import { usePageName, queryParameter } from "@ghcloud/cube-utils";
import type { MemberGroupDTO } from "@ghcloud/cube-zhongda-heshun-service";
import { AliasTable } from "@ghcloud/generic-component";

import { cubeZDUserService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";

export const GroupList = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const formState = reactive({
      keyword: "",
      createTime: [],
    });

    const columns = [
      {
        title: "组织名称",
        dataIndex: "groupName",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "创建时间",
        dataIndex: "createTime",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          return <PopOver content={time}>{time}</PopOver>;
        },
      },
      {
        title: "用户数",
        dataIndex: "userCount",
        ellipsis: true,
        customRender: ({ text }: { text: string | number }) => {
          return <PopOver content={text ?? "--"}>{text ?? "--"}</PopOver>;
        },
      },
      {
        title: "管理者",
        dataIndex: "memberUserName",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 120,
        ellipsis: true,
        customRender: ({ record }: { record: MemberGroupDTO }) => {
          return (
            <>
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
          );
        },
      },
    ];

    const loading = ref(false);
    const dataSource = ref<MemberGroupDTO[]>([]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const writeCache = (): void => {
      const query: Record<string, unknown> = {
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
        keyword: formState.keyword,
        createTime: formState.createTime.length ? formState.createTime.join(",") : undefined,
      };
      if (query.pageNumber === 1) delete query.pageNumber;
      if (query.pageSize === 10) delete query.pageSize;
      if (!query.keyword) delete query.keyword;
      if (!query.createTime) delete query.createTime;
      queryParameter.setAddressQuery(query);
    };

    const readCache = (): void => {
      const cache = queryParameter.getQuery() || {};
      if (cache.pageNumber) {
        pagination.value.pageNumber = Number(cache.pageNumber);
      }
      if (cache.pageSize) {
        pagination.value.pageSize = Number(cache.pageSize);
      }
      if (cache.keyword !== undefined) {
        formState.keyword = String(cache.keyword);
      }
      if (cache.createTime) {
        formState.createTime = String(cache.createTime).split(",").filter(Boolean);
      }
    };
    readCache();

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const params = {
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          keyword: formState.keyword,
          createTime: formState.createTime ? formState.createTime.join(",") : formState.createTime,
        };
        const res = await cubeZDUserService.getMemberGroupPage(params);
        if (res) {
          dataSource.value = res?.records || [];
          pagination.value.total = res?.total || 0;
        }
      } catch {
      } finally {
        loading.value = false;
      }
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData();
      writeCache();
    };

    const queryForm = (): void => {
      pagination.value.pageNumber = 1;
      getTableData();
      writeCache();
    };

    const reset = (): void => {
      formState.keyword = "";
      formState.createTime = [];
      pagination.value.pageNumber = 1;
      pagination.value.pageSize = 10;
      getTableData();
      queryParameter.setAddressQuery({});
    };

    const delRow = async (record: MemberGroupDTO): Promise<void> => {
      try {
        await cubeZDUserService.deleteMemberGroup({ id: record.id as unknown as string });
        message.success("操作成功");
        reset();
      } catch {}
    };
    const { scrollY } = useTableScroll();

    onMounted(() => {
      getTableData();
    });

    const layoutSlots = {
      "layout-content": () => {
        return (
          <>
            <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="">
                <Input
                  v-model:value={formState.keyword}
                  placeholder="组织名称、管理者/普通成员名称"
                  showCount={false}
                  style={{ width: "300px" }}
                />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="创建时间">
                <DateRangePicker v-model:value={formState.createTime} allowClear={false} />
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
              scrollY={scrollY.value}
              tableCode={tableCode}
              applicationCode={__ENV__.applicationCode}
            />
          </>
        );
      },
      "footer-page": () => {
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
    return () => (
      <>
        <Layout title={pageTitle ?? "组织管理"} v-slots={layoutSlots} />
      </>
    );
  },
});
