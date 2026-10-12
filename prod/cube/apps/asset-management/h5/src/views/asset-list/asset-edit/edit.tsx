import { defineComponent, onMounted, reactive, ref, type VNode } from 'vue'
import styles from './edit.module.less'
import { useRoute, useRouter } from 'vue-router'
import { Button, Form, CellGroup, Field, showNotify, Popup, Cascader, DatePicker, Picker, Cell, Uploader, type UploaderFileListItem } from 'vant'
import { cubeOuaaService, cubeMdataService, cubeAssetManagementService, cubeFileService } from '@/api/server'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { ChoiceStaff } from './choice-staff/choice-staff'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import type { DeptList } from '@ghcloud/cube-ouaa-service'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
type Columns = Record<string, string>
interface FieldItem {
  name: string;
  value: string ;
  key?: string | string[];
  showPicker?: boolean;
  columns?: Columns[];
  files?: { path: string; }[];
}
interface PopDataType {
  adminId: string;
  typeId: string;
  maintenanceDepId: string;
  receiveDepId: string;
  receiveUserId: string;
  areaIds: string[];
  sourceId: string;
}
export const AssetEdit = defineComponent({
  setup () {
    const route = useRoute()
    const router = useRouter()
    const formRef = ref()
    const popUpData = reactive<PopDataType>({
      adminId: '',
      typeId: '',
      maintenanceDepId: '',
      receiveDepId: '',
      receiveUserId: '',
      areaIds: [],
      sourceId: '',
    })
    const fileList = ref<FileList[]>([])
    const basicData = ref<FieldItem[]>()
    const personData = ref<FieldItem[]>()
    const maintainData = ref<FieldItem[]>()
    const otherData = ref<FieldItem[]>()
    const oldSerialNumber = ref<string>('')
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
      getAsset()
      getTaskDetail()
      getDeptData()
      getAreaData()
    })
    // 编辑回显
    const getTaskDetail = async (): Promise<void> => {
      basicData.value = JSON.parse(route.query.basicData as string)
      basicData.value?.forEach(x => {
        if (x.value === '--')x.value = ''
        x.showPicker = false
        x.columns = []
      })
      oldSerialNumber.value = basicData.value?.find(x => x.name === '资产编码')?.value as string
      personData.value = JSON.parse(route.query.personData as string)
      personData.value?.forEach(x => {
        if (x.value === '--')x.value = ''
        x.showPicker = false
        x.columns = []
      })
      maintainData.value = JSON.parse(route.query.maintainData as string)
      maintainData.value?.forEach(x => {
        if (x.value === '--')x.value = ''
        x.showPicker = false
        x.columns = []
      })
      otherData.value = JSON.parse(route.query.otherData as string)
      otherData.value?.forEach(x => {
        if (x.value === '--')x.value = ''
        x.showPicker = false
        x.columns = []
      })
      popUpData.typeId = basicData.value?.find(x => x.name === '资产类型')?.key as string ?? ''
      popUpData.adminId = basicData.value?.find(x => x.name === '管理人员')?.key as string ?? ''
      popUpData.areaIds = basicData.value?.find(x => x.name === '区域')?.key as string[] ?? []
      popUpData.maintenanceDepId = basicData.value?.find(x => x.name === '维护部门')?.key as string ?? ''
      popUpData.receiveDepId = personData.value?.find(x => x.name === '使用部门')?.key as string ?? ''
      popUpData.receiveUserId = personData.value?.find(x => x.name === '使用人')?.key as string ?? ''
      popUpData.sourceId = otherData.value?.find(x => x.name === '来源')?.key as string ?? ''
      const imgs = otherData.value?.find(x => x.name === '资产照片')?.value as unknown as FileList[]
      fileList.value = (imgs)?.map(x => {
        x.url = x.path ?? ''
        x.ossId = x.id ?? ''
        return x
      })
    }
    // 获取资产
    const getAsset = async (): Promise<void> => {
      const { records: assetType } = await cubeAssetManagementService.getAssemblyClassifyPage({ type: 'assetType' })
      const { records: assetSource } = await cubeAssetManagementService.getAssemblyClassifyPage({ type: 'assetSource' })
      basicData.value?.forEach(x => {
        if (x.name === '资产类型') {
          x.columns = assetType as unknown as Columns[]
        }
      })
      otherData.value?.forEach(x => {
        if (x.name === '来源') {
          x.columns = assetSource as unknown as Columns[]
        }
      })
    }
    // 获取部门
    const getDeptData = async (): Promise<void> => {
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
        if (x.name === '维护部门') {
          x.columns = formatData(data) as Columns[]
        }
      })
      personData.value?.forEach(x => {
        if (x.name === '使用部门') {
          x.columns = formatData(data) as unknown as Columns[]
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
        if (x.name === '区域') {
          x.columns = formatData(data as unknown as Columns[]) as Columns[]
        }
      })
    }
    // 区域选择
    const areaChange = (item: { value: string ;showPicker?: boolean;name: string; }, selectedOptions: { name: string; code: string; id: string; }[]): void => {
      item.value = selectedOptions.map((option: { name: string; }) => option.name).join('/')
      popUpData.areaIds = selectedOptions.map((option: { id: string; }) => option.id)
    }
    // 人员选择
    const handleUser = (name: string, val: { id: string;label: string; }): void => {
      if (name === '管理人员') {
        basicData.value?.forEach(x => {
          if (x.name === '管理人员') {
            x.value = val.label
          }
        })
        popUpData.adminId = val.id
      }
      if (name === '使用人') {
        personData.value?.forEach(x => {
          if (x.name === '使用人') {
            x.value = val.label
          }
        })
        popUpData.receiveUserId = val.id
      }
    }
    // 下拉选择
    const pickerConfirm = (item: { value: string ;showPicker?: boolean;name: string; }, selectedOptions: { name: string; code: string; id: string; }[]): void => {
      switch (item.name) {
        case '资产类别':
          popUpData.typeId = selectedOptions[0].id
          break
        case '维护部门':
          popUpData.maintenanceDepId = selectedOptions[0].id
          break
        case '使用部门':
          popUpData.receiveDepId = selectedOptions[0].id
          break
        case '来源':
          popUpData.sourceId = selectedOptions[0].id
          break
      }
      item.value = selectedOptions[0].name
      item.showPicker = false
    }
    const validatorRequire = async (value: string, name: string): Promise<string> => {
      if (!['来源', '使用期限（月）', '资产编码', '资产类型', '资产名称', '入库日期', '管理人员'].includes(name)) return ''
      if (value.trim() === '') return `请输入${name}`
      return ''
    }

    // 校验资产编码是否重复
    const validateSerialNumber = async (newSerialNumber: string, originalSerialNumber: string, id: string): Promise<boolean> => {
      if (!newSerialNumber) {
        showNotify({ type: 'danger', message: '请输入资产编码' })
        return false;
      }
      if (originalSerialNumber !== newSerialNumber) {
        const checkParams = { checkSerialNumberList: [{ key: id, value: newSerialNumber }] };
        try {
          const res = await cubeAssetManagementService.checkPropertyCode(checkParams);
          if (res && Array.isArray(res) && res.includes(newSerialNumber)) {
            showNotify({ type: 'danger', message: `资产编码 ${newSerialNumber} 已存在，请重新输入` })
            return false;
          }
        } catch {
          showNotify({ type: 'danger', message: '校验资产编码时发生错误，请稍后重试' })
          return false;
        }
      }
      return true;
    };

    const submit = async (): Promise<void> => {
      try {
        await formRef.value.validate()
        const newSerialNumber = basicData.value?.find(x => x.name === '资产编码')?.value as string;
        const isValidate = await validateSerialNumber(newSerialNumber, oldSerialNumber.value, route.query.id as string ?? '')
        if (!isValidate) {
          return
        }
        const formData = {
          id: route.query.id as string ?? '',
          serialNumber: basicData.value?.find(x => x.name === '资产编码')?.value ?? '',
          financeNumber: basicData.value?.find(x => x.name === '财务编码')?.value ?? '',
          typeName: basicData.value?.find(x => x.name === '资产类型')?.value ?? '',
          typeId: popUpData.typeId,
          name: basicData.value?.find(x => x.name === '资产名称')?.value ?? '',
          startTime: basicData.value?.find(x => x.name === '入库日期')?.value ?? '',
          price: basicData.value?.find(x => x.name === '原值')?.value ?? '',
          norms: basicData.value?.find(x => x.name === '标准型号')?.value ?? '',
          unit: basicData.value?.find(x => x.name === '计量单位')?.value ?? '',
          deviceNumber: basicData.value?.find(x => x.name === '设备编码')?.value ?? '',
          adminName: basicData.value?.find(x => x.name === '管理人员')?.value ?? '',
          adminId: popUpData.adminId,
          areaIds: popUpData.areaIds,
          storageLocation: basicData.value?.find(x => x.name === '存放地点')?.value ?? '',
          purchaseDate: basicData.value?.find(x => x.name === '购入日期')?.value ?? '',
          maintenanceDepName: basicData.value?.find(x => x.name === '维护部门')?.value ?? '',
          maintenanceDepId: popUpData.maintenanceDepId,
          receiveUserName: personData.value?.find(x => x.name === '使用人')?.value ?? '',
          receiveUserId: popUpData.receiveUserId,
          receiveDepName: personData.value?.find(x => x.name === '使用部门')?.value ?? '',
          receiveDepId: popUpData.receiveDepId,
          receiveUserPhone: personData.value?.find(x => x.name === '联系方式')?.value ?? '',
          supplier: maintainData.value?.find(x => x.name === '供应商')?.value ?? '',
          supplierUser: maintainData.value?.find(x => x.name === '联系人')?.value ?? '',
          supplierPhone: maintainData.value?.find(x => x.name === '联系方式')?.value ?? '',
          maintenanceTime: maintainData.value?.find(x => x.name === '维保期限（月）')?.value ?? '',
          usageTime: otherData.value?.find(x => x.name === '使用期限（月）')?.value ?? '',
          sourceName: otherData.value?.find(x => x.name === '来源')?.value ?? '',
          sourceId: popUpData.sourceId,
          imgs: fileList.value.map(x => x.ossId),
          status: route.query.status,
          remarks: otherData.value?.find(x => x.name === '备注')?.value ?? '',
        }
        cubeAssetManagementService.updateAsset(formData).then(() => {
          showNotify({ type: 'success', message: '更新成功' })
          router.go(-1)
        }).catch(((e) => {
          showNotify({ type: 'danger', message: e.errorMessage })
        }))
      } catch {
      }
    }
    type FileList = UploaderFileListItem & { ossId: string;path?: string; id?: string ; }
    const maxPicLimit = 3
    const otherDom = (item: FieldItem): VNode =>
      <>
        <Field
          is-link={item.name === '来源'}
          label-width='122'
          placeholder={item.name === '来源' ? '请选择' : '请输入'}
          style={{ paddingLeft: '0px' }}
          required={['来源', '使用期限（月）'].includes(item.name)}
          rules={[{ validator: async (value: string): Promise<string> => {
            return validatorRequire(value, item.name)
          } }]}
          name={item.name}
          label={item.name}
          v-model={item.value}
          readonly={item.name === '来源'}
          onClick={() => {
            if (item.name === '来源') {
              item.showPicker = true
            }
          }}
        />
        <Popup v-model:show={item.showPicker} position='bottom'>
          {
            item.name === '来源'
              ? <Picker
                columns={item.columns}
                columns-field-names={{
                  text: 'name',
                  value: 'id',
                }}
                onConfirm={({ selectedOptions }: { selectedOptions: []; }) => {
                  pickerConfirm(item, selectedOptions)
                }}
                onCancel={() => {
                  item.showPicker = false
                }}
              />
              : null
          }
        </Popup>
      </>
    // 资产照片
    const uploadDom = (): VNode =>
      <>
        <div class={styles['upload-img']}>资产照片</div>
        <Field
          v-slots={
            {
              input: () => {
                return (
                  <Uploader
                    readonly={getEnvironment() === 'cubeApp'}
                    v-model={fileList.value}
                    max-count={maxPicLimit}
                    onClickUpload={clickUpload}
                    afterRead={(file: UploaderFileListItem) => {
                      customUploader(file)
                    }}
                  />
                )
              }
            }
          }
        />
      </>
    const clickUpload = async (): Promise<void> => {
      if (getEnvironment() === 'cubeApp') {
        // js sdk 能力调取
        const res = await cubeAppService.uploadImage(maxPicLimit + '',
          { sceneCode: GLOBAL_SCENE_CODE.propertyManagement })
        fileList.value = [...fileList.value, ...res.map(e => {
          const item = e as { path: string; id: string; }
          return {
            url: item.path,
            ossId: item.id,
            isImage: true
          }
        })]
      } else {
        (document.querySelector('.van-uploader__input') as unknown as HTMLElement).click()
      }
    }
    const customUploader = async (uploadItem: UploaderFileListItem): Promise<void> => {
      if (!uploadItem.file) {
        return
      }
      const fileIndex = fileList.value.findIndex(e => uploadItem.file && e.file && e.file.name === uploadItem.file.name)
      if (fileIndex === -1) {
        return
      }
      if (uploadItem.file.size / 1024 > 1024 * 100) {
        showNotify('附件图片大小不能超过100MB')
        fileList.value.splice(fileIndex, 1)
        return
      }
      fileList.value[fileIndex].status = 'uploading'
      const res = await cubeFileService.uploadFile({
        file: uploadItem.file,
        businessKey: 'mdata',
        sceneCode: GLOBAL_SCENE_CODE.propertyManagement
      })

      fileList.value[fileIndex].status = ''
      fileList.value[fileIndex].ossId = res.id ?? ''
    }
    return (): JSX.Element =>
      <div class={styles.wrapper}>
        <CubeNavBar showBack title='资产编辑' />
        <Form style={{ height: '88vh', overflow: 'auto' }} ref={formRef}>
          <CellGroup style='margin-top:10px'>
            <Cell>
              <div class={styles['cell-title']}>基础信息</div>
            </Cell>
            {
              basicData.value?.map(item =>
                <div key={item.name} class={styles.field}>
                  <Field
                    label-width='122'
                    is-link={['资产类型', '入库日期', '管理人员', '区域', '购入日期', '维护部门'].includes(item.name)}
                    placeholder={['资产类型', '入库日期', '管理人员', '区域', '购入日期', '维护部门'].includes(item.name) ? '请选择' : '请输入'}
                    style={{ paddingLeft: '0px' }}
                    required={['资产编码', '资产类型', '资产名称', '入库日期', '管理人员'].includes(item.name)}
                    rules={[{ validator: async (value: string): Promise<string> => {
                      return validatorRequire(value, item.name)
                    } }]}
                    name={item.name}
                    label={item.name}
                    v-model={item.value}
                    readonly={['资产类型', '入库日期', '管理人员', '区域', '购入日期', '维护部门'].includes(item.name)}
                    onClick={() => {
                      if (['资产类型', '入库日期', '管理人员', '区域', '购入日期', '维护部门'].includes(item.name)) {
                        item.showPicker = true
                      }
                    }}
                  />
                  <Popup v-model:show={item.showPicker} position='bottom'>
                    {
                      ['资产类型', '维护部门'].includes(item.name)
                        ? <Picker
                          columns={item.columns}
                          columns-field-names={{
                            text: 'name',
                            value: 'id',
                          }}
                          onConfirm={({ selectedOptions }: { selectedOptions: []; }) => {
                            pickerConfirm(item, selectedOptions)
                          }}
                          onCancel={() => {
                            item.showPicker = false
                          }}
                        />
                        : null
                    }
                    {
                      ['购入日期', '入库日期'].includes(item.name)
                        ? <DatePicker
                          onConfirm={({ selectedValues }: { selectedValues: string[]; }) => {
                            item.value = selectedValues.join('-'); item.showPicker = false
                          }}
                          onCancel={() => {
                            item.showPicker = false
                          }}
                        />
                        : null
                    }
                    {
                      item.name === '区域'
                        ? <Cascader
                          options={item.columns}
                          value={item.value}
                          multiple
                          onChange={({ selectedOptions }: { selectedOptions: []; }) => {
                            areaChange(item, selectedOptions)
                          }}
                          onClose={() => {
                            item.showPicker = false
                          }}
                          field-names={{
                            text: 'name',
                            value: 'id',
                            children: 'children'
                          }}
                        />
                        : null
                    }
                  </Popup>
                  {
                    item.name === '管理人员' ? <Popup style='width:100%' v-model:show={item.showPicker} position='right'><ChoiceStaff onSubmit={(val: { id: string;label: string; }) => {
                      item.showPicker = false; handleUser(item.name, val)
                    }} /></Popup> : null
                  }
                </div>)
            }
          </CellGroup>
          <CellGroup style='margin-top:10px'>
            <Cell>
              <div class={styles['cell-title']}>使用人信息</div>
            </Cell>
            {
              personData.value?.map(item =>
                <div key={item.name} class={styles.field}>
                  <Field
                    label-width='122'
                    is-link={['使用人', '使用部门'].includes(item.name)}
                    placeholder={['使用人', '使用部门'].includes(item.name) ? '请选择' : '请输入'}
                    style={{ paddingLeft: '0px' }}
                    name={item.name}
                    label={item.name}
                    v-model={item.value}
                    readonly={['使用人', '使用部门'].includes(item.name)}
                    onClick={() => {
                      if (['使用人', '使用部门'].includes(item.name)) {
                        item.showPicker = true
                      }
                    }}
                  />
                  <Popup v-model:show={item.showPicker} position='bottom'>
                    {
                      item.name === '使用部门'
                        ? <Picker
                          columns={item.columns}
                          columns-field-names={{
                            text: 'name',
                            value: 'id',
                          }}
                          onConfirm={({ selectedOptions }: { selectedOptions: []; }) => {
                            pickerConfirm(item, selectedOptions)
                          }}
                          onCancel={() => {
                            item.showPicker = false
                          }}
                        />
                        : null
                    }
                  </Popup>
                  {
                    item.name === '使用人' ? <Popup style='width:100%' v-model:show={item.showPicker} position='right'><ChoiceStaff onSubmit={(val: { id: string;label: string; }) => {
                      item.showPicker = false; handleUser(item.name, val)
                    }} /></Popup> : null
                  }
                </div>)
            }
          </CellGroup>
          <CellGroup style='margin-top:10px'>
            <Cell>
              <div class={styles['cell-title']}>维保信息</div>
            </Cell>
            {
              maintainData.value?.map(item =>
                <div key={item.name} class={styles.field}>
                  <Field
                    label-width='122'
                    placeholder='请输入'
                    style={{ paddingLeft: '0px' }}
                    name={item.name}
                    label={item.name}
                    v-model={item.value}
                  />
                </div>)
            }
          </CellGroup>
          <CellGroup style='margin-top:10px'>
            <Cell>
              <div class={styles['cell-title']}>其他信息</div>
            </Cell>
            {
              otherData.value?.map(item =>
                <div key={item.name} class={styles.field}>
                  {
                    item.name === '资产照片'
                      ? uploadDom()
                      : otherDom(item)
                  }
                </div>)
            }
          </CellGroup>
        </Form>
        <Button block type='primary' size='small' class={styles.button} native-type='submit' onClick={submit}>提交</Button>
      </div>
  }
})
