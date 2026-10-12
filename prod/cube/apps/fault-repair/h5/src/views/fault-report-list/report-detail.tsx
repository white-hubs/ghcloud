import { defineComponent, onMounted, ref } from 'vue'
import styles from './report-detail.module.less'
import { useRoute } from 'vue-router'
import { useMetaTitle } from '../hooks/use-meta-title-hook'
import { cubeMaintainService } from '@/api/server'
import type { ReportOverviewType } from '@ghcloud/cube-maintain-service'
import { timeFormat } from '@/utils'
import { Bar } from '../components/bar/bar'
export const CaseDetail = defineComponent({
  setup () {
    const route = useRoute()
    useMetaTitle(route.query.name as string)
    const data = ref<ReportOverviewType>()
    onMounted(async () => {
      data.value = await cubeMaintainService.getReportOverview(route.query.id as string)
    })
    return (): JSX.Element =>
      <div class={styles.wrapper}>
        <Bar isShowRight={false} />
        <div class={styles.card}>
          <div class={styles.header}>故障信息总览</div>
          <div class={styles.content}>
            <div class={styles.message}>
              <p>当前时间段统计共发生故障总数[<span style='color:var(--van-primary-color)'>{data.value?.total}</span>]条</p>
              <p>
                其中待确认故障[<span style='color:var(--van-warning-color)'>{data.value?.waitingForConfirm}</span>]条，
                待处理故障[<span style='color:var(--van-warning-color)'>{data.value?.waitingForHandle}</span>]条，
                待关闭故障[<span style='color:gray'>{data.value?.toBeClosed}</span>]条 ，
                已结束故障[<span style='color:var(--van-success-color)'>{data.value?.finished}</span>]条
              </p>
              <div class={styles.table}>
                <table>
                  <thead>
                    <tr><th>提交时间</th><th>故障单名称</th><th>故障设备</th><th>故障来源</th><th>提交人</th><th>状态</th><th>处理结果</th></tr>
                  </thead>
                  <tbody>
                    {data.value?.reportOverviewList.map(item =>
                      <tr key={item.submitTime}>
                        <td>{timeFormat(item.submitTime, true)}</td>
                        <td>{item.name}</td>
                        <td>{item.objName}</td>
                        <td>{item.resource}</td>
                        <td>{item.submitter}</td>
                        <td>{item.faultStatus}</td>
                        <td>{item.faultResult}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class={styles.card}>
          <div class={styles.header}>故障设备分析</div>
          <div class={styles.content}>
            <div class={styles.message}>
              <p>当前时间段统计故障设备类型[<span style='color:var(--van-warning-color)'>{data.value?.analysisTotal}</span>]个，
                请特别关注[<span style='color:var(--van-warning-color)'>{data.value?.analysisFirstName || '--'}</span>]的安全维护工作
              </p>
              <div class={styles.table}>
                <table>
                  <thead>
                    <tr><th>设备类型</th><th>故障个数</th><th>待确认</th><th>待处理</th><th>待关闭</th><th>已结束</th></tr>
                  </thead>
                  <tbody>
                    {data.value?.analysisList.map(item =>
                      <tr key={item.objTypeName}>
                        <td>{item.objTypeName}</td>
                        <td>{item.objTypeTotal}</td>
                        <td>{item.objTypeConfirm}</td>
                        <td>{item.objTypeHandle}</td>
                        <td>{item.objTypeClosed}</td>
                        <td>{item.objTypeFinished}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class={styles.card}>
          <div class={styles.header}>故障区域分析</div>
          <div class={styles.content}>
            <div class={styles.message}>
              <p>当前时间段统计故障分布区域[<span style='color:var(--van-warning-color)'>{data.value?.analysisAreaTotal}</span>]个，
                请特别关注[<span style='color:var(--van-warning-color)'>{data.value?.analysisAreaFirstName || '--'}</span>]的安全维护工作
              </p>
              <div class={styles.table}>
                <table>
                  <thead>
                    <tr><th>区域名称</th><th>故障单个数</th><th>待确认</th><th>待处理</th><th>待关闭</th><th>已结束</th></tr>
                  </thead>
                  <tbody>
                    {data.value?.analysisAreaList.map(item =>
                      <tr key={item.areaName}>
                        <td>{item.areaName}</td>
                        <td>{item.objAreaTotal}</td>
                        <td>{item.objAreaConfirm}</td>
                        <td>{item.objAreaHandle}</td>
                        <td>{item.objAreaClosed}</td>
                        <td>{item.objAreaFinished}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
  }
})
