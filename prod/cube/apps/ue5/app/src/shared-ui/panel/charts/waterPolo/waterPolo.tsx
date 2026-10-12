import { LegendComponent, TitleComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { defineComponent, type PropType } from "vue";
import { nextTick, watch, onMounted, ref, onUnmounted } from "vue";

import { calcFontSize } from "@/infrastructure/utils/common";
import { getVisualThemeChartColors, VISUAL_THEME_CHANGE_EVENT } from "@/infrastructure/utils/visual-theme";
import "echarts-liquidfill";

import styles from "./waterPolo.module.less";

type WaterPoloTone = "primary" | "warning";

const tonePalette = {
  primary: {
    // 科技蓝：亮天蓝，避免沉底深蓝
    tech: {
      wave: ["#8fd0ff", "#4da6ff", "#2f8dff"],
      bg: "rgba(77, 166, 255, 0.14)",
      outline: "rgba(143, 208, 255, 0.7)",
      label: "#ffffff",
    },
    // 极简白：与设备统计环图同系浅蓝，降低视觉重量
    white: {
      wave: ["#a8d4ff", "#5ba8ff", "#3d94ff"],
      bg: "rgba(91, 168, 255, 0.1)",
      outline: "rgba(91, 168, 255, 0.4)",
      label: "#ffffff",
    },
  },
  warning: {
    // 琥珀黄：用于报警率等警示指标
    tech: {
      wave: ["#ffe08a", "#ffc53d", "#faad14"],
      bg: "rgba(250, 173, 20, 0.16)",
      outline: "rgba(255, 213, 102, 0.78)",
      label: "#ffffff",
    },
    white: {
      wave: ["#ffe7a3", "#ffc53d", "#d48806"],
      bg: "rgba(250, 173, 20, 0.1)",
      outline: "rgba(250, 173, 20, 0.42)",
      label: "#ffffff",
    },
  },
} as const;

const resolveThemeKey = (): "tech" | "white" => {
  const theme = document.documentElement.getAttribute("data-visual-theme");
  return theme === "minimal-white" ? "white" : "tech";
};

export const WaterPolo = defineComponent({
  name: "WaterPolo",
  props: {
    title: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    // 水球图背景颜色（tone 未启用时生效）
    bgColor: {
      type: String,
      default: "rgba(32, 165, 255, 0.3)",
    },
    // 波纹的颜色（tone 未启用时生效）
    color: {
      type: String,
      default: "#20a5ff",
    },
    // 单位
    unit: {
      type: String,
      default: "",
    },
    /** 值为 0-100 的百分比时，转换为 liquidFill 需要的 0-1 区间。 */
    percentage: {
      type: Boolean,
      default: false,
    },
    /** 图表根节点完全服从父容器尺寸，供窄侧栏和放大弹窗使用。 */
    responsive: {
      type: Boolean,
      default: false,
    },
    /** 中心百分比字号（设计稿基准），默认 27；窄卡片可传更小值。 */
    labelFontSize: {
      type: Number,
      default: 27,
    },
    /**
     * 语义色：primary 科技蓝 / warning 琥珀黄警示。
     * 传入后自动适配科技蓝与极简白配色，并启用增强波纹与描边。
     */
    tone: {
      type: String as PropType<WaterPoloTone | undefined>,
      default: undefined,
    },
    /** 外圈光晕装饰，配合 tone 使用更炫酷 */
    glow: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const powerFactorRef = ref<HTMLElement | null>(null);
    let myChart: echarts.ECharts | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const resizeChart = (): void => {
      nextTick(() => {
        myChart?.resize();
        requestAnimationFrame(() => {
          myChart?.resize();
        });
      });
    };

    const initChart = (container?: HTMLElement | null): void => {
      if (!container) return;
      if (!myChart) myChart = echarts.init(container as HTMLElement);
      myChart.setOption(option(), true);
      resizeChart();
    };

    watch(
      () => [props.value, props.labelFontSize, props.color, props.bgColor, props.unit, props.percentage, props.tone] as const,
      () => {
        initChart(powerFactorRef.value);
      },
    );

    const renderTheme = (): void => {
      initChart(powerFactorRef.value);
    };

    onMounted(() => {
      initChart(powerFactorRef.value);
      if (powerFactorRef.value) {
        resizeObserver = new ResizeObserver(resizeChart);
        resizeObserver.observe(powerFactorRef.value);
      }
      window.addEventListener("resize", resizeChart);
      window.addEventListener(VISUAL_THEME_CHANGE_EVENT, renderTheme as EventListener);
    });
    onUnmounted(() => {
      window.removeEventListener("resize", resizeChart);
      window.removeEventListener(VISUAL_THEME_CHANGE_EVENT, renderTheme as EventListener);
      resizeObserver?.disconnect();
      myChart?.dispose();
    });

    const option = () => {
      const themeColors = getVisualThemeChartColors();
      const displayValue = Number.isFinite(props.value) ? props.value : 0;
      const chartValue = Math.min(1, Math.max(0, props.percentage ? displayValue / 100 : displayValue));
      const themeKey = resolveThemeKey();
      const tone = props.tone ? tonePalette[props.tone][themeKey] : null;

      const waveColors = tone ? tone.wave : [props.color, props.color, props.color];
      const backgroundColor = tone ? tone.bg : props.bgColor;
      const outlineColor = tone ? tone.outline : "rgba(255, 255, 255, 0.55)";
      const labelColor = tone ? tone.label : themeColors.label;
      const enhanced = Boolean(tone);

      return {
        title: {
          text: props.title,
          x: "40%",
          y: "88%",
          textStyle: {
            fontSize: calcFontSize(14),
            fontWeight: "100",
            color: themeColors.title,
            lineHeight: 16,
            textAlign: "center",
          },
        },
        series: [
          {
            type: "liquidFill",
            radius: enhanced ? "88%" : "100%",
            center: ["50%", "50%"],
            amplitude: enhanced ? 7 : 8,
            waveLength: enhanced ? "72%" : "80%",
            period: enhanced ? 3200 : 3000,
            direction: "right",
            shape: "circle",
            color: waveColors.map((c, index) => ({
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: c,
                },
                {
                  offset: 1,
                  color: index === 0 ? waveColors[Math.min(1, waveColors.length - 1)] : c,
                },
              ],
              globalCoord: false,
            })),
            data: enhanced
              ? [
                  {
                    value: chartValue,
                    direction: "right",
                  },
                  {
                    value: Math.max(0, chartValue - 0.02),
                    direction: "left",
                  },
                  {
                    value: Math.max(0, chartValue - 0.045),
                    direction: "right",
                  },
                ]
              : [chartValue, chartValue, chartValue],
            backgroundStyle: {
              borderWidth: enhanced ? 0 : 1,
              color: backgroundColor,
              shadowBlur: enhanced ? 12 : 0,
              shadowColor: enhanced ? outlineColor : "transparent",
            },
            itemStyle: {
              opacity: enhanced ? (themeKey === "white" ? 0.78 : 0.88) : 1,
              shadowBlur: enhanced ? (themeKey === "white" ? 6 : 10) : 0,
              shadowColor: enhanced ? outlineColor : "transparent",
            },
            label: {
              fontSize: calcFontSize(props.labelFontSize),
              fontWeight: 700,
              color: labelColor,
              formatter: `${displayValue}${props.unit}`,
              textShadowBlur: enhanced ? 8 : 0,
              textShadowColor: enhanced ? (themeKey === "white" ? "rgba(20, 85, 179, 0.28)" : "rgba(0, 40, 90, 0.35)") : "transparent",
            },
            outline: {
              show: enhanced,
              borderDistance: enhanced ? 4 : 0,
              itemStyle: {
                borderWidth: enhanced ? 2 : 0,
                borderColor: outlineColor,
                shadowBlur: enhanced ? 14 : 0,
                shadowColor: outlineColor,
              },
            },
          },
        ],
      };
    };

    return (): JSX.Element => (
      <div
        class={[
          styles["power-factor"],
          props.responsive ? styles.responsive : "",
          props.glow || props.tone ? styles.enhanced : "",
          props.tone === "warning" ? styles.warning : "",
          props.tone === "primary" ? styles.primary : "",
          "power-factor",
        ]}
        style={props.responsive ? { width: "100%", height: "100%", minWidth: 0, maxWidth: "100%", maxHeight: "100%" } : undefined}
        ref={powerFactorRef}
      />
    );
  },
});

export default WaterPolo;
