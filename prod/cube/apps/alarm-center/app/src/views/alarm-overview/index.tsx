import dayjs from "dayjs";
import { debounce } from "lodash";
import { defineComponent, onMounted, reactive, ref } from "vue";

import type { AlarmStatisticsTypeRank } from "@ghcloud/cube-alarm-center-service/src/types/alarm-center";
import {
  Button,
  Form,
  FormItem,
  DateRangePicker,
  RadioGroup,
  AlertTwoTone,
  FileUnknownTwoTone,
  FileAddTwoTone,
  ScheduleTwoTone,
  FireTwoTone,
  FileExcelTwoTone,
  Card,
  Spin,
  Empty,
} from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { Layout } from "@ghcloud/generic-component";

import { Bar } from "./components/bar";
import { Line } from "./components/line";
import { cubeAlarmCenterService } from "@/api/service";

import styles from "./index.module.less";

const DateTypes = {
  TODAY: "TODAY",
  THIS_WEEK: "THIS_WEEK",
  THIS_MONTH: "THIS_MONTH",
  THIS_YEAR: "THIS_YEAR",
};

const DateTypeOptions = [
  { label: "今日", value: DateTypes.TODAY },
  { label: "本周", value: DateTypes.THIS_WEEK },
  { label: "本月", value: DateTypes.THIS_MONTH },
  { label: "本年", value: DateTypes.THIS_YEAR },
];

// 类型定义
interface AlarmStatusItem {
  label: string;
  value: number;
  icon: JSX.Element;
}

interface AlarmResultItem {
  label: string;
  value: number;
  icon: JSX.Element;
}

