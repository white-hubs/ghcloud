import { Cell, CellGroup, showNotify, Icon } from "vant";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRouter } from "vue-router";

import { EntryMenu, CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { CubeAppBusinessBridge } from "@ghcloud/cube-app-js-sdk";

import { RatioPie } from "../../components/echart/ratio-pie";
import { useMetaTitle } from "../hooks/use-meta-title-hook";
import { cubeMaintainService } from "@/api/server";
import { routes } from "@/router";
import { getAssetsFile, timePeriod } from "@/utils";
import { updateObjectLocationIfAbsent } from "@/utils/update-object-location";

import styles from "./entry.module.less";
/** 入口页面 */
interface EventStatistics {
  name: string;
  num: number;
  ratio: number;
  event: string;
  type?: string;
}
export const Entry = defineComponent({
  name: "Entry",
  setup: () => {
    useMetaTitle();
    const router = useRouter();
    const handleScanCode = async (): Promise<void> => {
      try {
        // 扫码
        const codeEntity = await CubeAppBusinessBridge.handleBusinessScanCodeToObject();
        const targetId = codeEntity?.entityId ?? "";
        const targetCategory = codeEntity?.entityType ?? "";
        if (targetId?.length > 0) {
          await updateObjectLocationIfAbsent({ entityId: targetId, entityType: targetCategory });
          router.push({ path: "/inspection-object", query: { targetId, targetCategory } });
        } else {
          showNotify({ type: "danger", message: "实体对象数据异常" });
        }
      } catch (err) {
        showNotify({ type: "danger", message: "未查询到绑定对象" });
      }
    };
    const loading = ref(false);
    const inspectionRatio = reactive({
      completeRatio: 0,
      abnormalRatio: 0,
    });
    const eventStatistics = ref<EventStatistics[]>([
      { name: "今年巡检次数", num: 0, ratio: 0, event: "inspection" },
      { name: "正常次数", num: 0, ratio: 0, event: "inspection", type: "NORMAL" },
      { name: "异常次数", num: 0, ratio: 0, event: "inspection", type: "ABNORMAL" },
      { name: "今年巡检任务数", num: 0, ratio: 0, event: "task" },
      { name: "进行中任务数", num: 0, ratio: 0, event: "task", type: "EXECUTING" },
      { name: "过期未完成任务数", num: 0, ratio: 0, event: "task", type: "EXPIRE" },
    ]);
    const getData = async (): Promise<void> => {
      try {
        loading.value = true;
        const data = await cubeMaintainService.getInspectStatistics({ type: "THIS_YEAR", period: timePeriod("THIS_YEAR") });
        // 今年巡检次数
        eventStatistics.value[0].num = data.thisYearInspectionCount.num;
        eventStatistics.value[0].ratio = data.thisYearInspectionCount.ratio;
        // 正常次数
        eventStatistics.value[1].num = data.normalCount.num;
        eventStatistics.value[1].ratio = data.normalCount.ratio;
        // 异常次数
        eventStatistics.value[2].num = data.abnormalCount.num;
        eventStatistics.value[2].ratio = data.abnormalCount.ratio;
        // 今年巡检任务数
        eventStatistics.value[3].num = data.thisYearInspectionTaskCount.num;
        eventStatistics.value[3].ratio = data.thisYearInspectionTaskCount.ratio;
        // 进行中任务数
        eventStatistics.value[4].num = data.ongoingTaskCount.num;
        eventStatistics.value[4].ratio = data.ongoingTaskCount.ratio;
        // 过期未完成任务数
        eventStatistics.value[5].num = data.expiredTaskCount.num;
        eventStatistics.value[5].ratio = data.expiredTaskCount.ratio;
        // 完成率
        inspectionRatio.completeRatio = data.completeRatio;
        // 异常率
        inspectionRatio.abnormalRatio = data.abnormalRatio;
      } catch (error) {
        showNotify({ message: "获取数据失败", type: "danger" });
      } finally {
        setTimeout(() => {
          loading.value = false;
        }, 0);
      }
    };
    const toItem = (item: EventStatistics): void => {
      if (item.event === "inspection") {
        router.push({ path: "/standing-book", query: { type: item.type } });
      } else {
        router.push({ path: "/my-inspection", query: { status: item.type } });
      }
    };
    onMounted(() => {
      getData();
    });

    return (): VNode => (
      <>
        <CubeNavBar
          showBack
          title="日常巡检"
          rightSlot={() => (
            <>
              <Icon name="scan" size="20" onClick={handleScanCode} />
            </>
          )}
        />
        <div class={styles.container}>
          <EntryMenu title="业务操作" applicationCode={__ENV__.applicationCode} routes={routes} />
          <CellGroup inset class={styles["app-group"]}>
            <Cell border={false} title="数据总览" />
            <Cell border={false}>
              <div class={styles["inspection-num"]} v-show={!loading.value}>
                <div class={styles.radio}>
                  <div style={{ width: "60px", height: "60px" }}>
                    <RatioPie ratio={inspectionRatio.completeRatio} color="#2d6af2" />
                  </div>
                  <div style={{ textAlign: "center", marginTop: "8px" }}>
                    <span>{inspectionRatio.completeRatio}%</span>
                    <span>完成率</span>
                  </div>
                </div>
                <div class={styles.radio}>
                  <div style={{ width: "60px", height: "60px" }}>
                    <RatioPie ratio={inspectionRatio.abnormalRatio} color="#ee8e36" />
                  </div>
                  <div style={{ textAlign: "center", marginTop: "8px" }}>
                    <span>{inspectionRatio.abnormalRatio}%</span>
                    <span>异常率</span>
                  </div>
                </div>
              </div>
            </Cell>
            {/* 统计次数 */}
            <Cell border={false}>
              <div class={styles["inspection-num"]} v-show={!loading.value}>
                {eventStatistics.value.map((item) => (
                  <div
                    class={styles["inspection-num-item"]}
                    key={item.name}
                    onClick={() => {
                      toItem(item);
                    }}
                  >
                    <div class={styles["item-title"]}>{item.num}</div>
                    <div class={styles["item-radio"]}>
                      <span style={{ marginTop: "20px" }}>环比</span>
                      <span style={{ color: `${item.ratio < 0 ? "green" : "red"}` }}>
                        {item.ratio}%
                        <img
                          width="10"
                          src={item.ratio < 0 ? getAssetsFile("ic_trend_down.svg") : getAssetsFile("ic_trend_up.svg")}
                          alt=""
                        />
                      </span>
                    </div>
                    <div class={styles["item-name"]}>{item.name}</div>
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
