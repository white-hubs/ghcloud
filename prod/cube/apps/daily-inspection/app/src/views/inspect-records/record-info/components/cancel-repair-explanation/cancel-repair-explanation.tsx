import { defineComponent, type PropType } from 'vue'
import styles from './cancel-repair-explanation.module.less'
import { Empty, Image, ImagePreviewGroup } from '@ghcloud/cube-ui'
import type { FileVO } from '@ghcloud/cube-daily-inspection-service'

interface CancelRepairItem {
  reason: string;
  fileList?: FileVO[];
}

export const CancelRepairExplanation = defineComponent({
  props: {
    cancelItems: {
      type: Array as PropType<CancelRepairItem[]>,
      default: () => []
    }
  },
  setup: (props) => {
    return (): JSX.Element => (
      <div class={styles.container}>
        {props.cancelItems.length === 0 &&
          <Empty description='暂无取消修复说明' />}
        <div class={styles['explanation-container']}>
          {props.cancelItems.map((item, index) => {
            return (
              <div class={styles['explanation-item']} key={index}>
                <div class={styles['explanation-content']}>
                  <div class={styles['explanation-body']}>
                    <div class={styles['reason-item']}>
                      <div><label>取消原因:</label> <span>{item.reason || '--'}</span></div>
                      {!!item.fileList?.length &&
                        <div class={styles['image-container']}>
                          <ImagePreviewGroup>
                            {item.fileList.map((file, n) => {
                              return (
                                <Image
                                  key={file.id || n}
                                  src={file.path}
                                  style={{ width: '100px', height: '100px' }}
                                  width={100}
                                  height={100}
                                />
                              )
                            })}
                          </ImagePreviewGroup>
                        </div>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
})