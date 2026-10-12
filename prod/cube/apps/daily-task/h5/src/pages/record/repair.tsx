import dayjs from "dayjs";
import { Button, Field, Icon, Radio, RadioGroup, Uploader, showNotify, type UploaderFileListItem } from "vant";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import type { DailyRecordExceptionModel, DailyTaskRecordDetailsModel } from "@ghcloud/cube-daily-task-service";
import { RecordStatusMap } from "@ghcloud/cube-daily-task-service";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";

import { cubeDailyTaskService, cubeFileService } from "@/api/server";

import styles from "./repair.module.less";

type RepairUploadItem = UploaderFileListItem & { id?: string; ossId?: string; path?: string; type?: string };

export const RecordRepair = defineComponent({
  name: "RecordRepair",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const exceptionId = route.query.exceptionId as string;
    const loading = ref(false);
    const exception = ref<DailyRecordExceptionModel>();
    const record = ref<DailyTaskRecordDetailsModel>();
    const fileList = ref<RepairUploadItem[]>([]);
    const form = reactive<{
      executionResult: "NORMAL" | "ABNORMAL";
      remark: string;
      fileIds: string[];
    }>({
      executionResult: "NORMAL",
      remark: "",
      fileIds: [],
    });

    const loadDetail = async (): Promise<void> => {
      try {
        const data = await cubeDailyTaskService.getDailyTaskRepairDetail({ exceptionId });
        exception.value = data;
        record.value = await cubeDailyTaskService.getDailyTaskRecordDetail({
          id: data.recordId,
          taskId: data.taskId,
        });
      } catch {
        showNotify({ type: "danger", message: "获取异常详情失败" });
      }
    };

    const beforeRead = (file: File): boolean => {
      if (file.size > 10 * 1024 * 1024) {
        showNotify({ type: "warning", message: "单个附件不能超过10MB" });
        return false;
      }
      return true;
    };

    const uploadOne = async (item: RepairUploadItem): Promise<void> => {
      item.status = "uploading";
      item.message = "上传中...";
      try {
        const result = await cubeFileService.uploadFile({
          businessKey: "mdata",
          sceneCode: GLOBAL_SCENE_CODE.inspectionRecord,
          useTemporary: true,
          file: item.file as Blob,
        });
        if (result.path) {
          item.url = result.path;
        }
        item.id = result.id;
        item.ossId = result.id;
        item.path = result.path ?? "";
        item.type = result.type ?? result.suffix ?? "";
        item.status = "done";
        item.message = "";
      } catch {
        item.status = "failed";
        item.message = "上传失败";
      }
    };

    const afterRead = async (file: RepairUploadItem | RepairUploadItem[]): Promise<void> => {
      for (const item of Array.isArray(file) ? file : [file]) {
        await uploadOne(item);
      }
      syncFileIds();
    };

    const clickUpload = async (): Promise<void> => {
      if (getEnvironment() !== "cubeApp") {
        return;
      }
      const remainCount = 5 - fileList.value.length;
      if (remainCount <= 0) {
        showNotify({ type: "warning", message: "最多上传5个附件" });
        return;
      }
      const result = await cubeAppService.uploadFile(String(remainCount), {
        sceneCode: GLOBAL_SCENE_CODE.inspectionRecord,
      });
      fileList.value = [
        ...fileList.value,
        ...result.map((item) => ({
          id: item.id,
          ossId: item.id,
          path: item.path,
          type: item.type,
          url: item.path,
          name: item.name,
          status: "done" as const,
        })),
      ];
      syncFileIds();
    };

    const syncFileIds = (): void => {
      form.fileIds = fileList.value.map((item) => item.ossId).filter((id): id is string => !!id);
    };
    const getRecordStatusText = (): string => {
      const recordStatus = record.value?.recordStatus || (record.value?.executionResult === "NORMAL" ? "NORMAL" : "ABNORMAL_WAIT_REPAIR");
      return RecordStatusMap.get(recordStatus) || "--";
    };

    const submit = async (): Promise<void> => {
      if (loading.value) {
        return;
      }
      if (fileList.value.some((item) => item.status === "uploading")) {
        showNotify({ type: "warning", message: "附件正在上传，请稍后提交" });
        return;
      }
      try {
        loading.value = true;
        await cubeDailyTaskService.submitDailyTaskRepair({
          exceptionId,
          executionResult: form.executionResult,
          remark: form.remark,
          fileIds: form.fileIds,
        });
        showNotify({
          type: "success",
          message: "提交成功",
          onClose: () => router.go(-1),
        });
      } finally {
        loading.value = false;
      }
    };

    onMounted(loadDetail);

    return (): VNode => (
      <div class={styles.container}>
        <CubeNavBar showBack title="异常处理" />
        <section class={styles.summary}>
          <div class={styles.taskName}>{exception.value?.targetName || record.value?.taskName || "--"}</div>
          <div>处理时间：{record.value?.executionTime ? dayjs(record.value.executionTime).format("YYYY-MM-DD HH:mm:ss") : "--"}</div>
          <div>处理人：{record.value?.executorName || "--"}</div>
          <div>
            原巡检结果：<span class={styles.abnormal}>异常</span>
          </div>
          <div>当前状态：{getRecordStatusText()}</div>
        </section>

        <section class={styles.section}>
          <div class={styles.title}>处理结果</div>
          <RadioGroup v-model={form.executionResult} direction="horizontal">
            <Radio name="NORMAL">正常</Radio>
            <Radio name="ABNORMAL">异常</Radio>
          </RadioGroup>
        </section>

        <section class={styles.section}>
          <div class={styles.title}>处理备注</div>
          <Field
            v-model={form.remark}
            class={styles.remark}
            type="textarea"
            rows={4}
            maxlength={500}
            placeholder="请填写处置说明、整改详情等内容"
            show-word-limit
          />
        </section>

        <section class={styles.section}>
          <div class={styles.title}>附件上传</div>
          <Uploader
            v-model={fileList.value}
            multiple
            accept="*/*"
            max-count={5}
            readonly={getEnvironment() === "cubeApp"}
            before-read={beforeRead}
            after-read={afterRead}
            onClickUpload={clickUpload}
            onDelete={syncFileIds}
          >
            <div class={styles.upload}>
              <Icon name="plus" size="18" />
              <span>点击上传图片/文件</span>
            </div>
          </Uploader>
        </section>

        <div class={styles.submit}>
          <Button type="primary" block loading={loading.value} disabled={loading.value} loading-text="提交中..." onClick={submit}>
            确认提交
          </Button>
        </div>
      </div>
    );
  },
});
