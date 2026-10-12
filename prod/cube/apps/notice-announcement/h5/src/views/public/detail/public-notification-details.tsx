
import { defineComponent, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import '../../notification/detail.less'
import { cubeAnnouncementService } from '@/api/server'
import type { AnnouncementDetail, File } from '@ghcloud/cube-bulletin-service/src/announcement.service'
import { getAssetsFile } from '@/utils'
import { kkFilePreview } from '@ghcloud/cube-utils'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { RefreshNativeBusiness } from '@ghcloud/cube-app-js-sdk/src/js/cube-app.service'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

export const PublicNotificationDetails = defineComponent({
  setup () {
    const route = useRoute()
    const announcementContent = ref<AnnouncementDetail>()
    const getData = async (): Promise<void> => {
      announcementContent.value = await cubeAnnouncementService.getDetail(route.query.id as string)
      try {
        cubeAppService.refreshNativeData(RefreshNativeBusiness.NOTICE)
      } catch {

      }
    }
    const getFileName = (data: File): string => {
      if (['docx', 'doc', 'xlsx', 'xls', 'xlsm', 'xltx'].includes(data.type)) {
        return getAssetsFile('word.png')
      } else if (['pdf'].includes(data.type)) {
        return getAssetsFile('pdf.png')
      } else if (['ppt', 'pptx', 'pptm', 'pps'].includes(data.type)) {
        return 'ppt.png'
      } else if (['jpg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg', 'raw', 'heic'].includes(data.type)) {
        return data.path
      } else {
        return getAssetsFile('word.png')
      }
    }
    const viewFile = (item: File): void => {
      item.name = `${item.name}.${item.type}`
      kkFilePreview(item)
    }
    onMounted(() => {
      document.title = '公告详情'
      getData()
    })
    return (): JSX.Element =>
      <>
        <CubeNavBar showBack title='公告详情' />
        <div class='details-box'>
          <div class='details-content'>
            <div class='xian' />
            <div class='details-title'>{announcementContent.value?.title}</div>
            <div class='details-time'>{announcementContent.value?.noticeTime}</div>
            <div class='details-container' v-html={announcementContent.value?.content} />
          </div>
          <div class='details-file' v-show={announcementContent.value?.files?.length}>
            <div class='details-file-title'>附件</div>
            {
              announcementContent.value?.files.map(e => {
                return (
                  <div class='details-file-item' key={e.id} onClick={() => {
                    viewFile(e)
                  }}>
                    <img class='details-file-img' src={getFileName(e)} />
                    <div class='details-file-name'>{e.name}</div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </>
  }
})
