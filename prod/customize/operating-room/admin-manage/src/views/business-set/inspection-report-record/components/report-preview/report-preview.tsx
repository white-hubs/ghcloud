import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { Button, Modal, Spin, message, FullscreenOutlined, FullscreenExitOutlined } from '@ghcloud/cube-ui'
import './report-preview.less'

export default defineComponent({
  name: 'ReportPreview',
  props: {
    pdfUrl: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      default: '检测报告.pdf'
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible', 'download'],
  setup (props, { emit }) {
    const loading = ref(true)

    const handleClose = (): void => {
      emit('update:visible', false)
    }

    const handleDownload = (): void => {
      emit('download')
    }

    const handleLoad = (): void => {
      loading.value = false
    }

    const handleError = (): void => {
      loading.value = false
      message.error('PDF加载失败，请重试')
    }

    // 在setup函数中添加
    const isFullscreen = ref(false)
    const previewContainerRef = ref<HTMLDivElement>()

    const toggleFullscreen = (): void => {
      if (!previewContainerRef.value) return

      if (!isFullscreen.value) {
        if (previewContainerRef.value.requestFullscreen) {
          previewContainerRef.value.requestFullscreen()
          isFullscreen.value = true
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
          isFullscreen.value = false
        }
      }
    }
    const handleFullscreenChange = (): void => {
      isFullscreen.value = !!document.fullscreenElement
    }
    onMounted(() => {
      document.addEventListener('fullscreenchange', handleFullscreenChange)
    })
    onBeforeUnmount(() => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    })
    return (): JSX.Element => (
      <Modal
        visible={props.visible}
        title="检测报告预览"
        width="80%"
        footer={null}
        onCancel={handleClose}
        class="report-preview-modal"
      >
        <div ref={previewContainerRef} class="report-preview-container">
          {loading.value && <Spin tip="加载中..." class="preview-loading" />}
          <object
            data={props.pdfUrl}
            type="application/pdf"
            width="100%"
            height={isFullscreen.value ? "100vh" : "600px"}
            onLoad={handleLoad}
            onError={handleError}
          >
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>您的浏览器不支持直接显示 PDF 文件。<a href={props.pdfUrl} target="_blank" rel="noreferrer">点击下载 PDF</a></p>
            </div>
          </object>
          <div class="report-preview-footer">
            <Button onClick={toggleFullscreen}>
              {isFullscreen.value ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              {isFullscreen.value ? '退出全屏' : '全屏查看'}
            </Button>
            <Button type="primary" onClick={handleDownload}>下载报告</Button>
          </div>
        </div>
      </Modal>
    )
  }
})