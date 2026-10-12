import { Button, PopConfirm, PopOver, Table } from '@ghcloud/cube-ui'
import { defineComponent, ref, watch } from 'vue'
import { UserPickerInput } from '@ghcloud/generic-component'

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
    watch(() => users.value, () => {
      emit('update:value', users.value)
    }, { deep: true })
    watch(() => props.value, () => {
      users.value = props.value
    }, { deep: true })

    const delRow = (index: number): void => {
      users.value.splice(index, 1)
    }
    const columns = [
      {
        title: '序号',
        width: 70,
        align: 'center',
        customRender: ({ index }: { index: number; }): string => `${index + 1}`
      },
      {
        title: '名称',
        dataIndex: 'name',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '联系电话',
        dataIndex: 'mobile',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '部门',
        dataIndex: 'organizations',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: { name: string; }[]; }): JSX.Element | string => {
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
        title: '职位',
        dataIndex: 'positions',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: { name: string; }[]; }): JSX.Element | string => {
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
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', marginBottom: '30px' }}>
          <span class='verticalLine primary-color-before'>{props.title ?? '人员'}</span>
          {
            !props.readonly &&
              <>
                <Button type='primary' shape='round' onClick={openModal}>添加人员</Button>
                <div style={{ display: 'none' }}>
                  <UserPickerInput ref={userPickerInputRef} style={{ display: 'none' }} multiple v-model:value={users.value} />
                </div>
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
