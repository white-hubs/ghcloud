import { Button, Form, FormItem, Modal, PopOver, Step, Steps, Table, message, type FormExpose } from '@ghcloud/cube-ui'
import type { ColumnType } from '@ghcloud/cube-ui/node_modules/ant-design-vue/es/table'
import { defineComponent, reactive, ref } from 'vue'
import '@/styles/common.less'
import { ProductSelect } from '@/components/business/product-select/product-select'
import { cubeDeviceCenterInternalService } from '@/api/service'
import { FileUpload } from '@ghcloud/generic-component'
import { logger } from '@/logger'
import type { ImportType } from '@/types/common-type'
import { debounce } from '@/utils/tool'
import Styles from './import-modal.module.less'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
export const ImportModel = defineComponent({
  props: {
    id: {
      type: String,
      default: ''
    },
  },
  emits: ['enter'],
  setup (props, { emit, expose }) {
    const importVisible = ref<boolean>(false)
    const showImport = ref<boolean>(true)
    const modalStatus = ref('')
    const formRenderRef = ref<FormExpose>()
    const productName = ref('')

    const importCancel = (): void => {
      importVisible.value = false
      if (modalStatus.value !== '') showImport.value = true
      emit('enter')
      reset()
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
    const fileUploadRef = ref<{ triggerUpload: () => void;clearAll: () => void; }>()
    const openModal = (): void => {
      importVisible.value = true
      showImport.value = true
      reset()
    }
    const reset = (): void => {
      currentStep.value = 0
      importLoading.value = false
      fileUploadRef.value?.clearAll()
      if (formRenderRef.value) {
        formRenderRef.value.resetFields()
      }
      formState.excel = null
      formState.productId = null
    }
    expose({
      openModal
    })
    const formState = reactive< {
      productId: string | null;
      excel: File | null;
    }>({
      productId: null,
      excel: null
    })
    const modalRules = {
      productId: [{ required: true, message: '请选择所属产品', trigger: 'blur' }],
    }
    const importLoading = ref(false)
    const handleImport = debounce(async () => {
      if (currentStep.value === 1 && (!formState.excel || JSON.stringify(formState.excel) === '[]')) {
        message.warning('请先上传文件')
        return
      }
      importLoading.value = true
      try {
        await cubeDeviceCenterInternalService.importBatchDeviceInstance({
          file: formState.excel as Blob | null
          ,
        }).then(res => {
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
    const handleNext = async (): Promise<void> => {
      await formRenderRef.value?.validate()
      currentStep.value++
    }

    const downloadTemplete = async (): Promise<void> => {
      const res = await cubeDeviceCenterInternalService.exportDeviceInstanceTemplate({ productId: formState.productId })
      if (res) {
        const link = document.createElement('a')
        const blob = new Blob([res as BlobPart], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        link.style.display = 'none'
        link.href = URL.createObjectURL(blob)
        link.setAttribute('download', '设备台账模版.xlsx')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
    const currentStep = ref(0)
    return (): JSX.Element=>
      <>
        <Modal
          visible={importVisible.value}
          title='批量导入'
          onOk={currentStep.value === 0
            ? handleNext
            : currentStep.value === 1 ? handleImport : importCancel}
          onCancel={importCancel}
          confirmLoading={importLoading.value}
          okText={currentStep.value === 2 ? '确定' : '下一步'}
          width='840px'
        >
          <>
            <div class={Styles['step-form-title']}>
              <Steps current={currentStep.value} size='small' style='width:80%'>
                <Step title='选择产品' />
                <Step title='上传数据' />
                <Step title='导入结果' />
              </Steps>
            </div>
            {
              currentStep.value === 0 &&
                <div class={Styles['step-form']}>
                  <Form model={formState} ref={formRenderRef} rules={modalRules}>
                    <FormItem name='productId' label='所属产品'>
                      <ProductSelect
                        width='380px' v-model:value={formState.productId}
                        onChange={(prodName: string) => {
                          productName.value = prodName
                        }}
                      />
                    </FormItem>
                    {
                      formState.productId &&
                      <Button type='link' style='padding:0;margin:0;' onClick={downloadTemplete}>点击下载设备台账模版</Button>
                    }
                    <>
                      <p style='margin-top:5px'>选择上方产品来获取产品下对应的设备信息，通过下载模版，按格式完善设备中的信息后，点击下一步进行上传。</p>
                      <p style='margin-bottom:20px;color:#aaaaaa'>注意：目前只支持单产品对应的设备上传，请整理的设备列表中不要涵盖多个产品设备。若导入的设备编号已存在，则会直接覆盖。</p>
                    </>
                  </Form>
                </div>
            }
            {
              currentStep.value === 1 &&
                <div class={Styles['step-form']}>
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
              currentStep.value === 2 &&
                <>
                  <div class={`${Styles['step-form']} importFeedback`}>
                    <div class='importFeedback_title' style={{ marginBottom: '15px' }}>
                      <span>导入结果如下：</span>
                      <span>导入成功共计<span style={{ color: '#389e0d', margin: '0 3px', fontSize: '14px' }}>{importData.success ?? 0}</span>条，失败<span style={{ fontSize: '14px', color: '#cf1322', margin: '0 3px' }}>{importData.fail}</span>条</span>
                    </div>
                    {
                      tableInfo.failTableData.length > 0 &&
                      <Table columns={tableInfo.failColumns} dataSource={tableInfo.failTableData} pagination={false} size='small' scrollY={500} />
                    }
                  </div>
                </>
            }
          </>
        </Modal>
      </>
  }
})
