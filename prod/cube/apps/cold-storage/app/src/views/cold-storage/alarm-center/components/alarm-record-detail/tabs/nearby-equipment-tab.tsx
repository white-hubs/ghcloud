import { defineComponent, reactive, ref, shallowRef, watch } from "vue";

import type { AlarmNearbyDevice } from "@ghcloud/cube-service-interface/alarm-center";
import { getAlarmNearbyDevices } from "@ghcloud/cube-services-client/alarm-center.client";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { Button, Page, Table, Tag } from "@ghcloud/cube-ui";

const goDeviceDetail = (record: AlarmNearbyDevice): void => {
  if (!record.id) {
    return;
  }
  const search = new URLSearchParams({
    id: record.id,
    prodId: record.productInfo?.id ?? "",
  });
  window.history.pushState({}, "", `/portal/device-center/device-ledger-info?${search.toString()}`);
};

export const NearbyEquipmentTab = defineComponent({
  name: "NearbyEquipmentTab",
  props: {
    alarmRecordId: {
      type: String,
      required: true,
    },
    refreshKey: {
      type: String,
      default: "",
    },
  },
  setup: (props) => {
    const loading = shallowRef(false);
    const rows = ref<AlarmNearbyDevice[]>([]);
    const pagination = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });
    let requestSeq = 0;

    const columns = [
      { title: "设备编号", dataIndex: "code", align: "center" },
      { title: "设备名称", dataIndex: "name", align: "center" },
      {
        title: "所属产品",
        dataIndex: "productInfo",
        align: "center",
        customRender: ({ record }: { record: AlarmNearbyDevice }) => record.productInfo?.name ?? "--",
      },
      {
        title: "产品品类",
        dataIndex: "productCategory",
        align: "center",
        customRender: ({ record }: { record: AlarmNearbyDevice }) => record.productInfo?.productCategory?.name ?? "--",
      },
      {
        title: "所属区域",
        dataIndex: "area",
        align: "center",
        customRender: ({ record }: { record: AlarmNearbyDevice }) => record.area?.pathName ?? record.area?.name ?? "--",
      },
      {
        title: "设备状态",
        dataIndex: "status",
        align: "center",
        width: 120,
        customRender: ({ record }: { record: AlarmNearbyDevice }) => {
          const online = Boolean(record.status?.onlineState);
          return <Tag color={online ? "green" : "default"}>{online ? "在线" : "离线"}</Tag>;
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        align: "center",
        width: 100,
        customRender: ({ record }: { record: AlarmNearbyDevice }) => (
          <Button type="link" onClick={() => goDeviceDetail(record)}>
            详情
          </Button>
        ),
      },
    ];

    const load = async (): Promise<void> => {
      if (!props.alarmRecordId) {
        rows.value = [];
        pagination.total = 0;
        return;
      }
      const seq = ++requestSeq;
      loading.value = true;
      try {
        const data = await useAuthRequest(() =>
          getAlarmNearbyDevices({
            alarmRecordId: props.alarmRecordId,
            pageNumber: pagination.pageNumber,
            pageSize: pagination.pageSize,
          }),
        );
        if (seq === requestSeq) {
          rows.value = data.records;
          pagination.total = data.total;
        }
      } finally {
        if (seq === requestSeq) {
          loading.value = false;
        }
      }
    };

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      pagination.pageNumber = pageNumber;
      pagination.pageSize = pageSize;
      void load();
    };

    watch(
      () => [props.alarmRecordId, props.refreshKey],
      () => {
        pagination.pageNumber = 1;
        void load();
      },
      { immediate: true },
    );

    return () => (
      <div class="alarm-record-detail__legacy-stack">
        <Table loading={loading.value} pagination={false} rowKey="id" dataSource={rows.value} columns={columns} bordered size="small" />
        <div class="alarm-record-detail__page">
          <Page current={pagination.pageNumber} pageSize={pagination.pageSize} total={pagination.total} onPageChange={handlePageChange} />
        </div>
      </div>
    );
  },
});
