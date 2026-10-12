import { computed, defineComponent, onMounted, ref } from "vue";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import type { SatMsgChannels } from "@ghcloud/cube-message-center-service";
import type { ChannelCodesType, MsgSceneReceive, MsgTemplate } from "@ghcloud/cube-message-center-service/src/types";
import { Button, Checkbox, Form, FormItem, Input, Page, PopOver, SyncOutlined, Table, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { ReceiveModal } from "./components/receive-modal";
import { cubeMessageCenterService } from "@/api/service";
import { ApplicationSelect } from "@/components/application-select/application-select";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";

interface MessageManageQueryState {
  applicationCode: string | undefined;
  keyword: string | undefined;
  pageNumber: number;
  pageSize: number;
  total: number;
}

/** 消息接收配置 */
export const MessageManage = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();

    const queryState = useCubeQueryState<MessageManageQueryState>({
      initialState: {
        applicationCode: undefined,
        keyword: undefined,
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      storage: "url",
      cacheFields: ["applicationCode", "keyword", "pageNumber", "pageSize"],
      resolveValue: (field, raw) => {
        if (field === "pageNumber" || field === "pageSize") {
          return Number(raw);
        }
        return raw;
      },
    });

    const receiveModalRef = ref<{ openModal: (record: MsgTemplate) => void }>();

    const handleReceive = (record: MsgTemplate): void => {
      receiveModalRef.value?.openModal(record);
    };
    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const params = {
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          applicationCode: queryState.state.applicationCode,
          keyword: queryState.state.keyword,
        };
        const { records, total } = await cubeMessageCenterService.getMsgSceneReceivesPage(params);
        dataSource.value = records;
        queryState.update({ total });
        queryState.writeCache();
      } catch {
      } finally {
        loading.value = false;
      }
    };
    const msgChannelList = ref<SatMsgChannels[]>([]);
    const getData = async (): Promise<void> => {
      try {
        const res = await cubeMessageCenterService.satMsgChannels();
        if (res) {
          msgChannelList.value = res;
        }
      } catch {}
    };
    const columns = [
      {
        title: "应用名称",
        dataIndex: "applicationName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "场景名称",
        dataIndex: "msgSceneName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
    ];
    const columnsRight = [
      {
        title: "操作",
        dataIndex: "action",
        width: 150,
        fixed: "right",
        customRender: ({ record }: { record: MsgTemplate }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                handleReceive(record);
              }}
            >
              接收模式
            </Button>
          </>
        ),
      },
    ];
    const checkChange = async (checked: boolean, channelCode: string, record: MsgSceneReceive): Promise<void> => {
      // debugger
      try {
        if (checked) {
          await cubeMessageCenterService.updateMsgSettingChannel(record.id, channelCode);
          message.success("操作成功");
        } else {
          await cubeMessageCenterService.deleteMsgSettingChannel(record.id, channelCode);
          message.success("操作成功");
        }
        getTableData();
      } catch {}
    };
    const tableColumns = computed(() => {
      const columnList = msgChannelList.value.map((item) => ({
        title: `${item.channelName}`,
        dataIndex: `${item.channelCode}`,
        ellipsis: true,
        width: 180,
        align: "center",
        customRender: ({ record }: { record: MsgSceneReceive }): JSX.Element => {
          const isChecked = record.channelCodes.includes(item.channelCode as ChannelCodesType);
          return (
            <>
              <Checkbox
                checked={isChecked}
                onUpdate:checked={(bool) => {
                  checkChange(bool, item.channelCode, record);
                }}
              />
            </>
          );
        },
      }));
      return [...columns, ...columnList, ...columnsRight];
    });

    const pageChange = (pageNumber: number, pageSize: number): void => {
      queryState.setPage(pageNumber || 1, pageSize);
      getTableData();
    };

    const queryForm = (): void => {
      queryState.resetPage();
      queryState.writeCache();
      getTableData();
    };
    const reset = (): void => {
      queryState.update({
        applicationCode: undefined,
        keyword: undefined,
      });
      queryState.resetPage();
      queryState.clearCache();
      getTableData();
    };
    const { scrollY } = useTableScroll();

    onMounted(async () => {
      await getData();
      getTableData();
    });

    const refreshLoading = ref(false);
    const handleRefresh = async (): Promise<void> => {
      try {
        refreshLoading.value = true;
        await cubeMessageCenterService.refreshMsgTemplate();
        getTableData();
      } catch {
      } finally {
        refreshLoading.value = false;
      }
    };
    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <>
          <div>
            <Button type="primary" onClick={handleRefresh}>
              <SyncOutlined spin={refreshLoading.value} />
              更新应用
            </Button>
          </div>
        </>
      ),
      "layout-content": (): JSX.Element => (
        <>
          <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
            <FormItem label="应用名称" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <ApplicationSelect placeholder="请选择应用名称" v-model:value={queryState.state.applicationCode} width="180px" />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Input
                v-model:value={queryState.state.keyword}
                placeholder="场景名称"
                showCount={false}
                allowClear
                onChange={() => getTableData}
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
          <Table
            rowKey="id"
            columns={tableColumns.value}
            loading={loading.value}
            dataSource={dataSource.value}
            pagination={false}
            scrollY={scrollY.value}
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
    };
    return (): JSX.Element => (
      <>
        <Layout title={pageTitle ?? "消息接收配置"} v-slots={layoutSlots} />
        <ReceiveModal ref={receiveModalRef} onEnter={getTableData} />
      </>
    );
  },
});
