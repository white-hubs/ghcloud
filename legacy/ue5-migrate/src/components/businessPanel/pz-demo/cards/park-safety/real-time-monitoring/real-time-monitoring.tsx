import { defineComponent, onMounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import NoData from "@/components/businessPanel/public/noData.vue";
import styles from './real-time-monitoring.module.less'
import { CubePlayer } from '@ghcloud/cube-player'
import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { authStore } from '@/api/auth-store'

export const RealTimeMonitoring = defineComponent({
  setup () {
    const MAX_VIDEOS = 16 // 修改为支持最大16个视频
    const videoList = ref<string[]>([])
    const selectedGroup = ref()
    const groups = ref([])
    const currentLayout = ref('2x2') // 默认2x2布局

    // 布局选项
    const layoutOptions = [
      { label: '1 x 1', value: '1x1' },
      { label: '2 x 2', value: '2x2' },
      { label: '3 x 3', value: '3x3' },
      { label: '4 x 4', value: '4x4' }
    ]

    // 根据布局获取最大视频数
    const getMaxVideosByLayout = (layout: string): number => {
      const layoutMap = {
        '1x1': 1,
        '2x2': 4,
        '3x3': 9,
        '4x4': 16
      }
      return layoutMap[layout] || 4
    }

    // 处理布局变化
    const handleLayoutChange = (layout: string): void => {
      currentLayout.value = layout
      const maxVideos = getMaxVideosByLayout(layout)
      if (videoList.value.length > maxVideos) {
        videoList.value = videoList.value.slice(0, maxVideos)
      }
    }

    // 缓存相关常量和方法
    const CACHE_KEY = 'MONITOR_GROUP_SELECTED'
    const CACHE_VIDEO_LIST = 'MONITOR_VIDEO_LIST'

    // 缓存操作方法
    const cache = {
      saveSelectedGroup (group: unknown): void {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(group))
        } catch (error) {
        }
      },

      saveVideoList (list: string[]): void {
        try {
          localStorage.setItem(CACHE_VIDEO_LIST, JSON.stringify(list))
        } catch (error) {
        }
      },

      getSelectedGroup (): unknown {
        try {
          const cached = localStorage.getItem(CACHE_KEY)
          return cached ? JSON.parse(cached) : null
        } catch (error) {
          return null
        }
      },

      getVideoList (): string[] {
        try {
          const cached = localStorage.getItem(CACHE_VIDEO_LIST)
          return cached ? JSON.parse(cached) : []
        } catch (error) {
          return []
        }
      }
    }

    // 处理关闭视频
    const handleCloseVideo = (index: number): void => {
      videoList.value.splice(index, 1)
      cache.saveVideoList(videoList.value)
    }

    const handleChange = (value: unknown): void => {
      const cur = Array.isArray(value) && value.length > 0 ? value[value.length - 1] : value
      if (!cur) return

      if (videoList.value.length < MAX_VIDEOS) {
        videoList.value.push(cur)
        cache.saveVideoList(videoList.value)
      } else {
        videoList.value.splice(MAX_VIDEOS - 1, 1, cur)
        cache.saveVideoList(videoList.value)
      }

      cache.saveSelectedGroup(value)
    }

    onMounted(() => {
      getGroupData().then(() => {
        const cachedGroup = cache.getSelectedGroup()
        if (cachedGroup) {
          selectedGroup.value = cachedGroup
        }

        const cachedVideoList = cache.getVideoList()
        if (cachedVideoList.length > 0) {
          videoList.value = cachedVideoList
        }
      })
    })

    const getGroupData = async (): Promise<void> => {
      try {
        const cubeDeviceCenterService = new CubeDeviceCenterService(authStore)
        const tagCodes = "builtin.app::SECURITY_MONITORING"
        await cubeDeviceCenterService.deviceGroupDevicesAll(tagCodes).then(res => {
          groups.value = res
          
          // 如果没有缓存数据，自动选择第一个设备
          if (!cache.getSelectedGroup() && !cache.getVideoList().length) {
            const firstGroupWithDevices = res.find(group => group.devices && group.devices.length > 0)
            if (firstGroupWithDevices && firstGroupWithDevices.devices[0]) {
              const firstDevice = firstGroupWithDevices.devices[0]
              handleChange([firstGroupWithDevices.id, firstDevice.id])
            }
          }
        })
      } catch {
      }
    }
    // 添加显示函数
    const displayRender = ({ labels }: { labels: string[]; }): string => {
      return labels[labels.length - 1]
    }

    const panelSlots = {
      extra: (): JSX.Element => (
        <div class={[styles['right-bar']]}>
          <a-select
            v-model:value={currentLayout.value}
            class={styles.layoutSelector}
            options={layoutOptions}
            onChange={handleLayoutChange}
          />
          <a-cascader
            change-on-select
            v-model:value={selectedGroup.value}
            placeholder="切换分组"
            fieldNames={{ label: 'name', value: 'id', children: 'devices' }}
            options={groups.value}
            class={styles.area}
            popupClassName={styles.myArea}
            getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
            onChange={handleChange}
            displayRender={displayRender}
          />
        </div>
      )
    }

    return (): JSX.Element => (
      <SubPanelTemplate title='实时监控' v-slots={panelSlots}>
        <div class={styles.content}>
          {
            videoList.value.length === 0 && <div class={styles.noData}>
              <NoData />
            </div>
          }
          <div class={[styles.group, styles[`layout${currentLayout.value}`]]}>
            {
              videoList.value.length > 0 &&
                videoList.value.map((v, i) => {
                  return (
                    v !== undefined && (
                      <div class={styles.camera} key={`camera-${v}-${i}`}>
                        {v && (
                          <>
                            <CubePlayer
                              h5sControl={false}
                              dom-id={`player-${v}`}
                              deviceId={v}
                              key={`player-${v}-${i}`}
                              class={styles.video}
                            />
                            <button
                              class={styles.closeBtn}
                              onClick={() => handleCloseVideo(i)}
                            >
                              ×
                            </button>
                          </>
                        )}
                      </div>
                    )
                  )
                })
            }
          </div>
        </div>
      </SubPanelTemplate>
    )
  }
})