import { Empty, Image, List, showNotify, Popup } from 'vant'
import { defineComponent, type PropType, ref } from 'vue'
import type { CultivateCourseWaresType } from '../type'
import { getAssetsFile, filterSize, formatTime } from '@/utils'
import { imgType, typeList } from '@/utils'
import { showImagePreview, kkFilePreview, type FileState } from '@ghcloud/cube-utils'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
const videoType = ['mp4', 'AVI', 'WMV', 'MOV', 'MKV', 'FLV', 'WEBM']
const audioType = ['mp3', 'wav', 'aac', 'flac', 'ogg']
/** 培训签到页面 */
export const CourseWare = defineComponent({
  props: {
    course: {
      type: Object as PropType<CultivateCourseWaresType[] | undefined>,
      default: () => []
    },
  },
  setup: (props) => {
    const docIcon = getAssetsFile('doc.png')
    const pdfIcon = getAssetsFile('pdf.png')
    const pptIcon = getAssetsFile('ppt.png')
    const txtIcon = getAssetsFile('txt.png')
    const videoIcon = getAssetsFile('video.png')
    const audioIcon = getAssetsFile('audio.png')
    /**
     * 判断是否为移动端设备
     */ 
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    /**
     * 视频弹窗状态与地址
     */
    const showVideo = ref(false)
    const videoSrc = ref('')

    /**
     * 打开原生视频播放弹窗
     */
    const openVideoPreview = (files: FileState[]): void => {
      const file = files[0]
      let videoPath = file?.path ?? ''
      if (!videoPath) {
        showNotify({ type: 'warning', message: '视频地址无效' })
        return
      }
      const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(videoPath)
      if (!hasScheme) {
        videoPath = videoPath.startsWith('//')
          ? `${window.location.protocol}${videoPath}`
          : (videoPath.startsWith('/')
            ? `${window.location.origin}${videoPath}`
            : `${window.location.origin}/${videoPath}`)
      }
      try {
        cubeAppService.playVideo({
          videoUrl: videoPath,
          videoName: file?.name ?? '',
        })
      } catch {
        videoSrc.value = videoPath
        showVideo.value = true
      }
    }

    /**
     * 课件预览：iOS+视频→原生视频；其他类型按原逻辑处理
     */
    const preview = (files: FileState[]): void => {
      const item = files[0]
      const ext = (item.type ?? '').toLowerCase()

      if (['zip', 'rar'].includes(ext)) {
        showNotify({ type: 'warning', message: '暂不支持该文件类型的预览, 请到电脑端查看' })
        return
      }

      const isVideoFile = ['mp4', 'avi', 'wmv', 'mov', 'mkv', 'flv', 'webm'].includes(ext)
      if (isVideoFile && isMobile) {
        openVideoPreview(files)
        return
      }

      if (typeList.includes(ext)) {
        kkFilePreview(item)
      } else {
        const imgList = files.filter(f => imgType.includes((f.type ?? '').toLowerCase())) || []
        const index = 0
        showImagePreview(imgList.map(f => String(f.path ?? '')), index)
      }
    }
    const iconSrc = (item: CultivateCourseWaresType): string => {
      const fileIconObj: Record<string, string> = {
        doc: docIcon,
        docx: docIcon,
        xls: docIcon,
        pdf: pdfIcon,
        ppt: pptIcon,
        txt: txtIcon
      }
      let fileSrc = ''
      Object.keys(fileIconObj).forEach((key) => {
        if (item.fileName.endsWith(key)) {
          fileSrc = fileIconObj[key]
        }
      })
      videoType.forEach((key) => {
        if (item.fileName.endsWith(key)) {
          fileSrc = videoIcon
        }
      })
      audioType.forEach((key) => {
        if (item.fileName.endsWith(key)) {
          fileSrc = audioIcon
        }
      })
      return fileSrc || (item.files[0].path ?? '')
    }
    return (): JSX.Element =>
      <>
        <div class='course-file-list' style={{ overflowY: 'scroll', marginBottom: '80px' }}>
          <List
            finished-text={props.course?.length === 0 ? '' : '暂无更多数据'}
          >
            {
              (props.course && props.course?.length > 0) &&
                props.course.map((item: CultivateCourseWaresType) =>
                  <div key={item.id} onClick={() => {
                    preview(item.files)
                  }} class='course-file'>
                    <div class='icon'>

                      <Image style={{ borderRadius: '4px', overflow: 'hidden' }} src={iconSrc(item)} width='46' height='46' />
                    </div>
                    <div class='content'>
                      <div class='title'>{item.fileName}</div>
                      <div class='size'>
                        <div>{filterSize(+item.fileSize)}</div>
                        <div>{item.duration ? formatTime(item.duration) : '--'}</div>
                      </div>
                    </div>
                  </div>)
            }
            {(props.course?.length === 0) && <Empty description='暂无数据' />}
          </List>
        </div>
        <Popup v-model:show={showVideo.value} position="center" style={{ width: '100vw', height: '56.25vw', background: '#000' }}>
          <video
            src={videoSrc.value}
            controls
            // playsInline
            webkit-playsinline="true"
            x5-playsinline="true"
            preload="metadata"
            style={{ width: '100%', height: '100%' }}
          />
        </Popup>
      </>
  }
})