export const AlarmOverview = defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const state = reactive({
      chartData: [] as AlarmStatisticsTypeRank[],
      lineData: [] as { name: string; value: number }[],
      period: null as string | null,
      alarmNum: 0,
    });

    const alarmNumList: AlarmStatusItem[] = [
      { label: "待确认", value: 0, icon: <FileUnknownTwoTone /> },
      { label: "处理中", value: 0, icon: <FileAddTwoTone /> },
      { label: "已挂起", value: 0, icon: <ScheduleTwoTone /> },
      { label: "已确认", value: 0, icon: <ScheduleTwoTone /> },
    ];

    const alarmResultList: AlarmResultItem[] = [
      { label: "实报", value: 0, icon: <FireTwoTone /> },
      { label: "误报", value: 0, icon: <FileExcelTwoTone /> },
    ];

    const period = ref<string>(`${dayjs().format("YYYY-MM-DD 00:00:00")},${dayjs().format("YYYY-MM-DD 23:59:59")}`);
    const datePickerValue = ref([dayjs().format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")]);
    const type = ref<string>(DateTypes.TODAY);
    const loading = ref(false);

    const formatDateRange = (start: string, end: string): string => `${start},${end}`;

    const changePicker = (data: string[]): void => {
      if (data.length !== 2 || !data[0] || !data[1]) {
        return;
      }

      period.value = formatDateRange(
        dayjs(data[0]).startOf("day").format("YYYY-MM-DD HH:mm:ss"),
        dayjs(data[1]).endOf("day").format("YYYY-MM-DD HH:mm:ss"),
      );
      getData();
    };

    const changeDateType = (value: string): void => {
      type.value = value;
      let startDate, endDate;

      switch (value) {
        case DateTypes.TODAY:
          startDate = dayjs().format("YYYY-MM-DD 00:00:00");
          endDate = dayjs().format("YYYY-MM-DD 23:59:59");
          break;
        case DateTypes.THIS_WEEK:
          startDate = dayjs().startOf("week").format("YYYY-MM-DD 00:00:00");
          endDate = dayjs().endOf("week").format("YYYY-MM-DD 23:59:59");
          break;
        case DateTypes.THIS_MONTH:
          startDate = dayjs().startOf("month").format("YYYY-MM-DD 00:00:00");
          endDate = dayjs().endOf("month").format("YYYY-MM-DD 23:59:59");
          break;
        case DateTypes.THIS_YEAR:
          startDate = dayjs().startOf("year").format("YYYY-MM-DD 00:00:00");
          endDate = dayjs().format("YYYY-MM-DD 23:59:59");
          break;
        default:
          startDate = dayjs().format("YYYY-MM-DD 00:00:00");
          endDate = dayjs().format("YYYY-MM-DD 23:59:59");
      }

      period.value = formatDateRange(startDate, endDate);
      datePickerValue.value = [dayjs(startDate).format("YYYY-MM-DD"), dayjs(endDate).format("YYYY-MM-DD")];
      debouncedGetData();
    };

    const getData = async (): Promise<void> => {
      try {
        loading.value = true;
        const [AlarmRes, TypeRankRes, TrendRes] = await Promise.all([
          cubeAlarmCenterService.getAlarmStatistics({ period: period.value || "" }),
          cubeAlarmCenterService.getAlarmStatisticsTypeRank({ period: period.value || "" }),
          cubeAlarmCenterService.getAlarmStatisticsTrend({ period: period.value || "", type: type.value }),
        ]);

        state.alarmNum = Number(AlarmRes?.alarmNum || 0);
        state.chartData = TypeRankRes ?? [];
        state.lineData = (TrendRes ?? []).map((e) => ({
          value: Number(e?.alarmNum ?? 0),
          name: e.period,
        }));

        alarmNumList[0].value = AlarmRes?.alarmStatusStatisticsVOS?.find((e) => e.alarmStatus === "ALARM_UN_CONFIRMED")?.alarmNum || 0;
        alarmNumList[1].value =
          AlarmRes?.alarmStatusStatisticsVOS?.find((e) => e.alarmStatus === "ALARM_PROGRESS_CONFIRMED")?.alarmNum || 0;
        alarmNumList[2].value = AlarmRes?.alarmStatusStatisticsVOS?.find((e) => e.alarmStatus === "ALARM_SUSPEND")?.alarmNum || 0;
        alarmNumList[3].value = AlarmRes?.alarmStatusStatisticsVOS?.find((e) => e.alarmStatus === "ALARM_HANDLER")?.alarmNum || 0;

        alarmResultList[0].value = AlarmRes?.alarmResultStatisticsVOS?.find((e) => e.alarmHandlerResult === "ALARM_ACTUAL")?.alarmNum || 0;
        alarmResultList[1].value =
          AlarmRes?.alarmResultStatisticsVOS?.find((e) => e.alarmHandlerResult === "ALARM_IMPRACTICAL")?.alarmNum || 0;
      } catch {
      } finally {
        loading.value = false;
      }
    };
    const debouncedGetData = debounce(getData, 500);

    const queryForm = (): void => {
      debouncedGetData();
    };

    const reset = (): void => {
      type.value = DateTypes.TODAY;
      changeDateType(DateTypes.TODAY);
    };

    onMounted(() => {
      queryForm();
    });

    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <Form layout="inline" style="margin-top:10px">
          <FormItem class={styles["search-item"]}>
            <RadioGroup v-model:value={type.value} buttonStyle="solid" options={DateTypeOptions} onChange={changeDateType} />
          </FormItem>
          <FormItem label="时间范围" class={styles["search-item"]}>
            <DateRangePicker
              v-model:value={datePickerValue.value}
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
              onChangePicker={changePicker}
            />
          </FormItem>
          <FormItem label="" class={styles["search-item"]}>
            <Button type="primary" onClick={queryForm}>
              查询
            </Button>
            <Button style={{ marginLeft: "10px" }} onClick={reset}>
              重置
            </Button>
          </FormItem>
        </Form>
      ),
      "layout-content": (): JSX.Element => (
        <Spin spinning={loading.value}>
          <div class={styles["alarm-info"]}>
            <div class={styles["alarm-info-up"]}>
              <Card title="报警统计" style={{ height: "286px" }} size="small">
                <div class={styles["alarm-num"]}>
                  <div class={styles["search-item"]}>
                    <div class={styles["alarm-num-left"]}>
                      <div class={styles["left-info-icon"]}>
                        <AlertTwoTone style={{ fontSize: "30px" }} />
                      </div>
                      <div class={styles["left-info-label"]}>报警总数</div>
                    </div>
                    <div class={styles["left-num"]}>
                      <span>{state.alarmNum ?? "0"}</span>个
                    </div>
                  </div>
                  <div class={styles["alarm-num-right"]}>
                    {alarmNumList.map((item, index) => (
                      <div key={index}>
                        {item.icon}
                        {item.label}
                        <span>{item.value ?? "0"}</span>个
                      </div>
                    ))}
                  </div>
                </div>
                <div class={styles["alarm-result"]}>
                  {alarmResultList.map((item, index) => (
                    <div key={index}>
                      {item.icon}
                      {item.label}
                      <span>{item.value ?? "0"}</span>个
                    </div>
                  ))}
                </div>
              </Card>
              <Card title="报警类型" style={{ height: "286px" }} size="small">
                {state.chartData?.length === 0 ? (
                  <Empty />
                ) : (
                  <div style={{ height: "260px" }}>
                    <Bar chartData={state.chartData} />
                  </div>
                )}
              </Card>
            </div>
            <div class={styles["alarm-info-down"]}>
              <Card title="报警趋势" size="small">
                {state.lineData?.length === 0 ? (
                  <Empty />
                ) : (
                  <div style={{ height: "245px" }}>
                    <Line
                      dayType={type.value}
                      chartData={state.lineData}
                      lineStyleColor="rgba(24, 141, 255, 1)"
                      areaStyleColor="rgba(24, 141, 255, .2)"
                    />
                  </div>
                )}
              </Card>
            </div>
          </div>
        </Spin>
      ),
    };

    return (): JSX.Element => (
      <div style={{ height: "100%" }}>
        <Layout title={pageTitle} v-slots={layoutSlots} />
      </div>
    );
  },
});
