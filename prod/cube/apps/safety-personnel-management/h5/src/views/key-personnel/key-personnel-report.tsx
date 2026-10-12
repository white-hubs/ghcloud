import { Button, Field, Form, showToast } from "vant";
import { defineComponent, onMounted, ref, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { FileVO } from "@ghcloud/cube-service-interface/safety-personnel";
import { createKeyPersonReport } from "@ghcloud/cube-services-client/safety-personnel.client";

import { Bar } from "@/components/bar/bar";
import { FileUploader } from "@/components/file-uploader/file-uploader";
import { KEY_PERSON_SCENE } from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";

import styles from "./key-personnel.module.less";

export const KeyPersonnelReportPage = defineComponent({
  name: "KeyPersonnelReportPage",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const personId = Number(route.query.id);
    const validPersonId = Number.isFinite(personId) && personId > 0;
    const content = ref("");
    const fileIds = ref<string[]>([]);
    const files = ref<FileVO[]>([]);
    const submitting = ref(false);

    const submit = async (): Promise<void> => {
      if (submitting.value) return;
      if (!validPersonId) {
        showToast("重点人员参数无效");
        return;
      }
      if (!content.value.trim()) {
        showToast("请输入上报内容");
        return;
      }
      submitting.value = true;
      try {
        await useAuthRequest(() =>
          createKeyPersonReport(personId, {
            content: content.value.trim(),
            reportAttachmentFileIds: fileIds.value,
          }),
        );
        showToast("上报成功");
        router.back();
      } finally {
        submitting.value = false;
      }
    };

    onMounted(() => {
      if (!validPersonId) {
        showToast("重点人员参数无效");
        router.back();
      }
    });

    return (): VNode => (
      <div class="page">
        <Bar name="监管上报" />
        <Form class={styles.form} onSubmit={() => void submit()}>
          <div class={styles.formHint}>{route.query.name ? `上报对象：${String(route.query.name)}` : "填写监管上报内容"}</div>
          <Field
            v-model={content.value}
            label="内容"
            type="textarea"
            rows={6}
            autosize
            maxlength={500}
            showWordLimit
            placeholder="请输入监管情况、处置结果或跟进事项"
          />
          <div class={styles.formBlock}>
            <div class={styles.formLabel}>附件</div>
            <FileUploader
              v-model:fileIds={fileIds.value}
              v-model:files={files.value}
              sceneCode={KEY_PERSON_SCENE.REPORT}
              maxCount={6}
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
            />
          </div>
          <div class={styles.submitBar}>
            <Button block type="primary" nativeType="submit" loading={submitting.value} disabled={submitting.value || !validPersonId}>
              提交
            </Button>
          </div>
        </Form>
      </div>
    );
  },
});
