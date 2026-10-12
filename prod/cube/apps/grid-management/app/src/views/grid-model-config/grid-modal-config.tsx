import { cubeGridManagementService, cubeVisualizationService } from "@/api/server";
import { CubeLayout } from "@ghcloud/cube-app-design";
import { Button, Form, FormItem, message, Select } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { defineComponent, reactive, ref } from "vue";

export const GridModalConfig = defineComponent({
  name: "GridModalConfig",
  setup() {
    const { pageTitle } = usePageName();
    const disabled = ref(true);
    const submitLoading = ref(false);
    const options = ref<{ label: string; value: string }[]>([]);
    const formState = reactive<{
      gridModel: string | undefined;
    }>({
      gridModel: undefined,
    });
    cubeVisualizationService.getVisualProjectList().then((resp) => {
      options.value = resp.map((item) => ({
        label: item.projectName,
        value: item.id,
      }));
    });
    cubeGridManagementService.getGridModelConfig().then((resp) => {
      formState.gridModel = resp.modelItemId;
      disabled.value = false;
    });
    const onSubmit = async () => {
      try {
        submitLoading.value = true;
        await cubeGridManagementService.setGridModelConfig({
          modelItemId: formState.gridModel || "",
        });
        message.success("保存成功");
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON() || {};
        message.error(errorMessage || "保存失败");
      } finally {
        submitLoading.value = false;
      }
    };

    return () => (
      <CubeLayout
        title={pageTitle}
        v-slots={{
          "layout-content": () => (
            <div style={{ width: "400px", marginTop: "20px" }}>
              <Form model={formState} rules={[{ required: true, message: "请选择网格所用模型" }]}>
                <FormItem label="网格所用模型" name="gridModel">
                  <Select
                    value={formState.gridModel}
                    placeholder="请选择"
                    options={options.value}
                    show-search
                    optionFilterProp="label"
                    onUpdate:value={(val) => {
                      formState.gridModel = val;
                      disabled.value = false;
                    }}
                  />
                </FormItem>
              </Form>
            </div>
          ),
          "footer-page": () => (
            <div style={{ textAlign: "right" }}>
              <Button type="primary" disabled={disabled.value} onClick={onSubmit}>
                保存
              </Button>
            </div>
          ),
        }}
      />
    );
  },
});
