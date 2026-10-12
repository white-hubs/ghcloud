import { defineComponent } from 'vue'
import { UploadDragger as AntUploadDragger } from 'ant-design-vue/es'

/**
 * 拖拽上传：完整透传 ant-design-vue `UploadDragger`，与官方 `Upload.Dragger` 能力对齐。
 * 命名导出另提供 `Dragger`、`Upload.Dragger` 别名（见 main.ts）。
 */
export default defineComponent({
  name: 'CubeUploadDragger',
  inheritAttrs: false,
  setup (_, { attrs, slots }) {
    return (): JSX.Element => <AntUploadDragger {...attrs} v-slots={slots} />
  },
})
