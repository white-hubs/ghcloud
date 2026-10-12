import { classesPageWithDept } from '@/api/classes-manage'
import { Input, PopOver } from '@ghcloud/cube-ui'
import { DeptTreeSelect, ModalTable } from '@ghcloud/generic-component'
import { defineComponent, onMounted, ref, type VNode } from 'vue'

interface Props {
  value: { id: string; name: string; nickName: string; }[];
  groupId?: string;
}

export const ClassesSelectModal = defineComponent({
  props: ['value', 'groupId'],
  emits: ['update:value'],
  setup (props: Props, { emit, expose }) {
    const modalVisible = ref(false)
    const openModal = (data: { id: string; name: string; nickName: string; }[]): void => {
      const value = data ?? (props.value ?? [])
      modalVisible.value = true
      selectModelValue.value = value.map(e => {
        return e.id
      })
      selectValue.value = value
    }

    const search = ref(
      [
        { label: '', key: 'name', component: Input, componentProps: { placeholder: '请输入班次名称' } },
        { label: '应用范围', key: 'deptId', component: DeptTreeSelect, componentProps: { placeholder: '请选择', fieldNames: { label: 'name', value: 'id', children: 'children' }, style: { width: '180px' } } },
      ]
    )
    const columns = [
      {
        title: '名称',
        align: 'center',
        dataIndex: 'name',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '简称',
        align: 'center',
        dataIndex: 'nickName',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '建议应用范围',
        align: 'center',
        dataIndex: 'deptNames',
        width: 350,
        customRender: ({ text }: { text: string; }): VNode => {
          return (
            <PopOver content={text || '--'}>
              <p style='margin:0 auto;width:300px;white-space: nowrap;max-width: 100%;overflow: hidden;text-overflow: ellipsis;'>
                {text || '--'}
              </p>
            </PopOver>
          )
        }
      },
    ]

    const selectModelValue = ref<string[]>([])
    const selectValue = ref<{ id: string; name: string;nickName: string; }[]>([])

    const ok = (values: { id: string; name: string;nickName: string; }[]): void => {
      selectModelValue.value = values.map(e => {
        return e.id
      })
      selectValue.value = values
      modalVisible.value = false
      emit('update:value', selectValue.value)
    }

    onMounted(() => {
      if (props.value) {
        selectModelValue.value = props.value.map(e => {
          return e.id
        })
        selectValue.value = props.value
      }
    })

    expose({
      openModal
    })

    return (): VNode =>
      <>
        <ModalTable
          v-model:show={modalVisible.value}
          columns={columns}
          title='班次选择'
          search={search.value}
          multiple
          apiFunction={classesPageWithDept}
          onOk={ok}
          selectRowKeysValue={selectModelValue.value}
          selectRowValue={selectValue.value}
          searchParams={{ deptWhere: true, groupId: props.groupId }}
        />
      </>
  }
})
