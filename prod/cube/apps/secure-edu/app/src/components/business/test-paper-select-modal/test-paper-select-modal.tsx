import { Button, Input, PopOver, Select } from '@ghcloud/cube-ui'
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { ModalTable } from '@ghcloud/generic-component'
import { getExamPaperPage } from '@/api/exam-paper'

interface Props {
  value: { id: string; name: string; }[];
}

export const TestPaperSelectModal = defineComponent({
  props: ['value'],
  emits: ['update:value'],
  setup (props: Props, { emit }) {
    const modalVisible = ref(false)
    const openModal = (): void => {
      modalVisible.value = true
    }

    const search = ref(
      [
        { label: '', key: 'keyword', component: Input, componentProps: { placeholder: '请输入试卷名称' } }
      ]
    )
    const columns = [
      {
        title: '试卷名称',
        dataIndex: 'name',
        width: 250,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '试卷总分',
        dataIndex: 'score',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '及格分数',
        dataIndex: 'passingGradeScore',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '试题数',
        dataIndex: 'examPaperQuestionNumber',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '试卷说明',
        dataIndex: 'remark',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
    ]

    const selectModelValue = ref<string[]>([])
    const selectValue = ref<{ id: string; name: string; }[]>([])
    const selectOptions = computed(() => {
      return selectValue.value.map(e => {
        return { label: e.name, value: e.id }
      })
    })
    const ok = (values: { id: string; name: string; }[]): void => {
      selectValue.value = values
      selectModelValue.value = values.map(e => {
        return e.id
      })
      modalVisible.value = false
    }
    watch(() => selectModelValue.value, () => {
      const res = selectValue.value.filter(e => selectModelValue.value.find(ele => e.id === ele))
      selectValue.value = res
      emit('update:value', res)
    }, { deep: true })

    onMounted(() => {
      if (props.value && props.value.length) {
        selectValue.value = props.value
        selectModelValue.value = props.value.map(e => {
          return e.id
        })
      }
    })

    return (): JSX.Element =>
      <>
        <div style={{ display: 'flex' }}>
          <Select placeholder='请选择' open={false} showArrow={false} options={selectOptions.value} v-model:value={selectModelValue.value} allowClear={false} mode='multiple' />
          <Button type='primary' onClick={openModal}>选择试卷</Button>
        </div>
        <ModalTable
          v-model:show={modalVisible.value}
          columns={columns}
          title='选择试卷'
          search={search.value}
          apiFunction={getExamPaperPage}
          onOk={ok}
          multiple
          selectRowValue={selectValue.value}
          selectRowKeysValue={selectModelValue.value}
        />
      </>
  }
})
