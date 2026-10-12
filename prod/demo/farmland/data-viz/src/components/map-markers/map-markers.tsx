import { defineComponent, ref, onMounted, type PropType } from 'vue'
import styles from './map-markers.module.less'
import CountTo from '@/components/count-to/count-to'

interface Location {
  x: number;
  y: number;
  name: string;
  area: number;
  data?: Record<string, string>;
  id: number; // 确保每个位置有唯一ID
}
export const MapMarkers = defineComponent({
  props: {
    locations: {
      type: Array as PropType<Location[]>,
      default: () => []
    }
  },
  setup(props) {
    const activeLocation = ref<Location | null>(null)
    const defaultLocation = ref<Location | null>(null)

    // 初始化时设置默认显示的提示框
    onMounted(() => {
      if (props.locations.length > 0) {
        // 默认显示第一个位置的提示框
        defaultLocation.value = props.locations[0]
      }
    })

    // 显示悬浮提示框
    const showTooltip = (location: Location) => {
      activeLocation.value = location
    }

    // 隐藏悬浮提示框
    const hideTooltip = () => {
      activeLocation.value = null
    }
    
    // 随机生成颜色类名
    const getRandomColorClass = () => {
      return Math.random() > 0.5 ? styles.greenDot : styles.yellowDot;
    }

    return () => (
      <div class={styles.mapContainer}>
        {props.locations.map((location) => {
          const colorClass = getRandomColorClass();
          const showTooltipForLocation = activeLocation.value === location || 
                                        (defaultLocation.value === location && !activeLocation.value);
          
          return (
            <div 
              class={styles.mapMarker} 
              style={{
                left: `${location.x}%`,
                top: `${location.y}%`
              }}
              onMouseenter={() => showTooltip(location)}
              onMouseleave={hideTooltip}
            >
              <div class={styles.markerContent}>
                <div class={styles.markerName}>{location.name}</div>
                <div class={styles.markerArea}>
                  <span class={styles.markerValue}>{location.area}</span>
                  {/* <CountTo startVal={0} endVal={location.area} duration={2000} separator='' /> */}
                  <span class={styles.markerUnit}>亩</span>
                </div>
              </div>
              <div class={`${styles.markerDot} ${colorClass}`}></div>
              
              {showTooltipForLocation && (
                <div class={styles.tooltip}>
                  <div class={styles.tooltipHeader}>
                    <span>{location.name}</span>
                  </div>
                  <div class={styles.tooltipContent}>
                    {Object.entries(location.data || {}).map(([key, value]) => (
                      <div class={styles.tooltipItem}>
                        <span class={styles.tooltipLabel}>{key}：</span>
                        <span class={styles.tooltipValue}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div class={styles.tooltipIndicator}></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    )
  }
})