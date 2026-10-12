import { Skeleton } from "ant-design-vue";
import { defineComponent, onMounted, ref } from "vue";

import { ProgressBar } from "@/features/cards/zhongda-heshun/components/progress-bar/progress-bar";
import { openProjectModal } from "@/features/cards/zhongda-heshun/components/project-modal/project-modal";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeZDDataVizService } from "@/infrastructure/api/service";
import NoData from "@/shared-ui/panel/noData";

import styles from "./zd-project-area.module.less";

/** 项目区域分布 */
export const ZDProjectArea = defineComponent({
  setup() {
    const loading = ref(false);
    const dataList = ref([]);
    const total = ref(100);
    const getData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await cubeZDDataVizService.getProjectDistribution();
        if (res) {
          dataList.value = [];
          dataList.value = res.map((item) => ({
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

    const handleCurrent = async (item: { label: string; name: string; value: number }): Promise<void> => {
      await openProjectModal({
        title: "项目列表",
        data: {
          area: item.label,
        },
      });
    };
    onMounted(() => {
      getData();
    });
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
