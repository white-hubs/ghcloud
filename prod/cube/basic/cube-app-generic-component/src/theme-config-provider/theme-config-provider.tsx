import { defineComponent, ref, watch } from 'vue'
import { ConfigProvider } from 'vant'

export const ThemeConfigProvider = defineComponent({
  props: {
    theme: {
      type: String,
      default: 'lightBlue'
    },
  },

  setup (props, { slots }) {
    const themeVars = ref()
    watch(() => props.theme, () => {
      switch (props.theme) {
        case 'lightBlue':
          themeVars.value = { primaryColor: '#1D66FF' }
          break
        case 'lightGreen':
          themeVars.value = { primaryColor: '#24AE83' }
          break
      }
    }, { immediate: true })
    return () =>
      <>
        <ConfigProvider theme-vars={themeVars.value} theme-vars-scope='global'>
          {slots.default?.()}
        </ConfigProvider>
      </>
  }
})
