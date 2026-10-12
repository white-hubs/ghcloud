import { Skeleton } from "ant-design-vue";
import { defineComponent, ref, onMounted } from "vue";

import { ProgressBar } from "@/features/cards/zhongda-heshun/components/progress-bar/progress-bar";
import { createKeyPlaceModal } from "@/features/cards/zhongda-heshun/utils/modal-helper";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeZDDataVizService } from "@/infrastructure/api/service";
import NoData from "@/shared-ui/panel/noData";

import styles from "./xsk-key-place-distribution.module.less";

/** 重点场所分布 */
export const XSKKeyPlaceDistribution = defineComponent({
  setup() {
    const dataList = ref([]);
    const total = ref(100);
    const loading = ref(false);
    const getData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await cubeZDDataVizService.getFocusDistribution();
        if (res) {
          dataList.value = [];
          dataList.value = res.map((item) => ({
            ...item,
            name: item.keyName,
            value: item.number,
          }));
          total.value = res.reduce((acc, cur) => acc + cur.number, 0);
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
    const handleCurrent = async (item: { label: string; value: number }): Promise<void> => {
      createKeyPlaceModal("重点场所", { area: item.label }, true);
    };
    return (): JSX.Element => (
      <SubPanelTemplate titleFontSize="22px">
        <Skeleton active loading={loading.value} paragraph={{ rows: 6 }}>
          <div class={styles.scroll}>
            {dataList.value?.length === 0 && <NoData />}
            {dataList.value.map((item) => (
              <div class={styles.item} key={item.name}>
                <ProgressBar total={total.value} label={item.name} value={item.value} onClick={handleCurrent} />
              </div>
            ))}
          </div>
        </Skeleton>
      </SubPanelTemplate>
    );
  },
});
