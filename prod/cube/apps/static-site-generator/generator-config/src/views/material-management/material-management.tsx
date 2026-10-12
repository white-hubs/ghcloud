// oxlint-disable complexity
import { Modal } from "ant-design-vue";
import { defineComponent, onMounted, reactive } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import { message, Modal as CubeModal } from "@ghcloud/cube-ui";

import "./components/iconify-init";
import { usePageName } from "@ghcloud/cube-utils";

import { MaterialBreadcrumb } from "./components/material-breadcrumb";
import { MaterialContent, type DroppedFile } from "./components/material-content";
import { MaterialFolderModal } from "./components/material-folder-modal";
import { MaterialMoveModal } from "./components/material-move-modal";
import { MaterialRenameModal } from "./components/material-rename-modal";
import { MaterialToolbar } from "./components/material-toolbar";
import { MaterialUploadModal } from "./components/material-upload-modal";
import { getMaterialType } from "./mock";
import type { Material, MaterialFolder, MaterialType } from "./types";
import { previewMaterial } from "./utils";
import { cubeFileService, cubeSiteGeneratorService } from "@/api/service";

import pageStyles from "./material-management.module.less";

interface State {
  currentFolderId: string | null;
  path: MaterialFolder[];
  folders: MaterialFolder[];
  materials: Material[];
  loading: boolean;
  uploading: boolean;
  keyword: string;
  filterType: MaterialType | "all";
  selectedFolderIds: string[];
  selectedMaterialIds: string[];
  uploadModalVisible: boolean;
  folderModalVisible: boolean;
  folderModalTitle: string;
  editingFolder: MaterialFolder | null;
  moveModalVisible: boolean;
  movingMaterialIds: string[];
  materialRenameVisible: boolean;
  editingMaterial: Material | null;
  imagePreviewVisible: boolean;
  imagePreviewMaterial: Material | null;
}

