import { defineComponent, PropType, ref, watch } from "vue";
import { getAssetsImage } from "@/utils/getImage";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import styles from './bubble-analysis.module.less';

interface BubbleItem {
  name: string;
  value: number;
  color: string;
  unit?: string;
}

export const BubbleAnalysis = defineComponent({
  props: {
    data: {
      type: Array as PropType<BubbleItem[]>,
      default: () => []
    }
  },
  setup(props, { emit }) {
    const classList = ["right", "top", "left"];
    const statisticsData = ref(props.data);

    watch(() => props.data, (newVal) => {
      statisticsData.value = newVal;
    });

    return () => (
      <div class={styles.showPanel}>
        {statisticsData.value.length > 0 ? (
          <div>
            {statisticsData.value.map((item, index) => (
              <div
                class={`${styles.blister} ${styles[classList[index % classList.length]]}`}
                onClick={() => emit('click', item)}
                key={item.name}
              >
                <div class={styles.ball}>
                  <img style={{ width: '100%' }} src={getAssetsImage('overView15.png')} alt="" />
                  <div 
                    class={styles.count}
                    style={{ backgroundImage: `-webkit-linear-gradient(top, #FFFFFF, ${item.color})` }}
                  >
                    <CountTo
                      startVal={0}
                      endVal={Math.round(Number(item.value))}
                      duration={2000}
                      separator=""
                    />
                    {
                      item.unit && 
                      <span 
                        class={styles.unit}
                        style={{ backgroundImage: `-webkit-linear-gradient(top, #FFFFFF, ${item.color})` }}
                      >
                        {item.unit}
                      </span>
                    }
                  </div>
                  <div class={styles.blisterTitle}>{item.name}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ width: '100%', marginTop: '30px' }}>
            <noData />
          </div>
        )}
      </div>
    )
  }
});