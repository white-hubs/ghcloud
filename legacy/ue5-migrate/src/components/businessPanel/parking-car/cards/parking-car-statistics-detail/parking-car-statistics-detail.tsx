import { defineComponent, onMounted, ref } from "vue";

import { useParkArea } from "../../hooks/use-park-area";
import { parkingStore } from "../../store/parking";
import { cubeParkingLotService } from "@/api/service";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import NoData from "@/components/businessPanel/public/noData.vue";
import { ProgressBar } from "@/components/businessPanel/public/progress-bar/progress-bar";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { getAssetsImage } from "@/utils/getImage";

import styles from "./parking-car-statistics-detail.module.less";

export const ParkingCarStatisticsDetail = defineComponent({
  setup() {
    const store = parkingStore();
    const { showParkArea } = useParkArea();
    const stats = ref({
      title: "车位总数",
      total: 0,
      icon: "overView30.png",
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
    const list = ref([]);
    const getData = async (): Promise<void> => {
      try {
        const params = {
          source: "SELF_BUILT",
        };
        const result = await Promise.all([cubeParkingLotService.getParkingInfo(params), cubeParkingLotService.getParkingLotList(params)]);
        stats.value.total = result[0]?.totalNum ?? 0;
        stats.value.subStats[0].value = result[0]?.totalInNum ?? 0;
        stats.value.subStats[1].value = result[0]?.totalSpaceNum ?? 0;

        list.value = (result[1] ?? [])
          .map((item) => ({
            ...item,
            label: item?.name ?? item?.areaName ?? "",
            value: item?.totalSpaceNum ?? 0,
            totalNum: item?.totalNum ?? 0,
          }))
          ?.sort((a, b) => {
            if (b.value === a.value) {
              return b.totalNum - a.totalNum;
            }
            return b.value - a.value;
          });
      } catch {}
    };
    onMounted(() => {
      getData();
    });
    const handleCurrent = (item) => {
      store.updateCurrentParking(item);
      showParkArea();
    };

    return () => (
      <SubPanelTemplate
        title="车位总览"
        zoomable
        zoom-title="车位总览详情"
        zoom-width={600}
        v-slots={{
          "zoom-content": () => (
            <div class={styles.zoomDetail}>
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
                      <div class={styles.zoomSubStatItem} key={item.label}>
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
              <div class={styles.zoomList} data-no-zoom>
                {list.value?.length === 0 && <NoData />}
                {list.value.map((item) => (
                  <div class={styles.zoomItem} key={item.label}>
                    <ProgressBar
                      total={item.totalNum}
                      label={item.label}
                      value={item.value}
                      unit="个"
                      onClick={() => handleCurrent(item)}
                    />
                  </div>
                ))}
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
                <div class={styles.subStatItem} key={item.label}>
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
        <div class={styles.auto} data-no-zoom>
          {list.value?.length === 0 && <NoData />}
          {list.value.map((item) => (
            <div class={styles.item} key={item.label}>
              <ProgressBar total={item.totalNum} label={item.label} value={item.value} unit="个" onClick={() => handleCurrent(item)} />
            </div>
          ))}
        </div>
      </SubPanelTemplate>
    );
  },
});
