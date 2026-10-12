import { Pie } from "../components/echart/pie";
import { useMetaTitle } from "../hooks/use-meta-title-hook";
import styles from "./index.module.less";
import { cubeHiddenDangerService, cubeMaintainService } from "@/api/server";
import { routes } from "@/router";
import { timePeriod } from "@/utils";
import { CubeNavBar, EntryMenu } from "@ghcloud/cube-app-generic-component";
import { Cell, CellGroup, showNotify, Skeleton } from "vant";
import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
interface HiddenData {
  name: string;
  value: number;
}
/** 入口页面 */
export const Entry = defineComponent({
  name: "Entry",
  setup: () => {
    const router = useRouter();
    const loading = ref(false);
    const statistics = [
      { name: "发起数", type: "SUBMIT", value: 0 },
      { name: "待处理数", type: "WAITING", value: 0 },
      { name: "处理数", type: "HANDLED", value: 0 },
    ];
    const timeOptions = [
      { label: "今日", value: timePeriod() },
      { label: "本周", value: timePeriod("WEEK") },
      { label: "本月", value: timePeriod("MONTH") },
      { label: "今年", value: timePeriod("YEAR") },
    ];
    const hiddenLevelList = ref<HiddenData[]>([]);
    const hiddenClassifyList = ref<HiddenData[]>([]);
    const colors = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"];
    const timeSelect = ref(timePeriod());
    const getData = async (): Promise<void> => {
      try {
        loading.value = true;
        const { hiddenClassify, hiddenLevel } = await cubeMaintainService.getHiddenStatistics({ period: timeSelect.value });
        hiddenClassifyList.value = hiddenClassify.map((x, i) => ({ name: x.name, value: x.num, itemStyle: { color: colors[i] } }));
        hiddenLevelList.value = hiddenLevel.map((x, i) => ({ name: x.name, value: x.num, itemStyle: { color: colors[i] } }));
        const { waitingCount, finishedCount, submitCount } = await cubeHiddenDangerService.genFlowNumber({
          period: timeSelect.value,
          applicationCode: "HIDDENDANGER",
        });
        statistics[0].value = submitCount;
        statistics[1].value = waitingCount;
        statistics[2].value = finishedCount;
      } catch {
        showNotify({ message: "获取数据失败- hidden", type: "danger" });
      } finally {
        loading.value = false;
      }
    };

    const timeChange = (value: string): void => {
      timeSelect.value = value;
      getData();
    };
    onMounted(() => {
      getData();
      useMetaTitle();
    });

    return (): JSX.Element => (
      <>
        <CubeNavBar showBack title="隐患排查" />
        <div class={styles.container}>
          <EntryMenu applicationCode="HIDDENDANGER" routes={routes} title="业务操作" />
          <CellGroup inset class={styles["app-group"]}>
            <Cell
              title="隐患排查"
              v-slots={{
                value: () => (
                  <div class={styles["time-picker"]}>
                    {timeOptions.map((e) => (
                      <div
                        key={e.label}
                        class={`${e.value === timeSelect.value ? styles["time-picker-selected"] : ""}`}
                        onClick={() => {
                          timeChange(e.value);
                        }}
                      >
                        {e.label}
                      </div>
                    ))}
                  </div>
                ),
              }}
            />
            <Cell>
              <div class={styles["stat-bottom"]} v-show={!loading.value}>
                {statistics.map((item) => (
                  <div
                    class={styles["stat-bottom-item"]}
                    key={item.name}
                    onClick={() => {
                      if (item.value > 0) {
                        router.push({ path: "/hidden-danger-list", query: { type: item.type, period: timeSelect.value } });
                      }
                    }}
                  >
                    <div class={styles["stat-bottom-item-title"]}>{item.value}</div>
                    <div class={styles["stat-bottom-item-value"]}>{item.name}</div>
                  </div>
                ))}
              </div>
              <Skeleton row={3} animated v-show={loading.value} />
            </Cell>
          </CellGroup>
          <CellGroup inset class={styles["echart-group"]}>
            <Cell title="隐患任务" />
            <Cell>
              <div class={styles.hidden}>
                <div class={styles.item}>
                  <div class={styles.pie}>
                    <Pie
                      legend={{
                        show: false,
                      }}
                      label={{
                        show: false,
                      }}
                      labelLine={{
                        show: false,
                      }}
                      radius={["53%", "70%"]}
                      name="隐患级别"
                      data={hiddenLevelList.value}
                    />
                  </div>
                  <ul>
                    {hiddenLevelList.value.map((x, i) => (
                      <li key={x.name}>
                        <span class={styles.dot} style={{ background: colors[i] }} />
                        <span class={styles["item-name"]}>{x.name}</span>
                        <span class={styles["item-value"]}>{x.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div class={styles.item}>
                  <div class={styles.pie}>
                    <Pie
                      legend={{
                        show: false,
                      }}
                      label={{
                        show: false,
                      }}
                      labelLine={{
                        show: false,
                      }}
                      radius={["53%", "70%"]}
                      name="隐患分类"
                      data={hiddenClassifyList.value}
                    />
                  </div>
                  <ul>
                    {hiddenClassifyList.value.map((x, i) => (
                      <li key={x.name}>
                        <span class={styles.dot} style={{ background: colors[i] }} />
                        <span class={styles["item-name"]}>{x.name}</span>
                        <span class={styles["item-value"]}>{x.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Cell>
          </CellGroup>
        </div>
      </>
    );
  },
});
