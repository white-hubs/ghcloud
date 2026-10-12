import { Skeleton } from "ant-design-vue";
import { computed, defineComponent, onMounted, ref } from "vue";

import { PointListBody, type PointFlowItem } from "./point-list-body";
import { usePeopleFlow } from "@/features/cards/people-flow/hooks/use-people-flow";
import { trafficStore } from "@/features/cards/people-flow/store/traffic";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeTrafficStatisticsService } from "@/infrastructure/api/service";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";

import "./people-flow-point.module.less";

const scrollThreshold = 5;

export const PeopleFlowPoint = defineComponent({
  name: "PeopleFlowPoint",
  setup() {
    const store = trafficStore();
    const { showPoint } = usePeopleFlow();

    const timeRange = ref({ timeType: "TODAY", dateRange: [] as string[] });
    const list = ref<PointFlowItem[]>([]);
    const loading = ref(false);

    const total = computed(() => list.value.reduce((sum, item) => sum + item.value, 0));

    const getData = async (): Promise<void> => {
      try {
        loading.value = true;
        const result = await cubeTrafficStatisticsService.getTrafficDeviceStat({
          type: timeRange.value.timeType,
          period: timeRange.value.dateRange.join(","),
          trafficDetectionAreaIds: [store.currentTraffic?.id],
        });

        list.value = (result ?? [])
          .map((item, index) => ({
            ...item,
            key: String(item.id ?? `${item.name ?? "point"}-${index}`),
            label: item.name || `点位${index + 1}`,
            value: Number(item.totalPersonNumber) || 0,
          }))
          .sort((a, b) => b.value - a.value);
      } catch {
        list.value = [];
      } finally {
        loading.value = false;
      }
    };

    const handleCurrent = (item: PointFlowItem): void => {
      showPoint(item);
    };

    onMounted(() => {
      void getData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <PointListBody
        list={list.value}
        total={total.value}
        pointCount={list.value.length}
        scrollThreshold={scrollThreshold}
        isZoom={isZoom}
        data-no-zoom
        onSelect={handleCurrent}
      />
    );

    return () => (
      <div class="people-flow-point-v2-root v2-panel-root">
        <SubPanelTemplate
          title="各点位人流量"
          class="visual-v2-sub-panel people-flow-point-v2-panel v2-panel-card"
          zoomable
          zoom-title="各点位人流量详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => (
              <span class="v2-title-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" class="v2-title-icon-svg">
                  <path
                    d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            ),
            extra: () => <DateInlineForm v-model:modelValue={timeRange.value} data-no-zoom onSearch={getData} />,
            "zoom-content": () => (
              <Skeleton loading={loading.value} active>
                {renderBody(true)}
              </Skeleton>
            ),
          }}
        >
          <Skeleton loading={loading.value} active>
            {renderBody(false)}
          </Skeleton>
        </SubPanelTemplate>
      </div>
    );
  },
});
