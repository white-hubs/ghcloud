import { Button, Form, FormItem, Modal, PopOver, Select, Step, Table, message } from '@ghcloud/cube-ui'
import type { ColumnType } from '@ghcloud/cube-ui/node_modules/ant-design-vue/es/table'
import { computed, defineComponent, reactive, ref } from 'vue'
import type { ImportType } from '@/types/common-type'
import '@/styles/common.less'
import { ProductSelect } from '@/components/business/product-select/product-select'
import { cubeDeviceCenterInternalService } from '@/api/service'
import { FileUpload } from '@ghcloud/generic-component'
import { logger } from '@/logger'
import { debounce } from '@/utils/tool'
import Steps from '@ghcloud/cube-ui/src/components/steps'
import Styles from './import-modal.module.less'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'

export const ImportModel = defineComponent({
  emits: ['enter'],
  setup (props, { emit, expose }) {
    const importVisible = ref<boolean>(false)
    const showImport = ref<boolean>(true)
    const modalStatus = ref('')
    const formRenderRef = ref<{ resetFields: () => void; validateFields: () => Promise<void>;validate: () => Promise<void>; }>()

    const importCancel = (): void => {
      importVisible.value = false
      if (modalStatus.value !== '') showImport.value = true
      emit('enter')
      formRenderRef.value?.resetFields()
      currentStep.value = 0
    }
    const importData = reactive({
      success: 0,
      fail: 0
    })
    const tableInfo = reactive<{ failColumns: ColumnType[];failTableData: { details: string; }[]; }>({
      failColumns: [
        {
          title: '导入详情',
          dataIndex: 'details',
          align: 'center',
          width: 200,
          customRender: ({ text }: { text: string; }): JSX.Element=> {
            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        },
        {
          title: '状态',
          dataIndex: 'state',
          align: 'center',
          width: 50,
          customRender: (): JSX.Element=> {
            return <PopOver content='失败'>失败</PopOver>
          }
        },
      ],
      failTableData: [],
    })
    const importSuccess = (res: ImportType): void => {
      Object.assign(importData, res)
      if (importData.success < 0) importData.success = 0
      if (importData.fail < 0) importData.fail = 0
      tableInfo.failTableData = []
      tableInfo.failTableData = res.errorMsg.map(item => {
        return {
          details: item
        }
      })
      showImport.value = false
      modalStatus.value = ''
    }

    const parentDeviceOption = ref<unknown[]>()
    const fileUploadRef = ref<{ triggerUpload: () => void;clearAll: () => void; }>()
    const openModal = (): void => {
      formState.excel = null
      formState.productId = undefined
      formState.nodeTypeName = ''
      formState.nodeType = undefined
      formState.parentDeviceId = null
      importVisible.value = true
      showImport.value = true
      fileUploadRef.value?.clearAll()
      currentStep.value = 0
      importLoading.value = false
      if (formRenderRef.value) {
        formRenderRef.value.resetFields()
      }
      cubeDeviceCenterInternalService.getDeviceGateway().then((res: unknown[]) => {
        parentDeviceOption.value = res
      })
    }
    expose({
      openModal
    })
    const formState = reactive< {
      productId: string | undefined;
      parentDeviceId: string | null;
      deviceType: number;
      remark?: string;
      nodeType: number | undefined;
      nodeTypeName: string | undefined;
      excel: File | null;
    }>({
      productId: undefined,
      parentDeviceId: null,
      deviceType: 1, // 设备类型 1真实设备; 0虚拟设备
      remark: '',
      nodeType: undefined,
      nodeTypeName: undefined,
      excel: null
    })

    const isSubDevice = computed(() => {
      return formState.nodeTypeName === '网关子设备' || formState.nodeType === 3
    })
    const modalRules = {
      productId: [{ required: true, message: '请选择所属产品', trigger: 'blur' }],
      excel: [{ required: true, message: '请上传附件', trigger: 'blur' }],
    }
    const modalRulesTwo = {
      productId: [{ required: true, message: '请选择所属产品', trigger: 'blur' }],
      parentDeviceId: [{ required: true, message: '请选择父级设备', trigger: 'blur' }],
      excel: [{ required: true, message: '请上传附件', trigger: 'blur' }],
    }

    const importLoading = ref(false)
    const handleImport = async (): Promise<void> => {
      if (currentStep.value === 0 && (!formState.excel || JSON.stringify(formState.excel) === '[]')) {
        message.warning('请先上传文件')
        return
      }
      currentStep.value++
    }
    const handleNext = debounce(async () => {
      await formRenderRef.value?.validate()
      importLoading.value = true
      try {
        const paramsSub = {
          productId: formState.productId,
          parentDeviceId: formState.parentDeviceId,
          isSubDevice: Number(isSubDevice.value),
          excel: formState.excel,
        }
        const params = {
          productId: formState.productId,
          isSubDevice: Number(isSubDevice.value),
          excel: formState.excel,
        }
        await cubeDeviceCenterInternalService.importBatchDevice(isSubDevice.value ? paramsSub : params).then(res => {
          importSuccess(res as ImportType)
        }).catch(err => {
          logger.debug(err)
        })
      } catch {
      } finally {
        importLoading.value = false
        emit('enter')
      }
      currentStep.value++
    }, 500)

    const exportTemplate = async (): Promise<void> => {
      const res = await cubeDeviceCenterInternalService.exportDeviceTemplate()
      if (res) {
        const link = document.createElement('a')
        const blob = new Blob([res as BlobPart], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        link.style.display = 'none'
        link.href = URL.createObjectURL(blob)
        link.setAttribute('download', '设备列表模版.xlsx')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }

    const currentStep = ref(0)

    return (): JSX.Element =>
      <>
        <Modal
          visible={importVisible.value}
          title='批量导入'
          onOk={currentStep.value === 0
            ? handleImport
            : currentStep.value === 1 ? handleNext : importCancel}
          onCancel={importCancel}
          confirmLoading={importLoading.value}
          okText={currentStep.value === 2 ? '确定' : '下一步'}
        >
          <>
            <div class={Styles['step-form-title']}>
              <Steps current={currentStep.value} size='small' style='width:80%'>
                <Step title='上传数据' />
                <Step title='选择产品' />
                <Step title='导入结果' />
              </Steps>
            </div>
            {
              currentStep.value === 0 &&
                <div class={Styles['step-form']}>
                  <p style='margin:0'>
                    通过下载
                    <Button type='link' style='padding:0;margin:0;' onClick={exportTemplate}>设备列表模版</Button>
                    ，按格式完善设备中的信息后，点击下方选择进行上传。
                  </p>
                  <p style='margin-bottom:20px;color:#aaaaaa'>注意：目前只支持单产品对应的设备上传，请整理的设备列表中不要涵盖多个产品设备。若导入的设备序列号已存在，则会导入失败</p>
                  <FileUpload
                    ref={fileUploadRef}
                    showtext
                    sceneCode={GLOBAL_SCENE_CODE.deviceCenter}
                    typelist={['.xls', '.xlsx']}
                    customText='支持上传（.xls/.xlsx）文件'
                    multiple={false}
                    customupload
                    onFile={(file) => {
                      formState.excel = file
                    }}
                    type='picture'
                    dragger
                  />
                </div>
            }
            {
              currentStep.value === 1 &&
                <div class={Styles['step-form']} v-show={currentStep.value === 1}>
                  <Form model={formState} ref={formRenderRef} rules={isSubDevice.value ? modalRulesTwo : modalRules}>
                    <FormItem label='所属产品' name='productId'>
                      <ProductSelect
                        width='380px' v-model:value={formState.productId} onChange={(e: { nodeType: number;nodeTypeName: string; }) => {
                          formState.nodeType = e.nodeType
                          formState.nodeTypeName = e.nodeTypeName
                          if (!isSubDevice.value) {
                            formState.parentDeviceId = null
                          }
                        }}
                      />
                    </FormItem>
                    <FormItem label='节点类型' name='nodeTypeName'>
                      <span>{formState.nodeTypeName || '--'}</span>
                    </FormItem>
                    {
                      isSubDevice.value &&
                  <>
                    <FormItem label='父级设备' name='parentDeviceId'>
                      <Select
                        style={{ width: '380px' }}
                        v-model:value={formState.parentDeviceId}
                        options={parentDeviceOption.value}
                        placeholder='请选择父级设备'
                        field-names={{ label: 'name', value: 'id' }}
                        allowClear
                      />
                    </FormItem>
                  </>
                    }
                  </Form>
                </div>
            }
            {
              currentStep.value === 2 &&
                <div class={`${Styles['step-form']} importFeedback`}>
                  <div class='importFeedback_title' style={{ marginBottom: '15px', textAlign: 'center' }}>
                    <span>导入结果如下：</span>
                    <span>导入成功共计<span style={{ color: '#389e0d', margin: '0 3px', fontSize: '14px' }}>{importData.success}</span>条，失败<span style={{ fontSize: '14px', color: '#cf1322', margin: '0 3px' }}>{importData.fail}</span>条</span>
                  </div>
                  {
                    tableInfo.failTableData.length > 0 &&
                      <Table columns={tableInfo.failColumns} dataSource={tableInfo.failTableData} pagination={false} size='small' scrollY={500} />
                  }
                </div>
            }
          </>

        </Modal>
      </>
  }
})
