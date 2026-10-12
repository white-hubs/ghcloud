import { DeleteOutlined, UploadOutlined } from "@ant-design/icons-vue";
import { Button, Space, Upload, message, type UploadProps } from "ant-design-vue";
import { defineComponent, type PropType } from "vue";

const MAX_BACKGROUND_IMAGE_SIZE = 5 * 1024 * 1024;
const BACKGROUND_IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
const SUPPORTED_BACKGROUND_IMAGE_TYPES = new Set(BACKGROUND_IMAGE_ACCEPT.split(","));

function isSupportedBackgroundImage(file: File): boolean {
  return SUPPORTED_BACKGROUND_IMAGE_TYPES.has(file.type) || /\.(?:png|jpe?g|webp|gif)$/iu.test(file.name);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("无法读取图片文件"));
      }
    });
    reader.addEventListener("error", () => reject(new Error("无法读取图片文件")));
    reader.readAsDataURL(file);
  });
}

export const BackgroundImageField = defineComponent({
  name: "BackgroundImageField",
  props: {
    modelValue: { type: String as PropType<string | undefined>, default: undefined },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const beforeUpload: UploadProps["beforeUpload"] = async (uploadFile) => {
      const file = uploadFile as File;
      if (!isSupportedBackgroundImage(file)) {
        void message.error("仅支持 PNG、JPG、WebP 和 GIF 图片");
        return false;
      }
      if (file.size > MAX_BACKGROUND_IMAGE_SIZE) {
        void message.error("背景图大小不能超过 5MB");
        return false;
      }

      try {
        emit("update:modelValue", await readFileAsDataUrl(file));
        void message.success("背景图已更新");
      } catch (error) {
        void message.error(error instanceof Error ? error.message : "背景图读取失败");
      }
      return false;
    };

    return () => (
      <div>
        {props.modelValue && (
          <img
            src={props.modelValue}
            alt="背景图预览"
            style={{
              display: "block",
              width: "100%",
              height: "120px",
              marginBottom: "10px",
              border: "1px solid #d9d9d9",
              borderRadius: "6px",
              objectFit: "cover",
            }}
          />
        )}
        <Space>
          <Upload accept={BACKGROUND_IMAGE_ACCEPT} maxCount={1} showUploadList={false} beforeUpload={beforeUpload}>
            <Button>
              <UploadOutlined /> {props.modelValue ? "更换背景图" : "上传背景图"}
            </Button>
          </Upload>
          {props.modelValue && (
            <Button danger onClick={() => emit("update:modelValue", "")}>
              <DeleteOutlined /> 清除
            </Button>
          )}
        </Space>
        <div style={{ marginTop: "6px", color: "#8c8c8c", fontSize: "12px", lineHeight: 1.5 }}>
          支持 PNG、JPG、WebP、GIF，不超过 5MB；展示时居中铺满，边缘可能被裁剪。
        </div>
      </div>
    );
  },
});
