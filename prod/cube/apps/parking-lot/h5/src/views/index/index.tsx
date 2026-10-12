import styles from "./index.module.less";
import { cubeFaultRepairService, cubeParkingLotService, cubeTrafficStatisticsService } from "@/api/server";
import { LineChart } from "@/components/charts/line-chart/line-chart";
import { routes } from "@/router";
import { timePeriod } from "@/utils";
import { CubeNavBar, EntryMenu } from "@ghcloud/cube-app-generic-component";
import { CellGroup, Skeleton, Icon, PullRefresh, Empty } from "vant";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

/** 入口页面 */
export const Entry = defineComponent({
  name: "Entry",
  setup: () => {
    const router = useRouter()
    const timeOptions = [
      { label: "今日", value: timePeriod() },
      { label: "本周", value: timePeriod("WEEK") },
      { label: "本月", value: timePeriod("MONTH") },
      { label: "今年", value: timePeriod("YEAR") },
    ];

    const illegalParking = reactive({
      loading: false,
      timeSelect: timePeriod(),
      total: 0,
      stats: {
        submit: 0,
        waiting: 0,
        processed: 0,
      },
    });

    const remainingSpaces = reactive({
      loading: false,
      total: 0,
      list: [] as { name: string; value: number }[],
    });

    const peopleFlow = reactive({
      loading: false,
      timeSelect: timePeriod(),
      total: 0,
      chartData: {
        x: [] as string[],
        y: [] as number[],
      },
    });

    const refreshing = ref(false);

    const getIllegalParkingData = async (): Promise<void> => {
      try {
        illegalParking.loading = true;
        const res = await cubeFaultRepairService.genFlowNumber({
          period: illegalParking.timeSelect,
          applicationCode: __ENV__.applicationCode,
          businessType: "ILLEGAL_PARKING",
        });
        illegalParking.total = res?.submitCount || 0;
        illegalParking.stats.waiting = res?.waitingCount || 0;
        illegalParking.stats.processed = res?.finishedCount || 0;
        illegalParking.stats.submit = res?.submitCount || 0;
      } catch (error) {
      } finally {
        illegalParking.loading = false;
      }
    };

    const getRemainingSpacesData = async (): Promise<void> => {
      try {
        remainingSpaces.loading = true;
        const params = { source: "SELF_BUILT" };
        const [info, list] = await Promise.all([
          cubeParkingLotService.getParkingInfo(params),
          cubeParkingLotService.getParkingLotList(params),
        ]);

        remainingSpaces.total = info?.totalSpaceNum ?? 0;

        remainingSpaces.list = (list ?? []).map((item) => ({
          name: item.name ?? item.areaName ?? "停车场",
          value: item?.totalSpaceNum ?? 0,
        }));
      } catch (error) {
      } finally {
        remainingSpaces.loading = false;
      }
    };

    // Fetch People Flow Data
    const getPeopleFlowData = async (): Promise<void> => {
      try {
        peopleFlow.loading = true;
        // Convert timeSelect (date range string) to params
        let type = "TODAY";
        if (peopleFlow.timeSelect === timePeriod("WEEK")) {
          type = "THIS_WEEK";
        } else if (peopleFlow.timeSelect === timePeriod("MONTH")) {
          type = "THIS_MONTH";
        } else if (peopleFlow.timeSelect === timePeriod("YEAR")) {
          type = "THIS_YEAR";
        } else {
          type = "TODAY";
        } // Default

        const params = {
          type: type,
          period: peopleFlow.timeSelect,
        };

        const [stats, trend] = await Promise.all([
          cubeTrafficStatisticsService.getTrafficPersonStatistics(params),
          cubeTrafficStatisticsService.getTrafficTrendStat(params),
        ]);

        peopleFlow.total = stats?.totalNumber ?? 0;
        peopleFlow.chartData.x = (trend?.map((e) => e?.period) ?? []).filter((e): e is string => !!e);
        peopleFlow.chartData.y = (trend?.map((e) => e?.totalPersonNumber) ?? []).filter((e): e is number => e !== undefined && e !== null);
      } catch (error) {
      } finally {
        peopleFlow.loading = false;
      }
    };

    const onRefresh = async () => {
      try {
        await Promise.all([getIllegalParkingData(), getRemainingSpacesData(), getPeopleFlowData()]);
      } catch (error) {
      } finally {
        refreshing.value = false;
      }
    };

    onMounted(() => {
      getIllegalParkingData();
      getRemainingSpacesData();
      getPeopleFlowData();
      document.title = "车辆管理";
    });

    return (): JSX.Element => (
      <>
        <CubeNavBar showBack title="车辆管理" />
        <div class={styles.container}>
          <PullRefresh v-model={refreshing.value} onRefresh={onRefresh}>
            <EntryMenu title="业务操作" applicationCode={__ENV__.applicationCode} routes={routes} />
            <CellGroup inset class={styles["app-group"]}>
              {/* 违停工单 */}
              <div class={styles["card-group"]}>
                <div class={styles["card-header"]}>
                  <div class={styles["card-title"]}>违停工单</div>
                  <div class={styles["time-pills"]}>
                    {timeOptions.map((opt) => (
                      <div
                        key={opt.label}
                        class={[styles["time-pill"], illegalParking.timeSelect === opt.value ? styles.active : ""]}
                        onClick={() => {
                          illegalParking.timeSelect = opt.value;
                          getIllegalParkingData();
                        }}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                </div>

                <Skeleton row={3} animated v-show={illegalParking.loading} />
                <div class={styles["card-body"]} v-show={!illegalParking.loading}>
                  <div class={styles["task-over-view"]}>
                    <div class={styles["task-over-view-title"]}>
                      <div class={styles["task-title-icon-box"]}>
                        <div class={styles["task-title-icon"]}>
                          <Icon name="todo-list-o" />
                        </div>
                        <span>{timeOptions.find((o) => o.value === illegalParking.timeSelect)?.label}违停</span>
                      </div>
                      <div class={styles["task-total"]}
                        onClick={() => {
                          router.push({ path: '/violation-work-order', query: { type: 'ALL', period: illegalParking.timeSelect } })
                        }}
                      >
                        <span>{illegalParking.total}</span>
                      </div>
                    </div>
                    <div class={[styles["task-over-view-stat"], styles.two]}>
                      <div class={styles["task-over-view-stat-item"]}
                        onClick={() => {
                          router.push({ path: '/violation-work-order', query: { type: 'WAITING', period: illegalParking.timeSelect } })
                        }}
                      >
                        <div class={styles["task-over-view-stat-item-title"]}>
                          待处理 <Icon name="arrow" size={10} />
                        </div>
                        <div class={styles["task-over-view-stat-item-value"]}>
                          {illegalParking.stats.waiting} <span>个</span>
                        </div>
                      </div>
                      <div class={styles["task-over-view-stat-item"]}
                        onClick={() => {
                          router.push({ path: '/violation-work-order', query: { type: 'PROCESSED', period: illegalParking.timeSelect } })
                        }}
                      >
                        <div class={styles["task-over-view-stat-item-title"]}>
                          已处理 <Icon name="arrow" size={10} />
                        </div>
                        <div class={styles["task-over-view-stat-item-value"]}>
                          {illegalParking.stats.processed} <span>个</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 剩余车位 */}
              <div class={styles["card-group"]}>
                <div class={styles["card-header"]}>
                  <div class={styles["card-title"]}>剩余车位</div>
                </div>

                <Skeleton row={3} animated v-show={remainingSpaces.loading} />
                <div class={styles["card-body"]} v-show={!remainingSpaces.loading}>
                  <div class={styles["task-over-view"]}>
                    <div class={styles["task-over-view-title"]}>
                      <div class={styles["task-title-icon-box"]}>
                        <div class={styles["task-title-icon"]}>
                          <Icon name="cluster-o" />
                        </div>
                        <span>剩余车位</span>
                      </div>
                      <div class={styles["task-total"]}>
                        <span>{remainingSpaces.total}</span>
                      </div>
                    </div>
                    <div class={[styles["task-over-view-stat"], styles.two]}>
                      {remainingSpaces.list.map((item, index) => (
                        <div class={styles["task-over-view-stat-item"]} key={index}>
                          <div class={styles["task-over-view-stat-item-title"]}>{item.name}</div>
                          <div class={styles["task-over-view-stat-item-value"]}>
                            {item.value} <span>个</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 人流量分析 */}
              <div class={styles["card-group"]}>
                <div class={styles["card-header"]}>
                  <div class={styles["card-title"]}>人流量分析</div>
                  <div class={styles["time-pills"]}>
                    {timeOptions.map((opt) => (
                      <div
                        key={opt.label}
                        class={[styles["time-pill"], peopleFlow.timeSelect === opt.value ? styles.active : ""]}
                        onClick={() => {
                          peopleFlow.timeSelect = opt.value;
                          getPeopleFlowData();
                        }}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                </div>

                <Skeleton row={3} animated v-show={peopleFlow.loading} />
                <div class={styles["card-body"]} v-show={!peopleFlow.loading}>
                  <div class={styles["task-over-view"]}>
                    <div class={styles["task-over-view-title"]}>
                      <div class={styles["task-title-icon-box"]}>
                        <div class={styles["task-title-icon"]}>
                          <Icon name="chart-trending-o" />
                        </div>
                        <span>人流量数</span>
                      </div>
                      <div class={styles["task-total"]}>
                        <span>{peopleFlow.total}</span>
                      </div>
                    </div>
                  </div>
                  {peopleFlow.chartData.x.length > 0 && (
                    <div class={styles["chart-container"]}>
                      <LineChart CategoryData={peopleFlow.chartData.x} series={peopleFlow.chartData.y} showLegend={false} />
                    </div>
                  )}
                  {(peopleFlow.chartData.x.length === 0 && !peopleFlow.loading) && <Empty description='暂无数据' />}
                </div>
              </div>
            </CellGroup>
          </PullRefresh>
        </div>
      </>
    );
  },
});
