import { defineComponent, onMounted, ref } from 'vue'
import { CubePlayer } from '@ghcloud/cube-player'
import { getQueryParameters } from './utils/url-utils.ts'
import { logger } from './logger.ts'

export const App = defineComponent({
  name: 'App',
  setup () {
    const loading = ref(true)
    const errorMsg = ref('')
    const { deviceId } = getQueryParameters()

    onMounted(() => {
      if (!deviceId) {
        errorMsg.value = '缺少设备ID参数 (deviceId)'
        logger.error('缺少设备ID参数')
      }
      loading.value = false
    })

    return () => (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000'
      }}>
        {/* 播放器容器：宽度100%，高度按16:9比例自适应 */}
        <div style={{
          width: '100%',
          aspectRatio: '16 / 9',
          maxHeight: '100%',
          position: 'relative'
        }}>
          {loading.value && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#999',
              fontSize: '14px'
            }}>
              正在加载播放器...
            </div>
          )}

          {!loading.value && errorMsg.value && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#f00',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {errorMsg.value}
            </div>
          )}

          {!loading.value && !errorMsg.value && deviceId && (
            <CubePlayer
              deviceId={deviceId}
              control={false}
              h5sControl={false}
              isReconnect={true}
              isShowDeviceDetails={false}
              onError={(msg: string, errorType: string) => {
                logger.error(`播放错误: ${msg}, 类型: ${errorType}`)
                errorMsg.value = msg
              }}
            />
          )}
        </div>
      </div>
    )
  }
})

