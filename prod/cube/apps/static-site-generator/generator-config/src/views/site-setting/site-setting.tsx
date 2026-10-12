import { defineComponent, onMounted, reactive, ref } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type { FileVOState } from "@ghcloud/cube-protocol";
import { Button, Card, Form, FormItem, Input, Select, SelectOption, Textarea, message, type FormExpose } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { MaterialSelectModal } from "../material-management/components/material-select-modal";
import type { Material } from "../material-management/types";
import { getFaviconFiles, getOgImageFiles, type SiteSettingFormState } from "./mock";
import { cubeSiteGeneratorService } from "@/api/service";
import { logger } from "@/logger";

/** 站点设置 */
export const SiteSetting = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const formRenderRef = ref<FormExpose>();
    const submitting = ref(false);
    const ogImageFiles = ref<FileVOState[]>([]);
    const faviconFiles = ref<FileVOState[]>([]);
    const selectModalVisible = ref(false);
    const selectModalTarget = ref<"ogImage" | "favicon" | null>(null);

    const handleMaterialSelect = (selected: Material[]): void => {
      const material = selected[0];
      if (!material || !selectModalTarget.value) {
        return;
      }
      const url = material.url ?? "";
      if (selectModalTarget.value === "ogImage") {
        formState.ogImage = url;
        ogImageFiles.value = getOgImageFiles(url);
      } else {
        formState.favicon = url;
        faviconFiles.value = getFaviconFiles(url);
      }
    };

    const formState = reactive<SiteSettingFormState>({
      id: "",
      siteName: "",
      url: "",
      ogImage: "",
      favicon: "",
      primaryColor: "",
      navStyle: "",
      defaultTitle: "",
      defaultDescription: "",
      defaultKeywords: "",
      trackingScripts: [],
    });

    const rules = {
      siteName: [{ required: true, message: "请输入网站名称", trigger: "blur" }],
      url: [{ required: true, message: "请输入网站地址", trigger: "blur" }],
    };

    const resetForm = (): void => {
      formState.id = "";
      formState.siteName = "";
      formState.url = "";
      formState.ogImage = "";
      formState.favicon = "";
      formState.primaryColor = "";
      formState.navStyle = "";
      formState.defaultTitle = "";
      formState.defaultDescription = "";
      formState.defaultKeywords = "";
      formState.trackingScripts = [];
      ogImageFiles.value = [];
      faviconFiles.value = [];
    };

    const applyDetail = (detail: SiteSettingFormState): void => {
      Object.assign(formState, detail);
      const ogImage = detail.ogImage ?? "";
      const favicon = detail.favicon ?? "";
      ogImageFiles.value = getOgImageFiles(ogImage);
      faviconFiles.value = getFaviconFiles(favicon);
    };

    onMounted(async () => {
      try {
        const detail = await cubeSiteGeneratorService.getWebsiteSetting();
        if (detail) {
          applyDetail({
            id: detail.id,
            siteName: detail.siteName,
            url: detail.url,
            ogImage: detail.ogImage,
            favicon: detail.favicon,
            primaryColor: detail.primaryColor,
            navStyle: detail.navStyle,
            defaultTitle: detail.defaultTitle,
            defaultDescription: detail.defaultDescription,
            defaultKeywords: detail.defaultKeywords,
            trackingScripts: (() => {
              try {
                return JSON.parse(detail.trackingScripts || "[]");
              } catch {
                return [];
              }
            })(),
          });
        } else {
          resetForm();
        }
      } catch (error) {
        message.error((error as { errorMessage: string })?.errorMessage ?? "加载失败");
        resetForm();
      }
    });

    const handleAddScript = (): void => {
      formState.trackingScripts.push("");
    };

    const handleRemoveScript = (index: number): void => {
      formState.trackingScripts.splice(index, 1);
    };

    const handleSubmit = async (): Promise<void> => {
      try {
        await formRenderRef.value?.validate();
      } catch {
        return;
      }
      const ogImage = ogImageFiles.value[0]?.path?.trim() ?? "";
      const favicon = faviconFiles.value[0]?.path?.trim() ?? "";
      if (!ogImage) {
        message.error("请上传分享图");
        return;
      }
      if (!favicon) {
        message.error("请上传 Favicon");
        return;
      }
      const payload = {
        siteName: formState.siteName.trim(),
        url: formState.url.trim(),
        ogImage,
        favicon,
        primaryColor: formState.primaryColor.trim(),
        navStyle: formState.navStyle.trim(),
        defaultTitle: formState.defaultTitle.trim(),
        defaultDescription: formState.defaultDescription.trim(),
        defaultKeywords: formState.defaultKeywords.trim(),
        trackingScripts: JSON.stringify(formState.trackingScripts.filter((s) => typeof s === "string" && s.trim() !== "")),
      };
      submitting.value = true;
      try {
        await cubeSiteGeneratorService.updateWebsiteSetting(payload);
        logger.info("保存站点设置", payload);
        try {
          const detail = await cubeSiteGeneratorService.getWebsiteSetting();
          if (detail) {
            applyDetail({
              id: detail.id,
              siteName: detail.siteName,
              url: detail.url,
              ogImage: detail.ogImage,
              favicon: detail.favicon,
              primaryColor: detail.primaryColor,
              navStyle: detail.navStyle,
              defaultTitle: detail.defaultTitle,
              defaultDescription: detail.defaultDescription,
              defaultKeywords: detail.defaultKeywords,
              trackingScripts: (() => {
                try {
                  return JSON.parse(detail.trackingScripts || "[]");
                } catch {
                  return [];
                }
              })(),
            });
          }
        } catch {
          /* 保存已成功，忽略再次拉取失败 */
        }
        message.success("保存成功");
      } catch (error) {
        message.error((error as { errorMessage: string })?.errorMessage ?? "保存失败");
      } finally {
        submitting.value = false;
      }
    };

    const slots = {
      "layout-content": (): JSX.Element => (
        <div style={{ padding: "20px" }}>
          <Form model={formState} ref={formRenderRef} rules={rules} labelCol={{ span: 3 }} wrapperCol={{ span: 14 }}>
            <Card title="页面基本配置" bordered={false} style={{ marginBottom: "16px" }}>
              <FormItem label="网站名称" name="siteName">
                <Input v-model:value={formState.siteName} placeholder="请输入网站名称" show-count={false} maxlength={999} />
              </FormItem>
              <FormItem label="网站地址" name="url">
                <Input v-model:value={formState.url} placeholder="请输入网站地址" show-count={false} maxlength={999} />
              </FormItem>
              <FormItem label="分享图" required>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {formState.ogImage && (
                    <img
                      src={formState.ogImage}
                      style={{ width: "104px", height: "104px", objectFit: "cover", borderRadius: "8px", border: "1px solid #f0f0f0" }}
                      alt="分享图"
                    />
                  )}
                  <Button
                    onClick={() => {
                      selectModalTarget.value = "ogImage";
                      selectModalVisible.value = true;
                    }}
                  >
                    {formState.ogImage ? "更换素材" : "选择素材"}
                  </Button>
                  {formState.ogImage && (
                    <Button
                      type="link"
                      danger
                      onClick={() => {
                        formState.ogImage = "";
                        ogImageFiles.value = [];
                      }}
                    >
                      删除
                    </Button>
                  )}
                </div>
              </FormItem>
              <FormItem label="Favicon" required>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {formState.favicon && (
                    <img
                      src={formState.favicon}
                      style={{ width: "104px", height: "104px", objectFit: "cover", borderRadius: "8px", border: "1px solid #f0f0f0" }}
                      alt="Favicon"
                    />
                  )}
                  <Button
                    onClick={() => {
                      selectModalTarget.value = "favicon";
                      selectModalVisible.value = true;
                    }}
                  >
                    {formState.favicon ? "更换素材" : "选择素材"}
                  </Button>
                  {formState.favicon && (
                    <Button
                      type="link"
                      danger
                      onClick={() => {
                        formState.favicon = "";
                        faviconFiles.value = [];
                      }}
                    >
                      删除
                    </Button>
                  )}
                </div>
              </FormItem>
              <FormItem label="主色">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="color"
                    value={formState.primaryColor || "#1578FF"}
                    onInput={(e: Event) => {
                      formState.primaryColor = (e.target as HTMLInputElement).value;
                    }}
                    style={{
                      width: "32px",
                      height: "32px",
                      padding: "0",
                      border: "1px solid #d9d9d9",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  />
                  <Input v-model:value={formState.primaryColor} placeholder="#1578FF" style={{ width: "120px" }} showCount={false} />
                </div>
              </FormItem>
              <FormItem label="导航样式">
                <Select v-model:value={formState.navStyle} placeholder="请选择导航样式" style={{ width: "200px" }}>
                  <SelectOption value="light">浅色</SelectOption>
                  <SelectOption value="dark">深色</SelectOption>
                </Select>
              </FormItem>
            </Card>

            <Card title="全局默认 TDK" bordered={false} style={{ marginBottom: "16px" }}>
              <FormItem label="默认标题">
                <Input v-model:value={formState.defaultTitle} placeholder="请输入默认标题" show-count={false} maxlength={999} />
              </FormItem>
              <FormItem label="默认描述">
                <Textarea
                  v-model:value={formState.defaultDescription}
                  rows={4}
                  placeholder="请输入默认描述"
                  show-count={false}
                  maxlength={999}
                />
              </FormItem>
              <FormItem label="默认关键词">
                <Textarea
                  v-model:value={formState.defaultKeywords}
                  rows={4}
                  placeholder="请输入默认关键词"
                  show-count={false}
                  maxlength={999}
                />
              </FormItem>
            </Card>

            <Card
              title="统计代码配置"
              style={{ marginBottom: "16px" }}
              bordered={false}
              v-slots={{
                extra: (): JSX.Element => (
                  <Button type="primary" onClick={handleAddScript}>
                    添加脚本
                  </Button>
                ),
              }}
            >
              {formState.trackingScripts.length === 0 ? (
                <div style={{ color: "#999", padding: "12px 0" }}>暂无统计脚本，点击右上角添加</div>
              ) : (
                formState.trackingScripts.map((_script, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <Textarea
                      v-model:value={formState.trackingScripts[index]}
                      rows={6}
                      placeholder="请输入统计脚本代码"
                      style={{ flex: 1 }}
                    />
                    <Button
                      type="link"
                      danger
                      onClick={() => {
                        handleRemoveScript(index);
                      }}
                    >
                      删除
                    </Button>
                  </div>
                ))
              )}
            </Card>
          </Form>
          <MaterialSelectModal v-model:visible={selectModalVisible.value} mode="single" title="选择素材" onConfirm={handleMaterialSelect} />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <Button type="primary" loading={submitting.value} onClick={handleSubmit}>
            保存
          </Button>
        </div>
      ),
    };
    return (): JSX.Element => <CubeLayout title={pageTitle} v-slots={slots}></CubeLayout>;
  },
});
