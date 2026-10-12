import { defineComponent, shallowRef } from "vue";
import type { DefineComponent } from "vue";

import { useCubeModal } from "@ghcloud/cube-app-design";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { batchFillFirePointEmptyFields, downloadFirePointImportTemplate } from "@ghcloud/cube-services-client/fire-management.client";
import { Button, UploadDragger, message } from "@ghcloud/cube-ui";

// cube-ui 的 UploadDragger 通过 attrs 透传属性，当前公开类型未声明这些 attrs。
const PointUploadDragger = UploadDragger as unknown as DefineComponent<Record<string, unknown>>;

export const PointImportModal = defineComponent({
  name: "PointImportModal",
  emits: ["imported"],
  setup: (_props, { emit, expose }) => {
    const uploading = shallowRef(false);
    const pendingFile = shallowRef<File | null>(null);

    const downloadTemplate = async (): Promise<void> => {
      try {
        message.loading({ content: "正在下载...", key: "point-template-download" });
        const blob = await useAuthRequest(() => downloadFirePointImportTemplate());
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "点位导入模板.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        message.success({ content: "模板下载成功", key: "point-template-download" });
      } catch (error) {
        message.error({ content: (error as Error).message || "模板下载失败", key: "point-template-download" });
      }
    };

    const selectFile = (file: File): false => {
      pendingFile.value = file;
      return false;
    };

    const submitImport = async (): Promise<void> => {
      const file = pendingFile.value;
      if (!file) {
        message.warning("请选择需要导入的 Excel 文件");
        return;
      }
      uploading.value = true;
      modalApi.setConfirmLoading(true);
      try {
        await useAuthRequest(() => batchFillFirePointEmptyFields(file));
        modalApi.close();
        emit("imported");
        message.success("批量补全数据成功");
      } catch (error) {
        const normalizedError = error as Error;
        message.error(normalizedError.message || "导入补全失败");
      } finally {
        uploading.value = false;
        modalApi.setConfirmLoading(false);
      }
    };

    const [ImportModal, modalApi] = useCubeModal({
      title: "导入补全点位数据",
      width: "560px",
      centered: true,
      closeOnClickModal: false,
      confirmText: "确认导入",
      onConfirm: () => void submitImport(),
      onClosed: () => {
        uploading.value = false;
        pendingFile.value = null;
      },
    });

    expose({ openModal: () => modalApi.open() });

    return () => (
      <ImportModal
        v-slots={{
          default: () => (
            <div>
              <div style={{ color: "#4e5969", fontSize: "13px", lineHeight: 1.7, marginBottom: "14px" }}>
                此操作仅补全已有点位的物理坐标、回路等缺失数据，不会新增或删除硬件关联关系。
              </div>
              <Button size="small" onClick={() => void downloadTemplate()} style={{ marginBottom: "14px" }}>
                <i class="fas fa-download" style={{ marginRight: "6px" }} />
                下载导入模板（.xlsx）
              </Button>
              <div
                style={{
                  border: "2px dashed #e5e6eb",
                  borderRadius: "8px",
                  padding: "30px",
                  textAlign: "center",
                  background: "#fafbfc",
                }}
              >
                <PointUploadDragger
                  name="file"
                  beforeUpload={selectFile}
                  showUploadList={false}
                  disabled={uploading.value}
                  accept=".xlsx,.xls"
                >
                  <i
                    class={uploading.value ? "fas fa-spinner fa-spin" : "fas fa-cloud-upload-alt"}
                    style={{ display: "block", marginBottom: "8px", color: "#165dff", fontSize: "32px" }}
                  />
                  <span style={{ color: "#1d2129", fontSize: "12px" }}>
                    {uploading.value
                      ? "正在导入中..."
                      : pendingFile.value
                        ? `已选择：${pendingFile.value.name}`
                        : "点击或将 Excel 文件拖拽到此处上传"}
                  </span>
                </PointUploadDragger>
              </div>
            </div>
          ),
        }}
      />
    );
  },
});
