import { computed, defineComponent, inject, onMounted, reactive, ref, Teleport, watch } from "vue";

import type { BusinessAreaNode } from "@ghcloud/cube-service-interface/mdata";
import { listBusinessAreas } from "@ghcloud/cube-services-client/mdata.client";
import {
  Button,
  Cascader,
  Empty,
  Form,
  FormItem,
  Input,
  Modal,
  PopConfirm,
  Space,
  Spin,
  Table,
  TreeSelect,
  message,
} from "@ghcloud/cube-ui";

import { CONFIG_SHELL_TITLE_EXTRA_ID, CONFIG_SHELL_TITLE_META_ID } from "../../config-shell";
import { MODEL_CONFIGURATION_KEY, type ModelConfigurationApi } from "../composables/use-model-configuration";
import type { ModelConfig, ModelEntry } from "../types";
import { useAuthRequest } from "@/hooks/auth-request";

import styles from "./introducing-models.module.less";

type Ue5Server = ModelConfig["ue5"]["modelServer"][number];
type ThreeServer = ModelConfig["three"]["modelServer"][number];
type ScadaUrl = ModelConfig["scada"]["url"][number];
type ModelArea = ThreeServer["areaList"][number];

const createId = (): string => `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const findAreaNode = (nodes: BusinessAreaNode[], value: string): BusinessAreaNode | undefined => {
  for (const node of nodes) {
    if (node.id === value || node.name === value || node.aliasName === value) {
      return node;
    }
    const child = findAreaNode(node.children ?? [], value);
    if (child) {
      return child;
    }
  }
  return undefined;
};

/**
 * 引入模型：按渲染类型分支维护模型列表。
 */
export const IntroducingModels = defineComponent({
  name: "IntroducingModels",
  setup() {
    const modelApi = inject(MODEL_CONFIGURATION_KEY) as ModelConfigurationApi | undefined;
    const titleMountReady = ref(false);
    const areaOptions = ref<BusinessAreaNode[]>([]);
    const keywordInput = ref("");
    const keyword = ref("");
    const modal = reactive({
      open: false,
      mode: "create" as "create" | "edit",
      index: -1,
      submitting: false,
    });
    const formState = reactive({
      name: "",
      url: "",
      menu: "",
      area: [] as string[],
      areaList: [] as ModelArea[],
      legacyArea: "",
      id: "",
    });

    const entry = computed<ModelEntry>(() => modelApi?.modelConfig.value.entry ?? "views");

    const sourceList = computed(() => {
      if (!modelApi) {
        return [] as (Ue5Server | ThreeServer | ScadaUrl)[];
      }
      const cfg = modelApi.modelConfig.value;
      if (entry.value === "views") {
        return cfg.ue5.modelServer;
      }
      if (entry.value === "views-3d" || entry.value === "views-three") {
        return cfg.three.modelServer;
      }
      if (entry.value === "views-2d") {
        return cfg.scada.url;
      }
      return [];
    });

    const displayList = computed(() => {
      const q = keyword.value.trim().toLowerCase();
      if (!q) {
        return sourceList.value;
      }
      return sourceList.value.filter((item) => (item.name ?? "").toLowerCase().includes(q));
    });

    const unsupported = computed(() => entry.value === "views-gis");
    const canCreateModel = computed(() => entry.value !== "views" || sourceList.value.length === 0);
    const createModelTip = computed(() => (canCreateModel.value ? "" : "UE5 类型仅支持添加一个模型"));

    const loadAreas = async (): Promise<void> => {
      try {
        areaOptions.value = await useAuthRequest(() => listBusinessAreas());
      } catch {
        areaOptions.value = [];
      }
    };

    const handleQuery = (): void => {
      keyword.value = keywordInput.value.trim();
    };

    const handleReset = (): void => {
      keywordInput.value = "";
      keyword.value = "";
    };

    const resetForm = (): void => {
      formState.name = "";
      formState.url = "";
      formState.menu = "";
      formState.area = [];
      formState.areaList = [];
      formState.legacyArea = "";
      formState.id = createId();
    };

    const openCreate = (): void => {
      if (!canCreateModel.value) {
        message.warning(createModelTip.value);
        return;
      }
      resetForm();
      modal.mode = "create";
      modal.index = -1;
      modal.open = true;
    };

    const openEdit = (record: Ue5Server | ThreeServer | ScadaUrl, index: number): void => {
      formState.name = record.name ?? "";
      formState.url = record.url ?? "";
      formState.id = "id" in record && record.id ? String(record.id) : createId();
      formState.menu = "menu" in record ? String(record.menu ?? "") : "";
      if ("area" in record && Array.isArray(record.area)) {
        formState.area = [...record.area];
      } else if ("area" in record && typeof record.area === "string") {
        formState.area = record.area ? record.area.split("-").filter(Boolean) : [];
      } else {
        formState.area = [];
      }
      formState.areaList = "areaList" in record && Array.isArray(record.areaList) ? record.areaList.map((item) => ({ ...item })) : [];
      formState.legacyArea = "area" in record && typeof record.area === "string" ? record.area : "";
      modal.mode = "edit";
      // 在完整列表中定位真实下标
      modal.index = sourceList.value.indexOf(record);
      if (modal.index < 0) {
        modal.index = index;
      }
      modal.open = true;
    };

    const persistList = async (nextUe5?: Ue5Server[], nextThree?: ThreeServer[], nextScada?: ScadaUrl[]): Promise<boolean> => {
      if (!modelApi) {
        return false;
      }
      if (nextUe5) {
        modelApi.modelConfig.value.ue5.modelServer = nextUe5;
      }
      if (nextThree) {
        modelApi.modelConfig.value.three.modelServer = nextThree;
      }
      if (nextScada) {
        modelApi.modelConfig.value.scada.url = nextScada;
      }
      modelApi.markDirty();
      return modelApi.save();
    };

    const handleSubmit = async (): Promise<void> => {
      if (!modelApi) {
        return;
      }
      if (modal.mode === "create" && !canCreateModel.value) {
        message.warning(createModelTip.value);
        return;
      }
      const name = formState.name.trim();
      const url = formState.url.trim();
      if (!name) {
        message.warning("请输入模型名称");
        return;
      }
      if (!url) {
        message.warning("请输入模型地址");
        return;
      }
      modal.submitting = true;
      try {
        if (entry.value === "views") {
          const list = [...modelApi.modelConfig.value.ue5.modelServer];
          const row: Ue5Server = {
            name,
            url,
            area: [...formState.area],
          };
          if (modal.mode === "edit" && modal.index >= 0) {
            list[modal.index] = row;
          } else {
            list.push(row);
          }
          const ok = await persistList(list);
          if (ok) {
            modal.open = false;
          }
          return;
        }

        if (entry.value === "views-3d" || entry.value === "views-three") {
          const list = [...modelApi.modelConfig.value.three.modelServer];
          const row: ThreeServer = {
            name,
            url,
            area: [...formState.area],
            areaList: formState.areaList.map((item) => ({ ...item })),
          };
          if (modal.mode === "edit" && modal.index >= 0) {
            list[modal.index] = row;
          } else {
            list.push(row);
          }
          const ok = await persistList(undefined, list);
          if (ok) {
            modal.open = false;
          }
          return;
        }

        if (entry.value === "views-2d") {
          const list = [...modelApi.modelConfig.value.scada.url];
          const row: ScadaUrl = {
            id: formState.id || createId(),
            name,
            url,
            menu: formState.menu.trim(),
            area: formState.area.length > 0 ? formState.area.join("-") : formState.legacyArea,
          };
          if (modal.mode === "edit" && modal.index >= 0) {
            list[modal.index] = row;
          } else {
            list.push(row);
          }
          const ok = await persistList(undefined, undefined, list);
          if (ok) {
            modal.open = false;
          }
        }
      } finally {
        modal.submitting = false;
      }
    };

    const handleDelete = async (indexInSource: number): Promise<void> => {
      if (!modelApi || indexInSource < 0) {
        return;
      }
      if (entry.value === "views") {
        const list = [...modelApi.modelConfig.value.ue5.modelServer];
        list.splice(indexInSource, 1);
        await persistList(list);
        return;
      }
      if (entry.value === "views-3d" || entry.value === "views-three") {
        const list = [...modelApi.modelConfig.value.three.modelServer];
        list.splice(indexInSource, 1);
        await persistList(undefined, list);
        return;
      }
      if (entry.value === "views-2d") {
        const list = [...modelApi.modelConfig.value.scada.url];
        list.splice(indexInSource, 1);
        await persistList(undefined, undefined, list);
      }
    };

    const columns = computed(() => {
      const base = [
        { title: "模型名称", dataIndex: "name", key: "name", width: 240, ellipsis: true },
        { title: "模型地址", dataIndex: "url", key: "url", ellipsis: true },
      ];
      if (entry.value === "views-3d" || entry.value === "views-three") {
        base.push({
          title: "关联区域",
          dataIndex: "areaList",
          key: "areaList",
          ellipsis: true,
          customRender: ({ record }: { record: ThreeServer }) => (
            <span>{record.areaList?.map((item) => item.name).join("，") || "--"}</span>
          ),
        } as never);
      }
      if (entry.value === "views-2d") {
        base.push(
          { title: "关联菜单", dataIndex: "menu", key: "menu", ellipsis: true } as never,
          { title: "关联区域", dataIndex: "area", key: "area", ellipsis: true } as never,
        );
      }
      base.push({
        title: "操作",
        dataIndex: "action",
        key: "action",
        width: 140,
        customRender: ({ record }: { record: Ue5Server | ThreeServer | ScadaUrl }) => {
          const sourceIndex = sourceList.value.indexOf(record);
          return (
            <Space size={0}>
              <Button type="link" size="small" onClick={() => openEdit(record, sourceIndex)}>
                编辑
              </Button>
              <PopConfirm title="确定删除该模型吗？" okText="删除" cancelText="取消" onConfirm={() => void handleDelete(sourceIndex)}>
                <Button type="link" size="small" danger>
                  删除
                </Button>
              </PopConfirm>
            </Space>
          );
        },
      } as never);
      return base;
    });

    const handleThreeAreaChange = (values: string[]): void => {
      formState.area = values ?? [];
      formState.areaList = formState.area.flatMap((value) => {
        const item = findAreaNode(areaOptions.value, value);
        return item ? [{ id: item.id, name: item.name, aliasName: item.aliasName || item.name }] : [];
      });
    };

    const renderAreaSelector = () => {
      if (entry.value === "views") {
        return (
          <TreeSelect
            value={formState.area}
            treeData={areaOptions.value}
            multiple
            treeCheckStrictly={false}
            maxTagCount={6}
            allowClear
            showSearch
            placeholder="请选择区域"
            style={{ width: "100%" }}
            fieldNames={{ label: "name", value: "name", children: "children" }}
            onUpdate:value={(val: string[]) => {
              formState.area = val ?? [];
            }}
          />
        );
      }
      if (entry.value === "views-3d" || entry.value === "views-three") {
        return (
          <TreeSelect
            value={formState.area}
            treeData={areaOptions.value}
            multiple
            treeCheckStrictly={false}
            maxTagCount={6}
            allowClear
            showSearch
            placeholder="请选择区域"
            style={{ width: "100%" }}
            fieldNames={{ label: "name", value: "id", children: "children" }}
            onUpdate:value={handleThreeAreaChange}
          />
        );
      }
      return (
        <Cascader
          value={formState.area}
          options={areaOptions.value}
          changeOnSelect
          allowClear
          showSearch
          placeholder="请选择区域"
          style={{ width: "100%" }}
          fieldNames={{ label: "name", value: "name", children: "children" }}
          onUpdate:value={(val: string[]) => {
            formState.area = val ?? [];
            formState.legacyArea = "";
          }}
        />
      );
    };

    watch(entry, () => {
      handleReset();
    });

    onMounted(() => {
      titleMountReady.value = Boolean(
        document.querySelector(`#${CONFIG_SHELL_TITLE_META_ID}`) && document.querySelector(`#${CONFIG_SHELL_TITLE_EXTRA_ID}`),
      );
      void loadAreas();
    });

    return () => {
      if (!modelApi) {
        return <div class={styles.root}>模型配置上下文缺失</div>;
      }

      if (unsupported.value) {
        return (
          <div class={styles.root}>
            <Empty description="WebGIS 引入模型暂未开放，请先在「渲染设置」中选择其他模型类型" />
          </div>
        );
      }

      return (
        <div class={styles.root}>
          {titleMountReady.value ? (
            <>
              <Teleport to={`#${CONFIG_SHELL_TITLE_META_ID}`}>
                <div class={styles.entryBadge} title={`当前渲染类型：${modelApi.entryLabel.value}`}>
                  <span class={styles.entryDivider} aria-hidden="true" />
                  <span class={styles.entryLabel}>当前渲染类型</span>
                  <span class={styles.entryValue}>{modelApi.entryLabel.value}</span>
                </div>
              </Teleport>
              <Teleport to={`#${CONFIG_SHELL_TITLE_EXTRA_ID}`}>
                <span title={createModelTip.value || undefined}>
                  <Button type="primary" disabled={!canCreateModel.value} onClick={openCreate}>
                    新增模型
                  </Button>
                </span>
              </Teleport>
            </>
          ) : undefined}
          <Spin spinning={modelApi.loading.value || modelApi.saving.value}>
            <Form layout="inline" class={styles.filterForm}>
              <FormItem label="模型名称">
                <Input
                  value={keywordInput.value}
                  maxlength={50}
                  showCount
                  placeholder="请输入模型名称"
                  allowClear
                  class={styles.keywordInput}
                  onUpdate:value={(val: string) => {
                    keywordInput.value = val ?? "";
                  }}
                  onPressEnter={handleQuery}
                />
              </FormItem>
              <FormItem class={styles.filterActions}>
                <Space size={8}>
                  <Button type="primary" onClick={handleQuery}>
                    查询
                  </Button>
                  <Button onClick={handleReset}>重置</Button>
                </Space>
              </FormItem>
            </Form>

            <div class={styles.tableWrap}>
              <Table
                columns={columns.value}
                dataSource={displayList.value}
                pagination={false}
                size="middle"
                rowKey={(record: Ue5Server | ThreeServer | ScadaUrl) =>
                  "id" in record && record.id ? String(record.id) : `${record.name}-${record.url}`
                }
                size="middle"
              />
            </div>
          </Spin>

          <Modal
            visible={modal.open}
            title={modal.mode === "create" ? "新增模型" : "编辑模型"}
            confirmLoading={modal.submitting}
            destroyOnClose
            okText="保存"
            cancelText="取消"
            width={900}
            onOk={() => void handleSubmit()}
            onCancel={() => {
              modal.open = false;
            }}
          >
            <Form layout="horizontal" labelCol={{ style: { width: "88px" } }} wrapperCol={{ style: { flex: 1 } }} class={styles.modalForm}>
              <FormItem label="模型名称" required>
                <Input
                  value={formState.name}
                  maxlength={8}
                  showCount
                  placeholder="请输入模型名称"
                  onUpdate:value={(val: string) => {
                    formState.name = val ?? "";
                  }}
                />
              </FormItem>
              <FormItem label="选择区域">{renderAreaSelector()}</FormItem>
              <FormItem label="模型地址" required>
                <Input
                  value={formState.url}
                  maxlength={200}
                  showCount
                  placeholder="请输入模型地址"
                  onUpdate:value={(val: string) => {
                    formState.url = val ?? "";
                  }}
                />
              </FormItem>
              {entry.value === "views-2d" && (
                <FormItem label="关联菜单">
                  <Input
                    value={formState.menu}
                    placeholder="请输入关联菜单"
                    onUpdate:value={(val: string) => {
                      formState.menu = val ?? "";
                    }}
                  />
                </FormItem>
              )}
            </Form>
          </Modal>
        </div>
      );
    };
  },
});

export default IntroducingModels;
