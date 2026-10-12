import styles from "./entry.module.less";
import { cubeAlarmSafetyAnalysisService, cubeAlarmCenterService, cubeDeviceCenterService, cubeOuaaService } from "@/api/server";
import { routes } from "@/router";
import { getAssetsFile, timePeriod } from "@/utils";
import type { AlarmEventStatisticsType } from "@ghcloud/cube-alarm-center-service/src/type";
import { type AppRoutes, EntryMenu, CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { Cell, CellGroup, Skeleton } from "vant";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
/**
 * 电气/用气/消防/动环 通用此应用入口页及子页面
 */
/** 入口页面 */
export const Entry = defineComponent({
  name: "Entry",
  setup: () => {
    const userId = ref("");
    const router = useRouter();
    const route = useRoute();
    const dataTitle = ref("");
    const loading = ref(false);
    const applicationCode = (route.query.applicationCode as string) ?? "ELECTRICMANAGE";
    const alarmTotal = reactive({
      total: 0,
      radio: "0",
    });
    const statistics = [
      { name: "设备总数", type: "SUBMIT", value: 0, deviceStatus: "" },
      { name: "设备在线", type: "WAITING", value: 0, deviceStatus: "true" },
      { name: "设备离线", type: "HANDLED", value: 0, deviceStatus: "false" },
    ];
    const eventStatistics = ref<AlarmEventStatisticsType[]>([]);
    const timeOptions = [
      { label: "今日", value: timePeriod(), type: "TODAY" },
      { label: "本周", value: timePeriod("WEEK"), type: "THIS_WEEK" },
      { label: "本月", value: timePeriod("MONTH"), type: "THIS_MONTH" },
      { label: "今年", value: timePeriod("YEAR"), type: "THIS_YEAR" },
    ];
    const timeSelect = ref(timePeriod());
    const timeType = ref("TODAY");
    const getData = async (): Promise<void> => {
      try {
        loading.value = true;
        const menu = await cubeOuaaService.getAppMenuInfo(applicationCode);
        dataTitle.value = menu[0]?.applicationName ?? "";
        // 获取设备数
        const { totalNumber, offlineNumber, normalNumber } = await cubeDeviceCenterService.deviceTagStatusCount({
          tagCodes: [`builtin.app::${applicationCode}`],
        });
        statistics[0].value = totalNumber;
        statistics[1].value = normalNumber;
        statistics[2].value = offlineNumber;
        // 获取事件
        eventStatistics.value = await cubeAlarmCenterService.getEventAlarmStatistics({ applicationCode, period: timeSelect.value });
        // 获取用户ID
        const { id } = await cubeOuaaService.getUserMine();
        userId.value = id;
        // 获取报警总数
        const { alarmNum } = await cubeAlarmSafetyAnalysisService.alarmStatistics({
          applicationCode,
          period: timeSelect.value,
          userId: id,
        });
        const { ringRatio } = await cubeAlarmCenterService.getAlarmStatisticsRingRatioAnalysis({
          applicationCode,
          period: timeSelect.value,
          type: timeType.value,
        });
        alarmTotal.radio = ringRatio ?? "";
        alarmTotal.total = alarmNum ?? 0;
      } catch {
      } finally {
        loading.value = false;
      }
    };

    const timeChange = (item: { value: string; type: string }): void => {
      timeSelect.value = item.value;
      timeType.value = item.type;
      getData();
    };
    const toAlarm = async (type: string, item?: AlarmEventStatisticsType): Promise<void> => {
      if (type === "total") {
        router.push({
          path: "/baseAlarmRecords",
          query: { sourceApp: applicationCode, userId: userId.value, period: timeSelect.value },
        });
      } else {
        router.push({
          path: "/baseAlarmRecords",
          query: { sourceApp: applicationCode, alarmEventTypeCode: item?.id ?? "", userId: userId.value, period: timeSelect.value },
        });
      }
    };
    onMounted(() => {
      getData();
    });
    // 处理路由参数
    const handleRoutes = (): AppRoutes => {
      // @ts-ignore
      return routes.map((item) => {
        if (item.path === "/") {
          return {
            ...item,
          };
        }
        return {
          ...item,
          getQuery: async (): Promise<Record<string, string>> => {
            return { applicationCode, userId: userId.value };
          },
        };
      });
    };

    return (): JSX.Element => (
      <>
        <CubeNavBar showBack title={dataTitle.value} />
        <div class={styles.container}>
          <EntryMenu routes={handleRoutes()} title="业务操作" applicationCode={applicationCode} />
          <CellGroup inset class={styles["app-group"]}>
            <Cell
              border={false}
              title={dataTitle.value.slice(0, 2) + "总览"}
              v-slots={{
                value: () => {
                  return (
                    <div class={styles["time-picker"]}>
                      {timeOptions.map((e) => (
                        <div
                          key={e.label}
                          class={`${e.value === timeSelect.value ? styles["time-picker-selected"] : ""}`}
                          onClick={() => {
                            timeChange(e);
                          }}
                        >
                          {e.label}
                        </div>
                      ))}
                    </div>
                  );
                },
              }}
            />
            <Cell border={false}>
              <div class={styles["stat-bottom"]} v-show={!loading.value}>
                {statistics.map((item) => (
                  <div
                    class={styles["stat-bottom-item"]}
                    key={item.name}
                    onClick={() => {
                      if (item.value > 0) {
                        router.push({
                          path: "/baseMonitorDevice",
                          query: { applicationCode, type: item.type, period: timeSelect.value, deviceStatus: item.deviceStatus },
                        });
                      }
                    }}
                  >
                    <div class={styles["stat-bottom-item-title"]}>{item.value}</div>
                    <div class={styles["stat-bottom-item-value"]}>{item.name}</div>
                  </div>
                ))}
              </div>
              <Skeleton row={3} animated v-show={loading.value} />
              <div class={styles["alarm-statistic"]}>
                <p>报警总数</p>
                <div
                  class={styles.content}
                  onClick={() => {
                    toAlarm("total");
                  }}
                >
                  <div style={{ marginTop: "16px" }}>
                    <span style={{ color: "black", fontSize: "22px", marginRight: "4px" }}>{alarmTotal.total}</span>
                    <span style={{ fontSize: "12px", marginTop: "20px" }}>环比</span>
                    <span style={{ fontSize: "12px", color: `${alarmTotal.radio.includes("-") ? "green" : "red"}`, marginTop: "20px" }}>
                      {alarmTotal.radio}%
                      <img
                        width="10"
                        src={alarmTotal.radio.includes("-") ? getAssetsFile("ic_trend_down.svg") : getAssetsFile("ic_trend_up.svg")}
                        alt=""
                      />
                    </span>
                  </div>
                  <img src={getAssetsFile("ic_card_chart.svg")} width="100" alt="2" />
                </div>
              </div>
            </Cell>
          </CellGroup>
          <CellGroup inset class={styles["app-group"]} v-show={eventStatistics.value.length > 0}>
            <Cell border={false}>
              <div class={styles["alarm-event"]} v-show={!loading.value}>
                {eventStatistics.value.map((item) => (
                  <div
                    class={styles["alarm-event-item"]}
                    key={item.name}
                    onClick={() => {
                      toAlarm("detail", item);
                    }}
                  >
                    <div class={styles["item-title"]}>{item.totalNum}</div>
                    <div class={styles["item-value"]}>{item.name}</div>
                  </div>
                ))}
              </div>
            </Cell>
          </CellGroup>
        </div>
      </>
    );
  },
});
