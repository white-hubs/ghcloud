import { defineComponent, onMounted, ref, type VNode } from 'vue'
import styles from './add-case.module.less'
import { useMetaTitle } from '../hooks/use-meta-title-hook'
import { useRoute, useRouter } from 'vue-router'
import { Button, Form, CellGroup, Field, Popup, Picker, Cascader, Uploader, type UploaderFileListItem, Icon, showNotify, showImagePreview } from 'vant'
import { cubeDeviceCenterService, cubeFileService, cubeMaintainService } from '@/api/server'
import { GLOBAL_SCENE_CODE, type FileState } from '@ghcloud/cube-file-service'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
type Columns = Record<string, string>
interface FormData {
  fileIds?: string[];
  name: string;
  value: string;
  label?: string;
  key: string;
  readonly?: boolean;
  type?: string;
  showPicker?: boolean;
  columns?: Columns[];
  files?: { path: string; };
}
export const AddCase = defineComponent({
  setup () {
    const route = useRoute()
    const router = useRouter()
    const formRef = ref()
    const formItem = ref<FormData[]>([
      {
        name: '案例名称',
        key: 'name',
        value: ''
      },
      {
        name: '故障类型',
        key: 'faultTypeName',
        readonly: true,
        value: '',
        label: '',
        columns: []
      },
      {
        name: '设备品类',
        key: 'deviceTypeName',
        readonly: true,
        value: '',
        label: '',
        columns: []
      },
      {
        name: '故障现象',
        key: 'faultPhenomenon',
        type: 'textarea',
        value: '',
      },
      {
        name: '故障原因',
        key: 'faultReason',
        type: 'textarea',
        value: '',
      },
      {
        name: '处理措施',
        key: 'treatmentMeasures',
        type: 'textarea',
        value: '',
      },
    ])
    const files = ref<FileState[]>([])
    const filesIds = ref<string[]>([])
    const formType = route.query.id ? 'EDIT' : 'ADD'
    useMetaTitle(formType === 'ADD' ? '新增故障案例' : '案例详情')
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
      if (formType === 'EDIT')getTaskDetail()
      getFaultTypeData()
      getCategory()
    })
    // 获取详情
    const getTaskDetail = async (): Promise<void> => {
      const data = await cubeMaintainService.faultCaseDetail(route.query.id as string)
      formItem.value?.forEach(x => {
        switch (x.key) {
          case 'name':
            x.value = data.name
            break
          case 'faultReason':
            x.value = data.faultReason
            break
          case 'faultPhenomenon':
            x.value = data.faultPhenomenon
            break
          case 'treatmentMeasures':
            x.value = data.treatmentMeasures
            break
          case 'faultTypeName':
            x.value = data.faultTypeName
            break
          case 'deviceTypeName':
            x.value = data.deviceTypeName
            break
        }
      })
      files.value = data.files
    }
    // 获取故障类型列表
    const getFaultTypeData = async (): Promise<void> => {
      const data = await cubeMaintainService.faultTypeList()
      formItem.value?.forEach(x => {
        if (x.key === 'faultTypeName') {
          x.columns = data as unknown as Columns[]
        }
      })
    }
    // 获取设备品类
    const getCategory = async (): Promise<void> => {
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
      const data = await cubeDeviceCenterService.getIotProductCategoryTree()
      formItem.value?.forEach(x => {
        if (x.key === 'deviceTypeName') {
          x.columns = formatData(data as unknown as Columns[]) as Columns[]
        }
      })
    }
    // 级联选择
    const cascaderFinish = (item: FormData, selectedOptions: Columns[]): void => {
      item.value = selectedOptions.map((option: Columns) => option.categoryName).join('/')
      item.label = selectedOptions[0].categoryCode
      item.showPicker = false
    }
    // 下拉选择
    const pickerConfirm = (item: FormData, selectedOptions: Columns[]): void => {
      item.value = selectedOptions[0].name
      item.label = selectedOptions[0].id
      item.showPicker = false
    }
    // 上传组件
    const upload = (): VNode => {
      return (
        <Uploader
          v-model={files.value}
          multiple
          onClickUpload={clickUpload}
          readonly={getEnvironment() === 'cubeApp'}
          before-delete={(file: UploaderFileListItem | UploaderFileListItem[], detail: { index: number; }) => {
            handleFileDelete(file, detail)
          }}
          afterRead={(file: UploaderFileListItem | UploaderFileListItem[]) => {
            handleFileAfterRead(file)
          }}
        >
          <div class={styles.upload}><Icon name='plus' size='40' color='#c1c1c1' /></div>
        </Uploader>
      )
    }
    const clickUpload = async (): Promise<void> => {
      if (getEnvironment() === 'cubeApp') {
        // js sdk 能力调取
        const res = await cubeAppService.uploadImage('3', {
          sceneCode: GLOBAL_SCENE_CODE.faultOrderCase
        })
        files.value = [...files.value, ...res.map(e => {
          const item = e as { path: string; id: string; }
          return {
            url: item.path,
            ossId: item.id,
            isImage: true,
            id: item.id,
          }
        })]
        const ids = files.value.map(x => x.ossId ?? '')
        if (!files.value)files.value = []
        ids.forEach(x => {
          filesIds.value.push(x)
        })
      } else {
        (document.querySelector('.van-uploader__input') as unknown as HTMLElement).click()
      }
    }
    // 上传图片
    const handleFileAfterRead = async (file: UploaderFileListItem | UploaderFileListItem[]): Promise<void> => {
      const fileList = []
      if (Array.isArray(file)) {
        for (const fileItem of file) {
          fileItem.status = 'uploading'
          fileItem.message = '上传中...'
          const payload = {
            businessKey: 'mdata',
            file: fileItem.file as Blob,
            sceneCode: GLOBAL_SCENE_CODE.faultOrderCase
          }
          const fileInfo = await cubeFileService.uploadFile(payload)
          fileList.push(fileInfo)
          fileItem.url = fileInfo.path as unknown as string
          fileItem.status = 'done'
          fileItem.message = '上传成功'
        }
      } else {
        file.status = 'uploading'
        file.message = '上传中...'
        const payload = {
          businessKey: 'mdata',
          file: file.file as Blob,
          sceneCode: GLOBAL_SCENE_CODE.faultOrderCase
        }
        const result = await cubeFileService.uploadFile(payload)
        fileList.push(result)
        file.url = result.path as unknown as string
        file.status = 'done'
        file.message = '上传成功'
      }
      const ids = fileList.map(x => x.id ?? '')
      ids.forEach(x => {
        filesIds.value.push(x)
      })
      if (!files.value)files.value = []
    }
    // 删除图片
    const handleFileDelete = (file: UploaderFileListItem | UploaderFileListItem[], detail: { index: number; }): void => {
      filesIds.value.splice(detail.index, 1)
      files.value.splice(detail.index, 1)
    }
    // 图片预览
    const ImagePreview = (path: string): void => {
      showImagePreview([path])
    }
    // 提交表单
    const submit = async (): Promise<void> => {
      try {
        await formRef.value.validate()
        const formData = {
          name: formItem.value?.find(x => x.key === 'name')?.value ?? '',
          faultTypeId: formItem.value?.find(x => x.key === 'faultTypeName')?.label ?? '',
          faultTypeName: formItem.value?.find(x => x.key === 'faultTypeName')?.value ?? '',
          productCategoryCode: formItem.value?.find(x => x.key === 'deviceTypeName')?.label ?? '',
          deviceTypeName: formItem.value?.find(x => x.key === 'deviceTypeName')?.value ?? '',
          faultPhenomenon: formItem.value?.find(x => x.key === 'faultPhenomenon')?.value ?? '',
          faultReason: formItem.value?.find(x => x.key === 'faultReason')?.value ?? '',
          treatmentMeasures: formItem.value?.find(x => x.key === 'treatmentMeasures')?.value ?? '',
          fileIds: filesIds.value
        }
        cubeMaintainService.addFaultCase(formData).then(() => {
          showNotify({ type: 'success', message: '更新成功' })
          router.go(-1)
        }).catch(((e) => {
          showNotify({ type: 'danger', message: e.errorMessage })
        }))
      } catch {
      }
    }
    return (): JSX.Element =>
      <div class={styles.wrapper}>
        <CubeNavBar showBack title={formType === 'ADD' ? '案例新增' : '案例详情'} />
        <Form style={{ height: '88vh', overflow: 'auto' }} ref={formRef}>
          <div class={styles.basic}>
            <CellGroup inset>
              {
                formItem.value?.map((item) =>
                  <div key={item.name}>
                    {
                      formType === 'ADD'
                        ? <Field
                          placeholder={(item.readonly ? `请选择${item.name}` : `请输入${item.name}`)}
                          type={item.type}
                          maxlength={item.type === 'textarea' ? 150 : 50}
                          readonly={item.readonly}
                          show-word-limit={item.type === 'textarea'}
                          style={{ paddingLeft: '0px' }}
                          name={item.name}
                          label={item.name}
                          v-model={item.value}
                          rules={[{ required: true, message: `${item.name}不能为空` }]}
                          right-icon={formType === 'ADD' ? (item.readonly ? 'arrow' : '') : ''}
                          onClick={() => {
                            if (item.readonly) {
                              item.showPicker = true
                            }
                          }}
                        />
                        : <Field
                          type={item.type}
                          maxlength={item.type === 'textarea' ? 150 : 50}
                          readonly
                          show-word-limit={item.type === 'textarea'}
                          style={{ paddingLeft: '0px' }}
                          name={item.name}
                          label={item.name}
                          v-slots={{ input: () => <div v-html={item.value} /> }}
                        />
                    }
                    <Popup v-model:show={item.showPicker} position='bottom'>
                      {
                        item.key === 'faultTypeName'
                          ? <Picker
                            columns={item.columns}
                            columns-field-names={{
                              text: 'name',
                              value: 'id',
                            }}
                            onConfirm={({ selectedOptions }: { selectedOptions: []; }) => {
                              pickerConfirm((item), selectedOptions)
                            }}
                            onCancel={() => {
                              item.showPicker = false
                            }}
                          />
                          : null
                      }
                      {
                        item.key === 'deviceTypeName'
                          ? <Cascader
                            options={item.columns}
                            v-model={item.value}
                            change-on-select
                            onFinish={({ selectedOptions }: { selectedOptions: []; }) => {
                              cascaderFinish(item, selectedOptions)
                            }}
                            onClose={() => {
                              item.showPicker = false
                            }}
                            field-names={{
                              text: 'categoryName',
                              value: 'categoryCode',
                              children: 'children'
                            }}
                          />
                          : null
                      }
                    </Popup>
                  </div>)
              }
              {
                formType === 'ADD'
                  ? <Field
                    name='uploader'
                    label='上传附件'
                    v-slots={{ input: upload }}
                    label-width='80'
                    style={{ paddingLeft: '0px' }}
                    label-align='top'
                  />
                  : <div class={styles.photo} v-show={files.value.length > 0}><p>照片：</p>{files.value.map(x => <img width='80' height='80' key={x.path ?? ''} src={x.path ?? ''} onClick={() => {
                    ImagePreview(x.path ?? '')
                  }} />)}</div>
              }
            </CellGroup>
          </div>
        </Form>
        <Button v-show={formType === 'ADD'} block type='primary' class={styles.button} native-type='submit' onClick={submit}>提交</Button>
      </div>
  }
})
