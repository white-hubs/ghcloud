import { mockMaterialApi } from "../mock";
import type { MaterialFolder } from "../types";
import styles from "./material-modal.module.less";
import { cubeSiteGeneratorService } from "@/api/service";
import { Tree, message } from "@ghcloud/cube-ui";
import { Modal } from "ant-design-vue";
import { defineComponent, ref, watch, type PropType } from "vue";

export const MaterialMoveModal = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    materialIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    excludeFolderId: {
      type: String as PropType<string | null>,
      default: null,
    },
  },
  emits: ["update:visible", "success"],
  setup(props, { emit }) {
    const loading = ref(false);
    const treeData = ref<any[]>([]);
    const selectedKeys = ref<string[]>([]);

    const buildTree = (folders: MaterialFolder[], pathId: string | null): any[] =>
      folders
        .filter((f) => f.pathId === pathId)
        .map((f) => ({
          title: f.name,
          key: f.id,
          children: buildTree(folders, f.id),
          disabled: f.id === props.excludeFolderId,
        }));

    const loadFolders = async (): Promise<void> => {
      loading.value = true;
      try {
        const tree = await cubeSiteGeneratorService.getMaterialFolderList(null);
        const allFolders = flattenTree(tree);
        treeData.value = buildTree(allFolders, null);
      } catch {
        message.error("加载目录失败");
      } finally {
        loading.value = false;
      }
    };

    watch(
      () => props.visible,
      (val) => {
        if (val) {
          selectedKeys.value = [];
          loadFolders();
        }
      },
    );

    const handleClose = (): void => {
      emit("update:visible", false);
    };

    const handleSubmit = async (): Promise<void> => {
      if (selectedKeys.value.length === 0) {
        message.warning("请选择目标目录");
        return;
      }
      const targetId = selectedKeys.value[0];
      loading.value = true;
      try {
        await mockMaterialApi.moveMaterials({
          ids: props.materialIds,
          targetFolderId: targetId === "root" ? null : targetId,
        });
        message.success("移动成功");
        emit("success");
        handleClose();
      } catch (error) {
        message.error((error as Error).message || "移动失败");
      } finally {
        loading.value = false;
      }
    };

    const handleSelect = (keys: string[]): void => {
      selectedKeys.value = keys;
    };

    return (): JSX.Element => (
      <Modal
        visible={props.visible}
        title="移动到"
        width="480px"
        confirmLoading={loading.value}
        onOk={handleSubmit}
        onCancel={handleClose}
        maskClosable={false}
      >
        <div class={styles["tree-wrapper"]}>
          <Tree treeData={treeData.value} selectedKeys={selectedKeys.value} onSelect={handleSelect} defaultExpandAll />
        </div>
      </Modal>
    );
  },
});

/** 扁平化文件夹树 */
function flattenTree(nodes: MaterialFolder[]): MaterialFolder[] {
  const result: MaterialFolder[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children && node.children.length > 0) {
      result.push(...flattenTree(node.children));
    }
  }
  return result;
}
