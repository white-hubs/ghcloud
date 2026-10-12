import { Button, PopConfirm, PopOver, Table } from '@ghcloud/cube-ui'
import { defineComponent, ref, watch } from 'vue'
import { BindCustomTagModal } from './bind-custom-tag-modal'
import type { DeviceTagDetail } from '@ghcloud/cube-iot-center-service'

interface Props {
  title: string;
  readonly: boolean;
  value: DeviceTagDetail[];
}

export const BindTagTable = defineComponent({
  props: ['title', 'readonly', 'value'],
  emits: ['update:value', 'change'],
  setup (props: Props, { emit }) {
    const tagModalRef = ref<{ openModal: () => void; }>()
    const tagList = ref<DeviceTagDetail[]>(props.value ?? [])
    watch(() => props.value, (val) => {
      tagList.value = val
    }, { immediate: true, deep: true })
    const handleTagModal = (data: DeviceTagDetail[]): void => {
      tagList.value = data
      emit('update:value', tagList.value)
      emit('change', tagList.value)
    }
    const delRow = (index: number): void => {
      tagList.value.splice(index, 1)
      emit('update:value', tagList.value)
      emit('change', tagList.value)
    }
    const columns = [
      {
        title: '序号',
        width: 70,
        align: 'center',
        customRender: ({ index }: { index: number; }): string=> `${index + 1}`
      },
      {
        title: '标签名称',
        dataIndex: 'tagName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '标签描述',
        dataIndex: 'description',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
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

    return (): JSX.Element => {
      const header = (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          {
            !props.readonly &&
              <>
                <Button type='primary' shape='round' onClick={() => tagModalRef.value?.openModal()}>关联标签</Button>
                <BindCustomTagModal
                  ref={tagModalRef}
                  value={[...tagList.value]}
                  onOk={handleTagModal}
                  multiple
                  isHistory
                />
              </>
          }
        </div>
      )

      const body = <Table columns={columns} dataSource={tagList.value} pagination={false} size='small' scrollY={400} />

      return (
        <>
          {header}
          {body}
        </>
      )
    }
  }
})
