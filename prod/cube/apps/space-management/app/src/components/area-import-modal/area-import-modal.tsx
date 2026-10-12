import { Button, Modal, PopOver, Step, Table, message } from '@ghcloud/cube-ui'
import type { ColumnType } from '@ghcloud/cube-ui/node_modules/ant-design-vue/es/table'
import { defineComponent, reactive, ref } from 'vue'
import Steps from '@ghcloud/cube-ui/src/components/steps'
import Styles from './area-import-modal.module.less'
import { FileUpload } from '@ghcloud/cube-app-design'
import { cubeMdataService } from '@/api/service'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import type { OSSFile } from '@ghcloud/generic-component'

export const AreaImportModal = defineComponent({
  emits: ['enter'],
  setup (props, { emit, expose }) {
    const tableInfo = reactive<{ failColumns: ColumnType[];failTableData: { details: string; }[]; }>({
      failColumns: [
        {
          title: '导入详情',
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
    const showImportModal = ref(false)
    const importLoading = ref(false)
    const areaExcel = ref<OSSFile | null>()
    const importData = reactive({
      success: 0,
      fail: 0
    })
    const openModal = (): void => {
      showImportModal.value = true
      currentStep.value = 0
      areaExcel.value = null
    }
    expose({
      openModal
    })
    const handelImport = async (): Promise<void> => {
      if (!areaExcel.value){
        message.warn("请先上传文件");
        return
      }
      importLoading.value = true
      try {
        const params = {
          file: areaExcel.value as unknown as Blob | null,
        }
        const res = await cubeMdataService.importSpace(params)
        if (res){
          currentStep.value ++
          Object.assign(importData, res)
          tableInfo.failTableData = []
          tableInfo.failTableData = (res as { errorMsg: string[]; })?.errorMsg?.map(item => {
            return {
              details: item
            }
          })
        }
      } catch {
      } finally {
        importLoading.value = false
      }
    }
    const handleEnter = (): void => {
      showImportModal.value = false
      currentStep.value = 0
      areaExcel.value = null
      emit('enter')
    }
    const handleCancel = (): void => {
      showImportModal.value = false
      currentStep.value = 0
      areaExcel.value = null
    }

    const downloadTemplate = async (): Promise<void> => {
      const res = await cubeMdataService.exportAreaSpaceTemplate()
      if (res) {
        const link = document.createElement('a')
        const blob = new Blob([res as BlobPart], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        link.style.display = 'none'
        link.href = URL.createObjectURL(blob)
        link.setAttribute('download', '空间模版.xlsx')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }

    const currentStep = ref(0)

    const modalSlots = {
      'footer': (): JSX.Element => {
        return (
          <div>
            <Button onClick={()=> {
              showImportModal.value = false
            }}>取消</Button>
            {currentStep.value === 0 ?
              <Button type='primary' onClick={handelImport}>下一步</Button>
              :
              <Button type='primary' loading={importLoading.value} onClick={handleEnter} >确定</Button>
            }
          </div>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <Modal
          visible={showImportModal.value}
          title='导入空间数据'
          v-slots={modalSlots}
          confirmLoading={importLoading.value}
          onCancel={handleCancel}
        >
          <>
            <div class={Styles['step-form-title']}>
              <Steps current={currentStep.value} size='small' style='width:80%'>
                <Step title='上传数据' />
                <Step title='导入结果' />
              </Steps>
            </div>
            {
              currentStep.value === 0 &&
                <div class={Styles['step-form']}>
                  <p style='margin:10px 0;'>
                    下载
                    <Button type='link' style='padding:0;margin:0;' onClick={downloadTemplate}>区域模版</Button>
                    ，按格式完善模版中的信息后，点击下方选择进行上传。
                  </p>
                  <FileUpload
                    sceneCode={GLOBAL_SCENE_CODE.spaceList}
                    multiple
                    customUpload
                    onFile={(file) => {
                      areaExcel.value = file
                    }}
                    maxCount={1}
                    customText='支持上传（.xls/.xlsx）文件,最大为300MB'
                    typeList={['.xlsx', '.xls']} />
                </div>
            }
            {
              currentStep.value === 1 &&
                <div class={Styles['step-form']}>
                  <div class={Styles['importFeedback_title']} style={{ marginBottom: '15px', textAlign: 'center' }}>
                    <span>导入结果如下：</span>
                    <span>导入成功共计<span style={{ color: '#389e0d', margin: '0 3px', fontSize: '14px' }}>{importData.success}</span>条，失败<span style={{ fontSize: '14px', color: '#cf1322', margin: '0 3px' }}>{importData.fail}</span>条</span>
                  </div>
                  {
                    tableInfo.failTableData.length > 0 &&
                      <Table columns={tableInfo.failColumns} dataSource={tableInfo.failTableData} pagination={false} size='small' scrollY={300} />
                  }
                </div>
            }
          </>

        </Modal>
      </>
  }
})
