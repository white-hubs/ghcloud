import { defineComponent, onMounted, ref } from 'vue'
import styles from './key-place-popup.module.less'
import { Image, Empty } from 'ant-design-vue'
import { openDisinfectionModal } from '../../disinfection-modal/disinfection-modal'
import { KeyPlacePageVO } from '@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto'
import { cubeZDDataVizService } from '@/api/service'
import { on } from 'events'
import { EyeOutlined } from '@ant-design/icons-vue'

interface UserPopupProps {
  keyPlace: {
    name: string;
    address: string;
    type: string;
    pic: string;
  } & KeyPlacePageVO;
  showTotal: boolean;
}

/** 重点场所弹层 */
export const KeyPlacePopup = defineComponent({
  emits: ['close', 'more'],
  props: {
    keyPlace: {
      type: Object as () => {
        name: string;
        address: string;
        type: string;
        pic: string;
      } & KeyPlacePageVO,
      required: true
    },
    showTotal: {
      type: Boolean,
      default: false
    }
  },
  setup (props: UserPopupProps, { emit }) {
    const keyPlaceCount = ref(0)
    const getCount = async (): Promise<void> => {
      const res = await cubeZDDataVizService.getKeyPlaceCount({
        keyPlaceId: props.keyPlace?.id as unknown as string ?? '',
      })
      keyPlaceCount.value = res ?? 0
    }

    onMounted(async ()=>{
      if (props.showTotal) {
        await getCount()
      }
    })
    return (): JSX.Element => {
      const handleClick = (): void => {
        emit('close')
      }
      const handleMoreClick = async (): Promise<void> => {
        emit('more')
        await openDisinfectionModal({
          title: '消杀列表',
          data: {
            ...props.keyPlace
          }
        })
      }
      return <>
        <div class={styles['key-place-popup']}>
          <div class={styles['avatar']}>
            {
              props.keyPlace.pic ? <Image src={props.keyPlace.pic} previewMask={() => <><EyeOutlined />预览</>} /> : <Empty description='暂无图片' />
            }
          </div>
          <div class={styles['info']}>
            <div class={styles['title']}>
              <div class={styles['name']}>{props.keyPlace.name || '--'}</div>
              <div class={styles['close-button']} onClick={handleClick}></div>
            </div>
            <div class={styles['row-text']}>
              <span class={styles['label']}>分类：</span>
              <span class={styles['value']}>{props.keyPlace.type || '--'}</span>
            </div>
            <div class={styles['row-text']}>
              <span class={styles['label']}>位置：</span>
              <span class={styles['value']}>{props.keyPlace.address || '--'}</span>
            </div>
            {
              props.showTotal && <>
              <div class={[styles['row-text'], styles['row-text-number'] ]}>
                <div>
                  <span class={styles['label']}>消杀次数：</span>
                  <span class={[styles['value'], styles['number'] ]}>{keyPlaceCount.value || 0}<span class={styles['unit']}>次</span></span>
                </div>
                <span class={styles['more']} onClick={handleMoreClick}>查看详情&gt;&gt;</span>
              </div>
              </>
            }
          </div>
        </div>
      </>
    }
  }
})