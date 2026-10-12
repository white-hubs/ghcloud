import { defineComponent, onMounted, reactive, ref } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { Button, RadioGroup, RadioButton, message } from "@ghcloud/cube-ui";

import { LayoutInfoForm } from "./layout-info-form";
import type { LayoutFormData } from "./mock";
import { cubeSiteGeneratorService } from "@/api/service";
import { PageDesigner } from "@/designer";
import type { ComponentInstance } from "@/designer";
import { logger } from "@/logger";

/** 页面布局设计 */
export const PageManagementLayoutDesign = defineComponent({
  setup: () => {
    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get("mode");
    const layoutId = searchParams.get("id");
    const title = mode === "edit" ? "编辑布局" : "新增布局";

    const loading = ref(false);
    const saving = ref(false);
    const activeTab = ref<"info" | "content">("info");
    const primaryColor = ref("#1578FF");

    const state = reactive<LayoutFormData>({
      layoutName: "",
      slot: "main",
      components: [],
    });

    const loadLayoutDetail = async (): Promise<void> => {
      if (!layoutId || mode !== "edit") {
        return;
      }
      loading.value = true;
      try {
        const detail = await cubeSiteGeneratorService.getLayoutDetail({ id: layoutId });
        if (detail) {
          state.layoutName = detail.layoutName;
          try {
            const config = JSON.parse(detail.config);
            state.slot = config.slot ?? "main";
            state.components = config.components ?? [];
          } catch {
            state.slot = "main";
            state.components = [];
          }
        }
      } catch (error) {
        message.error("加载布局详情失败");
        logger.error("加载布局详情失败", error);
      } finally {
        loading.value = false;
      }
    };

    const loadSiteSetting = async (): Promise<void> => {
      try {
        const setting = await cubeSiteGeneratorService.getWebsiteSetting();
        if (setting?.primaryColor) {
          primaryColor.value = setting.primaryColor;
        }
      } catch (error) {
        logger.error("加载站点设置失败", error);
      }
    };

    onMounted(() => {
      loadLayoutDetail();
      loadSiteSetting();
    });

    const handleUpdateComponents = (components: ComponentInstance[]): void => {
      state.components = components;
    };

    const handleSave = async (): Promise<void> => {
      if (!state.layoutName.trim()) {
        message.error("请输入布局名称");
        return;
      }
      if (!state.slot.trim()) {
        message.error("请输入插槽名称");
        return;
      }

      saving.value = true;
      try {
        const config = JSON.stringify({ slot: state.slot, components: state.components });
        const payload = {
          layoutName: state.layoutName.trim(),
          config,
          id: layoutId,
        };
        if (layoutId) {
          await cubeSiteGeneratorService.updateLayout({ ...payload });
        } else {
          await cubeSiteGeneratorService.addLayout(payload);
        }
        message.success("保存成功");
        if (!layoutId) {
          handleCancel();
        }
      } catch (error) {
        message.error("保存失败");
        logger.error("保存布局失败", error);
      } finally {
        saving.value = false;
      }
    };

    const handleCancel = (): void => {
      history.pushState({}, "", "/portal/site-generator/page-management/layout-list");
    };

    const slots = {
      "layout-header": (): JSX.Element => (
        <RadioGroup v-model:value={activeTab.value}>
          <RadioButton value="info">布局信息</RadioButton>
          <RadioButton value="content">布局内容</RadioButton>
        </RadioGroup>
      ),
      "layout-content": (): JSX.Element => (
        <div style={{ height: "100%" }}>
          {activeTab.value === "info" ? (
            <div style={{ overflow: "auto", height: "100%", padding: "16px" }}>
              <LayoutInfoForm data={state} />
            </div>
          ) : (
            <PageDesigner
              mode="layout"
              v-model={state.components}
              primaryColor={primaryColor.value}
              onUpdate:modelValue={handleUpdateComponents}
            />
          )}
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Button onClick={handleCancel}>返回</Button>
          <Button type="primary" loading={saving.value} onClick={handleSave}>
            保存
          </Button>
        </div>
      ),
    };

    return (): JSX.Element => <CubeLayout title={title} v-slots={slots}></CubeLayout>;
  },
});
