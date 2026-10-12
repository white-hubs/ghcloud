import { getReportStatistics } from "@/api/work-report/index";
import { useTableScroll } from "@/hook/use-table-scroll";
import { getNowEnterprise, getToken } from "@/utils/auth";
import { Button, DateRangePicker, Form, FormItem, Input, Page, PopOver, message } from "@ghcloud/cube-ui";
import "./index.less";
import { queryParameter } from "@ghcloud/cube-utils";
import { usePageName } from "@ghcloud/cube-utils";
import { AliasTable, DeptTreeSelect, Layout } from "@ghcloud/generic-component";
import axios from "axios";
import { defineComponent, onMounted, reactive, ref } from "vue";
export const ReportStatistics = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const columns = [
      {
        title: "人员名称",
        dataIndex: "userName",
        ellipsis: true,
        width: "120px",
        fixed: "left",
        customRender: ({ text }: { text: string }) => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "部门",
        dataIndex: "departmentName",
        ellipsis: true,
        width: "120px",
        customRender: ({ text }: { text: string }) => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "部门汇报数",
        dataIndex: "departmentNum",
        ellipsis: true,
        width: "120px",
        customRender: ({ text, record }: { text: string; record: Record<string, string> }) => (
          <PopOver content={text || "0"}>
            <Button
              type="link"
              onClick={() => {
                handleLink(record, "部门汇报数");
              }}
            >
              {text || "0"}
            </Button>
          </PopOver>
        ),
      },
      {
        title: "个人汇报数",
        dataIndex: "userNum",
        ellipsis: true,
        width: "120px",
        customRender: ({ text, record }: { text: string; record: Record<string, string> }) => (
          <PopOver content={text || "0"}>
            <Button
              type="link"
              onClick={() => {
                handleLink(record, "个人汇报数");
              }}
            >
              {text || "0"}
            </Button>
          </PopOver>
        ),
      },
    ];
    const tableColumns = ref(columns);
    const dataSource = ref<unknown[]>([]);
    const searchPeriod = ref<string[]>(queryParameter.getQuery()?.period ? (queryParameter.getQuery().period as string).split(",") : []);
    const state = reactive({
      loading: false,
      exportLoading: false,
      pendingVisible: false,
      handlerVisible: false,
      searchParams: {
        pageNumber: (queryParameter.getQuery()?.pageNumber as number) ?? 1,
        pageSize: (queryParameter.getQuery()?.pageSize as number) ?? 10,
        department:
          (queryParameter.getQuery()?.department as string[]) && queryParameter.getQuery()?.department !== ""
            ? queryParameter.getQuery()?.department
            : [],
        userName: (queryParameter.getQuery()?.userName as string) ?? "",
        total: (queryParameter.getQuery()?.total as number) ?? 0,
      },
      selectRow: "",
    });
    const getTableData = async (urlCache = false): Promise<void> => {
      state.loading = true;
      try {
        const params = {
          ...state.searchParams,
          departmentId: state.searchParams.department,
          period: searchPeriod.value ? searchPeriod.value.join(",") : "",
        };
        const data = await getReportStatistics(params);
        dataSource.value = data.records;
        state.searchParams.total = data.total;
        getDynamicColumns();
        urlCache && setUrl();
      } catch (error) {
      } finally {
        state.loading = false;
      }
    };
    const setUrl = (): void => {
      queryParameter.setAddressQuery({
        ...state.searchParams,
        period: searchPeriod.value ? searchPeriod.value.join(",") : "",
      });
    };
    const getDynamicColumns = (): void => {
      // 找出长度最长的reportTypeNumList，作为动态列
      const typeArr = dataSource.value.map((s) => {
        let arr = [];
        if (s?.reportTypeNumList) {
          arr = s?.reportTypeNumList.filter(
            (r: { typeName: string | null | undefined }) => r.typeName !== "" && r.typeName !== null && r.typeName !== undefined,
          );
        }
        return arr;
      });
      const longTypeList = typeArr.reduce((longest, currentArray) => (currentArray.length > longest.length ? currentArray : longest), []);
      tableColumns.value = [
        ...columns,
        ...longTypeList.map((item: Record<string, string | number>) => ({
          title: `${item.typeName}`,
          dataIndex: `${item.typeName}`,
          ellipsis: true,
          width: "120px",
          customRender: ({ record }: { text: string; record: Record<string, string> }) => {
            let current = null;
            if (Array.isArray(record?.reportTypeNumList)) {
              current = record?.reportTypeNumList.find((t: { typeId: string | number }) => t.typeId === item.typeId);
            }
            const val = current ? (current.typeNum ? `${current.typeNum}` : current.typeNum === 0 ? "0" : "") : "";
            return (
              <PopOver content={val || "--"}>
                {val ? (
                  <Button
                    type="link"
                    onClick={() => {
                      handleLink(record, "动态类型", item.typeId as string);
                    }}
                  >
                    {val || "--"}
                  </Button>
                ) : (
                  <Button type="link" disabled>
                    {val || "--"}
                  </Button>
                )}
              </PopOver>
            );
          },
        })),
      ];
    };
    const handleLink = (record: Record<string, string>, code: string, typeId?: string): void => {
      const prames = {
        startUserId: "",
        organizationId: "",
        reportTypeId: "",
        submitTime: "",
      };
      switch (code) {
        case "个人汇报数":
          prames.startUserId = record.userId;
          break;
        case "部门汇报数":
          prames.organizationId = record.organizationId;
          break;
        case "动态类型":
          prames.reportTypeId = typeId ?? "";
          prames.startUserId = record.userId;
          break;
      }
      prames.submitTime = searchPeriod.value ? searchPeriod.value.join(",") : "";
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/work-report/record-index?searchValue=${JSON.stringify(prames)}`,
      );
    };
    const changePage = (page: number, pageSize: number): void => {
      selectedRowKeysData.value.length = 0;
      state.searchParams.pageNumber = page;
      state.searchParams.pageSize = pageSize;
      getTableData(true);
    };
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1;
      getTableData(true);
    };
    const reset = (): void => {
      const initParams = {
        pageNumber: 1,
        pageSize: 10,
        applicationCode: null,
        userName: "",
        alarmStatus: null,
        department: [],
        total: 0,
      };
      state.searchParams = initParams;
      searchPeriod.value = [];
      getTableData(true);
    };
    const { scrollY } = useTableScroll();
    const selectedRowKeysData = ref<string[]>([]);
    const rowSelection = ref({
      preserveSelectedRowKeys: true,
      onChange: (selectedRowKeys: string[]) => {
        selectedRowKeysData.value = selectedRowKeys;
      },
    });
    const exportLoading = ref(false);
    const alarmRecordExport = (): void => {
      try {
        if (selectedRowKeysData.value.length === 0) {
          message.warning("请先选择要下载的数据");
          return;
        }
        exportLoading.value = true;
        const params = {
          ...state.searchParams,
          period: searchPeriod.value ? searchPeriod.value.join(",") : "",
          selectReportBys: selectedRowKeysData.value.join(","),
        };
        exportExcel("/report/report-statistics-export-pc", params, "工作汇报统计");
        exportLoading.value = false;
      } catch (error) {
        exportLoading.value = false;
      }
    };
    const exportExcel = (url: string, data: unknown, fileName: string): void => {
      axios({
        url: "/api" + url,
        responseType: "blob",
        method: "post",
        data,
        headers: {
          tenant: getNowEnterprise()?.code,
          terminal: (window as any).config.terminal,
          token: `${getToken().access_token}`,
          Authorization: `Bearer ${getToken().access_token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          const link = document.createElement("a");
          const blob = new Blob([res.data], { type: "application/vnd.ms-excel" }); // 文件流处理
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          window.URL.revokeObjectURL(link.href);
          document.body.removeChild(link);
        })
        .catch(function(){});
    };
    onMounted(() => {
      getTableData();
    });

    const layoutSlots = {
      "layout-header": () => (
        <Button type="primary" loading={exportLoading.value} onClick={alarmRecordExport}>
          批量下载
        </Button>
      ),
      "layout-content": () => (
        <>
          <Form layout="inline" style={{ margin: "10px 0" }}>
            <FormItem label="部门" class="search-item">
              <DeptTreeSelect placeholder="请选择部门" v-model:value={state.searchParams.department} style="min-width: 150px;" />
            </FormItem>
            <FormItem label="汇报时间" class="search-item">
              <DateRangePicker v-model:value={searchPeriod.value} allowClear picker="date" valueFormat="YYYY-MM-DD" />
            </FormItem>
            <FormItem label="" class="search-item">
              <Input
                placeholder="请输入汇报人名称"
                showCount={false}
                maxlength={200}
                v-model:value={state.searchParams.userName}
                allowClear
                style={{ width: "200px" }}
              />
            </FormItem>
            <FormItem class="search-item">
              <Button type="primary" onClick={handleSearch}>
                查询
              </Button>
              <Button style={{ marginLeft: "10px" }} onClick={reset}>
                重置
              </Button>
            </FormItem>
          </Form>
          <AliasTable
            rowKey="userId"
            rowSelection={rowSelection.value}
            dataSource={dataSource.value}
            columns={tableColumns.value}
            loading={state.loading}
            scrollX={1000}
            scrollY={scrollY.value}
            applicationCode={__ENV__.applicationCode}
            tableCode="WORK_REPORT_STATISTICS"
          />
        </>
      ),
      "footer-page": () => (
        <Page
          v-model:current={state.searchParams.pageNumber}
          v-model:pageSize={state.searchParams.pageSize}
          v-model:total={state.searchParams.total}
          onPageChange={changePage}
        />
      ),
      "footer-btn": () => <span>已选：{selectedRowKeysData.value.length} 条数据</span>,
    };
    return () => (
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
      </>
    );
  },
});
