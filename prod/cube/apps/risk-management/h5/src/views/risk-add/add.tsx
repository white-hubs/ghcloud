import { defineComponent, onMounted, reactive, ref } from 'vue'
import styles from '../risk-edit/edit.module.less'
import { useMetaTitle } from '../hooks/use-meta-title-hook'
import { useRouter } from 'vue-router'
import { Button, Form, CellGroup, Field, Popup, Picker, DatePicker, Cascader, showNotify } from 'vant'
import { cubeOuaaService, cubeMdataService, cubeMaintainService, cubeTypeService, cubePropertyService } from '@/api/server'
import type { DeptList } from '@ghcloud/cube-ouaa-service'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
type Columns = Record<string, string>
export const RiskAdd = defineComponent({
  setup () {
    useMetaTitle()
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
    const basicData = ref<{ name: string; value: string ;key?: string;showPicker?: boolean; columns?: Columns[];files?: { path: string; }[]; }[]>(

    )
    const configData = ref<{ name: string; value: string; files?: { path: string; }[]; }[]>()
    const otherData = ref<{ name: string; value: string;showPicker?: boolean;columns?: Columns[]; }[]>()
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
      getTaskDetail()
      getRiskClassification()
      getDeptData()
      getUserData()
      getAreaData()
      getPointList()
      const stall = await flowRequest()
      basicData.value?.forEach(x => {
        if (x.name === '关联档位') {
          x.columns = stall as Columns[]
        }
        if (x.name === '使用人类型') {
          x.columns = [{ name: '商户', id: 'MERCHANT' }, { name: '市场', id: 'MARKET' }]
        }
      })
      otherData.value?.forEach(x => {
        if (x.name === '是否购买保险') {
          x.columns = [{ name: '是', id: '1' }, { name: '否', id: '0' }]
        }
      })
    })

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
        if (x.name === '风险源分类') {
          x.columns = formatData(res) as Columns[]
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
        if (x.name === '维护人') {
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
        if (x.name === '维护部门' || x.name === '使用部门') {
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
        if (x.name === '所在区域') {
          x.columns = formatData(data as unknown as Columns[]) as Columns[]
        }
      })
    }
    // 获取现场点
    const getPointList = async (): Promise<void> => {
      const res = await cubeMaintainService.inspectPointList({ pageNumber: 1, pageSize: 1000 })
      basicData.value?.forEach(x => {
        if (x.name === '关联现场点') {
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
    const getTaskDetail = async (): Promise<void> => {
      basicData.value = [
        {
          name: '风险源编码',
          value: '',
        },
        {
          name: '风险源名称',
          value: ''
        },
        {
          name: '风险源分类',
          value: '',
          key: ''
        },
        {
          name: '模型编码',
          value: ''
        },
        {
          name: '关联档位',
          value: '',
          key: ''
        },
        {
          name: '所在区域',
          value: '',
          key: ''
        },
        {
          name: '详细位置',
          value: ''
        },
        {
          name: '关联现场点',
          value: '',
          key: ''
        },
        {
          name: '维护部门',
          value: '',
          key: ''
        },
        {
          name: '维护人',
          value: '',
          key: ''
        },
        {
          name: '规格型号',
          value: ''
        },
        {
          name: '使用部门',
          value: '',
          key: ''
        },
        {
          name: '使用人',
          value: ''
        },
        {
          name: '使用人类型',
          value: '',
          key: ''
        },
        {
          name: '联系方式',
          value: ''
        },
        {
          name: '使用到期日期',
          value: ''
        },
        {
          name: '购买日期',
          value: ''
        },
        {
          name: '强检日期',
          value: ''
        },
      ]
      basicData.value?.forEach(x => {
        x.showPicker = false
        x.columns = []
      })
      configData.value = [
        {
          name: '生产厂家',
          value: ''
        },
        {
          name: '生产厂家地址',
          value: ''
        },
        {
          name: '配送公司',
          value: ''
        },
        {
          name: '配送公司地址',
          value: ''
        }
      ]
      otherData.value = [
        {
          name: '功率',
          value: ''
        },
        {
          name: '车牌号',
          value: ''
        },
        {
          name: '是否购买保险',
          value: '',
        }
      ]
      otherData.value?.forEach(x => {
        if (x.value === '')x.value = ''
      })
      popUpData.typeCode = basicData.value?.find(x => x.name === '风险源分类')?.key ?? ''
      popUpData.stallId = basicData.value?.find(x => x.name === '关联档位')?.key ?? ''
      popUpData.areaId = basicData.value?.find(x => x.name === '所在区域')?.key ?? ''
      popUpData.sitePointId = basicData.value?.find(x => x.name === '关联现场点')?.key ?? ''
      popUpData.maintenanceDepId = basicData.value?.find(x => x.name === '维护部门')?.key ?? ''
      popUpData.maintenanceUserId = basicData.value?.find(x => x.name === '维护人')?.key ?? ''
      popUpData.receiveDepId = basicData.value?.find(x => x.name === '使用部门')?.key ?? ''
      popUpData.receiveUserType = basicData.value?.find(x => x.name === '使用人类型')?.key ?? ''
    }
    // 级联选择
    const cascaderFinish = (item: { value: string ;showPicker?: boolean;name: string; }, selectedOptions: { name: string; code: string; id: string; }[]): void => {
      if (item.name === '风险源分类') {
        popUpData.typeCode = selectedOptions[selectedOptions.length - 1].code ?? ''
      }
      if (item.name === '所在区域') {
        popUpData.areaId = selectedOptions.map((option: { id: string; }) => option.id).join(',')
      }
      item.value = selectedOptions.map((option: { name: string; }) => option.name).join('/')
      item.showPicker = false
    }
    // 下拉选择
    const pickerConfirm = (item: { value: string ;showPicker?: boolean;name: string; }, selectedOptions: { name: string; code: string; id: string; }[]): void => {
      switch (item.name) {
        case '关联现场点':
          popUpData.sitePointId = selectedOptions[0].id
          break
        case '关联档位':
          popUpData.stallId = selectedOptions[0].id
          break
        case '维护部门':
          popUpData.maintenanceDepId = selectedOptions[0].id
          break
        case '维护人':
          popUpData.maintenanceUserId = selectedOptions[0].id
          break
        case '使用部门':
          popUpData.receiveDepId = selectedOptions[0].id
          break
        case '是否购买保险':
          popUpData.insurance = selectedOptions[0].id
          break
        case '使用人类型':
          popUpData.receiveUserType = selectedOptions[0].id
          break
      }
      item.value = selectedOptions[0].name
      item.showPicker = false
    }
    const validatorRequire = async (value: string, name: string): Promise<string> => {
      if (!['风险源编码', '风险源名称', '风险源分类'].includes(name)) return ''
      if (value.trim() === '') return `请输入${name}`
      return ''
    }
    const submit = async (): Promise<void> => {
      try {
        await formRef.value.validate()
        const formData = {
          maintenanceDepName: basicData.value?.find(x => x.name === '维护部门')?.value ?? '',
          maintenanceUserName: basicData.value?.find(x => x.name === '维护人')?.value ?? '',
          receiveDepName: basicData.value?.find(x => x.name === '使用部门')?.value ?? '',
          typeName: basicData.value?.find(x => x.name === '风险源分类')?.value ?? '',
          stallName: basicData.value?.find(x => x.name === '关联档位')?.value ?? '',
          sitePointName: basicData.value?.find(x => x.name === '关联现场点')?.value ?? '',
          serialNumber: basicData.value?.find(x => x.name === '风险源编码')?.value ?? '',
          name: basicData.value?.find(x => x.name === '风险源名称')?.value ?? '',
          bimCode: basicData.value?.find(x => x.name === '模型编码')?.value ?? '',
          attribute: basicData.value?.find(x => x.name === '详细位置')?.value ?? '',
          norms: basicData.value?.find(x => x.name === '规格型号')?.value ?? 0,
          receiveUserName: basicData.value?.find(x => x.name === '使用人')?.value ?? '',
          receiveUserPhone: basicData.value?.find(x => x.name === '联系方式')?.value ?? '',
          usageDate: basicData.value?.find(x => x.name === '使用到期日期')?.value ?? '',
          purchasingDate: basicData.value?.find(x => x.name === '购买日期')?.value ?? '',
          mandatoryTestingDate: basicData.value?.find(x => x.name === '强检日期')?.value ?? '',
          produceFactory: configData.value?.find(x => x.name === '生产厂家')?.value ?? '',
          produceAddress: configData.value?.find(x => x.name === '生产厂家地址')?.value ?? '',
          deliveryCompany: configData.value?.find(x => x.name === '配送公司')?.value ?? '',
          deliveryAddress: configData.value?.find(x => x.name === '配送公司地址')?.value ?? '',
          efficiency: otherData.value?.find(x => x.name === '功率')?.value ?? '',
          plateNumber: otherData.value?.find(x => x.name === '车牌号')?.value ?? '',
          insurance: popUpData.insurance,
          typeCode: popUpData.typeCode,
          stallId: popUpData.stallId,
          areaId: popUpData.areaId,
          sitePointId: popUpData.sitePointId,
          receiveDepId: popUpData.receiveDepId,
          receiveUserType: popUpData.receiveUserType,
          maintenanceDepId: popUpData.maintenanceDepId,
          maintenanceUserId: popUpData.maintenanceUserId,
        }
        cubePropertyService.riskSourceLedgerInsert(formData).then(() => {
          showNotify({ type: 'success', message: '新增成功' })
          router.go(-1)
        }).catch(((e) => {
          showNotify({ type: 'danger', message: e.errorMessage })
        }))
      } catch {
      }
    }
    return (): JSX.Element =>
      <>
        <CubeNavBar title='风险源新增' showBack />
        <div class={styles.wrapper}>
          <Form style={{ height: 'calc(100vh - 110px)', overflow: 'auto' }} ref={formRef}>
            <div class={styles.basic}>
              <div class={styles.title}>基础信息</div>
              {basicData.value?.map(item =>
                <CellGroup inset key={item.name}>
                  <Field
                    placeholder={['风险源分类', '关联档位', '使用人类型', '维护部门', '维护人', '使用到期日期', '购买日期', '强检日期', '所在区域', '关联现场点', '使用部门'].includes(item.name) ? '请选择' : '请输入'}
                    style={{ paddingLeft: '0px' }}
                    required={['风险源编码', '风险源名称', '风险源分类'].includes(item.name)}
                    rules={[{ validator: async (value: string) => { return validatorRequire(value, item.name) } }]}
                    name={item.name}
                    label={item.name}
                    v-model={item.value}
                    readonly={['风险源分类', '关联档位', '使用人类型', '维护部门', '维护人', '使用到期日期', '购买日期', '强检日期', '所在区域', '关联现场点', '使用部门'].includes(item.name)}
                    onClick={() => { if (['风险源分类', '使用人类型', '关联档位', '维护部门', '维护人', '使用到期日期', '购买日期', '强检日期', '所在区域', '关联现场点', '使用部门'].includes(item.name)) { item.showPicker = true } }}
                  />
                  <Popup v-model:show={item.showPicker} position='bottom'>
                    {
                    ['关联档位', '使用人类型', '维护部门', '维护人', '关联现场点', '使用部门'].includes(item.name)
                      ? <Picker
                          columns={item.columns}
                          columns-field-names={item.name === '关联档位'
                            ? {
                                text: 'name',
                                value: 'code',
                              }
                            : item.name === '关联现场点'
                              ? {
                                  text: 'name',
                                  value: 'codeNum',
                                }
                              : item.name === '维护部门' || item.name === '维护人' || item.name === '使用部门' || item.name === '使用人类型'
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
                    item.name === '使用到期日期' || item.name === '购买日期' || item.name === '强检日期'
                      ? <DatePicker
                          onConfirm={({ selectedValues }: { selectedValues: string[]; }) => { item.value = selectedValues.join('-'); item.showPicker = false }}
                          onCancel={() => { item.showPicker = false }}
                        />
                      : null
                  }
                    {
                    item.name === '所在区域' || item.name === '风险源分类'
                      ? <Cascader
                          options={item.columns}
                          // v-model={item.value}
                          onFinish={({ selectedOptions }: { selectedOptions: []; }) => { cascaderFinish(item, selectedOptions) }}
                          onClose={() => { item.showPicker = false }}
                          field-names={item.name === '风险源分类'
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
                    readonly={item.name === '是否购买保险'}
                    onClick={() => { if (item.name === '是否购买保险') { item.showPicker = true } }}
                  />
                  <Popup v-model:show={item.showPicker} position='bottom'>
                    {
                    item.name === '是否购买保险'
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
          <Button block type='primary' class={styles.button} native-type='submit' onClick={submit}>提交</Button>
        </div>
      </>
  }
})
