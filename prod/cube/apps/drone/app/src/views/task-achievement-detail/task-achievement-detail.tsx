import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type { TaskAchievementListModel } from "@ghcloud/cube-drone-service";
import { Button, Col, FormItem, message, Row } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeDroneService } from "@/api/server";

import styles from "./task-achievement-detail.module.less";

const renderValue = (value?: boolean | number | string): string => {
  if (typeof value === "boolean") {
    return value ? "是" : "否";
  }
  if (value === 0) {
    return "0";
  }
  return value ? String(value) : "--";
};

const downloadBlob = (blob: Blob, fileName?: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || "任务成果文件";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const TaskAchievementDetail = defineComponent({
  name: "TaskAchievementDetail",
  setup: () => {
    const { pageTitle } = usePageName();
    const router = useRouter();
    const taskAchievementInfo = ref<TaskAchievementListModel | null>(null);
    const downloading = ref(false);

    const loadTaskAchievementInfo = (): void => {
      const detail = sessionStorage.getItem("taskAchievementInfo");
      taskAchievementInfo.value = detail ? (JSON.parse(detail) as TaskAchievementListModel) : null;
    };

    const getFileKey = (): string => taskAchievementInfo.value?.fileKey?.trim() ?? "";

    const handleDownload = async (): Promise<void> => {
      const fileKey = getFileKey();
      if (!fileKey) {
        return;
      }
      try {
        downloading.value = true;
        const blob = await cubeDroneService.downloadTaskAchievement(fileKey);
        downloadBlob(blob, taskAchievementInfo.value?.fileName);
      } catch {
        message.error("下载失败");
      } finally {
        downloading.value = false;
      }
    };

    onMounted(() => {
      loadTaskAchievementInfo();
    });

    return (): JSX.Element => (
      <CubeLayout title={pageTitle}>
        {{
          "layout-header": (): JSX.Element =>
            getFileKey() ? (
              <Button type="primary" loading={downloading.value} onClick={() => void handleDownload()}>
                下载
              </Button>
            ) : (
              <span />
            ),
          "layout-content": (): JSX.Element => (
            <div class={styles.content}>
              <Row gutter={24}>
                <Col span={8}>
                  <FormItem label="任务名称">{renderValue(taskAchievementInfo.value?.taskName)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="航线名称">{renderValue(taskAchievementInfo.value?.trackName)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="文件名称">{renderValue(taskAchievementInfo.value?.fileName)}</FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={8}>
                  <FormItem label="任务ID">{renderValue(taskAchievementInfo.value?.taskId)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="计划ID">{renderValue(taskAchievementInfo.value?.scheduledId)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="创建时间">{renderValue(taskAchievementInfo.value?.createTime)}</FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={8}>
                  <FormItem label="机库序列号">{renderValue(taskAchievementInfo.value?.nestSn)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="无人机序列号">{renderValue(taskAchievementInfo.value?.droneSn)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="文件类型">{renderValue(taskAchievementInfo.value?.fileType)}</FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={8}>
                  <FormItem label="通道类型">{renderValue(taskAchievementInfo.value?.channelType)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="上传类型">{renderValue(taskAchievementInfo.value?.uploadType)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="文件大小(字节)">{renderValue(taskAchievementInfo.value?.fileSize)}</FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={8}>
                  <FormItem label="分析状态">{renderValue(taskAchievementInfo.value?.analysisStatus)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="判定状态">{renderValue(taskAchievementInfo.value?.judgeStatus)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="类型标识">{renderValue(taskAchievementInfo.value?.type)}</FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={8}>
                  <FormItem label="子类型标识">{renderValue(taskAchievementInfo.value?.ptype)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="经度">{renderValue(taskAchievementInfo.value?.longitude)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="纬度">{renderValue(taskAchievementInfo.value?.latitude)}</FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={8}>
                  <FormItem label="海拔">{renderValue(taskAchievementInfo.value?.altitude)}</FormItem>
                </Col>
              </Row>
            </div>
          ),
          "footer-page": (): JSX.Element => (
            <Button
              type="primary"
              onClick={() => {
                router.push({ path: "/task-achievement-list" });
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
