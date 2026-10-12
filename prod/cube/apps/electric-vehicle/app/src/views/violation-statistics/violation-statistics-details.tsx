import { defineComponent, onMounted, reactive, ref, type VNode } from 'vue'
import { CubeLayout, useCubeTable } from '@ghcloud/cube-app-design'
import { usePageName } from '@ghcloud/cube-utils'
import { Button, Page, PopOver } from '@ghcloud/cube-ui'
import dayjs from 'dayjs'
import { cubeElectricVehicleService, cubePropertyService } from '@/api/service'
import { useRoute, useRouter } from 'vue-router'
import { VerticalLine } from '@ghcloud/cube-app-design/src/base-components/vertical-line/vertical-line'
import style from './index.module.less'
import { CarType } from '../electric-vehicle-ledger/type'
interface SearchParamsType {
  pageNumber: number;
  pageSize: number;
  targetId?: string;
  total: number;
}
export const Details = defineComponent({
  setup: () => {
    const route = useRoute()
    const { pageTitle } = usePageName()
    const router = useRouter()
    const searchParams = reactive<SearchParamsType>({
      targetId: (route.query as { id: string; }).id ?? '',
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    })
    const violationStat = ref()
    // 回显
    const riskLedgerDetails = async (): Promise<void> => {
      violationStat.value = await cubePropertyService.riskSourceLedgerDetails((route.query as { id: string; }).id)
      violationStat.value.partsDetails = violationStat.value.partsDetails.map((item: { expireDate: string | number | Date | dayjs.Dayjs | null | undefined; }) => {
        return {
          ...item,
          expireDate: item.expireDate ? dayjs(item.expireDate).format('YYYY-MM-DD') : ''
        }
      })
    }
    const toDetail = (id: string) => {
      return (): void=> {
        window.location.href = `/portal/inspection/inspectionTaskDetails?id=${id}&type=detail&flag=true`
      }
    }
    const columns = [
      {
        title: '巡检对象',
        dataIndex: 'targetName',
        defaultVisible: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '巡检时间',
        dataIndex: 'time',
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text ? dayjs(text).format('YYYY-MM-DD HH:MM:ss') : '--'}>{text ? dayjs(text).format('YYYY-MM-DD HH:MM:ss') : '--'}</PopOver>
        }
      },
      {
        title: '巡检人',
        dataIndex: 'nickname',
        defaultVisible: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '所属巡检任务',
        dataIndex: 'taskName',
        defaultVisible: true,
        align: 'center',
        customRender: ({ record }: { record: { taskId: string;taskName: string; }; }): VNode => {
          return <Button type='link' onClick={toDetail(record.taskId)}>{record.taskName || '--'}</Button>
        }
      },
      {
        title: '巡检结果',
        dataIndex: 'result',
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode=> {
          return <span style={`color:${text === 'NORMAL' ? 'var(--cube-theme-var--primary-color)' : 'red'}`}>{text ? (text === 'NORMAL' ? '正常' : '异常') : '--'}</span>
        }
      },
      {
        title: '异常明细',
        dataIndex: 'errorItem',
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
    ]
    // 分页
    const handleChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber
      searchParams.pageSize = pageSize
      tableApi.query()
    }
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode: 'Violation_Statistics_Details',
      rowKey: 'id',
      fetchApi: async () => {
        return cubeElectricVehicleService.safetyStatRecordPage({ ...searchParams })
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total
      }
    })
    const backPage = (): void => {
      router.push({ path: '/violation-statistics' })
    }
    onMounted(async () => {
      riskLedgerDetails()
    })
    const slots = {
      'layout-content': (): VNode=> {
        return (
          <div class={style.contentBox}>
            <VerticalLine title='基本信息' />
            <div class={style.riskBox}>
              <div class={style.riskLeft}>
                <div class={style.risk_item}>
                  <div>名称:</div>
                  <div class={style.risk_value}>{violationStat.value?.name}</div>
                </div>
                <div class={style.risk_item}>
                  <div>分类:</div>
                  <div class={style.risk_value}>{CarType.get(violationStat.value?.electronMobileType) ?? '--'}</div>
                </div>
                <div class={style.risk_item}>
                  <div>关联档位:</div>
                  <div class={style.risk_value}>{violationStat.value?.stallName}</div>
                </div>
                <div class={style.risk_item}>
                  <div>详细位置:</div>
                  <div class={style.risk_value}>{violationStat.value?.attribute}</div>
                </div>
              </div>
              <div class={style.riskRight}>
                <div class={style.risk_item}>
                  <div>车牌号:</div>
                  <div class={style.risk_value}>{violationStat.value?.plateNumber}</div>
                </div>
                <div class={style.risk_item}>
                  <div>现场点:</div>
                  <div class={style.risk_value}>{violationStat.value?.sitePointName}</div>
                </div>
                <div class={style.risk_item}>
                  <div>所在区域:</div>
                  <div class={style.risk_value}>{violationStat.value?.areaName}</div>
                </div>
              </div>
            </div>
            <VerticalLine title='违规明细' />
            <CubeTable />
            <Page
              current={searchParams.pageNumber}
              pageSize={searchParams.pageSize}
              total={searchParams.total}
              onPageChange={handleChange}
              style={{ textAlign: 'right', marginTop: '20px' }}
            />
          </div>
        )
      },
      'footer-page': (): VNode=> {
        return (
          <Button onClick={backPage}>返回</Button>
        )
      },
    }
    return (): VNode => (
      <CubeLayout title={pageTitle} v-slots={slots} />
    )
  }
})
