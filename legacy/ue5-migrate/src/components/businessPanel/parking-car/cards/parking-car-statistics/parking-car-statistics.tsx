import { defineComponent, onMounted, ref } from "vue";

import { parkingStore } from "../../store/parking";
import { cubeParkingLotService } from "@/api/service";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { getAssetsImage } from "@/utils/getImage";

import styles from "./parking-car-statistics.module.less";

export const ParkingCarStatistics = defineComponent({
  setup() {
    const store = parkingStore();
    const stats = ref({
      title: "车位总数",
      total: 0,
      icon: "overView30.png", // 您可以替换为您想要的图标
      subStats: [
        {
          label: "使用车位",
          value: 0,
          color: "#2989FF",
        },
        {
          label: "空闲车位",
          value: 0,
          color: "#19F8F7",
        },
      ],
    });
    const getData = async (): Promise<void> => {
      try {
        const result = await cubeParkingLotService.getParkingDetail(store.currentParking?.id);
        stats.value.total = result.totalNum ?? 0;
        stats.value.subStats[0].value = result.totalInNum ?? 0;
        stats.value.subStats[1].value = result.totalSpaceNum ?? 0;
      } catch {}
    };
    onMounted(() => {
      getData();
    });
    return () => (
      <SubPanelTemplate
        title="车位数量统计"
        zoomable
        zoom-title="车位数量统计详情"
        v-slots={{
          "zoom-content": () => (
            <div class={styles.zoomWrapper}>
              <div class={styles.zoomIconWrapper}>
                <img src={getAssetsImage("overView4.png")} />
                <img class={styles.zoomIcon} src={getAssetsImage(stats.value.icon)} />
              </div>
              <div class={styles.zoomInfo}>
                <div class={styles.zoomMainStat}>
                  <div class={styles.zoomStatTitle}>{stats.value.title}</div>
                  <CountTo class={styles.zoomValue} startVal={0} endVal={stats.value.total} duration={2000} separator="" />
                </div>
                <div class={styles.zoomSubStats}>
                  {stats.value.subStats.map((item) => (
                    <div class={styles.zoomSubStatItem}>
                      {item.label}:
                      <CountTo
                        class={styles.zoomSubValue}
                        startVal={0}
                        endVal={item.value}
                        style={{ color: item?.color }}
                        duration={2000}
                        separator=""
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ),
        }}
      >
        <div class={styles.wrapper} data-no-zoom>
          <div class={styles.iconWrapper}>
            <img src={getAssetsImage("overView4.png")} />
            <img class={styles.icon} src={getAssetsImage(stats.value.icon)} />
          </div>
          <div class={styles.info}>
            <div class={styles.mainStat}>
              <div class={styles.title}>{stats.value.title}</div>
              <CountTo class={styles.value} startVal={0} endVal={stats.value.total} duration={2000} separator="" />
            </div>
            <div class={styles.subStats}>
              {stats.value.subStats.map((item) => (
                <div class={styles.subStatItem}>
                  {item.label}:
                  <CountTo
                    class={styles.subValue}
                    startVal={0}
                    endVal={item.value}
                    style={{ color: item?.color }}
                    duration={2000}
                    separator=""
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </SubPanelTemplate>
    );
  },
});
