
import { Tabs, TabPane, Input, DatePicker, Image, type FileType, Button, PopOver } from '@ghcloud/cube-ui'
import { GLayout } from '@/components/common/layout'
import { defineComponent, onMounted, ref } from 'vue'
import { GVerticalLine } from '@/components/common/vertical-line'
import type { DeptList } from '@ghcloud/cube-ouaa-service'
import { cubeOuaaService, cubeMdataService, cubeMaintainService, cubePropertyService, cubeStallService, cubeTypeService } from '@/api/service'
import type { AreaTree } from '@ghcloud/cube-mdata-service'
import style from './index.module.less'
import type { GenStallPageRecord, RiskSourceLedgerDetails, RootObject } from '@ghcloud/cube-risk-management-service'
import Table from '@ghcloud/cube-ui/src/components/table/table'
import { useRouter, useRoute } from 'vue-router'
import dayjs from 'dayjs'
export interface FileTypes extends FileType {
  readonly id: string;
}
export const RiskLedgerDetails = defineComponent({
  setup: () => {
    const router = useRouter()
    const route = useRoute()
    const riskType = ref([])
    const areaOptions = ref<AreaTree[]>([])
    const pointData = ref<RootObject[]>([])
    const stallPageData = ref<GenStallPageRecord[]>([])
    const deptList = ref<DeptList[]>([])
    const riskLedger = ref<RiskSourceLedgerDetails>({
      id: '',
      serialNumber: '',
      name: '',
      latAndLon: '',
      typeName: '',
      areaId: '',
      areaName: '',
      stallName: '',
      sitePointName: '',
      attribute: '',
      number: 0,
      maintenanceDepId: '',
      maintenanceDepName: '',
      status: '',
      files: [],
      remarks: '',
      receiveDepId: '',
      receiveDepName: '',
      receiveUserName: '',
      receiveUserPhone: '',
      usageDate: 0,
      mandatoryTestingDate: 0,
      updateTime: 0,
      deliveryAddress: '',
      produceAddress: '',
      deliveryCompany: '',
      produceFactory: '',
      partsDetails: [],
      norms: '',
      maintenanceUserId: '',
      maintenanceUserName: '',
      address: '',
      receiveUserType: '',
      purchasingDate: '',
      efficiency: '',
      plateNumber: '',
      insurance: '',
    })
    const columns = [
      {
        title: '配件编号',
        dataIndex: 'code',
        align: 'center',
        customRender: ({ record, text }: { text: string; record: { code: string;modifyFlag: boolean; }; }): JSX.Element => {
          return record.modifyFlag
            ? <Input showCount={false} v-model:value={record.code} />
            : <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '配件名称',
        dataIndex: 'name',
        align: 'center',
        customRender: ({ record, text }: { text: string; record: { name: string;modifyFlag: boolean; }; }): JSX.Element => {
          return record.modifyFlag
            ? <Input showCount={false} v-model:value={record.name} />
            : <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '到期时间',
        dataIndex: 'expireDate',
        align: 'center',
        customRender: ({ record, text }: { text: string; record: { expireDate: string;modifyFlag: boolean; }; }): JSX.Element => {
          return record.modifyFlag
            ? <DatePicker v-model:value={record.expireDate} />
            : <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '备注',
        dataIndex: 'remarks',
        align: 'center',
        customRender: ({ record, text }: { text: string; record: { remarks: string;modifyFlag: boolean; }; }): JSX.Element => {
          return record.modifyFlag
            ? <Input showCount={false} v-model:value={record.remarks} />
            : <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
    ]
    const getRiskClassification = async (): Promise<void> => {
      const res = await cubeTypeService.getType({ itemCode: 'risk-source-type' })
      riskType.value = res
    }
    const riskLedgerDetails = async (): Promise<void> => {
      riskLedger.value = await cubePropertyService.riskSourceLedgerDetails((route.query as { id: string; }).id)
      riskLedger.value.partsDetails = riskLedger.value.partsDetails.map(item => {
        return {
          ...item,
          expireDate: item.expireDate ? dayjs(item.expireDate).format('YYYY-MM-DD') : ''
        }
      })
    }
    const getDeptData = async (): Promise<void> => {
      deptList.value = await cubeOuaaService.getDeptList()
    }
    const getAreaData = async (): Promise<void> => {
      const res = await cubeMdataService.getAreaTree()
      areaOptions.value = res
    }
    const getPointList = async (): Promise<void> => {
      const res = await cubeMaintainService.inspectPointList({ pageNumber: 1, pageSize: 1000 })
      pointData.value = res.records
    }
    const getStallPageList = async (): Promise<void> => {
      const res = await cubeStallService.genStallPage({ pageNumber: 1, pageSize: 1000 })
      stallPageData.value = res.records
    }
    const backPage = (): void => {
      router.push({ path: '/risk-ledger' })
    }
    onMounted(async () => {
      getRiskClassification()
      getAreaData()
      getDeptData()
      getPointList()
      getStallPageList()
      riskLedgerDetails()
    })
    const layoutSlots = {
      'content-data': (): JSX.Element => {
        return (
          <div>
            <Tabs size='large'>
              <TabPane key='vertical' tab='基本信息'>
                <div class={style.contentBox}>
                  <GVerticalLine title='基本信息' />
                  <div class={style.riskBox}>
                    <div class={style.riskLeft}>
                      <div class={style.risk_item}>
                        <div>风险源编码:</div>
                        <div class={style.risk_value}>{riskLedger.value.serialNumber}</div>
                      </div>
                      <div class={style.risk_item}>
                        <div>风险源分类:</div>
                        <div class={style.risk_value}>{riskLedger.value.typeName}</div>
                      </div>
                      <div class={style.risk_item}>
                        <div>关联档位:</div>
                        <div class={style.risk_value}>{riskLedger.value.stallName}</div>
                      </div>
                      <div class={style.risk_item}>
                        <div>详细地址:</div>
                        <div class={style.risk_value}>{riskLedger.value.attribute}</div>
                      </div>
                      <div class={style.risk_item}>
                        <div>维护部门:</div>
                        <div class={style.risk_value}>{riskLedger.value.maintenanceDepName}</div>
                      </div>
                      <div class={style.risk_item}>
                        <div>使用人:</div>
                        <div class={style.risk_value}>{riskLedger.value.receiveUserName}</div>
                      </div>
                      <div class={style.risk_item}>
                        <div>使用到期日期:</div>
                        <div class={style.risk_value}>{riskLedger.value.usageDate ? dayjs(riskLedger.value.usageDate).format('YYYY-MM-DD') : '--'}</div>
                      </div>
                      <div class={style.risk_item}>
                        <div>强检日期:</div>
                        <div class={style.risk_value}>{riskLedger.value.mandatoryTestingDate ? dayjs(riskLedger.value.mandatoryTestingDate).format('YYYY-MM-DD') : '--'}</div>
                      </div>
                      <div class={style.risk_item}>
                        <div>维护人:</div>
                        <div class={style.risk_value}>{riskLedger.value.maintenanceUserName || '--'}</div>
                      </div>
                    </div>
                    <div class={style.riskRight}>
                      <div class={style.risk_item}>
                        <div>风险源名称:</div>
                        <div class={style.risk_value}>{riskLedger.value.name}</div>
                      </div>
                      <div class={style.risk_item}>
                        <div>所在区域:</div>
                        <div class={style.risk_value}>{riskLedger.value.areaName}</div>
                      </div>
                      <div class={style.risk_item}>
                        <div>模型编码:</div>
                        <div class={style.risk_value}>{riskLedger.value.bimCode}</div>
                      </div>
                      <div class={style.risk_item}>
                        <div>关联现场点:</div>
                        <div class={style.risk_value}>{riskLedger.value.sitePointName}</div>
                      </div>
                      <div class={style.risk_item}>
                        <div>使用部门:</div>
                        <div class={style.risk_value}>{riskLedger.value.receiveDepName}</div>
                      </div>
                      <div class={style.risk_item}>
                        <div>联系方式:</div>
                        <div class={style.risk_value}>{riskLedger.value.receiveUserPhone}</div>
                      </div>
                      <div class={style.risk_item}>
                        <div>附件:</div>
                        <div class={style.risk_value} style='display:flex;align-items: center;'>
                          {
                            riskLedger.value.files.map(e => {
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
                      <div class={style.risk_item}>
                        <div>风险源位置:</div>
                        <div class={style.risk_value}>{riskLedger.value.latAndLon}</div>
                      </div>
                      <div class={style.risk_item}>
                        <div>是否购买保险:</div>
                        <div class={style.risk_value}>{riskLedger.value.insurance ? (riskLedger.value.insurance === '1' ? '是' : '否') : '--'}</div>
                      </div>
                    </div>
                    <div class={style.riskManufacturer}>
                      <div class={style.risk_item}>
                        <div>生产厂家:</div>
                        <div class={style.risk_value}>{riskLedger.value.produceFactory}</div>
                      </div>
                      <div class={style.risk_item}>
                        <div>配送公司:</div>
                        <div class={style.risk_value}>{riskLedger.value.deliveryCompany}</div>
                      </div>
                      <div class={style.risk_item}>
                        <div>生产厂家地址:</div>
                        <div class={style.risk_value}>{riskLedger.value.produceAddress}</div>
                      </div>
                      <div class={style.risk_item}>
                        <div>配送公司地址:</div>
                        <div class={style.risk_value}>{riskLedger.value.deliveryAddress}</div>
                      </div>
                      <div class={style.risk_item}>
                        <div>使用人类型:</div>
                        <div class={style.risk_value}>{(riskLedger.value.receiveUserType && riskLedger.value.receiveUserType === 'MERCHANT' ? '商户' : '市场人员')}</div>
                      </div>
                      <div class={style.risk_item}>
                        <div>购买日期:</div>
                        <div class={style.risk_value}>{riskLedger.value.purchasingDate ? dayjs(riskLedger.value.purchasingDate).format('YYYY-MM-DD') : '--'}</div>
                      </div>
                      <div class={style.risk_item}>
                        <div>功率:</div>
                        <div class={style.risk_value}>{riskLedger.value.efficiency}</div>
                      </div>
                      <div class={style.risk_item}>
                        <div>车牌号:</div>
                        <div class={style.risk_value}>{riskLedger.value.plateNumber}</div>
                      </div>

                    </div>
                  </div>
                </div>
              </TabPane>
              <TabPane key='config' tab='配件信息'>
                <div class={style.contentBox}>
                  <div class={style.between}>
                    <GVerticalLine title='配件信息' />
                  </div>
                  <Table class={style.mt20} columns={columns} dataSource={riskLedger.value.partsDetails} />
                </div>
              </TabPane>
            </Tabs>
          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Button onClick={backPage}>返回</Button>
          </>
        )
      }
    }
    return (): JSX.Element => (
      <div>
        <GLayout title='风险源台账-详情' v-slots={layoutSlots} showSearch={false} />
      </div>
    )
  }
})
