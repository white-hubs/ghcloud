import type { UserInfo } from '@ghcloud/cube-ouaa-service'
import { defineComponent } from 'vue'
import styles from './user-avatar.module.less'

interface Props{
  user: UserInfo;
}

export const UserAvatar = defineComponent({
  props: ['user'],
  setup (props: Props){
    return (): JSX.Element => (
      <div class={styles['user-avatar']}>
        {
          props.user.fileVO
            ? <img src={props.user.fileVO.path} alt={props.user.fileVO.name} onError={()=>{
              props.user.fileVO = null
            }} />
            : props.user.name.charAt(0)
        }
      </div>
    )
  }
})