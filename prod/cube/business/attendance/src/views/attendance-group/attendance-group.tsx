import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRoute } from "vue-router";

import { hasPermission } from "@ghcloud/cube-permission-codes";
import { Button, Form, FormItem, Input, Page, PopConfirm, PopOver, message } from "@ghcloud/cube-ui";
import { useListQueryCache, usePageName } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import { attendanceGroupDel, attendanceGroupPage } from "@/api/attendance-group";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";
import { logger } from "@/logger";
import { appFunctionCodes } from "@/permission";
export const AttendanceGroup = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const formState = reactive({
      name: "",
    });
    const permission = appFunctionCodes.attendanceGroup;
    const add = (): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        "/portal/attendance-management/attendance-group-form?action=add",
      );
    };
    const editRow = (record: { id: string }, detail?: boolean): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/attendance-management/attendance-group-form?id=${record.id}&action=${detail ? "detail" : "edit"}`,
      );
    };
    const delRow = async (record: { id: string }): Promise<void> => {
      try {
        loading.value = true;
        await attendanceGroupDel({ id: record.id });
        message.success("操作成功");
        reset();
      } catch (error) {
        logger.error(error);
      } finally {
        loading.value = false;
      }
    };

    const columns = [
      {
        title: "考勤组名称",
        dataIndex: "name",
        ellipsis: true,
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "考勤组人数",
        ellipsis: true,
        customRender: ({ record }: { record: { ranges: "ALL" | "PART"; staffNumber: number } }): VNode => {
          const text = record.ranges === "ALL" ? "所有人" : record.staffNumber.toString();
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        customRender: ({ record }: { record: { id: string } }): VNode => {
          return (
            <>
              {hasPermission(permission.info) && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    editRow(record, true);
                  }}
                >
                  详情
                </Button>
              )}
              {hasPermission(permission.update) && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    editRow(record);
                  }}
                >
                  编辑
                </Button>
              )}
              {hasPermission(permission.delete) && (
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
              )}
            </>
          );
        },
      },
    ];

    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    const queryCache = useListQueryCache({
      defaults: { name: "", pageNumber: 1, pageSize: 10 },
      getState: () => ({ name: formState.name, pageNumber: pagination.value.pageNumber, pageSize: pagination.value.pageSize }),
      setState: (next) => {
        formState.name = (next.name as string) ?? "";
        pagination.value.pageNumber = Number(next.pageNumber ?? 1);
        pagination.value.pageSize = Number(next.pageSize ?? 10);
      },
    });

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await attendanceGroupPage({
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          ...formState,
        });
        if (res.data) {
          const { records, total } = res.data;
          dataSource.value = records;
          pagination.value.total = total;
        }
      } catch (error) {
        logger.debug(error);
      } finally {
        loading.value = false;
      }
    };
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData().then(() => queryCache.sync());
    };

    const queryForm = async (): Promise<void> => {
      pagination.value.pageNumber = 1;
      await getTableData();
      await queryCache.sync();
    };
    const reset = async (): Promise<void> => {
      await queryCache.reset();
      await getTableData();
    };
    const { scorllY } = useTableScroll();

    onMounted(async () => {
      await queryCache.hydrateAndQuery(getTableData);
    });

    const layoutSlots = {
      "layout-header": (): VNode => {
        return (hasPermission(permission.add) && (
          <Button type="primary" onClick={add}>
            新增考勤组
          </Button>
        )) as VNode;
      },
      "layout-content": (): VNode => {
        return (
          <>
            <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <Input v-model:value={formState.name} placeholder="考勤组名称" showCount={false} />
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
              scrollY={scorllY.value}
              tableCode={tableCode}
              applicationCode={__ENV__.applicationCode}
            />
          </>
        );
      },
      "footer-page": (): VNode => {
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
    return (): VNode => (
      <>
        <Layout title={pageTitle ?? "考勤组管理"} v-slots={layoutSlots} />
      </>
    );
  },
});
