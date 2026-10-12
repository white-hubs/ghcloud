import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import { Button, Form, FormItem, Input, Page, PopOver } from "@ghcloud/cube-ui";
import { AliasTable } from "@ghcloud/generic-component";

import { cubeDeviceSuperviseService } from "@/api/service";
import { AreaTreeSelect } from "@/components/business/area-tree-select/area-tree-select";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";
import { logger } from "@/logger";

interface HealthAnalysisQueryState {
  anyMatchedAreaId: string[];
  keyword: string;
  pageNumber: number;
  pageSize: number;
  total: number;
}

export const HealthAnalysis = defineComponent({
  setup: () => {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const { scrollY } = useTableScroll();

    const queryState = useCubeQueryState<HealthAnalysisQueryState>({
      initialState: {
        anyMatchedAreaId: [],
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

    const queryForm = (): void => {
      queryState.resetPage();
      queryState.writeCache();
      getTableData();
    };
    const reset = (): void => {
      queryState.update({
        anyMatchedAreaId: [],
        keyword: "",
      });
      queryState.resetPage();
      queryState.clearCache();
      getTableData();
    };
    const pageChange = (pageNumber: number, pageSize: number): void => {
      queryState.setPage(pageNumber || 1, pageSize);
      getTableData();
    };
    const toDetail = (record: { id: string; code: string; name: string; areaName: string }): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/device-center/health-detail?id=${record.id}&code=${encodeURIComponent(record.code)}&name=${encodeURIComponent(record.name)}&areaName=${encodeURIComponent(record.areaName)}`,
      );
    };
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const params = {
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          anyMatchedAreaId: queryState.state.anyMatchedAreaId
            ? queryState.state.anyMatchedAreaId[queryState.state.anyMatchedAreaId.length - 1]
            : "",
          keyword: queryState.state.keyword,
        };
        const res = await cubeDeviceSuperviseService.getHealthAnalysisPage(params);
        if (res) {
          const { records, total } = res;
          dataSource.value = records;
          queryState.update({ total });
          queryState.writeCache();
        }
      } catch (error) {
        logger.error(error);
      } finally {
        loading.value = false;
      }
    };
    onMounted(() => {
      getTableData();
    });
    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const columns = [
      {
        title: "设备编号",
        dataIndex: "code",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "设备名称",
        dataIndex: "name",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "所在区域",
        dataIndex: "areaName",
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "设备健康度",
        dataIndex: "healthValue",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "最新分析时间",
        dataIndex: "createTime",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "";
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },

      {
        title: "操作",
        dataIndex: "maintenanceCast",
        ellipsis: true,
        width: 180,
        fixed: "right",
        customRender: ({ record }: { record: { id: string; code: string; name: string; areaName: string } }): JSX.Element => {
          return (
            <Button
              type="link"
              onClick={() => {
                toDetail(record);
              }}
            >
              详情
            </Button>
          );
        },
      },
    ];
    const layoutSlots = {
      "layout-content": (): JSX.Element => {
        return (
          <>
            <Form layout="inline" style={{ margin: "10px 0 " }}>
              <FormItem label="所在区域" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <AreaTreeSelect v-model:value={queryState.state.anyMatchedAreaId} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <Input v-model:value={queryState.state.keyword} placeholder="请输入设备名称或编号" showCount={false} />
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
              scrollY={scrollY.value - 50}
              applicationCode={__ENV__.applicationCode}
            />
          </>
        );
      },
      "footer-page": (): JSX.Element => {
        return (
          <Page
            v-model:current={queryState.state.pageNumber}
            v-model:pageSize={queryState.state.pageSize}
            v-model:total={queryState.state.total}
            onPageChange={pageChange}
          />
        );
      },
    };
    return (): JSX.Element => (
      <>
        <Layout title="健康分析" v-slots={layoutSlots} />
      </>
    );
  },
});
