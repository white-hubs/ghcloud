import { Button, PopConfirm, PopOver, Table } from '@ghcloud/cube-ui'
import { defineComponent, ref, type VNode } from 'vue'
import { UserPickerModal } from '@ghcloud/generic-component'

interface Props {
  title: string;
  readonly: boolean;
  value: unknown[];
}

export const UserPickerTable = defineComponent({
  props: ['title', 'readonly', 'value'],
  emits: ['update:value'],
  setup (props: Props, { emit }) {
    const userPickerInputRef = ref<{ openModal: () => void; }>()
    const openModal = (): void => {
      userPickerInputRef.value?.openModal()
    }
    const users = ref<unknown[]>(props.value ?? [])
    const onUpdateValue = (data: unknown[]): void => {
      users.value = data
      emit('update:value', users.value)
    }

    const delRow = (index: number): void => {
      users.value.splice(index, 1)
      emit('update:value', users.value)
    }
    const columns = [
      {
        title: '序号',
        width: 70,
        align: 'center',
        customRender: ({ index }: { index: number; }): VNode => `${index + 1}`
      },
      {
        title: '名称',
        dataIndex: 'name',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '联系电话',
        dataIndex: 'mobile',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '部门',
        dataIndex: 'organizations',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: { name: string; }[]; }): VNode => {
          const data = text?.map((item) => item.name)
          if (data.length) {
            return (
              <PopOver content={data.join('/') || '--'}>{data.join('/') || '--'}</PopOver>
            )
          } else {
            return '--'
          }
        },
      },
      {
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        customRender: ({ index }: { index: number; }): VNode => {
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

    return (): VNode => {
      const header = (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          {
            !props.readonly &&
              <>
                <Button type='primary' shape='round' onClick={openModal}>添加人员</Button>
                <UserPickerModal
                  ref={userPickerInputRef}
                  value={users.value}
                  onUpdate:value={onUpdateValue}
                  multiple
                />
              </>
          }
        </div>
      )

      const body = <Table columns={columns} dataSource={users.value} pagination={false} size='small' scrollY={440} />

      return (
        <>
          {header}
          {body}
        </>
      )
    }
  }
})
