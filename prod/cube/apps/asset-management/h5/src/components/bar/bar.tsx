import { defineComponent, ref, watch, type PropType, type VNode } from 'vue'
import { useRoute } from 'vue-router'
import 'vant/lib/index.css'
import styles from './bar.module.less'
import { Button, Icon, NavBar, Popup } from 'vant'

export const Bar = defineComponent({
  emits: ['reset', 'submit'],
  props: {
    showRight: {
      type: Boolean,
      default: false
    },
    isShowRight: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: ''
    },
    right: {
      type: Object as PropType<VNode | null>,
      default: () => {
        return null
      }
    }
  },
  setup: (props, { emit, slots }) => {
    const route = useRoute()
    const showRight = ref(false)
    const meta = ref<{ title: string; isFilter: boolean; }>({ title: '', isFilter: false })
    watch(() => route.meta, () => {
      meta.value.title = props.title !== '' ? props.title : route.meta.title as string
      meta.value.isFilter = route.meta.isFilter as boolean
    }, { immediate: true })
    const rightDom = (): VNode => {
      if (!props.right) {
        return <span style={{ color: '#646566' }} onClick={onClickRight}>筛选</span>
      } else {
        showRight.value = props.showRight
        return props.right
      }
    }
    const onClickRight = (): void => {
      showRight.value = true
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
          title={meta.value.title}
          v-slots={{
            left: () => <Icon name='arrow-left' size='20' color='#646566' onClick={() => {
              history.back()
            }} />,
            right: () => props.isShowRight && rightDom()
          }}
        />
        <Popup
          v-model:show={showRight.value}
          position='right'
          style={{ width: '100%', height: '100%' }}

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