/** 素材管理 */
export const MaterialManagement = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();

    const state = reactive<State>({
      currentFolderId: "root",
      path: [],
      folders: [],
      materials: [],
      loading: false,
      uploading: false,
      keyword: "",
      filterType: "all",
      selectedFolderIds: [],
      selectedMaterialIds: [],
      uploadModalVisible: false,
      folderModalVisible: false,
      folderModalTitle: "新建文件夹",
      editingFolder: null,
      moveModalVisible: false,
      movingMaterialIds: [],
      materialRenameVisible: false,
      editingMaterial: null,
      imagePreviewVisible: false,
      imagePreviewMaterial: null,
    });

    const loadContent = async (): Promise<void> => {
      state.loading = true;
      try {
        const [folderRes, materialRes] = await Promise.all([
          cubeSiteGeneratorService.getMaterialFolderList(state.currentFolderId),
          cubeSiteGeneratorService.getMaterialList({ pathId: state.currentFolderId }),
        ]);
        state.folders = folderRes;
        state.materials = materialRes;
        state.selectedFolderIds = [];
        state.selectedMaterialIds = [];
      } catch {
        message.error("加载失败");
      } finally {
        state.loading = false;
      }
    };

    const refresh = async (): Promise<void> => {
      await loadContent();
    };

    onMounted(() => {
      refresh();
    });

    const handleNavigate = (index: number): void => {
      if (index === -1) {
        state.currentFolderId = "root";
        state.keyword = "";
        state.path = [];
        loadContent();
        return;
      }
      const folder = state.path[index];
      if (folder) {
        state.currentFolderId = folder.id;
        state.keyword = "";
        state.path = state.path.slice(0, index + 1);
        loadContent();
      }
    };

    const handleFolderClick = (folder: MaterialFolder, e: MouseEvent): void => {
      if (e.ctrlKey || e.metaKey) {
        const idx = state.selectedFolderIds.indexOf(folder.id);
        if (idx > -1) {
          state.selectedFolderIds.splice(idx, 1);
        } else {
          state.selectedFolderIds.push(folder.id);
        }
      } else {
        state.selectedFolderIds = [folder.id];
        state.selectedMaterialIds = [];
      }
    };

    const handleFolderDblClick = (folder: MaterialFolder): void => {
      state.currentFolderId = folder.id;
      state.keyword = "";
      state.path = [...state.path, folder];
      loadContent();
    };

    const handleMaterialClick = (material: Material, e: MouseEvent): void => {
      if (e.ctrlKey || e.metaKey) {
        const idx = state.selectedMaterialIds.indexOf(material.id);
        if (idx > -1) {
          state.selectedMaterialIds.splice(idx, 1);
        } else {
          state.selectedMaterialIds.push(material.id);
        }
      } else {
        state.selectedMaterialIds = [material.id];
        state.selectedFolderIds = [];
      }
    };

    const handleMaterialDblClick = (material: Material): void => {
      const type = getMaterialType(material.mimeType, material.ext);
      if (type === "image" && material.url) {
        state.imagePreviewMaterial = material;
        state.imagePreviewVisible = true;
        return;
      }
      previewMaterial(material);
    };

    const handleNewFolder = (): void => {
      state.editingFolder = null;
      state.folderModalTitle = "新建文件夹";
      state.folderModalVisible = true;
    };

    const handleFolderRename = (folder: MaterialFolder): void => {
      state.editingFolder = folder;
      state.folderModalTitle = "重命名文件夹";
      state.folderModalVisible = true;
    };

    const handleFolderDelete = async (folder: MaterialFolder): Promise<void> => {
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

    const handleMaterialRename = (material: Material): void => {
      state.editingMaterial = material;
      state.materialRenameVisible = true;
    };

    const handleMaterialMove = (material: Material): void => {
      state.movingMaterialIds = [material.id];
      state.moveModalVisible = true;
    };

    const handleMaterialDelete = async (material: Material): Promise<void> => {
      Modal.confirm({
        title: "确认删除",
        content: `确定删除素材 "${material.name}.${material.ext}" 吗？`,
        okText: "删除",
        okType: "danger",
        onOk: async () => {
          try {
            await cubeSiteGeneratorService.deleteMaterial({ id: material.id });
            message.success("删除成功");
            refresh();
          } catch (error) {
            message.error((error as { errorMessage: string })?.errorMessage ?? "删除失败");
          }
        },
      });
    };

    const handleBatchMove = (): void => {
      state.movingMaterialIds = state.selectedMaterialIds;
      state.moveModalVisible = true;
    };

    const handleDropUpload = async (droppedFiles: DroppedFile[]): Promise<void> => {
      state.uploading = true;
      try {
        const folderIdByFullPath = new Map<string, string>();
        const childrenByParent = new Map<string, Map<string, string>>();
        const createdFolderPaths = new Set<string>();
        let successCount = 0;
        let failCount = 0;

        const getParentKey = (parentId: string | null): string => parentId ?? "__null__";
        const loadChildren = async (parentId: string | null): Promise<Map<string, string>> => {
          const key = getParentKey(parentId);
          const cached = childrenByParent.get(key);
          if (cached) {
            return cached;
          }
          const list = await cubeSiteGeneratorService.getMaterialFolderList(parentId);
          const map = new Map<string, string>();
          for (const f of list) {
            map.set(f.name, f.id);
          }
          childrenByParent.set(key, map);
          return map;
        };
        const refreshChildren = async (parentId: string | null): Promise<Map<string, string>> => {
          childrenByParent.delete(getParentKey(parentId));
          return loadChildren(parentId);
        };

        const normalizePath = (p: string): string => p.replace(/\\/g, "/").split("/").filter(Boolean).join("/");

        const getDirParts = (relativePath: string): string[] => {
          const normalized = normalizePath(relativePath);
          const parts = normalized.split("/").filter(Boolean);
          return parts.length > 1 ? parts.slice(0, -1) : [];
        };

        const dirPathSet = new Set<string>();
        for (const { relativePath } of droppedFiles) {
          const dirParts = getDirParts(relativePath);
          for (let i = 1; i <= dirParts.length; i++) {
            dirPathSet.add(dirParts.slice(0, i).join("/"));
          }
        }
        const dirPaths = Array.from(dirPathSet).sort((a, b) => a.split("/").length - b.split("/").length);

        for (const fullPath of dirPaths) {
          const parts = fullPath.split("/").filter(Boolean);
          const name = parts[parts.length - 1];
          const parentPath = parts.slice(0, -1).join("/");
          const parentId = parentPath ? (folderIdByFullPath.get(parentPath) ?? null) : state.currentFolderId;
          if (parentPath && !folderIdByFullPath.has(parentPath)) {
            continue;
          }

          const children = await loadChildren(parentId);
          const existingId = children.get(name);
          if (existingId) {
            folderIdByFullPath.set(fullPath, existingId);
            continue;
          }

          try {
            await cubeSiteGeneratorService.addMaterialFolder({
              pathId: parentId,
              name,
              sort: 0,
            });
          } catch {}

          const updatedChildren = await refreshChildren(parentId);
          const createdId = updatedChildren.get(name);
          if (!createdId) {
            continue;
          }
          folderIdByFullPath.set(fullPath, createdId);
          createdFolderPaths.add(fullPath);
          if (createdFolderPaths.size === 1) {
            await refresh();
          }
        }

        for (const { file, relativePath } of droppedFiles) {
          const dirParts = getDirParts(relativePath);
          const dirPath = dirParts.join("/");
          const targetPathId = dirPath ? folderIdByFullPath.get(dirPath) : state.currentFolderId;
          if (dirPath && !targetPathId) {
            failCount += 1;
            continue;
          }
          try {
            const fileState = await cubeFileService.uploadFile({
              businessKey: "material",
              file,
              useTemporary: true,
              sceneCode: GLOBAL_SCENE_CODE.staticSiteGenerator,
            });
            await cubeSiteGeneratorService.addMaterial({
              pathId: targetPathId as string,
              fileId: fileState.id,
            });
            successCount += 1;
          } catch {
            failCount += 1;
          }
        }
        const folderTip = createdFolderPaths.size > 0 ? `，创建 ${createdFolderPaths.size} 个目录` : "";
        if (createdFolderPaths.size === 0 && successCount > 0) {
          await refresh();
        }
        if (successCount > 0 && failCount === 0) {
          message.success(`成功上传 ${successCount} 个文件${folderTip}`);
        } else if (successCount > 0) {
          message.warning(`上传完成：成功 ${successCount} 个，失败 ${failCount} 个${folderTip}`);
        } else {
          message.error("上传失败");
        }
      } catch (error) {
        const err = error as { errorMessage?: string; message?: string } | undefined;
        message.error(err?.errorMessage ?? err?.message ?? "上传失败");
      } finally {
        state.uploading = false;
      }
    };

    const slots = {
      "layout-content": (): JSX.Element => {
        const keywordLower = state.keyword.toLowerCase();
        const filteredFolders = keywordLower ? state.folders.filter((f) => f.name.toLowerCase().includes(keywordLower)) : state.folders;
        const filteredMaterials = state.materials.filter((m) => {
          const matchesType = state.filterType === "all" || getMaterialType(m.mimeType, m.ext) === state.filterType;
          const matchesKeyword = !keywordLower || m.name.toLowerCase().includes(keywordLower) || m.ext.toLowerCase().includes(keywordLower);
          return matchesType && matchesKeyword;
        });

        return (
          <div class={pageStyles["material-page"]}>
            {/* 顶部操作栏 */}
            <div class={pageStyles["material-header"]}>
              <div class={pageStyles["material-header-breadcrumb"]}>
                <MaterialBreadcrumb path={state.path} onNavigate={handleNavigate} />
              </div>
              <MaterialToolbar
                keyword={state.keyword}
                filterType={state.filterType}
                selectedCount={state.selectedFolderIds.length + state.selectedMaterialIds.length}
                showBatchActions={false}
                onUpdateKeyword={(val: string) => (state.keyword = val)}
                onUpdateFilterType={(val: MaterialType | "all") => (state.filterType = val)}
                onNewFolder={handleNewFolder}
                onUpload={() => (state.uploadModalVisible = true)}
                onBatchMove={handleBatchMove}
              />
            </div>

            {/* 内容区域 */}
            <div class={pageStyles["material-body"]}>
              <MaterialContent
                folders={filteredFolders}
                materials={filteredMaterials}
                selectedFolderIds={state.selectedFolderIds}
                selectedMaterialIds={state.selectedMaterialIds}
                loading={state.loading || state.uploading}
                onFolderClick={handleFolderClick}
                onFolderDblclick={handleFolderDblClick}
                onFolderRename={handleFolderRename}
                onFolderDelete={handleFolderDelete}
                onMaterialClick={handleMaterialClick}
                onMaterialDblclick={handleMaterialDblClick}
                onMaterialRename={handleMaterialRename}
                onMaterialMove={handleMaterialMove}
                onMaterialDelete={handleMaterialDelete}
                onDropUpload={handleDropUpload}
              />
            </div>

            {/* 弹窗 */}
            <MaterialUploadModal v-model:visible={state.uploadModalVisible} pathId={state.currentFolderId} onSuccess={refresh} />
            <MaterialFolderModal
              v-model:visible={state.folderModalVisible}
              title={state.folderModalTitle}
              folderId={state.editingFolder?.id ?? null}
              pathId={state.currentFolderId}
              initialName={state.editingFolder?.name ?? ""}
              initialSort={state.editingFolder?.sort ?? (state.folders.length > 0 ? Math.max(...state.folders.map((f) => f.sort)) + 1 : 1)}
              onSuccess={refresh}
            />
            <MaterialMoveModal
              v-model:visible={state.moveModalVisible}
              materialIds={state.movingMaterialIds}
              excludeFolderId={state.currentFolderId}
              onSuccess={refresh}
            />
            <MaterialRenameModal v-model:visible={state.materialRenameVisible} material={state.editingMaterial} onSuccess={refresh} />
            <CubeModal
              visible={state.imagePreviewVisible}
              title={state.imagePreviewMaterial ? `${state.imagePreviewMaterial.name}.${state.imagePreviewMaterial.ext}` : "图片预览"}
              footer={null}
              width="fit-content"
              onCancel={() => {
                state.imagePreviewVisible = false;
                state.imagePreviewMaterial = null;
              }}
            >
              {state.imagePreviewMaterial?.url ? (
                <img
                  src={state.imagePreviewMaterial.url}
                  alt={state.imagePreviewMaterial.name}
                  style={{ maxWidth: "80vw", maxHeight: "70vh", display: "block" }}
                />
              ) : null}
            </CubeModal>
          </div>
        );
      },
    };

    return (): JSX.Element => <CubeLayout title={pageTitle} v-slots={slots}></CubeLayout>;
  },
});
