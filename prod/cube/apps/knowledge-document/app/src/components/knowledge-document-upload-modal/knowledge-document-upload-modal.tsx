import { defineComponent, ref, reactive } from 'vue'
import type { ColumnType } from '@ghcloud/cube-ui/node_modules/ant-design-vue/es/table'
import { Modal, Step, Table, message, PopOver } from '@ghcloud/cube-ui'
import Steps from '@ghcloud/cube-ui/src/components/steps'
import type { OSSFile } from '@ghcloud/generic-component'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import { FileUpload } from '@ghcloud/cube-app-design'
import { debounce } from '@/utils/index'
import Styles from './knowledge-document-upload-modal.module.less'
import { DocumentUploadItem } from './document-upload-item'
import type { KnowledgeDocumentBatchModel } from '@ghcloud/cube-knowledge-document-service'
import { cubeKnowledgeDocumentService } from '@/api/service'

export const KnowledgeDocumentUploadModal = defineComponent({
  emits: ['enter'],
  setup (props, { emit, expose }) {
    const currentStep = ref(0)
    const showModal = ref(false)
    const loading = ref(false)
    const files = ref<OSSFile[]>([])
    const fileUploadRef = ref<{ triggerUpload: () => void;clearAll: () => void; }>()
    const formItemRefs = ref<{
      validate: () => Promise<boolean>;
      getFormData: () => {
        name: string;
        typeId: string;
        deptId: string | null;
        productId: string | null;
        fileIds: string[];
      };
    }[]>([])
    let allFormItemData = [] as {
      name: string;
      typeId: string;
      deptId: string | null;
      productId: string | null;
      fileIds: string[];
    }[];
    const uploadData = ref<KnowledgeDocumentBatchModel>({
      errorCount: 0,
      successCount: 0,
      errorList: [],
    })
    const tableInfo = reactive<{ failColumns: ColumnType[]; failTableData: { details: string; }[]; }>({
      failColumns: [
        {
          title: '上传文档',
          dataIndex: 'details',
          align: 'center',
          width: 200,
          customRender: ({ text }: { text: string; }): JSX.Element => {
            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        },
        {
          title: '状态',
          dataIndex: 'state',
          align: 'center',
          width: 50,
          customRender: (): JSX.Element => {
            return <PopOver content='失败'>失败</PopOver>
          }
        },
      ],
      failTableData: [],
    })

    const openModal = (): void => {
      showModal.value = true
      currentStep.value = 0
      files.value = []
    }
    expose({
      openModal
    })

    const handelFile = async (): Promise<void> => {
      if (files.value.length === 0) {
        message.warn("请先上传文件");
        return
      }
      loading.value = true
      try {
        currentStep.value ++
      } catch {
      } finally {
        loading.value = false
      }
    }

    const handleUpload = debounce(async () => {
      loading.value = true
      try {
        allFormItemData = []
        for await (const item of formItemRefs.value) {
          const res = await item.validate()
          if (!res) {
            message.warn('请完善信息')
            Promise.reject()
            return
          } else {
            allFormItemData.push(item.getFormData())
          }
        }
        const response = await cubeKnowledgeDocumentService.addKnowledgeDocumentBatch(allFormItemData)
        uploadData.value = response
        tableInfo.failTableData = response.errorList.map(item => ({
          details: item,
        }))
        currentStep.value++
      } catch {
      } finally {
        loading.value = false
        emit('enter')
      }
    }, 500)

    const handleCancel = (): void => {
      if (currentStep.value === 1){
        allFormItemData = formItemRefs.value.map(item => item.getFormData())
        currentStep.value --
        return
      }
      showModal.value = false
      currentStep.value = 0
      files.value = []
    }

    const formItemDoms = (): JSX.Element[] => {
      formItemRefs.value = []
      return files.value.map((item: OSSFile, index: number) => {
        const itemData = allFormItemData.find(i => i.fileIds.includes(item.id)) ?? {
          name: item.name,
          typeId: '',
          deptId: null,
          productId: null,
          fileIds: [item.id],
        }
        return <DocumentUploadItem formData={itemData} ref={(el) => {
          if (el) {
            // @ts-ignore
            formItemRefs.value[index] = el;
          }
        }} />
      })
    }

    return (): JSX.Element =>
      <>
        <Modal
          width='80%'
          visible={showModal.value}
          title='批量上传'
          onOk={currentStep.value === 0
            ? handelFile
            : currentStep.value === 1 ? handleUpload : handleCancel}
          onCancel={handleCancel}
          confirmLoading={loading.value}
          okText={currentStep.value === 2 ? '确定' : '下一步'}
          cancelText={currentStep.value === 1 ? '上一步' : '取消'}
        >
          <>
            <div class={Styles['step-form-title']}>
              <Steps current={currentStep.value} size='small' style='width:80%'>
                <Step title='添加文档' />
                <Step title='编辑文档' />
                <Step title='结果' />
              </Steps>
            </div>
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {
                currentStep.value === 0 &&
                <div class={Styles['step-form']}>
                  <FileUpload
                    ref={fileUploadRef}
                    showText={true}
                    value={files.value}
                    sceneCode={GLOBAL_SCENE_CODE.knowledgeDocument}
                    customText='支持jpg,png,svg,doc,docx,xls,xlsx,pptx,pdf格式,单个附件最大支持100MB'
                    typeList={['.jpg', '.png', '.svg', '.doc', '.docx', '.xls', '.xlsx', '.pptx', '.pdf']}
                    multiple
                    maxCount={20}
                    size={100}
                    type='picture'
                    dragger
                  />
                </div>
              }
              {
                currentStep.value === 1 &&
                <div class={Styles['step-form']} v-show={currentStep.value === 1}>
                  {
                    formItemDoms()
                  }
                </div>
              }
              {
                currentStep.value === 2 &&
                <div class={`${Styles['step-form']} importFeedback`}>
                  <div class='importFeedback_title' style={{ marginBottom: '15px', textAlign: 'center' }}>
                    <span>结果如下：</span>
                    <span>上传成功共计<span style={{ color: '#389e0d', margin: '0 3px', fontSize: '14px' }}>{uploadData.value.successCount}</span>条</span>
                    <span>上传失败共计<span style={{ color: '#cf1322', margin: '0 3px', fontSize: '14px' }}>{uploadData.value.errorCount}</span>条</span>
                  </div>
                  {
                    tableInfo.failTableData.length > 0 &&
                      <Table columns={tableInfo.failColumns} dataSource={tableInfo.failTableData} pagination={false} size='small' scrollY={500} />
                  }
                </div>
              }
            </div>
          </>

        </Modal>
      </>

  }
})