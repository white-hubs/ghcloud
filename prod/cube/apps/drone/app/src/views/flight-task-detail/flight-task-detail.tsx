import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type { FlightTaskListModel } from "@ghcloud/cube-drone-service";
import { Button, Col, FormItem, Row } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import styles from "./flight-task-detail.module.less";

const renderValue = (value?: boolean | number | string): string => {
  if (typeof value === "boolean") {
    return value ? "是" : "否";
  }
  if (value === 0) {
    return "0";
  }
  return value ? String(value) : "--";
};

const flightTaskTypeTextMap: Record<number, string> = {
  1: "手动任务",
  3: "定期任务",
  4: "周期任务",
  5: "快速任务",
};

const flightTaskStatusTextMap: Record<number, string> = {
  0: "停用",
  1: "启用",
};

const executionStatusTextMap: Record<number, string> = {
  0: "待执行",
  1: "进行中",
  2: "已完成",
  3: "已取消",
  [-1]: "执行失败",
  6: "中断",
};

const getFlightTaskTypeText = (taskType?: number): string => (taskType == null ? "--" : (flightTaskTypeTextMap[taskType] ?? "--"));

const getFlightTaskStatusText = (status?: number): string => (status == null ? "--" : (flightTaskStatusTextMap[status] ?? "--"));

const getExecutionStatusText = (status?: number): string => (status == null ? "--" : (executionStatusTextMap[status] ?? "--"));

export const FlightTaskDetail = defineComponent({
  name: "FlightTaskDetail",
  setup: () => {
    const { pageTitle } = usePageName();
    const router = useRouter();
    const flightTaskInfo = ref<FlightTaskListModel | null>(null);

    const loadFlightTaskInfo = (): void => {
      const detail = sessionStorage.getItem("flightTaskInfo");
      flightTaskInfo.value = detail ? (JSON.parse(detail) as FlightTaskListModel) : null;
    };

    onMounted(() => {
      loadFlightTaskInfo();
    });

    return (): JSX.Element => (
      <CubeLayout title={pageTitle}>
        {{
          "layout-content": (): JSX.Element => (
            <div class={styles.content}>
              <Row gutter={24}>
                <Col span={8}>
                  <FormItem label="任务ID">{renderValue(flightTaskInfo.value?.taskId)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="任务名称">{renderValue(flightTaskInfo.value?.taskName)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="任务类型">{getFlightTaskTypeText(flightTaskInfo.value?.taskType)}</FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={8}>
                  <FormItem label="任务状态">{getFlightTaskStatusText(flightTaskInfo.value?.status)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="结果状态">{renderValue(flightTaskInfo.value?.resultStatus)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="执行状态">{getExecutionStatusText(flightTaskInfo.value?.executionStatus)}</FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={8}>
                  <FormItem label="航线ID">{renderValue(flightTaskInfo.value?.trackId)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="航线名称">{renderValue(flightTaskInfo.value?.trackName)}</FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={8}>
                  <FormItem label="机库序列号">{renderValue(flightTaskInfo.value?.nestSn)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="机库名称">{renderValue(flightTaskInfo.value?.nestName)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="天气冲突">{renderValue(flightTaskInfo.value?.weatherConflict)}</FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={8}>
                  <FormItem label="开始时间">{renderValue(flightTaskInfo.value?.startTime)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="结束时间">{renderValue(flightTaskInfo.value?.endTime)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="执行耗时(秒)">{renderValue(flightTaskInfo.value?.executionTime)}</FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={8}>
                  <FormItem label="起始航点">{renderValue(flightTaskInfo.value?.startingPoint)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="结束航点">{renderValue(flightTaskInfo.value?.lastPoint)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="备注">{renderValue(flightTaskInfo.value?.remark)}</FormItem>
                </Col>
              </Row>
            </div>
          ),
          "footer-page": (): JSX.Element => (
            <Button
              type="primary"
              onClick={() => {
                router.push({ path: "/flight-task-list" });
              }}
            >
              返回
            </Button>
          ),
        }}
      </CubeLayout>
    );
  },
});
