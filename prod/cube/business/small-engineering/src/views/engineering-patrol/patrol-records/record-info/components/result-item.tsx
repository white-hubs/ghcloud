import { defineComponent, type PropType } from 'vue'
import styles from './result-item.module.less'
import { ImagePreviewGroup, Image, Empty } from '@ghcloud/cube-ui'
import type { StandardVOS } from '@ghcloud/cube-daily-inspection-service'
export const ResultItem = defineComponent({
  props: {
    patrolResult: {
      type: Array as PropType<StandardVOS[]>,
      default: () => []
    }
  },
  setup: (props) => {
    return (): JSX.Element => (
      <div class={styles.container}>
        {props.patrolResult.length === 0 &&
          <Empty description='暂无巡检结果' />}
        {props.patrolResult.map(item => {
          return (
            <div class={styles['result-item-container']} key={item.standardId}>
              <div class={styles.title}>
                {item.standardName}
              </div>
              {item.itemVOS?.map((ele, index) => {
                return (
                  <div class={styles['result-item']} key={ele.itemId}>
                    <div class={styles['result-item-list']}>
                      <div class={styles['result-item']}>
                        <div class={styles['first-index']}> {index + 1}、</div>
                        <div class={styles['item-content']}>
                          <div><label>{ele.itemName}:</label> <span class={ele.errorValueFlag ? styles['error-value'] : styles['normal-value']}>{ele.itemResultName}</span></div>
                          <div><label>描述信息:</label> <span>{ele.errorDesc || '--'}</span></div>
                          {!!ele.fileVOS.length &&
                            <ImagePreviewGroup>
                              {ele.fileVOS.map((file) => {
                                return (
                                  <Image
                                    key={file.id}
                                    src={file.path}
                                    style={{ width: '100px', height: '100px' }}
                                    width={100}
                                    height={100}
                                  />
                                )
                              })}
                            </ImagePreviewGroup>}

                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

            </div>
          )
        })}

      </div>
    )
  }
})
