import { inject, defineComponent } from "vue";

import { Button, Form, FormItem, Input, Select, Spin } from "@ghcloud/cube-ui";

import { MODEL_CONFIGURATION_KEY, type ModelConfigurationApi } from "../composables/use-model-configuration";
import { MODEL_ENTRY_OPTIONS } from "../types";

import styles from "./render-settings.module.less";

/**
 * 渲染设置：可视化标题 + 模型类型。
 */
export const RenderSettings = defineComponent({
  name: "RenderSettings",
  setup() {
    const modelApi = inject(MODEL_CONFIGURATION_KEY) as ModelConfigurationApi | undefined;

    const onTitleChange = (val: string): void => {
      if (!modelApi) {
        return;
      }
      modelApi.modelConfig.value.title = val ?? "";
      modelApi.markDirty();
    };

    const onEntryChange = (val: string): void => {
      if (!modelApi) {
        return;
      }
      modelApi.modelConfig.value.entry = (val || "views") as typeof modelApi.modelConfig.value.entry;
      modelApi.markDirty();
    };

    const handleSave = (): void => {
      void modelApi?.save();
    };

    return () => {
      if (!modelApi) {
        return <div class={styles.root}>模型配置上下文缺失</div>;
      }

      return (
        <div class={styles.root}>
          <Spin spinning={modelApi.loading.value}>
            <Form layout="horizontal" labelCol={{ style: { width: "100px" } }} wrapperCol={{ style: { flex: 1 } }} class={styles.form}>
              <FormItem label="可视化标题" required>
                <Input
                  value={modelApi.modelConfig.value.title}
                  maxlength={50}
                  showCount
                  placeholder="请输入可视化标题"
                  onUpdate:value={onTitleChange}
                />
              </FormItem>
              <FormItem label="渲染模型" required>
                <Select
                  value={modelApi.modelConfig.value.entry}
                  options={MODEL_ENTRY_OPTIONS}
                  placeholder="请选择模型类型"
                  style={{ width: "100%" }}
                  onUpdate:value={(val: string | number | string[]) => onEntryChange(String(val ?? "views"))}
                />
              </FormItem>
            </Form>
            <div class={styles.actions}>
              <Button type="primary" loading={modelApi.saving.value} onClick={handleSave}>
                保存
              </Button>
            </div>
            <p class={styles.tip}>切换渲染模型后，「引入模型 / 视角配置」等页面将按所选类型展示对应配置项。</p>
          </Spin>
        </div>
      );
    };
  },
});

export default RenderSettings;
