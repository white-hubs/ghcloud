import { defineComponent, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import 'vant/lib/index.css'
import styles from './bar.module.less'
import { Button, Icon, NavBar, Popup } from 'vant'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'

export const Bar = defineComponent({
  emits: ['reset', 'submit', 'click'],
  props: {
    showRight: { // 是否展示右边弹窗
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    rightSlot: {
      type: Object,
      default: () => {
        return { icon: <>筛选</> }
      }
    }

  },
  setup: (props, { emit, slots }) => {
    const route = useRoute()
    const showRight = ref(false)
    const env = getEnvironment()
    const meta = ref<{ title: string; barRightType: string; }>({ title: '', barRightType: 'filter' })
    watch(() => route.meta, () => {
      meta.value.title = route.meta.title as string
      meta.value.barRightType = route.meta.barRightType as string
    }, { immediate: true })
    const onClickRight = (): void => {
      if (meta.value.barRightType === 'filter') {
        showRight.value = true
      } else {
        emit('click')
      }
    }
    const reset = (): void => {
      emit('reset')
    }
    const submit = (): void => {
      emit('submit')
      showRight.value = props.showRight
    }
    return (): JSX.Element => (
      <div class={styles.bar}>
        <NavBar
          title={props.title ? props.title : meta.value.title}
          v-slots={{
            left: () => <Icon
              name='arrow-left' size='20' color='#646566' onClick={() => {
                if (env === 'cubeApp') {
                  cubeAppService.backPage()
                  return
                }
                history.back()
              }}
            />,
            right: () => meta.value.barRightType && <span style={{ color: '#646566' }} onClick={onClickRight}>{props.rightSlot.icon}</span>
          }}
        />
        <Popup
          v-model:show={showRight.value}
          position='right'
          style={{ width: '90%', height: '100%' }}

        >
          {slots.default?.()}
          <div class={styles.button}>
            <div class={styles.reset} onClick={reset}>重置</div>
            <Button type='primary' block onClick={submit}>确定</Button>
          </div>
        </Popup>
      </div>
    )
  }
})
