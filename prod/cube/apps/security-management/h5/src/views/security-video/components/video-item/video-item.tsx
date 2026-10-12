import { defineComponent, ref } from 'vue'
import styles from './video-item.module.less'
import type { MultipleVideoDevice } from '@ghcloud/cube-security-management-service'
import { Icon, Image, showFailToast, showSuccessToast } from 'vant'
import { cubeSecurityManagementService } from '@/api/server'
import { useRouter } from 'vue-router'

const deviceTagAi = 'builtin.usage::artificial_intelligence'

export const VideoItem = defineComponent({
  emits: ['collectChange'],
  props: ['areaName', 'collected', 'deviceStatus', 'id', 'name', 'product', 'streamMedia', 'thirdPartyId', 'areaId', 'tags'],
  setup: (props: MultipleVideoDevice & { showCollect?: boolean; }, { emit }) => {
    const collected = ref(props.collected ?? false)
    const router = useRouter()
    const toDetail = (id: string): void => {
      router.push({
        name: 'video-detail',
        query: {
          id
        }
      })
    }
    return (): JSX.Element =>
      <div class={styles['video-item']} onClick={() => {
        toDetail(props.id)
      }}>
        <div class={styles['image-container']}>
          <Image src={props?.product?.image?.path} />
          {(props.tags ?? []).some(tag => tag.tagCode === deviceTagAi) && <div class={styles['device-tag']}>AI</div>}
        </div>
        <div class={styles['video-info']}>
          <div class={styles.title}>
            <div class={`${styles['status-tag']} ${props.deviceStatus ? styles.green : styles.red}`}>{props.deviceStatus ? '在线' : '离线'}</div>
            <span>{props.name}</span>
          </div>
          <div class={styles.desc}>品类名称：{props?.product?.name}</div>
          <div class={styles.desc}>位置：{props?.areaName}</div>
        </div>
        <div class={styles.collect}>
          <Icon
            name={collected.value ? 'star' : 'star-o'}
            color={collected.value ? 'var(--van-primary-color)' : ''}
            size={20}
            onClick={async (event: Event) => {
              event.stopPropagation()
              collected.value = !collected.value
              try {
                await cubeSecurityManagementService.collectCamera(props.id, collected.value)
                showSuccessToast(collected.value ? '收藏成功' : '取消收藏')
                emit('collectChange')
              } catch {
                showFailToast(collected.value ? '收藏失败' : '取消失败')
                collected.value = !collected.value
              }
            }}
          />
        </div>
      </div>
  }
})
