import { Drawer, Switch } from '@ghcloud/cube-ui'
import { defineComponent } from 'vue'
import styles from './setting.module.less'
import type { MsgRecordCustomGroupStatistics } from '@ghcloud/cube-message-center-service/src/types'

interface Props {
  visible: boolean;
  selectedGroup?: MsgRecordCustomGroupStatistics & { icon: string; isPinned?: boolean; };
  onTogglePinned?: (isPinned: boolean) => void;
}

/** 消息设置 */
export const Setting = defineComponent({
  props: ['visible', 'selectedGroup', 'onTogglePinned'],
  emits: ['update:visible'],
  setup (props: Props, { emit }) {

    return (): JSX.Element => (
      <Drawer
        title="设置"
        placement="right"
        visible={props.visible}
        onClose={()=>{
          emit('update:visible', false)
        }}
        get-container={false}
        style={{ position: 'absolute' }}
        mask={false}
        class={styles['setting']}
      >
        <div class={styles['content']}>
          {/* <div class={styles['item']}>
            <span class={styles['label']}>
              <span>消息免打扰</span>
              <span class={styles['desc']}>开启免打扰模式，消息仍正常接收但不推送通知</span>
            </span>
            <Switch />
          </div> */}
          <div class={styles['item']}>
            <span class={styles['label']}>置顶消息</span>
            <Switch
              value={props.selectedGroup?.isPinned}
              onChange={(checked: boolean) => {
                if (props.onTogglePinned) {
                  props.onTogglePinned(checked);
                }
              }}
            />
          </div>
        </div>
      </Drawer>
    )
  },
})