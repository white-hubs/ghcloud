import { defineComponent, onMounted, ref, type VNode } from 'vue'
import { CubeLayout } from '@ghcloud/cube-app-design'
import { usePageName } from '@ghcloud/cube-utils'
import { Button, Image } from '@ghcloud/cube-ui'
import dayjs from 'dayjs'
import { cubePropertyService } from '@/api/service'
import { useRoute, useRouter } from 'vue-router'
import { VerticalLine } from '@ghcloud/cube-app-design/src/base-components/vertical-line/vertical-line'
import style from './index.module.less'
import { CarType, UserType } from './type'

export const LedgerDetails = defineComponent({
  setup: () => {
    const route = useRoute()
    const vehicleLedger = ref()
    // 回显
    const vehicleLedgerDetails = async (): Promise<void> => {
      vehicleLedger.value = await cubePropertyService.riskSourceLedgerDetails((route.query as { id: string; }).id)
      vehicleLedger.value.partsDetails = vehicleLedger.value?.partsDetails.map((item: { expireDate: string | number | Date | dayjs.Dayjs | null | undefined; }) => {
        return {
          ...item,
          expireDate: item.expireDate ? dayjs(item.expireDate).format('YYYY-MM-DD') : ''
        }
      })
    }
    const { pageTitle } = usePageName()
    const router = useRouter()
    const slots = {
      'layout-content': (): VNode => {
        return (
          <div class={style.contentBox}>
            <VerticalLine title='基本信息' />
            <div class={style.vehicleBox}>
              <div class={style.vehicleLeft}>
                <div class={style.vehicle_item}>
                  <div>编码:</div>
                  <div class={style.risk_value}>{vehicleLedger.value?.serialNumber}</div>
                </div>
                <div class={style.vehicle_item}>
                  <div>分类:</div>
                  <div class={style.risk_value}>{CarType.get(vehicleLedger.value?.electronMobileType) ?? '--'}</div>
                </div>
                <div class={style.vehicle_item}>
                  <div>品牌:</div>
                  <div class={style.risk_value}>{vehicleLedger.value?.brand}</div>
                </div>
                <div class={style.vehicle_item}>
                  <div>颜色:</div>
                  <div
                    class={style.risk_value}
                    style={`background:${vehicleLedger.value?.electronMobileColour ?? 'black'};margin-left:8px; width: 50px;height: 50px;`}
                  />
                </div>
                <div class={style.vehicle_item}>
                  <div>所在区域:</div>
                  <div class={style.risk_value}>{vehicleLedger.value?.areaName}</div>
                </div>
                <div class={style.vehicle_item}>
                  <div>关联现场点:</div>
                  <div class={style.risk_value}>{vehicleLedger.value?.sitePointName}</div>
                </div>
                <div class={style.vehicle_item}>
                  <div>维护部门:</div>
                  <div class={style.risk_value}>{vehicleLedger.value?.maintenanceDepName}</div>
                </div>
                <div class={style.vehicle_item}>
                  <div>使用人类型:</div>
                  <div class={style.risk_value}>{UserType.get(vehicleLedger.value?.receiveUserType) ?? '--'}</div>
                </div>
              </div>
              <div class={style.riskRight}>
                <div class={style.vehicle_item}>
                  <div>名称:</div>
                  <div class={style.risk_value}>{vehicleLedger.value?.name}</div>
                </div>
                <div class={style.vehicle_item}>
                  <div>规格型号:</div>
                  <div class={style.risk_value}>{vehicleLedger.value?.norms}</div>
                </div>
                <div class={style.vehicle_item}>
                  <div>车牌号:</div>
                  <div class={style.risk_value}>{vehicleLedger.value?.plateNumber}</div>
                </div>
                <div class={style.vehicle_item}>
                  <div>关联档位:</div>
                  <div class={style.risk_value}>{vehicleLedger.value?.stallName}</div>
                </div>
                <div class={style.vehicle_item}>
                  <div>详细位置:</div>
                  <div class={style.risk_value}>{vehicleLedger.value?.attribute}</div>
                </div>
                <div class={style.vehicle_item}>
                  <div>维护人:</div>
                  <div class={style.risk_value}>{vehicleLedger.value?.maintenanceUserName}</div>
                </div>
                <div class={style.vehicle_item}>
                  <div>使用人:</div>
                  <div class={style.risk_value}>{vehicleLedger.value?.receiveUserName}</div>
                </div>
                <div class={style.vehicle_item}>
                  <div>联系方式:</div>
                  <div class={style.risk_value}>{vehicleLedger.value?.receiveUserPhone}</div>
                </div>
                <div class={style.vehicle_item}>
                  <div>附件:</div>
                  <div class={style.risk_value} style='display:flex;align-items: center;'>
                    {
                      vehicleLedger.value?.files.map((e: { id: string | number | symbol; type: string; path: string; name: string; }) => {
                        return (
                          <div key={e.id}>
                            {
                              ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'psd', 'svg', 'tiff'].includes(e.type)
                                ? <Image key={e.id} style={{ width: '100px' }} src={e.path} />
                                : <span key={e.id} class={style.risk_file} onClick={() => {
                                  window.open(e.path)
                                }}>{e.name}</span>
                            }
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      },
      'footer-page': (): VNode => {
        return (
          <Button onClick={backPage}>返回</Button>
        )
      },
    }
    const backPage = (): void => {
      router.push({ path: '/electric-vehicle-ledger' })
    }
    onMounted(async () => {
      vehicleLedgerDetails()
    })
    return (): VNode => (
      <CubeLayout title={pageTitle} v-slots={slots} />
    )
  }
})
