import { defineComponent, onMounted, ref } from 'vue'
import { Image } from 'ant-design-vue'
import { cubeDeviceCenterService, cubeFileService } from '@/api/service'
import styles from './device-base-info.module.less'
import type { DeviceInstanceDetail } from '@ghcloud/cube-iot-center-service'
const picNone = '/resource/v1/ue5-migrate/pages/widget/modal/device-modal/assets/pic-none.png'

export const DeviceBaseInfo = defineComponent({
  props: {
    id: {
      type: String,
      default: '',
    },
  },
  setup (props) {
    const dataInfo = ref<DeviceInstanceDetail>()
    const imgPath = ref('')
    onMounted(async () => {
      dataInfo.value = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: props.id })
      if (dataInfo.value.productInfo.picture) {
        cubeFileService.getFileInfo(dataInfo.value.productInfo.picture).then((res) => {
          imgPath.value = res.path
        })
      }
    })

    return (): JSX.Element => (
      <div class={styles.infoContent}>
        <div class={styles.info}>
          <div class={styles.infoImg}>
            {imgPath.value
              ? (
                <Image width='100%' height='100%' src={imgPath.value} />
              )
              : (
                <div style='color:#fff'>暂无图片</div>
              )}
            {!imgPath.value && (
              <Image width='100%' height='100%' src={picNone} />
            )}
          </div>
          <div style='width: 33%'>
            <div class={styles.infoName}>
              设备编码: <span>{dataInfo.value?.baseArchivesInfo.code || '暂无'}</span>
            </div>
            <div class={styles.infoName}>
              所属区域: <span>{dataInfo.value?.baseArchivesInfo.area?.pathName || '暂无'}</span>
            </div>
            <div class={styles.infoName}>
              管理人员: <span>{dataInfo.value?.baseArchivesInfo.manager.length ? dataInfo.value?.baseArchivesInfo.manager[0].name : '暂无'}</span>
            </div>
            <div class={styles.infoName}>
              部门名称: <span>{dataInfo.value?.baseArchivesInfo.department?.name || '暂无'}</span>
            </div>
          </div>
          <div style='width: 36%'>
            <div class={styles.infoName}>
              设备品类: <span>{dataInfo.value?.productInfo.productCategory.name || '暂无'}</span>
            </div>
            <div class={styles.infoName}>
              设备型号: <span>{dataInfo.value?.productInfo.modelName || '暂无'}</span>
            </div>
            <div class={styles.infoName}>
              设备状态:
              {dataInfo.value?.baseArchivesInfo.status.onlineState
                ? (
                  <span style='color: #5ccd4d'>在线</span>
                )
                : (
                  <span style='color: #fba33f'>离线</span>
                )}
            </div>
            <div class={styles.infoName}>
              使用寿命:{' '}
              <span>
                {dataInfo.value?.expandInfo?.factoryInfo?.usefulLife
                  ? `${dataInfo.value?.expandInfo.factoryInfo.usefulLife}月`
                  : '暂无'}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  },
})
