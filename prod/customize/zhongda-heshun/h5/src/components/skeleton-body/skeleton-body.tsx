import { computed, defineComponent, ref, type PropType } from 'vue'
import styles from './skeleton-body.module.less'
import { Popup, Picker, Icon, Skeleton } from 'vant'


export const SkeletonBody = defineComponent({

  setup: (props, { emit }) => {
   

    return (): JSX.Element => (
      <div class={styles['skeleton-container']}>
              {new Array(8).fill('').map((item, index) => (
                <div class={styles['skeleton-item']} key={index}>
                  <Skeleton title row={3}>
                    <template v-slots={{ template: () => (
                      <div class={styles['skeleton-item-wrap']}>
                        <div style={{ flex: 1 }}>
                          <Skeleton title row={1} title-width="60%" />
                          <div class={styles['skeleton-item-text']}>
                            <Skeleton title row={1} title-width="40%" />
                            <Skeleton title row={1} title-width="40%" />
                          </div>
                          <div class={styles['skeleton-item-text']}>
                            <Skeleton title row={1} title-width="40%" />
                            <Skeleton title row={1} title-width="40%" />
                          </div>
                        </div>
                      </div>
                    ) }}>
                    </template>
                  </Skeleton>
                </div>
              ))}
            </div>
    )
  }
})