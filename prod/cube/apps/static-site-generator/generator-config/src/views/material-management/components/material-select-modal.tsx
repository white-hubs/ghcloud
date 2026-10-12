import { Modal } from "ant-design-vue";
import { defineComponent, reactive, ref, watch, type PropType } from "vue";

import { Button, message } from "@ghcloud/cube-ui";

import { getMaterialType } from "../mock";
import type { Material, MaterialFolder, MaterialType, SelectMode } from "../types";
import { MaterialBreadcrumb } from "./material-breadcrumb";
import { MaterialContent } from "./material-content";
import { MaterialToolbar } from "./material-toolbar";
import { MaterialUploadModal } from "./material-upload-modal";
import { useDraggableModal } from "./use-draggable-modal";
import { cubeSiteGeneratorService } from "@/api/service";

import pageStyles from "../material-management.module.less";
import modalStyles from "./material-modal.module.less";

interface State {
  currentFolderId: string | null;
  path: MaterialFolder[];
  folders: MaterialFolder[];
  materials: Material[];
  loading: boolean;
  keyword: string;
  filterType: MaterialType | "all";
  selectedMaterialIds: string[];
}

/** 素材选择弹窗（对外暴露） */
export const MaterialSelectModal = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String as PropType<SelectMode>,
      default: "single",
    },
    title: {
      type: String,
      default: "选择素材",
    },
    width: {
      type: String,
      default: "900px",
    },
  },
  emits: ["update:visible", "confirm", "cancel"],
  setup(props, { emit }) {
    const state = reactive<State>({
      currentFolderId: "root",
      path: [],
      folders: [],
      materials: [],
      loading: false,
      keyword: "",
      filterType: "all",
      selectedMaterialIds: [],
    });

    const uploadModalVisible = ref(false);
    const { initDrag, resetPosition } = useDraggableModal("material-select-draggable-wrap");

    const loadContent = async (): Promise<void> => {
      state.loading = true;
      try {
        const [folderRes, materialRes] = await Promise.all([
          cubeSiteGeneratorService.getMaterialFolderList(state.currentFolderId),
          cubeSiteGeneratorService.getMaterialList({ pathId: state.currentFolderId }),
        ]);
        state.folders = folderRes;
        state.materials = materialRes;
      } catch {
        // ignore
      } finally {
        state.loading = false;
      }
    };

    const refresh = async (): Promise<void> => {
      await loadContent();
    };

    watch(
      () => props.visible,
      async (val) => {
        if (val) {
          resetPosition();
          state.currentFolderId = "root";
          state.keyword = "";
          state.filterType = "all";
          state.selectedMaterialIds = [];
          await refresh();
          await initDrag();
        }
      },
    );

    const handleNavigate = (index: number): void => {
      if (index === -1) {
        state.currentFolderId = "root";
        state.keyword = "";
        state.path = [];
        state.selectedMaterialIds = [];
        refresh();
        return;
      }
      const folder = state.path[index];
      if (folder) {
        state.currentFolderId = folder.id;
        state.keyword = "";
        state.path = state.path.slice(0, index + 1);
        state.selectedMaterialIds = [];
        refresh();
      }
    };

    const handleFolderClick = (folder: MaterialFolder): void => {
      state.currentFolderId = folder.id;
      state.keyword = "";
      state.path = [...state.path, folder];
      state.selectedMaterialIds = [];
      refresh();
    };

    const handleFolderDblClick = (folder: MaterialFolder): void => {
      handleFolderClick(folder);
    };

    const handleMaterialClick = (material: Material, e: MouseEvent): void => {
      if (props.mode === "multiple") {
        if (e.ctrlKey || e.metaKey) {
          const idx = state.selectedMaterialIds.indexOf(material.id);
          if (idx > -1) {
            state.selectedMaterialIds.splice(idx, 1);
          } else {
            state.selectedMaterialIds.push(material.id);
          }
        } else {
          state.selectedMaterialIds = [material.id];
        }
      } else {
        state.selectedMaterialIds = [material.id];
      }
    };

    const handleConfirm = (): void => {
      const selected = state.materials
        .filter((m) => state.selectedMaterialIds.includes(m.id))
        .map((m) => {
          let url = m.url ?? "";
          if (url && !url.startsWith("http")) {
            url = window.location.origin + url;
          }
          return { ...m, url };
        });
      emit("confirm", selected);
      emit("update:visible", false);
    };

    const handleCancel = (): void => {
      emit("cancel");
      emit("update:visible", false);
    };

    const handleUploadSuccess = (): void => {
      refresh();
    };

    const handleFolderDelete = (folder: MaterialFolder): void => {
      Modal.confirm({
        title: "确认删除",
        content: `确定删除文件夹 "${folder.name}" 吗？`,
        okText: "删除",
        okType: "danger",
        onOk: async () => {
          try {
            await cubeSiteGeneratorService.deleteMaterialFolder({ id: folder.id });
            message.success("删除成功");
            refresh();
          } catch (error) {
            message.error((error as { errorMessage: string })?.errorMessage ?? "删除失败");
          }
        },
      });
    };

    const handleMaterialDelete = (material: Material): void => {
      Modal.confirm({
        title: "确认删除",
        content: `确定删除素材 "${material.name}.${material.ext}" 吗？`,
        okText: "删除",
        okType: "danger",
        onOk: async () => {
          try {
            await cubeSiteGeneratorService.deleteMaterial({ id: material.id });
            message.success("删除成功");
            if (state.selectedMaterialIds.includes(material.id)) {
              const idx = state.selectedMaterialIds.indexOf(material.id);
              state.selectedMaterialIds.splice(idx, 1);
            }
            refresh();
          } catch (error) {
            message.error((error as { errorMessage: string })?.errorMessage ?? "删除失败");
          }
        },
      });
    };

    const footer = (): JSX.Element => (
      <div class={modalStyles["modal-footer"]}>
        <Button onClick={handleCancel}>取消</Button>
        <Button type="primary" disabled={state.selectedMaterialIds.length === 0} onClick={handleConfirm}>
          确定 ({state.selectedMaterialIds.length})
        </Button>
      </div>
    );

    return (): JSX.Element => {
      const keywordLower = state.keyword.toLowerCase();
      const filteredFolders = keywordLower ? state.folders.filter((f) => f.name.toLowerCase().includes(keywordLower)) : state.folders;
      const filteredMaterials = state.materials.filter((m) => {
        const matchesType = state.filterType === "all" || getMaterialType(m.mimeType, m.ext) === state.filterType;
        const matchesKeyword = !keywordLower || m.name.toLowerCase().includes(keywordLower) || m.ext.toLowerCase().includes(keywordLower);
        return matchesType && matchesKeyword;
      });

      return (
        <>
          <Modal
            visible={props.visible}
            title={props.title}
            width={props.width}
            footer={footer()}
            onCancel={handleCancel}
            maskClosable={false}
            destroyOnClose
            wrapClassName="material-select-draggable-wrap"
          >
            <div style={{ height: "520px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* 顶部栏 */}
              <div class={pageStyles["material-header"]}>
                <div class={pageStyles["material-header-breadcrumb"]}>
                  <MaterialBreadcrumb path={state.path} onNavigate={handleNavigate} />
                </div>
                <MaterialToolbar
                  keyword={state.keyword}
                  filterType={state.filterType}
                  selectedCount={0}
                  showActions={true}
                  showNewFolder={false}
                  showUpload={true}
                  onUpdateKeyword={(val: string) => (state.keyword = val)}
                  onUpdateFilterType={(val: MaterialType | "all") => (state.filterType = val)}
                  onNewFolder={() => {}}
                  onUpload={() => {
                    uploadModalVisible.value = true;
                  }}
                />
              </div>

              {/* 内容区域 */}
              <div class={pageStyles["material-body"]}>
                <MaterialContent
                  folders={filteredFolders}
                  materials={filteredMaterials}
                  selectedFolderIds={[]}
                  selectedMaterialIds={state.selectedMaterialIds}
                  loading={state.loading}
                  onFolderClick={handleFolderClick}
                  onFolderDblclick={handleFolderDblClick}
                  onFolderRename={() => {}}
                  onFolderDelete={handleFolderDelete}
                  onMaterialClick={handleMaterialClick}
                  onMaterialDblclick={() => {}}
                  onMaterialRename={() => {}}
                  onMaterialMove={() => {}}
                  onMaterialDelete={handleMaterialDelete}
                  onDropUpload={() => {}}
                />
              </div>
            </div>
          </Modal>
          <MaterialUploadModal v-model:visible={uploadModalVisible.value} pathId={state.currentFolderId} onSuccess={handleUploadSuccess} />
        </>
      );
    };
  },
});
