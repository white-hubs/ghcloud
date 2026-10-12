import { leaveRulesPage } from '@/api/staff-leave'
import { Button, Input, PopConfirm, PopOver, Table } from '@ghcloud/cube-ui'
import { ModalTable } from '@ghcloud/generic-component'
import { computed, defineComponent, onMounted, ref, type VNode } from 'vue'

interface Props {
  value: { id: string;name: string; content: string[]; }[];
  readonly: boolean;
}

/** 请假规则选择 */
export const LeaveRulesSelect = defineComponent({
  props: ['value', 'readonly'],
  emits: ['update:value'],
  setup: (props: Props, { emit }) => {
    const selectModelValue = ref<string[]>([])
    const selectValue = ref<{ id: string; name: string; }[]>([])
    const modalVisible = ref(false)
    const search = ref(
      [
        { label: '', key: 'name', component: Input, componentProps: { placeholder: '请输入规则名称' } }
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
        title: '规则内容',
        dataIndex: 'leaveTimeUnit',
        ellipsis: true,
        align: 'center',
        customRender: ({ record }: { record: { notLimit: boolean;minAskUnit: number;calculationWay: string; }; }): VNode => {
          const res = (
            <>
              <span>最小请假单位：按{record.minAskUnit}小时请假</span><br />
              <span>请假时长计算方式：{record.calculationWay === 'WORKING_DAY' ? '按工作日计算时长' : '按自然日计算时长'}</span><br />
              <span>假期额度：{record.notLimit ? '不限额' : '限额'}</span>
            </>
          )
          return <PopOver content={res as unknown as string}>{res}</PopOver>
        }
      },
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
          return e
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
            !props.readonly && <Button type='primary' shape='round' onClick={openModal}>选择请假规则</Button>
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
            title='选择请假规则'
            search={search.value}
            apiFunction={leaveRulesPage}
            onOk={ok}
            multiple
            selectRowKeysValue={selectModelValue.value}
            selectRowValue={selectValue.value}
            searchParams={{ enabled: true }}
          />
        </>
      )
    }
  }
})
