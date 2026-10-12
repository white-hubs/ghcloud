import { defineComponent, ref, type PropType } from "vue";

import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import { Modal, UploadDragger, message } from "@ghcloud/cube-ui";

import { cubeFileService, cubeSiteGeneratorService } from "@/api/service";

import styles from "./material-modal.module.less";

interface UploadFileItem {
  name: string;
  size: number;
  type: string;
  originFileObj?: File;
}

export const MaterialUploadModal = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    pathId: {
      type: String as PropType<string | null>,
      default: null,
    },
  },
  emits: ["update:visible", "success"],
  setup(props, { emit }) {
    const uploading = ref(false);
    const fileList = ref<UploadFileItem[]>([]);

    const handleClose = (): void => {
      emit("update:visible", false);
      fileList.value = [];
    };

    const handleFileChange = (info: { fileList: any[] }): void => {
      fileList.value = info.fileList.map((f) => ({
        name: f.name,
        size: f.size || 0,
        type: f.type || "",
        originFileObj: f.originFileObj as File,
      }));
    };

    const handleUpload = async (): Promise<void> => {
      if (fileList.value.length === 0) {
        message.warning("请选择要上传的文件");
        return;
      }
      uploading.value = true;
      try {
        for (const fileItem of fileList.value) {
          const file = fileItem.originFileObj;
          if (!file) continue;
          const fileState = await cubeFileService.uploadFile({
            businessKey: "material",
            file,
            useTemporary: true,
            sceneCode: GLOBAL_SCENE_CODE.staticSiteGenerator,
          });
          await cubeSiteGeneratorService.addMaterial({
            pathId: props.pathId,
            fileId: fileState.id,
          });
        }
        message.success(`成功上传 ${fileList.value.length} 个文件`);
        emit("success");
        handleClose();
      } catch (error) {
        message.error((error as { errorMessage: string })?.errorMessage ?? "上传失败");
      } finally {
        uploading.value = false;
      }
    };

    return (): JSX.Element => (
      <Modal
        visible={props.visible}
        title="上传素材"
        width="560px"
        confirmLoading={uploading.value}
        onOk={handleUpload}
        onCancel={handleClose}
        maskClosable={false}
      >
        <UploadDragger
          multiple
          fileList={fileList.value as any}
          onChange={handleFileChange}
          beforeUpload={() => false}
          showUploadList={true}
        >
          <div class={styles["upload-area"]}>
            <div class={styles["upload-icon"]}>📁</div>
            <p class={styles["upload-title"]}>点击或拖拽文件到此区域上传</p>
            <p class={styles["upload-hint"]}>支持单文件或批量上传</p>
          </div>
        </UploadDragger>
      </Modal>
    );
  },
});
