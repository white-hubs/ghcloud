import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { defineComponent, computed, ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import styles from './knowledge-document-edit.module.less'
import { Form, type FormInstance, Field, Icon, Button, showNotify } from 'vant'
import { showImagePreview, kkFilePreview, type FileState } from '@ghcloud/cube-utils'
import { typeList } from '@/utils'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
const KD_IMG = '/resource/v1/knowledge-document/images'
const iconDOC = `${KD_IMG}/icon-doc.png`
const iconPPT = `${KD_IMG}/icon-ppt.png`
const iconPDF = `${KD_IMG}/icon-pdf.png`
const iconTXT = `${KD_IMG}/icon-txt.png`
import { DepartmentCascader, ProductPicker } from '@ghcloud/cube-h5-design'
import { cubeKnowledgeDocumentService } from '@/api/server'
import { KnowledgeDocumentTypeSelect } from '@/components/knowledge-documet-type-select/knowledge-documet-type-select'

export const KnowledgeDocumentEdit = defineComponent({
  setup: () => {
    const router = useRouter()
    const route = useRoute()
    const formRef = ref<FormInstance>()
    const loading = ref(false)
    const showDocType = ref(false)
    const showProductPicker = ref(false)
    const showDeptSelect = ref(false)
    const formData = reactive<{
      id: string | null;
      name: string;
      typeId: string;
      deptId: string | null;
      productId: string | null;
      fileList: FileState[];
    }>({
      id: null,
      name: '',
      typeId: '',
      deptId: '',
      productId: '',
      fileList: []
    })
    const typeName = ref('')
    const productName = ref('')
    const deptName = ref('')

    const title = computed(() => {
      return route.query.id ? '编辑文档' : '新增文档'
    })

    const getBaseInfo = async (): Promise<void> => {
      try {
        const res = await cubeKnowledgeDocumentService.getKnowledgeDocumentDetails({ id: route.query.id as string })
        formData.id = res.id
        formData.name = res.name
        formData.typeId = res.typeId
        formData.deptId = res.deptId
        formData.productId = res.productId
        formData.fileList = res.fileList
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      }
    }

    const type = computed(() => {
      return (fileType: string): string=> {
        fileType = fileType.toLowerCase()
        if ('.png/.jpeg/.jpg/.gif/.webp'.includes(fileType)) {
          return 'img'
        }
        if ('mp4、avi、mkv'.includes(fileType)) {
          return 'video'
        }
        if ('.doc/.docx'.includes(fileType)) {
          return 'doc'
        }
        if ('.xls/.xlsx'.includes(fileType)) {
          return 'xls'
        }
        if ('.pptx/.ppt'.includes(fileType)) {
          return 'ppt'
        }
        if ('.pdf'.includes(fileType)) {
          return 'pdf'
        }
        if ('.txt'.includes(fileType)) {
          return 'txt'
        }
        return 'doc'
      }
    })

    const getFileIcon = computed(() => {
      return (fileType: string): string => {
        fileType = fileType.toLowerCase()
        if ('.doc/.docx'.includes(fileType)) {
          return iconDOC
        } else if ('.pdf'.includes(fileType)) {
          return iconPDF
        } else if ('.pptx/.ppt'.includes(fileType)) {
          return iconPPT
        } else if ('.txt'.includes(fileType)) {
          return iconTXT
        } else {
          return iconDOC
        }
      }
    })

    const fileMaxCount = 1
    const filedUploadSlots = {
      input: (): JSX.Element => {
        return (
          <div>
            <div class={styles.uploadedList}>
              {
                formData.fileList.map((item, index) => {
                  return (
                    <div class={styles.uploaded} key={item.id ?? ''} onClick={() => {
                      handlePreview(index)
                    }}>
                      <img src={item.path ?? ''} v-show={type.value(item.type ?? '') === 'img'} alt='' width={60} height={60} />
                      <img src={getFileIcon.value(item.type ?? '')} v-show={type.value(item.type ?? '') !== 'img'} />
                      <Icon
                        name='clear' size='20px' color='#000'
                        onClick={(e: Event) => {
                          e.stopPropagation()
                          deleteFile(item.id ?? '')
                        }}
                      />
                    </div>
                  )
                })
              }
              {formData.fileList.length < fileMaxCount &&
                <div class={styles.upload} onClick={handleUploadImage}>
                  <Icon name='plus' size='30px' color='#d9d9d9' />
                </div>}
            </div>
            <div style={{ marginTop: '6px' }}>
              <div>支持上传jpg,png,svg,docx,xlsx,pptx,pdf格式，最多支持100mb</div>
            </div>
          </div>
        )
      }
    }

    onMounted(async () => {
      route.query.id && await getBaseInfo()
    })

    const handleUploadImage = async (): Promise<void> => {
      try {
        const result = await cubeAppService.uploadFile(String(fileMaxCount - formData.fileList.length), {
          sceneCode: GLOBAL_SCENE_CODE.knowledgeDocument
        })
        formData.fileList = [...formData.fileList, ...result]
      } catch {}
    }

    const deleteFile = (id: string): void => {
      formData.fileList = formData.fileList.filter(item => item.id !== id)
    }

    const handlePreview = (index: number): void => {
      const item = formData.fileList[index]
      if (['zip', 'rar'].includes(item.type ?? '')) {
        showNotify({ type: 'warning', message: '暂不支持该文件类型的预览, 请到电脑端查看' })
        return
      }
      if (typeList.includes(item.type ?? '')) {
        kkFilePreview(item)
      } else {
        showImagePreview([item.path ?? ''], 0)
      }
    }

    const handleSubmit = async (): Promise<void> => {
      if (formData.fileList.length === 0) {
        showNotify({ type: 'warning', message: '请上传文件' })
        return
      }
      formRef.value?.validate().then(async () => {
        try {
          loading.value = true
          const params = {
            id: formData.id ?? '',
            name: formData.name,
            typeId: formData.typeId,
            deptId: formData.deptId,
            productId: formData.productId,
            fileIds: formData.fileList.map(f => f.id ?? ''),
          }
          route.query.id ? await cubeKnowledgeDocumentService.editKnowledgeDocument(params) : await cubeKnowledgeDocumentService.addKnowledgeDocument(params)
          showNotify({ type: 'success', message: '提交成功' })
          setTimeout(() => {
            router.back()
          }, 1000)
        } catch (error) {
          const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
          showNotify({ type: 'danger', message: errorMessage || '请求失败' })
        } finally {
          loading.value = false
        }
      })
    }

    return (): JSX.Element => {
      return (
        <div class={styles['knowledge-document-edit']}>
          <CubeNavBar title={title.value} showBack />
          <div class={styles.form}>
            <Form ref={formRef} label-width='100px'>
              <Field
                v-model={formData.name}
                rules={[{ required: true, message: '选输入文档名称' }]}
                label='文档名称'
                placeholder='请输入文档名称'
                required
                maxlength='20'
                show-word-limit
              />
              <Field
                v-model={typeName.value}
                rules={[{ required: true, message: '选选择文档类型' }]}
                label='文档类型'
                placeholder='请选择文档类型'
                readonly
                is-link
                required
                onClick={() => {
                  showDocType.value = true
                }}
              />
              <Field
                v-model={productName.value}
                label='关联产品'
                placeholder='请选择关联产品'
                readonly
                is-link
                onClick={() => {
                  showProductPicker.value = true
                }}
              />
              <Field
                v-model={deptName.value}
                label='所属部门'
                placeholder='请选择所属部门'
                readonly
                is-link
                onClick={() => {
                  showDeptSelect.value = true
                }}
              />
              <Field label='上传文件' required readonly />
              <Field v-slots={filedUploadSlots} readonly />
            </Form>
          </div>
          <div class='footer'>
            <Button block type='primary' loading={loading.value} onClick={handleSubmit}>保存</Button>
          </div>
          <KnowledgeDocumentTypeSelect
            show={showDocType.value}
            value={{ id: formData.typeId, name: typeName.value }}
            onClose={() => {
              showDocType.value = false
            }}
            onConfirm={(value: { id: string; name: string; }) => {
              formData.typeId = value.id
              typeName.value = value.name
              showDocType.value = false
            }}
          />
          <ProductPicker
            show={showProductPicker.value}
            value={{ value: formData.productId, text: productName.value }}
            onClose={() => {
              showProductPicker.value = false
            }}
            onConfirm={(value: { value: string; text: string; }) => {
              productName.value = value.text
              formData.productId = value.value
              showProductPicker.value = false
            }}
          />
          <DepartmentCascader
            show={showDeptSelect.value}
            value={{ id: formData.deptId, name: deptName.value }}
            onClose={() => {
              showDeptSelect.value = false
            }}
            onConfirm={(value: { id: string; name: string; }) => {
              formData.deptId = value.id
              deptName.value = value.name
              showDeptSelect.value = false
            }}
          />
        </div>
      )
    }
  }
})