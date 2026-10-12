import dayjs from "dayjs";
import { defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type { DroneAlarmDispatchRecordModel } from "@ghcloud/cube-drone-service";
import { Button, Empty } from "@ghcloud/cube-ui";

import { cubeDroneService } from "@/api/server";

import styles from "./alarm-dispatch.module.less";

const renderValue = (value?: number | string): string => (value === 0 ? "0" : value ? String(value) : "--");
const statusText = (value?: number): string => (value === 1 ? "成功" : value === 2 ? "失败" : "--");
const formatDateTime = (value?: number | string): string => {
  if (value == null || value === "") {
    return "--";
  }
  const raw = typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;
  const normalized = typeof raw === "number" && raw < 10000000000 ? raw * 1000 : raw;
  return dayjs(normalized).format("YYYY-MM-DD HH:mm:ss");
};

export const AlarmDispatchRecordDetail = defineComponent({
  name: "AlarmDispatchRecordDetail",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const detail = ref<DroneAlarmDispatchRecordModel>();

    onMounted(async () => {
      const id = String(route.query.id ?? "");
      if (id) {
        detail.value = await cubeDroneService.getAlarmDispatchRecordDetail(id);
      }
    });

    const item = (label: string, value?: number | string): JSX.Element => (
      <div class={styles.detailItem}>
        <span>{label}</span>
        <strong>{renderValue(value)}</strong>
      </div>
    );

    return (): JSX.Element => (
      <CubeLayout
        class={styles.container}
        title="报警派飞日志详情"
        v-slots={{
          "layout-header": () => <Button onClick={() => void router.push({ path: "/alarm-dispatch-records" })}>返回列表</Button>,
          "layout-content": () =>
            detail.value ? (
              <div class={styles.content}>
                <div class={styles.detailGrid}>
                  {item("报警编号", detail.value.alarmCode)}
                  {item("报警对象", detail.value.alarmTargetName)}
                  {item("报警级别", detail.value.alarmLevelName)}
                  {item("报警类型", detail.value.alarmTypeName)}
                  {item("无人机设备", detail.value.droneDeviceName)}
                  {item("机库编号", detail.value.nestSn)}
                  {item("机库名称", detail.value.nestName)}
                  {item("目标经度", detail.value.longitude)}
                  {item("目标纬度", detail.value.latitude)}
                  {item("快速任务名称", detail.value.taskName)}
                  {item("派飞状态", statusText(detail.value.dispatchStatus))}
                  {item("航迹文件类型", detail.value.trackFileType)}
                  {item("航迹ID", detail.value.trackId)}
                  {item("航迹URL", detail.value.trackUrl)}
                  {item("派飞时间", formatDateTime(detail.value.dispatchTime))}
                  {item("失败原因", detail.value.failReason)}
                </div>
              </div>
            ) : (
              <Empty />
            ),
        }}
      />
    );
  },
});
