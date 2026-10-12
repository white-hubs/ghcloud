import { Form, FormItem, Modal, PopOver, Step, Table, message } from '@ghcloud/cube-ui'
import type { ColumnType } from '@ghcloud/cube-ui/node_modules/ant-design-vue/es/table'
import { defineComponent, reactive, ref } from 'vue'
import type { ImportProductType } from '@/types/common-type'
import '@/styles/common.less'
import { FileUpload } from '@ghcloud/generic-component'
import { logger } from '@/logger'
import { debounce } from '@/utils/tool'
import Steps from '@ghcloud/cube-ui/src/components/steps'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import { cubeDeviceCenterService } from '@/api/service'

export const ImportModal = defineComponent({
  emits: ['enter'],
  setup (props, { emit, expose }) {
    const importVisible = ref<boolean>(false)
    const formRenderRef = ref<{ resetFields: () => void; validateFields: () => Promise<void>;validate: () => Promise<void>; }>()
    const currentStep = ref(0)
    const importLoading = ref(false)
    
    const importCancel = (): void => {
      importVisible.value = false
      formRenderRef.value?.resetFields()
      currentStep.value = 0
    }
    
    const importData = reactive<ImportProductType>({
      productSuccess: '',
      productFailDetails: [],
      timestamp: Date.now()
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
    
    const importSuccess = (res: ImportProductType): void => {
      tableInfo.failTableData = []
      if (res.productSuccess !== 'ALL_SUCCESS') {
        tableInfo.failTableData = res.productFailDetails.map(item => {
          return {
            details: item
          }
        })
      }
      Object.assign(importData, res)
    }

    const fileUploadRef = ref<{ triggerUpload: () => void;clearAll: () => void; }>()
    const openModal = (): void => {
      formState.excel = null
      importVisible.value = true
      fileUploadRef.value?.clearAll()
      currentStep.value = 0
      importLoading.value = false
      if (formRenderRef.value) {
        formRenderRef.value.resetFields()
      }
    }
    
    expose({
      openModal
    })
    
    const formState = reactive<{
      excel: File | null;
    }>({
      excel: null
    })

    const modalRules = {
      excel: [{ required: true, message: '请上传附件', trigger: 'blur' }],
    }

    const handleImport = debounce(async () => {
      if (!formState.excel || JSON.stringify(formState.excel) === '[]') {
        message.warning('请先上传文件')
        return
      }
      
      importLoading.value = true
      try {
        const params = {
          file: formState.excel as Blob | null
        }
        await cubeDeviceCenterService.importBatchProduct(params).then(res => {
          currentStep.value = 1
          importSuccess(res as ImportProductType)
        }).catch(err => {
          logger.debug(err)
        })
      } catch {
      } finally {
        importLoading.value = false
        emit('enter')
      }
    }, 500)

    return (): JSX.Element =>
      <>
        <Modal
          visible={importVisible.value}
          title='批量导入'
          onOk={currentStep.value === 0 ? handleImport : importCancel}
          onCancel={importCancel}
          confirmLoading={importLoading.value}
          okText={currentStep.value === 1 ? '确定' : '下一步'}
        >
          <>
            <div style='margin-bottom: 20px'>
              <Steps current={currentStep.value} size='small' style='width:80%'>
                <Step title='上传数据' />
                <Step title='导入结果' />
              </Steps>
            </div>
            {
              currentStep.value === 0 &&
                <div>
                  <Form model={formState} ref={formRenderRef} rules={modalRules}>
                    <FormItem name='excel'>
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
                    </FormItem>
                  </Form>
                </div>
            }
            {
              currentStep.value === 1 &&
                <div class='importFeedback'>
                  <div class='importFeedback_title' style={{ marginBottom: '15px', textAlign: 'center' }}>
                    <span>导入结果如下：</span>
                    {
                      importData?.productSuccess == 'ALL_SUCCESS' ? <span style={{ color: '#389e0d' }}>导入成功</span> : <span style={{ color: '#cf1322' }}>导入失败</span>
                    }
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