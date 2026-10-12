import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Page, PopOver, Table, message } from '@ghcloud/cube-ui'
import { trainuserexport, userPage } from '@/api/train'
import { useRoute, type LocationQueryValue } from 'vue-router'
import { logger } from '@/logger'
interface Train {

  pageNumber: number;
  pageSize: number;
  total: number;
  userSignStatus: LocationQueryValue | LocationQueryValue[];
  belated: boolean | undefined;
}
export const TrainingDetiles = defineComponent({

  setup: () => {
    const route = useRoute()
    const query = reactive<{
      id: LocationQueryValue | LocationQueryValue[];
      type: LocationQueryValue | LocationQueryValue[];
    }>({
      id: route.query?.id,
      type: route.query?.type,
    })
    const trainDate = reactive<Train>({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      userSignStatus: query.type === '实际参加人数' ? 'SIGNED' : query.type === '缺勤人数' ? 'UNSIGNED' : '',
      belated: query.type === '迟到人数' ? true : undefined
    })
    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <>
            <Button type='primary' onClick={() => {
              trainexport()
            }}>导出</Button>
          </>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <div class='mt-10px '>
            <div><Button onClick={() => {
              goback()
            }}>返回</Button></div>
            <Table rowSelection={false} columns={columns} dataSource={dataSource.value} class='mt-10px' pagination={false} scrollY={580} />

          </div>

        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <Page
            onPageChange={pageChange}
            v-model:current={trainDate.pageNumber}
            v-model:pageSize={trainDate.pageSize}
            v-model:total={trainDate.total}
          />
        )
      }
    }
    const dataSource = ref([])
    const columns = [{
      title: '序号',
      width: 70,
      align: 'center',
      customRender: ({ index }: { index: number; }): string => `${index + 1}`
    },

    {
      title: '员工姓名',

      dataIndex: 'userName',
      width: 150,
      ellipsis: true,
      customRender: ({ text }: { text: string; }): JSX.Element => {
        return <PopOver content={text || '--'}>{text || '--'}</PopOver>
      }
    }, {
      title: '电话',

      dataIndex: 'userPhone',
      width: 150,
      ellipsis: true,
      customRender: ({ text }: { text: string; }): JSX.Element => {
        return <PopOver content={text || '--'}>{text || '--'}</PopOver>
      }
    }, {
      title: '部门',

      dataIndex: 'userDepartmentName',
      width: 250,
      ellipsis: true,
      customRender: ({ text }: { text: string; }): JSX.Element => {
        return <PopOver content={text || '--'}>{text || '--'}</PopOver>
      }
    }, {
      title: '职位',

      dataIndex: 'userPostName',
      width: 250,
      ellipsis: true,
      customRender: ({ text }: { text: string; }): JSX.Element => {
        return <PopOver content={text || '--'}>{text || '--'}</PopOver>
      }
    }, {
      title: '状态',

      dataIndex: 'userSignStatus',
      width: 100,
      ellipsis: true,
      customRender: ({ text, record }: { text: string;record: { belated: boolean | null; }; }): JSX.Element => {
        let statusText = text === 'SIGNED' ? '已签' : '未签'
        if (record.belated) {
          statusText = statusText + '(迟到)'
        }
        return <PopOver content={statusText}>{statusText}</PopOver>
      }
    }]

    const getDate = (): void => {
      userPage({ cultivateTaskId: query.id, ...trainDate }).then(res => {
        const { data } = res
        trainDate.total = data.total
        dataSource.value = data.records as never[]
      })
    }
    const pageChange = (pageNumber: number, pageSize: number): void => {
      trainDate.pageNumber = pageNumber || 1
      trainDate.pageSize = pageSize
      getDate()
    }
    const goback = (): void => {
      history.back()
    }
    const trainexport = (): void => {
      trainuserexport({ cultivateTaskId: query.id, ...trainDate }).then(res => {
        const { data } = res
        const link = document.createElement('a')
        const blob = new Blob([data as BlobPart], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        link.style.display = 'none'
        link.href = URL.createObjectURL(blob)
        link.setAttribute('download', '培训统计.xlsx')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }).catch(res => {
        logger.error(res)
        message.warn('未查询到数据，无法导出')
      })
    }
    onMounted(() => {
      getDate()
    })
    return (): JSX.Element =>
      <>
        <Layout title={`培训统计/${query.type}`} v-slots={layoutSlots} />
      </>
  }
})
