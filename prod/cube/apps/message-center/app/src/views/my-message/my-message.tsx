import dayjs from "dayjs";
import { defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import { ChannelCodesType, type MsgRecordCustomGroupItem } from "@ghcloud/cube-message-center-service/src/types";
import { AntModal, Button, DateRangePicker, Form, FormItem, Page, PopConfirm, PopOver, Select, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import { authStore } from "@/api/auth-store";
import { cubeMessageCenterService } from "@/api/service";
import { ApplicationSelect } from "@/components/application-select/application-select";
import { Layout } from "@/components/layout/layout";
import { useMessageDetail } from "@/hook/use-message-detail";
import { useTableScroll } from "@/hook/use-table-scroll";
import { logger } from "@/logger";

/** 我的消息 */
export const MyMessage = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const queryState = useCubeQueryState<{
      applicationCode: string | undefined;
      period: string[];
      hasRead: boolean | undefined;
      pageNumber: number;
      pageSize: number;
      total: number;
    }>({
      storage: "url",
      initialState: {
        applicationCode: undefined,
        period: [],
        hasRead: undefined,
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      cacheFields: ["applicationCode", "period", "hasRead", "pageNumber", "pageSize"],
      resolveValue: (field, raw) => {
        if (field === "hasRead") {
          return raw === "true" ? true : raw === "false" ? false : undefined;
        }
        if (field === "pageNumber" || field === "pageSize") {
          return Number(raw);
        }
        if (field === "period") {
          return raw ? raw.split(",") : [];
        }
        return raw || undefined;
      },
    });

    const hasReadOptions = [
      {
        label: "未读",
        value: false,
        color: "rgb(0 0 0 / 85%)",
      },
      {
        label: "已读",
        value: true,
        color: "#d9d9d9",
      },
    ];

    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const params = {
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          applicationCode: queryState.state.applicationCode,
          hasRead: queryState.state.hasRead,
          period: queryState.state.period ? queryState.state.period.join(",") : queryState.state.period,
          channelType: ChannelCodesType.CHANNEL_SITE,
        };
        const { records, total } = await cubeMessageCenterService.getMsgRecordsList(params);
        dataSource.value = records;
        queryState.update({ total });
        queryState.writeCache();
      } catch {
      } finally {
        loading.value = false;
      }
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      queryState.setPage(pageNumber || 1, pageSize);
      getTableData();
    };

    const queryForm = (flag = true): void => {
      queryState.resetPage();
      getTableData();
    };
    const reset = (): void => {
      queryState.update({
        applicationCode: undefined,
        period: [],
        hasRead: undefined,
      });
      queryState.resetPage();
      queryState.clearCache();
      queryForm();
    };
    const delRow = async (record: MsgRecordCustomGroupItem): Promise<void> => {
      try {
        logger.debug(record);
        await cubeMessageCenterService.delMessage(`${record.id}`);
        message.success("操作成功");
        reset();
      } catch (error) {
        logger.error(error);
      }
    };
    const selectedRowKeysData = ref<string[]>([]);
    const rowSelection = ref({
      onChange: (selectedRowKeys: string[]) => {
        selectedRowKeysData.value = selectedRowKeys;
      },
    });
    const deleteLoading = ref(false);
    const readAllLoading = ref(false);
    const readBatchLoading = ref(false);
    const handleBatchDelete = (): void => {
      AntModal.confirm({
        centered: true,
        content: "确定要删除当前选中?",
        onOk() {
          try {
            deleteLoading.value = true;
            cubeMessageCenterService.delBatchMessage({ ids: selectedRowKeysData.value }).then(() => {
              message.success("操作成功");
              selectedRowKeysData.value.length = 0;
              queryForm();
            });
          } catch {
          } finally {
            AntModal.destroyAll();
            deleteLoading.value = false;
          }
        },
        onCancel() {
          AntModal.destroyAll();
        },
      });
    };
    const handleBatchRead = async (ids: string[]): Promise<void> => {
      const { batchRead } = useMessageDetail(authStore);
      try {
        readBatchLoading.value = true;
        await batchRead(ids);
        message.success("操作成功");
        selectedRowKeysData.value.length = 0;
        queryForm(false);
      } catch (error) {
        message.error(error as string);
      } finally {
        readBatchLoading.value = false;
      }
    };
    const toDetail = async (record: MsgRecordCustomGroupItem): Promise<void> => {
      const { getMessageDetailUrl } = useMessageDetail(authStore);
      try {
        message.loading("查询中...", 0);
        const target = await getMessageDetailUrl(record);
        message.destroy();
        if (target) {
          history.pushState({ current: location.pathname + location.search }, "", target);
        } else {
          message.info("暂无业务跳转");
        }
      } catch (error) {
        message.destroy();
        if (error instanceof Error) {
          message.error(error.message);
        } else {
          message.error("未知错误");
        }
      }
    };
    const handleReadAll = async (): Promise<void> => {
      try {
        readAllLoading.value = true;
        await cubeMessageCenterService.readAllMessage({ channelType: "CHANNEL_SITE" });
        message.success("操作成功");
        queryForm();
      } catch {
      } finally {
        readAllLoading.value = false;
      }
    };
    const { scrollY } = useTableScroll();
    const columns = [
      {
        title: "消息内容",
        dataIndex: "msgContent",
        ellipsis: true,
        width: 600,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "发送时间",
        dataIndex: "sendTime",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "";
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        title: "应用名称",
        dataIndex: "applicationName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "消息状态",
        dataIndex: "hasRead",
        ellipsis: true,
        width: 150,
        customRender: ({ text }: { text: boolean | undefined }): JSX.Element => {
          const textVal = hasReadOptions.find((item) => item.value === text) ?? undefined;
          return (
            <PopOver content={textVal?.label || "--"}>
              <span style={{ color: textVal?.color }}>{textVal?.label || "--"}</span>
            </PopOver>
          );
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 150,
        fixed: "right",
        customRender: ({ record }: { record: MsgRecordCustomGroupItem }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                toDetail(record);
              }}
            >
              详情
            </Button>
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
        ),
      },
    ];
    onMounted(() => {
      getTableData();
    });

    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <>
          <div>
            <Button
              disabled={selectedRowKeysData.value.length === 0}
              class="mr-16"
              type="primary"
              danger
              loading={deleteLoading.value}
              onClick={handleBatchDelete}
            >
              批量移除
            </Button>
            <Button
              disabled={selectedRowKeysData.value.length === 0}
              class="mr-16"
              type="primary"
              loading={readBatchLoading.value}
              onClick={async () => handleBatchRead(selectedRowKeysData.value)}
            >
              批量已读
            </Button>
            <Button type="primary" loading={readAllLoading.value} onClick={handleReadAll}>
              全部已读
            </Button>
          </div>
        </>
      ),
      "layout-content": (): JSX.Element => (
        <>
          <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
            <FormItem label="发布时间" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <DateRangePicker v-model:value={queryState.state.period} />
            </FormItem>
            <FormItem label="应用名称" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <ApplicationSelect placeholder="请选择应用名称" v-model:value={queryState.state.applicationCode} width="180px" />
            </FormItem>
            <FormItem label="消息状态" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Select
                options={hasReadOptions}
                style={{ width: "180px" }}
                placeholder="请选择消息状态"
                v-model:value={queryState.state.hasRead}
              />
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
            rowSelection={rowSelection.value}
            columns={columns}
            loading={loading.value}
            dataSource={dataSource.value}
            pagination={false}
            scrollY={scrollY.value}
            tableCode={tableCode}
            applicationCode={__ENV__.applicationCode}
          />
        </>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          v-model:current={queryState.state.pageNumber}
          v-model:pageSize={queryState.state.pageSize}
          v-model:total={queryState.state.total}
          onPageChange={pageChange}
        />
      ),
      "footer-btn": (): JSX.Element => <span>已选：{selectedRowKeysData.value.length} 条数据</span>,
    };
    return (): JSX.Element => (
      <>
        <Layout title={pageTitle ?? "我的消息"} v-slots={layoutSlots} />
      </>
    );
  },
});
