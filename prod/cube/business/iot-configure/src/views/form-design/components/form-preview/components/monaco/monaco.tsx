import { defineComponent, onMounted, onUnmounted, ref, nextTick } from 'vue'
import * as monaco from 'monaco-editor'
// @ts-ignore
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
// @ts-ignore
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import prettier from 'prettier/standalone'
import estree from 'prettier/plugins/estree'
import babel from 'prettier/plugins/babel'
import './monaco.less'
import { Button, Space } from '@ghcloud/cube-ui'
// 定义Worker环境
self.MonacoEnvironment = {
  getWorker (workerId, label): Worker {
    if (label === 'json') return new jsonWorker()
    return new editorWorker()
  }
}

export const MonacoEditor = defineComponent({
  props: {
    show: { type: Boolean, default: false },
  },
  emits: ['update:show', 'submit'],

  setup (props, { emit, expose }) {
    const monacoRef = ref<HTMLElement>()
    let editor: monaco.editor.IStandaloneCodeEditor

    // 生命周期
    onMounted(() => {
      nextTick(async () => {
        const monokaiTheme = await import('monaco-themes/themes/Monokai.json')
        monaco.editor.defineTheme('monokai', monokaiTheme.default as monaco.editor.IStandaloneThemeData)
        monaco.editor.setTheme('monokai')

        if (monacoRef.value) {
          editor = monaco.editor.create(monacoRef.value, {
            language: 'json',
            value: '// 从左侧拖入或点选组件进行表单设计'
          })
        }
      })
    })

    onUnmounted(() => {
      editor?.dispose()
    })

    // 暴露方法
    const setValue = async (language: string, val: string, parser?: string): Promise<void> => {

      if (!val) return
      const formatParser = parser || language
      const model = editor.getModel()
      model && monaco.editor.setModelLanguage(model, language)

      const code = await prettier.format(val, {
        parser: formatParser,
        plugins: [estree, babel],
        semi: false,
        singleQuote: true,
        vueIndentScriptAndStyle: false,
        useTabs: true,
        tabWidth: 4
      })
      editor.setValue(code)
    }

    const submit = (): void => {
      emit('submit', editor.getValue())
      emit('update:show', false)
    }
    expose({
      setValue,
    })


    return (): JSX.Element => (
      <>
        <div
          class="monacoMask"
          style={{
            transform: props.show ? 'translateX(-100%)' : 'translateX(0%)'
          }}
          onClick={() => emit('update:show', false)}
        >{JSON.stringify(props.show)}</div>

        <div
          class="monacoContainer"
          style={{
            transform: props.show ? 'translateX(0%)' : 'translateX(100%)'
          }}
        >
          <div class="monacoTopBar">
            <span class="title">Monaco Editor</span>
            <Space>
              <Button type='primary' onClick={submit}>提交</Button>
              <Button type='primary' danger onClick={() => emit('update:show', false)}>关闭</Button>
            </Space>
          </div>

          <div ref={monacoRef} class="monacoRef" />
        </div>
      </>
    )
  }
})
