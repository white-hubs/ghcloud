import {
  isDevicePropertyTypeCompatible,
  normalizeDevicePropertyValueType,
  registry,
  resolvePageSceneScope,
  type Binding,
  type ElementInstance,
  type ElementPropertyBinding,
  type PageModel,
  type ProductBinding,
  type SceneScopeKind,
} from "@cube-scada/core";
import { CubeScada, CubeScadaPage, type ScadaPageHandle, type ScadaPopupEvent } from "@cube-scada/studio-sdk";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Collapse,
  CollapsePanel,
  Empty,
  message,
  Modal,
  RadioGroup,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from "ant-design-vue";
import { computed, defineComponent, onMounted, onUnmounted, ref, shallowRef, watch } from "vue";

import type { DeviceProductPropVoList, NorthProdListDetail } from "@ghcloud/cube-iot-center-service";

import { getCubeDeviceCenterService } from "../../service";
import { ScadaPopupBody } from "./scada-popup-body";
import {
  SCENE_SCOPE_FILTER_OPTIONS,
  SCENE_SCOPE_TAG_COLOR,
  firstPageIdForSceneScopeFilter,
  parseSceneScopeFromPageContent,
  sceneScopeLabel,
  type SceneScopeFilter,
} from "./scene-scope-meta";

interface PageListItem {
  id: string;
  name: string;
  project_id: string | null;
  sceneScope: SceneScopeKind;
}

interface ProductOption extends ProductBinding {
  label: string;
  properties: ElementPropertyBinding[];
}

function normalizeBaseUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, "");
}

function getDefaultStudioBase(): string {
  if (typeof window === "undefined") {
    return "";
  }
  const rawBase = import.meta.env.BASE_URL ?? "/";
  try {
    return new URL(rawBase, window.location.origin).toString().replace(/\/$/, "");
  } catch {
    return window.location.origin;
  }
}

function decodeUrlParamValue(raw: string): string {
  let value = raw.trim();
  for (let i = 0; i < 2; i += 1) {
    try {
      const decoded = decodeURIComponent(value);
      if (decoded === value) {
        break;
      }
      value = decoded;
    } catch {
      break;
    }
  }
  return value;
}

function getRuntimeConfigFromUrl(): { apiBase: string; studioAssetBase: string } {
  if (typeof window === "undefined") {
    return { apiBase: "/scada/api", studioAssetBase: getDefaultStudioBase() };
  }
  const query = new URLSearchParams(window.location.search);
  const viewerBaseFromUrl = query.get("studioUrl") ?? query.get("studio_url") ?? query.get("viewerBase") ?? query.get("viewer_base");
  const apiBaseFromUrl = query.get("apiBase") ?? query.get("api_base");
  const apiBase = apiBaseFromUrl ? normalizeBaseUrl(decodeUrlParamValue(apiBaseFromUrl)) || "/scada/api" : "/scada/api";
  const studioAssetBase = viewerBaseFromUrl
    ? normalizeBaseUrl(decodeUrlParamValue(viewerBaseFromUrl)) || getDefaultStudioBase()
    : getDefaultStudioBase();
  return { apiBase, studioAssetBase };
}

/** 兼容网关直接数组、`{ data }`、`{ data: { data } }` 等响应形态 */
function unwrapGetDeviceConditionPayload(raw: unknown): DeviceProductPropVoList[] {
  if (Array.isArray(raw)) {
    return raw;
  }
  if (!raw || typeof raw !== "object") {
    return [];
  }
  const top = raw as Record<string, unknown>;
  if (Array.isArray(top.data)) {
    return top.data as DeviceProductPropVoList[];
  }
  const inner = top.data;
  if (inner && typeof inner === "object") {
    const d = (inner as Record<string, unknown>).data;
    if (Array.isArray(d)) {
      return d as DeviceProductPropVoList[];
    }
  }
  return [];
}

function normalizeDeviceConditionProps(
  productId: string,
  productName: string | undefined,
  rows: DeviceProductPropVoList[],
): ElementPropertyBinding[] {
  const first = rows[0];
  const map = new Map<string, ElementPropertyBinding>();
  for (const prop of first?.productPropVoList ?? []) {
    if (!prop.propCode || map.has(prop.propCode)) {
      continue;
    }
    const detail = prop as typeof prop & { dataType?: string; unitName?: string };
    map.set(prop.propCode, {
      propCode: prop.propCode,
      propName: prop.propName || prop.propCode,
      dataType: detail.dataType,
      unitName: detail.unitName,
      prodId: productId,
      prodName: productName ?? "",
    });
  }
  return [...map.values()];
}

