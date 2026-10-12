import { Cell, CellGroup } from "vant";
import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { CubeNavBar, EntryMenu } from "@ghcloud/cube-app-generic-component";

import { useMetaTitle } from "../hooks/use-meta-title-hook";
import { cubeDeviceSuperviseService } from "@/api/server";
import { routes } from "@/router";
import { DEFAULT_ALARM_EVENT_STATUSES, mergeAlarmRecords, parseAlarmRecordsPageResult } from "@/utils/alarm-record-mapper";
import { createDevMockAlarmRecord, DEV_MOCK_ALARM_ID } from "@/utils/dev-mock-alarm";

import styles from "./entry.module.less";

export const Entry = defineComponent({
  name: "Entry",
  setup: () => {
    useMetaTitle();
    const router = useRouter();
    const pendingCount = ref(0);

    const loadPendingCount = async (): Promise<void> => {
      try {
        const pages = await Promise.all(
          DEFAULT_ALARM_EVENT_STATUSES.map((alarmStatus) =>
            cubeDeviceSuperviseService.getAlarmRecordsPage({
              pageNumber: 1,
              pageSize: 1,
              alarmStatus,
            }),
          ),
        );
        const total = pages.map((res) => parseAlarmRecordsPageResult(res).total).reduce((sum, n) => sum + n, 0);
        pendingCount.value = total;
      } catch {
        pendingCount.value = 0;
      }
    };

    onMounted(() => {
      void loadPendingCount();
    });

    return (): JSX.Element => (
      <>
        <CubeNavBar showBack title="应急指挥" />
        <div class={styles.container}>
          <EntryMenu title="业务操作" applicationCode={__ENV__.applicationCode} routes={routes} />
          <CellGroup inset class={styles.appGroup}>
            <Cell
              title="疏散指引"
              label="查看报警记录并获取疏散路线"
              isLink
              value={pendingCount.value > 0 ? `${pendingCount.value} 条待处理` : ""}
              onClick={() => {
                router.push({ name: "alarm-records" });
              }}
            />
            {import.meta.env.DEV ? (
              <Cell
                title="模拟报警预览"
                label={`经纬度 ${createDevMockAlarmRecord().alarmTargetLongitude}`}
                isLink
                onClick={() => {
                  router.push({ name: "evacuation-guide", query: { id: DEV_MOCK_ALARM_ID } });
                }}
              />
            ) : null}
          </CellGroup>
        </div>
      </>
    );
  },
});
