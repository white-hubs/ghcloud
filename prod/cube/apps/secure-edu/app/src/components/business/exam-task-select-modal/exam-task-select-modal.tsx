import { Button, Input, PopOver, Select } from '@ghcloud/cube-ui'
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { ModalTable } from '@ghcloud/generic-component'
import { getExamTaskPage } from '@/api/exam-test'
import { ExamTaskStatus, type ExamTaskType, ExamTaskTypeOptions } from '@/types/exam-task'
import dayjs from 'dayjs'
import { useHeadMode } from '@/hook/use-head-mode'
import { cubeSecureEduHeadQuartersService } from '@/api/server'
import type { HeadQuartersCultivateTaskRecord, PageResult } from '@ghcloud/cube-secure-edu-service'

interface Props {
  value: unknown;
}

export const ExamTaskSelectModal = defineComponent({
  props: ['value'],
  emits: ['update:value'],
  setup (props: Props, { emit }) {
    const modalVisible = ref(false)
    const openModal = (): void => {
      modalVisible.value = true
    }
    const { isHeadMode } = useHeadMode()

    const search = ref(
      [
        { label: '考试类型', key: 'examTaskType', component: Select, componentProps: { options: ExamTaskTypeOptions, style: { width: '180px' } } },
        { label: '', key: 'keyword', component: Input, componentProps: { placeholder: '请输入考试主题' } }
      ]
    )
    const columns = [
      {
        title: '考试主题',
        dataIndex: 'themeName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '考试类型',
        align: 'center',
        dataIndex: 'examTaskType',
        width: 80,
        ellipsis: true,
        customRender: ({ text }: { text: ExamTaskType; }): JSX.Element => {
          const type = ExamTaskTypeOptions.find(e => e.value === text)?.label ?? '--'
          return <PopOver content={type}>{type}</PopOver>
        }
      },
      {
        title: '考试开始时间',
        dataIndex: 'examStartTime',
        ellipsis: true,
        customRender: ({ text }: { text: number; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '考试结束时间',
        dataIndex: 'examEndTime',
        ellipsis: true,
        customRender: ({ text }: { text: number; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '考试说明',
        dataIndex: 'remark',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '状态',
        align: 'center',
        width: 70,
        dataIndex: 'examTaskStatusName',
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
      emit('update:value', res.length > 0 ? res[0].id : '')
    }, { deep: true })

    onMounted(() => {
      if (props.value) {
        selectValue.value = [props.value as { id: string; name: string; }]
        selectModelValue.value = [(props.value as { id: string; name: string; }).id]
      }
    })
    const apiFunction = computed(() => {
      return !isHeadMode.value ? getExamTaskPage : async (params: { pageSize: number; pageNumber: number; }): Promise<PageResult<HeadQuartersCultivateTaskRecord[]>> => {
        return cubeSecureEduHeadQuartersService.getExamTaskPage(params)
      }
    })

    return (): JSX.Element =>
      <>
        <div style={{ display: 'flex' }}>
          <Select placeholder='请选择' open={false} showArrow={false} options={selectOptions.value} v-model:value={selectModelValue.value} allowClear onClear={() => {
            ok([])
          }} />
          <Button type='primary' onClick={openModal}>选择考试</Button>
        </div>
        <ModalTable
          v-model:show={modalVisible.value}
          columns={columns}
          width='1200px'
          title='选择考试'
          search={search.value}
          searchParams={{ examTaskStatus: ExamTaskStatus.UNPUBLISHED }}
          apiFunction={apiFunction.value}
          onOk={ok}
          selectRowKeysValue={selectModelValue.value}
        />
      </>
  }
})
