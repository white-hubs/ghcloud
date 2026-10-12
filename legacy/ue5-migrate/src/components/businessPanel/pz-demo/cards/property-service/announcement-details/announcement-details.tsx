import { defineComponent, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './announcement-details.module.less'
import { PZService } from '../../../card-service/service'
import dayjs from 'dayjs'
import NoData from '@/components/businessPanel/public/noData.vue'

export const AnnouncementDetails = defineComponent({
  name: 'AnnouncementDetails',
  setup () {
    const announcements = ref([])
    const getData = async (): Promise<void> => {
      const res = await PZService.property.getPropertyNoticeDetail()
      if (res.total){
        announcements.value = res.records.map(item => {
          return {
            id: item.id,
            title: item.title,
            content: item.content,
            date: dayjs(item.pushTime).format('YYYY-MM-DD HH:mm'),
            type: '常规'
          }
        })
      }
    }
    getData()

    return (): JSX.Element => (
      <SubPanelTemplate title="公告详情">
        <div class={`${styles.announcementContainer} class='card-container-3`}>
          {announcements.value.map(announcement => (
            <div key={announcement.id} class={styles.announcementItem}>
              <div class={styles.announcementHeader}>
                <span class={styles.announcementTitle}>{announcement.title}</span>
                <span class={styles.announcementDate}>{announcement.date}</span>
                <span class={styles.announcementType} data-type={announcement.type}>{announcement.type}</span>
              </div>
              <div class={styles.announcementContent}>
                {announcement.content}
              </div>
            </div>
          ))}
          {announcements.value.length === 0 && <NoData />}
        </div>
      </SubPanelTemplate>
    )
  }
})