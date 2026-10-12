import { defineComponent, onMounted, reactive, ref } from "vue";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import { Button, Form, FormItem, Input, Page, PopOver, Select, Table, Tag } from "@ghcloud/cube-ui";

import { cubeDeviceSuperviseService } from "@/api/service";
import { ProductIotCategoryTreeSelect } from "@/components/business/product-iot-category-tree-select/product-iot-category-tree-select";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";
import { logger } from "@/logger";
import { onlineStateOptions } from "@/types/device-type";
import { formatDuration } from "@/utils/tool";

import "@/styles/common.less";

export const WorkingStatistic = defineComponent({
  setup: () => {
    const queryState = useCubeQueryState({
      storage: "url",
      initialState: {
        productCategoryCode: "",
        keyword: "",
        status: undefined as string | undefined,
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      cacheFields: ["productCategoryCode", "keyword", "status", "pageNumber", "pageSize"],
      resolveValue: (field, raw) => {
        if (field === "pageNumber" || field === "pageSize") {
          return Number(raw);
        }
        return raw ?? "";
      },
    });

    const formState = reactive({
      productCategoryCode: queryState.state.productCategoryCode ? queryState.state.productCategoryCode.split(",").filter(Boolean) : [],
      keyword: queryState.state.keyword,
      status: queryState.state.status || undefined,
    });
    const exportLoading = ref(false);
    const exportExcel = async (): Promise<void> => {
      try {
        exportLoading.value = true;
        const prodCode =
          formState.productCategoryCode && Array.isArray(formState.productCategoryCode)
            ? formState.productCategoryCode[formState.productCategoryCode.length - 1]
            : formState.productCategoryCode;
        const params = {
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          keyword: formState.keyword,
          deviceState: formState.status ?? "",
          productCategoryCode: prodCode,
        };
        const res = await cubeDeviceSuperviseService.deviceWorkStatisticsExport(params);
        if (res) {
          const link = document.createElement("a");
          const blob = new Blob([res as BlobPart], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "运行统计.xlsx");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        logger.error(error);
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
        align: "center",
        fixed: "left",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "设备名称",
        dataIndex: "deviceName",
        ellipsis: true,
        width: 180,
        align: "center",
        fixed: "left",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "所属产品",
        dataIndex: "productName",
        ellipsis: true,
        width: 180,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "产品品类",
        dataIndex: "productCategoryName",
        ellipsis: true,
        width: 180,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "当前状态",
        dataIndex: "onlineState",
        ellipsis: true,
        width: 120,
        align: "center",
        customRender: ({ text }: { text: boolean }): JSX.Element => {
          const curState = onlineStateOptions.find((e) => e.value === text);
          return (
            <>
              <PopOver content={curState?.label || "--"}>
                {curState?.label ? <Tag color={curState?.color}>{curState?.label}</Tag> : "--"}
              </PopOver>
            </>
          );
        },
      },
      {
        title: "在线时长",
        dataIndex: "onlineTime",
        ellipsis: true,
        width: 180,
        align: "center",
        customRender: ({ text }: { text: number }): JSX.Element => {
          // const hours = text ? (text / 60).toFixed(1) : '--'
          // const formattedTime = hours === '--' ? hours : `${hours}小时`
          const formattedTime = formatDuration(text);
          return <PopOver content={formattedTime}>{formattedTime}</PopOver>;
        },
      },
      {
        title: "离线时长",
        dataIndex: "offlineTime",
        ellipsis: true,
        width: 180,
        align: "center",
        customRender: ({ text }: { text: number }): JSX.Element => {
          const formattedTime = formatDuration(text);
          return <PopOver content={formattedTime}>{formattedTime}</PopOver>;
        },
      },
      {
        title: "离线总次数",
        dataIndex: "offLineNum",
        ellipsis: true,
        width: 180,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "报警总次数",
        dataIndex: "alarmNum",
        ellipsis: true,
        width: 180,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "故障总次数",
        dataIndex: "faultNum",
        ellipsis: true,
        width: 180,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "故障率",
        dataIndex: "faultRate",
        ellipsis: true,
        width: 180,
        align: "center",
        customRender: ({ text }: { text: number }): JSX.Element => {
          const textVal = text ? `${text}%` : "";
          return <PopOver content={textVal || "--"}>{textVal || "--"}</PopOver>;
        },
      },
    ];
    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const prodCode =
          formState.productCategoryCode && Array.isArray(formState.productCategoryCode)
            ? formState.productCategoryCode[formState.productCategoryCode.length - 1]
            : formState.productCategoryCode;
        const params = {
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          keyword: formState.keyword,
          deviceState: formState.status ?? "",
          productCategoryCode: prodCode,
        };
        const res = await cubeDeviceSuperviseService.deviceWorkStatistics(params);
        if (res) {
          const { records, total } = res;
          dataSource.value = records;
          queryState.state.total = total;
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
      queryState.update({
        productCategoryCode: formState.productCategoryCode.join(","),
        keyword: formState.keyword,
        status: formState.status,
      });
      queryState.writeCache();
      getTableData();
    };
    const reset = (): void => {
      formState.productCategoryCode = [];
      formState.keyword = "";
      formState.status = undefined;
      queryState.update({
        productCategoryCode: "",
        keyword: "",
        status: undefined,
      });
      queryState.clearCache();
      getTableData();
    };
    const { scrollY } = useTableScroll();

    onMounted(() => {
      getTableData();
    });

    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <div>
          <Button type="primary" disabled={dataSource.value.length === 0} onClick={exportExcel} loading={exportLoading.value}>
            导出
          </Button>
        </div>
      ),
      "layout-content": (): JSX.Element => (
        <>
          <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
            <FormItem label="产品品类" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <ProductIotCategoryTreeSelect v-model:value={formState.productCategoryCode} />
            </FormItem>
            <FormItem label="设备状态" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Select
                options={onlineStateOptions}
                style={{ width: "180px" }}
                placeholder="请选择设备状态"
                v-model:value={formState.status}
              />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="">
              <Input v-model:value={formState.keyword} placeholder="设备名称/编号" showCount={false} maxlength={200} />
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
        <Layout title="运行统计" v-slots={layoutSlots} />
      </>
    );
  },
});
