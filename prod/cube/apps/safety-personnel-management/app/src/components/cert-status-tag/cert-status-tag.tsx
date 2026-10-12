import { defineComponent } from 'vue'
import { Tag } from '@ghcloud/cube-ui'
import type { ExpireDisplay } from '@/utils/cert-status'
import { expireDisplayLabel } from '@/utils/cert-status'

const colorMap: Record<ExpireDisplay, string> = {
  normal: 'success',
  expiring: 'warning',
  expired: 'error',
}

export const CertStatusTag = defineComponent({
  props: {
    status: { type: String as () => ExpireDisplay, required: true },
  },
  setup (props) {
    return (): JSX.Element => (
      <Tag color={colorMap[props.status]}>{expireDisplayLabel[props.status]}</Tag>
    )
  },
})
