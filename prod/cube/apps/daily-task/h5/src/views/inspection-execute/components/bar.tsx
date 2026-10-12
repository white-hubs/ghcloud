import { defineComponent, ref, watch, type VNode } from 'vue'
import { useRoute } from 'vue-router'
import 'vant/lib/index.css'
import styles from './bar.module.less'
import { Button, Icon, NavBar, Popup } from 'vant'

export const CopyBar = defineComponent({
  emits: ['reset', 'submit', 'right', 'back'],
  props: {
    showRight: {
      type: Boolean,
      default: false
    },
    rightName: {
      type: String,
      default: '筛选'
    },
    isShowRight: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      default: ''
    }
  },
  setup: (props, { emit, slots }) => {
    const route = useRoute()
    const showRight = ref(false)
    const meta = ref<{ title: string; isFilter: boolean; }>({ title: '', isFilter: false })
    watch(() => route.meta, () => {
      meta.value.title = route.meta.title as string
      meta.value.isFilter = route.meta.isFilter as boolean
    }, { immediate: true })
    const onClickRight = (): void => {
      showRight.value = true
      emit('right')
    }
    const reset = (): void => {
      emit('reset')
    }
    const submit = (): void => {
      emit('submit')
      showRight.value = props.showRight
    }
    const handleBack = (): void => {
      emit('back')
    }
    return (): VNode=> (
      <div class={styles.bar}>
        <NavBar
          title={props.name ? props.name : meta.value.title}
          v-slots={{ left: () => <Icon name='arrow-left' size='20' color='#646566' onClick={() => {
            handleBack()
          }} />, right: () => props.isShowRight && <span style={{ color: '#646566' }} onClick={onClickRight}>{props.rightName}</span> }}
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
