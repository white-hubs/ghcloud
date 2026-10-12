import { AlertOutlined, CalendarOutlined, SearchOutlined } from "@ant-design/icons-vue";
import { Button, Input, Spin } from "ant-design-vue";
import dayjs from "dayjs";
import { computed, defineComponent, onMounted, onUnmounted, reactive, ref } from "vue";

import { openAlarmDetailModal } from "@/features/widgets/modal/alarm-detail-modal/alarm-detail-modal";
import { alarmrecords } from "@/infrastructure/api/alarm";
import type { AlarmTakeNotesList } from "@/infrastructure/api/models/alarm";
import { hex2Rgba } from "@/infrastructure/utils/common";
import enumerateData from "@/infrastructure/utils/enumeratie";
import { eventInstance } from "@/visualization-core/event/event";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import styles from "./alarm-list-panel.module.less";

const DROPDOWN_CLASS = "visual-data-modal-dropdown";
const DEFAULT_ALARM_COLOR = "#ff7875";

const getPopupContainer = (): HTMLElement => {
  return (document.querySelector(".view") as HTMLElement | null) ?? document.body;
};

type AlarmListItem = AlarmTakeNotesList & {
  alarmTargetName?: string;
  areaName?: string;
  alarmLevelCode?: string;
  alarmTypeName?: string;
};

type AlarmToneStyle = {
  color: string;
  background: string;
};

export const AlarmListPanel = defineComponent({
  name: "AlarmListPanel",
  setup() {
    const { currentTheme } = useVisualTheme();
    const isMinimalWhite = computed(() => currentTheme.value === "minimal-white");
    const { alarmLeaveOptions } = enumerateData();

    const alarmListRef = ref<HTMLElement | null>(null);
    const loading = ref(false);
    const unReadAlarmList = ref<AlarmListItem[]>([]);
    const search = reactive<{
      period: string[];
      keyword: string;
    }>({
      period: [],
      keyword: "",
    });
    const page = reactive({
      total: 0,
      pageSize: 10,
      pageNumber: 1,
      pages: 0,
    });

    const alarmStyle = computed(() => {
      return (item: AlarmListItem): AlarmToneStyle => {
        const data = alarmLeaveOptions.value.find((element) => item.alarmLevelCode === element.value);
        if (!data) {
          return { color: DEFAULT_ALARM_COLOR, background: hex2Rgba(DEFAULT_ALARM_COLOR, 0.18) };
        }
        return { color: data.color, background: hex2Rgba(data.color, 0.18) };
      };
    });

    const requestUnreadAlarmList = async (): Promise<void> => {
      try {
        loading.value = true;
        const period =
          Array.isArray(search.period) && search.period.length === 2
            ? [dayjs(search.period[0]).format("YYYY-MM-DD 00:00:00"), dayjs(search.period[1]).format("YYYY-MM-DD 23:59:59")]
            : [];
        const res = await alarmrecords({
          keyword: search.keyword,
          period: period.length ? period.join(",") : "",
          pageSize: page.pageSize,
          pageNumber: page.pageNumber,
        });
        unReadAlarmList.value = [...unReadAlarmList.value, ...(res.records as unknown as AlarmListItem[])];
        page.total = res.total;
        page.pages = res.pages;
      } catch {
        // keep list as-is on error
      } finally {
        loading.value = false;
      }
    };

    const handelScroll = (e: Event): void => {
      const target = e.target as HTMLElement;
      const { scrollTop, clientHeight, scrollHeight } = target;
      if (scrollTop + clientHeight >= scrollHeight - 5 && !loading.value && page.pageNumber < page.pages) {
        page.pageNumber += 1;
        void requestUnreadAlarmList();
      }
    };

    const searchAlarm = (): void => {
      page.pageNumber = 1;
      unReadAlarmList.value = [];
      void requestUnreadAlarmList();
    };

    const openAlarmModal = (item: AlarmListItem): void => {
      openAlarmDetailModal({
        title: item.alarmEventName,
        alarmData: item as unknown as Record<string, unknown>,
      });
      eventInstance.emitEvent("openDeviceFloor", item);
    };

    onMounted(() => {
      void requestUnreadAlarmList();
    });

    onUnmounted(() => {
      eventInstance.emitEvent("alarmPlaneUnmounted");
    });

    return () => (
      <div
        class={[
          styles["alarm-list-panel"],
          "alarm-sidebar-panel",
          isMinimalWhite.value ? styles["is-minimal-white"] : styles["is-tech-blue"],
        ]}
      >
        <div class={styles["filter-card"]}>
          <div class={styles["filter-title"]}>报警筛选</div>
          <div class={styles["filter-row"]}>
            <a-range-picker
              v-model:value={search.period}
              value-format="YYYY-MM-DD"
              class={styles["filter-picker"]}
              popup-class-name={DROPDOWN_CLASS}
              get-popup-container={getPopupContainer}
              placeholder={["开始日期", "结束日期"]}
              allow-clear
              v-slots={{
                suffixIcon: () => <CalendarOutlined />,
              }}
            />
          </div>
          <div class={styles["filter-row"]}>
            <Input
              v-model:value={search.keyword}
              class={styles["filter-input"]}
              placeholder="请输入报警事件名称"
              allow-clear
              onPressEnter={searchAlarm}
            />
            <Button type="primary" class={styles["filter-btn"]} loading={loading.value} onClick={searchAlarm}>
              <SearchOutlined />
              <span>搜索</span>
            </Button>
          </div>
        </div>

        <div class={styles["alarm-list"]} ref={alarmListRef} onScroll={handelScroll}>
          {unReadAlarmList.value.length
            ? unReadAlarmList.value.map((item) => {
                const tone = alarmStyle.value(item);
                return (
                  <div
                    class={styles["alarm-item"]}
                    key={item.id}
                    style={{ borderLeftColor: tone.color }}
                    onClick={() => openAlarmModal(item)}
                  >
                    <div class={styles["alarm-item-body"]}>
                      <div class={styles["alarm-item-header"]}>
                        <span class={styles["alarm-event-name"]} title={item.alarmEventName}>
                          {item.alarmEventName}
                        </span>
                        <span class={styles["alarm-time"]}>{dayjs(item.alarmTime).format("YYYY-MM-DD HH:mm:ss")}</span>
                      </div>
                      <div class={styles["alarm-info"]}>
                        <div class={styles.icon} style={tone} aria-hidden="true">
                          <AlertOutlined />
                        </div>
                        <div class={styles.describe}>
                          <p class={styles["equipment-name"]} title={item.alarmTargetName}>
                            {item.alarmTargetName || "--"}
                          </p>
                          <p class={styles["area-name"]} title={item.areaName}>
                            {item.areaName || "--"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            : !loading.value && (
                <div class={styles["empty-wrap"]}>
                  <div class={styles["empty-icon"]} aria-hidden="true">
                    <AlertOutlined />
                  </div>
                  <p class={styles["empty-text"]}>暂无报警记录</p>
                </div>
              )}

          {loading.value && (
            <div class={styles["loading-wrap"]}>
              <Spin size="small" />
              <span>加载中...</span>
            </div>
          )}
        </div>
      </div>
    );
  },
});

export default AlarmListPanel;
