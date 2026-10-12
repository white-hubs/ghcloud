import styles from "./task-feedback.module.less";
import { cubeDailyTaskService } from "@/api/server";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import { Button, CellGroup, Field, Form, Icon, Loading, type FormInstance, Slider, showImagePreview, showNotify } from "vant";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

export const TaskFeedbackPage = defineComponent({
  name: "TaskFeedbackPage",
  setup: () => {
    const loading = ref(false);
    const formRef = ref<FormInstance>();
    const route = useRoute();
    const router = useRouter();
    const taskId = (route.query.id as string) ?? "";
    const queryMin = Math.min(100, Math.max(0, Number((route.query.minSchedule as string) ?? "0") || 0));
    /** 滑块下限：取路由传入与已反馈记录中的较大进度 */
    const sliderMin = ref(queryMin);

    const formData = reactive<{
      schedule: number;
      description: string;
      fileIds: string;
      fileVOS: { id: string; path: string }[];
    }>({
      schedule: queryMin,
      description: "",
      fileIds: "",
      fileVOS: [],
    });

    onMounted(async (): Promise<void> => {
      if (!taskId) {
        return;
      }
      try {
        const list = await cubeDailyTaskService.getDailyTaskFeedbackList({ taskId });
        const maxFromRecords = list?.length ? Math.max(...list.map((r) => Number(r.schedule ?? 0))) : 0;
        const nextMin = Math.max(sliderMin.value, maxFromRecords);
        sliderMin.value = nextMin;
        if (formData.schedule < nextMin) {
          formData.schedule = nextMin;
        }
      } catch (_ignore) {
        // 接口失败时沿用路由 minSchedule
      }
    });

    const fileMaxCount = 5;

    const filedUploadSlots = {
      input: (): JSX.Element => {
        return (
          <div class={styles["uploaded-list"]}>
            {formData.fileVOS.map((item, index) => {
              return (
                <div
                  class={styles.uploaded}
                  key={item.id}
                  onClick={() => {
                    handlePreviewImage(index);
                  }}
                >
                  <img src={item.path} alt="" width={60} height={60} />
                  <Icon
                    name="clear"
                    size="20px"
                    color="#000"
                    onClick={(e: Event) => {
                      e.stopPropagation();
                      deleteImage(item.id);
                    }}
                  />
                </div>
              );
            })}
            {formData.fileVOS.length < fileMaxCount && (
              <div class={styles.upload} onClick={handleUploadImage}>
                <Icon name="plus" size="30px" color="#d9d9d9" />
              </div>
            )}
          </div>
        );
      },
    };

    const handleUploadImage = async (): Promise<void> => {
      try {
        const result = await cubeAppService.uploadFile(String(fileMaxCount - formData.fileVOS.length), {
          sceneCode: GLOBAL_SCENE_CODE.inspectionRecord,
        });
        formData.fileVOS = [...formData.fileVOS, ...result];
      } catch (error) {
      }
    };

    const deleteImage = (id: string): void => {
      formData.fileVOS = formData.fileVOS.filter((item) => item.id !== id);
    };

    const handlePreviewImage = (showIndex: number): void => {
      showImagePreview(
        formData.fileVOS.map((item) => item.path),
        showIndex,
      );
    };

    const feedbackSubmit = async (): Promise<void> => {
      formData.fileIds = formData.fileVOS.map((item) => item.id).join(",");
      try {
        await formRef.value?.validate();
      } catch {
        return;
      }
      if (!taskId) {
        showNotify({ type: "danger", message: "任务id无效" });
        return;
      }
      loading.value = true;
      try {
        await cubeDailyTaskService.dailyTaskFeedback({
          taskId,
          schedule: formData.schedule,
          description: formData.description,
          ...(formData.fileIds ? { files: formData.fileIds } : {}),
        });
        showNotify({ type: "success", message: "反馈成功" });
        await router.replace({ name: "task-detail", query: { id: taskId } });
      } catch (error) {
        const err = error as { toJSON?: () => { errorMessage: string } };
        const msg = err.toJSON?.()?.errorMessage ?? "提交失败";
        showNotify({ type: "danger", message: msg });
      } finally {
        loading.value = false;
      }
    };

    return (): JSX.Element => (
      <>
        <CubeNavBar title="任务反馈" showBack />
        <div class={styles["feedback-loading-box"]} v-show={loading.value}>
          <Loading class={styles["feedback-loading"]} vertical color="#1989fa">
            提交中...
          </Loading>
        </div>
        <div class={styles["feedback-box"]}>
          <div class={styles["feedback-content"]}>
            <Form ref={formRef} required="auto">
              <CellGroup inset>
                <Field
                  class={styles["field-schedule"]}
                  name="schedule"
                  label="任务进度"
                  label-width="5.5em"
                  center
                  modelValue={formData.schedule}
                  required
                  rules={[{ required: true, message: "请设置进度" }]}
                  v-slots={{
                    input: () => {
                      return (
                        <div class={styles["schedule-slider-wrap"]}>
                          <div class={styles["schedule-ruler"]}>
                            <span>0%</span>
                            <span class={styles["schedule-percent"]}>{formData.schedule}%</span>
                            <span>100%</span>
                          </div>
                          <Slider
                            key={`${sliderMin.value}`}
                            class={styles["schedule-slider"]}
                            barHeight={2}
                            buttonSize={14}
                            min={0}
                            max={100}
                            step={1}
                            modelValue={formData.schedule}
                            onUpdate:modelValue={(v: number) => {
                              const next = Math.round(Number(v));
                              formData.schedule = Math.max(sliderMin.value, Math.min(100, next));
                            }}
                          />
                        </div>
                      );
                    },
                  }}
                />
                <Field
                  label="反馈描述"
                  v-model={formData.description}
                  rows="1"
                  autosize={{ maxHeight: 300, minHeight: 80 }}
                  type="textarea"
                  maxlength="500"
                  placeholder="请输入反馈描述（选填）"
                />
                <Field
                  v-model={formData.fileIds}
                  name="fileIds"
                  label="附件图片"
                  v-slots={filedUploadSlots}
                  readonly
                />
              </CellGroup>
              <div class={styles["feedback-btn"]}>
                <div class={styles["feedback-btn-line"]}>
                  <Button block type="primary" native-type="button" onClick={feedbackSubmit}>
                    提交反馈
                  </Button>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </>
    );
  },
});
