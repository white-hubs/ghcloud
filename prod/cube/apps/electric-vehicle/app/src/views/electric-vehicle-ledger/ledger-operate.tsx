import { defineComponent, onMounted, reactive, ref, type VNode } from 'vue'
import { CubeLayout } from '@ghcloud/cube-app-design'
import { cubeMdataService, cubeOuaaService, cubePropertyService } from '@/api/service'
import { Button, Cascader, Form, FormItem, Input, message, Select, SelectOption, type FormExpose } from '@ghcloud/cube-ui'
import { VerticalLine } from '@ghcloud/cube-app-design/src/base-components/vertical-line/vertical-line'
import style from './index.module.less'
import { useRoute, useRouter } from 'vue-router'
import { FileUpload } from '@ghcloud/generic-component'
import type { AreaTree, StallPage } from '@ghcloud/cube-mdata-service'
import type { DeptList, PersonItem } from '@ghcloud/cube-ouaa-service'
import type { RootObject } from '@ghcloud/cube-risk-management-service'
import { cubeMaintainService } from '@ghcloud/cube-app-design/src/api/service'
import type { FileTypes, LegerType } from './type'

export const LedgerOperate = defineComponent({
  setup: () => {
    const formRef = ref<FormExpose>()
    const uploadRef = ref()
    const route = useRoute()
    const pointData = ref<RootObject[]>([])
    const fileList = ref<FileTypes[]>([])
    const router = useRouter()
    const areaOptions = ref<AreaTree[]>([])
    const riskType = ref([{
      label: '电动单车',
      value: 'BICYCLE'
    },
    {
      label: '电动三轮车',
      value: 'TRICYCLE'
    },
    {
      label: '电动四轮车',
      value: 'FOUR_WHEELED'
    }])
    const stallPageData = ref<StallPage[]>([])
    const userList = ref<PersonItem[]>([])
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
    const subLoading = ref(false)
    const formState = reactive<LegerType>({
      electronMobileColour: undefined,
      brand: undefined,
      serialNumber: undefined,
      plateNumber: undefined,
      receiveUserType: undefined,
      electronMobileType: undefined,
      stallId: undefined,
      attribute: undefined,
      maintenanceDepId: undefined,
      maintenanceUserId: undefined,
      receiveUserName: undefined,
      name: undefined,
      areaId: [],
      sitePointId: undefined,
      receiveDepId: undefined,
      receiveUserPhone: undefined,
      files: undefined,
      norms: undefined,
    })
    // 回显
    const riskLedgerDetails = async (): Promise<void> => {
      const res = await cubePropertyService.riskSourceLedgerDetails((route.query as { id: string; }).id)
      fileList.value = res.files as unknown as FileTypes[]
      Object.assign(formState, res)
      formState.areaId = res.areaId ? res.areaId.split(',') : []
      formState.electronMobileType = res.electronMobileType
    }
    // 附件
    const uploadEnd = (data: FileTypes[]): void => {
      fileList.value.push(...data)
    }
    const getPointList = async (): Promise<void> => {
      const res = await cubeMaintainService.inspectPointList({ pageNumber: 1, pageSize: 1000 })
      pointData.value = res.records
    }
    const getUserData = async (): Promise<void> => {
      const res = await cubeOuaaService.getStaffPage({
        pageSize: 999,
        pageNumber: 1,
      })
      userList.value = res.records
    }
    const backPage = (): void => {
      router.push({ path: '/electric-vehicle-ledger' })
    }
    const rules = {
      serialNumber: { required: true, message: '请输入编码' },
      electronMobileType: { required: true, message: '请选择分类' },
      name: { required: true, message: '请输入名称' },
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
        electronMobileType: formState.electronMobileType,
        areaId: formState.areaId ? formState.areaId.join(',') : '',
        typeCode: 'ELECTRO_MOBILE',
        typeName: '电动车',

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
    const slots = {
      'layout-content': (): VNode => {
        return (
          <div>
            <div class={style.contentBox}>
              <VerticalLine title='基本信息' />
              <Form ref={formRef} rules={rules} labelCol={{ style: { width: '100px', textAlign: 'left' } }} layout='inline' model={formState}>
                <div class={style.formBox}>
                  <div>
                    <FormItem label='编码' name='serialNumber'>
                      <Input placeholder='请输入编码' style={{ width: '400px' }} v-model:value={formState.serialNumber} />
                    </FormItem>
                    <FormItem class={style.mt20} label='分类' name='electronMobileType'>
                      <Select
                        style={{ width: '400px' }}
                        v-model:value={formState.electronMobileType}
                        options={riskType.value} placeholder='请选择分类'
                      >{
                          riskType.value.map((item: { value: string;label: string; }) => {
                            return <SelectOption value={item.value} label={item.label} key={item.label}>{item.label}</SelectOption>
                          })
                        }
                      </Select>
                    </FormItem>
                    <FormItem class={style.mt20} label='品牌'>
                      <Input
                        v-model:value={formState.brand}
                        placeholder='请输入品牌'
                        optionFilterProp='label'
                        allowClear style={{ width: '400px' }}
                      />
                    </FormItem>
                    <FormItem class={style.mt20} label='颜色'>
                      <Input
                        showCount={false}
                        v-model:value={formState.electronMobileColour}
                        type='color'
                        allowClear style={{ width: '400px' }}
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
                  </div>
                  <div style={{ width: '520px' }}>
                    <FormItem label='名称' name='name'>
                      <Input placeholder='请输入名称' style={{ width: '400px' }} v-model:value={formState.name} />
                    </FormItem>
                    <FormItem class={style.mt20} label='规格型号' style={{ width: '520px' }}>
                      <Input style={{ width: '400px' }} placeholder='请输入规格型号' v-model:value={formState.norms} />
                    </FormItem>
                    <FormItem class={style.mt20} label='车牌号' name='plateNumber'>
                      <Input placeholder='请输入车牌号' style={{ width: '400px' }} v-model:value={formState.plateNumber} />
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
                    <FormItem class={style.mt20} label='联系方式'>
                      <Input style={{ width: '400px' }} placeholder='请输入联系方式' v-model:value={formState.receiveUserPhone} />
                    </FormItem>
                    <FormItem class={style.mt20} label='附件'>
                      <FileUpload
                        ref={uploadRef}
                        value={formState.files}
                        type='picture-card'
                        onEnd={uploadEnd}
                        maxNum={3}
                        maxCount={3}
                        customText='  '
                      />
                    </FormItem>
                  </div>
                </div>
              </Form>
            </div>

          </div>
        )
      },
      'footer-page': (): VNode=> {
        return (
          <>
            <Button onClick={backPage}>返回</Button>
            <Button class={style.ml10} loading={subLoading.value} type='primary' onClick={submit}>提交</Button>
          </>
        )
      },
    }
    const getAreaData = async (): Promise<void> => {
      const res = await cubeMdataService.getAreaTree()
      areaOptions.value = res
    }
    const getDeptData = async (): Promise<void> => {
      deptList.value = await cubeOuaaService.getDeptList()
    }
    const flowRequest = async (): Promise<StallPage[]> => {
      return new Promise(async (resolve) => {
        const param = {
          pageSize: 1000,
          pageNumber: 1
        }
        const deviceList: StallPage[] = []
        const res = await cubeMdataService.stallPage(param)
        deviceList.push(...res.records)
        if (res.total > param.pageSize) {
          const total = Math.ceil(res.total / param.pageSize)
          for (let i = 2; i <= total; i++) {
            const res = await cubeMdataService.stallPage({
              pageSize: 1000,
              pageNumber: i
            })
            deviceList.push(...res.records)
            if (i === total) {
              resolve(deviceList)
            }
          }
        } else {
          resolve(deviceList)
        }
      })
    }
    onMounted(async () => {
      getAreaData()
      getDeptData()
      getPointList()
      getUserData()
      stallPageData.value = await flowRequest()
      if ((route.query as { type: string; }).type === 'edit') {
        await riskLedgerDetails()
      }
    })
    return (): VNode=> (
      <CubeLayout title={route.query.type === 'edit' ? '台账编辑' : '台账新增'} v-slots={slots} />
    )
  }
})
