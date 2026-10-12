import { usePeopleFlow } from "../../hooks/use-people-flow";
import { trafficStore } from "../../store/traffic";
import styles from "./people-flow-point.module.less";
import { cubeTrafficStatisticsService } from "@/api/service";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import NoData from "@/components/businessPanel/public/noData.vue";
import { ProgressBar } from "@/components/businessPanel/public/progress-bar/progress-bar";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { TrafficDetectionDeviceStatVO } from "@ghcloud/cube-traffic-detection-service";
import { defineComponent, reactive, onMounted, ref, computed } from "vue";
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";

// 各点位人流量
export const PeopleFlowPoint = defineComponent({
  name: "PeopleFlowPoint",
  setup() {
    const { showPoint } = usePeopleFlow();
    const store = trafficStore();
    const timeRange = ref({
      timeType: "TODAY",
      dateRange: [],
    });
    const list = ref([
      // {
      //   name: '点位一',
      //   value: 50,
      // },
      // {
      //   name: '点位二',
      //   value: 70,
      // },
    ]);
    const total = computed(() => {
      return list.value.reduce((acc, cur) => acc + cur.value, 0);
    });

    const getData = async (): Promise<void> => {
      try {
        const params = {
          type: timeRange.value.timeType,
          period: timeRange.value.dateRange.join(","),
          trafficDetectionAreaIds: [store.currentTraffic?.id],
        };
        const result = await cubeTrafficStatisticsService.getTrafficDeviceStat(params);
        list.value = (result ?? [])?.map((item) => {
          return {
            ...item,
            label: item.name,
            value: item.totalPersonNumber,
          };
        });
      } catch {}
    };
    onMounted(() => {
      getData();
    });
    const handleCurrent = (item: TrafficDetectionDeviceStatVO) => {
      showPoint(item);
    };
    return () => (
      <SubPanelTemplate
        title="各点位人流量"
        v-slots={{
          extra: () => <DateInlineForm v-model:modelValue={timeRange.value} onSearch={getData} />,
        }}
      >
        <div class={list.value?.length < 5 ? styles.auto : styles.scroll}>
          {list.value?.length === 0 && <NoData />}
          {list.value?.length < 5 ? (
            list.value.map((item, index) => (
              <div class={styles.item} key={item.label}>
                <ProgressBar
                  total={total.value}
                  label={item.label}
                  rank={index + 1}
                  showRank
                  value={item.value}
                  onClick={() => handleCurrent(item)}
                />
              </div>
            ))
          ) : (
            <Vue3SeamlessScroll list={list.value} step={0.5} hover={true} style={{ height: "100%", overflow: "hidden" }}>
              {list.value.map((item, index) => (
                <div class={styles.item} key={item.label}>
                  <ProgressBar
                    total={total.value}
                    label={item.label}
                    rank={index + 1}
                    showRank
                    value={item.value}
                    onClick={() => handleCurrent(item)}
                  />
                </div>
              ))}
            </Vue3SeamlessScroll>
          )}
        </div>
      </SubPanelTemplate>
    );
  },
});
