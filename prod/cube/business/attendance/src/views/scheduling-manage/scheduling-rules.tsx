import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRoute } from "vue-router";

import { hasPermission } from "@ghcloud/cube-permission-codes";
import { AntModal, Button, Form, FormItem, Input, Page, PopConfirm, PopOver, message } from "@ghcloud/cube-ui";
import { useListQueryCache, usePageName } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import { schedulingRuleDel, schedulingRulePage, type SchedulingRule, type SameShift } from "@/api/scheduling-manage";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";
import { logger } from "@/logger";
import { appFunctionCodes } from "@/permission";
import { classesTypeOptions } from "@/types/classes";
export const SchedulingRules = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const formState = reactive({
      name: "",
    });
    const permission = appFunctionCodes.attendanceSchedulingRules;
    const add = (): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        "/portal/attendance-management/scheduling-rules-form?action=add",
      );
    };
    const editRow = (record: { id: string }, detail?: boolean): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/attendance-management/scheduling-rules-form?id=${record.id}&action=${detail ? "detail" : "edit"}`,
      );
    };
    const delRow = async (record: { id: string }): Promise<void> => {
      try {
        loading.value = true;
        await schedulingRuleDel({ id: record.id });
        AntModal.destroyAll();
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
        title: "排班规则名称",
        dataIndex: "name",
        ellipsis: true,
        width: 250,
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "规则内容",
        dataIndex: "themeName",
        ellipsis: true,
        customRender: ({ record }: { record: SchedulingRule }): VNode => {
          const sameShift: SameShift[] = record.sameShift ? JSON.parse(record.sameShift as string) : [];
          const showLimit = record.ways !== "FIXED" && (!!record.continuousDays || !!record.intervalHour || record.sameShift.length > 0);
          const res = (
            <>
              <span style="display:block">{`排班方式：${record.ways === "FIXED" ? "固定班制" : "倒班制"}`}</span>
              {record.ways !== "FIXED" && (
                <span style="display:flex">
                  限制条件：{!showLimit && "无"}
                  {showLimit && (
                    <div>
                      {!!record.continuousDays && (
                        <span style="display:block">不允许同一人一个月内连续排超过{record.continuousDays}天班</span>
                      )}
                      {!!record.intervalHour && (
                        <span style="display:block">同一人一天连续上两个班次时，中间必须间隔{record.intervalHour}小时</span>
                      )}
                      {sameShift.map((e) => {
                        const sameShiftType: string[] = [];
                        classesTypeOptions.forEach((ele) => {
                          if (e.sameShiftType?.includes(ele.value)) {
                            sameShiftType.push(ele.label);
                          }
                        });
                        return e.sameShiftNumber ? (
                          <span style="display:block">
                            不允许同一个人一个月内有超过{e.sameShiftNumber}个以上的规定{sameShiftType.join("、") ?? "--"}班次
                          </span>
                        ) : (
                          ""
                        );
                      })}
                    </div>
                  )}
                </span>
              )}
            </>
          );

          return <PopOver content={res as unknown as string}>{res}</PopOver>;
        },
      },
      {
        title: "规则编辑时间",
        dataIndex: "updateTime",
        ellipsis: true,
        width: 250,
        customRender: ({ text }: { text: string }): VNode => {
          const time = dayjs(text).format("YYYY-MM-DD HH:mm:ss");
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 250,
        customRender: ({ record }: { record: { id: string; name: string } }): VNode => {
          return (
            <>
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
        const res = await schedulingRulePage({
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
      "layout-header": (): VNode | boolean => {
        return (
          hasPermission(permission.add) && (
            <Button type="primary" onClick={add}>
              新增排班规则
            </Button>
          )
        );
      },
      "layout-content": (): VNode => {
        return (
          <>
            <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <Input v-model:value={formState.name} placeholder="请输入名称" showCount={false} />
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
        <Layout title={pageTitle ?? "排班规则"} v-slots={layoutSlots} />
      </>
    );
  },
});
