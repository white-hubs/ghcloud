import { defineComponent, type PropType } from 'vue'
import { Icon } from 'vant'
import styles from './index.module.less'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts'
interface PropsLocaltion {
  address: string;
  lngAndlat: string;
}
export const LocationIcon = defineComponent({
  props: {
    localtion: {
      type: Object as PropType<PropsLocaltion>,
      default: () => ({
        address: '',
        lngAndlat: ''
      })
    }
  },
  setup: (props) => {
    const handleOpenMap = (e: Event): void => {
      const env = getEnvironment()
      e.stopPropagation()
      if (!props.localtion.lngAndlat) {
        throw new Error('经纬度不能为空')
      }
      if (env === 'cubeApp') {
        cubeAppService.openTripartiteMap({
          type: 'route',
          latitude: Number(props.localtion.lngAndlat.split(',')[1]),
          longitude: Number(props.localtion.lngAndlat.split(',')[0]),
          address: props.localtion.address
        })
      }
    }
    return (): JSX.Element => (
      <>
        <div class={styles.icon} onClick={handleOpenMap}>
          <Icon name='location' color='var(--van-primary-color)' style={{ width: '11px', height: '14px' }} />
          <span class={styles.text}>导航</span>
        </div>
      </>
    )
  }
})
