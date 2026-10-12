import { Empty, List, Loading, PullRefresh } from "vant";
import { defineComponent, reactive, ref } from "vue";

import type { MultipleVideoDevice } from "@ghcloud/cube-security-management-service";

import { VideoItem } from "../video-item/video-item";
import { cubeSecurityManagementService } from "@/api/server";

import styles from "./collect-tab.module.less";

interface Props {
  keyword?: string;
}

export const CollectTab = defineComponent({
  props: ["keyword"],
  emits: ["totalChange", "collectChange"],
  setup: (props: Props, { expose, emit }) => {
    const refreshing = ref(false);
    const loading = ref(false);
    const searching = ref(false);
    const finished = ref(false);
    const dataSource = ref<MultipleVideoDevice[]>([]);
    const search = reactive<{
      areaId: string;
      pageNumber: number;
      pageSize: number;
      total: number;
    }>({
      areaId: "",
      pageNumber: 0,
      total: 1,
      pageSize: 20,
    });

    const onRefresh = async (): Promise<void> => {
      search.pageNumber = 0;
      finished.value = false;
      searching.value = true;
      dataSource.value = [];
      await onLoad();
    };

    const onLoad = async (): Promise<void> => {
      try {
        const isFirstPage = search.pageNumber === 0;
        if (!isFirstPage) {
          loading.value = true;
        }
        search.pageNumber++;
        const res = await cubeSecurityManagementService.getCollectVideoDevicesPage({
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          keyword: props.keyword ?? "",
        });
        emit("totalChange", res.total);
        if (res.total <= search.pageSize) {
          finished.value = true;
        }
        if (res.records.length < search.pageSize) {
          finished.value = true;
        }
        if (res.pages <= search.pageNumber) {
          finished.value = true;
        }
        if (search.pageNumber === 1) {
          dataSource.value = [];
        }
        dataSource.value = [...dataSource.value, ...res.records];
      } catch {
        finished.value = true;
      } finally {
        loading.value = false;
        searching.value = false;
        refreshing.value = false;
      }
    };

    expose({
      onRefresh,
    });
    return (): JSX.Element => (
      <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles.content}>
        {searching.value && (
          <div class={styles["loading-wrap"]}>
            <Loading vertical>加载中...</Loading>
          </div>
        )}
        <List
          v-model:loading={loading.value}
          finished={finished.value}
          finished-text={dataSource.value.length === 0 ? "" : "暂无更多数据"}
          onLoad={onLoad}
        >
          {dataSource.value.map((e) => {
            return (
              <VideoItem
                key={e.id}
                {...e}
                collected
                onCollectChange={() => {
                  emit("collectChange");
                }}
              />
            );
          })}
          {dataSource.value.length === 0 && search.pageNumber === 1 && !searching.value && !loading.value && (
            <Empty description="暂无数据" />
          )}
        </List>
      </PullRefresh>
    );
  },
});
