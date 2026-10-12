import { defineComponent } from 'vue'
import styles from './to-business.module.less'
import { message } from 'ant-design-vue'
import { CubeAuthService } from '@ghcloud/cube-auth-service'
import { CubeTerminalEnum } from '@ghcloud/cube-protocol'
import { CubeMfRootGlobalState } from '@ghcloud/cube-mf-root'

export const ToBusiness = defineComponent({
  setup () {
    const cubeMfRootGlobalState = CubeMfRootGlobalState.getInstance()
    const handleClick = (): void=>{
      message.loading('正在获取授权')
      const authService = new CubeAuthService(CubeTerminalEnum.BUSINESS, cubeMfRootGlobalState.mfRootState.authInfo.tenant, cubeMfRootGlobalState.mfRootState.authInfo.token)
      authService.getSecretByToken().then(res=>{
        window.open(`${window.location.origin}?cube-secret=${res}`)
        message.destroy()
      })
    }

    return (): JSX.Element => <div class={styles.item} onClick={handleClick}>业务系统</div>
  }
})
