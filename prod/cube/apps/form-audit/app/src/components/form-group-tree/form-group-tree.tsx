import { PlusOutlined, FormOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import type { PropType } from "vue";
import { computed, defineComponent, reactive, ref, onMounted } from "vue";

import { Form, FormItem, Input, Modal, PopConfirm, Spin, Tooltip, Tree, type FormExpose } from "@ghcloud/cube-ui";

import { cubeFormAuditService } from "@/api/service";
import { getCurrentApplicationCode } from "@/utils/current-application";

import styles from "./form-group.module.less";
interface FormFlowGroupVO {
  formGroupId: string;
  formGroupName: string;
  formGroupCount: number;
  children?: FormFlowGroupVO[];
}

interface FormGroupTreeNode {
  key: string;
  title: JSX.Element;
  children?: FormGroupTreeNode[];
}

export interface FormGroupSelectMeta {
  isAll: boolean;
  level: number;
  canAddForm: boolean;
}

export const FormGroupTree = defineComponent({
  props: {
    onSelect: {
      type: Function as PropType<(id: string | number | undefined, meta?: FormGroupSelectMeta) => void>,
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    showCount: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["add", "edit", "delete"],
  setup(props, { expose }) {
    const isModalVisible = ref(false);
    const modalTitle = ref("");
    const active = ref<string | number | undefined>(undefined);
    const data = ref<FormFlowGroupVO[]>([]);
    const buttonLoading = ref(false);
    const expandedKeys = ref<Array<string | number>>([]);
    const modalMode = ref<"add" | "edit">("add");
    const allNodeId = ref<string>("0");
    const levelMap = ref<Record<string, number>>({});
    const expandedInitialized = ref(false);

    const collectAllKeys = (nodes: FormFlowGroupVO[]): Array<string | number> => {
      return nodes.flatMap((node) => [
        node.formGroupId,
        ...(Array.isArray(node.children) && node.children.length > 0 ? collectAllKeys(node.children) : []),
      ]);
    };

    const sumGroupCount = (nodes: FormFlowGroupVO[]): number => {
      return nodes.reduce((sum, node) => {
        return sum + (node.formGroupCount || 0);
      }, 0);
    };

    const buildLevelMap = (nodes: FormFlowGroupVO[], level = 0): Record<string, number> => {
      return nodes.reduce<Record<string, number>>((acc, node) => {
        acc[node.formGroupId] = level;
        if (Array.isArray(node.children) && node.children.length > 0) {
          Object.assign(acc, buildLevelMap(node.children, level + 1));
        }
        return acc;
      }, {});
    };

    const buildTreeData = (nodes: FormFlowGroupVO[], level = 0): FormGroupTreeNode[] => {
      return nodes.map((node) => ({
        key: node.formGroupId,
        title: (
          <div class={styles["form-group-item"]}>
            <span class={styles["form-group-name"]}>
              <div class={styles["form-group-title"]}>
                {props.showCount ? `${node.formGroupName} (${node.formGroupCount})` : node.formGroupName}
              </div>
            </span>
            <span class={styles["actions"]}>
              {!props.readonly && level < 2 ? (
                <Tooltip title="新增分组">
                  <PlusOutlined
                    class={styles["action-icon"]}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(node.formGroupId);
                    }}
                  />
                </Tooltip>
              ) : null}
              {!props.readonly && node.formGroupId !== "0" ? (
                <Tooltip title="编辑分组">
                  <FormOutlined class={styles["action-icon"]} onClick={(e) => handleEdit(e, node)} />
                </Tooltip>
              ) : null}
              {!props.readonly && node.formGroupId !== "0" ? (
                <Tooltip title="删除分组">
                  <PopConfirm title="确定要删除吗?" onConfirm={async () => handleDelete(node.formGroupId)}>
                    <DeleteOutlined class={styles["action-icon"]} onClick={(e) => e.stopPropagation()} />
                  </PopConfirm>
                </Tooltip>
              ) : null}
            </span>
          </div>
        ),
        ...(Array.isArray(node.children) && node.children.length > 0 ? { children: buildTreeData(node.children, level + 1) } : {}),
      }));
    };

    const treeData = computed(() => buildTreeData(data.value));
    const formState = reactive<{
      name: string;
      id: string | null;
      parentId: string | null;
    }>({
      parentId: null,
      id: null,
      name: "",
    });
    const loading = ref(false);
    const formRenderRef = ref<FormExpose>();
    const modalRules = {
      name: [{ required: true, message: "请输入分组名称" }],
    };

    onMounted(() => {
      getTypeData();
    });

    const getTypeData = async (): Promise<void> => {
      loading.value = true;
      try {
        const response = await cubeFormAuditService.getFormFlowGroupCount({
          application: getCurrentApplicationCode(),
        });
        const backendData = Array.isArray(response) ? response : [];
        data.value = [
          {
            formGroupId: "0",
            formGroupName: "全部",
            formGroupCount: sumGroupCount(backendData),
            children: backendData,
          },
        ];
        if (!expandedInitialized.value) {
          expandedKeys.value = collectAllKeys(data.value);
          expandedInitialized.value = true;
        }
        levelMap.value = buildLevelMap(data.value);
        if (active.value === undefined && data.value.length > 0) {
          const defaultId = allNodeId.value;
          active.value = defaultId;
          props.onSelect(defaultId, {
            isAll: true,
            level: levelMap.value[String(defaultId)] ?? 0,
            canAddForm: (levelMap.value[String(defaultId)] ?? 0) === 2,
          });
        }
      } catch {
        data.value = [];
      } finally {
        loading.value = false;
      }
    };
    expose({
      getTypeData,
    });

    const handleAdd = (parentId: string): void => {
      modalMode.value = "add";
      modalTitle.value = "新建分组";
      formState.name = "";
      formState.parentId = parentId;
      formState.id = null;
      isModalVisible.value = true;
    };

    const handleEdit = (e: Event, group: FormFlowGroupVO): void => {
      e.stopPropagation();
      modalMode.value = "edit";
      modalTitle.value = "编辑分组";
      formState.name = group.formGroupName;
      formState.id = group.formGroupId;
      isModalVisible.value = true;
    };

    const handleOk = async (): Promise<void> => {
      try {
        await formRenderRef.value?.validate();
        if (modalMode.value === "edit") {
          await editFormType();
        } else {
          await addFormType();
        }
        isModalVisible.value = false;
      } catch {
      } finally {
      }
    };

    const addFormType = async (): Promise<void> => {
      buttonLoading.value = true;
      try {
        await cubeFormAuditService.updateFormFlowGroup({
          id: formState.id ?? "",
          parentId: formState.parentId == "0" ? undefined : (formState.parentId ?? ""),
          name: formState.name,
          application: getCurrentApplicationCode(),
        });
        getTypeData();
      } finally {
        buttonLoading.value = false;
      }
    };
    const editFormType = async (): Promise<void> => {
      buttonLoading.value = true;
      try {
        await cubeFormAuditService.updateFormFlowGroup({
          id: formState.id ?? "",
          name: formState.name,
          application: getCurrentApplicationCode(),
        });
        getTypeData();
      } finally {
        buttonLoading.value = false;
      }
    };

    const handleDelete = async (id: string): Promise<void> => {
      loading.value = true;
      try {
        await cubeFormAuditService.deleteFormFlowGroup(id);
        if (active.value === id) {
          active.value = undefined;
          props.onSelect(active.value);
        }
        getTypeData();
      } finally {
        loading.value = false;
      }
    };

    const handleClick = (id: string | number | undefined): void => {
      if (id === undefined) {
        props.onSelect(id);
        active.value = id;
        return;
      }
      const level = levelMap.value[String(id)] ?? 0;
      props.onSelect(id, {
        isAll: id === allNodeId.value,
        level,
        canAddForm: level === 2,
      });
      active.value = id;
    };

    const handleTreeSelect = (selectedKeys: Array<string | number>): void => {
      const selectedKey = selectedKeys?.[0];
      if (!selectedKey) {
        if (active.value !== undefined) {
          handleClick(active.value);
        }
        return;
      }
      handleClick(selectedKey);
    };

    return (): JSX.Element => (
      <Spin spinning={loading.value}>
        <div class={styles["form-group-container"]}>
          <div class={styles["header"]}>
            <div>{props.title}</div>
          </div>
          <div class={styles["form-group-list"]}>
            <Tree
              blockNode
              autoExpandParent={false}
              expandedKeys={expandedKeys.value}
              selectedKeys={active.value ? [active.value] : []}
              treeData={treeData.value}
              onExpand={(keys: (string | number)[] | { expanded: (string | number)[] }) => {
                expandedKeys.value = Array.isArray(keys) ? keys : keys.expanded;
              }}
              onSelect={handleTreeSelect}
            />
          </div>
          <Modal
            title={modalTitle.value}
            visible={isModalVisible.value}
            onOk={handleOk}
            onCancel={() => (isModalVisible.value = false)}
            confirmLoading={buttonLoading.value}
            destroyOnClose
          >
            <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: "100px" } }}>
              <FormItem label="分组名称" name="name">
                <Input v-model:value={formState.name} placeholder="请输入分组名称" />
              </FormItem>
            </Form>
          </Modal>
        </div>
      </Spin>
    );
  },
});
