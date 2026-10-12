import { cubeAlarmCenterService, cubeAlarmStatService, cubeDictionaryService } from "../../api/server";
import { useGlobalRouter } from "../../hook/use-global-router";
import { RecordItem } from "./components/record-item/record-item";
import { SearchBar } from "./components/search-bar/search-bar";
import "./alarm-records.less";
import type { AlarmRecord } from "@ghcloud/cube-alarm-center-service/src/types/alarm-center";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { Tabs, Tab, PullRefresh, List, Empty, showNotify } from "vant";
import "vant/es/notify/style";
import { defineComponent, onBeforeMount, onMounted, reactive, ref, watch } from "vue";

/** 报警记录 */
export const AlarmRecords = defineComponent({
  name: "AlarmRecords",
  setup() {
    document.title = "报警记录";
    const tabActive = ref(0);
    const { route } = useGlobalRouter();
    const gridId = route.query.gridAreaId as string;
    const operateApps = ["ENERGY_CONSUMPTION"]; // 有权限设置的应用
    const operatePermissions = ref();
    const tabOptions = ref([
      {
        label: "全部",
        value: "",
        num: "",
      },
      {
        label: "待接收",
        value: "ALARM_UN_CONFIRMED",
        num: "",
      },
      {
        label: "处理中",
        value: "ALARM_PROGRESS_CONFIRMED",
        num: "",
      },
      {
        label: "已挂起",
        value: "ALARM_SUSPEND",
        num: "",
      },
      {
        label: "已处理",
        value: "ALARM_HANDLER",
        num: "",
      },
    ]);
    const searchRef = ref<{ getFormState: () => Record<string, string> }>();
    const dataSource = ref<AlarmRecord[]>([]);
    const loading = ref(false);
    const finished = ref(false);
    const refreshing = ref(false);
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 20,
    });

    const getTabStat = async (): Promise<void> => {
      if (searchRef.value) {
        const { applicationCode, period, alarmLevelId, areaId, userId, assistConfirmResult } = searchRef.value.getFormState();
        const params = {
          applicationCode,
          period,
          alarmLevelId,
          areaId: gridId ?? areaId,
          userId,
          deviceIds: route.query.entityId ? ([route.query.entityId] as string[]) : [],
          alarmTypeCode: (route.query.alarmTypeCode as string) ?? "",
          assistConfirmResult,
        };
        try {
          const res = await cubeAlarmStatService.alarmSummaryStatGroup(params);
          tabOptions.value.forEach((item) => {
            if (item.value) {
              const num = res.find((e) => e.alarmStatus === item.value)?.alarmNum ?? 0;
              item.num = num > 99 ? "99+" : num + "";
            }
          });
          const res1 = res.filter((x: { alarmStatus: string }) => x.alarmStatus !== "TIME_OUT_UN_HANDLER");
          const totalNum = res1.reduce((a, b) => a + b.alarmNum, 0);
          tabOptions.value[0].num = totalNum > 99 ? "99+" : totalNum + "";
        } catch (error) {
          const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
          showNotify({ type: "danger", message: errorMessage || "请求失败" });
        }
      }
    };

    const getDataSource = async (): Promise<{ total: number; records: AlarmRecord[] }> => {
      try {
        const areaId = gridId ?? searchRef.value?.getFormState().areaId;
        const params = {
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          ...searchRef.value?.getFormState(),
          areaId,
          alarmStatus: tabOptions.value[tabActive.value].value,
          deviceIds: route.query.entityId ? ([route.query.entityId] as string[]) : [],
          userId: (route.query.userId as string) ?? "",
          alarmTypeId: (route.query.alarmTypeCode as string) ?? "",
        };
        const { total, records } = await cubeAlarmCenterService.getAlarmRecordsPage(params);
        return { total, records };
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
        return { total: 0, records: [] };
      }
    };

    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true;
        search.pageNumber++;
        const res = await getDataSource();
        if (res.total <= search.pageSize) {
          finished.value = true;
        }
        if (res.records.length < search.pageSize) {
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
        refreshing.value = false;
      }
    };

    const onRefresh = async (): Promise<void> => {
      search.pageNumber = 0;
      finished.value = false;
      await onLoad();
    };
    const handleChangeRecord = ({ index, record }: { index: number; record: AlarmRecord }): void => {
      dataSource.value[index] = record;
    };
    const getData = async (): Promise<void> => {
      dataSource.value.length = 0;
      await getTabStat();
      onRefresh();
    };
    const getDictionaryTree = async (): Promise<void> => {
      // 操作是否由权限控制
      if (operateApps.includes(route.query.sourceApp as string)) {
        const permissions = await cubeDictionaryService.getDictionaryTree({ itemCode: route.query.sourceApp as string });
        operatePermissions.value = permissions.filter((x) => x.variable === "true").map((x) => x.code);
      }
    };
    onMounted(() => {
      getData();
      getDictionaryTree();
    });
    onBeforeMount(() => {
      const alarmStatus = route.query.alarmStatus as string;
      const cache = sessionStorage.getItem("searchParams");
      const searchParams = cache ? JSON.parse(cache) : cache;
      if (!alarmStatus) {
        return;
      }
      const tabIndex = tabOptions.value.findIndex((item) => item.value === alarmStatus);
      tabActive.value = tabIndex !== -1 ? tabIndex : 0;
      if (!searchParams) {
        return;
      }
      const searchTabIndex = tabOptions.value.findIndex((item) => item.value === searchParams.alarmStatus);
      tabActive.value = searchTabIndex !== -1 ? searchTabIndex : 0;
    });
    const handleConfirmFilter = (): void => {
      getDataSource();
      getData();
    };
    watch(
      () => tabActive.value,
      () => {
        getData();
      },
    );
    const handleAlarmInfo = (): void => {
      sessionStorage.setItem(
        "searchParams",
        JSON.stringify({ ...searchRef.value?.getFormState(), alarmStatus: tabOptions.value[tabActive.value].value }),
      );
    };

    return (): JSX.Element => (
      <>
        <CubeNavBar showBack title="报警列表" />
        <SearchBar ref={searchRef} onConfirm={handleConfirmFilter} />
        <Tabs v-model:active={tabActive.value} sticky>
          {tabOptions.value.map((item) => (
            <Tab
              value={item.value}
              key={item.value}
              v-slots={{
                title: () => (
                  <>
                    {item.label}
                    <span class="van-tab__title-text">{item.num}</span>
                  </>
                ),
              }}
            />
          ))}
        </Tabs>
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class="alarm-list-pull-refresh">
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? "" : "暂无更多数据"}
            onLoad={onLoad}
          >
            {dataSource.value &&
              dataSource.value.length > 0 &&
              dataSource.value.map((item: AlarmRecord) => (
                <RecordItem
                  permissions={operatePermissions.value}
                  onHandleInfo={handleAlarmInfo}
                  key={item.id}
                  record={item}
                  onChangeRecord={handleChangeRecord}
                />
              ))}
            {dataSource.value.length === 0 && search.pageNumber === 1 && !loading.value && <Empty description="暂无数据" />}
          </List>
        </PullRefresh>
      </>
    );
  },
});