function normalizeProductOptions(records: NorthProdListDetail[]): ProductOption[] {
  return records
    .filter((product) => product.prodId)
    .map((product) => ({
      id: product.prodId,
      name: product.prodName,
      categoryCode: product.prodCategoryCode,
      categoryName: product.prodCategoryName,
      label: product.prodCategoryName ? `${product.prodName} / ${product.prodCategoryName}` : product.prodName,
      properties: (product.productPropVoList ?? []).map((prop) => ({
        propCode: prop.propCode,
        propName: prop.propName || prop.propCode,
        dataType: prop.dataType,
        unitName: prop.unitName,
        prodId: product.prodId,
        prodName: product.prodName,
      })),
    }));
}

async function fetchNorthProductPages(): Promise<NorthProdListDetail[]> {
  const svc = getCubeDeviceCenterService();
  const pageSize = 200;
  const records: NorthProdListDetail[] = [];
  for (let pageNumber = 1; pageNumber <= 100; pageNumber += 1) {
    const page = await svc.getProductListAsNorth({ pageNumber, pageSize });
    records.push(...page.records);
    if (page.records.length < pageSize) {
      break;
    }
  }
  return records;
}

async function fetchNorthProductOptions(): Promise<ProductOption[]> {
  return normalizeProductOptions(await fetchNorthProductPages());
}

async function fetchProductPropsFromDeviceCondition(productId: string, productName?: string): Promise<ElementPropertyBinding[]> {
  const svc = getCubeDeviceCenterService();
  const raw = await svc.getDeviceCondition({
    prodIds: productId,
    withPropertySpec: true,
  });
  const rows = unwrapGetDeviceConditionPayload(raw as unknown);
  return normalizeDeviceConditionProps(productId, productName, rows);
}

function clonePage(page: PageModel): PageModel {
  return {
    ...page,
    product: page.product ? { ...page.product } : undefined,
    elements: page.elements.map((el) => ({
      ...el,
      bindings: el.bindings.map((binding) => ({
        ...binding,
        productProperty: binding.productProperty ? { ...binding.productProperty } : undefined,
      })),
      propertyBindings: el.propertyBindings?.map((binding) => ({ ...binding })),
    })),
  };
}

function hasClickEvent(el: ElementInstance): boolean {
  return (el.eventHandlers ?? []).some((handler) => handler.event === "click");
}

/** 产品与属性绑定：内联产品属性面板图元，或「需设备绑定 + 点击事件」的旧版演示图元 */
function elementNeedsProductFieldBindings(el: ElementInstance): boolean {
  const def = registry.get(el.type);
  if (def?.inlinePropertyPanel) {
    return true;
  }
  return el.deviceBinding === "required" && hasClickEvent(el);
}

/** Studio「属性绑定名称」优先，便于运行端绑定面板区分同名画布标签 */
function elementPropertyBindTitle(el: ElementInstance): string {
  const bind = el.propertyBindName?.trim();
  if (bind) {
    return bind;
  }
  const lb = el.label?.trim();
  if (lb) {
    return lb;
  }
  return el.id;
}

