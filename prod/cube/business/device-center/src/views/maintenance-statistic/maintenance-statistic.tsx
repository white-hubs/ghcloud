import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import type { MaintainStatistics } from "@ghcloud/cube-iot-center-service";
import { Button, Form, FormItem, Input, Page, PopOver, Table, message } from "@ghcloud/cube-ui";

import { cubeDeviceSuperviseService } from "@/api/service";
import { AreaTreeSelect } from "@/components/business/area-tree-select/area-tree-select";
import { ProductIotCategoryTreeSelect } from "@/components/business/product-iot-category-tree-select/product-iot-category-tree-select";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";

import "@/styles/common.less";

interface MaintenanceStatisticQueryState {
  productCategoryCode: string[];
  anyMatchedAreaId: string;
  keyword: string;
  pageNumber: number;
  pageSize: number;
  total: number;
}

export const MaintenanceStatistic = defineComponent({
  setup: () => {
    const queryState = useCubeQueryState<MaintenanceStatisticQueryState>({
      initialState: {
        productCategoryCode: [],
        anyMatchedAreaId: "",
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
    const exportLoading = ref(false);
    const exportExcel = async (): Promise<void> => {
      try {
        exportLoading.value = true;
        const prodCode =
          queryState.state.productCategoryCode && Array.isArray(queryState.state.productCategoryCode)
            ? queryState.state.productCategoryCode[queryState.state.productCategoryCode.length - 1]
            : queryState.state.productCategoryCode;
        const params = {
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          keyword: queryState.state.keyword,
          anyMatchedAreaId: queryState.state.anyMatchedAreaId
            ? queryState.state.anyMatchedAreaId[queryState.state.anyMatchedAreaId.length - 1]
            : "",
          productCategoryCode: prodCode,
        };
        const res = await cubeDeviceSuperviseService.deviceMaintainStatisticsExport(params);
        if (res) {
          const link = document.createElement("a");
          const blob = new Blob([res as BlobPart], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "维护统计.xlsx");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch {
      } finally {
        setTimeout(() => {
          exportLoading.value = false;
        }, 1000);
      }
    };

    const columns = [
      {
        title: "设备编号",
        dataIndex: "deviceCode",
        ellipsis: true,
        width: 180,
        fixed: "left",
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "设备名称",
        dataIndex: "deviceName",
        ellipsis: true,
        width: 180,
        fixed: "left",
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "所属产品",
        dataIndex: "productName",
        ellipsis: true,
        align: "center",
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "产品品类",
        dataIndex: "productCategoryName",
        ellipsis: true,
        width: 180,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "所在区域",
        dataIndex: "areaName",
        ellipsis: true,
        width: 180,
        align: "center",
        customRender: ({ record }: { record: MaintainStatistics }): JSX.Element => {
          const textVal = record?.area?.name ?? "";
          return <PopOver content={textVal || "--"}>{textVal || "--"}</PopOver>;
        },
      },
      {
        title: "隐患数据",
        dataIndex: "hiddenDanger",
        children: [
          {
            title: "隐患总次数",
            dataIndex: "num",
            ellipsis: true,
            width: 180,
            align: "center",
            customRender: ({ record }: { record: MaintainStatistics }): JSX.Element => {
              const textVal = record?.hiddenDanger?.num ?? "";
              return <PopOver content={textVal || "--"}>{textVal || "--"}</PopOver>;
            },
          },
          {
            title: "已处理隐患数",
            dataIndex: "handlerNum",
            ellipsis: true,
            width: 180,
            align: "center",
            customRender: ({ record }: { record: MaintainStatistics }): JSX.Element => {
              const textVal = record?.hiddenDanger?.handlerNum ?? "";
              return <PopOver content={textVal || "--"}>{textVal || "--"}</PopOver>;
            },
          },
          {
            title: "未处理隐患数",
            dataIndex: "unHandlerNum",
            ellipsis: true,
            width: 180,
            align: "center",
            customRender: ({ record }: { record: MaintainStatistics }): JSX.Element => {
              const textVal = record?.hiddenDanger?.unHandlerNum ?? "";
              return <PopOver content={textVal || "--"}>{textVal || "--"}</PopOver>;
            },
          },
          {
            title: "隐患处理率",
            dataIndex: "handlerRatio",
            ellipsis: true,
            width: 180,
            align: "center",
            customRender: ({ record }: { record: MaintainStatistics }): JSX.Element => {
              const textVal = record?.hiddenDanger?.handlerRatio ? `${record?.hiddenDanger?.handlerRatio}%` : "";
              return <PopOver content={textVal || "--"}>{textVal || "--"}</PopOver>;
            },
          },
        ],
      },
      {
        title: "报修数据",
        dataIndex: "fault",
        children: [
          {
            title: "报修总次数",
            dataIndex: "num",
            ellipsis: true,
            width: 180,
            align: "center",
            customRender: ({ record }: { record: MaintainStatistics }): JSX.Element => {
              const textVal = record?.fault?.num ?? "";
              return <PopOver content={textVal || "--"}>{textVal || "--"}</PopOver>;
            },
          },
          {
            title: "已处理报修数",
            dataIndex: "handlerNum",
            ellipsis: true,
            width: 180,
            align: "center",
            customRender: ({ record }: { record: MaintainStatistics }): JSX.Element => {
              const textVal = record?.fault?.handlerNum ?? "";
              return <PopOver content={textVal || "--"}>{textVal || "--"}</PopOver>;
            },
          },
          {
            title: "未处理报修数",
            dataIndex: "unHandlerNum",
            ellipsis: true,
            width: 180,
            align: "center",
            customRender: ({ record }: { record: MaintainStatistics }): JSX.Element => {
              const textVal = record?.fault?.unHandlerNum ?? "";
              return <PopOver content={textVal || "--"}>{textVal || "--"}</PopOver>;
            },
          },
          {
            title: "报修处理率",
            dataIndex: "handlerRatio",
            ellipsis: true,
            width: 180,
            align: "center",
            customRender: ({ record }: { record: MaintainStatistics }): JSX.Element => {
              const textVal = record?.fault?.handlerRatio ? `${record?.fault?.handlerRatio}%` : "";
              return <PopOver content={textVal || "--"}>{textVal || "--"}</PopOver>;
            },
          },
        ],
      },
      {
        title: "巡检数据",
        dataIndex: "inspect",
        children: [
          {
            title: "巡检总次数",
            dataIndex: "num",
            ellipsis: true,
            width: 180,
            align: "center",
            customRender: ({ record }: { record: MaintainStatistics }): JSX.Element => {
              const textVal = record?.inspect?.num ?? "";
              return <PopOver content={textVal || "--"}>{textVal || "--"}</PopOver>;
            },
          },
          {
            title: "巡检任务数",
            dataIndex: "taskNum",
            ellipsis: true,
            width: 180,
            align: "center",
            customRender: ({ record }: { record: MaintainStatistics }): JSX.Element => {
              const textVal = record?.inspect?.taskNum ?? "";
              return <PopOver content={textVal || "--"}>{textVal || "--"}</PopOver>;
            },
          },
          {
            title: "巡检异常数",
            dataIndex: "abnormalNum",
            ellipsis: true,
            width: 180,
            align: "center",
            customRender: ({ record }: { record: MaintainStatistics }): JSX.Element => {
              const textVal = record?.inspect?.abnormalNum ?? "";
              return <PopOver content={textVal || "--"}>{textVal || "--"}</PopOver>;
            },
          },
          {
            title: "巡检异常率",
            dataIndex: "abnormalRatio",
            ellipsis: true,
            width: 180,
            align: "center",
            customRender: ({ record }: { record: MaintainStatistics }): JSX.Element => {
              const textVal = record?.inspect?.abnormalRatio ? `${record?.inspect?.abnormalRatio}%` : "";
              return <PopOver content={textVal || "--"}>{textVal || "--"}</PopOver>;
            },
          },
        ],
      },
      {
        title: "维保数据",
        dataIndex: "upkeep",
        children: [
          {
            title: "维保总次数",
            dataIndex: "num",
            ellipsis: true,
            width: 180,
            align: "center",
            customRender: ({ record }: { record: MaintainStatistics }): JSX.Element => {
              const textVal = record?.upkeep?.num ?? "";
              return <PopOver content={textVal || "--"}>{textVal || "--"}</PopOver>;
            },
          },
          {
            title: "最近维保时间",
            dataIndex: "lastTime",
            ellipsis: true,
            width: 180,
            align: "center",
            customRender: ({ record }: { record: MaintainStatistics }): JSX.Element => {
              const time = record?.upkeep?.lastTime ? dayjs(record?.upkeep?.lastTime).format("YYYY-MM-DD HH:mm:ss") : "";
              return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
            },
          },
        ],
      },
    ];
    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const prodCode =
          queryState.state.productCategoryCode && Array.isArray(queryState.state.productCategoryCode)
            ? queryState.state.productCategoryCode[queryState.state.productCategoryCode.length - 1]
            : queryState.state.productCategoryCode;
        const params = {
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          keyword: queryState.state.keyword,
          anyMatchedAreaId: queryState.state.anyMatchedAreaId
            ? queryState.state.anyMatchedAreaId[queryState.state.anyMatchedAreaId.length - 1]
            : "",
          productCategoryCode: prodCode,
        };
        const res = await cubeDeviceSuperviseService.deviceMaintainStatistics(params);
        if (res) {
          const { records, total } = res;
          dataSource.value = records;
          queryState.update({ total });
          queryState.writeCache();
        }
      } catch {
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
        productCategoryCode: [],
        anyMatchedAreaId: "",
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
      "layout-header": (): JSX.Element => {
        return (
          <div>
            <Button type="primary" disabled={dataSource.value.length === 0} onClick={exportExcel} loading={exportLoading.value}>
              导出
            </Button>
          </div>
        );
      },
      "layout-content": (): JSX.Element => {
        return (
          <>
            <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
              <FormItem label="产品品类" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <ProductIotCategoryTreeSelect v-model:value={queryState.state.productCategoryCode} />
              </FormItem>
              <FormItem label="所在区域" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <AreaTreeSelect style={{ width: "150px" }} v-model:value={queryState.state.anyMatchedAreaId} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="">
                <Input v-model:value={queryState.state.keyword} placeholder="设备名称/编号" showCount={false} maxlength={200} />
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
              columns={columns}
              loading={loading.value}
              dataSource={dataSource.value}
              pagination={false}
              scrollY={scrollY.value}
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
        <Layout title="维护统计" v-slots={layoutSlots} />
      </>
    );
  },
});
