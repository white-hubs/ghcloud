import { computed, defineComponent, ref, shallowRef, watch, type PropType } from "vue";

import { getAlarmRecordDetail } from "@ghcloud/cube-services-client/alarm-center.client";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { Empty, Image, ImagePreviewGroup, Spin } from "@ghcloud/cube-ui";

import { formatDateTime } from "../../../../shared/time";
import {
  alarmLevelColor,
  alarmResultText,
  alarmStatusColor,
  alarmStatusText,
  alarmTimeoutColor,
  alarmTimeoutText,
} from "../../../alarm-record-data";
import type { AlarmFile, AlarmRecord } from "../../../alarm-record-types";

const normalizeAlarmRecord = (data: Partial<AlarmRecord>, alarmId: string): AlarmRecord => ({
  id: String(data.id ?? alarmId),
  applicationCode: data.applicationCode,
  alarmEventName: data.alarmEventName ?? "--",
  alarmLevelId: data.alarmLevelId,
  alarmLevelName: data.alarmLevelName ?? "三级",
  areaName: data.areaName ?? "--",
  alarmTargetAddress: data.alarmTargetAddress ?? "--",
  alarmTime: data.alarmTime ?? "--",
  alarmTargetId: data.alarmTargetId,
  alarmTargetName: data.alarmTargetName ?? "--",
  alarmTargetType: data.alarmTargetType ?? "--",
  timeoutProcessTimesName: data.timeoutProcessTimesName ?? "--",
  alarmHandlerTimeoutStatus: data.alarmHandlerTimeoutStatus ?? "NORMAL",
  alarmStatus: data.alarmStatus ?? "ALARM_UN_CONFIRMED",
  alarmHandlerResult: data.alarmHandlerResult,
  alarmHandlerName: data.alarmHandlerName,
  alarmHandlerBy: data.alarmHandlerBy,
  alarmNotifyUsers: data.alarmNotifyUsers ?? [],
  businessKey: data.businessKey ?? "",
  processingTime: data.processingTime,
  handler: data.handler,
  suspend: data.suspend,
  followUps: data.followUps ?? [],
});

const formatDuration = (seconds?: number): string => {
  if (!seconds) {
    return "--";
  }
  const minutes = Math.floor(seconds / 60);
  const remainSeconds = seconds % 60;
  if (minutes < 60) {
    return `${minutes}分${remainSeconds}秒`;
  }
  return `${Math.floor(minutes / 60)}小时${minutes % 60}分`;
};

const renderFiles = (files?: AlarmFile[]): JSX.Element => {
  const list = files?.filter((item) => item.path) ?? [];
  if (list.length === 0) {
    return <span>--</span>;
  }
  return (
    <ImagePreviewGroup>
      {list.map((item) => (
        <Image key={item.id} src={item.path} width={100} height={100} />
      ))}
    </ImagePreviewGroup>
  );
};

const pickFiles = (...fileLists: Array<AlarmFile[] | undefined>): AlarmFile[] =>
  fileLists.find((files) => files?.length)?.filter(Boolean) ?? [];

const getHandlerReason = (record: AlarmRecord): string =>
  record.handler?.recordHandlerReason?.alarmReason ||
  record.handler?.recordHandlerReason?.reason ||
  record.handler?.alarmReason ||
  record.handler?.alarmReasonName ||
  "--";

