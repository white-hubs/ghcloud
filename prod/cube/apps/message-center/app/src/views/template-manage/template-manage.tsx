import { defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import type { SatMsgChannels } from "@ghcloud/cube-message-center-service";
import { ChannelCodesType, type MsgTemplate } from "@ghcloud/cube-message-center-service/src/types";
import { Button, Form, FormItem, Input, Page, PopOver, RadioGroup, SyncOutlined } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import { RelateModal } from "./components/relate-modal";
import { cubeMessageCenterService } from "@/api/service";
import { ApplicationSelect } from "@/components/application-select/application-select";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";

interface TemplateManageQueryState {
  pageNumber: number;
  pageSize: number;
  applicationCode: string | undefined;
  channelCode: string | undefined;
  keyword: string | undefined;
  total: number;
}

/** 模板管理 */
export const TemplateManage = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const queryState = useCubeQueryState<TemplateManageQueryState>({
      initialState: {
        pageNumber: 1,
        pageSize: 10,
        applicationCode: undefined,
        channelCode: undefined,
        keyword: undefined,
        total: 0,
      },
      storage: "url",
      cacheFields: ["pageNumber", "pageSize", "applicationCode", "channelCode", "keyword"],
      resolveValue: (field, raw) => {
        if (field === "pageNumber" || field === "pageSize") {
          return Number(raw);
        }
        if (field === "applicationCode" || field === "channelCode") {
          return raw || undefined;
        }
        return raw;
      },
    });
    const relateModalRef = ref<{ openModal: (record: MsgTemplate) => void }>();

    const handleRelate = (record: MsgTemplate): void => {
      relateModalRef.value?.openModal(record);
    };
    const columns = [
      {
        title: "模板ID",
        dataIndex: "id",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "模板名称",
        dataIndex: "name",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "应用名称",
        dataIndex: "applicationName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "使用场景",
        dataIndex: "msgSceneName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "模板内容",
        dataIndex: "content",
        ellipsis: true,
        width: 600,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
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
              disabled={
                record.channelCode === ChannelCodesType.CHANNEL_APP || queryState.state.channelCode === ChannelCodesType.CHANNEL_APP
              }
              onClick={() => {
                handleRelate(record);
              }}
            >
              关联
            </Button>
          </>
        ),
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
          channelCode: queryState.state.channelCode,
          keyword: queryState.state.keyword,
        };
        const { records, total } = await cubeMessageCenterService.getMsgTemplatePage(params);
        dataSource.value = records;
        queryState.update({ total });
        queryState.writeCache();
      } catch {
      } finally {
        loading.value = false;
      }
    };
    const msgChannelList = ref<{ label: string; value: string }[]>([]);
    const getData = async (): Promise<void> => {
      try {
        const res = await cubeMessageCenterService.satMsgChannels();
        if (res) {
          msgChannelList.value = res?.map((e: SatMsgChannels) => ({
            label: e.channelName,
            value: e.channelCode,
          }));
          if (!queryState.state.channelCode) {
            queryState.update({ channelCode: msgChannelList.value[0]?.value });
          }
        }
      } catch {}
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      queryState.setPage(pageNumber, pageSize);
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
        channelCode: msgChannelList.value[0]?.value,
        keyword: undefined,
      });
      queryState.resetPage();
      queryState.clearCache();
      getTableData();
    };
    const { scrollY } = useTableScroll();
    const refreshLoading = ref(false);
    const handleRefresh = async (): Promise<void> => {
      try {
        refreshLoading.value = true;
        await cubeMessageCenterService.refreshSatMsgTmp();
        getTableData();
      } catch {
      } finally {
        refreshLoading.value = false;
      }
    };
    onMounted(async () => {
      await getData();
      getTableData();
    });

    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <>
          <div>
            <Button type="primary" onClick={handleRefresh}>
              <SyncOutlined spin={refreshLoading.value} />
              更新模板
            </Button>
          </div>
        </>
      ),
      "layout-content": (): JSX.Element => (
        <>
          <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <RadioGroup
                v-model:value={queryState.state.channelCode}
                buttonStyle="solid"
                options={msgChannelList.value}
                onchange={async () => getTableData()}
              />
            </FormItem>
            <FormItem label="应用名称" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <ApplicationSelect placeholder="请选择应用名称" v-model:value={queryState.state.applicationCode} width="180px" />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Input
                v-model:value={queryState.state.keyword}
                placeholder="模板名称/编号"
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
          <AliasTable
            rowKey="id"
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
    };
    return (): JSX.Element => (
      <>
        <Layout title={pageTitle ?? "模板管理"} v-slots={layoutSlots} />
        <RelateModal channelCode={queryState.state.channelCode ?? ""} ref={relateModalRef} onEnter={getTableData} />
      </>
    );
  },
});
