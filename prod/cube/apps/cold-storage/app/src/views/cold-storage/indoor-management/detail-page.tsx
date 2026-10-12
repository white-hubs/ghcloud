import { computed, defineComponent, onMounted, ref, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type { ColdStoreInsideDoorDetail, ColdStoreInsideDoorEvent } from "@ghcloud/cube-service-interface/cold-storage";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getColdStoreInsideDoorDetail } from "@ghcloud/cube-services-client/cold-storage.client";
import { Button, Empty, Spin, Tag } from "@ghcloud/cube-ui";

import { goBack } from "../shared/page";
import { formatClockTime } from "../shared/time";

import "./detail-page.less";

interface EventRecord {
  time: string;
  title: string;
  desc: string;
  tone: "blue" | "orange";
}

const displayText = (value?: string | number | null): string => {
  if (value == null || value === "") {
    return "--";
  }
  return String(value);
};

const doorStatusColor = (status?: string): string => {
  const text = status ?? "";
  if (text.includes("开") || text.toUpperCase() === "OPEN") {
    return "red";
  }
  if (text.includes("关") || text.toUpperCase() === "CLOSE") {
    return "green";
  }
  return "blue";
};

const formatEventTime = (event: ColdStoreInsideDoorEvent): string => {
  if (event.eventTime) {
    return formatClockTime(event.eventTime);
  }
  return formatClockTime(event.ts);
};

const toEventRecord = (event: ColdStoreInsideDoorEvent): EventRecord => ({
  time: formatEventTime(event),
  title: displayText(event.eventTypeName || event.eventType),
  desc: displayText(event.description),
  tone: event.eventType === "OPEN" ? "orange" : "blue",
});

export const IndoorManagementDetailPage = defineComponent({
  name: "IndoorManagementDetailPage",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const loading = shallowRef(false);
    const detail = ref<ColdStoreInsideDoorDetail | null>(null);
    const storeId = computed(() => {
      const value = route.query.id;
      return Array.isArray(value) ? (value[0] ?? "") : String(value ?? "");
    });

    const loadDetail = async (): Promise<void> => {
      if (!storeId.value) {
        detail.value = null;
        return;
      }
      loading.value = true;
      try {
        detail.value = await useAuthRequest(() => getColdStoreInsideDoorDetail(storeId.value));
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      void loadDetail();
    });

    watch(storeId, () => {
      void loadDetail();
    });

    const basicInfo = computed(() => detail.value?.basicInfo);
    const title = computed(() => `${basicInfo.value?.storeName || "库门"} 基本信息`);
    const fields = computed(() => [
      { label: "设定温度", value: displayText(basicInfo.value?.setTemperature) },
      { label: "当前门侧温度", value: displayText(basicInfo.value?.currentTemperature) },
      { label: "已开启时长", value: displayText(basicInfo.value?.openedDuration) },
      { label: "最近正常关门", value: displayText(basicInfo.value?.latestNormalClose) },
      { label: "AI行为判定", value: displayText(basicInfo.value?.aiBehavior) },
      { label: "关联摄像头", value: displayText(basicInfo.value?.cameraName) },
    ]);
    const eventRecords = computed(() => (detail.value?.doorEvents ?? []).map(toEventRecord));

    const content = (): JSX.Element => (
      <div class="indoor-detail-page">
        <Spin spinning={loading.value}>
          {detail.value ? (
            <>
              <section class="indoor-detail-hero">
                <div class="indoor-detail-title">
                  <h2>{title.value}</h2>
                  <Tag color={doorStatusColor(basicInfo.value?.doorStatusName || basicInfo.value?.doorStatus)}>
                    {displayText(basicInfo.value?.doorStatusName || basicInfo.value?.doorStatus)}
                  </Tag>
                </div>
                <div class="indoor-detail-grid">
                  {fields.value.map((item) => (
                    <div class="indoor-detail-field" key={item.label}>
                      <span>{item.label}</span>
                      <b>{item.value}</b>
                    </div>
                  ))}
                </div>
              </section>

              <section class="indoor-detail-section">
                <h3>开关门事件记录</h3>
                {eventRecords.value.length ? (
                  <div class="indoor-event-timeline">
                    {eventRecords.value.map((item) => (
                      <div class="indoor-event-item" key={`${item.time}-${item.title}`}>
                        <i class={`tone-${item.tone}`} />
                        <div class="indoor-event-card">
                          <span>{item.time}</span>
                          <b>{item.title}</b>
                          <p>{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty description="暂无开关门事件记录" />
                )}
              </section>
            </>
          ) : (
            <Empty description="未找到库门状态详情" />
          )}
        </Spin>
      </div>
    );

    return () => (
      <CubeLayout
        title="库内管理详情"
        showFooter
        v-slots={{
          "layout-content": content,
          "footer-page": () => <Button onClick={() => goBack(router, { name: "indoor-management" })}>返回</Button>,
        }}
      />
    );
  },
});
