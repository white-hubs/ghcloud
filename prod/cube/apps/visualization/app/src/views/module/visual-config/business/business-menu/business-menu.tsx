import { HolderOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { Input as AntInput } from "ant-design-vue";
import { defineComponent, onMounted, onUnmounted, reactive, ref, shallowRef, Teleport, watch } from "vue";

import { FileUpload } from "@ghcloud/cube-app-design";
import type { DataDictionary } from "@ghcloud/cube-service-interface/dictionary";
import type { BusinessAreaNode, SceneTypeMenu } from "@ghcloud/cube-service-interface/mdata";
import {
  createDataDictionary,
  getDataDictionaryByItem,
  getOrCreateDictionaryItem,
  updateDataDictionary,
} from "@ghcloud/cube-services-client/dictionary.client";
import {
  createSceneTypeMenu,
  deleteSceneTypeMenu,
  listBusinessAreas,
  listSceneTypeMenus,
  updateSceneTypeMenu,
} from "@ghcloud/cube-services-client/mdata.client";
import {
  Button,
  Cascader,
  CheckboxGroup,
  Form,
  FormItem,
  Input,
  InputNumber,
  Modal,
  PopConfirm,
  Space,
  Spin,
  Table,
  message,
} from "@ghcloud/cube-ui";

import { CONFIG_SHELL_TITLE_EXTRA_ID } from "../../config-shell";
import { getBusinessMenuSubmitErrorMessage, hasDuplicateMenuNameAtLevel, normalizeMenuName } from "./business-menu-validation";
import { useAuthRequest } from "@/hooks/auth-request";
import { useProjectId } from "@/hooks/use-project-id";

import styles from "./business-menu.module.less";

const { TextArea } = AntInput;

const DICT_ITEM_CODE = "UE5_BUSINESS_MENU_EXPAND";
/** 与 GLOBAL_SCENE_CODE.visualCenterMenu 一致 */
const MENU_ICON_SCENE_CODE = "MDATA::BUSINESS_MENU";
const TABLE_HEADER_HEIGHT = 48;
const MIN_TABLE_BODY_HEIGHT = 160;

/** 与视角配置一致：changeOnSelect 下仅按当前节点名称/别名过滤，避免数字搜索误命中子孙 */
const areaCascaderShowSearch = {
  limit: 100,
  filter: (inputValue: string, path: BusinessAreaNode[]): boolean => {
    const keyword = inputValue.trim().toLocaleLowerCase();
    if (!keyword) {
      return true;
    }
    const current = path[path.length - 1];
    if (!current) {
      return false;
    }
    const name = String(current.name ?? "").toLocaleLowerCase();
    const alias = String(current.aliasName ?? "").toLocaleLowerCase();
    return name.includes(keyword) || alias.includes(keyword);
  },
};

type UploadFileItem = {
  id: string;
  name: string;
  path: string;
  businessKey: string | null;
  refCount: number;
  size: number;
  suffix: string;
  type: string;
};

const SCENARIO_OPTIONS = [
  {
    label: "建筑",
    value: "BUILD",
    tips: "勾选后请务必到设备关联中关联设备，否则建筑中无设备展示",
  },
  {
    label: "管网",
    value: "PIPE_NETWORK",
    tips: "勾选后请务必保证模型标签与业务菜单名称一致，否则无法加载模型",
  },
];

type MenuRow = SceneTypeMenu & {
  scenarioTypes: string[];
};

type DictFormState = {
  id: string;
  name: string;
  code: string;
  itemCode: string;
  variable: string;
  version?: string;
  remarks?: string;
};

const parentKeyOf = (row: Pick<MenuRow, "parentId">): string | null => row.parentId || null;

const normalizeMenuTree = (list: SceneTypeMenu[]): MenuRow[] =>
  list.map((item) => {
    const scenarioType = item.scenarioType ?? "";
    return {
      ...item,
      scenarioType,
      scenarioTypes: scenarioType ? scenarioType.split("-").filter(Boolean) : ["BUILD"],
      children: item.children?.length ? normalizeMenuTree(item.children) : undefined,
    };
  });

const cloneMenuTree = (list: MenuRow[]): MenuRow[] =>
  list.map((item) => ({
    ...item,
    scenarioTypes: [...(item.scenarioTypes ?? [])],
    children: item.children?.length ? cloneMenuTree(item.children as MenuRow[]) : undefined,
  }));

const findNode = (list: MenuRow[], id: string): MenuRow | null => {
  for (const item of list) {
    if (item.id === id) {
      return item;
    }
    if (item.children?.length) {
      const found = findNode(item.children as MenuRow[], id);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

const getSiblingContainer = (list: MenuRow[], parentId: string | null): { parent: MenuRow | null; siblings: MenuRow[] } | null => {
  if (parentId == null) {
    return { parent: null, siblings: list };
  }
  const parent = findNode(list, parentId);
  if (!parent) {
    return null;
  }
  return {
    parent,
    siblings: (parent.children as MenuRow[] | undefined) ?? [],
  };
};

/** 同级列表内将 fromId 移动到 toId 位置，并重排 sort 为 1..n；仅返回 sort 发生变化的节点 */
const reorderSiblingsInTree = (tree: MenuRow[], fromId: string, toId: string): { tree: MenuRow[]; changed: MenuRow[] } | null => {
  if (fromId === toId) {
    return null;
  }
  const next = cloneMenuTree(tree);
  const fromNode = findNode(next, fromId);
  const toNode = findNode(next, toId);
  if (!fromNode || !toNode) {
    return null;
  }
  if (parentKeyOf(fromNode) !== parentKeyOf(toNode)) {
    return null;
  }
  const container = getSiblingContainer(next, parentKeyOf(fromNode));
  if (!container) {
    return null;
  }
  const { parent, siblings } = container;
  const fromIndex = siblings.findIndex((item) => item.id === fromId);
  const toIndex = siblings.findIndex((item) => item.id === toId);
  if (fromIndex < 0 || toIndex < 0) {
    return null;
  }
  const beforeSort = new Map(siblings.map((item) => [item.id, item.sort]));
  const [moved] = siblings.splice(fromIndex, 1);
  siblings.splice(toIndex, 0, moved);
  siblings.forEach((item, index) => {
    item.sort = index + 1;
  });
  if (parent) {
    parent.children = siblings;
  }
  const changed = siblings.filter((item) => beforeSort.get(item.id) !== item.sort);
  return { tree: parent ? next : siblings, changed };
};

const pickCreatedCode = (created: unknown): string => {
  if (!created || typeof created !== "object") {
    return "";
  }
  const code = (created as { code?: unknown }).code;
  return typeof code === "string" ? code : "";
};

const findMenuByNameAndParent = (list: MenuRow[], name: string, parentId: string | null): MenuRow | null => {
  for (const item of list) {
    if (item.name === name && parentKeyOf(item) === parentId) {
      return item;
    }
    if (item.children?.length) {
      const found = findMenuByNameAndParent(item.children as MenuRow[], name, parentId);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

const toUploadFiles = (fileVO?: SceneTypeMenu["fileVO"]): UploadFileItem[] => {
  if (!fileVO?.id) {
    return [];
  }
  return [
    {
      id: fileVO.id,
      name: fileVO.name || "icon",
      path: fileVO.path,
      businessKey: null,
      refCount: 0,
      size: fileVO.size ?? 0,
      suffix: "",
      type: fileVO.type || "image",
    },
  ];
};

const createEmptyDict = (menuCode: string, kind: "perspective" | "hideActors"): DictFormState => ({
  id: "",
  name: kind === "perspective" ? "视角参数" : "隐藏楼栋",
  code: `${menuCode}_${kind}`,
  itemCode: DICT_ITEM_CODE,
  variable: "",
  version: "",
  remarks: "",
});

const parseHideActors = (raw?: string): string[][] => {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as string[][]) : [];
  } catch {
    return [];
  }
};

/**
 * 业务菜单：树形 CRUD + 同级拖拽排序 + 图标 / UE5 扩展配置。
 */
export const BusinessMenu = defineComponent({
  name: "BusinessMenu",
  setup() {
    const { projectId, ensureProjectId } = useProjectId();
    const loading = ref(false);
    const saving = ref(false);
    const sorting = ref(false);
    const titleExtraReady = ref(false);
    const tableData = ref<MenuRow[]>([]);
    const tableWrapRef = shallowRef<HTMLElement>();
    const tableScrollY = shallowRef(MIN_TABLE_BODY_HEIGHT);
    const areaOptions = ref<BusinessAreaNode[]>([]);
    const uploadRef = ref<{ clearAll?: () => void }>();
    const draggingId = ref("");
    const overId = ref("");
    const modal = reactive({
      open: false,
      mode: "create" as "create" | "edit",
      title: "新增业务菜单",
    });
    const formState = reactive({
      id: "" as string,
      code: "" as string,
      name: "",
      sort: 1,
      parentId: null as string | null,
      scenarioTypes: ["BUILD"] as string[],
      fileList: [] as UploadFileItem[],
    });
    const dictState = reactive({
      perspective: createEmptyDict("", "perspective"),
      hideActors: createEmptyDict("", "hideActors"),
    });
    const hideActorsValue = ref<string[][]>([]);
    let tableResizeObserver: ResizeObserver | undefined;

    const updateTableScrollY = (): void => {
      const containerHeight = tableWrapRef.value?.clientHeight ?? 0;
      if (containerHeight <= 0) {
        return;
      }
      tableScrollY.value = Math.max(Math.floor(containerHeight - TABLE_HEADER_HEIGHT), MIN_TABLE_BODY_HEIGHT);
    };

    const loadList = async (): Promise<void> => {
      if (!projectId.value) {
        tableData.value = [];
        return;
      }
      loading.value = true;
      try {
        const list = await useAuthRequest(() => listSceneTypeMenus({ projectId: projectId.value }));
        tableData.value = normalizeMenuTree(list);
      } catch {
        message.error("加载业务菜单失败");
        tableData.value = [];
      } finally {
        loading.value = false;
      }
    };

    const loadAreas = async (): Promise<void> => {
      try {
        areaOptions.value = await useAuthRequest(() => listBusinessAreas());
      } catch {
        areaOptions.value = [];
      }
    };

    const resetDictionary = (): void => {
      dictState.perspective = createEmptyDict("", "perspective");
      dictState.hideActors = createEmptyDict("", "hideActors");
      hideActorsValue.value = [];
    };

    const loadDictionary = async (menuCode: string): Promise<void> => {
      resetDictionary();
      if (!menuCode) {
        return;
      }
      try {
        await useAuthRequest(() =>
          getOrCreateDictionaryItem({
            code: DICT_ITEM_CODE,
            remarks: "UE5业务菜单扩展配置",
          }),
        );
        const list = await useAuthRequest(() => getDataDictionaryByItem({ itemCode: DICT_ITEM_CODE }));
        const rows = Array.isArray(list) ? list : [];
        const perspectiveCode = `${menuCode}_perspective`;
        const hideActorsCode = `${menuCode}_hideActors`;
        const perspective = rows.find((item: DataDictionary) => item.code === perspectiveCode);
        const hideActors = rows.find((item: DataDictionary) => item.code === hideActorsCode);

        dictState.perspective = perspective
          ? {
              id: perspective.id,
              name: perspective.name || "视角参数",
              code: perspective.code,
              itemCode: perspective.itemCode || DICT_ITEM_CODE,
              variable: perspective.variable || "",
              version: perspective.version,
              remarks: perspective.remarks,
            }
          : createEmptyDict(menuCode, "perspective");

        dictState.hideActors = hideActors
          ? {
              id: hideActors.id,
              name: hideActors.name || "隐藏楼栋",
              code: hideActors.code,
              itemCode: hideActors.itemCode || DICT_ITEM_CODE,
              variable: hideActors.variable || "",
              version: hideActors.version,
              remarks: hideActors.remarks,
            }
          : createEmptyDict(menuCode, "hideActors");

        hideActorsValue.value = parseHideActors(dictState.hideActors.variable);
      } catch {
        dictState.perspective = createEmptyDict(menuCode, "perspective");
        dictState.hideActors = createEmptyDict(menuCode, "hideActors");
        hideActorsValue.value = [];
      }
    };

    const resetForm = (parentId: string | null = null): void => {
      formState.id = "";
      formState.code = "";
      formState.name = "";
      formState.sort = 1;
      formState.parentId = parentId;
      formState.scenarioTypes = ["BUILD"];
      formState.fileList = [];
      resetDictionary();
      uploadRef.value?.clearAll?.();
    };

    const openCreate = (parentId: string | null = null): void => {
      resetForm(parentId);
      modal.mode = "create";
      modal.title = parentId ? "新增下级菜单" : "新增业务菜单";
      modal.open = true;
    };

    const openEdit = async (record: MenuRow): Promise<void> => {
      formState.id = record.id;
      formState.code = record.code || "";
      formState.name = record.name;
      formState.sort = record.sort || 1;
      formState.parentId = record.parentId;
      formState.scenarioTypes = record.scenarioTypes?.length ? [...record.scenarioTypes] : ["BUILD"];
      formState.fileList = toUploadFiles(record.fileVO);
      modal.mode = "edit";
      modal.title = "编辑业务菜单";
      modal.open = true;
      await loadDictionary(record.code);
    };

    const bindDictionaryCodes = (menuCode: string): void => {
      dictState.perspective = {
        ...dictState.perspective,
        code: `${menuCode}_perspective`,
        name: dictState.perspective.name || "视角参数",
      };
      dictState.hideActors = {
        ...dictState.hideActors,
        code: `${menuCode}_hideActors`,
        name: dictState.hideActors.name || "隐藏楼栋",
      };
    };

    const persistDictionary = async (menuCode = formState.code): Promise<void> => {
      if (!menuCode) {
        return;
      }
      bindDictionaryCodes(menuCode);
      dictState.hideActors.variable = JSON.stringify(hideActorsValue.value ?? []);
      const entries = [dictState.perspective, dictState.hideActors];
      for (const entry of entries) {
        const payload = {
          itemCode: DICT_ITEM_CODE,
          name: entry.name,
          code: entry.code,
          variable: entry.variable ?? "",
          version: entry.version,
          remarks: entry.remarks,
        };
        if (!entry.id) {
          await useAuthRequest(() => createDataDictionary(payload));
        } else {
          await useAuthRequest(() =>
            updateDataDictionary({
              ...payload,
              id: entry.id,
            }),
          );
        }
      }
    };

    const resolveCreatedMenuCode = async (created: unknown, name: string, parentId: string | null): Promise<string> => {
      const fromResp = pickCreatedCode(created);
      if (fromResp) {
        return fromResp;
      }
      await loadList();
      return findMenuByNameAndParent(tableData.value, name, parentId)?.code ?? "";
    };

    const handleSubmit = async (): Promise<void> => {
      const name = normalizeMenuName(formState.name);
      if (!name) {
        message.warning("请输入菜单名称");
        return;
      }
      if (name.length > 6) {
        message.warning("菜单名称最多 6 个字");
        return;
      }
      if (hasDuplicateMenuNameAtLevel(tableData.value, formState.parentId, name, formState.id)) {
        message.warning("当前层级已存在同名菜单，请修改菜单名称");
        return;
      }
      if (!formState.scenarioTypes.length) {
        message.warning("请至少选择一项模型场景");
        return;
      }
      if (!projectId.value) {
        message.warning("缺少项目 ID");
        return;
      }

      saving.value = true;
      try {
        const fileId = formState.fileList
          .map((item) => item.id)
          .filter(Boolean)
          .join(",");
        const payload = {
          projectId: projectId.value,
          name,
          parentId: formState.parentId,
          fileId,
          sort: formState.sort || 1,
          scenarioType: formState.scenarioTypes.join("-"),
        };
        if (modal.mode === "edit" && formState.id) {
          await useAuthRequest(() =>
            updateSceneTypeMenu({
              ...payload,
              id: formState.id,
            }),
          );
          await persistDictionary();
          message.success("保存成功");
        } else {
          const created = await useAuthRequest(() => createSceneTypeMenu(payload));
          const menuCode = await resolveCreatedMenuCode(created, name, formState.parentId);
          if (menuCode) {
            formState.code = menuCode;
            await persistDictionary(menuCode);
          }
          message.success("新增成功");
        }
        modal.open = false;
        resetForm();
        await loadList();
      } catch (error) {
        const fallback = modal.mode === "edit" ? "保存失败" : "新增失败";
        message.error(getBusinessMenuSubmitErrorMessage(error, fallback));
      } finally {
        saving.value = false;
      }
    };

    const handleDelete = async (id: string): Promise<void> => {
      try {
        await useAuthRequest(() => deleteSceneTypeMenu(id));
        message.success("删除成功");
        await loadList();
      } catch {
        message.error("删除失败");
      }
    };

    const clearDragState = (): void => {
      draggingId.value = "";
      overId.value = "";
    };

    const isSameLevel = (sourceId: string, target: MenuRow): boolean => {
      const source = findNode(tableData.value, sourceId);
      if (!source) {
        return false;
      }
      return parentKeyOf(source) === parentKeyOf(target);
    };

    const persistSiblingSort = async (changed: MenuRow[]): Promise<void> => {
      if (!projectId.value || changed.length === 0) {
        return;
      }
      for (const item of changed) {
        await useAuthRequest(() =>
          updateSceneTypeMenu({
            id: item.id,
            projectId: projectId.value,
            name: item.name,
            parentId: item.parentId,
            fileId: item.fileVO?.id ?? "",
            sort: item.sort || 1,
            scenarioType: item.scenarioType || (item.scenarioTypes ?? []).join("-") || "BUILD",
          }),
        );
      }
    };

    const handleDropReorder = async (target: MenuRow): Promise<void> => {
      const sourceId = draggingId.value;
      clearDragState();
      if (!sourceId || sourceId === target.id || sorting.value) {
        return;
      }
      if (!isSameLevel(sourceId, target)) {
        message.warning("仅支持同级菜单拖拽排序");
        return;
      }

      const result = reorderSiblingsInTree(tableData.value, sourceId, target.id);
      if (!result || result.changed.length === 0) {
        return;
      }
      const prev = cloneMenuTree(tableData.value);
      tableData.value = result.tree;
      sorting.value = true;
      try {
        await persistSiblingSort(result.changed);
        message.success("排序已更新");
      } catch {
        tableData.value = prev;
        message.error("排序保存失败");
        await loadList();
      } finally {
        sorting.value = false;
      }
    };

    const handleCustomRow = (record: MenuRow): Record<string, unknown> => {
      const isDragging = draggingId.value === record.id;
      const isOver = Boolean(overId.value === record.id && draggingId.value && draggingId.value !== record.id);
      const valid = isOver && isSameLevel(draggingId.value, record);
      return {
        class: {
          [styles.dragging]: isDragging,
          [styles.dragOverValid]: isOver && valid,
          [styles.dragOverInvalid]: isOver && !valid,
        },
        onDragover: (event: DragEvent) => {
          if (!draggingId.value) {
            return;
          }
          event.preventDefault();
          overId.value = record.id;
          if (event.dataTransfer) {
            event.dataTransfer.dropEffect = isSameLevel(draggingId.value, record) ? "move" : "none";
          }
        },
        onDragleave: () => {
          if (overId.value === record.id) {
            overId.value = "";
          }
        },
        onDrop: (event: DragEvent) => {
          event.preventDefault();
          event.stopPropagation();
          void handleDropReorder(record);
        },
      };
    };

    const columns = [
      {
        title: "菜单序号",
        dataIndex: "sort",
        key: "sort",
        width: 110,
        customRender: ({ record }: { record: MenuRow }) => (
          <span class={styles.sortCell}>
            <span
              class={styles.sortHandle}
              title="拖拽调整同级顺序"
              draggable
              onDragstart={(event: DragEvent) => {
                event.stopPropagation();
                draggingId.value = record.id;
                overId.value = "";
                if (event.dataTransfer) {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", record.id);
                }
              }}
              onDragend={() => {
                clearDragState();
              }}
            >
              <HolderOutlined />
            </span>
            <span class={styles.sortValue}>{record.sort}</span>
          </span>
        ),
      },
      {
        title: "菜单名称",
        dataIndex: "name",
        key: "name",
        width: 180,
        ellipsis: true,
      },
      {
        title: "菜单图标",
        key: "icon",
        width: 88,
        customRender: ({ record }: { record: MenuRow }) =>
          record.fileVO?.path ? (
            <img class={styles.icon} src={record.fileVO.path} alt={record.name} />
          ) : (
            <span class={styles.iconEmpty}>--</span>
          ),
      },
      {
        title: "模型场景",
        key: "scenarioType",
        width: 120,
        customRender: ({ record }: { record: MenuRow }) =>
          (record.scenarioTypes ?? []).map((item) => (item === "BUILD" ? "建筑" : item === "PIPE_NETWORK" ? "管网" : item)).join("、") ||
          "--",
      },
      {
        title: "操作",
        key: "action",
        width: 180,
        customRender: ({ record }: { record: MenuRow }) => (
          <Space size={0}>
            {record.level === 1 && (
              <Button type="link" size="small" onClick={() => openCreate(record.id)}>
                新增下级
              </Button>
            )}
            <Button type="link" size="small" onClick={() => void openEdit(record)}>
              编辑
            </Button>
            <PopConfirm
              title={`确定删除「${record.name}」吗？`}
              okText="删除"
              cancelText="取消"
              onConfirm={() => void handleDelete(record.id)}
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </PopConfirm>
          </Space>
        ),
      },
    ];

    onMounted(() => {
      titleExtraReady.value = Boolean(document.querySelector(`#${CONFIG_SHELL_TITLE_EXTRA_ID}`));
      if (tableWrapRef.value) {
        tableResizeObserver = new ResizeObserver(updateTableScrollY);
        tableResizeObserver.observe(tableWrapRef.value);
        updateTableScrollY();
      }
      if (ensureProjectId()) {
        void loadList();
        void loadAreas();
      }
    });

    onUnmounted(() => {
      tableResizeObserver?.disconnect();
    });

    watch(projectId, (id, prev) => {
      if (id && id !== prev) {
        void loadList();
        void loadAreas();
      }
    });

    return () => (
      <div class={styles.root}>
        {titleExtraReady.value ? (
          <Teleport to={`#${CONFIG_SHELL_TITLE_EXTRA_ID}`}>
            <Button type="primary" onClick={() => openCreate(null)}>
              <PlusOutlined />
              新增菜单
            </Button>
          </Teleport>
        ) : null}
        <Spin spinning={loading.value || sorting.value}>
          <div class={styles.header}>
            <p class={styles.desc} title="维护业务菜单层级与图标；可配置 UE5 视角与隐藏楼栋；拖拽序号左侧把手可调整同级顺序">
              维护业务菜单层级与图标；可配置 UE5 视角与隐藏楼栋；拖拽序号把手可调整同级顺序
            </p>
          </div>

          <div ref={tableWrapRef} class={styles.tableWrap}>
            <Table
              columns={columns}
              dataSource={tableData.value}
              pagination={false}
              rowKey="id"
              defaultExpandAllRows
              customRow={handleCustomRow}
              scrollY={tableScrollY.value}
              size="middle"
            />
          </div>
        </Spin>

        <Modal
          visible={modal.open}
          title={modal.title}
          confirmLoading={saving.value}
          destroyOnClose
          okText="确定"
          cancelText="取消"
          width={720}
          onOk={() => void handleSubmit()}
          onCancel={() => {
            modal.open = false;
            resetForm();
          }}
        >
          <Form layout="horizontal" labelCol={{ style: { width: "100px" } }} class={styles.form}>
            <FormItem label="菜单名称" required>
              <Input
                value={formState.name}
                maxlength={6}
                showCount
                placeholder="请输入菜单名称"
                onUpdate:value={(val: string) => {
                  formState.name = normalizeMenuName(val ?? "");
                }}
              />
            </FormItem>
            <FormItem label="菜单序号">
              <InputNumber
                value={formState.sort}
                min={1}
                style={{ width: "160px" }}
                onUpdate:value={(val: number | string) => {
                  formState.sort = Number(val) || 1;
                }}
              />
            </FormItem>
            <FormItem label="菜单图标">
              <FileUpload
                ref={uploadRef}
                type="picture-card"
                maxCount={1}
                sceneCode={MENU_ICON_SCENE_CODE}
                customText="支持 png / jpeg / jpg / svg / gif"
                value={formState.fileList}
                onUpdate:value={(files: UploadFileItem[]) => {
                  formState.fileList = files ?? [];
                }}
              />
            </FormItem>
            <FormItem label="模型场景" required>
              <CheckboxGroup
                value={formState.scenarioTypes}
                options={SCENARIO_OPTIONS}
                onUpdate:value={(val: string | string[]) => {
                  formState.scenarioTypes = Array.isArray(val) ? val.map(String) : [];
                }}
              />
            </FormItem>
            <FormItem label="视角参数">
              <TextArea
                value={dictState.perspective.variable}
                rows={2}
                maxlength={500}
                placeholder="请输入视角参数"
                onUpdate:value={(val: string) => {
                  dictState.perspective.variable = val ?? "";
                }}
              />
            </FormItem>
            <FormItem label="隐藏楼栋">
              <Cascader
                value={hideActorsValue.value}
                options={areaOptions.value}
                multiple
                changeOnSelect
                allowClear
                showSearch={areaCascaderShowSearch}
                placeholder="请选择楼栋"
                style={{ width: "100%" }}
                fieldNames={{ label: "name", value: "aliasName", children: "children" }}
                onUpdate:value={(val: string[][]) => {
                  hideActorsValue.value = val ?? [];
                }}
              />
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  },
});

export default BusinessMenu;
