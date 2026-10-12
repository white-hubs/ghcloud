import { computed, defineComponent, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from "vue";

import { apiProxy, useCubeModal } from "@ghcloud/cube-app-design";
import type { FirePointRecord } from "@ghcloud/cube-service-interface/fire-management";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { configFirePointDevices, getAreaPlaneMap, listFirePoints } from "@ghcloud/cube-services-client/fire-management.client";
import { Button, InputSearch, PopConfirm, Spin, Tree, message } from "@ghcloud/cube-ui";

import type { AreaTreeNode } from "../fire-config-management.model";

import styles from "../fire-config-management.module.less";

type EditableFirePoint = FirePointRecord & { _isModified?: boolean };

const getPointName = (point: FirePointRecord): string => point.pointName || point.name || "--";

const filterTree = (nodes: AreaTreeNode[], keyword: string): AreaTreeNode[] => {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return nodes;
  return nodes.flatMap((node) => {
    const children = filterTree(node.children ?? [], normalizedKeyword);
    if (node.name.toLowerCase().includes(normalizedKeyword) || children.length > 0) {
      return [{ ...node, children }];
    }
    return [];
  });
};

const findFirstLeaf = (nodes: AreaTreeNode[]): AreaTreeNode | undefined => {
  for (const node of nodes) {
    if (!node.children?.length) return node;
    const leaf = findFirstLeaf(node.children);
    if (leaf) return leaf;
  }
  return undefined;
};

const getFullPathName = (nodes: AreaTreeNode[], id: string, path = ""): string | undefined => {
  for (const node of nodes) {
    const currentPath = path ? `${path}-${node.name}` : node.name;
    if (node.id === id) return currentPath;
    const childPath = getFullPathName(node.children ?? [], id, currentPath);
    if (childPath) return childPath;
  }
  return undefined;
};

export const PointLocationBindingModal = defineComponent({
  name: "PointLocationBindingModal",
  props: {
    hostId: { type: String, required: true },
    hostName: { type: String, required: true },
  },
  emits: ["saved"],
  setup: (props, { emit, expose }) => {
    const selectedAreaId = shallowRef("");
    const selectedAreaName = shallowRef("");
    const selectedTreeKeys = ref<string[]>([]);
    const areaTree = ref<AreaTreeNode[]>([]);
    const areaKeyword = shallowRef("");
    const allPoints = ref<EditableFirePoint[]>([]);
    const currentMapImage = shallowRef("");
    const mapLoading = shallowRef(false);
    const saving = shallowRef(false);
    const imageFrameRef = ref<HTMLElement | null>(null);
    const imageRef = ref<HTMLImageElement | null>(null);
    const imageRect = ref({ left: 0, top: 0, width: 0, height: 0 });
    let imageResizeObserver: ResizeObserver | null = null;

    const filteredAreaTree = computed(() => filterTree(areaTree.value, areaKeyword.value));
    const placedPoints = computed(() =>
      allPoints.value.filter((point) => {
        const location = point.location ?? point.locationName ?? "";
        const locationParts = location.split("-");
        const leafName = locationParts.at(-1) ?? "";
        if (selectedAreaName.value && leafName !== selectedAreaName.value && location !== selectedAreaName.value) {
          return false;
        }
        const x = point.coordinateX ?? point.posX;
        const y = point.coordinateY ?? point.posY;
        return x !== undefined && x !== null && x !== "" && y !== undefined && y !== null && y !== "";
      }),
    );
    const unplacedPoints = computed(() =>
      allPoints.value.filter((point) => {
        const x = point.coordinateX ?? point.posX;
        const y = point.coordinateY ?? point.posY;
        return (x === undefined || x === null || x === "") && (y === undefined || y === null || y === "");
      }),
    );

    const updateImageRect = (): void => {
      const frame = imageFrameRef.value;
      const image = imageRef.value;
      if (!frame || !image?.naturalWidth || !image.naturalHeight || !frame.clientWidth || !frame.clientHeight) {
        imageRect.value = { left: 0, top: 0, width: 0, height: 0 };
        return;
      }
      const naturalRatio = image.naturalWidth / image.naturalHeight;
      const frameRatio = frame.clientWidth / frame.clientHeight;
      const width = naturalRatio > frameRatio ? frame.clientWidth : frame.clientHeight * naturalRatio;
      const height = naturalRatio > frameRatio ? frame.clientWidth / naturalRatio : frame.clientHeight;
      imageRect.value = {
        left: (frame.clientWidth - width) / 2,
        top: (frame.clientHeight - height) / 2,
        width,
        height,
      };
    };

    const loadAreaTree = async (): Promise<void> => {
      try {
        const response = await apiProxy.cubeMdataServiceProxy.getAreaTree();
        const mapNode = (node: Record<string, any>): AreaTreeNode => ({
          id: String(node.id),
          name: String(node.aliasName || node.name || ""),
          ...(node.aliasName ? { aliasName: String(node.aliasName) } : {}),
          children: (node.children ?? []).map((child: Record<string, any>) => mapNode(child)),
        });
        areaTree.value = (response ?? []).map((node: Record<string, any>) => mapNode(node));
        const firstLeaf = findFirstLeaf(areaTree.value);
        if (firstLeaf && !selectedAreaId.value) {
          selectedAreaId.value = firstLeaf.id;
          selectedAreaName.value = firstLeaf.name;
          selectedTreeKeys.value = [firstLeaf.id];
        }
      } catch (error) {
        message.error((error as Error).message || "加载位置树资源失败");
      }
    };

    const loadPoints = async (): Promise<void> => {
      try {
        const page = await useAuthRequest(() => listFirePoints({ hostId: props.hostId, pageSize: 500 }));
        allPoints.value = (page.records ?? []).map((point) => ({ ...point }));
      } catch (error) {
        message.error((error as Error).message || "加载点位失败");
      }
    };

    watch(
      selectedAreaId,
      async (areaId) => {
        if (!areaId) {
          currentMapImage.value = "";
          imageRect.value = { left: 0, top: 0, width: 0, height: 0 };
          return;
        }
        mapLoading.value = true;
        try {
          const maps = await useAuthRequest(() => getAreaPlaneMap(areaId));
          const file = maps?.[0]?.file;
          currentMapImage.value = file?.endpointPath?.trim() || file?.path?.trim() || "";
        } catch {
          currentMapImage.value = "";
        } finally {
          mapLoading.value = false;
          await nextTick();
          updateImageRect();
        }
      },
      { immediate: true },
    );

    const handleDrop = (event: DragEvent): void => {
      event.preventDefault();
      const pointId = event.dataTransfer?.getData("text/plain");
      const frame = imageFrameRef.value;
      if (!pointId || !frame || !imageRect.value.width || !imageRect.value.height) return;
      const frameRect = frame.getBoundingClientRect();
      const x = event.clientX - frameRect.left - imageRect.value.left;
      const y = event.clientY - frameRect.top - imageRect.value.top;
      if (x < 0 || y < 0 || x > imageRect.value.width || y > imageRect.value.height) {
        message.warning("请将点位拖拽到平面图图片范围内");
        return;
      }
      const point = allPoints.value.find((item) => String(item.id) === pointId);
      if (!point) return;
      Object.assign(point, {
        coordinateX: String(Math.round((x / imageRect.value.width) * 100)),
        coordinateY: String(Math.round((y / imageRect.value.height) * 100)),
        location: getFullPathName(areaTree.value, selectedAreaId.value) || selectedAreaName.value,
        _isModified: true,
      });
      allPoints.value = [...allPoints.value];
      message.success(`点位 ${getPointName(point)} 已放置，请点击保存配置生效`);
    };

    const removeCoordinates = (point: EditableFirePoint): void => {
      delete point.coordinateX;
      delete point.coordinateY;
      point._isModified = true;
      allPoints.value = [...allPoints.value];
      message.success("已解除该点位坐标，请点击保存配置生效");
    };

    const saveConfiguration = async (): Promise<void> => {
      const changedPoints = allPoints.value.filter((point) => point._isModified);
      if (changedPoints.length === 0) {
        modalApi.close();
        return;
      }
      saving.value = true;
      try {
        await useAuthRequest(() =>
          configFirePointDevices(
            changedPoints.map((point) => ({
              id: point.id,
              coordinateX: point.coordinateX ?? "",
              coordinateY: point.coordinateY ?? "",
              ...(point.location || point.locationName ? { location: point.location || point.locationName } : {}),
            })),
          ),
        );
        modalApi.close();
        emit("saved");
        message.success("平面图坐标绑定已保存");
      } catch (error) {
        message.error((error as Error).message || "保存点位配置失败");
      } finally {
        saving.value = false;
      }
    };

    const [LocationModal, modalApi] = useCubeModal({
      title: `位置绑定 — ${props.hostName}`,
      width: "1120px",
      centered: true,
      closeOnClickModal: false,
      footer: false,
      onClosed: () => {
        areaKeyword.value = "";
        saving.value = false;
      },
    });

    const openModal = (): void => {
      void Promise.all([loadAreaTree(), loadPoints()]);
      modalApi.open();
      void nextTick().then(() => {
        imageResizeObserver?.disconnect();
        imageResizeObserver = new ResizeObserver(updateImageRect);
        if (imageFrameRef.value) imageResizeObserver.observe(imageFrameRef.value);
        updateImageRect();
      });
    };

    expose({ openModal });

    onMounted(() => {
      window.addEventListener("resize", updateImageRect);
    });
    onUnmounted(() => {
      imageResizeObserver?.disconnect();
      window.removeEventListener("resize", updateImageRect);
    });

    return () => (
      <LocationModal
        v-slots={{
          default: () => (
            <div>
              <div class={styles["location-modal-toolbar"]}>
                <span class={styles["location-current-area"]}>
                  当前区域：<strong>{selectedAreaName.value || "请选择区域"}</strong>
                </span>
                <span class={styles["location-toolbar-tip"]}>从右侧拖拽未绑定点位到平面图中完成坐标定位。</span>
                <Button type="primary" loading={saving.value} onClick={() => void saveConfiguration()}>
                  <i class="fas fa-save" style={{ marginRight: "6px" }} />
                  保存配置
                </Button>
              </div>
              <div class={styles["location-workspace"]}>
                <aside class={styles["location-tree-panel"]}>
                  <strong>位置树资源</strong>
                  <InputSearch
                    value={areaKeyword.value}
                    placeholder="搜索区域"
                    allowClear
                    size="small"
                    onUpdate:value={(value: string) => (areaKeyword.value = value)}
                  />
                  <div class={styles["location-tree-scroll"]}>
                    <Tree
                      treeData={filteredAreaTree.value}
                      fieldNames={{ title: "name", key: "id", children: "children" }}
                      selectedKeys={selectedTreeKeys.value}
                      onSelect={(keys: Array<string | number>, event: Record<string, any>) => {
                        const areaId = String(keys[0] ?? "");
                        if (!areaId) return;
                        selectedAreaId.value = areaId;
                        selectedAreaName.value = String(event.node?.dataRef?.name || event.node?.title || event.node?.name || "");
                        selectedTreeKeys.value = [areaId];
                      }}
                    />
                  </div>
                </aside>
                <main class={styles["location-canvas"]} onDragover={(event) => event.preventDefault()} onDrop={handleDrop}>
                  <div class={styles["location-image-frame"]} ref={imageFrameRef}>
                    <Spin spinning={mapLoading.value}>
                      {currentMapImage.value ? (
                        <img
                          ref={imageRef}
                          src={currentMapImage.value}
                          alt="区域平面图"
                          class={styles["location-map-image"]}
                          onLoad={() => {
                            updateImageRect();
                            imageResizeObserver?.disconnect();
                            if (imageFrameRef.value) imageResizeObserver?.observe(imageFrameRef.value);
                          }}
                        />
                      ) : (
                        <div class={styles["location-empty-map"]}>该区域暂未配置平面图</div>
                      )}
                    </Spin>
                    {placedPoints.value.map((point) => (
                      <PopConfirm
                        key={point.id}
                        title={`确认解除“${getPointName(point)}”的坐标绑定吗？`}
                        onConfirm={() => removeCoordinates(point)}
                      >
                        <div
                          class={styles["location-point-marker"]}
                          draggable="true"
                          style={{
                            left: `${imageRect.value.left + (Number(point.coordinateX ?? point.posX) / 100) * imageRect.value.width}px`,
                            top: `${imageRect.value.top + (Number(point.coordinateY ?? point.posY) / 100) * imageRect.value.height}px`,
                          }}
                          title={`${getPointName(point)}（可拖拽调整位置，点击解除坐标）`}
                          onDragstart={(event) => {
                            event.dataTransfer?.setData("text/plain", String(point.id));
                            if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
                          }}
                        >
                          <i />
                          <span>{getPointName(point)}</span>
                        </div>
                      </PopConfirm>
                    ))}
                  </div>
                </main>
                <aside class={styles["location-point-panel"]}>
                  <strong>未绑定点位（{unplacedPoints.value.length}）</strong>
                  <div class={styles["location-point-scroll"]}>
                    {unplacedPoints.value.map((point) => (
                      <div
                        key={point.id}
                        class={styles["location-point-card"]}
                        draggable="true"
                        onDragstart={(event) => event.dataTransfer?.setData("text/plain", String(point.id))}
                      >
                        <span>{getPointName(point)}</span>
                        <small>{point.code || point.pointCode || "--"}</small>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </div>
          ),
        }}
      />
    );
  },
});
