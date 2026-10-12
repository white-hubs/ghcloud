import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { Button, Field, Form, Icon, Tag, showNotify, type FormInstance, type UploaderFileListItem } from 'vant'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import styles from './handover-form.module.less'
import { useGlobalRouter } from '@/hook/use-global-router'
import { storeTodo } from '@/store/todo'
import { Signature } from '@/components/signature/signature'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import { showImagePreview, kkFilePreview, type FileState } from '@ghcloud/cube-utils'
import { WorkTaskStatus, dataUrlToFile, typeList } from '@/utils'
const WORK_CENTER_IMG = '/resource/v1/work-center/images'
const iconDOC = `${WORK_CENTER_IMG}/icon-doc.png`
const iconPPT = `${WORK_CENTER_IMG}/icon-ppt.png`
const iconPDF = `${WORK_CENTER_IMG}/icon-pdf.png`
const iconTXT = `${WORK_CENTER_IMG}/icon-txt.png`
import type { HandoverFormState } from '@/types/todo-type'
import { cubeFileService, cubeWorkCenterService } from '@/api/server'
import { applicationBackgroundColor, applicationTextColor } from '@/utils/types'

const parseViteBool = (raw: string | undefined): boolean => {
  if (raw === undefined || raw === '') {
    return false
  }
  const v = raw.trim().toLowerCase()
  return v === 'true' || v === '1' || v === 'yes' || v === 'on'
}

/** 必须直接访问 import.meta.env.VITE_*，否则 Vite 不会注入该变量 */
const handoverExtendEnabled = parseViteBool(import.meta.env.VITE_HANDOVER_EXTEND_ENABLED)
const HANDOVER_EXTEND_SECTIONS = [
  { field: 'attInfo1' as const, fileField: 'file1' as const, label: '整理内务，填报记录' },
  { field: 'attInfo2' as const, fileField: 'file2' as const, label: '检查设备（含岗亭道闸）数量和状态，寻找遗失物品、登记损坏情况' },
  { field: 'attInfo3' as const, fileField: 'file3' as const, label: '集体学习、总结' },
  { field: 'attInfo4' as const, fileField: 'file4' as const, label: '岗位和任务安排，交接需跟进的工作事项' },
]
const normalizeFileIds = (files: FileState[] | undefined): string[] => {
  return files
    ?.map((item) => item.id)
    .filter((id): id is string => typeof id === 'string' && id.trim() !== '') ?? []
}

