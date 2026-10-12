import type { Material, MaterialFolder } from "../types";
import styles from "./material-content.module.less";
import { MaterialFileCard } from "./material-file-card";
import { MaterialFolderCard } from "./material-folder-card";
import { Empty, Spin, message } from "@ghcloud/cube-ui";
import { defineComponent, ref, type PropType } from "vue";

export interface DroppedFile {
  file: File;
  relativePath: string;
}

interface WebkitEntryReader {
  readEntries: (success: (entries: WebkitEntry[]) => void, error?: (err: unknown) => void) => void;
}

interface WebkitEntry {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  file: (success: (file: File) => void, error?: (err: unknown) => void) => void;
  createReader: () => WebkitEntryReader;
}

async function walkEntry(entry: WebkitEntry, prefix: string): Promise<DroppedFile[]> {
  if (entry.isFile) {
    const file = await new Promise<File | null>((resolve) => {
      entry.file(
        (f) => resolve(f),
        () => resolve(null),
      );
    });
    if (!file) {
      return [];
    }
    return [{ file, relativePath: `${prefix}${file.name}` }];
  }

  if (!entry.isDirectory) {
    return [];
  }

  const reader = entry.createReader();
  const dirPrefix = `${prefix}${entry.name}/`;
  const result: DroppedFile[] = [];

  while (true) {
    const entries = await new Promise<WebkitEntry[]>((resolve) => {
      reader.readEntries(
        (es) => resolve(es ?? []),
        () => resolve([]),
      );
    });
    if (entries.length === 0) {
      break;
    }
    for (const child of entries) {
      result.push(...(await walkEntry(child, dirPrefix)));
    }
  }

  return result;
}

async function extractDroppedFiles(e: DragEvent): Promise<DroppedFile[]> {
  const dt = e.dataTransfer;
  const items = dt?.items;
  if (items && items.length > 0) {
    const result: DroppedFile[] = [];
    for (const item of Array.from(items)) {
      const entry = (item as unknown as { webkitGetAsEntry?: () => WebkitEntry | null }).webkitGetAsEntry?.();
      if (entry) {
        result.push(...(await walkEntry(entry, "")));
        continue;
      }
      const file = item.getAsFile();
      if (file) {
        result.push({ file, relativePath: file.name });
      }
    }
    if (result.length > 0) {
      return result;
    }
  }

  const files = dt?.files;
  if (files && files.length > 0) {
    return Array.from(files).map((file) => ({ file, relativePath: file.name }));
  }
  return [];
}

export const MaterialContent = defineComponent({
  props: {
    folders: {
      type: Array as PropType<MaterialFolder[]>,
      default: () => [],
    },
    materials: {
      type: Array as PropType<Material[]>,
      default: () => [],
    },
    selectedFolderIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    selectedMaterialIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    "folderClick",
    "folderDblclick",
    "folderRename",
    "folderDelete",
    "materialClick",
    "materialDblclick",
    "materialRename",
    "materialMove",
    "materialDelete",
    "dropUpload",
  ],
  setup(props, { emit }) {
    const dragOver = ref(false);
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent): void => {
      e.preventDefault();
      dragCounter += 1;
      dragOver.value = true;
    };

    const handleDragLeave = (e: DragEvent): void => {
      e.preventDefault();
      dragCounter -= 1;
      if (dragCounter <= 0) {
        dragCounter = 0;
        dragOver.value = false;
      }
    };

    const handleDragOver = (e: DragEvent): void => {
      e.preventDefault();
    };

    const handleDrop = async (e: DragEvent): Promise<void> => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter = 0;
      dragOver.value = false;
      const hide = message.loading("正在解析拖拽内容...", 0);
      const droppedFiles = await extractDroppedFiles(e);
      hide();
      if (droppedFiles.length > 0) {
        emit("dropUpload", droppedFiles);
        return;
      }
      message.warning("未检测到可上传文件");
    };

    return (): JSX.Element => {
      const hasContent = props.folders.length > 0 || props.materials.length > 0;
      return (
        <div
          class={[styles["content-wrapper"], dragOver.value ? styles["drag-over"] : ""]}
          onDragenter={handleDragEnter}
          onDragleave={handleDragLeave}
          onDragover={handleDragOver}
          onDrop={handleDrop}
        >
          <Spin spinning={props.loading}>
            {hasContent ? (
              <div>
                {props.folders.length > 0 && (
                  <div class={styles["section-divider"]}>
                    <div class={styles["section-title"]}>文件夹 ({props.folders.length})</div>
                    <div class={styles["folder-grid"]}>
                      {props.folders.map((folder) => (
                        <MaterialFolderCard
                          key={folder.id}
                          folder={folder}
                          selected={props.selectedFolderIds.includes(folder.id)}
                          onClick={(e: MouseEvent) => emit("folderClick", folder, e)}
                          onDblclick={() => emit("folderDblclick", folder)}
                          onRename={() => emit("folderRename", folder)}
                          onDelete={() => emit("folderDelete", folder)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {props.materials.length > 0 && (
                  <div>
                    <div class={styles["section-title"]}>素材 ({props.materials.length})</div>
                    <div class={styles["file-grid"]}>
                      {props.materials.map((material) => (
                        <MaterialFileCard
                          key={material.id}
                          material={material}
                          selected={props.selectedMaterialIds.includes(material.id)}
                          onClick={(e: MouseEvent) => emit("materialClick", material, e)}
                          onDblclick={() => emit("materialDblclick", material)}
                          onRename={() => emit("materialRename", material)}
                          onMove={() => emit("materialMove", material)}
                          onDelete={() => emit("materialDelete", material)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div class={styles["content-empty"]}>
                <Empty description="暂无内容，可拖拽文件到此处上传" />
              </div>
            )}
          </Spin>
        </div>
      );
    };
  },
});
