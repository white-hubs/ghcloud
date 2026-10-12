import { cubeDeviceCenterService } from '../../api/server'
import { useMetaTitle } from '../../hooks/use-meta-title-hook'
import { GHIotSocket } from '@ghcloud/cube-iot-socket'
import { Cell, CellGroup, Tag, closeToast, showLoadingToast } from 'vant'
import { defineComponent, onMounted, onUnmounted, ref, type VNode } from 'vue'
import { useRoute } from 'vue-router'
import styles from './device-monitor.module.less'
import EnumerateAttribute from '../../components/device-attribute/enumerate-attribute'
import SetValueAttribute from '../../components/device-attribute/set-value-attribute'
import SetStringAttribute from '../../components/device-attribute/set-string-attribute'
import SwitchAttribute from '../../components/device-attribute/switch-attribute'
import { authStore } from '../../api/auth-store'
import { BuildInTagCodesEnum, checkForBuiltInDashboardTagCode } from '@ghcloud/cube-iot-center-service'
import { DeviceElectric } from './device-dashboard/electric/electric.tsx'
import HumidityDashboard from './device-dashboard/humidity/humidity.vue'
import FirePressureDashboard from './device-dashboard/fire/pressure.vue'
import LiquidLevelSensors from './device-dashboard/fire/liquid-level-sensors.vue'
import { DeviceGas } from './device-dashboard/gas/gas.tsx'
import { DeviceUps } from './device-dashboard/ups/ups.tsx'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