export const ScadaDemoView = defineComponent({
  name: "ScadaDemoView",
  setup() {
    const runtimeConfig = getRuntimeConfigFromUrl();
    const apiBase = ref(runtimeConfig.apiBase);
    const { studioAssetBase } = runtimeConfig;

    const pages = ref<PageListItem[]>([]);
    const pagesLoading = ref(false);
    const pagesError = ref("");
    const selectedPageId = ref("");
    const sceneScopeFilter = ref<SceneScopeFilter>("all");

    const scadaRef = shallowRef(
      CubeScada.create({
        renderMode: "direct",
        apiBase: apiBase.value,
        elementAssetBase: studioAssetBase,
        viewerBase: studioAssetBase,
      }),
    );
    const currentPage = shallowRef<ScadaPageHandle | null>(null);
    const detachPopupListener = shallowRef<(() => void) | null>(null);
    const popupVisible = ref(false);
    const popupEvent = shallowRef<ScadaPopupEvent | null>(null);
    const bindingModalVisible = ref(false);
    const productOptions = ref<ProductOption[]>([]);
    const productProperties = ref<ElementPropertyBinding[]>([]);
    const productsLoading = ref(false);
    const propertyLoading = ref(false);
    const pageConfigSaving = ref(false);
    const configError = ref("");

    const propertyBindableElements = computed(() => {
      const page = currentPage.value?.directPage?.value;
      if (!page) {
        return [];
      }
      const list = page.elements.filter((element) => elementNeedsProductFieldBindings(element) || element.bindings.length > 0);
      return [...list].sort((a, b) => elementPropertyBindTitle(a).localeCompare(elementPropertyBindTitle(b), "zh-Hans-CN"));
    });

    const selectedProduct = computed<ProductBinding | undefined>(() => currentPage.value?.directPage?.value?.product);

    const selectedSceneScope = computed<SceneScopeKind>(() => resolvePageSceneScope(currentPage.value?.directPage?.value ?? {}));

    const filteredPages = computed(() => {
      if (sceneScopeFilter.value === "all") {
        return pages.value;
      }
      return pages.value.filter((page) => page.sceneScope === sceneScopeFilter.value);
    });

    const runtimeError = computed(() => currentPage.value?.error.value?.message ?? "");

    async function loadPropertiesBySelectedProduct(): Promise<void> {
      const product = selectedProduct.value;
      if (!product?.id) {
        productProperties.value = [];
        return;
      }
      propertyLoading.value = true;
      configError.value = "";
      try {
        const option = productOptions.value.find((item) => item.id === product.id);
        productProperties.value = option?.properties.length
          ? option.properties.map((property) => ({ ...property }))
          : await fetchProductPropsFromDeviceCondition(product.id, product.name);
        seedBoundDevicePropertyValues();
      } catch (err) {
        configError.value = err instanceof Error ? err.message : String(err);
        productProperties.value = [];
      } finally {
        propertyLoading.value = false;
      }
    }

    async function waitForPageLoaded(page: ScadaPageHandle): Promise<void> {
      if (!page.loading.value) {
        return;
      }
      await new Promise<void>((resolve) => {
        const stop = watch(
          () => page.loading.value,
          (loading) => {
            if (!loading) {
              stop();
              resolve();
            }
          },
        );
      });
    }

    async function loadPage(pageId: string): Promise<void> {
      currentPage.value?.dispose();
      selectedPageId.value = pageId;
      productProperties.value = [];
      const page = scadaRef.value.load({ page: pageId });
      currentPage.value = page;
      await waitForPageLoaded(page);
      const scope = resolvePageSceneScope(page.directPage?.value ?? {});
      syncListSceneScope(pageId, scope);
      await loadPropertiesBySelectedProduct();
    }

    function clearSelectedPage(): void {
      selectedPageId.value = "";
      currentPage.value?.dispose();
      currentPage.value = null;
      productProperties.value = [];
      bindingModalVisible.value = false;
    }

    function handleSceneScopeFilterChange(value: SceneScopeFilter): void {
      sceneScopeFilter.value = value;
      const firstPageId = firstPageIdForSceneScopeFilter(pages.value, value);
      if (!firstPageId) {
        clearSelectedPage();
        return;
      }
      void loadPage(firstPageId);
    }

    async function fetchPages(): Promise<void> {
      pagesLoading.value = true;
      pagesError.value = "";
      try {
        const resp = await fetch(`${apiBase.value}/pages/`);
        if (!resp.ok) {
          throw new Error(`请求失败，状态码 ${resp.status}`);
        }
        const list = (await resp.json()) as Array<{ id: string; name: string; project_id: string | null }>;
        const hydrated = await Promise.all(
          list.map(async (item) => {
            try {
              const detailResp = await fetch(`${apiBase.value}/pages/${encodeURIComponent(item.id)}`);
              if (!detailResp.ok) {
                return { ...item, sceneScope: "singleDevice" as const };
              }
              const detail = (await detailResp.json()) as { content?: string };
              return {
                ...item,
                sceneScope: parseSceneScopeFromPageContent(detail.content),
              };
            } catch {
              return { ...item, sceneScope: "singleDevice" as const };
            }
          }),
        );
        pages.value = hydrated;
        if (hydrated.length > 0 && !selectedPageId.value) {
          await loadPage(hydrated[0].id);
        } else if (selectedPageId.value && !hydrated.some((page) => page.id === selectedPageId.value)) {
          clearSelectedPage();
        }
      } catch (err) {
        pagesError.value = err instanceof Error ? err.message : String(err);
      } finally {
        pagesLoading.value = false;
      }
    }

    function syncListSceneScope(pageId: string, sceneScope: SceneScopeKind): void {
      pages.value = pages.value.map((page) => (page.id === pageId ? { ...page, sceneScope } : page));
    }

    async function loadProducts(): Promise<void> {
      productsLoading.value = true;
      configError.value = "";
      try {
        productOptions.value = await fetchNorthProductOptions();
        if (selectedProduct.value?.id) {
          await loadPropertiesBySelectedProduct();
        }
      } catch (err) {
        configError.value = err instanceof Error ? err.message : String(err);
      } finally {
        productsLoading.value = false;
      }
    }

    function updateCurrentPage(mutator: (page: PageModel) => void): void {
      const handle = currentPage.value;
      const page = handle?.directPage?.value;
      if (!handle?.directPage || !page) {
        return;
      }
      const next = clonePage(page);
      mutator(next);
      handle.directPage.value = next;
    }

    function targetPropertySchema(element: ElementInstance, targetPropName: string) {
      return registry.get(element.type)?.propsSchema.find((schema) => schema.name === targetPropName);
    }

    function previewValueForProductProperty(property: ElementPropertyBinding, index = 0): string | number | boolean {
      switch (normalizeDevicePropertyValueType(property.dataType)) {
        case "number":
          return Number((20 + index * 7.5).toFixed(2));
        case "boolean":
          return true;
        default:
          return `模拟-${property.propName || property.propCode}`;
      }
    }

    function seedBoundDevicePropertyValues(): void {
      const handle = currentPage.value;
      const page = handle?.directPage?.value;
      if (!handle || !page) return;
      page.elements.forEach((element) => {
        element.bindings.forEach((binding, index) => {
          if (!binding.tagName || !binding.productProperty) return;
          handle.setTagValue(binding.tagName, previewValueForProductProperty(binding.productProperty, index));
        });
      });
    }

    function clearSelectedProductProperty(binding: Binding): Binding {
      const { productProperty: _productProperty, ...logicalBinding } = binding;
      return logicalBinding;
    }

    function selectProduct(productId: string): void {
      const option = productOptions.value.find((item) => item.id === productId);
      updateCurrentPage((page) => {
        if (!option) {
          page.product = undefined;
          for (const el of page.elements) {
            el.propertyBindings = [];
            el.bindings = el.bindings.map(clearSelectedProductProperty);
          }
          return;
        }
        page.product = {
          id: option.id,
          name: option.name,
          categoryCode: option.categoryCode,
          categoryName: option.categoryName,
        };
        for (const el of page.elements) {
          el.propertyBindings = [];
          el.bindings = el.bindings.map(clearSelectedProductProperty);
        }
      });
      loadPropertiesBySelectedProduct();
    }

    function toggleElementProperty(elementId: string, prop: ElementPropertyBinding, checked: boolean): void {
      updateCurrentPage((page) => {
        const el = page.elements.find((item) => item.id === elementId);
        if (!el) {
          return;
        }
        const current = el.propertyBindings ?? [];
        el.propertyBindings = checked
          ? [...current.filter((item) => item.propCode !== prop.propCode), prop]
          : current.filter((item) => item.propCode !== prop.propCode);
      });
    }

    function bindTagProductProperty(elementId: string, bindingId: string, propCode?: string): void {
      const sourceProperty = productProperties.value.find((property) => property.propCode === propCode);
      let acceptedBinding: Binding | undefined;
      updateCurrentPage((page) => {
        const element = page.elements.find((item) => item.id === elementId);
        if (!element) return;
        const binding = element.bindings.find((item) => item.id === bindingId);
        if (!binding) return;
        const targetSchema = targetPropertySchema(element, binding.propName);
        if (sourceProperty && targetSchema && !isDevicePropertyTypeCompatible(targetSchema.type, sourceProperty.dataType)) {
          void message.error(`属性类型不兼容：${targetSchema.label} 需要 ${targetSchema.type} 类型`);
          return;
        }
        element.bindings = element.bindings.map((item) => {
          if (item.id !== bindingId) return item;
          if (!sourceProperty) return clearSelectedProductProperty(item);
          acceptedBinding = {
            ...item,
            productProperty: { ...sourceProperty },
          };
          return acceptedBinding;
        });
      });
      if (acceptedBinding?.tagName && acceptedBinding.productProperty) {
        currentPage.value?.setTagValue(acceptedBinding.tagName, previewValueForProductProperty(acceptedBinding.productProperty));
      }
    }

    function validateDevicePropertyBindings(page: PageModel): string[] {
      const errors: string[] = [];
      for (const element of page.elements) {
        for (const binding of element.bindings) {
          if (!binding.productProperty) continue;
          const targetSchema = targetPropertySchema(element, binding.propName);
          if (!targetSchema) {
            errors.push(`${elementPropertyBindTitle(element)}：目标属性 ${binding.propName} 不存在`);
            continue;
          }
          if (!binding.tagName.trim()) {
            errors.push(`${elementPropertyBindTitle(element)}：${targetSchema.label} 尚未配置逻辑 Tag`);
            continue;
          }
          if (!isDevicePropertyTypeCompatible(targetSchema.type, binding.productProperty.dataType)) {
            errors.push(
              `${elementPropertyBindTitle(element)}：${targetSchema.label} (${targetSchema.type}) 与 ${binding.productProperty.propName || binding.productProperty.propCode} (${binding.productProperty.dataType || "未知"}) 类型不兼容`,
            );
          }
        }
      }
      return errors;
    }

    async function saveCurrentPageConfig(): Promise<void> {
      const page = currentPage.value?.directPage?.value;
      if (!page || !selectedPageId.value) {
        return;
      }
      const scope = resolvePageSceneScope(page);
      const bindingErrors = validateDevicePropertyBindings(page);
      if (bindingErrors.length > 0) {
        configError.value = `设备属性绑定校验失败：${bindingErrors.join("；")}`;
        void message.error("存在类型不兼容的设备属性绑定，请修改后再保存");
        return;
      }
      pageConfigSaving.value = true;
      configError.value = "";
      try {
        const payloadPage = {
          ...page,
          sceneScope: scope,
        };
        const resp = await fetch(`${apiBase.value}/pages/${encodeURIComponent(selectedPageId.value)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: payloadPage.name,
            content: JSON.stringify(payloadPage, null, 2),
          }),
        });
        if (!resp.ok) {
          throw new Error(`保存页面配置失败: HTTP ${resp.status}`);
        }
        syncListSceneScope(selectedPageId.value, scope);
        await fetchPages();
        if (selectedPageId.value) {
          syncListSceneScope(selectedPageId.value, scope);
        }
        bindingModalVisible.value = false;
        void message.success("画面配置已保存");
      } catch (err) {
        configError.value = err instanceof Error ? err.message : String(err);
      } finally {
        pageConfigSaving.value = false;
      }
    }

    function setElementPropertiesAllOrNone(elementId: string, selectAll: boolean): void {
      const props = productProperties.value;
      updateCurrentPage((page) => {
        const el = page.elements.find((item) => item.id === elementId);
        if (!el) {
          return;
        }
        if (selectAll) {
          el.propertyBindings = props.map((p) => ({ ...p }));
        } else {
          el.propertyBindings = [];
        }
      });
    }

    onMounted(() => {
      detachPopupListener.value = scadaRef.value.on("showPopup", (event: ScadaPopupEvent) => {
        popupEvent.value = event;
        popupVisible.value = true;
      });
      loadProducts();
      fetchPages();
    });

    onUnmounted(() => {
      detachPopupListener.value?.();
      currentPage.value?.dispose();
      currentPage.value = null;
    });

    watch(bindingModalVisible, (open) => {
      if (open) {
        loadPropertiesBySelectedProduct();
      }
    });

    watch(
      () => currentPage.value?.directPage?.value?.product?.id,
      (productId, previousProductId) => {
        if (productId && productId !== previousProductId) {
          void loadPropertiesBySelectedProduct();
        }
      },
    );

    return () => (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          height: "100%",
          minHeight: 0,
          gap: "12px",
          padding: "12px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <aside style={{ overflow: "hidden", minHeight: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ width: "100%", height: "100%", minHeight: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            <Card
              size="small"
              bordered
              title="画面列表"
              style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}
              bodyStyle={{
                padding: 12,
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <RadioGroup
                size="middle"
                value={sceneScopeFilter.value}
                optionType="button"
                buttonStyle="solid"
                options={SCENE_SCOPE_FILTER_OPTIONS}
                style={{ margin: "8px 0 12px", width: "100%", flexShrink: 0 }}
                onUpdate:value={(value: SceneScopeFilter) => {
                  handleSceneScopeFilterChange(value);
                }}
              />
              <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", paddingRight: 4, paddingBottom: 4 }}>
                {pagesLoading.value ? (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    加载中…
                  </Typography.Text>
                ) : null}
                {pagesError.value ? <Alert type="error" showIcon message={pagesError.value} style={{ marginBottom: 8 }} /> : null}
                <Space direction="vertical" style={{ width: "100%" }} size={6}>
                  {filteredPages.value.length === 0 && !pagesLoading.value ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="当前形态下暂无画面" />
                  ) : null}
                  {filteredPages.value.map((page) => (
                    <Card
                      key={page.id}
                      size="small"
                      hoverable
                      styles={{
                        body: { padding: "8px 12px" },
                      }}
                      style={{
                        cursor: "pointer",
                        borderColor: selectedPageId.value === page.id ? "#00ba8b" : undefined,
                        background: selectedPageId.value === page.id ? "rgba(0, 186, 139, 0.06)" : undefined,
                      }}
                      onClick={() => {
                        loadPage(page.id);
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <Typography.Text strong style={{ fontSize: 13 }}>
                          {page.name}
                        </Typography.Text>
                        <Tag color={SCENE_SCOPE_TAG_COLOR[page.sceneScope]} style={{ marginInlineEnd: 0 }}>
                          {sceneScopeLabel(page.sceneScope)}
                        </Tag>
                      </div>
                      <div>
                        <Typography.Text type="secondary" style={{ fontSize: 12, fontFamily: "monospace" }}>
                          {page.id}
                        </Typography.Text>
                      </div>
                    </Card>
                  ))}
                </Space>
              </div>
            </Card>

            {currentPage.value?.directPage?.value && selectedSceneScope.value === "singleDevice" ? (
              <Button
                block
                type="default"
                onClick={() => {
                  bindingModalVisible.value = true;
                }}
              >
                产品与属性绑定
              </Button>
            ) : null}
            {currentPage.value?.directPage?.value && selectedSceneScope.value === "multiDevice" ? (
              <Alert
                type="info"
                showIcon
                message="多设备画面不在组态 Demo 中绑定设备"
                description="真实设备将在实际业务中绑定，该能力不属于本次改造范围。"
              />
            ) : null}
          </div>
        </aside>

        <section style={{ minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {currentPage.value?.directPage?.value ? (
            <Card size="small" bordered styles={{ body: { padding: "10px 12px" } }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >
                <Typography.Text strong style={{ fontSize: 14, maxWidth: 220 }} ellipsis>
                  {currentPage.value.directPage.value.name}
                </Typography.Text>
                <Tag color={SCENE_SCOPE_TAG_COLOR[selectedSceneScope.value]} style={{ marginInlineEnd: 0 }}>
                  {sceneScopeLabel(selectedSceneScope.value)}
                </Tag>
              </div>
            </Card>
          ) : null}

          <Card
            size="small"
            bordered
            styles={{
              body: {
                padding: 0,
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              },
            }}
            style={{ overflow: "hidden", minHeight: 0, flex: 1, display: "flex", flexDirection: "column" }}
          >
            {runtimeError.value ? <Alert type="error" showIcon message={`渲染失败：${runtimeError.value}`} style={{ margin: 8 }} /> : null}
            {currentPage.value ? (
              <CubeScadaPage key={selectedPageId.value} instance={currentPage.value} />
            ) : (
              <div style={{ minHeight: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Empty description="请选择左侧画面" />
              </div>
            )}
          </Card>
        </section>

        {currentPage.value?.directPage?.value ? (
          <Modal
            open={bindingModalVisible.value}
            title="产品与属性绑定"
            width={920}
            centered
            styles={{
              content: {
                maxHeight: "calc(100vh - 32px)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              },
              body: {
                height: "min(580px, calc(100vh - 132px))",
                maxHeight: "calc(100vh - 132px)",
                padding: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              },
            }}
            destroyOnClose={false}
            onCancel={() => {
              bindingModalVisible.value = false;
            }}
            footer={
              <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                <Button
                  loading={propertyLoading.value}
                  onClick={() => {
                    loadPropertiesBySelectedProduct();
                  }}
                >
                  刷新属性
                </Button>
                <Button
                  type="primary"
                  loading={pageConfigSaving.value}
                  onClick={() => {
                    saveCurrentPageConfig();
                  }}
                >
                  保存配置
                </Button>
              </Space>
            }
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              <Spin
                spinning={propertyLoading.value}
                style={{
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    flex: 1,
                    minHeight: 0,
                    overflow: "hidden",
                    padding: "12px 16px",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "nowrap",
                      alignItems: "center",
                      gap: 20,
                      marginBottom: "12px",
                      flexShrink: 0,
                    }}
                  >
                    <Select
                      style={{ width: 220, flexShrink: 0 }}
                      placeholder={productsLoading.value ? "产品加载中…" : "请选择或搜索产品"}
                      loading={productsLoading.value}
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      filterOption={(input: string, option: { label?: string; value?: string }) => {
                        const q = input.trim().toLowerCase();
                        if (!q) {
                          return true;
                        }
                        const label = String(option?.label ?? "").toLowerCase();
                        const value = String(option?.value ?? "").toLowerCase();
                        return label.includes(q) || value.includes(q);
                      }}
                      value={selectedProduct.value?.id || undefined}
                      options={productOptions.value.map((item) => ({ label: item.label, value: item.id }))}
                      onChange={(value: string | undefined) => {
                        selectProduct(value ?? "");
                      }}
                    />
                    <Space size={8} wrap style={{ flexShrink: 0, marginLeft: "4px" }}>
                      <Tag color="default">属性 {productProperties.value.length}</Tag>
                      <Tag color="processing">可绑定图元 {propertyBindableElements.value.length}</Tag>
                    </Space>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      minHeight: 0,
                      overflowY: "auto",
                      overflowX: "hidden",
                      WebkitOverflowScrolling: "touch",
                      maxHeight: "500px",
                    }}
                  >
                    {configError.value ? <Alert type="error" showIcon message={configError.value} style={{ marginBottom: 12 }} /> : null}
                    {(() => {
                      if (!selectedProduct.value?.id) {
                        return <Alert type="info" showIcon message="请先选择产品，再为图元勾选要绑定的设备属性。" />;
                      }
                      if (propertyBindableElements.value.length === 0) {
                        return (
                          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                            当前画面没有配置逻辑 Tag 绑定，也没有需要展示产品字段的图元。
                          </Typography.Text>
                        );
                      }
                      if (productProperties.value.length === 0) {
                        return (
                          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                            当前产品暂无属性定义，请确认设备中心数据或更换产品。
                          </Typography.Text>
                        );
                      }
                      return (
                        <div
                          style={{
                            border: "1px solid #f0f0f0",
                            borderRadius: 8,
                            padding: "4px 8px 8px",
                            background: "#fafafa",
                          }}
                        >
                          <Collapse accordion bordered={false} style={{ background: "transparent" }}>
                            {propertyBindableElements.value.map((el) => {
                              const bindings = el.propertyBindings ?? [];
                              const tagBindings = el.bindings;
                              const tagBoundCount = tagBindings.filter((binding) => binding.productProperty).length;
                              const boundCount = bindings.length + tagBoundCount;
                              const propsList = productProperties.value;
                              const showProductFieldChecklist = elementNeedsProductFieldBindings(el);
                              const allSelected =
                                propsList.length > 0 && propsList.every((p) => bindings.some((b) => b.propCode === p.propCode));
                              const someSelected = propsList.some((p) => bindings.some((b) => b.propCode === p.propCode)) && !allSelected;
                              return (
                                <CollapsePanel
                                  key={el.id}
                                  header={
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 10,
                                        width: "100%",
                                        flexWrap: "wrap",
                                      }}
                                    >
                                      <Typography.Text strong style={{ fontSize: 13 }}>
                                        {elementPropertyBindTitle(el)}
                                      </Typography.Text>
                                      <Space size={6} wrap>
                                        <Tag>{el.type}</Tag>
                                        {tagBindings.length > 0 ? (
                                          <Tag color="blue">
                                            Tag 映射 {tagBoundCount}/{tagBindings.length}
                                          </Tag>
                                        ) : null}
                                        {boundCount > 0 ? <Tag color="success">已选 {boundCount}</Tag> : <Tag color="default">未绑定</Tag>}
                                      </Space>
                                    </div>
                                  }
                                >
                                  {tagBindings.length > 0 ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
                                      <Typography.Text strong style={{ fontSize: 13 }}>
                                        产品属性 → 逻辑 Tag → 图元属性
                                      </Typography.Text>
                                      {tagBindings.map((binding) => {
                                        const targetSchema = targetPropertySchema(el, binding.propName);
                                        const currentCompatible =
                                          !binding.productProperty ||
                                          (targetSchema
                                            ? isDevicePropertyTypeCompatible(targetSchema.type, binding.productProperty.dataType)
                                            : false);
                                        return (
                                          <div
                                            key={binding.id}
                                            style={{
                                              display: "grid",
                                              gridTemplateColumns: "minmax(140px, 0.8fr) minmax(240px, 1.6fr)",
                                              alignItems: "center",
                                              gap: 12,
                                              padding: "10px 12px",
                                              borderRadius: 6,
                                              border: `1px solid ${currentCompatible ? "#f0f0f0" : "#ffccc7"}`,
                                              background: "#fff",
                                            }}
                                          >
                                            <div>
                                              <Typography.Text strong style={{ display: "block", fontSize: 12 }}>
                                                {targetSchema?.label ?? binding.propName}
                                              </Typography.Text>
                                              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                                                逻辑 Tag：{binding.tagName || "未配置"} · 图元类型：{targetSchema?.type ?? "未知"}
                                              </Typography.Text>
                                            </div>
                                            <div>
                                              <Select
                                                value={binding.productProperty?.propCode}
                                                allowClear
                                                showSearch
                                                optionFilterProp="label"
                                                status={currentCompatible ? undefined : "error"}
                                                disabled={!binding.tagName}
                                                placeholder={binding.tagName ? "选择产品属性" : "请先在 Studio 配置逻辑 Tag"}
                                                style={{ width: "100%" }}
                                                options={propsList.map((property) => ({
                                                  value: property.propCode,
                                                  label: `${property.propName || property.propCode} (${property.dataType || "未知类型"})`,
                                                  disabled: targetSchema
                                                    ? !isDevicePropertyTypeCompatible(targetSchema.type, property.dataType)
                                                    : true,
                                                }))}
                                                onChange={(propCode: string | undefined) => {
                                                  bindTagProductProperty(el.id, binding.id, propCode);
                                                }}
                                              />
                                              {!currentCompatible ? (
                                                <Typography.Text type="danger" style={{ display: "block", marginTop: 4, fontSize: 11 }}>
                                                  已绑定产品属性类型 {binding.productProperty?.dataType || "未知"} 与图元属性类型{" "}
                                                  {targetSchema?.type || "未知"}
                                                  不兼容，请重新选择。
                                                </Typography.Text>
                                              ) : null}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : null}
                                  {showProductFieldChecklist ? (
                                    <div
                                      style={{
                                        borderTop: tagBindings.length > 0 ? "1px solid #f0f0f0" : undefined,
                                        paddingTop: 10,
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          marginBottom: 8,
                                        }}
                                      >
                                        <Typography.Text strong style={{ fontSize: 13 }}>
                                          弹窗或属性面板展示字段
                                        </Typography.Text>
                                        <Checkbox
                                          indeterminate={someSelected}
                                          checked={allSelected}
                                          disabled={propsList.length === 0}
                                          onChange={(e: { target: { checked: boolean } }) => {
                                            setElementPropertiesAllOrNone(el.id, e.target.checked);
                                          }}
                                        >
                                          全选
                                        </Checkbox>
                                      </div>
                                      <div
                                        style={{
                                          display: "grid",
                                          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                                          columnGap: 12,
                                          rowGap: 6,
                                          paddingTop: 4,
                                        }}
                                      >
                                        {propsList.map((prop) => {
                                          const checked = bindings.some((item) => item.propCode === prop.propCode);
                                          return (
                                            <div
                                              key={`${el.id}-${prop.propCode}`}
                                              style={{
                                                padding: "6px 8px",
                                                borderRadius: 6,
                                                background: "#fff",
                                                border: "1px solid #f0f0f0",
                                              }}
                                            >
                                              <Checkbox
                                                checked={checked}
                                                onChange={(e: { target: { checked: boolean } }) => {
                                                  toggleElementProperty(el.id, prop, e.target.checked);
                                                }}
                                              >
                                                <span style={{ fontSize: 12, lineHeight: 1.45 }}>
                                                  <Typography.Text strong style={{ fontSize: 12 }}>
                                                    {prop.propName}
                                                  </Typography.Text>
                                                  <Typography.Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                                                    {prop.propCode} · {prop.dataType || "未知类型"}
                                                    {prop.unitName ? ` · ${prop.unitName}` : ""}
                                                  </Typography.Text>
                                                </span>
                                              </Checkbox>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ) : null}
                                </CollapsePanel>
                              );
                            })}
                          </Collapse>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </Spin>
            </div>
          </Modal>
        ) : null}

        {popupEvent.value ? (
          <Modal
            open={popupVisible.value}
            width={480}
            centered
            styles={{
              content: {
                maxHeight: "calc(100vh - 32px)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              },
              body: {
                height: "min(400px, calc(100vh - 200px))",
                maxHeight: "calc(100vh - 200px)",
                padding: "12px 16px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
              },
            }}
            title={
              <span>
                {popupEvent.value.title || "提示"}
                {popupEvent.value.contentId ? (
                  <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                    contentId: {popupEvent.value.contentId}
                  </Typography.Text>
                ) : null}
              </span>
            }
            footer={
              <Button
                type="primary"
                onClick={() => {
                  popupVisible.value = false;
                  popupEvent.value = null;
                }}
              >
                关闭
              </Button>
            }
            onCancel={() => {
              popupVisible.value = false;
              popupEvent.value = null;
            }}
            destroyOnClose
          >
            <div
              style={{
                height: "100%",
                minHeight: 0,
                overflowY: "auto",
                overflowX: "hidden",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <ScadaPopupBody event={popupEvent.value} />
            </div>
          </Modal>
        ) : null}
      </div>
    );
  },
});
