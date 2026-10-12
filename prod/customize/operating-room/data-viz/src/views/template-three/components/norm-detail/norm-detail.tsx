import { computed, defineComponent, ref } from 'vue'
import styles from './index.module.less'
import { getImageThree, intToRoman } from '@/hook/use-utils'
import type { DevicePropsForUI } from '@/hook/use-props'
import type { RoomItem } from '@/store/cache'
import { Card } from '../card/card'
import { ItemOne } from '../card/item-one/item-one'
import { ItemTwo } from '../card/item-two/item-two'
import { ItemThree } from '../card/item-three/item-three'
import { RequestHelp } from '../request-help/request-help'
interface Props {
  deviceInfo: RoomItem;
  deviceProps: DevicePropsForUI[];
  effective: boolean;
  roomRules: {
    file: {
      path: string;
      type: string;
    };
    ruleNormList: {
      normCode?: string;
      display?: number;
      lowerLimit?: number | null;
      normName?: string;
      unit?: string;
      upperLimit?: number | null;
      showArea?: string | number | null;
      sort?: number | null;
    }[] | undefined;
    areaOptions: string;
  };
}

export const NormDetail = defineComponent({
  props: ['deviceProps', 'roomRules', 'effective', 'deviceInfo'],
  setup: (props: Props) => {
    const showRequest = ref(false)
    const fitAirStatus = (data: DevicePropsForUI[]): void => {
      data.forEach(i => {
        const hasAirStatus = !(window.config?.notAirStatus || []).includes(i.code)
        if (!roomStatus.value.isOpen && hasAirStatus) {
          i.valueText = ''
        } else {
          i.valueText = `${i.value ?? ''}`
        }
      })
    }
    const leftCardList = computed(() => {
      const leftData = (props.deviceProps ?? []).filter(e => e.showArea === '1').sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)).filter(e => e.display).slice(0, 6)
      leftData.forEach(i => {
        if (i.code && props.roomRules?.ruleNormList) {
          const ruleInfo = props.roomRules?.ruleNormList.find(r => r.normCode === i.code)
          i.limitRange = `${ruleInfo?.lowerLimit ?? 0}-${ruleInfo?.upperLimit ?? 0}`
        }
      })
      fitAirStatus(leftData)
      return leftData
    })
    const centerCardList = computed(() => {
      const data = (props.deviceProps ?? []).filter(e => e.showArea === '2').sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)).filter(e => e.display).slice(0, 4)
      fitAirStatus(data)
      return data
    })
    const rightCardList = computed(() => {
      const data = (props.deviceProps ?? []).filter(e => e.showArea === '3').sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)).filter(e => e.display).slice(0, 3)
      fitAirStatus(data)
      return data
    })
    const umList = computed(() => {
      const data = (props.deviceProps ?? []).filter(e => e.showArea === '4' && !e.code.includes('cleanlinessLevel')).map(e => {
        return {
          ...e,
          // unit: '个/m³',
        }
      }).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      fitAirStatus(data)
      return data
    })
    /** 关机手术室，空调状态 1 开机， 0 正常停机 */
    const roomStatus = computed(() => {
      const airValue = (props.deviceProps ?? []).find(e => e.code === 'airconditioner')?.value
      const name = airValue === 1 ? '开机' : airValue === 0 ? '正常停机' : ''
      return {
        name,
        value: airValue,
        isOpen: airValue === 1,
      }
    })
    const level = computed(() => {
      const find = (props.deviceProps ?? []).find(e => e.code.includes('cleanlinessLevel'))
      const hasAirStatus = !(window.config?.notAirStatus || []).includes('cleanlinessLevel')
      if (!roomStatus.value.isOpen && hasAirStatus) {
        return null
      } else {
        return find?.value ?? 0
      }
    })
    const requestHelpProps = computed(() => {
      return (props.deviceProps ?? []).filter(e => e.code !== 'airconditioner') ?? []
    })
    const areaOptions = computed(() => {
      return props.roomRules?.areaOptions
    })
    const getAreaName = (key: string): string => {
      let areas: { label: string; value: string; }[] = []
      try {
        areas = areaOptions.value ? JSON.parse(areaOptions.value) : []
      } catch {
        areas = []
      }
      return areas.find((e: { value: string; }) => e.value === key)?.label ?? ''
    }

    return (): JSX.Element =>
      <div class={styles['entrance-screen-body']}>
        <div class={styles.left} v-show={props.effective}>
          <div class={styles.top}>
            <Card title={getAreaName('1') || '标准参数'}>
              <ItemOne data={leftCardList.value} roomStatus={roomStatus.value} />
            </Card>
          </div>
          <div class={styles.bottom}>
            <Card sub title={getAreaName('2') || '健安参数'}>
              <ItemTwo data={centerCardList.value} roomStatus={roomStatus.value} />
            </Card>
            <Card sub title={getAreaName('3') || '运管参数'}>
              <ItemTwo data={rightCardList.value} roomStatus={roomStatus.value}>
                {
                  roomStatus.value.isOpen &&
                  <RequestHelp
                    deviceProps={requestHelpProps.value}
                    deviceList={[props.deviceInfo]}
                    onModalVisibleChange={(e) => {
                      showRequest.value = e
                    }}
                  />
                }
              </ItemTwo>
            </Card>
          </div>
        </div>
        <div class={[styles.item, styles.right]} v-show={props.effective}>
          <div class={styles.top}>
            <span class={styles.name}>{props.deviceInfo?.deviceName ?? ''}</span>
            <div class={styles.level}>
              <div class={styles['level-value']}>
                <img class={styles.img} src={getImageThree('level-circle.png')} />
                <div class={styles.number}>
                  {props.effective ? (level.value ? intToRoman(level.value ?? 0) : '-') : '--'}
                  <p class={styles.numberTitle}>洁净等级</p>
                </div>
              </div>
            </div>
          </div>
          <Card height='27rem' um title='尘埃粒子'>
            <ItemThree data={umList.value} roomStatus={roomStatus.value} />
          </Card>
          <span class={styles.copyright}>{window.config.copyright}</span>
        </div>
        {
          (!props.effective && props.roomRules?.file?.path) &&
            <>
              {props.roomRules?.file.type !== 'mp4' && <img class={styles['bg-picture']} src={props.roomRules?.file?.path} style='width:100%;height:100%' />}
              {props.roomRules?.file.type === 'mp4' && <video class={styles['bg-picture']} muted autoplay loop src={props.roomRules?.file?.path} style='width:100%;height:100%;object-fit: fill;' />}
            </>
        }
      </div>
  }
})
