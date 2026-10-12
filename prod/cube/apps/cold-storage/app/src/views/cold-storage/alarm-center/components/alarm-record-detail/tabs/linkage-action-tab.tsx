import { defineComponent, ref, shallowRef, watch } from "vue";

import type { AlarmLinkageActionDevice, AlarmLinkageExecuteRecord } from "@ghcloud/cube-service-interface/alarm-center";
import {
  executeAlarmLinkage,
  getAlarmLinkageActions,
  getAlarmLinkageExecuteRecords,
  oneKeyExecuteAlarmLinkage,
} from "@ghcloud/cube-services-client/alarm-center.client";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { Button, message, Table } from "@ghcloud/cube-ui";

import { formatDateTime } from "../../../../shared/time";

const executeModeName: Record<string, string> = {
  AUTOMATIC: "自动",
  AUTO: "自动",
  MANUAL: "手动",
};

const executeStatusName: Record<string, string> = {
  DONE: "成功",
  SUCCESS: "成功",
  FINISH: "成功",
  FINISHED: "成功",
  WAITING: "待执行",
  EXECUTING: "执行中",
  FAILED: "失败",
  FAIL: "失败",
};

const displayValue = (record: AlarmLinkageActionDevice | AlarmLinkageExecuteRecord): string =>
  String(record.translatedValue ?? record.propValue ?? "--");

export const LinkageActionTab = defineComponent({
  name: "LinkageActionTab",
  props: {
    refreshKey: {
      type: String,
      default: "",
    },
    eventId: {
      type: String,
      default: "",
    },
  },
  setup: (props) => {
    const loading = shallowRef(false);
    const executing = shallowRef(false);
    const actionRows = ref<AlarmLinkageActionDevice[]>([]);
    const logRows = ref<AlarmLinkageExecuteRecord[]>([]);
    let requestSeq = 0;

    const handleExecute = async (record: AlarmLinkageActionDevice): Promise<void> => {
      if (!record.id) {
        message.warning("缺少联动设备动作ID");
        return;
      }
      executing.value = true;
      try {
        await useAuthRequest(() => executeAlarmLinkage({ eventIotDeviceId: record.id as string }));
        message.success("执行成功");
        await load();
      } finally {
        executing.value = false;
      }
    };

    const handleOneKeyExecute = async (): Promise<void> => {
      if (!props.eventId) {
        message.warning("缺少报警事件ID");
        return;
      }
      executing.value = true;
      try {
        await useAuthRequest(() => oneKeyExecuteAlarmLinkage(props.eventId));
        message.success("执行成功");
        await load();
      } finally {
        executing.value = false;
      }
    };

    const linkageColumns = [
      { title: "设备名称", dataIndex: "deviceName", align: "center" },
      { title: "设备属性", dataIndex: "propName", align: "center" },
      {
        title: "执行动作",
        dataIndex: "propValue",
        align: "center",
        customRender: ({ record }: { record: AlarmLinkageActionDevice }) => displayValue(record),
      },
      {
        title: "执行时机",
        dataIndex: "executeMode",
        align: "center",
        customRender: ({ text }: { text?: string }) => executeModeName[String(text ?? "")] ?? text ?? "--",
      },
      {
        title: "操作",
        dataIndex: "action",
        align: "center",
        customRender: ({ record }: { record: AlarmLinkageActionDevice }) => (
          <Button type="link" loading={executing.value} onClick={() => void handleExecute(record)}>
            执行
          </Button>
        ),
      },
    ];

    const logColumns = [
      {
        title: "执行时间",
        dataIndex: "executeTime",
        align: "center",
        width: 200,
        customRender: ({ text }: { text?: string | number }) => formatDateTime(text),
      },
      { title: "触发人", dataIndex: "operatorName", align: "center", customRender: ({ text }: { text?: string }) => text || "--" },
      { title: "设备名称", dataIndex: "deviceName", align: "center" },
      { title: "设备属性", dataIndex: "propName", align: "center" },
      {
        title: "执行动作",
        dataIndex: "propValue",
        align: "center",
        customRender: ({ record }: { record: AlarmLinkageExecuteRecord }) => displayValue(record),
      },
      {
        title: "执行结果",
        dataIndex: "executeStatus",
        align: "center",
        customRender: ({ text }: { text?: string }) => executeStatusName[String(text ?? "")] ?? text ?? "--",
      },
    ];

    const load = async (): Promise<void> => {
      if (!props.eventId) {
        actionRows.value = [];
        logRows.value = [];
        return;
      }
      const seq = ++requestSeq;
      loading.value = true;
      try {
        const [actions, logs] = await useAuthRequest(() =>
          Promise.all([getAlarmLinkageActions(props.eventId), getAlarmLinkageExecuteRecords(props.eventId)]),
        );
        if (seq === requestSeq) {
          actionRows.value = actions;
          logRows.value = logs;
        }
      } finally {
        if (seq === requestSeq) {
          loading.value = false;
        }
      }
    };

    watch(() => [props.eventId, props.refreshKey], load, { immediate: true });

    return () => (
      <div class="alarm-record-detail__legacy-stack">
        <section>
          <div class="alarm-record-detail__legacy-title alarm-record-detail__legacy-title--between">
            <span>设备联动</span>
            {actionRows.value.length > 0 && (
              <Button type="primary" loading={executing.value} onClick={() => void handleOneKeyExecute()}>
                一键执行
              </Button>
            )}
          </div>
          <Table
            loading={loading.value}
            pagination={false}
            rowKey="id"
            dataSource={actionRows.value}
            columns={linkageColumns}
            bordered
            size="small"
          />
        </section>
        <section>
          <div class="alarm-record-detail__legacy-title">联动日志</div>
          <Table
            loading={loading.value}
            pagination={false}
            rowKey="id"
            dataSource={logRows.value}
            columns={logColumns}
            bordered
            size="small"
          />
        </section>
      </div>
    );
  },
});
