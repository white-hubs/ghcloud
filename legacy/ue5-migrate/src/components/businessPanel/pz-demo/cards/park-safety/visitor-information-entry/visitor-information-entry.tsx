import { defineComponent, onMounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import styles from './visitor-information-entry.module.less'
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";
import { PZService } from '../../../card-service/service'
import dayjs from 'dayjs'

export const VisitorInformationEntry = defineComponent({
  name: 'VisitorInformationEntry',
  setup () {
    const dataList = ref<{
      visitorName: string;
      admissionTime: string;
      departureTime: string;
      purpose: string;
    }[]>([])
    
    const loading = ref<boolean>(false)
    const error = ref<string>('')
    
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        error.value = ''
        const result = await PZService.parkSafety.getVisitorInfoEntryAndAgeStat()
 // 添加调试日志
        
        if (result && Array.isArray(result)) {
          dataList.value = result.map(item => {
            return {
              visitorName: item.visitorName || '未知',
              admissionTime: item.admissionTime ? dayjs(item.admissionTime).format('YYYY-MM-DD HH:mm') : '--',
              departureTime: item.departureTime ? dayjs(item.departureTime).format('YYYY-MM-DD HH:mm') : '--',
              purpose: item.purpose || '未填写'
            }
          })
        } else {
          error.value = '数据格式异常'
        }
      } catch (err) {
        error.value = '数据获取失败'
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      getData()
    })
    
    return (): JSX.Element => (
      <SubPanelTemplate title='访客信息录入'>
        <div class={[styles.visitorTable, 'card-container-2']} >
          <div class={styles.tableHeader}>
            <div class={styles.cell}>访客姓名</div>
            <div class={styles.cell}>入园时间</div>
            <div class={styles.cell}>离园时间</div>
            <div class={styles.cell}>目的</div>
          </div>
          <div class={styles.tableBody}>
            {loading.value ? (
              <div class={styles.loading}>加载中...</div>
            ) : error.value ? (
              <div class={styles.error}>{error.value}</div>
            ) : dataList.value.length > 0 ? (
              <Vue3SeamlessScroll 
                list={dataList.value} 
                step={0.5} 
                hover 
                singleHeight={40}
                direction="up"
                waitTime={2000}
              >
                {dataList.value.map((visitor, index) => (
                  <div class={styles.tableRow} key={index}>
                    <div class={styles.cell}>{visitor.visitorName}</div>
                    <div class={styles.cell}>{visitor.admissionTime}</div>
                    <div class={styles.cell}>{visitor.departureTime}</div>
                    <div class={styles.cell}>{visitor.purpose}</div>
                  </div>
                ))}
              </Vue3SeamlessScroll>
            ) : (
              <div class={styles.noData}>暂无数据</div>
            )}
          </div>
        </div>
      </SubPanelTemplate>
    )
  }
})