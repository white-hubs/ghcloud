import { Empty, Loading, showToast } from "vant";
import { computed, defineComponent, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";

import { useMetaTitle } from "../hooks/use-meta-title-hook";
import { UnifiedEvacuationMap, type EvacuationMapExpose } from "./components/unified-evacuation-map";
import { useEvacuationGuide } from "./use-evacuation-guide";
import type { AreaTreeItem, RouteTrafficStatus } from "@/utils/types";

import styles from "./evacuation-guide.module.less";

function statusClass(status: RouteTrafficStatus): string {
  if (status === "畅通") return styles.clear;
  if (status === "拥挤") return styles.crowded;
  if (status === "阻断" || status === "已禁用") return styles.blocked;
  return styles.crowded;
}

function AreaTreeNodes(props: {
  nodes: AreaTreeItem[];
  selectedId: string | null;
  fireAreaId: string | null;
  depth?: number;
  onSelect: (id: string) => void;
}): JSX.Element {
  const depth = props.depth ?? 0;
  return (
    <>
      {props.nodes.map((node) => (
        <div key={node.id}>
          <div
            class={[styles.locTreeItem, depth > 0 && styles.locTreeChild, props.selectedId === node.id && styles.locTreeSelected]}
            onClick={(e: Event) => {
              e.stopPropagation();
              props.onSelect(node.id);
            }}
          >
            {props.fireAreaId === node.id ? "🔥 " : "📍 "}
            {node.name}
          </div>
          {node.children.length > 0 && (
            <AreaTreeNodes
              nodes={node.children}
              selectedId={props.selectedId}
              fireAreaId={props.fireAreaId}
              depth={depth + 1}
              onSelect={props.onSelect}
            />
          )}
        </div>
      ))}
    </>
  );
}

export const EvacuationGuide = defineComponent({
  name: "EvacuationGuide",
  setup: () => {
    useMetaTitle();
    const route = useRoute();
    const alarmId = () => route.query.id as string | undefined;

    const {
      loading,
      areaLoading,
      event,
      routes,
      visibleRoutes,
      floorPlan,
      planImageFile,
      planImageUrl,
      planTransform,
      areaTree,
      selectedAreaId,
      fireAreaId,
      selectedAreaName,
      firePoint,
      userPoint,
      locating,
      bindMapRef,
      handleMapReady,
      selectArea,
      resetToFireArea,
      refreshUserLocation,
    } = useEvacuationGuide(alarmId);

    const locPanelOpen = ref(false);
    const locWrapRef = ref<HTMLDivElement | null>(null);

    const headerTitle = computed(() => {
      if (!event.value) return "疏散指引";
      return `${event.value.type} - 请立即疏散`;
    });

    const headerSub = computed(() => {
      if (!event.value) return "";
      return `${selectedAreaName.value} · ${event.value.location}`;
    });

    const toggleLocPanel = (): void => {
      locPanelOpen.value = !locPanelOpen.value;
    };

    const closeLocPanel = (): void => {
      locPanelOpen.value = false;
    };

    const handleSelectArea = (id: string): void => {
      selectArea(id);
      closeLocPanel();
      showToast(`已切换至：${findAreaName(areaTree.value, id)}`);
    };

    const handleResetLoc = (): void => {
      resetToFireArea();
      closeLocPanel();
      showToast("已重置为报警区域");
    };

    function findAreaName(nodes: AreaTreeItem[], id: string): string {
      for (const n of nodes) {
        if (n.id === id) return n.name;
        const child = findAreaName(n.children, id);
        if (child) return child;
      }
      return selectedAreaName.value;
    }

    const onDocClick = (e: MouseEvent): void => {
      if (!locWrapRef.value?.contains(e.target as Node)) {
        closeLocPanel();
      }
    };

    onMounted(() => {
      document.addEventListener("click", onDocClick);
    });

    onUnmounted(() => {
      document.removeEventListener("click", onDocClick);
    });

    return (): JSX.Element => {
      if (loading.value) {
        return (
          <div class={styles.loadingWrap}>
            <Loading size="24px" vertical>
              加载中...
            </Loading>
          </div>
        );
      }

      if (!event.value) {
        return (
          <div class={styles.page}>
            <CubeNavBar showBack title="疏散指引" />
            <Empty description="未找到报警记录" />
          </div>
        );
      }

      return (
        <div class={styles.page}>
          <CubeNavBar showBack title="疏散指引" />
          <div class={styles.appContainer}>
            <div class={styles.emergencyHeader}>
              <span class={styles.alertIcon}>{event.value.icon}</span>
              <h1>{headerTitle.value}</h1>
              <p class={styles.sub}>{headerSub.value}</p>
              <div class={styles.locWrap} ref={locWrapRef}>
                <div
                  class={styles.locSelector}
                  onClick={(e: Event) => {
                    e.stopPropagation();
                    toggleLocPanel();
                  }}
                >
                  📍 {selectedAreaName.value} <span class={styles.locArrow}>▼</span>
                </div>
                {locPanelOpen.value && (
                  <div
                    class={styles.locPanel}
                    onClick={(e: Event) => {
                      e.stopPropagation();
                    }}
                  >
                    <div class={styles.locPanelTitle}>切换查看位置</div>
                    {areaLoading.value ? <div class={styles.locPanelLoading}>加载中…</div> : null}
                    {areaTree.value.length === 0 && !areaLoading.value ? (
                      <div class={styles.locPanelEmpty}>暂无区域</div>
                    ) : (
                      <AreaTreeNodes
                        nodes={areaTree.value}
                        selectedId={selectedAreaId.value}
                        fireAreaId={fireAreaId.value}
                        onSelect={handleSelectArea}
                      />
                    )}
                    <div class={styles.locPanelReset}>
                      <button type="button" onClick={handleResetLoc}>
                        ↩ 重置为报警区域
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div class={styles.mapSection}>
              <div class={styles.sectionHeadRow}>
                <span>🗺️ 疏散地图</span>
                <span class={styles.legend}>🟢畅通 🟡拥挤 🔴阻断</span>
              </div>
              <UnifiedEvacuationMap
                key={event.value.id}
                ref={(el: EvacuationMapExpose | null) => {
                  bindMapRef(el);
                }}
                onMapReady={handleMapReady}
                floorPlan={floorPlan.value}
                planImageFile={planImageFile.value}
                planImageUrl={planImageUrl.value}
                planTransform={planTransform.value}
                routes={visibleRoutes.value}
                firePoint={firePoint.value}
                userPoint={userPoint.value}
                areaLoading={areaLoading.value}
              />
              <div class={styles.routeListWrap}>
                <div class={styles.sectionTitle}>📋 疏散路线</div>
                {visibleRoutes.value.length === 0 ? (
                  <Empty description="暂无疏散路线" imageSize={60} />
                ) : (
                  visibleRoutes.value.map((routeItem) => (
                    <div key={routeItem.id} class={styles.routeInfoCard}>
                      <div class={styles.routeDot} style={{ background: routeItem.color }} />
                      <div class={styles.routeMeta}>
                        <div class={styles.routeName}>{routeItem.name}</div>
                        <div class={styles.routeCapacity}>{routeItem.capacity}人/分钟</div>
                      </div>
                      <span class={[styles.statusBadge, statusClass(routeItem.trafficStatus)]}>{routeItem.trafficStatus}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div class={styles.bottomSpacer} />
            <div class={styles.sosBar}>
              <button
                type="button"
                class={styles.btnRefresh}
                disabled={locating.value}
                onClick={() => {
                  void refreshUserLocation();
                }}
              >
                {locating.value ? "定位中..." : "🔄 刷新位置"}
              </button>
            </div>
          </div>
        </div>
      );
    };
  },
});
