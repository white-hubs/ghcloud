import { defineComponent, onMounted, reactive } from 'vue'
import styles from './index.module.less'
import { CountTo } from 'vue3-count-to'
import type { merchantDataProvider } from '../../merchant-data-provider'
import { useApiTimer } from '@/hook/use-utils'
type KeyType = keyof ReturnType<typeof merchantDataProvider.getStatCardData>
export const StatCard = defineComponent({
  setup: () => {
    const state = reactive<{
      statList: {
        label: string;
        key: KeyType;
        value: number;
      }[];
    }>({
      statList: [
        {
          label: '采购商',
          key: 'purchaserTotal',
          value: 1918,
        },
        {
          label: '批发商',
          key: 'wholesalerTotal',
          value: 338,
        },
      ]
    })
    onMounted(() => {
      useApiTimer(async () => {
        // const statData = merchantDataProvider.getStatCardData()
        // state.statList = state.statList.map(item => {
        //   return {
        //     ...item,
        //     value: statData[item.key]
        //   }
        // })
      })
    })
    return (): JSX.Element => (
      <div class={styles.container}>
        {state.statList.map((item, index) => {
          return (
            <div class={styles['stat-item']} key={index}>
              <div class={styles['item-label']}>
                <img src='/apps/@ghcloud/higreen-data-viz/icons/user/merchant-icon.png' alt='' srcset='' />
                <div>{item.label}</div>
              </div>
              <div class={styles['item-value']}>
                <CountTo startVal={0} endVal={item.value} duration={2000} />
              </div>
            </div>
          //
          )
        })}
      </div>
    )
  }
})