/** 设备监测页 */
interface AttributeKeyValue {
  keyName: string; value: number ;label: string; 
}
export const DeviceMonitor = defineComponent({
  setup: () => {
    useMetaTitle()
    const route = useRoute()
    const deviceDetail = ref()
    const deviceBaseInfo = ref()
    const attributeValue = ref()
    const readAndWritData = ref()
    const readData = ref()
    const productPropVoList = ref()
    const attributeValueRead = ref()
    const snapshots = ref()
    const dashboardTagCode = ref<BuildInTagCodesEnum | string | null>(null)
    const dashboardList = [
      'builtin.usage::ups',
      'builtin.usage::temp', 
      'builtin.usage::fire', 
      'builtin.usage::fire.water_pressure.device',
      'builtin.usage::combustible.gas.monitor',
      'builtin.usage::liquid.level.sensors',
      'builtin.usage::electrical.monitor'
    ]
    let subscribeRealTimeData: { key: PropertyKey; value: unknown; }[]
    let iotSocket: GHIotSocket
    const messageMsg = (message: { msgType: string; content: string; }): void => {
      switch (message.msgType) {
        case 'WELCOME':
          break
        case 'SUBSCRIBE_PUSH':
          subscribeRealTimeData = JSON.parse(message.content).msg.updates
          subscribeRealTimeData.forEach((item: { key: PropertyKey; value: unknown; }) => {
             
            if (attributeValue.value?.hasOwnProperty(item.key)) {
              attributeValue.value[item.key] = item.value
            }
          })
          break
        default:
      }
    }

    // 获取设备属性
    const getBasicData = async (): Promise<void> => {
      showLoadingToast({
        message: '加载中...',
        duration: 0,
        forbidClick: true,
      })
      try {
        // 设备详情
        deviceDetail.value = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: route.query.id as string })
        if (deviceDetail.value) {
          if (!iotSocket) {
            return
          }
          // 设备详情
          const detail = await iotSocket.deviceDetail({
            deviceId: route.query.id as string,
            withSnapShot: true,
            withPropertySpec: true,
          })
          deviceBaseInfo.value = detail.deviceInfo
          productPropVoList.value = detail.deviceInfo.productPropVoList
          snapshots.value = detail.deviceInfo.snapshots
          const { dataArr } = detail  
          if (dataArr) {
            // 读写数据
            readAndWritData.value = dataArr.filter((item) => item.permission === 'READ_WRITE')
            readData.value = dataArr.filter((item) => item.permission === 'READ')
            attributeValueRead.value = Object.fromEntries(
              readData.value.map((item: { attributeCode: string; value: number; }) => [item.attributeCode, item.value])
            )
          }
          // 判断当前的设置是否命中内置仪表盘
          const getCurrentAttr = (deviceProductPropVoList: { propCode: string; }[]): boolean => {
            const attr = ['ua', 'ia', 'temp_a', 'temp_b', 'temp_c', 'uab', 'iab']
            let flag = false
            for (let i = 0; i < attr.length; i++) {
              const attrData = deviceProductPropVoList.find(e => e.propCode === attr[i])
              if (attrData !== undefined) {
                flag = true
                break
              }
            }
            return flag
          }
          checkForBuiltInDashboardTagCode(authStore, route.query.id as string).then(res => {
            dashboardTagCode.value = res  
            if (!res && getCurrentAttr(productPropVoList.value)) {
              dashboardTagCode.value = 'ELECTRICMANAGE'
            }
          })
        }
      } catch {
      } finally {
        closeToast()
      }
    }
    // 可控属性
    const operateDom = (item: { dataType: string; attributeName: string; unitName: string; value: string | number; }): VNode | null => {
      let dom: VNode | null = null
      switch (item.dataType.toLowerCase()) {
        case 'enum':
          dom = (
            <div style={{ marginLeft: '5px', marginBottom: '10px' }}>
              <div class={styles['monitor-item']}>
                <label>{item.attributeName}：</label>
              </div>
              <EnumerateAttribute
                curValue={item.value as string}
                attributeItem={item}
                deviceId={route.query.id as string}
              />
            </div>
          )
          break
        case 'boolean':
          dom = (
            <div style={{ marginLeft: '5px', display: 'flex', alignItems: 'flex-end' }}>
              <div class={styles['monitor-item']}>
                <label>{item.attributeName}：</label>
              </div>
              <SwitchAttribute
                attributeItem={item}
                curValue={Number(item.value)}
                deviceId={route.query.id as string}
              />
            </div>
          )
          break
        case 'string':
          dom = (
            <SetStringAttribute
              curValue={item.value as string}
              attributeItem={item}
              deviceId={route.query.id as string}
            />
          )
          break
        default:
          dom = (
            <SetValueAttribute
              curValue={Number(item.value)}
              attributeItem={item}
              deviceId={route.query.id as string}
            />
          )
          break
      }
      return dom
    }
    onMounted(async () => {
      getBasicData()
      try {
        const info = { ...authStore, terminal: 'bimops-manage-web', accessToken: authStore.token }
        iotSocket = new GHIotSocket(info)
        iotSocket.onmessage(messageMsg)
      } catch {
      }
    })
    onUnmounted(() => {
      iotSocket?.unsubscribe()
      iotSocket?.dispose()
    })
    return (): JSX.Element =>
      <>
        {(route.query.isSelf as unknown) === '1' ? null : <CubeNavBar showBack title={route.query.title} />}
        <div class={styles.wrapper}>
          {/* 基本信息================================================================================== */}
          <CellGroup inset class={styles['cell-group']}>
            <Cell border={false} style={{ paddingBottom: '0px' }}>
              <div class={styles['cell-title']}>
                <Tag
                  style={{ height: '22px', width: '48px', display: 'inline-block', textAlign: 'center', lineHeight: '22px', marginRight: '4px', borderRadius: '4px' }}
                  color={deviceDetail.value?.baseArchivesInfo.status.onlineState ? '#58bd6b' : '#969799'}
                  text-color='#FFFFFF'
                >{deviceDetail.value?.baseArchivesInfo.status.onlineState ? '在线' : '离线'}
                </Tag>
                <div class={styles['name-status']}>
                  <span class={styles.name}>{deviceDetail.value?.baseArchivesInfo.name}</span>
                </div>
              </div>
            </Cell>
            <Cell border={false} class={styles.cell}>
              <div class={styles['cell-item']}>
                <label>设备品类：</label>
                <span>{deviceDetail.value?.productInfo.productCategory.name || '--'}</span>
              </div>
              <div class={styles['cell-item']}>
                <label>维护部门：</label>
                <span>{deviceDetail.value?.baseArchivesInfo.department?.name || '--'}</span>
              </div>
              <div class={styles['cell-item']}>
                <label>设备品牌：</label>
                <span>{deviceDetail.value?.productInfo.brandName || '--'}</span>
              </div>
              <div class={styles['cell-item']}>
                <label>所属区域：</label>
                <span>{deviceDetail.value?.baseArchivesInfo.area?.pathName || '--'}</span>
              </div>
            </Cell>
          </CellGroup>
          {/* 状态监测================================================================================== */}
          <CellGroup v-show={readData.value?.length > 0 } inset class={styles['cell-group']}>
            <Cell>
              <div class={styles['cell-title']}>
                <div class={styles['name-status']}>
                  <span class={styles.name}>状态监测</span>
                </div>
              </div>
            </Cell>
            <Cell class={styles.cell}>
              <div class={styles['cell-monitor']}>
                {
                  (() => {
                    const list = (readData.value ?? []).slice()
                    const unitCounts: Record<string, number> = {}
                    list.forEach(it => {
                      const k = it.unitName ?? ''
                      unitCounts[k] = (unitCounts[k] || 0) + 1
                    })
                    return list
                      .sort((a, b) => {
                        const ca = unitCounts[a.unitName ?? ''] || 0
                        const cb = unitCounts[b.unitName ?? ''] || 0
                        if (ca !== cb) return ca - cb
                        const ua = a.unitName ?? ''
                        const ub = b.unitName ?? ''
                        const unitCmp = ua.localeCompare(ub, 'zh-Hans-CN', { sensitivity: 'base', numeric: true })
                        if (unitCmp !== 0) return unitCmp
                        const aa = a.attributeName ?? ''
                        const ab = b.attributeName ?? ''
                        return aa.localeCompare(ab, 'zh-Hans-CN', { sensitivity: 'base', numeric: true })
                      })
                      .map((item: { propCode: string | number | symbol; attributeName: string; attributeKeyValueVos: number[] | AttributeKeyValue[]; attributeCode: string | number; unitName: string; }) =>
                        <div class={styles['monitor-item']} key={item.propCode}>
                          <label>{item.attributeName}</label>
                          {
                            item.attributeKeyValueVos.length && (item.attributeKeyValueVos as AttributeKeyValue[])[0].value 
                              ? <>{(item.attributeKeyValueVos as AttributeKeyValue[]).find(e => e.value === attributeValueRead.value[item.attributeCode])?.keyName || (item.attributeKeyValueVos as AttributeKeyValue[]).find(e => e.value === attributeValueRead.value[item.attributeCode])?.label || '--'} </>
                              : <> {attributeValueRead.value[item.attributeCode] || '--'}{attributeValueRead.value[item.attributeCode] ? item.unitName : ''}</>
                          }
                        </div>)
                  })()
                }
              </div>
            </Cell>
          </CellGroup>
          {/* 仪表盘================================================================================== */}
          <CellGroup v-show={readData.value?.length > 0 && dashboardTagCode.value} inset class={styles['cell-group']}>
            <Cell class={styles.cell}>
              <div class={styles['cell-monitor']}>
                {
                  (BuildInTagCodesEnum.ELECTRICAL_MONITOR === dashboardTagCode.value || dashboardTagCode.value === 'ELECTRICMANAGE')
                    ? <DeviceElectric   
                      data={attributeValueRead.value}
                      propsCodeList={productPropVoList.value}
                    />
                    : BuildInTagCodesEnum.UPS === dashboardTagCode.value
                      ? <DeviceUps 
                        status={deviceDetail.value?.baseArchivesInfo.status.onlineState}
                        data={attributeValueRead.value}
                        productPropVoList={productPropVoList.value}
                      />
                      : BuildInTagCodesEnum.COMBUSTIBLE_GAS_MONITOR === dashboardTagCode.value 
                        ? <DeviceGas data={attributeValueRead.value} propsCodeList={productPropVoList.value} />
                        : BuildInTagCodesEnum.TEMP === dashboardTagCode.value
                          ? <HumidityDashboard 
                            data={attributeValueRead.value}
                            productPropVoList={productPropVoList.value}
                            deviceInfo={deviceBaseInfo.value}
                          />
                          : BuildInTagCodesEnum.FIRE_WATER_PRESSURE === dashboardTagCode.value
                            ? <FirePressureDashboard
                              data={attributeValueRead.value}
                              productPropVoList={productPropVoList.value}
                            />
                            : BuildInTagCodesEnum.LIQUID_LEVEL_SENSORS === dashboardTagCode.value
                              ? <LiquidLevelSensors
                                data={attributeValueRead.value}
                                productPropVoList={productPropVoList.value}
                              />
                              : null
                }
              </div>
            </Cell>
          </CellGroup>
          {/* 设备监控================================================================================== */}
          <CellGroup v-show={readAndWritData.value?.length > 0} inset class={styles['cell-group']}>
            <Cell>
              <div class={styles['cell-title']}>
                <div class={styles['name-status']}>
                  <span class={styles.name}>设备控制</span>
                </div>
              </div>
            </Cell>
            <div class={styles['cell-monitor-operate']}>
              {
                readAndWritData.value?.map((item: {
                  dataType: string; propCode: string | number | symbol; attributeName: string; unitName: string;value: string;
                }) =>
                  <div key={item.propCode} style='margin-top:10px'>
                    {operateDom(item)}
                  </div>)
              }
            </div>
          </CellGroup>
        </div>
      </>
  }
})
