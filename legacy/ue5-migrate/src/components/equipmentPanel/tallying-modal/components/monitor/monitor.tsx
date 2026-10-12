import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import styles from './monitor.module.less'
import { CubePlayer } from '@ghcloud/cube-player'
import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service/src/device-center.service'
import { authStore } from '@/api/auth-store'
import  NoData  from '@/components/businessPanel/public/noData.vue'
import type { ArrangeLastInfoVo } from '@ghcloud/cube-slide-rail-service'
interface Props {
  info?: ArrangeLastInfoVo;
  id?: string;
}
/** 监控数据 */
export const Monitor = defineComponent({
  props: ['info', 'id'],
  setup: (props: Props) => {
    const videoList = ref<unknown[]>([])
    const getVideoData = async (): Promise<void> => {
      try {
        const cubeDeviceCenterService = new CubeDeviceCenterService(authStore)
        await cubeDeviceCenterService.getDeviceAssociatedVideos(props.id as unknown as number).then(res => {
          videoList.value = [...videoList.value, ...res as unknown[]]
        })
      } catch (error) {
      }
    }
    onMounted(() => {
      // getVideoData()
    })
    watch(() => props.id, () => {
      videoList.value = []
      getVideoData()
    })
    const picFilePaths = computed(() => {
      return props.info?.porkArrangeDetail?.picFilePaths?.map(path => {
        let url = path
        if (!path?.includes('http')) {
          url = window.location.origin + path
        }
        return url
      })
    })
    return () => (
      <>
        <div class={styles.video}>
          {
            videoList.value.length === 0
              ? (
                <>
                  <NoData class={styles['video-item']}  />
                  <NoData class={styles['video-item']}  />
                </>
                )
              : (
                  videoList.value.map((v, i) => {
                    return (
                      v === undefined
                        ? <NoData class={styles['video-item']}  />
                        : (
                          <div class={styles['video-item']} key={(v as { id: string; }).id + i}>
                            <span class={styles['device-name']}>{(v as { name: string; }).name}</span>
                            <span class={styles['device-status']}>在线</span>
                            {
                          (v as { id: string; }).id &&
                            <CubePlayer
                              isReconnect
                              h5sControl={false}
                              dom-id={(v as { id: string; }).id}
                              device-id={(v as { id: string; }).id}
                              key={(v as { id: string; }).id + i}
                              style={{ width: '100%' }}
                            />
                          }
                          </div>
                          )
                    )
                  })
                )
            }
        </div>
        <div class={styles.body}>
          <div class={styles.data}>
            <div class={styles.item}>
              <label>理货总片数：</label>
              <span class={styles['light-gray']}>{props.info?.porkArrange?.slices || 0}</span>
              <span class={styles.purple}>/{props.info?.porkArrange?.porkReportSlices || props.info?.porkArrange?.slices || 0}</span>
              <span class={[styles.purple, styles.unit]}> 片</span>
            </div>
            <div class={styles.item}>
              <label>理货总重量：</label>
              <span class={styles['light-gray']}>{props.info?.porkArrange?.porkReportWeight || props.info?.porkArrange?.weight || 0}</span>
              <span class={[styles['light-gray'], styles.unit]}> kg</span>
            </div>
          </div>
          <div class={styles.snap}>
            <div class={styles.title}>理货抓拍</div>
            <div class={styles.image}>
              {
                !picFilePaths.value || picFilePaths.value?.length === 0
                  ? <NoData class={styles['no-data']}  />
                  : (
                    <a-image-preview-group>
                      {picFilePaths.value?.map((item, index) => {
                        return <a-image src={item} width='100%' key={`${item}-${index}`} />
                      })}
                    </a-image-preview-group>
                    )
              }
            </div>

          </div>
        </div>
      </>
    )
  }
})
