import { useCubeTable } from '../../../base-components/cube-table/use-table'
import { useCubeModal } from '../../../base-components/cube-modal/use-modal'
import { useCubeForm } from '../../../base-components/cube-form/use-form'
import { cubeDailyTaskService } from '../../../api/service'
import { PopOver } from '@ghcloud/cube-ui'
import { defineComponent } from 'vue'
import { DailyTaskTargetCategoryOptions, getCurrentDailyType } from '@ghcloud/cube-daily-task-service'
import type { StandardItemModel } from '@ghcloud/cube-daily-task-service'
interface Props {
  title: string;
}
/** 标准项表格弹窗 */
export const StandardItemModalTable = defineComponent({
  props: ['title'],
  emits: ['enter', 'cancel'],
  setup (props: Props, { emit, expose }) {
    const columns = [
      {
        title: '标准项名称',
        dataIndex: 'itemName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '标准项内容',
        dataIndex: 'itemContent',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '结果项',
        dataIndex: 'resultId',
        ellipsis: true,
        align: 'center',
        customRender: ({ record }: { record: StandardItemModel; }): JSX.Element => {
          const text = record.resultLabelList.map((item) => {
            return item.label
          }).join(' ')
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '适用对象',
        dataIndex: 'targetTypes',
        ellipsis: true,
        align: 'center',
        customRender: ({ record }: { record: StandardItemModel; }): JSX.Element => {
          const text = record.targetTypes.map((item) => {
            return DailyTaskTargetCategoryOptions.find((option) => option.value === item)?.label || '--'
          }).join(' ')
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
    ]
    const [ItemTable, itemTableApi] = useCubeTable({
      columns,
      rowSelection: 'checkbox',
      rowKey: 'itemId',
      pagination: {
        current: 1, // 当前页码
        pageSize: 10, // 每页显示条数
        total: 0, // 总条数
        size: 'default', // 分页组件大小
        showSizeChanger: true, // 是否允许改变每页显示条数
        showTotal: (total: number) => `总共 ${total} 条数据`,
        onChange: (current: number, pageSize: number) => {
          itemTableApi.setState({
            pagination: {
              ...(itemTableApi.state.pagination as unknown as Record<string, unknown>),
              pageSize,
              current
            },
          })
          itemTableApi.query()
        }
      },
      fetchApi: async (params?: Record<string, unknown>) => {
        const param = {
          pageNumber: params?.current as number,
          pageSize: params?.pageSize as number,
          dailyType: getCurrentDailyType(),
          itemName: formApi.formValues.keyword as string ?? '',
          targetType: formApi.formValues.targetType as string ?? '',
        }
        return cubeDailyTaskService.getStandardItemPage(param)
      },
    })
    const searchFormSchema = [
      {
        component: 'Input',
        label: '',
        fieldName: 'keyword',
        componentProps: {
          placeholder: '标准项名称'
        }
      }
    ]
    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      handleSubmit: () => {
        itemTableApi.query()
      },
      handleReset: () => {
        itemTableApi.query()
      },
      schema: searchFormSchema,
      showCollapseButton: true
    })
    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      width: '1000px',
      onConfirm: async () => {
        emit('enter', itemTableApi.getSelectedRows())
        modalApi.close()
      },
      onCancel: () => {
        emit('cancel')
        modalApi.close()
      }
    })
    const openModal = (): void => {
      modalApi.open()
      itemTableApi.query()
    }
    expose({
      openModal
    })
    const modalSlots = {
      default: (): JSX.Element => {
        return (
          <>
            <CubeForm />
            <ItemTable />
          </>
        )
      }
    }
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />
  }
})