export const AlarmDetailTab = defineComponent({
  name: "AlarmDetailTab",
  props: {
    alarmId: {
      type: String,
      required: true,
    },
    refreshKey: {
      type: String,
      default: "",
    },
    initialRecord: {
      type: Object as PropType<AlarmRecord | null>,
      default: null,
    },
    detailExtra: {
      type: Function as PropType<() => JSX.Element | null>,
      default: null,
    },
  },
  setup: (props) => {
    const loading = shallowRef(false);
    const detail = ref<AlarmRecord | null>(null);
    let requestSeq = 0;

    const detailItems = computed(() => {
      const record = detail.value;
      if (!record) {
        return [];
      }
      return [
        { label: "报警时间", value: formatDateTime(record.alarmTime) },
        { label: "报警设备", value: record.alarmTargetName },
        { label: "报警级别", value: record.alarmLevelName, color: alarmLevelColor[record.alarmLevelName] },
        { label: "报警规则", value: record.alarmEventName },
        { label: "报警区域", value: record.areaName },
        { label: "处理时限", value: record.timeoutProcessTimesName },
        { label: "处理人", value: record.alarmHandlerName || "--" },
        { label: "报警通知人", value: record.alarmNotifyUsers.map((item) => item.userName).join("、") || "--" },
        {
          label: "超时状态",
          value: alarmTimeoutText[record.alarmHandlerTimeoutStatus],
          color: alarmTimeoutColor[record.alarmHandlerTimeoutStatus],
        },
        { label: "处理状态", value: alarmStatusText[record.alarmStatus], color: alarmStatusColor[record.alarmStatus] },
        { label: "详细位置", value: record.alarmTargetAddress },
        { label: "任务耗时", value: formatDuration(record.processingTime) },
      ];
    });

    const load = async (): Promise<void> => {
      if (props.initialRecord) {
        detail.value = props.initialRecord;
        loading.value = false;
        return;
      }
      const seq = ++requestSeq;
      loading.value = true;
      try {
        const data = await useAuthRequest(() => getAlarmRecordDetail(props.alarmId));
        if (seq === requestSeq) {
          detail.value = normalizeAlarmRecord(data as Partial<AlarmRecord>, props.alarmId);
        }
      } finally {
        if (seq === requestSeq) {
          loading.value = false;
        }
      }
    };

    watch(() => [props.alarmId, props.refreshKey, props.initialRecord], load, { immediate: true });

    const resultView = (record: AlarmRecord): JSX.Element | null => {
      const showResult = Boolean(record.handler || record.followUps.length > 0);
      if (!showResult && record.alarmStatus !== "ALARM_SUSPEND") {
        return null;
      }
      return (
        <>
          {(record.handler || record.followUps.length > 0) && (
            <section class="alarm-record-detail__legacy-block">
              <div class="alarm-record-detail__legacy-title">处理结果</div>
              <div class="alarm-record-detail__legacy-content">
                {record.followUps.map((item) => (
                  <div class="alarm-record-detail__legacy-row-group" key={item.id}>
                    <div class="alarm-record-detail__legacy-line">跟进记录: {item.content || "--"}</div>
                    <div class="alarm-record-detail__legacy-line alarm-record-detail__legacy-line--media">
                      <span>现场图片：</span>
                      {renderFiles(item.files)}
                    </div>
                  </div>
                ))}
                {record.alarmStatus === "ALARM_HANDLER" && record.handler && (
                  <div class="alarm-record-detail__legacy-row-group">
                    <div class="alarm-record-detail__legacy-line">
                      处理结果：{record.handler.alarmHandlerResultName || alarmResultText[record.handler.alarmHandlerResult] || "--"}
                    </div>
                    <div class="alarm-record-detail__legacy-line">报警原因：{getHandlerReason(record)}</div>
                    <div class="alarm-record-detail__legacy-line">处理说明: {record.handler.alarmHandlerResultRemark || "--"}</div>
                    <div class="alarm-record-detail__legacy-line alarm-record-detail__legacy-line--media">
                      <span>现场图片：</span>
                      {renderFiles(pickFiles(record.handler.files, record.handler.fileVOS))}
                    </div>
                    <div class="alarm-record-detail__legacy-line">处理时间：{formatDateTime(record.handler.createTime)}</div>
                    <div class="alarm-record-detail__legacy-line">处理人员: {record.handler.createUserName || "--"}</div>
                  </div>
                )}
              </div>
            </section>
          )}
          {record.alarmStatus === "ALARM_SUSPEND" && record.suspend && (
            <section class="alarm-record-detail__legacy-block">
              <div class="alarm-record-detail__legacy-title">报警挂起</div>
              <div class="alarm-record-detail__legacy-content">
                <div class="alarm-record-detail__legacy-line">预计处理时间：{formatDateTime(record.suspend.estimatedProcessTime)}</div>
                <div class="alarm-record-detail__legacy-line">挂起原因: {record.suspend.remark || "--"}</div>
                <div class="alarm-record-detail__legacy-line alarm-record-detail__legacy-line--media">
                  <span>现场图片：</span>
                  {renderFiles(pickFiles(record.suspend.files, record.suspend.fileVOS))}
                </div>
                <div class="alarm-record-detail__legacy-line">挂起时间：{formatDateTime(record.suspend.createTime)}</div>
                <div class="alarm-record-detail__legacy-line">操作挂起人员: {record.suspend.createUserName || "--"}</div>
              </div>
            </section>
          )}
        </>
      );
    };

    return () => (
      <Spin spinning={loading.value}>
        {detail.value ? (
          <div class="alarm-detail-tab">
            <section class="alarm-record-detail__section">
              <div class="alarm-record-detail__legacy-title">报警信息</div>
              <div class="alarm-record-detail__grid">
                {detailItems.value.map((item) => (
                  <div class="alarm-record-detail__item" key={item.label}>
                    <span>{item.label}</span>
                    <b style={{ color: item.color }}>{item.value}</b>
                  </div>
                ))}
              </div>
            </section>
            {props.detailExtra?.()}
            {resultView(detail.value)}
          </div>
        ) : (
          <Empty description="暂无报警详情" />
        )}
      </Spin>
    );
  },
});