// 交班
export const HandoverForm = defineComponent({
  name: 'HandoverForm',
  setup () {
    const { router, route } = useGlobalRouter()
    const todoStore = storeTodo()
    const formRef = ref<FormInstance>()
    const state = reactive<HandoverFormState>({
      signature: '',
      loading: false,
      formState: {
        remarks: '',
        users: '',
        userNames: [],
        fileList: [],
        attInfo1: '',
        file1: [],
        attInfo2: '',
        file2: [],
        attInfo3: '',
        file3: [],
        attInfo4: '',
        file4: [],
        userList: [],
        items: [],
        shiftSignFileId: '',
      },
    })
    const onConfirm = async () => {
      if (!state.formState.userList?.length) {
        showNotify({ type: 'warning', message: '请选择接班人' })
        return
      }
      signatureRef.value?.openDialog()
    }
    const clickUser = (): void => {
      todoStore.checkUsers = state.formState?.userList
      todoStore.handoverForm = {...state}
      router.push({ path: '/person-page', query: { title: '选择接班人' } })
    }
    const clickItems = () => {
      todoStore.checkItems = state.formState.items
      todoStore.handoverForm = {...state}
      router.push({ path: '/handover-items' })
    }
    const removeItem = (index: number) => {
      state.formState.items.splice(index, 1)
    }
    const signatureRef = ref<{openDialog: () => void; closeDialog: () => void;}>()
    // 签名
    const onSignatureConfirm = async (signature: string): Promise<void> => {
      if (signature) {
        state.signature = signature
        signatureRef.value?.closeDialog()
        await uploadSingature()
        await handleSubmit()
      } else {
        signatureRef.value?.openDialog()
      }
    }
    const handleSubmit = async (): Promise<void> => {
      try {
        state.loading = true
        const params = {
          takeOverUser: state.formState.userList[0].id ?? '',
          handoverTaskList: state.formState.items.map(item => item.id || '') ?? [],
          fileIds: state.formState.fileList.map(item => item.id || '') ?? [],
          remarks: state.formState.remarks ?? '',
          shiftSignFileId: state.formState.shiftSignFileId,
          ...(handoverExtendEnabled
            ? {
              extend: {
                attInfo1: state.formState.attInfo1 ?? '',
                file1: normalizeFileIds(state.formState.file1),
                attInfo2: state.formState.attInfo2 ?? '',
                file2: normalizeFileIds(state.formState.file2),
                attInfo3: state.formState.attInfo3 ?? '',
                file3: normalizeFileIds(state.formState.file3),
                attInfo4: state.formState.attInfo4 ?? '',
                file4: normalizeFileIds(state.formState.file4),
              }
            }
            : {}),
        }
        await cubeWorkCenterService.handoverAdd(params)
        // showNotify({ type: 'success', message: '交班成功' })
        setTimeout(() => {
          todoStore.checkItems = []
          todoStore.checkUsers = []
          // router.back()
          router.push({ path: '/work-result', query: { status: 'success', message: `已成功移交给${state.formState.userNames}` }})
        }, 1 * 1000)
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      } finally {
        setTimeout(() => {
          state.loading = false
        }, 800)
      }
    }
    const uploadSingature = async (): Promise<void> => { 
      try {
        let fileObj = dataUrlToFile(state.signature, "sign-" + new Date().valueOf() + ".png");
        const res = await cubeFileService.uploadFile({
          file: fileObj,
          businessKey: 'maintain',
          sceneCode: GLOBAL_SCENE_CODE.workCenter
        })
        if (res) {
          state.formState.shiftSignFileId = res.id
        }
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      }
    }
    const onSignatureCancel = () => {
      state.signature = ''
      signatureRef.value?.closeDialog()
    }
    onMounted(() => {
      const from = router.options.history.state.forward || ''
      if (!from || (from as string)?.includes('work-handover')) {
        todoStore.checkItems = []
        todoStore.checkUsers = []
        todoStore.handoverForm = undefined
        state.formState = {
          remarks: '',
          users: '',
          userNames: [],
          fileList: [],
          attInfo1: '',
          file1: [],
          attInfo2: '',
          file2: [],
          attInfo3: '',
          file3: [],
          attInfo4: '',
          file4: [],
          userList: [],
          items: [],
          shiftSignFileId: '',
        }
        return
      }
      const { checkItems, checkUsers, handoverForm } = todoStore
      if (handoverForm) {
        Object.assign(state, handoverForm)
        state.formState.fileList = handoverForm?.formState?.fileList ?? []
      }
      if (checkItems) {
        state.formState.items = checkItems.map(item => {
          return {
            ...item,
          }
        })
      }
      if (checkUsers) {
        state.formState.userNames = checkUsers?.map(i=> (i as { name: string; }).name) ?? []
        state.formState.userList = checkUsers.map(item => {
          return {
            ...item
          }
        })
      }
    })

    const fileMaxCount = 5
    const filedUploadSlots = {
      input: (): JSX.Element => renderUploadSection(state.formState.fileList, 'fileList')
    }

    const handleUploadImage = async (fileKey: 'fileList' | 'file1' | 'file2' | 'file3' | 'file4'): Promise<void> => {
      try {
        const currentList = state.formState[fileKey] ?? []
        const result = await cubeAppService.uploadFile(String(fileMaxCount - currentList.length), {
          sceneCode: GLOBAL_SCENE_CODE.workCenter
        })
        state.formState[fileKey] = [...currentList, ...result]
      } catch {}
    }

    const deleteFile = (id: string, fileKey: 'fileList' | 'file1' | 'file2' | 'file3' | 'file4'): void => {
      const currentList = state.formState[fileKey] ?? []
      state.formState[fileKey] = currentList.filter(item => item.id !== id)
    }

    const handlePreview = (index: number, fileKey: 'fileList' | 'file1' | 'file2' | 'file3' | 'file4'): void => {
      const currentList = state.formState[fileKey] ?? []
      const item = currentList[index]
      if (!item) {
        return
      }
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

    const renderUploadSection = (fileList: FileState[], fileKey: 'fileList' | 'file1' | 'file2' | 'file3' | 'file4'): JSX.Element => {
      return (
        <div>
          <div class={styles.uploadedList}>
            {
              fileList.map((item, index) => {
                return (
                  <div class={styles.uploaded} key={item.id ?? ''} onClick={() => {
                    handlePreview(index, fileKey)
                  }}>
                    <img src={item.path ?? ''} v-show={type.value(item.type ?? '') === 'img'} alt='' width={60} height={60} />
                    <img src={getFileIcon.value(item.type ?? '')} v-show={type.value(item.type ?? '') !== 'img'} />
                    <Icon
                      name='clear' size='20px' color='#000'
                      onClick={(e: Event) => {
                        e.stopPropagation()
                        deleteFile(item.id ?? '', fileKey)
                      }}
                    />
                  </div>
                )
              })
            }
            {fileList.length < fileMaxCount &&
              <div class={styles.upload} onClick={() => {
                handleUploadImage(fileKey)
              }}>
                <Icon name='plus' size='30px' color='#d9d9d9' />
              </div>}
          </div>
          <div class={styles.uploadDesc}>
            <div>支持上传jpg,png,svg,docx,xlsx,pptx,pdf格式，最多支持100mb</div>
          </div>
        </div>
      )
    }
    return () => (
      <div class={styles.container}>
        <CubeNavBar title='交班' showBack />
        <div class={styles.form}>
          <Form ref={formRef} required='auto'>
            <Field
              v-model={state.formState.userNames}
              label='接班人'
              isLink
              placeholder='点击选择接班人'
              rules={[{ required: true, message: '请选择接班人' }]}
              readonly
              onClick={() => {
                clickUser()
              }}
            />
            <Field
              label='交接事项'
              isLink
              placeholder='点击选择交接事项'
              readonly
              onClick={() => {
                clickItems()
              }}
              v-slots={{
                'input': () => (
                  <div class={styles.itemCount}>{state.formState.items.length > 0 ? `已选择${state.formState.items.length}项` : ''}</div>
                )
              }}
            />
            {state.formState.items.length > 0 && (
              <div class={[styles.selectedItems, 'van-hairline--bottom']}>
                {state.formState.items.map((item, index) => (
                  <div key={item.id} class={styles.selectedItem}>
                    <div class={styles.itemInfo}>
                      <p class={styles.itemName}>{item.taskName}</p>
                      <div class={styles.itemTags}>
                        <div class={styles['status-level']}>
                          <Tag
                            color={applicationBackgroundColor.get(item?.applicationCode || '') ?? '#1578FF19'}
                            text-color={applicationTextColor.get(item?.applicationCode || '') ?? '#1578FF'}
                            size='medium'
                          >
                            {item?.applicationName}
                          </Tag>
                        </div>
                        {/* <span class={[styles.tag, item.status]}>{WorkTaskStatus.find(e => e.value === item.status)?.label ?? '--'}</span> */}
                      </div>
                    </div>
                    <span class={styles.removeItem} onClick={() => removeItem(index)}>×</span>
                  </div>
                ))}
              </div>
            )}
            <Field
              v-model={state.formState.remarks}
              rows='4'
              label='其他事项或问题'
              autosize
              label-align='top'
              placeholder='请输入'
              type='textarea'
              maxlength='200'
            />
            <Field label='上传附件' readonly />
            <Field v-slots={filedUploadSlots} readonly />
            {handoverExtendEnabled && (
              <div>
                {HANDOVER_EXTEND_SECTIONS.map((item) => (
                  <div key={item.field}>
                    <Field
                      v-model={state.formState[item.field as 'attInfo1' | 'attInfo2' | 'attInfo3' | 'attInfo4']}
                      rows='4'
                      label={item.label}
                      autosize
                      label-align='top'
                      placeholder='请输入'
                      type='textarea'
                      maxlength='200'
                    />
                    <Field label='上传附件' readonly />
                    <Field
                      v-slots={{
                        input: (): JSX.Element => renderUploadSection(
                          state.formState[item.fileField as 'file1' | 'file2' | 'file3' | 'file4'] ?? [],
                          item.fileField as 'file1' | 'file2' | 'file3' | 'file4'
                        )
                      }}
                      readonly
                    />
                  </div>
                ))}
              </div>
            )}
          </Form>
        </div>
        <div class={styles.footer}>
          <Button type='primary' block onClick={onConfirm} loading={state.loading}>
            确认交班
          </Button>
        </div>
        <Signature
          ref={signatureRef}
          onConfirm={onSignatureConfirm}
          onCancel={onSignatureCancel}
        />
      </div>
    )
  }
})