import { Tabs, TabPane, Form, FormItem, Input, Select, SelectOption, DatePicker, Cascader, type FileType, PopConfirm, Button, PopOver, type FormExpose, message } from '@ghcloud/cube-ui'
import { GLayout } from '@/components/common/layout'
import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GVerticalLine } from '@/components/common/vertical-line'
import type { DeptList, PersonItem } from '@ghcloud/cube-ouaa-service'
import { cubeOuaaService, cubeMdataService, cubeMaintainService, cubePropertyService, cubeTypeService } from '@/api/service'
import type { AreaTree, StallPage } from '@ghcloud/cube-mdata-service'
import { FileUpload, useMapModal } from '@ghcloud/generic-component'
import style from './index.module.less'
import type { RootObject } from '@ghcloud/cube-risk-management-service'
import Table from '@ghcloud/cube-ui/src/components/table/table'
import { useRouter, useRoute } from 'vue-router'
import dayjs from 'dayjs'
// import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'

interface AccessoryData {
  code: string;
  name: string;
  remarks: string;
  expireDate: string;
  modifyFlag: boolean;
}
export interface FileTypes extends FileType {
  readonly id: string;
}
export const RiskLedgerAdd = defineComponent({
  setup: () => {
    const { showMapModal } = useMapModal()
    const router = useRouter()
    const route = useRoute()
    const formState = reactive({
      serialNumber: undefined,
      insurance: undefined,
      efficiency: undefined,
      plateNumber: undefined,
      receiveUserType: undefined,
      typeName: '',
      location: '',
      latAndLon: '',
      bimCode: '',
      typeCode: [] as string[],
      stallId: undefined,
      attribute: undefined,
      maintenanceDepId: undefined,
      maintenanceUserId: undefined,
      receiveUserName: undefined,
      usageDate: '',
      purchasingDate: '',
      mandatoryTestingDate: '',
      name: undefined,
      areaId: [] as string[],
      sitePointId: undefined,
      receiveDepId: undefined,
      receiveUserPhone: undefined,
      files: undefined,
      deliveryAddress: undefined,
      deliveryCompany: undefined,
      produceAddress: undefined,
      produceFactory: undefined,
      norms: undefined,
      mainUserName: undefined
    })
    const uploadRef = ref()
    const subLoading = ref(false)
    const riskType = ref([])
    const riskTypeName = ref('')
    const formRef = ref<FormExpose>()
    const dataSource = ref<AccessoryData[]>([])
    const fileList = ref<FileTypes[]>([])
    const areaOptions = ref<AreaTree[]>([])
    const pointData = ref<RootObject[]>([])
    const stallPageData = ref<StallPage[]>([])
    const deptList = ref<DeptList[]>([])
    const userType: { name: string;id: string; }[] = [
      {
        name: '商户',
        id: 'MERCHANT'
      },
      {
        name: '市场人员',
        id: 'MARKET'
      }
    ]
    const isPurchase: { name: string;id: string; }[] = [
      {
        name: '是',
        id: '1'
      },
      {
        name: '否',
        id: '0'
      }
    ]
    const userList = ref<PersonItem[]>([])
    const delRow = (index: number): void => {
      dataSource.value.splice(index, 1)
    }
    const editRow = (record: AccessoryData): void => {
      record.modifyFlag = !record.modifyFlag
    }
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
      {
        title: '操作',
        dataIndex: 'operate',
        align: 'center',
        customRender: ({ index, record }: { index: number;record: AccessoryData; }): JSX.Element => {
          return (
            <>
              <Button v-show={route.query.type === 'edit'} type='link' onClick={() => {
                editRow(record)
              }}>{record.modifyFlag ? '保存' : '编辑'}</Button>
              <PopConfirm title='确认删除该项？' onConfirm={() => {
                delRow(index)
              }}>
                <Button type='link' size='small' danger>删除</Button>
              </PopConfirm>
            </>
          )
        }
      }
    ]
    const rules = {
      serialNumber: { required: true, message: '请输入风险源编码' },
      typeCode: { required: true, message: '请选择风险源分类' },
      name: { required: true, message: '风险源名称' },
    }
    const getRiskClassification = async (): Promise<void> => {
      const res = await cubeTypeService.getType({ itemCode: 'risk-source-type' })
      riskType.value = res
    }
    const getDeptData = async (): Promise<void> => {
      deptList.value = await cubeOuaaService.getDeptList()
    }
    const getUserData = async (): Promise<void> => {
      const res = await cubeOuaaService.getStaffPage({
        pageSize: 999,
        pageNumber: 1,
      })
      userList.value = res.records
    }
    const getAreaData = async (): Promise<void> => {
      const res = await cubeMdataService.getAreaTree()
      areaOptions.value = res
    }
    const getPointList = async (): Promise<void> => {
      const res = await cubeMaintainService.inspectPointList({ pageNumber: 1, pageSize: 1000 })
      pointData.value = res.records
    }
    // 优化后的 flowRequest 函数，减少不必要的 Promise 包装
    const flowRequest = async (): Promise<StallPage[]> => {
      const param = {
        pageSize: 1000,
        pageNumber: 1
      }
      
      const deviceList: StallPage[] = []
      const firstRes = await cubeMdataService.stallPage(param)
      deviceList.push(...firstRes.records)
      
      // 如果有更多数据，批量并行请求
      if (firstRes.total > param.pageSize) {
        const totalPages = Math.ceil(firstRes.total / param.pageSize)
        const remainingRequests: Promise<any>[] = []
        
        for (let i = 2; i <= totalPages; i++) {
          remainingRequests.push(
            cubeMdataService.stallPage({
              pageSize: 1000,
              pageNumber: i
            })
          )
        }
        
        // 并行执行剩余请求
        const remainingResults = await Promise.all(remainingRequests)
        remainingResults.forEach(res => {
          deviceList.push(...res.records)
        })
      }
      
      return deviceList
    }
    // const getStallPageList = async (): Promise<void> => {
    //   const res = await cubeMdataService.stallPage({ pageNumber: 1, pageSize: 1000 })
    //   stallPageData.value = res.records
    // }
    const uploadEnd = (data: FileTypes[]): void => {
      fileList.value.push(...data)
    }
    const addAccessory = (): void => {
      dataSource.value.push({
        code: '',
        name: '',
        remarks: '',
        expireDate: '',
        modifyFlag: true
      })
    }

    const backPage = (): void => {
      router.push({ path: '/risk-ledger' })
    }
    const riskLedgerDetails = async (): Promise<void> => {
      const res = await cubePropertyService.riskSourceLedgerDetails((route.query as { id: string; }).id)
      fileList.value = res.files as unknown as FileTypes[]
      Object.assign(formState, res)
      formState.areaId = res.areaId ? res.areaId.split(',') : []
      formState.typeCode = res.typeCode ? res.typeCode.split(',') : []
      formState.usageDate = formState.usageDate ? dayjs(formState.usageDate).format('YYYY-MM-DD') : ''
      formState.mandatoryTestingDate = formState.mandatoryTestingDate ? dayjs(formState.mandatoryTestingDate).format('YYYY-MM-DD') : ''
      formState.purchasingDate = formState.purchasingDate ? dayjs(formState.purchasingDate).format('YYYY-MM-DD') : ''
      dataSource.value = res.partsDetails.map(item => {
        return { ...item, expireDate: item.expireDate ? dayjs(item.expireDate).format('YYYY-MM-DD') : '', modifyFlag: false }
      })
    }
    const getRiskType = (value: unknown, selectedOptions: { name: string; }[]): void => {
      riskTypeName.value = selectedOptions.map(e => e.name).join('/')
    }
    const submit = async (): Promise<void> => {
      const params = {
        ...formState,
        files: fileList.value.map((item: FileTypes) => item.id).join(','),
        maintenanceDepName: deptList.value.find((item: { id: string; }) => item.id === formState.maintenanceDepId)?.name,
        maintenanceUserName: userList.value.find((item: { id: string; }) => item.id === formState.maintenanceUserId)?.name,
        receiveDepName: deptList.value.find((item: { id: string; }) => item.id === formState.receiveDepId)?.name,
        sitePointName: pointData.value.find((item: { id: string; }) => item.id === formState.sitePointId)?.name,
        stallName: stallPageData.value.find((item: { id: string; }) => item.id === formState.stallId)?.name,
        typeCode: formState.typeCode ? formState.typeCode[formState.typeCode.length - 1] : '',
        areaId: formState.areaId ? formState.areaId.join(',') : '',
        typeName: riskTypeName.value || formState.typeName,
        partsDetails: dataSource.value.map(e => {
          return {
            code: e.code,
            name: e.name,
            remarks: e.remarks,
            expireDate: e.expireDate
          }
        })
      }
      formRef.value?.validate().then(async () => {
        subLoading.value = true
        if (route.query.type === 'add') {
          cubePropertyService.riskSourceLedgerInsert(params).then(() => {
            message.success('新增成功')
            backPage()
          }).catch(((e) => {
            message.error(e.errorMessage)
          }))
        } else {
          cubePropertyService.ledgerUpdate(params).then(() => {
            message.success('更新成功')
            backPage()
          }).catch(((e) => {
            message.error(e.errorMessage)
          }))
        }
        subLoading.value = false
      })
    }

    onMounted(async () => {
      try {
        // 编辑模式下获取详情数据
        if ((route.query as { type: string; }).type === 'edit') {
          await riskLedgerDetails()
        }
      } catch {
        message.error('数据加载失败，请刷新页面重试')
      }
      // 并行执行基础数据请求，提高加载速度
      const baseDataPromises = [
        getRiskClassification(),
        getAreaData(),
        getDeptData(),
        getPointList(),
        getUserData()
      ]
      
      try {
        // 先并行加载基础数据
        await Promise.all(baseDataPromises)
        stallPageData.value = await flowRequest()
      } catch {
        message.error('基础数据加载失败，请刷新页面重试')
      }
    })
    const layoutSlots = {
      'content-data': (): JSX.Element => {
        return (
          <div>
            <Tabs size='large'>
              <TabPane key='vertical' tab='基本信息'>
                <div class={style.contentBox}>
                  <GVerticalLine title='基本信息' />
                  <Form ref={formRef} rules={rules} labelCol={{ style: { width: '100px', textAlign: 'left' } }} layout='inline' model={formState}>
                    <div class={style.formBox}>
                      <div>
                        <FormItem label='风险源编码' name='serialNumber'>
                          <Input placeholder='请输入风险源编码' style={{ width: '400px' }} v-model:value={formState.serialNumber} />
                        </FormItem>
                        <FormItem class={style.mt20} label='模型编码' name='bimCode'>
                          <Input placeholder='请输入风险源编码' style={{ width: '400px' }} v-model:value={formState.bimCode} />
                        </FormItem>
                        <FormItem class={style.mt20} label='分类' name='typeCode'>
                          <Cascader
                            style={{ width: '400px' }}
                            onChange={getRiskType}
                            changeOnSelect
                            v-model:value={formState.typeCode}
                            field-names={{ label: 'name', value: 'code', children: 'nextList' }}
                            options={riskType.value} placeholder='请选择风险源分类'
                          />
                        </FormItem>
                        <FormItem class={style.mt20} label='所在区域'>
                          <Cascader
                            style={{ width: '400px' }}
                            v-model:value={formState.areaId}
                            field-names={{ label: 'name', value: 'id', children: 'children' }}
                            options={areaOptions.value} placeholder='请选择区域'
                          />
                        </FormItem>
                        <FormItem class={style.mt20} label='关联现场点'>
                          <Select
                            v-model:value={formState.sitePointId}
                            show-search
                            optionFilterProp='label'
                            placeholder='请选择现场点'
                            allowClear style={{ width: '400px' }}
                          >
                            {
                              pointData.value.map((item: { id: string;name: string; }) => {
                                return <SelectOption value={item.id} label={item.name} key={item.name}>{item.name}</SelectOption>
                              })
                            }
                          </Select>
                        </FormItem>
                        <FormItem class={style.mt20} label='维护部门'>
                          <Select
                            v-model:value={formState.maintenanceDepId}
                            show-search
                            optionFilterProp='label'
                            placeholder='请选择部门'
                            allowClear style={{ width: '400px' }}
                          >
                            {
                              deptList.value.map((item: { id: string;name: string; }) => {
                                return <SelectOption value={item.id} label={item.name} key={item.name}>{item.name}</SelectOption>
                              })
                            }
                          </Select>
                        </FormItem>
                        <FormItem class={style.mt20} label='使用部门'>
                          <Select
                            v-model:value={formState.receiveDepId}
                            show-search
                            optionFilterProp='label'
                            placeholder='请选择部门'
                            allowClear style={{ width: '400px' }}
                          >
                            {
                              deptList.value.map((item: { id: string;name: string; }) => {
                                return <SelectOption value={item.id} label={item.name} key={item.name}>{item.name}</SelectOption>
                              })
                            }
                          </Select>
                        </FormItem>
                        <FormItem class={style.mt20} label='使用人类型'>
                          <Select
                            v-model:value={formState.receiveUserType}
                            show-search
                            optionFilterProp='label'
                            placeholder='请选择使用人类型'
                            allowClear style={{ width: '400px' }}
                          >
                            {
                              userType.map((item: { id: string;name: string; }) => {
                                return <SelectOption value={item.id} label={item.name} key={item.name}>{item.name}</SelectOption>
                              })
                            }
                          </Select>
                        </FormItem>
                        <FormItem class={style.mt20} label='联系方式'>
                          <Input style={{ width: '400px' }} placeholder='请输入联系方式' v-model:value={formState.receiveUserPhone} />
                        </FormItem>
                        <FormItem class={style.mt20} label='风险源位置'>
                          <Input maxlength='50' style={{ width: '320px' }} v-model:value={formState.latAndLon} disabled />
                          <Button
                            type='primary'
                            onClick={() => {
                              const center = formState.latAndLon.split(',')
                              showMapModal({
                                title: '风险源位置',
                                address: formState.location,
                                center: {
                                  lng: Number(center[0]),
                                  lat: Number(center[1])
                                },
                                modalConfirm: (data) => {
                                  formState.latAndLon = `${data.lng},${data.lat}`
                                  formState.location = data.address
                                }
                              })
                            }}
                          >
                            获取位置
                          </Button>
                        </FormItem>
                      </div>
                      <div style={{ width: '520px' }}>
                        <FormItem label='名称' name='name'>
                          <Input placeholder='请输入风险源名称' style={{ width: '400px' }} v-model:value={formState.name} />
                        </FormItem>
                        <FormItem class={style.mt20} label='规格型号' style={{ width: '520px' }}>
                          <Input style={{ width: '400px' }} placeholder='请输入规格型号' v-model:value={formState.norms} />
                        </FormItem>
                        <FormItem class={style.mt20} label='关联档位'>
                          <Select
                            v-model:value={formState.stallId}
                            show-search
                            optionFilterProp='label'
                            placeholder='请选择关联档位'
                            allowClear style={{ width: '400px' }}
                          >
                            {
                              stallPageData.value.map((item: { id: string;name: string; }) => {
                                return <SelectOption value={item.id} label={item.name} key={item.name}>{item.name}</SelectOption>
                              })
                            }
                          </Select>
                        </FormItem>
                        <FormItem class={style.mt20} label='详细位置'>
                          <Input placeholder='请输入详细位置' style={{ width: '400px' }} v-model:value={formState.attribute} />
                        </FormItem>
                        <FormItem class={style.mt20} label='维护人'>
                          <Select
                            v-model:value={formState.maintenanceUserId}
                            show-search
                            optionFilterProp='label'
                            placeholder='请选择维护人'
                            allowClear style={{ width: '400px' }}
                          >
                            {
                              userList.value.map((item: { id: string;name: string; }) => {
                                return <SelectOption value={item.id} label={item.name} key={item.name}>{item.name}</SelectOption>
                              })
                            }
                          </Select>
                        </FormItem>
                        <FormItem class={style.mt20} label='使用人'>
                          <Input placeholder='请输入使用人' style={{ width: '400px' }} v-model:value={formState.receiveUserName} />
                        </FormItem>
                        <FormItem class={style.mt20} label='使用到期日期'>
                          <DatePicker style={{ width: '400px' }} v-model:value={formState.usageDate} />
                        </FormItem>
                        <FormItem class={style.mt20} label='购买日期'>
                          <DatePicker style={{ width: '400px' }} v-model:value={formState.purchasingDate} />
                        </FormItem>
                        <FormItem class={style.mt20} label='强检日期'>
                          <DatePicker style={{ width: '400px' }} v-model:value={formState.mandatoryTestingDate} />
                        </FormItem>
                        <FormItem class={style.mt20} label='附件'>
                          {
                            formState.files ?? route.query.type === 'add'
                              ? <FileUpload
                                ref={uploadRef}
                                value={formState.files}
                                type='picture-card'
                                onEnd={uploadEnd}
                                maxNum={3}
                                maxCount={3}
                                customText='  '
                                sceneCode={GLOBAL_SCENE_CODE.propertyRiskSource}
                              />
                              : ''
                          }
                        </FormItem>
                      </div>
                    </div>
                    <div>
                      <GVerticalLine title='产品其他信息' />
                      <div class={style.formBox}>
                        <div>
                          <FormItem label='功率' name='produceFactory'>
                            <Input placeholder='请输入功率' style={{ width: '400px' }} v-model:value={formState.efficiency} />
                          </FormItem>
                          <FormItem label='是否购买保险' class={style.mt20} name='deliveryCompany'>
                            <Select
                              v-model:value={formState.insurance}
                              show-search
                              optionFilterProp='label'
                              placeholder='请选择'
                              allowClear style={{ width: '400px' }}
                            >
                              {
                                isPurchase.map((item: { id: string;name: string; }) => {
                                  return <SelectOption value={item.id} label={item.name} key={item.name}>{item.name}</SelectOption>
                                })
                              }
                            </Select>
                          </FormItem>
                        </div>
                        <div>
                          <FormItem label='车牌号' name='plateNumber'>
                            <Input placeholder='请输入车牌号' style={{ width: '400px' }} v-model:value={formState.plateNumber} />
                          </FormItem>
                        </div>
                      </div>
                    </div>
                    <div style='margin-top: 20px;'>
                      <GVerticalLine title='生产配送信息' />
                      <div class={style.formBox}>
                        <div>
                          <FormItem label='生产厂家' name='produceFactory'>
                            <Input placeholder='请输入生产厂家' style={{ width: '400px' }} v-model:value={formState.produceFactory} />
                          </FormItem>
                          <FormItem label='配送公司' class={style.mt20} name='deliveryCompany'>
                            <Input placeholder='请输入配送公司' style={{ width: '400px' }} v-model:value={formState.deliveryCompany} />
                          </FormItem>
                        </div>
                        <div>
                          <FormItem label='生产厂家地址' name='produceAddress'>
                            <Input placeholder='请输入厂家地址' style={{ width: '400px' }} v-model:value={formState.produceAddress} />
                          </FormItem>
                          <FormItem label='配送公司地址' class={style.mt20} name='deliveryAddress'>
                            <Input placeholder='请输入配送公司地址' style={{ width: '400px' }} v-model:value={formState.deliveryAddress} />
                          </FormItem>
                        </div>
                      </div>
                    </div>
                  </Form>
                </div>
              </TabPane>
              <TabPane key='config' tab='配件信息'>
                <div class={style.contentBox}>
                  <div class={style.between}>
                    <GVerticalLine title='配件信息' />
                    <Button type='primary' onClick={addAccessory}>添加配件</Button>
                  </div>
                  <Table class={style.mt20} columns={columns} dataSource={dataSource.value} />
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
            <Button class={style.ml10} loading={subLoading.value} type='primary' onClick={submit}>提交</Button>
          </>
        )
      }
    }
    return (): JSX.Element => (
      <GLayout title={'风险源台账-' + (route.query.type === 'add' ? '新增' : '编辑')} v-slots={layoutSlots} showSearch={false} />
    )
  }
})
