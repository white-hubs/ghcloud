import { defineComponent } from 'vue'
import styles from './recommended-apps.module.less'
import { AppCard } from '../../app-center/app-card/app-card'
import type { ApplicationEntity } from '@ghcloud/cube-application-center-service'

export interface RecommendedAppsProps {
  apps: ApplicationEntity[];
}

export const RecommendedApps = defineComponent({
  props: {
    apps: {
      type: Array as () => ApplicationEntity[],
      required: true
    }
  },
  setup (props) {
    return (): JSX.Element => (
      <div class={styles['recommended-apps']}>
        <h2 class={styles['section-title']}>推荐应用</h2>
        <div class={styles['apps-grid']}>
          {props.apps.map(app => (
            <div class={styles['app-item']} key={app.id}>
              <AppCard app={app} />
            </div>
          ))}
        </div>
      </div>
    )
  }
})