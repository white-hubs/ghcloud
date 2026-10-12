import { Empty, Field, List, PullRefresh, Tab, Tabs, showNotify } from "vant";
import { defineComponent, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";

import { useMetaTitle } from "../hooks/use-meta-title-hook";
import { RecordItem } from "./components/record-item/record-item";
import { cubeDeviceSuperviseService } from "@/api/server";
import {
  ALARM_EVENT_STATUS_FILTER_OPTIONS,
  type AlarmEventStatusFilter,
  type AlarmRecordItem,
  mergeAlarmRecords,
  parseAlarmRecordsPageResult,
} from "@/utils/alarm-record-mapper";

import styles from "./alarm-records.module.less";

export const AlarmRecords = defineComponent({
  name: "AlarmRecords",
  setup: () => {
    useMetaTitle();
    const router = useRouter();
    const tabActive = ref(0);
    const keyword = ref("");
    const dataSource = ref<AlarmRecordItem[]>([]);
    const loading = ref(false);
    const finished = ref(false);
    const refreshing = ref(false);
    const search = reactive({
      pageNumber: 0,
      pageSize: 20,
    });

    const currentStatus = (): AlarmEventStatusFilter => ALARM_EVENT_STATUS_FILTER_OPTIONS[tabActive.value]?.value ?? "ALARM_UN_CONFIRMED";

    const getDataSource = async (): Promise<{ total: number; records: AlarmRecordItem[] }> => {
      try {
        const params: Record<string, unknown> = {
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          alarmStatus: currentStatus(),
        };
        const kw = keyword.value.trim();
        if (kw) {
          params.keyword = kw;
        }
        const res = await cubeDeviceSuperviseService.getAlarmRecordsPage(params);
        const parsed = parseAlarmRecordsPageResult(res);
        return { total: parsed.total, records: parsed.records };
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
        if (res.total <= search.pageSize || res.records.length < search.pageSize) {
          finished.value = true;
        }
        if (search.pageNumber === 1) {
          dataSource.value = [];
        }
        dataSource.value = mergeAlarmRecords([...dataSource.value, ...res.records]);
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

    const reload = (): void => {
      search.pageNumber = 0;
      finished.value = false;
      dataSource.value = [];
      void onLoad();
    };

    const handleRecordClick = (record: AlarmRecordItem): void => {
      router.push({
        name: "evacuation-guide",
        query: { id: String(record.id) },
        state: { record },
      });
    };

    onMounted(() => {
      reload();
    });

    watch(tabActive, () => {
      reload();
    });

    return (): JSX.Element => (
      <div class={styles.page}>
        <CubeNavBar showBack title="报警记录" />
        <div class={styles.searchBar}>
          <Field
            v-model={keyword.value}
            placeholder="搜索报警类型、区域"
            clearable
            onKeyup={(e: KeyboardEvent) => {
              if (e.key === "Enter") {
                reload();
              }
            }}
          />
        </div>
        <Tabs v-model:active={tabActive.value} sticky offsetTop={46}>
          {ALARM_EVENT_STATUS_FILTER_OPTIONS.map((item) => (
            <Tab key={item.value} title={item.label} />
          ))}
        </Tabs>
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles.pullRefresh}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? "" : "没有更多了"}
            onLoad={onLoad}
          >
            {dataSource.value.map((item) => (
              <RecordItem key={item.id} record={item} onClick={handleRecordClick} />
            ))}
            {dataSource.value.length === 0 && search.pageNumber >= 1 && !loading.value && <Empty description="暂无报警记录" />}
          </List>
        </PullRefresh>
      </div>
    );
  },
});
