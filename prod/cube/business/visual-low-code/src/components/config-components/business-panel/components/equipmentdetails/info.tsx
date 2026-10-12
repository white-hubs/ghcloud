import { defineComponent, ref, watch } from 'vue'
import { getDeviceInfo } from '@/apis/business/device'
import styles from './styles/info.module.less'
import { getAssetsImge } from '@/utils/get-image'
import { useMessage } from '@ghcloud/visual-view-ui'
export default defineComponent({
  name: 'info',
  props: {
    id: {
      type: String,
      default: '1649288689005703170',
    }
  },
  setup (props) {
    const message = useMessage()
    const datainfo = ref()
    const managerUserName = ref('')
    const deviceInfo = async (): Promise<void> => {
      try {
        const res = await getDeviceInfo(props.id)
        datainfo.value = res.data?.detail
        managerUserName.value = datainfo.value.managerUserName.join(',') ?? '暂无'
      } catch (err) {
        message.error('产品不存在')
        managerUserName.value = '暂无'
        datainfo.value = null
      }
    }
    watch(() => props.id, () => {
      deviceInfo()
    })
    return () =>
      <div class={styles['info-content']}>
        <div class={styles.info}>
          <div class={styles['info-img']}>
            {
              datainfo.value?.images && datainfo.value.images.length > 0
                ? <img src={datainfo.value.images[0].path} />
                : <div><div style='color:#fff'>暂无图片</div><img width='120' height='120' src={getAssetsImge('chart/charts/over-view45.png')} /></div>
            }
          </div>
          <div style='width: 33%'>
            <div class={styles['info-name']}>设备编码: <span>{datainfo.value?.code ?? '暂无'}</span></div>
            <div class={styles['info-name']}>所属区域:<span>{datainfo.value?.areaName ?? '暂无'}</span></div>
            <div class={styles['info-name']}>管理人员:<span>{managerUserName.value}</span></div>
            <div class={styles['info-name']}>部门名称:<span>{datainfo.value?.departmentName ?? '暂无'}</span></div>

          </div>
          <div style='width: 33%'>
            <div class={styles['info-name']}>设备类型:<span>{datainfo.value?.genreName ?? '暂无'}</span></div>
            <div class={styles['info-name']}>设备品牌:<span>{datainfo.value?.brandName ?? '暂无'}</span></div>
            <div class={styles['info-name']}>设备型号:<span>{datainfo.value?.modelName ?? '暂无'}</span></div>
            <div class={styles['info-name']}>
              设备状态:
              <span v-show={datainfo.value?.deviceStatus === 'NORMAL'} style='color: #5ccd4d'>正常</span>
              <span v-show={datainfo.value?.deviceStatus === 'OFFLINE'} style='color: #fba33f'>
                离线
              </span>
              <span v-show={datainfo.value?.deviceStatus === 'ALARM'} style='color: #ff4070'>
                报警
              </span>
              <span v-show={datainfo.value?.deviceStatus === 'TROUBLE'} style='color: #fba33f'>
                故障
              </span>
              <span
                v-show={datainfo.value?.deviceStatus === '' || datainfo.value?.deviceStatus == null}
                style='color: #fba33f'
              >
                暂无状态
              </span>
            </div>
          </div>
        </div>
      </div>
  }
})
