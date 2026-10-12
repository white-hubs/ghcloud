import { defineComponent, type PropType } from 'vue'
import { Icon } from 'vant'
import styles from './index.module.less'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts'
interface Propslocation {
  address: string;
  lngAndlat: string;
}
export const LocationIcon = defineComponent({
  props: {
    location: {
      type: Object as PropType<Propslocation>,
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
      if (!props.location.lngAndlat) {
        throw new Error('经纬度不能为空')
      }
      if (env === 'cubeApp') {
        cubeAppService.openTripartiteMap({
          type: 'route',
          latitude: Number(props.location.lngAndlat.split(',')[1]),
          longitude: Number(props.location.lngAndlat.split(',')[0]),
          address: props.location.address
        })
      }
    }
    return (): JSX.Element => (
      <>
        <div class={styles.icon} onClick={handleOpenMap}>
          <span><Icon name='location' color='var(--van-primary-color)' style={{ width: '11px', height: '14px' }} /></span>
          <span class={styles.text}>导航</span>
        </div>
      </>
    )
  }
})
