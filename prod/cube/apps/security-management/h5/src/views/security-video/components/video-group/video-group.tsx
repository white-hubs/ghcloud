import { Empty, Loading, PullRefresh } from "vant";
import { computed, defineComponent, onMounted, ref } from "vue";

import type { VideoDeviceGroup, VideoGroupDevice } from "@ghcloud/cube-security-management-service";

import { VideoItem } from "../video-item/video-item";
import { cubeSecurityManagementService } from "@/api/server";

import styles from "./video-group.module.less";

interface Props {
  keyword?: string;
}

export const VideoGroup = defineComponent({
  props: ["keyword"],
  emits: ["collectChange"],
  setup: (props: Props, { expose, emit }) => {
    const loading = ref(false);
    const refreshing = ref(false);
    const dataSource = ref<VideoDeviceGroup[]>([]);
    const expandedGroupIds = ref<string[]>([]);

    const sortedGroups = computed(() => {
      return [...dataSource.value].sort((a, b) => (b.deviceCount ?? 0) - (a.deviceCount ?? 0));
    });

    const onRefresh = async (): Promise<void> => {
      try {
        loading.value = true;
        dataSource.value = [];
        const deviceName = (props.keyword ?? "").trim();
        const res = await cubeSecurityManagementService.getVideoDeviceGroupAll(deviceName ? { deviceName } : undefined);
        dataSource.value = (res ?? []).map((group) => {
          return {
            ...group,
            devices: group.devices.map((device): VideoGroupDevice => {
              return {
                ...device,
                deviceStatus: device.deviceStatus ?? device.status?.onlineState ?? false,
                product: device.product ?? device.productInfo ?? {},
                areaName: device.area?.pathName ?? "",
              } as VideoGroupDevice;
            }),
          };
        });
        if (deviceName) {
          expandedGroupIds.value = dataSource.value[0]?.id ? [dataSource.value[0].id] : [];
        }
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    };

    const toggleGroup = (groupId: string): void => {
      if (expandedGroupIds.value.includes(groupId)) {
        expandedGroupIds.value = expandedGroupIds.value.filter((id) => id !== groupId);
        return;
      }
      expandedGroupIds.value = [...expandedGroupIds.value, groupId];
    };

    onMounted(() => {
      onRefresh();
    });

    expose({
      onRefresh,
    });

    return (): JSX.Element => (
      <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles.content}>
        {loading.value && (
          <div class={styles["loading-wrap"]}>
            <Loading vertical>加载中...</Loading>
          </div>
        )}
        <div class={styles["group-list"]}>
          {sortedGroups.value.map((group) => {
            const isExpanded = expandedGroupIds.value.includes(group.id);
            return (
              <div class={styles.group} key={group.id}>
                <div
                  class={styles["group-header"]}
                  onClick={() => {
                    toggleGroup(group.id);
                  }}
                >
                  <span class={styles.title}>
                    {group.name}（{group.deviceCount ?? group.devices.length}）
                  </span>
                  <span class={`${styles.arrow} ${isExpanded ? styles.expanded : ""}`} />
                </div>
                {isExpanded && (
                  <div class={styles["group-devices"]}>
                    {group.devices.map((device) => {
                      return (
                        <VideoItem
                          key={device.id}
                          {...device}
                          onCollectChange={() => {
                            emit("collectChange");
                          }}
                        />
                      );
                    })}
                    {group.devices.length === 0 && <Empty description="当前分组暂无设备" />}
                  </div>
                )}
              </div>
            );
          })}
          {sortedGroups.value.length === 0 && !loading.value && <Empty description="暂无数据" />}
        </div>
      </PullRefresh>
    );
  },
});
