import { overtimeRulesPage } from '@/api/staff-overtime'
import { Button, Input, PopConfirm, PopOver, Table } from '@ghcloud/cube-ui'
import { ModalTable } from '@ghcloud/generic-component'
import { computed, defineComponent, onMounted, ref, type VNode } from 'vue'

interface Props {
  value: { id: string;name: string; content: string[]; }[];
  readonly: boolean;
}

/** 加班规则选择 */
export const OverTimeRulesSelect = defineComponent({
  props: ['value', 'readonly'],
  emits: ['update:value'],
  setup: (props: Props, { emit }) => {
    const selectModelValue = ref<string[]>([])
    const selectValue = ref<{ id: string; name: string; }[]>([])
    const modalVisible = ref(false)
    const search = ref(
      [
        { label: '', key: 'keyword', component: Input, componentProps: { placeholder: '请输入规则名称' } }
      ]
    )
    const delRow = (index: number): void => {
      selectValue.value.splice(index, 1)
      selectModelValue.value = selectValue.value.map(e => {
        return e.id
      })
      emit('update:value', selectValue.value)
    }
    const columns = [
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
        title: '加班规则',
        dataIndex: 'content',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string[]; }): VNode => {
          const content = text && text.length > 0
            ? text.map(item => {
              return <div key={item}>{item}</div>
            })
            : '--'
          return <PopOver content={content as string}>{content || '--'}</PopOver>
        }
      }
    ]
    const tableColumns = computed(() => {
      const action = props.readonly
        ? []
        : [{
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
        }]
      return [...columns, ...action]
    })

    const ok = (values: { id: string; name: string; }[]): void => {
      selectValue.value = values
      selectModelValue.value = values.map(e => {
        return e.id
      })
      modalVisible.value = false
      emit('update:value', selectValue.value)
    }

    const openModal = (): void => {
      modalVisible.value = true
    }

    onMounted(() => {
      if (props.value?.length) {
        selectValue.value = props.value.map(e => {
          return {
            id: e.id,
            name: e.name,
            content: e.content,
          }
        })
        selectModelValue.value = selectValue.value.map(e => {
          return e.id
        })
      }
    })

    return (): VNode => {
      const header = (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          {
            !props.readonly && <Button type='primary' shape='round' onClick={openModal}>选择加班规则</Button>
          }
        </div>
      )

      const body = <Table columns={tableColumns.value} dataSource={selectValue.value} pagination={false} size='small' scrollY={440} />

      return (
        <>
          {header}
          {body}
          <ModalTable
            v-model:show={modalVisible.value}
            columns={columns}
            title='选择加班规则'
            search={search.value}
            apiFunction={overtimeRulesPage}
            onOk={ok}
            selectRowKeysValue={selectModelValue.value}
            selectRowValue={selectValue.value}
            searchParams={{ enabled: true }}
          />
        </>
      )
    }
  }
})
