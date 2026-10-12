import { Button, Input, PopConfirm, PopOver, Table } from '@ghcloud/cube-ui'
import { defineComponent, ref, watch } from 'vue'
import { FileUpload, type OSSFile, ModalTable } from '@ghcloud/generic-component'
import { getCoursewarePage } from '@/api/courseware'
import { fileDownLoad } from '@/hook/file-download'
import { calcMediaTime, videoType, audioType, formatTime } from '@/utils/index'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
interface Props {
  title: string;
  readonly: boolean;
  value: unknown[];
}
export const CourseWarePickerTable = defineComponent({
  props: ['title', 'readonly', 'value'],
  emits: ['update:value'],
  setup (props: Props, { emit }) {
    const fileUploadRef = ref<{ triggerUpload: () => void;clearAll: () => void; }>()
    const triggerUpload = (): void => {
      fileUploadRef.value?.clearAll()
      fileUploadRef.value?.triggerUpload()
    }
    const uploadLoading = ref(false)
    const modalVisible = ref(false)
    const openModal = (): void => {
      modalVisible.value = true
    }
    const search = ref(
      [
        { label: '', key: 'keyword', component: Input, componentProps: { placeholder: '请输入课件名称' } }
      ]
    )
    const columns = [
      {
        title: '序号',
        width: 70,
        align: 'center',
        customRender: ({ index }: { index: number; }): string => `${index + 1}`
      },
      {
        title: '附件名称',
        dataIndex: 'file',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: { name: string; path: string; }; }): JSX.Element => {
          const fileName = text.name
          const filePath = text.path
          return (
            <PopOver content={fileName}>
              <Button type='link' onClick={async () => fileDownLoad(fileName, filePath)} style={{ maxWidth: '100%' }}>
                <span style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fileName}</span>
              </Button>
            </PopOver>
          )
        }
      },
      {
        title: '附件大小',
        dataIndex: 'file',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: { size: number; }; }): JSX.Element => {
          const fileSize = (text.size / 1024).toFixed(2)
          return <PopOver content={fileSize.toString()}>{fileSize}KB</PopOver>
        }
      },
      {
        title: '文件时长',
        dataIndex: 'file',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: { duration: number; }; }): JSX.Element => {
          const duration = text.duration ? formatTime(text.duration) : '--'
          return <PopOver content={duration}>{duration}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        customRender: ({ index }: { index: number; }): JSX.Element => {
          return (
            <>
              <PopConfirm title='确认移除该项？' onConfirm={() => {
                delRow(index)
              }}>
                <Button type='link' size='small' danger>移除</Button>
              </PopConfirm>
            </>
          )
        }
      }
    ]
    if (props.readonly) {
      columns.pop()
    }
    const modalColumns = [
      {
        title: '课件名称',
        dataIndex: 'name',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '课件主题',
        dataIndex: 'themeName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '附件',
        dataIndex: 'file',
        ellipsis: true,
        customRender: ({ text }: { text: { name: string; path: string; }; }): JSX.Element | string => {
          if (!text) {
            return '--'
          }
          const fileName = text.name
          const filePath = text.path
          return (
            <PopOver content={fileName}>
              <Button type='link' onClick={async () => fileDownLoad(fileName, filePath)} style={{ maxWidth: '100%' }}>
                <span style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fileName}</span>
              </Button>
            </PopOver>
          )
        }
      },
      {
        title: '附件大小',
        dataIndex: 'file',
        ellipsis: true,
        customRender: ({ text }: { text: { size: number; }; }): JSX.Element | string => {
          if (!text) {
            return '--'
          }
          const fileSize = (text.size / 1024).toFixed(2)
          return <PopOver content={fileSize.toString()}>{fileSize}KB</PopOver>
        }
      },
      {
        title: '附件时长',
        dataIndex: 'duration',
        ellipsis: true,
        customRender: ({ text }: { text: number; }): JSX.Element | string => {
          if (!text) {
            return '--'
          }
          return <PopOver content={formatTime(text)}>{formatTime(text)}</PopOver>
        }
      },
    ]

    const selectModelValue = ref<string[]>([])

    const ok = (values: { duration: number; id: string;file: Record<string, string>; }[]): void => {
      const checkedFiles = values.map(item => {
        return {
          ...item,
          file: {
            ...item.file,
            duration: item.duration
          }
        }
      })
      files.value = [...files.value, ...checkedFiles]
      selectModelValue.value = values.map(e => {
        return e.id
      })
      modalVisible.value = false
    }
    const fileUploadSuccess = async (values: OSSFile[]): Promise<void> => {
      if (values.length === 0) {
        return
      }
      // 数据过滤
      const data: { file: { name: string; path: string; size: number; id: string;duration: number; }; }[] = []
      for (const value of values) {
        let duration = 0
        if (videoType.includes(value.type)) {
          duration = await calcMediaTime(value.path, 'video')
        }
        if (audioType.includes(value.type)) {
          duration = await calcMediaTime(value.path, 'audio')
        }
        const find = files.value.find(ele => {
          const element = ele as { file: { id: string; }; }
          return element.file.id === value.id
        })
        if (!find) {
          data.push({
            file: {
              name: value.name,
              path: value.path,
              size: value.size,
              id: value.id,
              duration
            },
          })
        }
      }
      files.value = [...files.value, ...data]
      uploadLoading.value = false
    }
    const files = ref<unknown[]>(props.value ?? [])
    watch(() => files.value, () => {
      emit('update:value', files.value)
    }, { deep: true })
    watch(() => props.value, () => {
      files.value = props.value
    }, { deep: true })

    const delRow = (index: number): void => {
      files.value.splice(index, 1)
    }

    return (): JSX.Element => {
      const header = (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', marginBottom: '30px' }}>
          <span class='verticalLine primary-color-before'>{props.title ?? '人员'}</span>
          {
            !props.readonly &&
              <>
                <div>
                  <Button type='primary' shape='round' onClick={triggerUpload}>上传附件</Button>
                  <Button type='primary' shape='round' onClick={openModal} style={{ marginLeft: '10px' }}>调用</Button>
                </div>
                <div style={{ display: 'none' }}>
                  <FileUpload sceneCode={GLOBAL_SCENE_CODE.safetyEducationCourseWare} ref={fileUploadRef} onUpdate:value={fileUploadSuccess} multiple onStart={() => {
                    uploadLoading.value = true
                  }} onEnd={() => {
                    uploadLoading.value = false
                  }} />
                </div>
              </>
          }
        </div>
      )

      const body = <Table columns={columns} dataSource={files.value} pagination={false} size='small' loading={uploadLoading.value} scrollY={440} />

      return (
        <>
          {header}
          {body}
          <ModalTable
            v-model:show={modalVisible.value}
            columns={modalColumns}
            title='选择课件'
            search={search.value}
            apiFunction={getCoursewarePage}
            onOk={ok}
            multiple
            selectRowKeysValue={selectModelValue.value}
          />
        </>
      )
    }
  }
})
