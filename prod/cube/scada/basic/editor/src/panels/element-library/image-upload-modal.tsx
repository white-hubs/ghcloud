import { InboxOutlined } from "@ant-design/icons-vue";
import { AutoComplete, Form, FormItem, Input, Modal, Upload, message, type UploadFile, type UploadProps } from "ant-design-vue";
import { computed, defineComponent, onBeforeUnmount, shallowRef, watch, type PropType } from "vue";

import { IMAGE_FILE_ACCEPT, MAX_IMAGE_FILE_SIZE, isSupportedImageFile } from "./image-element";

export interface ImageUploadPayload {
  file: File;
  label: string;
  group: string;
}

export const ImageUploadModal = defineComponent({
  name: "ImageUploadModal",
  props: {
    open: { type: Boolean, default: false },
    uploading: { type: Boolean, default: false },
    groups: { type: Array as PropType<string[]>, default: () => [] },
  },
  emits: ["cancel", "submit"],
  setup(props, { emit }) {
    const selectedFile = shallowRef<File | null>(null);
    const previewUrl = shallowRef("");
    const label = shallowRef("");
    const group = shallowRef("");

    const groupOptions = computed(() => props.groups.map((item) => ({ value: item })));
    const fileList = computed<UploadFile[]>(() =>
      selectedFile.value
        ? [
            {
              uid: "selected-image",
              name: selectedFile.value.name,
              status: "done",
            },
          ]
        : [],
    );

    function revokePreview(): void {
      if (!previewUrl.value) return;
      URL.revokeObjectURL(previewUrl.value);
      previewUrl.value = "";
    }

    function clearFile(): void {
      revokePreview();
      selectedFile.value = null;
    }

    function resetForm(): void {
      clearFile();
      label.value = "";
      group.value = "";
    }

    const beforeUpload: UploadProps["beforeUpload"] = (file) => {
      const imageFile = file as File;
      if (!isSupportedImageFile(imageFile)) {
        void message.error("仅支持 PNG、JPG、WebP、GIF 和 SVG 图片");
        return false;
      }
      if (imageFile.size > MAX_IMAGE_FILE_SIZE) {
        void message.error("图片大小不能超过 10MB");
        return false;
      }

      clearFile();
      selectedFile.value = imageFile;
      previewUrl.value = URL.createObjectURL(imageFile);
      if (!label.value) label.value = imageFile.name.replace(/\.[^.]+$/, "");
      return false;
    };

    function submit(): void {
      if (!selectedFile.value) {
        void message.warning("请先选择一张图片");
        return;
      }
      if (!label.value.trim()) {
        void message.warning("请输入图片名称");
        return;
      }
      emit("submit", {
        file: selectedFile.value,
        label: label.value.trim(),
        group: group.value.trim(),
      } satisfies ImageUploadPayload);
    }

    watch(
      () => props.open,
      (open) => {
        if (open) resetForm();
      },
    );
    onBeforeUnmount(revokePreview);

    return () => (
      <Modal
        open={props.open}
        title="上传自定义图片"
        okText="上传到图库"
        cancelText="取消"
        confirmLoading={props.uploading}
        width={560}
        onOk={submit}
        onCancel={() => emit("cancel")}
      >
        <Form layout="vertical" style={{ marginTop: "16px" }}>
          <FormItem label="图片文件" required>
            <Upload.Dragger
              accept={IMAGE_FILE_ACCEPT}
              maxCount={1}
              multiple={false}
              beforeUpload={beforeUpload}
              fileList={fileList.value}
              onRemove={() => {
                clearFile();
                return true;
              }}
            >
              {previewUrl.value ? (
                <img
                  src={previewUrl.value}
                  alt="待上传图片预览"
                  style={{ display: "block", width: "100%", height: "160px", objectFit: "contain" }}
                />
              ) : (
                <>
                  <p class="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p class="ant-upload-text">点击或拖拽图片到此区域</p>
                  <p class="ant-upload-hint">支持 PNG、JPG、WebP、GIF、SVG，单张不超过 10MB</p>
                </>
              )}
            </Upload.Dragger>
          </FormItem>
          <FormItem label="图片名称" required>
            <Input
              value={label.value}
              maxlength={60}
              placeholder="用于图库中显示"
              onChange={(event: any) => (label.value = event.target?.value ?? "")}
            />
          </FormItem>
          <FormItem label="图库分组">
            <AutoComplete
              value={group.value}
              options={groupOptions.value}
              placeholder="选择已有分组或输入新分组；留空归入未分组"
              onChange={(value) => (group.value = value == null ? "" : String(value))}
            />
          </FormItem>
        </Form>
      </Modal>
    );
  },
});
