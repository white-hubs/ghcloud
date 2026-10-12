import { Empty, Loading, PullRefresh, showNotify, Tag } from "vant";
import { defineComponent, onMounted, ref, type VNode } from "vue";
import { useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { ColdStoreLeakResponseListItem } from "@ghcloud/cube-service-interface/cold-storage";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getColdStoreLeakResponses } from "@ghcloud/cube-services-client/cold-storage.client";

import { displayText, formatDateTime, withUnit } from "@/utils/format";

const levelType = (code?: string, name?: string): "danger" | "warning" | "success" | "primary" => {
  const text = `${code ?? ""}${name ?? ""}`;
  if (/高|严重|一级|DANGER|HIGH|RED/i.test(text)) {
    return "danger";
  }
  if (/中|二级|WARN|ORANGE|WATCH/i.test(text)) {
    return "warning";
  }
  if (/低|正常|NORMAL|LOW/i.test(text)) {
    return "success";
  }
  return "primary";
};

export const LeakResponsePage = defineComponent({
  name: "LeakResponsePage",
  setup: () => {
    const router = useRouter();
    const alarms = ref<ColdStoreLeakResponseListItem[]>([]);
    const loading = ref(false);
    const refreshing = ref(false);

    const loadList = async (): Promise<void> => {
      loading.value = true;
      try {
        alarms.value = await useAuthRequest(() => getColdStoreLeakResponses());
      } catch (error) {
        showNotify({ type: "danger", message: error instanceof Error ? error.message : "泄漏响应列表加载失败" });
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    };

    const refresh = async (): Promise<void> => {
      refreshing.value = true;
      await loadList();
    };

    const openAlarmDetail = (alarm: ColdStoreLeakResponseListItem): void => {
      if (!alarm.alarmId) {
        showNotify({ type: "warning", message: "缺少报警ID，无法查看详情" });
        return;
      }
      void router.push({
        name: "leak-response-detail",
        query: {
          alarmId: alarm.alarmId,
        },
      });
    };

    onMounted(() => {
      void loadList();
    });

    return (): VNode => (
      <>
        <CubeNavBar showBack title="泄漏响应" />
        <main class="cs-h5-page leak-response-page">
          <PullRefresh v-model={refreshing.value} onRefresh={refresh} class="content-refresh">
            {loading.value && !alarms.value.length ? (
              <div class="page-loading">
                <Loading type="spinner" />
              </div>
            ) : alarms.value.length ? (
              <div class="card-list">
                {alarms.value.map((alarm) => (
                  <article class="leak-card" key={alarm.alarmId} onClick={() => openAlarmDetail(alarm)}>
                    <header>
                      <div>
                        <h3>{displayText(alarm.title || alarm.alarmCode)}</h3>
                        <p>
                          {displayText(alarm.storeName)} · {displayText(alarm.mainDeviceName)}
                        </p>
                      </div>
                      <Tag type={levelType(alarm.alarmLevelCode, alarm.alarmLevelName)}>{displayText(alarm.alarmLevelName)}</Tag>
                    </header>
                    <div class="leak-main">
                      <div>
                        <span>当前 NH3 浓度</span>
                        <b>{withUnit(alarm.currentConcentration, alarm.concentrationUnit)}</b>
                      </div>
                      <div>
                        <span>告警状态</span>
                        <b>{displayText(alarm.alarmStatusName)}</b>
                      </div>
                    </div>
                    <footer>
                      <span>{formatDateTime(alarm.alarmTime)}</span>
                      <strong>{displayText(alarm.location)}</strong>
                    </footer>
                  </article>
                ))}
              </div>
            ) : (
              <Empty description="暂无泄漏响应告警" />
            )}
          </PullRefresh>
        </main>
      </>
    );
  },
});
