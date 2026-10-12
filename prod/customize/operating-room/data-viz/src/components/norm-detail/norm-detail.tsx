import { computed, defineComponent, ref } from 'vue'
import './norm-detail.less'
import { getImage, intToRoman } from '@/hook/use-utils'
import { RequestHelp } from '@/components/request-help/request-help'
import type { DevicePropsForUI } from '@/hook/use-props'
import type { RoomItem } from '@/store/cache'

interface Props {
  deviceInfo: RoomItem;
  deviceProps: DevicePropsForUI[];
  effective: boolean;
  roomRules: {
    file: {
      path: string;
      type: string;
    };
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
      const data = (props.deviceProps ?? []).filter(e => e.showArea === '1').sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      fitAirStatus(data)
      return data
    })
    const centerCardList = computed(() => {
      const data = (props.deviceProps ?? []).filter(e => e.showArea === '2').sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      fitAirStatus(data)
      return data
    })
    const rightCardList = computed(() => {
      const data = (props.deviceProps ?? []).filter(e => e.showArea === '3').sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
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
      const name = airValue === 1 ? '开机' : airValue === 0 ? '正常停机' : null
      return {
        name,
        value: airValue,
        isOpen: airValue === 1,
      }
    })
    const roomColor = computed(() => {
      return !roomStatus.value?.isOpen ? 'color-light-NORMAL' : ''
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
      <div class='entrance-screen-body'>
        <div class='left left-list' v-show={props.effective}>
          <div class='column'>
            <div class='head'>{getAreaName('1') || '标准参数'}</div>
            <div class='list grid-2'>
              {
                leftCardList.value.map((e, i) => {
                  return e.display && i < 6
                    ? (
                      <div class='item small-card area-1' key={e.name}>
                        <span class='title'>{e.name}</span>
                        <div class='numerical'>
                          <div class='numerical-wrap'>
                            {
                              e.code === 'airconditioner'
                                ? <span class='value color-NORMAL font-20'>{roomStatus.value?.name || '--'}</span>
                                : <span class={`value color-${roomColor.value || e.status}`}>{e.valueText || '-'}</span>
                            }
                            <span class='unit'>{e.unit}</span>
                          </div>
                        </div>
                      </div>
                    )
                    : ''
                })
              }
            </div>
          </div>
          <div class='column'>
            <div class='head'>{getAreaName('2') || '健安参数'}</div>
            <div class='list grid-1'>
              {
                centerCardList.value.map((e, i) => {
                  return e.display && i < 4
                    ? (
                      <div class='item small-card area-2' key={e.name}>
                        <span class='title'>{e.name}</span>
                        <div class='numerical'>
                          <div class='numerical-wrap'>
                            {
                              e.code === 'airconditioner'
                                ? <span class='value color-NORMAL font-20'>{roomStatus.value?.name || '--'}</span>
                                : <span class={`value color-${roomColor.value || e.status}`}>{e.valueText || '-'}</span>
                            }
                            <span class='unit'>{e.unit}</span>
                          </div>
                        </div>
                      </div>
                    )
                    : ''
                })
              }
            </div>
          </div>
          <div class='column'>
            <div class='head'>{getAreaName('3') || '运管参数'}</div>
            <div class='list mt-30 grid-1'>
              {
                rightCardList.value.map((e, i) => {
                  return e.display && i < 3
                    ? (
                      <div class='item small-card area-3' key={e.name}>
                        <span class='title'>{e.name}</span>
                        <div class='numerical'>
                          <div class='numerical-wrap'>
                            {
                              e.code === 'airconditioner'
                                ? <span class='value color-NORMAL font-20'>{roomStatus.value?.name || '--'}</span>
                                : <span class={`value color-${roomColor.value || e.status}`}>{e.valueText || '-'}</span>
                            }
                            <span class='unit'>{e.unit}</span>
                          </div>
                        </div>
                      </div>
                    )
                    : ''
                })
              }
            </div>
            <RequestHelp
              deviceProps={requestHelpProps.value}
              deviceList={[props.deviceInfo]}
              onModalVisibleChange={(e) => {
                showRequest.value = e
              }}
              skin='entrance-screen'
            />
          </div>
        </div>
        <div class='item right' v-show={props.effective}>
          <div class='top'>
            <span class='name'>{props.deviceInfo?.deviceName ?? ''}</span>
            <div class='level'>
              <div class='level-value'>
                <img src={getImage('level-circle.png')} />
                <span class='number'>{props.effective ? (level.value ? intToRoman(level.value ?? 0) : '-') : '--'}</span>
              </div>
              <span class='title'>洁净等级</span>
            </div>
          </div>
          <div class='um-count'>
            <div class='head'>尘埃粒子</div>
            {
              umList.value.map(e => {
                return (
                  <div class='um-count-item' key={e.code}>
                    <span class='label'>{e.name}</span>
                    <span class='value'>
                      {
                        e.code === 'airconditioner'
                          ? <span class='value color-NORMAL font-20'>{e.value === 0 ? '正常停机' : e.value === 1 ? '开机' : '--'}</span>
                          : <span class={`value color-${roomColor.value || e.status}`}>{e.valueText || '-'}</span>
                      }
                      <span class='unit' style='color: #c4ddff;'>{e.unit}</span>
                    </span>
                  </div>
                )
              })
            }
          </div>
        </div>
        {
          (!props.effective && props.roomRules?.file?.path) &&
            <>
              {props.roomRules?.file.type !== 'mp4' && <img class='bg-picture' src={props.roomRules?.file?.path} style='width:100%;height:100%' />}
              {props.roomRules?.file.type === 'mp4' && <video class='bg-picture' muted autoplay loop src={props.roomRules?.file?.path} style='width:100%;height:100%;object-fit: fill;' />}
            </>
        }
      </div>
  }
})
