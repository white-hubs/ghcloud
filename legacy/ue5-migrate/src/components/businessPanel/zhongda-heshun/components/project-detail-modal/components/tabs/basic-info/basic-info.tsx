import { defineComponent, onMounted, ref } from 'vue'
import styles from './basic-info.module.less'
import type { ProjectPageVO } from '@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto'
import { cubeZDDataVizService } from '@/api/service'
import dayjs from 'dayjs'
import { ImagePreviewGroup, Image } from 'ant-design-vue'
import { EyeOutlined } from '@ant-design/icons-vue'

interface Props {
  info: Record<string, unknown>;
}

export const BasicInfo = defineComponent({
  props: ['info'],
  setup: (props: Props) => {
    const baseInfo = ref<ProjectPageVO>(props.info)
    const getData = async (): Promise<void> => {
      try {
        const res = await cubeZDDataVizService.getProjectsInfo(baseInfo.value?.id || '')
        baseInfo.value = res
      } catch {
      }
    }
    onMounted(() => {
      getData()
    })
    return (): JSX.Element => (
      <div class={styles['info-content']} >
        <div class={styles['info-item']}>
          <div class={styles['info-item-label']}>项目名称:</div>
          <div class={styles['info-item-value']}>{baseInfo.value?.projectName || '--'}</div>
        </div>
        <div class={styles['info-item']}>
          <div class={styles['info-item-label']}>项目类型:</div>
          <div class={styles['info-item-value']}>{baseInfo.value?.projectTypeName || '--'}</div>
        </div>
        <div class={styles['info-item']}>
          <div class={styles['info-item-label']}>业主单位:</div>
          <div class={styles['info-item-value']}>{baseInfo.value?.company || '--'}</div>
        </div>
        <div class={styles['info-item']}>
          <div class={styles['info-item-label']}>项目周期:</div>
          <div class={styles['info-item-value']}>{baseInfo.value?.beginTime && baseInfo.value?.endTime ? `${dayjs(baseInfo.value?.beginTime).format('YYYY-MM-DD')} ~ ${dayjs(baseInfo.value?.endTime).format('YYYY-MM-DD')}` : ''}</div>
        </div>
        <div class={styles['info-item']}>
          <div class={styles['info-item-label']}>项目所在地:</div>
          <div class={styles['info-item-value']}>{baseInfo.value?.disinfectionLocationName || '--'}</div>
        </div>
        <div class={styles['info-item']}>
          <div class={styles['info-item-label']}>项目面积:</div>
          <div class={styles['info-item-value']}>{`${baseInfo.value?.disinfectionArea ? baseInfo.value?.disinfectionArea : '--'}`}</div>
        </div>
        <div class={styles['info-item']}>
          <div class={styles['info-item-label']}>项目说明:</div>
          <div class={styles['info-item-value']}>{baseInfo.value?.description || '--'}</div>
        </div>
        <div class={styles['info-item']}>
          <div class={styles['info-item-label']}>项目图片:</div>
          <div class={styles['info-item-value']}>
            {
              baseInfo.value?.projectImage ?
                <ImagePreviewGroup>
                  {(baseInfo.value?.projectImage ? [baseInfo.value?.projectImage] : [])?.map((item, index) => {
                    const url = item.path?.startsWith('http') ? item.path : `${location.origin}${item.path}`
                    return <Image key={index} src={url} width={60} previewMask={() => <><EyeOutlined />预览</>} />
                  })}
                </ImagePreviewGroup>
                : '--'
            }
          </div>
        </div>
      </div>
    )
  }
})