import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Page, PopOver, Table } from '@ghcloud/cube-ui'
import { examuserexport, examuserpage } from '@/api/train'
import { useRoute, type LocationQueryValue } from 'vue-router'
interface Train {

  pageNumber: number;
  pageSize: number;
  total: number;
  passed: boolean | undefined;
  examStatus: string | undefined;
}
export const ExamDetails = defineComponent({

  setup: () => {
    const route = useRoute()
    const query = reactive<{
      id: LocationQueryValue | LocationQueryValue[];
      type: LocationQueryValue | LocationQueryValue[];
    }>({
      id: route.query?.id,
      type: route.query?.type,
    })
    const trainDate = reactive <Train>({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      passed: query.type === '不及格人数' ? false : undefined,
      examStatus: query.type === '实际参加人数' ? 'EXAMINED' : query.type === '缺考人数' ? 'MISS_EXAM' : undefined
    })
    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <>
            <Button type='primary' onClick={() => {
              exportexam()
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
      title: '考试分数',

      dataIndex: 'score',
      width: 250,
      ellipsis: true,
      customRender: ({ text }: { text: string; }): JSX.Element => {
        return <PopOver content={text || '--'}>{text || '--'}</PopOver>
      }
    }]

    const getDate = (): void => {
      examuserpage({ examTaskId: query.id, ...trainDate }).then(res => {
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
    const exportexam = (): void => {
      examuserexport({ examTaskId: query.id, ...trainDate }).then(res => {
        const { data } = res
        const link = document.createElement('a')
        const blob = new Blob([data as BlobPart], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        link.style.display = 'none'
        link.href = URL.createObjectURL(blob)
        link.setAttribute('download', '考试人员统计.xlsx')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
    }
    onMounted(() => {
      getDate()
    })
    return (): JSX.Element =>
      <>
        <Layout title={`考试统计/${query.type}`} v-slots={layoutSlots} />
      </>
  }
})
