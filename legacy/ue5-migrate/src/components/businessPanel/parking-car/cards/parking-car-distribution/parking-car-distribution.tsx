import { Skeleton } from "ant-design-vue";
import * as echarts from "echarts";
import { PieChart } from "echarts/charts";
import { TitleComponent, TooltipComponent } from "echarts/components";
import { use } from "echarts/core";
import { defineComponent, ref, onMounted, watch, nextTick, onUnmounted, VNode } from "vue";

import { useParkArea } from "../../hooks/use-park-area";
import { parkingStore } from "../../store/parking";
import { cubeParkingLotService } from "@/api/service";
import NoData from "@/components/businessPanel/public/noData.vue";
import { ProgressBar } from "@/components/businessPanel/public/progress-bar/progress-bar";
import { StatisticsDisplay } from "@/components/businessPanel/public/statistics-display/statistics-display";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { calcFontSize } from "@/utils/common";

import styles from "./parking-car-distribution.module.less";

use([PieChart, TitleComponent, TooltipComponent]);

/** 车场分布 */
export const ParkingCarDistribution = defineComponent({
  setup() {
    const store = parkingStore();
    const { showParkArea } = useParkArea();
    const staticData = ref([
      {
        name: "车场数",
        value: 0,
        unit: "个",
        icon: "overView119.png",
      },
      {
        name: "车位数",
        value: 0,
        unit: "个",
        icon: "overView30.png",
      },
    ]);
    let chartInstance: echarts.ECharts | null = null;
    let zoomChartInstance: echarts.ECharts | null = null;
    const list = ref([]);
    const loading = ref(false);

    const updateChart = (instance: echarts.ECharts | null, isZoom = false) => {
      if (!instance) {
        return;
      }
      const total = staticData.value[1].value;
      const colors = ["#328BF7", "#FFC700", "#19F8F7", "#655DD1", "#EF424A"];
      const option = {
        color: colors,
        tooltip: {
          trigger: "item",
          formatter: (params): string => {
            return `<div style="display:flex;align-items:center;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${params.color};margin-right:5px;"></span>
              <span>${params.data.originalName}</span>
            </div>
            车位数量：${params.value}个<br/>占比：${((params.value / total) * 100).toFixed(0)}%`;
          },
          textStyle: {
            fontSize: calcFontSize(12),
          },
        },
        title: {
          text: "车场数",
          subtext: `${staticData.value[0].value}个`,
          left: isZoom ? "38%" : "18%",
          top: "38%",
          textAlign: "center",
          textStyle: {
            color: "#fff",
            fontSize: calcFontSize(isZoom ? 16 : 14),
          },
          subtextStyle: {
            color: "#fff",
            fontSize: calcFontSize(isZoom ? 22 : 18),
          },
        },
        legend: {
          show: true,
          type: list.value.length > 5 ? "scroll" : "plain",
          orient: "vertical",
          right: isZoom ? "18%" : "10%",
          top: "center",
          itemWidth: calcFontSize(isZoom ? 12 : 10),
          itemHeight: calcFontSize(isZoom ? 12 : 10),
          textStyle: {
            color: "#ffffff",
            fontSize: calcFontSize(isZoom ? 16 : 14),
          },
          formatter: (name: string) => {
            const item = list.value.find((data) => data.name === name);
            if (!item || total === 0) {
              return name;
            }
            const percent = ((item.value / total) * 100).toFixed(0);
            return `${item.originalName}    ${percent}%`;
          },
        },
        series: [
          {
            name: "车场分布",
            type: "pie",
            radius: isZoom ? ["58%", "76%"] : ["55%", "70%"],
            center: isZoom ? ["38%", "50%"] : ["20%", "50%"],
            label: {
              show: false,
            },
            labelLine: {
              show: false,
            },
            avoidLabelOverlap: true,
            data: list.value,
          },
        ],
      };
      instance.setOption(option, true);
    };

    const updateCharts = () => {
      updateChart(chartInstance);
      updateChart(zoomChartInstance, true);
    };

    const resizeChart = (instance: echarts.ECharts, isZoom = false) => {
      nextTick(() => {
        instance.resize();
        updateChart(instance, isZoom);
        requestAnimationFrame(() => {
          instance.resize();
          updateChart(instance, isZoom);
        });
      });
    };

    const getData = async (): Promise<void> => {
      try {
        const params = {
          source: "SELF_BUILT",
        };
        loading.value = true;
        const result = await Promise.all([cubeParkingLotService.getParkingInfo(params), cubeParkingLotService.getParkingLotList(params)]);
        list.value = (result[1] ?? [])
          .map((item, index) => {
            return {
              ...item,
              label: item?.areaName || item?.name || "--",
              value: item?.totalNum ?? 0,
              originalName: item?.areaName || item?.name,
              name: `${item?.areaName || item?.name}_${index}`,
            };
          })
          ?.sort((a, b) => {
            return b.value - a.value;
          });
        staticData.value[0].value = list.value?.length ?? 0;
        staticData.value[1].value = result[0]?.totalNum ?? 0;
      } catch {
      } finally {
        loading.value = false;
      }
    };

    const bindChart = (el: Element | null, isZoom = false) => {
      if (!(el instanceof HTMLElement)) {
        return;
      }
      const currentInstance = isZoom ? zoomChartInstance : chartInstance;
      if (currentInstance?.getDom() === el) {
        resizeChart(currentInstance, isZoom);
        return;
      }
      currentInstance?.dispose();
      const nextInstance = echarts.init(el);
      nextInstance.on("click", (params) => {
        store.updateCurrentParking(params);
        showParkArea();
      });
      if (isZoom) {
        zoomChartInstance = nextInstance;
      } else {
        chartInstance = nextInstance;
      }
      resizeChart(nextInstance, isZoom);
    };

    const handleResize = (): void => {
      chartInstance?.resize();
      zoomChartInstance?.resize();
    };
    onMounted(() => {
      getData().then(() => {
        nextTick(() => {
          updateCharts();
        });
      });
      window.addEventListener("resize", handleResize);
    });

    onUnmounted(() => {
      chartInstance?.dispose();
      zoomChartInstance?.dispose();
      window.removeEventListener("resize", handleResize);
    });

    watch(list, () => {
      nextTick(() => {
        updateCharts();
      });
    });

    const renderContent = (isZoom: boolean = false) => {
      const containerClass = isZoom ? styles.zoomContainer : styles.container;
      const scrollClass = isZoom ? styles.zoomCarList : styles.auto;
      const staticWrapperClass = isZoom ? styles.zoomStaticWrapper : styles.staticWrapper;
      const itemClass = isZoom ? styles.zoomItem : styles.item;
      return (
        <Skeleton loading={loading.value} active>
          <div class={staticWrapperClass} data-no-zoom>
            {staticData.value.map((item) => (
              <StatisticsDisplay data={item} key={item.name} />
            ))}
          </div>
          <div class={containerClass} data-no-zoom>
            {list.value?.length === 0 && <NoData />}
            <div ref={(el) => bindChart(el, isZoom)} style={{ width: "100%", height: "100%" }}></div>
          </div>
          <div class={scrollClass} data-no-zoom>
            {list.value.map((item, index) => (
              <div class={itemClass} key={item.label}>
                <ProgressBar total={staticData.value[1].value} label={item.label} value={item.value} unit="个" />
              </div>
            ))}
          </div>
        </Skeleton>
      );
    };

    return (): VNode => (
      <SubPanelTemplate
        title="车场分布"
        zoomable
        zoom-title="车场分布详情"
        v-slots={{
          "zoom-content": () => <div class={styles.zoomDistribution}>{renderContent(true)}</div>,
        }}
      >
        {renderContent(false)}
      </SubPanelTemplate>
    );
  },
});
