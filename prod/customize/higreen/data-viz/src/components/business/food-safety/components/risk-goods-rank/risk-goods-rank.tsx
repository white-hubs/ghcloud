import { RankItem } from "./components/rank-item";
import styles from "./index.module.less";
import { cubeFoodSafetyService } from "@/api/service";
import { SubTitle } from "@/components/sub-title/sub-title";
import { useApiTimer } from "@/hook/use-utils";
import dayjs from "dayjs";
import { defineComponent, onMounted, reactive } from "vue";
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";
export const RiskGoodsRank = defineComponent({
  setup: () => {
    onMounted(() => {
      useApiTimer(getData);
    });
    const state = reactive<{
      rankData: { name: string; count: number; progress: number }[];
    }>({
      rankData: [],
    });
    const getData = async (): Promise<void> => {
      const result = await cubeFoodSafetyService.getFoodSafetyRiskRank({
        day: dayjs().format("YYYY-MM-DD"),
      });
      state.rankData = result.map((item) => {
        const first = Number(result[0].trendY);
        return {
          name: item.trendX,
          count: Number(item.trendY),
          progress: (Number(item.trendY) / first) * 100,
        };
      });
    };
    return (): JSX.Element => (
      <div class={styles.container}>
        <SubTitle title="近30天风险商品预警排名" />
        <div class={[styles["rank-wrap"], !state.rankData.length && styles["rank-empty"]]}>
          {state.rankData.length > 0 ? (
            <Vue3SeamlessScroll list={state.rankData} step={0.5} hover singleHeight={24}>
              <div class={styles.rank}>
                {state.rankData.map((item, index) => (
                  <RankItem key={index} index={index} item={item} />
                ))}
              </div>
            </Vue3SeamlessScroll>
          ) : (
            <div class={styles.empty}>
              <img src="/apps/@ghcloud/higreen-data-viz/images/empty-rank.png" alt="" srcset="" />
              <div class={styles.text}>暂无数据</div>
            </div>
          )}
        </div>
      </div>
    );
  },
});
