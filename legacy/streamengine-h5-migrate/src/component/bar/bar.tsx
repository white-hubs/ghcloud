import { defineComponent, ref, watch, type PropType, type VNode } from 'vue'
import { useRoute } from 'vue-router'
import 'vant/lib/index.css'
import styles from './bar.module.less'
import { Button, Icon, NavBar, Popup } from 'vant'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'

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
    
    // 更新标题的函数
    const updateTitle = () => {
      meta.value.title = props.title !== '' ? props.title : (route.meta.title as string || '')
    }
    
    watch(() => route.meta, () => {
      updateTitle()
      meta.value.isFilter = route.meta.isFilter as boolean
    }, { immediate: true })
    
    // 监听 props.title 的变化
    watch(() => props.title, () => {
      updateTitle()
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
    const handleBack=(): void => {
      if(getEnvironment()==='cubeApp'){
        cubeAppService.backPage()
      }else{
        history.back()
      }
    }
    return () => (
      <div class={styles.bar}>
        <NavBar
          title={meta.value.title}
          v-slots={{
            left: () => <Icon name='arrow-left' size='20' color='#646566' onClick={() => { handleBack() }} />,
            right: () => props.isShowRight && rightDom()
          }}
        />
        <Popup
          v-model:show={showRight.value}
          position='right'
          style={{ width: '80%', height: '100%' }}
          closeable
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
