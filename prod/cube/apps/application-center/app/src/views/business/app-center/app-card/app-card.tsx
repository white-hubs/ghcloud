import { defineComponent, ref } from 'vue'
import styles from './app-card.module.less'
import type { ApplicationEntity } from '@ghcloud/cube-application-center-service'
import { useRouter } from 'vue-router'

export const AppCard = defineComponent({
  props: {
    app: {
      type: Object as () => ApplicationEntity,
      required: true
    }
  },
  setup (props) {
    const router = useRouter()
    const isHovered = ref(false)

    const handleMouseEnter = (): void => {
      isHovered.value = true
    }

    const handleMouseLeave = (): void => {
      isHovered.value = false
    }

    const handleClick = (): void => {
      // 跳转到应用详情页，后续可以实现
      router.push(`/app-details?id=${props.app.id}`)
    }

    return (): JSX.Element => (
      <div
        class={[styles['app-card'], isHovered.value ? styles['app-card-hover'] : '']}
        onMouseenter={handleMouseEnter}
        onMouseleave={handleMouseLeave}
        onClick={handleClick}
      >
        <div class={styles['app-header']}>
          <div class={styles['app-icon']}>
            <img src={props.app.icon} alt={props.app.name} />
          </div>
          <div class={styles['app-info']}>
            <div class={styles['app-name-row']}>
              <div class={styles['app-name']}>{props.app.name}</div>
              <div class={styles['view-details']}>{'查看详情 >'}</div>
            </div>
            <div class={styles['app-version']}>版本号: {props.app.version}</div>
          </div>
        </div>
        <div class={styles['app-description']}>{props.app.description.replace(/<[^>]*>/g, '')}</div>
      </div>
    )
  }
})