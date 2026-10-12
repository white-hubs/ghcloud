import { defineComponent, ref, reactive } from 'vue'
import { Button, PopOver, Page } from '@ghcloud/cube-ui'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { usePageName } from '@ghcloud/cube-utils'
import dayjs from 'dayjs'
import { cubeApplicationCenterService } from '@/api/service'
import type { ApplicationIterationEntity } from '@ghcloud/cube-application-center-service'
import styles from './iteration-record.module.less'
import { getIterationTypeLabel } from '@/constants/iteration'

export const IterationRecord = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0
    })
    const selectedRowKeysData = ref<string[]>([])
    const searchFormSchema = [
      {
        component: 'Input',
        label: '',
        fieldName: 'keyword',
        componentProps: {
          placeholder: '应用名称'
        }
      }
    ]
    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      handleSubmit: () => {
        tableApi.query()
      },
      handleReset: () => {
        tableApi.query()
      },
      schema: searchFormSchema,
      showCollapseButton: true
    })
    const columns = [
      {
        title: '迭代应用',
        dataIndex: 'applicationName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '迭代版本',
        dataIndex: 'version',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '迭代内容',
        dataIndex: 'content',
        ellipsis: true,
        align: 'center',
        customRender: ({ record }: { record: ApplicationIterationEntity; }): JSX.Element => {
          if (!record.content || record.content.length === 0) {
            return <PopOver content="--">--</PopOver>
          }
          // 构建带序号的内容列表
          const contentItems = record.content.map((item, index) => {
            const type = getIterationTypeLabel(item.category)
            return (
              <div key={index} class={styles['iteration-item']}>
                <span class={styles['iteration-number']}>{index + 1}.</span>
                <span class={styles['iteration-type']}>{type}:</span>
                <span class={styles['iteration-text']}>{item.content}</span>
              </div>
            )
          })

          // 构建用于PopOver显示的纯文本内容
          // const popoverContent = record.content.map((item, index) => {
          //   const type = IterationTypeOptions.find(e => e.value === item.category)?.label || '未知类型'
          //   return `${index + 1}. ${type}: ${item.content}`
          // }).join('\n')

          // 构建表格单元格显示的简化内容
          // const cellContent = record.content.length > 1
          //   ? `共${record.content.length}项迭代内容`
          //   : contentItems[0]

          return (
            <PopOver content={
              <div class={styles['iteration-content']}>
                {contentItems}
              </div>
            }>
              <div class={styles['iteration-content']}>
                {contentItems}
              </div>
            </PopOver>
          )
        }
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = dayjs(text).format('YYYY-MM-DD HH:mm:ss')
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        slots: {
          customRender: 'action',
        },
        width: 250,
        align: 'center',
        customRender: ({ record }: { record: ApplicationIterationEntity; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                handleEdit(record)
              }}>编辑</Button>
            </>
          )
        }
      },
    ]
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: 'id',
      fetchApi: async () => {
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          keyword: formApi.formValues.keyword as string ?? '',
        }
        return cubeApplicationCenterService.getApplicationIterationPage(params)
      },
      rowSelectionChange: (keys) => {
        selectedRowKeysData.value = keys as string[]
      },
      fetchLoaded: (data) => {
        page.total = data.total
      }
    })
    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber
      page.pageSize = pageSize
      tableApi.query()
    }
    const handleAdd = (): void => {
      history.pushState({}, '', `/portal/application-center/admin-iteration-edit`)
    }
    const handleEdit = (record: ApplicationIterationEntity): void => {
      history.pushState({}, '', `/portal/application-center/admin-iteration-edit?id=${record.id}`)
    }

    const slots = {
      'layout-header': (): JSX.Element => {
        return (
          <div>
            <Button type='primary' onClick={handleAdd}>新增</Button>
          </div>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <div>
            <CubeForm />
            <CubeTable />
          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <Page
            current={page.pageNumber}
            pageSize={page.pageSize}
            total={page.total}
            onPageChange={handleChange}
          />
        )
      },
    }

    return (): JSX.Element =>(
      <CubeLayout title={pageTitle ?? '应用迭代'} v-slots={slots} >
      </CubeLayout>
    )
  }

})