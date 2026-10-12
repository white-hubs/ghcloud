import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type { SitePageVO } from "@ghcloud/cube-static-site-generator-service";
import { Button, RadioGroup, RadioButton, message } from "@ghcloud/cube-ui";

import { type LayoutOption, type PageFormData } from "./mock";
import { PageInfoForm } from "./page-info-form";
import { authStore } from "@/api/auth-store";
import { cubeSiteGeneratorService } from "@/api/service";
import { PageDesigner } from "@/designer";
import type { ComponentInstance } from "@/designer";
import { logger } from "@/logger";

function voToFormData(vo: SitePageVO): PageFormData {
  return {
    id: vo.id,
    pageName: vo.pageName,
    pageRoute: vo.pageRoute,
    layout: vo.layoutId,
    status: Number(vo.status ?? 1),
    meta: {
      title: vo.metaTitle,
      description: vo.metaDescription,
      keywords: vo.metaKeywords,
      navStyle: vo.metaNavStyle,
    },
    components: vo.components ? JSON.parse(vo.components) : [],
  };
}

function formDataToPayload(data: PageFormData) {
  const components = data.components.map((comp) => {
    if (comp.name === "ConsultationForm") {
      return {
        ...comp,
        props: {
          ...comp.props,
          tenant: authStore.tenant,
        },
      };
    }
    return comp;
  });
  return {
    pageName: data.pageName,
    pageRoute: data.pageRoute,
    layoutId: data.layout,
    metaNavStyle: data.meta.navStyle ?? "",
    metaTitle: data.meta.title ?? "",
    metaDescription: data.meta.description ?? "",
    metaKeywords: data.meta.keywords ?? "",
    components: components ? JSON.stringify(components) : "",
    status: data.status ?? 1,
  };
}

/** 页面内容编辑 */
export const PageManagementDesign = defineComponent({
  setup: () => {
    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get("mode");
    const pageId = searchParams.get("id");
    const title = mode === "edit" ? "编辑页面" : "新增页面";

    const loading = ref(false);
    const saving = ref(false);
    const layoutOptions = ref<LayoutOption[]>([]);
    const activeTab = ref<"info" | "content">("info");
    const primaryColor = ref("#1578FF");

    const state = reactive<PageFormData>({
      pageName: "",
      pageRoute: "",
      layout: "",
      status: 1,
      meta: {
        title: "",
        description: "",
        keywords: "",
      },
      components: [],
    });

    const loadLayoutOptions = async (): Promise<void> => {
      try {
        const list = await cubeSiteGeneratorService.getLayoutList();
        layoutOptions.value = list.map((item) => ({ label: item.layoutName, value: item.id }));
      } catch (error) {
        logger.error("加载布局选项失败", error);
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

    const loadPageDetail = async (): Promise<void> => {
      if (!pageId || mode !== "edit") {
        return;
      }
      loading.value = true;
      try {
        const detail = await cubeSiteGeneratorService.getPageDetail({ id: pageId });
        const formData = voToFormData(detail);
        Object.assign(state, formData);
      } catch (error) {
        message.error("加载页面详情失败");
        logger.error("加载页面详情失败", error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadLayoutOptions();
      loadPageDetail();
      loadSiteSetting();
    });

    const handleUpdateComponents = (components: ComponentInstance[]): void => {
      state.components = components;
    };

    const isBuiltinPage = computed(() => {
      const route = state.pageRoute;
      return ["/information.html", "/information/detail-{id}.html", "/consultation.html"].includes(route);
    });

    const handleSave = async (): Promise<void> => {
      if (!state.pageName.trim()) {
        message.error("请输入页面名称");
        return;
      }
      if (!isBuiltinPage.value && !state.pageRoute.trim()) {
        message.error("请输入页面路由");
        return;
      }
      if (!state.layout) {
        message.error("请选择绑定布局");
        return;
      }

      saving.value = true;
      try {
        const payload = formDataToPayload(state);
        if (mode === "add") {
          await cubeSiteGeneratorService.addPage(payload);
        } else if (pageId) {
          await cubeSiteGeneratorService.updatePage({ id: pageId, ...payload });
        }
        // 同时保存 components 到 mock（后端暂无 components 字段）
        // await saveMockPage({ ...state, id: pageId ?? undefined });
        message.success("保存成功");
        if (mode === "add") {
          handleCancel();
        }
      } catch (error) {
        message.error("保存失败");
        logger.error("保存页面失败", error);
      } finally {
        saving.value = false;
      }
    };

    const handleCancel = (): void => {
      history.pushState({}, "", "/portal/site-generator/page-management/list");
    };

    const slots = {
      "layout-header": (): JSX.Element => (
        <RadioGroup v-model:value={activeTab.value}>
          <RadioButton value="info">页面信息</RadioButton>
          <RadioButton value="content">页面内容</RadioButton>
        </RadioGroup>
      ),
      "layout-content": (): JSX.Element => (
        <div style={{ height: "100%" }}>
          {activeTab.value === "info" ? (
            <div style={{ overflow: "auto", height: "100%", padding: "16px" }}>
              <PageInfoForm data={state} layoutOptions={layoutOptions.value} isBuiltin={isBuiltinPage.value} />
            </div>
          ) : (
            <PageDesigner
              mode="page"
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
