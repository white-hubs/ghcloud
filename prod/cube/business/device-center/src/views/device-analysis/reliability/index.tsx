import { cubeDeviceSuperviseService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";
import { logger } from "@/logger";
import { Button, DateRangePicker, Form, FormItem, PopOver, Select } from "@ghcloud/cube-ui";
import { DeviceModalTable, AliasTable } from "@ghcloud/generic-component";
import { message } from "ant-design-vue/es";
import { defineComponent, reactive, ref } from "vue";
import { useRoute } from "vue-router";

export const ReliabilityAnalysis = defineComponent({
  setup: () => {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const { scrollY } = useTableScroll();
    const formState = reactive<{ deviceIds: string[]; period: string[] }>({
      deviceIds: [],
      period: [],
    });
    const queryForm = (): void => {
      getTableData();
    };
    const reset = (): void => {
      formState.deviceIds = [];
      formState.period = [];
      dataSource.value = [];
    };
    const getTableData = async (): Promise<void> => {
      try {
        if (!formState.period.length) {
          message.warning("请选择时间范围");
          return;
        }
        if (!formState.deviceIds.length) {
          message.warning("请选择设备");
          return;
        }
        loading.value = true;
        const params = {
          deviceIds: formState.deviceIds ? formState.deviceIds.join(",") : "",
          period: formState.period ? formState.period.join(",") : "",
        };
        cubeDeviceSuperviseService.deviceReliabilityAnalysis(params).then((res) => {
          if (res) {
            dataSource.value = res;
          }
        });
      } catch (error) {
        logger.error(error);
      } finally {
        loading.value = false;
      }
    };
    // onMounted(() => {
    //   getTableData()
    // })
    const loading = ref(false);
    const exportLoading = ref(false);
    const dataSource = ref<unknown[]>([]);

    const deviceModalTableRef = ref<{ openModal: () => void }>();
    const deviceList = ref<{ name: string; id: string }[]>([]);

    const downloadTemplete = async (): Promise<void> => {
      try {
        if (!formState.period.length) {
          message.warning("请选择时间范围");
          return;
        }
        if (!formState.deviceIds.length) {
          message.warning("请选择设备");
          return;
        }
        exportLoading.value = true;
        const res = await cubeDeviceSuperviseService.reliabilityAnalysisExport({
          deviceIds: formState.deviceIds,
          period: formState.period ? formState.period.join(",") : "",
        });
        if (res) {
          const link = document.createElement("a");
          const blob = new Blob([res as BlobPart], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "可靠性分析.xlsx");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch {
      } finally {
        exportLoading.value = false;
      }
    };
    const columns = [
      {
        title: "设备编号",
        dataIndex: "code",
        ellipsis: true,
        width: 180,
        fixed: "left",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "设备名称",
        dataIndex: "name",
        ellipsis: true,
        width: 180,
        fixed: "left",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      // {
      //   title: '起始时间',
      //   dataIndex: '',
      //   ellipsis: true,
      //   width: 180,
      //   customRender: ({ text }: { text: string; }) => {
      //     return <PopOver content={text || '--'}>{text || '--'}</PopOver>
      //   }
      // },
      // {
      //   title: '截止时间',
      //   dataIndex: '',
      //   ellipsis: true,
      //   width: 180,
      //   customRender: ({ text }: { text: string; }) => {
      //     return <PopOver content={text || '--'}>{text || '--'}</PopOver>
      //   }
      // },
      {
        title: "工作天数(天)",
        dataIndex: "workerDay",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "设备故障次数",
        dataIndex: "troubleRunNumber",
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
    ];
    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <div>
          <Button type="primary" loading={exportLoading.value} onClick={downloadTemplete}>
            导出报告
          </Button>
        </div>
      ),
      "layout-content": (): JSX.Element => (
        <>
          <Form layout="inline" style={{ margin: "10px 0 " }}>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="报警时间">
              <DateRangePicker v-model:value={formState.period} allowClear={false} />
            </FormItem>
            <FormItem style={{ display: "flex", paddingRight: 0, marginRight: "20px", marginBottom: "10px" }} label="选择设备">
              <div style={{ display: "flex", alignItems: "center" }}>
                <Select
                  style={{ minWidth: "160px" }}
                  open={false}
                  showArrow={false}
                  allowClear={false}
                  mode="multiple"
                  options={deviceList.value}
                  v-model:value={formState.deviceIds}
                  placeholder="请选择设备"
                  maxTagCount={6}
                  fieldNames={{ value: "id", label: "name" }}
                />
                <Button type="primary" onClick={() => deviceModalTableRef.value?.openModal()}>
                  选择设备
                </Button>
              </div>
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Button type="primary" onClick={queryForm}>
                生成报告
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
            scrollX={columns.length * 200}
            applicationCode={__ENV__.applicationCode}
          />
        </>
      ),
    };
    return (): JSX.Element => (
      <>
        <Layout title="可靠性分析" v-slots={layoutSlots} />
        <DeviceModalTable
          ref={deviceModalTableRef}
          v-model:value={deviceList.value}
          onOk={(values: { name: string; id: string }[]) => {
            formState.deviceIds = values.map((e) => e.id);
            deviceList.value = values.map((e) => ({ name: e.name, id: e.id }));
          }}
        />
      </>
    );
  },
});
