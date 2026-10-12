import styles from "./execute.module.less";
import { cubeDailyTaskService, cubeFileService, cubeDictionaryService } from "@/api/server";
import { Button, Loading, Field, Uploader, Icon, Form, showNotify } from "vant";
import { defineComponent, onMounted, ref, type VNode, reactive } from "vue";
import { useRoute } from "vue-router";
// import { InspectionStandard } from '@/views/inspection-standard/inspection-standard'
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import type { TaskExecuteModel } from "@ghcloud/cube-daily-task-service";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import type { UploaderFileListItem } from "vant";
const itemCode = "INSPECTION_PATROL_SUBMIT_CONFIG";
interface FileType {
  businessKey: string;
  ossId: string;
  id: string;
  name: string;
  path: string;
  refCount: number;
  size: number;
  suffix: string;
  type: string;
}
type TaskItemAllList = {
  id: string;
  name: string;
  itemList: TaskItemList[];
};
type TaskItemList = {
  content: string;
  createTime: string;
  id: string;
  name: string;
  tag: string;
  resultList: TaskItem[];
  itemList: TaskItem[];
  fileVOS: FileType[];
};
type TaskItem = {
  defaultResultItem: string;
  createTime: string;
  id: string;
  mustRemarkResultItems: string;
  mustTakePhotoResultItems: string;
  name: string;
  resultLabelJson: string;
  resultItemValue: string;
  resultItemName: string;
  isEditMore: boolean;
  isUploadImage: boolean;
  remark: string;
  errorFlag: boolean;
  fileIds: string[];
};
type TaskObjectItem = {
  id: string;
  targetName: string;
  executorName: string;
  location: string;
  handlerName: string;
  status: string;
  areaName: string;
};
export const TaskExecuteNormal = defineComponent({
  setup() {
    const loading = ref(false);
    const submitLoading = ref(false);
    const formRef = ref();
    const route = useRoute();
    const id = route.query.id as string;
    const taskName = ref("");
    const dailyType = ref("");
    const form = reactive({
      remark: "",
      fileVOS: [] as FileType[],
      fileIds: [] as string[],
    });
    let dictConfig: {
      uploadMethod: string[];
      watermark: string[];
    } = {
      uploadMethod: [],
      watermark: [],
    };

    const getPatrolFormConfig = async (): Promise<void> => {
      try {
        const config = await cubeDictionaryService.getDictionaryByItem({
          itemCode,
          code: "uploadPicConfig",
        });
        if (config.length === 0) return;
        const variable = JSON.parse(config[0].variable);
        dictConfig = variable as typeof dictConfig;
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
      }
    };

    const loadTaskDetail = async (): Promise<void> => {
      try {
        const res = await cubeDailyTaskService.getDailyTaskDetail({ id });
        taskName.value = res.name;
        dailyType.value = res.dailyType;
      } catch (error) {
      }
    };

    const clickUpload = async (): Promise<void> => {
      const fileList = form.fileVOS ? form.fileVOS : [];
      if (getEnvironment() === "cubeApp") {
        if (!form.fileVOS) {
          form.fileVOS = [];
        }
        // js sdk 能力调取
        const res = await cubeAppService.uploadImage("3", {
          sceneCode: GLOBAL_SCENE_CODE.inspectionRecord,
          watermarkTypes: dictConfig.watermark,
          uploadMethod: dictConfig.uploadMethod,
        });
        form.fileVOS = [
          ...fileList,
          ...res.map((e) => {
            const item = e as { path: string; id: string };
            return {
              url: item.path,
              ossId: item.id,
              isImage: true,
            };
          }),
        ] as FileType[];
        const ids = form.fileVOS.map((x: { ossId: string }) => x.ossId ?? "");
        form.fileIds = ids;
      }
    };
    // 上传图片
    const handleFileAfterRead = async (file: UploaderFileListItem | UploaderFileListItem[]): Promise<void> => {
      const fileList = [];
      if (Array.isArray(file)) {
        for (const fileItem of file) {
          fileItem.status = "uploading";
          fileItem.message = "上传中...";
          const payload = {
            businessKey: "mdata",
            sceneCode: GLOBAL_SCENE_CODE.inspectionRecord,
            file: fileItem.file as Blob,
          };
          const fileInfo = await cubeFileService.uploadFile(payload);
          fileList.push(fileInfo);
          fileItem.url = fileInfo.path as unknown as string;
          fileItem.status = "done";
          fileItem.message = "上传成功";
        }
      } else {
        file.status = "uploading";
        file.message = "上传中...";
        const payload = {
          businessKey: "mdata",
          // sceneCode: GLOBAL_SCENE_CODE.inspectionRecord,
          file: file.file as Blob,
        };
        const result = await cubeFileService.uploadFile(payload);
        fileList.push(result);
        file.url = result.path as unknown as string;
        file.status = "done";
        file.message = "上传成功";
      }

      const ids = fileList.map((x) => x.id ?? "");
      ids.forEach((x) => {
        form.fileIds.push(x);
      });
    };
    const upload = (): VNode => {
      return (
        <Uploader
          v-model={form.fileVOS}
          multiple
          capture="camera"
          readonly={getEnvironment() === "cubeApp"}
          onClickUpload={async () => clickUpload()}
          afterRead={(file: UploaderFileListItem | UploaderFileListItem[]) => {
            handleFileAfterRead(file);
          }}
        >
          <div class={styles.upload}>
            <Icon name="plus" size="24" color="#c1c1c1" />
          </div>
        </Uploader>
      );
    };

    const ItemDom = (): VNode => {
      return (
        <div style={{ background: "#fff", marginBottom: "10px" }}>
          <div style={{ padding: "10px 16px", display: "flex", alignItems: "center" }}>
            <div style={{ width: "4px", height: "16px", background: "#1989fa", marginRight: "8px" }}></div>
            <div style={{ fontWeight: "bold" }}>完成情况</div>
          </div>
          <Field
            label="说明"
            placeholder="请输入"
            modelValue={form.remark}
            onUpdate:modelValue={(val: string) => {
              form.remark = val;
            }}
          />
          <Field label="附件上传" label-align="left" v-slots={{ input: () => upload() }} />
        </div>
      );
    };

    // 提交
    const handleSubmit = async (): Promise<void> => {
      if (!form.remark && (!form.fileIds || form.fileIds.length === 0)) {
        showNotify({ type: "warning", message: "请填写说明或上传附件" });
        return;
      }
      const payload = {
        dailyType: dailyType.value,
        taskId: id,
        taskName: taskName.value,
        remark: form.remark,
        fileIds: form.fileIds,
      };
      await handleRequest(payload);
    };
    const handleRequest = async (commandList: TaskExecuteModel): Promise<void> => {
      submitLoading.value = true;
      try {
        await cubeDailyTaskService.dailyTaskSubmit(commandList);
        showNotify({ type: "success", message: "处理成功" });
        onCancel();
      } catch {
      } finally {
        submitLoading.value = false;
      }
    };
    onMounted(() => {
      getPatrolFormConfig();
      loadTaskDetail();
    });

    // const cancel = (): void => {
    //   router.push({ path: '/inspection-cancel', query: { id: detail.value.recordId, batch: 'inspection' } })
    // }
    const onCancel = (): void => {
      if (getEnvironment() === "cubeApp") {
        cubeAppService.backPage();
        cubeAppService.backPage();
      } else {
        history.back();
        history.back();
      }
    };
    return (): VNode => (
      <>
        {
          <>
            <CubeNavBar title={"执行处理"} />
            <Form ref={formRef}>
              <div class={styles.wrapper}>
                {loading.value ? (
                  <Loading size="24px" vertical>
                    加载中...
                  </Loading>
                ) : (
                  ItemDom()
                )}
              </div>
              {
                <Button type="primary" block onClick={handleSubmit} loading={submitLoading.value}>
                  提交
                </Button>
              }
            </Form>
          </>
        }
      </>
    );
  },
});
