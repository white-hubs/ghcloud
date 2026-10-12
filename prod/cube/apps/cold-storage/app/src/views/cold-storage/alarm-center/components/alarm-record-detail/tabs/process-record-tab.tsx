import { defineComponent, ref, shallowRef, watch } from "vue";

import type { AlarmOperatorRecord } from "@ghcloud/cube-service-interface/alarm-center";
import { getAlarmOperatorRecords } from "@ghcloud/cube-services-client/alarm-center.client";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { Table } from "@ghcloud/cube-ui";

import { formatDateTime } from "../../../../shared/time";

export const ProcessRecordTab = defineComponent({
  name: "ProcessRecordTab",
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
    const rows = ref<AlarmOperatorRecord[]>([]);
    let requestSeq = 0;

    const columns = [
      {
        title: "时间",
        dataIndex: "operatorTime",
        align: "center",
        width: 180,
        customRender: ({ text }: { text?: string | number }) => formatDateTime(text),
      },
      { title: "操作人", dataIndex: "operatorByName", align: "center", width: 120 },
      { title: "处理内容", dataIndex: "operatorContent", align: "center" },
    ];

    const load = async (): Promise<void> => {
      if (!props.alarmRecordId) {
        rows.value = [];
        return;
      }
      const seq = ++requestSeq;
      loading.value = true;
      try {
        const data = await useAuthRequest(() => getAlarmOperatorRecords(props.alarmRecordId));
        if (seq === requestSeq) {
          rows.value = data;
        }
      } finally {
        if (seq === requestSeq) {
          loading.value = false;
        }
      }
    };

    watch(() => [props.alarmRecordId, props.refreshKey], load, { immediate: true });

    return () => (
      <div>
        <div class="alarm-record-detail__legacy-title">处理流程记录</div>
        <Table loading={loading.value} pagination={false} rowKey="id" dataSource={rows.value} columns={columns} bordered size="small" />
      </div>
    );
  },
});
