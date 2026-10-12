import dayjs from "dayjs";
import { defineComponent, ref, watch } from "vue";

import { Button, Empty, PopOver } from "@ghcloud/cube-ui";

import { showAlarmInfoModal } from "../alarm-info-modal/alarm-info-modal";
import { DataCard } from "../data-card/data-card";
import { SeamlessScroll } from "../seamless-scroll/seamless-scroll";
import { cubeAlarmCenterService } from "@/api/server";

import styles from "./card-alarm-info.module.less";

type TodayTimeParams = {
  period: string;
};

export const CardAlarmInfo = defineComponent({
  name: "CardAlarmInfo",
  props: {
    areaId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const loading = ref(true);
    const getTodayTimeParams = (): TodayTimeParams => {
      const period = `${dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss")},${dayjs().endOf("day").format("YYYY-MM-DD HH:mm:ss")}`;
      return {
        period,
      };
    };
    const getAlarmStat = async (areaId: string) => {
      const timeParams = getTodayTimeParams();
      const result = await cubeAlarmCenterService.getAlarmStatusStatistics({
        areaId: areaId,
        areaLike: false,
        ...timeParams,
      } as {
        areaId: string;
        areaLike: boolean;
      } & TodayTimeParams);
      const calcList = result.filter((item) => item.alarmStatus !== "TIME_OUT_UN_HANDLER");
      alarmCount.value.total.value = calcList.reduce((cur, pre) => cur + pre.alarmNum, 0);
      alarmCount.value.processed.value = calcList.find((item) => item.alarmStatus === "ALARM_HANDLER")?.alarmNum || 0;
      alarmCount.value.unprocessed.value = alarmCount.value.total.value - alarmCount.value.processed.value;
    };
    const getAlarmList = async (areaId: string) => {
      const timeParams = getTodayTimeParams();
      const result = await cubeAlarmCenterService.getAlarmRecordsPage({
        pageNumber: 1,
        pageSize: 10,
        userId: "",
        areaIds: areaId,
        ...timeParams,
      });
      tableData.value = result.records.map((item) => ({
        alarmTime: dayjs(item.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
        alarmLevel: item.alarmLevelName,
        alarmEvent: item.alarmEventName,
        alarmStatus: item.alarmStatusName,
      }));
    };
    const queryData = async () => {
      try {
        loading.value = true;
        await Promise.all([getAlarmStat(props.areaId), getAlarmList(props.areaId)]);
      } finally {
        loading.value = false;
      }
    };
    watch(
      () => props.areaId,
      () => {
        props.areaId && queryData();
      },
      {
        immediate: true,
      },
    );
    const alarmCount = ref({
      total: {
        label: "报警数",
        value: 0,
      },
      unprocessed: {
        label: "未处理数",
        value: 0,
      },
      processed: {
        label: "已处理数",
        value: 0,
      },
    });

    const tableColumns = [
      {
        key: "alarmTime",
        label: "报警时间",
      },
      {
        key: "alarmLevel",
        label: "报警级别",
      },
      {
        key: "alarmEvent",
        label: "设备事件",
      },
      {
        key: "alarmStatus",
        label: "状态",
      },
    ];

    const tableData = ref([
      {
        alarmTime: "2023-01-01 00:00:00",
        alarmLevel: "高",
        alarmEvent: "设备故障",
        alarmStatus: "未处理",
      },
      {
        alarmTime: "2023-01-01 00:00:00",
        alarmLevel: "中",
        alarmEvent: "设备故障",
        alarmStatus: "未处理",
      },
      {
        alarmTime: "2023-01-01 00:00:00",
        alarmLevel: "低",
        alarmEvent: "设备故障",
        alarmStatus: "未处理",
      },
      {
        alarmTime: "2023-01-01 00:00:00",
        alarmLevel: "低",
        alarmEvent: "设备故障",
        alarmStatus: "已处理",
      },
      {
        alarmTime: "2023-01-01 00:00:00",
        alarmLevel: "低",
        alarmEvent: "设备故障",
        alarmStatus: "已处理",
      },
    ]);
    return (): JSX.Element => (
      <DataCard
        title="报警信息"
        loading={loading.value}
        v-slots={{
          titleExtra: () => (
            <Button type="link" size="small" style={{ padding: 0 }} onClick={() => showAlarmInfoModal(props.areaId)}>
              查看更多
            </Button>
          ),
        }}
      >
        <div class={styles.top}>
          {Object.values(alarmCount.value).map((item) => (
            <div class={styles.item} key={item.label}>
              <div class={styles.label}>{item.label}</div>
              <div class={styles.value}>{item.value}</div>
            </div>
          ))}
        </div>
        <div class={styles.table}>
          <div class={`${styles["table-row"]} ${styles["table-header"]}`}>
            {tableColumns.map((item) => (
              <div class={styles["table-cell"]} key={item.key}>
                {item.label}
              </div>
            ))}
          </div>
          <div class={styles["table-scroll"]} style={{ height: 32 * 4 + "px" }}>
            {tableData.value.length !== 0 && (
              <SeamlessScroll list={tableData.value} step={0.2} singleHeight={32}>
                {{
                  default: ({ data, index }: { data: (typeof tableData.value)[number]; index: number }) => (
                    <div class={`${styles["table-row"]} ${index % 2 === 0 ? styles["even-row"] : ""}`}>
                      {tableColumns.map((col) => (
                        <div class={`${styles["table-cell"]}`} key={col.key}>
                          <PopOver content={data[col.key as keyof typeof data]}>{data[col.key as keyof typeof data]}</PopOver>
                        </div>
                      ))}
                    </div>
                  ),
                }}
              </SeamlessScroll>
            )}
            {tableData.value.length === 0 && <Empty description="暂无数据" />}
          </div>
        </div>
      </DataCard>
    );
  },
});
