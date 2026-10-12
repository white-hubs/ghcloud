import { cubeDeviceCenterInternalService } from "@/api/service";
import { useTableInfoScroll } from "@/hook/use-table-info-scroll";
import "@/styles/common.less";
import { statusOptions, type DeviceInfo } from "@/types/device-type";
import { Button, Page, PopOver, Tag } from "@ghcloud/cube-ui";
import { AliasTable } from "@ghcloud/generic-component";
import { defineComponent, onMounted, ref, type PropType } from "vue";
import { useRoute } from "vue-router";

export const SubDevice = defineComponent({
  props: {
    mainDeviceId: {
      type: String,
      default: "",
    },
    device: {
      type: Object as PropType<DeviceInfo>,
      default: {},
    },
  },
  setup(props) {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const { scrollY } = useTableInfoScroll();

    const columns = [
      {
        title: "设备序列号",
        dataIndex: "deviceNumber",
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "设备名称",
        dataIndex: "name",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "所属产品",
        dataIndex: "productName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "节点类型",
        dataIndex: "nodeTypeName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "最后连接时间",
        dataIndex: "onlineTimeStr",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "设备状态",
        dataIndex: "status",
        ellipsis: true,
        width: 120,
        align: "center",
        customRender: ({ text }: { text: number }): JSX.Element => {
          const curState = statusOptions.find((e) => e.value === text);
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
        title: "操作",
        dataIndex: "action",
        width: 120,
        fixed: "right",
        customRender: ({ record }: { record: { id: string } }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                goDetail(record);
              }}
            >
              详情
            </Button>
          </>
        ),
      },
    ];
    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        dataSource.value = [];
        pagination.value.total = 0;
        const params = {
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          deviceIds: props.device?.slaveDeviceIds ?? "",
        };
        const res = await cubeDeviceCenterInternalService.getDevicePage(params);
        if (res) {
          const { records, total } = res;
          dataSource.value = records;
          pagination.value.total = total;
        }
      } catch {
      } finally {
        loading.value = false;
      }
    };
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData();
    };
    const goDetail = (record: { id: string }): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/device-center/device-list-info?subDeviceId=${record.id}&mainDevice=${JSON.stringify(props.device)}`,
      );
    };
    onMounted(() => {
      getTableData();
    });
    return (): JSX.Element => (
      <>
        <AliasTable
          rowKey="id"
          columns={columns}
          loading={loading.value}
          dataSource={dataSource.value}
          tableCode={`${tableCode}SubDevice`}
          pagination={false}
          scrollY={scrollY.value - 20}
          applicationCode={__ENV__.applicationCode}
        />
        <div class="page-box">
          <Page
            v-model:current={pagination.value.pageNumber}
            v-model:pageSize={pagination.value.pageSize}
            v-model:total={pagination.value.total}
            onPageChange={pageChange}
            page-size-options={["10", "20", "50", "100", "200", "500"]}
          />
        </div>
      </>
    );
  },
});
