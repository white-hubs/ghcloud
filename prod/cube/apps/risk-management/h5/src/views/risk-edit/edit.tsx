import { defineComponent, onMounted, reactive, ref, type VNode } from 'vue'
import styles from './edit.module.less'
import { useMetaTitle } from '../hooks/use-meta-title-hook'
import { useRoute, useRouter } from 'vue-router'
import { Button, Form, CellGroup, Field, Popup, Picker, DatePicker, Cascader, showNotify, Loading } from 'vant'
import { cubeOuaaService, cubeMdataService, cubeMaintainService, cubeTypeService, cubePropertyService } from '@/api/server'
import type { DeptList } from '@ghcloud/cube-ouaa-service'
import { timeFormat } from '@/utils'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
type Columns = Record<string, string>
interface FormData {
  name: string;
  code: string;
  value: string ;
  key?: string;
  readonly?: boolean;
  type?: string;
  required?: boolean;
  showPicker?: boolean;
  columns?: Columns[];
  files?: { path: string; }[];
}
export const RiskEdit = defineComponent({
  setup () {
    useMetaTitle()
    const route = useRoute()
    const router = useRouter()
    const formRef = ref()
    const popUpData = reactive({
      typeCode: '',
      stallId: '',
      areaId: '',
      sitePointId: '',
      maintenanceDepId: '',
      maintenanceUserId: '',
      receiveDepId: '',
      insurance: '',
      receiveUserType: ''
    })
    const basicData = ref<FormData[]>()
    const configData = ref<FormData[]>()
    const otherData = ref<FormData[]>()
    const detail = ref()
    const loading = ref(false)
    const iosInputHandle = (): void => {
      // 判断是否是ios
      const ua = navigator.userAgent
      if (ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
        let flag = false
        let pageBackNormFunc: string | number | NodeJS.Timeout | null | undefined = null
        document.body.addEventListener('focusin', () => {
          // 软键盘弹起事件
          flag = true
          pageBackNormFunc && clearTimeout(pageBackNormFunc)
        })
        document.body.addEventListener('focusout', () => {
          // 软键盘关闭事件
          if (flag) {
            pageBackNormFunc = setTimeout(function () {
              // 当键盘收起的时候让页面回到原始位置
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
            }, 200)
          }
          flag = false
        })
      }
    }
    onMounted(async () => {
      iosInputHandle()
      getDetail()
    })
    const getDetail = async (): Promise<void> => {
      try {
        loading.value = true
        detail.value = await cubePropertyService.riskSourceLedgerDetails(route.query.id as string)
        const stall = await flowRequest()
        const receiveUserTypeList = new Map([
          ['MERCHANT', '商户'],
          ['MARKET', '市场']
        ])
        basicData.value = [
          { name: '风险源编码', code: 'serialNumber', value: detail.value?.serialNumber ?? '', showPicker: false, columns: [], required: true },
          { name: '风险源名称', code: 'name', value: detail.value?.name ?? '', showPicker: false, columns: [], required: true },
          { name: '风险源分类', code: 'typeName', value: detail.value?.typeName ?? '', key: detail.value?.typeCode ?? '', showPicker: false, columns: [], readonly: true, required: true },
          { name: '模型编码', code: 'bimCode', value: detail.value?.bimCode ?? '', showPicker: false, columns: [] },
          { name: '关联档位', code: 'stallName', value: detail.value?.stallName ?? '', key: detail.value?.stallId ?? '', showPicker: false, columns: stall as Columns[], readonly: true, type: 'picker' },
          { name: '所在区域', code: 'areaName', value: detail.value?.areaName ?? '', key: detail.value?.areaId ?? '', showPicker: false, columns: [], readonly: true },
          { name: '详细位置', code: 'attribute', value: detail.value?.attribute ?? '', showPicker: false, columns: [] },
          { name: '关联现场点', code: 'sitePointName', value: detail.value?.sitePointName ?? '', key: detail.value?.sitePointId ?? '', showPicker: false, columns: [], readonly: true, type: 'picker' },
          { name: '维护部门', code: 'maintenanceDepName', value: detail.value?.maintenanceDepName ?? '', key: detail.value?.maintenanceDepId ?? '', showPicker: false, columns: [], readonly: true, type: 'picker' },
          { name: '维护人', code: 'maintenanceUserName', value: detail.value?.maintenanceUserName ?? '', key: detail.value?.maintenanceUserId ?? '', showPicker: false, columns: [], readonly: true, type: 'picker' },
          { name: '规格型号', code: 'norms', value: detail.value?.norms ?? '', showPicker: false, columns: [] },
          { name: '使用部门', code: 'receiveDepName', value: detail.value?.receiveDepName ?? '', key: detail.value?.receiveDepId ?? '', showPicker: false, columns: [], readonly: true, type: 'picker' },
          { name: '使用人', code: 'receiveUserName', value: detail.value?.receiveUserName ?? '', showPicker: false, columns: [] },
          { name: '使用人类型', code: 'receiveUserType', value: receiveUserTypeList.get(detail.value?.receiveUserType) ?? '', key: detail.value?.receiveUserType ?? '', showPicker: false, columns: [{ name: '商户', id: 'MERCHANT' }, { name: '市场', id: 'MARKET' }], readonly: true, type: 'picker' },
          { name: '联系方式', code: 'receiveUserPhone', value: detail.value?.receiveUserPhone ?? '', showPicker: false, columns: [] },
          { name: '使用到期日期', code: 'usageDate', value: timeFormat(detail.value?.usageDate) ?? '', showPicker: false, columns: [], readonly: true },
          { name: '购买日期', code: 'purchasingDate', value: timeFormat(detail.value?.purchasingDate) ?? '', showPicker: false, columns: [], readonly: true },
          { name: '强检日期', code: 'mandatoryTestingDate', value: timeFormat(detail.value?.mandatoryTestingDate) ?? '', showPicker: false, columns: [], readonly: true },
        ]
        configData.value = [
          { name: '生产厂家', code: 'produceFactory', value: detail.value?.produceFactory ?? '' },
          { name: '生产厂家地址', code: 'produceAddress', value: detail.value?.produceAddress ?? '' },
          { name: '配送公司', code: 'deliveryCompany', value: detail.value?.deliveryCompany ?? '' },
          { name: '配送公司地址', code: 'deliveryAddress', value: detail.value?.deliveryAddress ?? '' },
        ]
        otherData.value = [
          { name: '功率', code: 'efficiency', value: detail.value?.efficiency ?? '' },
          { name: '车牌号', code: 'plateNumber', value: detail.value?.plateNumber ?? '' },
          { name: '是否购买保险', code: 'insurance', value: detail.value?.insurance ? (detail.value?.insurance === '1' ? '是' : '否') : '', key: detail.value?.insurance, columns: [{ name: '是', id: '1' }, { name: '否', id: '0' }], readonly: true, type: 'picker' },
        ]
        popUpData.typeCode = basicData.value?.find(x => x.code === 'typeName')?.key ?? ''
        popUpData.stallId = basicData.value?.find(x => x.code === 'stallName')?.key ?? ''
        popUpData.areaId = basicData.value?.find(x => x.code === 'areaName')?.key ?? ''
        popUpData.sitePointId = basicData.value?.find(x => x.code === 'sitePointName')?.key ?? ''
        popUpData.maintenanceDepId = basicData.value?.find(x => x.code === 'maintenanceDepName')?.key ?? ''
        popUpData.maintenanceUserId = basicData.value?.find(x => x.code === 'maintenanceUserName')?.key ?? ''
        popUpData.receiveDepId = basicData.value?.find(x => x.code === 'receiveDepName')?.key ?? ''
        popUpData.receiveUserType = basicData.value?.find(x => x.code === 'receiveUserType')?.key ?? ''
        popUpData.insurance = otherData.value?.find(x => x.code === 'insurance')?.key ?? ''
        getAreaData()
        getPointList()
        getUserData()
        getDeptData()
        getRiskClassification()
        loading.value = false
      } catch {
        loading.value = false
      }
    }
    // 风险源分类
    const getRiskClassification = async (): Promise<void> => {
      const formatData = (data: Columns[] | string): Columns[] | string => {
        if (data instanceof Array) {
          data.forEach(item => {
            if (item.nextList) {
              if (item.nextList.length === 0) {
                delete item.nextList
              } else {
                formatData(item.nextList)
              }
            }
          })
        }
        return data
      }
      const res = await cubeTypeService.getType({ itemCode: 'risk-source-type' })
      basicData.value?.forEach(x => {
        if (x.code === 'typeName') {
          x.columns = formatData(res.data) as Columns[]
        }
      })
    }
    // 获取部门
    const getDeptData = async (): Promise<void> => {
      const res = await cubeOuaaService.getStaffPage({
        pageSize: 999,
        pageNumber: 1,
      })
      basicData.value?.forEach(x => {
        if (x.code === 'maintenanceUserName') {
          x.columns = res.records as unknown as Columns[]
        }
      })
    }
    // 获取部门
    const getUserData = async (): Promise<void> => {
      const data = await cubeOuaaService.getDeptList()
      const formatData = (data: Columns[] | string | DeptList[]): Columns[] | string | DeptList[] => {
        if (data instanceof Array) {
          data.forEach(item => {
            if (item.children) {
              if (item.children.length === 0) {
                delete item.children
              } else {
                formatData(item.children)
              }
            }
          })
        }
        return data
      }
      basicData.value?.forEach(x => {
        if (x.code === 'maintenanceDepName' || x.code === 'receiveDepName') {
          x.columns = formatData(data) as Columns[]
        }
      })
    }
    // 获取区域
    const getAreaData = async (): Promise<void> => {
      const formatData = (data: Columns[] | string): Columns[] | string => {
        if (data instanceof Array) {
          data.forEach(item => {
            if (item.children) {
              if (item.children.length === 0) {
                delete item.children
              } else {
                formatData(item.children)
              }
            }
          })
        }
        return data
      }
      const data = await cubeMdataService.getAreaTree()
      basicData.value?.forEach(x => {
        if (x.code === 'areaName') {
          x.columns = formatData(data as unknown as Columns[]) as Columns[]
        }
      })
    }
    // 获取现场点
    const getPointList = async (): Promise<void> => {
      const res = await cubeMaintainService.inspectPointList({ pageNumber: 1, pageSize: 1000 })
      basicData.value?.forEach(x => {
        if (x.code === 'sitePointName') {
          x.columns = res.records as unknown as Columns[]
        }
      })
    }
    // 获取关联档位
    const flowRequest = async (): Promise<unknown> => {
      return new Promise(async (resolve) => {
        const param = {
          pageSize: 1000,
          pageNumber: 1
        }
        const deviceList = []
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
    // 级联选择
    const cascaderFinish = (item: FormData, selectedOptions: { name: string; code: string; id: string; }[]): void => {
      if (item.code === 'typeName') {
        popUpData.typeCode = selectedOptions[selectedOptions.length - 1].code ?? ''
      }
      if (item.code === 'areaName') {
        popUpData.areaId = selectedOptions.map((option: { id: string; }) => option.id).join(',')
      }
      item.value = selectedOptions.map((option: { name: string; }) => option.name).join('/')
      item.showPicker = false
    }
    // 下拉选择
    const pickerConfirm = (item: FormData, selectedOptions: { name: string; code: string; id: string; }[]): void => {
      switch (item.code) {
        case 'sitePointName':
          popUpData.sitePointId = selectedOptions[0].id
          break
        case 'stallName':
          popUpData.stallId = selectedOptions[0].id
          break
        case 'maintenanceDepName':
          popUpData.maintenanceDepId = selectedOptions[0].id
          break
        case 'maintenanceUserName':
          popUpData.maintenanceUserId = selectedOptions[0].id
          break
        case 'receiveDepName':
          popUpData.receiveDepId = selectedOptions[0].id
          break
        case 'insurance':
          popUpData.insurance = selectedOptions[0].id
          break
        case 'receiveUserType':
          popUpData.receiveUserType = selectedOptions[0].id
          break
      }
      item.value = selectedOptions[0].name
      item.showPicker = false
    }
    const validatorRequire = async (value: string, name: string, code: string): Promise<string> => {
      if (!['serialNumber', 'name', 'typeName'].includes(code)) return ''
      if (value.trim() === '') return `请输入${name}`
      return ''
    }
    const submit = async (): Promise<void> => {
      try {
        await formRef.value.validate()
        const formData = {
          id: route.query.id as string ?? '',
          maintenanceDepName: basicData.value?.find(x => x.code === 'maintenanceDepName')?.value ?? '',
          maintenanceUserName: basicData.value?.find(x => x.code === 'maintenanceUserName')?.value ?? '',
          receiveDepName: basicData.value?.find(x => x.code === 'receiveDepName')?.value ?? '',
          typeName: basicData.value?.find(x => x.code === 'typeName')?.value ?? '',
          stallName: basicData.value?.find(x => x.code === 'stallName')?.value ?? '',
          sitePointName: basicData.value?.find(x => x.code === 'sitePointName')?.value ?? '',
          serialNumber: basicData.value?.find(x => x.code === 'serialNumber')?.value ?? '',
          name: basicData.value?.find(x => x.code === 'name')?.value ?? '',
          bimCode: basicData.value?.find(x => x.code === 'bimCode')?.value ?? '',
          attribute: basicData.value?.find(x => x.code === 'attribute')?.value ?? '',
          norms: basicData.value?.find(x => x.code === 'norms')?.value ?? 0,
          receiveUserName: basicData.value?.find(x => x.code === 'receiveUserName')?.value ?? '',
          receiveUserPhone: basicData.value?.find(x => x.code === 'receiveUserPhone')?.value ?? '',
          usageDate: basicData.value?.find(x => x.code === 'usageDate')?.value ?? '',
          purchasingDate: basicData.value?.find(x => x.code === 'purchasingDate')?.value ?? '',
          mandatoryTestingDate: basicData.value?.find(x => x.code === 'mandatoryTestingDate')?.value ?? '',
          produceFactory: configData.value?.find(x => x.code === 'produceFactory')?.value ?? '',
          produceAddress: configData.value?.find(x => x.code === 'produceAddress')?.value ?? '',
          deliveryCompany: configData.value?.find(x => x.code === 'deliveryCompany')?.value ?? '',
          deliveryAddress: configData.value?.find(x => x.code === 'deliveryAddress')?.value ?? '',
          efficiency: otherData.value?.find(x => x.code === 'efficiency')?.value ?? '',
          plateNumber: otherData.value?.find(x => x.code === 'plateNumber')?.value ?? '',
          insurance: popUpData.insurance,
          typeCode: popUpData.typeCode,
          stallId: popUpData.stallId,
          areaId: popUpData.areaId,
          sitePointId: popUpData.sitePointId,
          receiveDepId: popUpData.receiveDepId,
          receiveUserType: popUpData.receiveUserType,
          maintenanceDepId: popUpData.maintenanceDepId,
          maintenanceUserId: popUpData.maintenanceUserId,
          files: detail.value.files.map((x: { id: string; }) => x.id).join(','),
          partsDetails: detail.value.partsDetails
        }
        cubePropertyService.ledgerUpdate(formData).then(() => {
          showNotify({ type: 'success', message: '更新成功' })
          router.go(-1)
        }).catch(((e) => {
          showNotify({ type: 'danger', message: e.errorMessage })
        }))
      } catch {
      }
    }
    const formDom = (): VNode =>
      <Form style={{ height: '92vh', overflow: 'auto' }} ref={formRef}>
        <div class={styles.basic}>
          <div class={styles.title}>基础信息</div>
          {basicData.value?.map(item =>
            <CellGroup inset key={item.name}>
              <Field
                placeholder={item.readonly ? '请选择' : '请输入'}
                style={{ paddingLeft: '0px' }}
                required={item.required}
                rules={[{ validator: async (value: string) => { return validatorRequire(value, item.name, item.code) } }]}
                name={item.name}
                label={item.name}
                v-model={item.value}
                readonly={item.readonly}
                onClick={() => { if (item.readonly) { item.showPicker = true } }}
              />
              <Popup v-model:show={item.showPicker} position='bottom'>
                {
                    item.type === 'picker'
                      ? <Picker
                          columns={item.columns}
                          columns-field-names={item.code === 'stallName'
                            ? {
                                text: 'name',
                                value: 'code',
                              }
                            : item.code === 'sitePointName'
                              ? {
                                  text: 'name',
                                  value: 'codeNum',
                                }
                              : ['maintenanceDepName', 'maintenanceUserName', 'receiveDepName', 'receiveUserType'].includes(item.code)
                                  ? {
                                      text: 'name',
                                      value: 'id',
                                    }
                                  : {
                                      text: 'name',
                                      value: 'code',
                                    }}
                          onConfirm={({ selectedOptions }: { selectedOptions: []; }) => { pickerConfirm(item, selectedOptions) }}
                          onCancel={() => { item.showPicker = false }}
                        />
                      : null
                  }
                {
                    ['usageDate', 'purchasingDate', 'mandatoryTestingDate'].includes(item.code)
                      ? <DatePicker
                          onConfirm={({ selectedValues }: { selectedValues: string[]; }) => { item.value = selectedValues.join('-'); item.showPicker = false }}
                          onCancel={() => { item.showPicker = false }}
                        />
                      : null
                  }
                {
                    ['areaName', 'typeName'].includes(item.code)
                      ? <Cascader
                          options={item.columns}
                          v-model={item.value}
                          onFinish={({ selectedOptions }: { selectedOptions: []; }) => { cascaderFinish(item, selectedOptions) }}
                          onClose={() => { item.showPicker = false }}
                          field-names={item.code === 'typeName'
                            ? {
                                text: 'name',
                                value: 'code',
                                children: 'nextList'
                              }
                            : {
                                text: 'name',
                                value: 'code',
                                children: 'children'
                              }}
                        />
                      : null
                  }
              </Popup>
            </CellGroup>
          )}
        </div>
        <div class={styles.basic}>
          <div class={styles.title}>产品其他信息</div>
          {otherData.value?.map(item =>
            <CellGroup inset key={item.name}>
              <Field
                placeholder='请选择'
                name={item.name}
                label={item.name}
                v-model={item.value}
                style={{ paddingLeft: '0px' }}
                readonly={item.readonly}
                onClick={() => { if (item.readonly) { item.showPicker = true } }}
              />
              <Popup v-model:show={item.showPicker} position='bottom'>
                {
                    item.type === 'picker'
                      ? <Picker
                          columns={item.columns}
                          columns-field-names={{
                            text: 'name',
                            value: 'id',
                          }}
                          onConfirm={({ selectedOptions }: { selectedOptions: []; }) => { pickerConfirm(item, selectedOptions) }}
                          onCancel={() => { item.showPicker = false }}
                        />
                      : null
                  }
              </Popup>
            </CellGroup>
          )}
        </div>
        <div class={styles.basic}>
          <div class={styles.title}>生产配置信息</div>
          {configData.value?.map(item =>
            <CellGroup inset key={item.name}>
              <Field placeholder='请输入' name={item.name} label={item.name} v-model={item.value} style={{ paddingLeft: '0px' }} />
            </CellGroup>
          )}
        </div>
      </Form>
    return (): JSX.Element =>
      <>
        <CubeNavBar title='风险源编辑' showBack />
        <div class={styles.wrapper}>
          {
          loading.value
            ? <Loading style='position: absolute;left: calc(50% - 30px);top: calc(50% - 25px);' size='24px' vertical>加载中... </Loading>
            : formDom()
        }
          <Button block type='primary' class={styles.button} native-type='submit' onClick={submit}>提交</Button>
        </div>
      </>
  }
})
