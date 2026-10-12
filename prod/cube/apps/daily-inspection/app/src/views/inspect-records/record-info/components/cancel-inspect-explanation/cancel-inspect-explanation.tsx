import { defineComponent, type PropType } from 'vue'
import styles from './cancel-inspect-explanation.module.less'
import { Empty, Image, ImagePreviewGroup } from '@ghcloud/cube-ui'

interface CancelInspectItem {
  id: string;
  reason: string;
  fileList?: {
    id: string;
    path: string;
    name: string;
  }[];
}

export const CancelInspectExplanation = defineComponent({
  props: {
    cancelItems: {
      type: Array as PropType<CancelInspectItem[]>,
      default: () => []
    }
  },
  setup: (props) => {
    return (): JSX.Element => (
      <div class={styles.container}>
        {props.cancelItems.length === 0 &&
          <Empty description='暂无取消巡检说明' />}
        <div class={styles['explanation-container']}>
          {props.cancelItems.map((item, index) => {
            return (
              <div class={styles['explanation-item']} key={item.id || index}>
                <div class={styles['explanation-content']}>
                  <div class={styles['explanation-body']}>
                    <div class={styles['reason-item']}>
                      <div><label>取消原因:</label> <span>{item.reason || '--'}</span></div>
                      {!!item.fileList?.length &&
                        <div class={styles['image-container']}>
                          <ImagePreviewGroup>
                            {item.fileList.map((file) => {
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