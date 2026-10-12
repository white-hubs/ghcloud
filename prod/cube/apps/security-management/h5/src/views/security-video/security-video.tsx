import debounce from "lodash/debounce";
import { Search, Tab, Tabs } from "vant";
import { defineComponent, nextTick, onActivated, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { onBeforeRouteLeave } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";

import { AllTab } from "./components/all-tab/all-tab";
import { CollectTab } from "./components/collect-tab/collect-tab";
import { VideoGroup } from "./components/video-group/video-group";
import { cubeDictionaryService } from "@/api/server";

import styles from "./security-video.module.less";

const SECURITY_VIDEO_TAB_CACHE_KEY = "security-video-active-tab";
const SECURITY_VIDEO_CONFIG_ITEM_CODE = "APP_BUSINESS_CONFIG";
const SECURITY_VIDEO_CONFIG_CODE = "SECURITY_VIDEO_CONFIG";
type SecurityVideoTab = "all" | "group" | "collect";

function parseDictionaryVariable(variable?: string): Record<string, unknown> {
  if (!variable) {
    return {};
  }
  try {
    return JSON.parse(variable) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function getDefaultTabByConfig(): Promise<SecurityVideoTab> {
  try {
    const configs = await cubeDictionaryService.getDictionaryByItem({
      itemCode: SECURITY_VIDEO_CONFIG_ITEM_CODE,
      code: SECURITY_VIDEO_CONFIG_CODE,
    });
    const variable = parseDictionaryVariable(configs?.[0]?.variable);
    return variable.defaultTab === "videoGroup" ? "group" : "all";
  } catch {
    return "all";
  }
}

/** 视频监控 */
export const SecurityVideo = defineComponent({
  name: "SecurityVideo",
  setup() {
    document.title = "视频监控";
    const AllTabRef = ref();
    const CollectTabRef = ref();
    const VideoGroupRef = ref();
    const search = reactive({
      keyword: "",
      allNum: 0,
    });
    const activeTab = ref<SecurityVideoTab>("all");
    const defaultTab = ref<SecurityVideoTab>("all");
    const refreshAllTabs = (): void => {
      AllTabRef.value?.onRefresh();
      VideoGroupRef.value?.onRefresh();
      CollectTabRef.value?.onRefresh();
    };
    const debouncedRefresh = debounce(() => {
      void nextTick(refreshAllTabs);
    }, 300);
    const onSearch = (): void => {
      debouncedRefresh.cancel();
      void nextTick(refreshAllTabs);
    };
    watch(
      () => search.keyword,
      () => {
        debouncedRefresh();
      },
    );
    const onTabChange = (name: string | number): void => {
      const nextTab = String(name) as SecurityVideoTab;
      activeTab.value = nextTab;
      sessionStorage.setItem(SECURITY_VIDEO_TAB_CACHE_KEY, nextTab);
    };
    const restoreActiveTab = (): void => {
      const cachedTab = sessionStorage.getItem(SECURITY_VIDEO_TAB_CACHE_KEY) as SecurityVideoTab | null;
      if (cachedTab && ["all", "group", "collect"].includes(cachedTab)) {
        activeTab.value = cachedTab;
      } else {
        activeTab.value = defaultTab.value;
      }
    };

    onMounted(async () => {
      defaultTab.value = await getDefaultTabByConfig();
      restoreActiveTab();
      CollectTabRef.value?.onRefresh();
      VideoGroupRef.value?.onRefresh();
      AllTabRef.value?.onRefresh();
    });
    onActivated(() => {
      restoreActiveTab();
    });

    onBeforeRouteLeave((to) => {
      if (to.name !== "video-detail") {
        sessionStorage.removeItem(SECURITY_VIDEO_TAB_CACHE_KEY);
      }
    });
    onBeforeUnmount(() => {
      debouncedRefresh.cancel();
    });

    return (): JSX.Element => (
      <div class={styles.page}>
        <CubeNavBar showBack title="视频监控" />
        <div class={styles["search-bar"]}>
          <Search v-model={search.keyword} placeholder="根据监控设备名称进行搜索" onSearch={onSearch} onClear={onSearch} />
        </div>
        <Tabs v-model:active={activeTab.value} onChange={onTabChange}>
          <Tab title={`全部(${search.allNum})`} name="all">
            <AllTab
              keyword={search.keyword}
              ref={AllTabRef}
              onTotalChange={(num) => {
                search.allNum = num;
              }}
              onCollectChange={() => {
                CollectTabRef.value?.onRefresh();
              }}
            />
          </Tab>
          <Tab title="视频分组" name="group">
            <VideoGroup
              keyword={search.keyword}
              ref={VideoGroupRef}
              onCollectChange={() => {
                CollectTabRef.value?.onRefresh();
              }}
            />
          </Tab>
          <Tab title="我的收藏" name="collect">
            <CollectTab keyword={search.keyword} ref={CollectTabRef} onCollectChange={onSearch} />
          </Tab>
        </Tabs>
      </div>
    );
  },
});
