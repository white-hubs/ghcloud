import { Skeleton } from "ant-design-vue";
import { computed, defineComponent, onMounted, ref } from "vue";

import { showKeyPlaceMarker } from "@/features/cards/zhongda-heshun/utils/common";
import { drawGeoJsonLayer } from "@/features/cards/zhongda-heshun/utils/gis-helper";
import { createKeyPlaceModal } from "@/features/cards/zhongda-heshun/utils/modal-helper";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeZDDataVizService } from "@/infrastructure/api/service";
import { debounce } from "@/infrastructure/utils/common";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import ElevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import NoData from "@/shared-ui/panel/noData";
import { clearMap } from "@/visualization-core/event/register/gis";

import styles from "./xsk-key-place-percentage.module.less";

/** 重点场所占比 */
export const XSKKeyPlacePercentage = defineComponent({
  setup() {
    const keyPlaceList = ref([]);
    const filteredData = computed(() => {
      const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#67B9C1"];
      const data = keyPlaceList.value;
      return data.map((item, i) => {
        return {
          ...item,
          color: colors[i % colors.length],
        };
      });
    });
    const total = computed(() => keyPlaceList.value.reduce((pre, cur) => pre + cur.value, 0));
    const loading = ref(false);
    const getData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await cubeZDDataVizService.getKeyPlaceDistribution();
        if (res) {
          keyPlaceList.value = [];
          const list = (res ?? []).map((item) => {
            return {
              name: item.keyName,
              value: item.number,
              id: item.keyId,
            };
          });
          keyPlaceList.value = list;
        }
      } catch {
      } finally {
        setTimeout(() => {
          loading.value = false;
        }, 500);
      }
    };
    onMounted(() => {
      getData();
    });
    const handleValueCurrent = async (item: { name: string; value: number }): Promise<void> => {
      createKeyPlaceModal(item.name, { dataTypeName: item.name });
    };
    const handleTitleCurrent = debounce(async (item: { name: string; value: number }): Promise<void> => {
      clearMap();
      const cur = keyPlaceList.value.find((e) => e.name === item.name);
      await showKeyPlaceMarker({ dataTypeId: cur?.id || "" });
      drawGeoJsonLayer();
    }, 300);
    return (): JSX.Element => (
      <SubPanelTemplate titleFontSize="22px">
        <Skeleton loading={loading.value} active>
          {filteredData.value?.length === 0 && <NoData />}
          {filteredData.value?.length > 0 && (
            <div class={styles["charts"]}>
              <ElevatorAnalysisPie
                onClickbar={handleTitleCurrent}
                style="width: 38%; height: 1.0416rem"
                radius={"75"}
                pieData={filteredData.value}
              >
                <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
                  <CountTo
                    startVal={0}
                    endVal={total.value || 0}
                    duration={2000}
                    separator=""
                    style="color: #fff; text-align: center; font-size: 22px;"
                  ></CountTo>
                  <div style="color: #fff; text-align: center; font-size: 16px;white-space: nowrap;">场所总数</div>
                </div>
              </ElevatorAnalysisPie>
              <ElevatorAnalysisList
                showRatio={true}
                contentList={filteredData.value}
                warperClassName={styles["right-list"]}
                onClickName={handleTitleCurrent}
                onClickValue={handleValueCurrent}
              />
            </div>
          )}
        </Skeleton>
      </SubPanelTemplate>
    );
  },
});
