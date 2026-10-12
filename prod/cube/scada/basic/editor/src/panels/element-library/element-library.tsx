import { EditOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { registry, type ElementDef } from "@cube-scada/core";
import { Button, Collapse, CollapsePanel, Dropdown, Empty, Input, Menu, Modal, Select, Tabs, message } from "ant-design-vue";
import { computed, defineComponent, shallowRef, watch } from "vue";

import { ElementCardGrid } from "./element-card-grid";
import { deleteElementAsset, uploadElementSvg } from "./element-library-api";
import {
  ALL_ELEMENT_GROUPS,
  filterGroups,
  followRenamedElementGroup,
  groupElements,
  mergeOpenGroups,
  retainElementGroupSelection,
  selectElementGroup,
} from "./element-library-groups";
import { ImageEditModal, type ImageEditPayload } from "./image-edit-modal";
import { DEFAULT_IMAGE_GROUP, createImageElementFromFile, updateImageElementMetadata } from "./image-element";
import { ImageGroupRenameModal } from "./image-group-rename-modal";
import { ImageUploadModal, type ImageUploadPayload } from "./image-upload-modal";

type LibraryTab = "components" | "gallery";

export const ElementLibrary = defineComponent({
  name: "ElementLibrary",
  setup() {
    const activeTab = shallowRef<LibraryTab>("components");
    const searchText = shallowRef("");
    const uploadModalOpen = shallowRef(false);
    const uploading = shallowRef(false);
    const imageSaving = shallowRef(false);
    const groupRenameSaving = shallowRef(false);
    const registryRevision = shallowRef(0);
    const openComponentGroups = shallowRef<string[]>([]);
    const openImageGroups = shallowRef<string[]>([]);
    const activeImageGroup = shallowRef(ALL_ELEMENT_GROUPS);
    const editingImage = shallowRef<ElementDef | null>(null);
    const renamingGroup = shallowRef("");

    const allElements = computed(() => {
      void registryRevision.value;
      return registry.getAll();
    });
    const componentGroups = computed(() =>
      groupElements(
        allElements.value.filter((item) => item.assetKind !== "image"),
        (item) => item.category,
      ),
    );
    const imageGroups = computed(() =>
      groupElements(
        allElements.value.filter((item) => item.assetKind === "image"),
        (item) => item.assetGroup || item.category || "未分组",
      ),
    );
    const visibleComponentGroups = computed(() => filterGroups(componentGroups.value, searchText.value));
    const selectedImageGroups = computed(() => selectElementGroup(imageGroups.value, activeImageGroup.value));
    const visibleImageGroups = computed(() => filterGroups(selectedImageGroups.value, searchText.value));
    const existingImageGroups = computed(() => Object.keys(imageGroups.value));
    const imageGroupOptions = computed(() => [
      { value: ALL_ELEMENT_GROUPS, label: `全部分组 (${allElements.value.filter((item) => item.assetKind === "image").length})` },
      ...Object.entries(imageGroups.value).map(([group, elements]) => ({ value: group, label: `${group} (${elements.length})` })),
    ]);

    watch(
      () => Object.keys(componentGroups.value),
      (keys, previousKeys = []) => {
        openComponentGroups.value = mergeOpenGroups(openComponentGroups.value, keys, previousKeys);
      },
      { immediate: true },
    );
    watch(
      () => Object.keys(imageGroups.value),
      (keys, previousKeys = []) => {
        openImageGroups.value = mergeOpenGroups(openImageGroups.value, keys, previousKeys);
        activeImageGroup.value = retainElementGroupSelection(activeImageGroup.value, keys);
      },
      { immediate: true },
    );

    async function uploadImage(payload: ImageUploadPayload): Promise<void> {
      uploading.value = true;
      try {
        const asset = await createImageElementFromFile(payload.file, payload);
        await uploadElementSvg(asset.svgContent);
        await registry.registerFromSvg(asset.svgContent);
        registryRevision.value += 1;
        openImageGroups.value = Array.from(new Set([...openImageGroups.value, asset.group]));
        activeImageGroup.value = asset.group;
        searchText.value = "";
        uploadModalOpen.value = false;
        void message.success(`图片“${asset.label}”已上传到“${asset.group}”`);
      } catch (error) {
        void message.error(error instanceof Error ? error.message : "图片上传失败，请重试");
      } finally {
        uploading.value = false;
      }
    }

    function openUploadModal(): void {
      activeTab.value = "gallery";
      uploadModalOpen.value = true;
    }

    function switchImageGroup(group: string): void {
      activeImageGroup.value = group;
      searchText.value = "";
      if (group !== ALL_ELEMENT_GROUPS) {
        openImageGroups.value = Array.from(new Set([...openImageGroups.value, group]));
      }
    }

    function openImageEditModal(element: ElementDef): void {
      editingImage.value = element;
    }

    async function deleteImage(element: ElementDef): Promise<void> {
      try {
        await deleteElementAsset(element.type);
        registry.unregister(element.type);
        registryRevision.value += 1;
        void message.success(`图片“${element.label}”已删除`);
      } catch (error) {
        void message.error(error instanceof Error ? error.message : "删除图片失败，请重试");
        throw error;
      }
    }

    function confirmDeleteImage(element: ElementDef): void {
      Modal.confirm({
        title: `确认删除图片“${element.label}”？`,
        content: "删除后不可恢复，已使用该图片的组态可能无法正常显示。",
        okText: "删除",
        okType: "danger",
        cancelText: "取消",
        onOk: () => deleteImage(element),
      });
    }

    async function saveImage(payload: ImageEditPayload): Promise<void> {
      const image = editingImage.value;
      if (!image) return;

      const updated = updateImageElementMetadata(image.svgContent, payload);
      const currentGroup = image.assetGroup || image.category || DEFAULT_IMAGE_GROUP;
      if (updated.label === image.label && updated.group === currentGroup) {
        editingImage.value = null;
        return;
      }

      imageSaving.value = true;
      try {
        await uploadElementSvg(updated.svgContent, "修改图片失败");
        await registry.registerFromSvg(updated.svgContent);
        registryRevision.value += 1;
        openImageGroups.value = Array.from(new Set([...openImageGroups.value, updated.group]));
        editingImage.value = null;
        searchText.value = "";
        void message.success(`图片已更新为“${updated.label}”，分组“${updated.group}”`);
      } catch (error) {
        void message.error(error instanceof Error ? error.message : "修改图片失败，请重试");
      } finally {
        imageSaving.value = false;
      }
    }

    async function renameImageGroup(groupName: string): Promise<void> {
      const sourceGroup = renamingGroup.value;
      const targetGroup = groupName.trim();
      if (!sourceGroup || !targetGroup) {
        return;
      }
      if (sourceGroup === targetGroup) {
        renamingGroup.value = "";
        return;
      }

      const images = imageGroups.value[sourceGroup] ?? [];
      if (images.length === 0) {
        renamingGroup.value = "";
        return;
      }

      groupRenameSaving.value = true;
      try {
        const updates = images.map((image) =>
          updateImageElementMetadata(image.svgContent, {
            label: image.label,
            group: targetGroup,
          }),
        );
        await Promise.all(updates.map((updated) => uploadElementSvg(updated.svgContent, "重命名分组失败")));
        await Promise.all(updates.map((updated) => registry.registerFromSvg(updated.svgContent)));

        activeImageGroup.value = followRenamedElementGroup(activeImageGroup.value, sourceGroup, targetGroup);
        openImageGroups.value = [...new Set([...openImageGroups.value.filter((group) => group !== sourceGroup), targetGroup])];
        registryRevision.value += 1;
        renamingGroup.value = "";
        searchText.value = "";
        void message.success(`分组“${sourceGroup}”已重命名为“${targetGroup}”`);
      } catch (error) {
        void message.error(error instanceof Error ? error.message : "重命名分组失败，请重试");
      } finally {
        groupRenameSaving.value = false;
      }
    }

    function renderGroupHeader(group: string, count: number) {
      const header = (
        <span style={{ display: "block", width: "100%" }} title={activeTab.value === "gallery" ? "右键重命名分组" : undefined}>
          {group} ({count})
        </span>
      );
      if (activeTab.value !== "gallery") {
        return header;
      }

      return (
        <Dropdown
          trigger={["contextmenu"]}
          overlay={
            <Menu
              items={[
                {
                  key: "rename",
                  icon: <EditOutlined />,
                  label: "重命名分组",
                  onClick: () => (renamingGroup.value = group),
                },
              ]}
            />
          }
        >
          {header}
        </Dropdown>
      );
    }

    return () => {
      const groups = activeTab.value === "components" ? visibleComponentGroups.value : visibleImageGroups.value;
      const activeGroups = activeTab.value === "components" ? openComponentGroups.value : openImageGroups.value;

      return (
        <div style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div
            style={{
              height: "44px",
              padding: "0 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #f0f0f0",
              flexShrink: 0,
            }}
          >
            <strong>组件库</strong>
            <Button type="primary" size="small" onClick={openUploadModal}>
              <PlusOutlined /> 上传图片
            </Button>
          </div>

          <Tabs
            size="small"
            activeKey={activeTab.value}
            onChange={(key) => {
              activeTab.value = String(key) as LibraryTab;
              searchText.value = "";
            }}
            style={{ padding: "0 12px", flexShrink: 0 }}
          >
            <Tabs.TabPane key="components" tab="内置组件" />
            <Tabs.TabPane key="gallery" tab={`图库 (${allElements.value.filter((item) => item.assetKind === "image").length})`} />
          </Tabs>

          <div style={{ padding: "0 12px 8px", flexShrink: 0, display: "flex", gap: "8px" }}>
            {activeTab.value === "gallery" ? (
              <Select
                value={activeImageGroup.value}
                options={imageGroupOptions.value}
                style={{ width: "132px", flexShrink: 0 }}
                onChange={(value) => switchImageGroup(String(value))}
              />
            ) : null}
            <Input.Search
              placeholder={activeTab.value === "components" ? "搜索组件..." : "搜索图片或分组..."}
              value={searchText.value}
              allowClear
              style={{ flex: 1, minWidth: 0 }}
              onChange={(event: any) => (searchText.value = event.target?.value ?? "")}
            />
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            {Object.keys(groups).length > 0 ? (
              <Collapse
                bordered={false}
                activeKey={activeGroups}
                style={{ background: "transparent" }}
                onChange={(keys) => {
                  const nextKeys = (Array.isArray(keys) ? keys : [keys]).map(String);
                  if (activeTab.value === "components") openComponentGroups.value = nextKeys;
                  else openImageGroups.value = nextKeys;
                }}
              >
                {Object.entries(groups).map(([group, elements]) => (
                  <CollapsePanel key={group} header={renderGroupHeader(group, elements.length)}>
                    <ElementCardGrid elements={elements} onEditImage={openImageEditModal} onDeleteImage={confirmDeleteImage} />
                  </CollapsePanel>
                ))}
              </Collapse>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  searchText.value ? "没有匹配内容" : activeTab.value === "gallery" ? "暂无自定义图片，点击右上角上传" : "暂无组件"
                }
                style={{ marginTop: "48px" }}
              />
            )}
          </div>

          <ImageUploadModal
            open={uploadModalOpen.value}
            uploading={uploading.value}
            groups={existingImageGroups.value}
            onCancel={() => (uploadModalOpen.value = false)}
            onSubmit={uploadImage}
          />
          <ImageEditModal
            open={Boolean(editingImage.value)}
            saving={imageSaving.value}
            currentLabel={editingImage.value?.label ?? ""}
            currentGroup={editingImage.value?.assetGroup || editingImage.value?.category || DEFAULT_IMAGE_GROUP}
            groups={existingImageGroups.value}
            onCancel={() => {
              if (!imageSaving.value) editingImage.value = null;
            }}
            onSubmit={saveImage}
          />
          <ImageGroupRenameModal
            open={Boolean(renamingGroup.value)}
            saving={groupRenameSaving.value}
            currentGroup={renamingGroup.value}
            onCancel={() => {
              if (!groupRenameSaving.value) {
                renamingGroup.value = "";
              }
            }}
            onSubmit={renameImageGroup}
          />
        </div>
      );
    };
  },
});
