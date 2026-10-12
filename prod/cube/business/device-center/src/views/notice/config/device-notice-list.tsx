import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import { Button, Form, FormItem, Input, Page, PopOver, Switch, message } from "@ghcloud/cube-ui";
import { AliasTable } from "@ghcloud/generic-component";

import { cubeDeviceSuperviseService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";
import { logger } from "@/logger";

interface DeviceNoticeConfigQueryState {
  keyword: string;
  pageNumber: number;
  pageSize: number;
  total: number;
}

/** 设备通知 - 通知配置列表 */
export const DeviceNoticeConfig = defineComponent({
  setup: () => {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");

    const queryState = useCubeQueryState<DeviceNoticeConfigQueryState>({
      initialState: {
        keyword: "",
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      storage: "url",
      cacheFields: ["keyword", "pageNumber", "pageSize"],
      resolveValue: (field, raw) => {
        if (field === "pageNumber" || field === "pageSize") return Number(raw);
        return raw;
      },
    });

    const editRow = (record: { id: string; name: string }, detail?: boolean): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/device-center/device-notice-config-detail?deviceId=${record.id}&action=${detail ? "detail" : "edit"}`,
      );
    };

    const columns = [
      {
        title: "通知设备",
        dataIndex: "name",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "所属产品",
        dataIndex: "prodName",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "产品品类",
        dataIndex: "productCategoryName",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "通知开关",
        dataIndex: "enable",
        ellipsis: true,
        customRender: ({ record }: { record: { id: string; enable: boolean } }): JSX.Element => (
          <Switch
            v-model:value={record.enable}
            checkedChildren="启用"
            unCheckedChildren="禁用"
            onChange={(val) => {
              handleSwitch(val, record);
            }}
          />
        ),
      },
      {
        title: "操作",
        dataIndex: "action",
        customRender: ({ record }: { record: { id: string; name: string } }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                editRow(record);
              }}
            >
              配置
            </Button>
          </>
        ),
      },
    ];

    const handleSwitch = async (val: boolean, record: { id: string; enable: boolean }): Promise<void> => {
      cubeDeviceSuperviseService
        .updateDeviceNotifyConfigEnable({ enabled: val, id: record.id })
        .then(() => {
          message.success("操作成功");
          getTableData();
        })
        .catch((error) => {
          record.enable = !val;
        });
    };
    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await cubeDeviceSuperviseService.getNotifyConfigPage({
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          keyword: queryState.state.keyword,
        });
        if (res) {
          const { records, total } = res;
          dataSource.value = records;
          queryState.update({ total });
          queryState.writeCache();
        }
      } catch (error) {
        logger.debug(error);
      } finally {
        loading.value = false;
      }
    };

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
        keyword: "",
      });
      queryState.resetPage();
      queryState.clearCache();
      getTableData();
    };
    const { scrollY } = useTableScroll();

    onMounted(() => {
      getTableData();
    });

    const layoutSlots = {
      "layout-content": (): JSX.Element => (
        <>
          <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="">
              <Input v-model:value={queryState.state.keyword} placeholder="请输入设备名称搜索" showCount={false} />
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
            tableCode={tableCode}
            pagination={false}
            scrollY={scrollY.value}
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
        <Layout title="通知配置" v-slots={layoutSlots} />
      </>
    );
  },
});
