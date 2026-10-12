import { defineComponent, onBeforeUnmount, ref, shallowRef, onMounted, watch, reactive, nextTick } from 'vue'
import type { PropType } from 'vue'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import { Button, Tooltip } from '@ghcloud/cube-ui'
import './template-editor.less'
import { TEMPLATE_VARIABLES, type TemplateVariable } from '@ghcloud/cube-operating-room-service'
import { authStore } from '@/api/auth-store'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'

const BUILT_IN_VARIABLES = [
  { key: 'company', label: '检测公司', description: '检测公司的名称（内置动态数据）', isBuiltIn: true },
  { key: 'reportNumber', label: '报告编号', description: '报告的唯一编号（内置动态数据）', isBuiltIn: true },
]

export const TemplateEditor = defineComponent({
  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入内容...'
    },
    height: {
      type: String,
      default: '400px'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    toolbarConfig: {
      type: Object as PropType<Partial<IToolbarConfig>>,
      default: () => ({})
    },
    showVariableTools: {
      type: Boolean,
      default: true
    },
  },
  emits: ['update:value', 'change'],
  setup (props, { emit }) {
    const editorRef = shallowRef<IDomEditor>()
    const editorContainerRef = ref<HTMLDivElement>()
    const valueHtml = ref(props.value || '')
    const editorConfig = ref<Partial<IEditorConfig>>({
      placeholder: props.placeholder,
      readOnly: props.disabled,
      MENU_CONF: {
        // 图片上传配置
        uploadImage: {
          server: '/api/file/upload/temporary',
          fieldName: 'file',
          maxFileSize: 10 * 1024 * 1024, // 限制上传文件大小，默认为10M
          maxNumberOfFiles: 5, // 限制一次最多能传几张图片
          allowedFileTypes: ['image/*'],
          meta: {
            businessKey: 'mdata',
            sceneCode: GLOBAL_SCENE_CODE.medicalCleanliness ?? ''
          },
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            tenant: authStore.tenant,
            terminal: authStore.terminal,
          },
          customInsert (res: { path: string; }, insertFn: Function) {
            if (res) {
              insertFn(res.path)
            } else {
            }
          },
        }
      }
    })
    const customToolbarConfig = ref<Partial<IToolbarConfig>>({
      ...props.toolbarConfig
    })
    const variableState = reactive({
      showSuggestions: false,
      suggestions: [] as TemplateVariable[],
      selectedIndex: 0,
      triggerPos: { left: '0px', top: '0px' },
      searchText: '',
      invalidVariables: [] as string[]
    })
    const allVariables = [...TEMPLATE_VARIABLES, ...BUILT_IN_VARIABLES]
    const initEditor = (): void => {
      customToolbarConfig.value = {
        ...props.toolbarConfig
      }
      editorConfig.value = {
        placeholder: props.placeholder,
        readOnly: props.disabled,
        MENU_CONF: {}
      }
    }
    const handleCreated = (editor: IDomEditor): void => {
      editorRef.value = editor
      if (props.disabled) {
        editor.disable()
      }
      if (props.showVariableTools) {
        setupVariableListeners(editor)
      }
      validateTemplateVariables(editor.getHtml())
    }

    const handleChange = (editor: IDomEditor): void => {
      const html = editor.getHtml()
      valueHtml.value = html
      emit('update:value', html)
      emit('change', html)
      if (props.showVariableTools) {
        validateTemplateVariables(html)
      }
    }

    watch(() => props.value, (newValue) => {
      if (editorRef.value && newValue !== editorRef.value.getHtml()) {
        editorRef.value.setHtml(newValue || '')
        if (props.showVariableTools) {
          validateTemplateVariables(newValue || '')
        }
      }
    })

    watch(() => props.disabled, (disabled) => {
      if (editorRef.value) {
        if (disabled) {
          editorRef.value.disable()
        } else {
          editorRef.value.enable()
        }
      }
    })

    onBeforeUnmount(() => {
      const editor = editorRef.value
      if (editor === null) return
      editor && editor.destroy()
    })

    onMounted(() => {
      initEditor()
      document.addEventListener('click', handleClickOutside)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
    })
    const handleClickOutside = (e: MouseEvent): void => {
      if (variableState.showSuggestions) {
        const target = e.target as HTMLElement
        const suggestionEl = document.querySelector('.variable-suggestions')
        if (suggestionEl && !suggestionEl.contains(target)) {
          variableState.showSuggestions = false
        }
      }
    }
    const setupVariableListeners = (editor: IDomEditor): void => {
      const editorElem = editor.getEditableContainer()
      editorElem.addEventListener('keydown', (e: Event) => {
        const keyEvent = e as KeyboardEvent
        if (variableState.showSuggestions) {
          handleSuggestionKeydown(keyEvent)
          return
        }
        if (keyEvent.key === '@' && !keyEvent.ctrlKey && !keyEvent.altKey && !keyEvent.metaKey) {
          setTimeout(() => {
            const selection = window.getSelection()
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0)
              const rect = range.getBoundingClientRect()
              const editorRect = editorElem.getBoundingClientRect()
              variableState.triggerPos = {
                left: `${rect.left - editorRect.left}px`,
                top: `${rect.bottom - editorRect.top + 5}px`
              }
              variableState.suggestions = allVariables
              variableState.selectedIndex = 0
              variableState.searchText = ''
              variableState.showSuggestions = true
            }
          }, 0)
        }
      })

      editorElem.addEventListener('input', () => {
        if (!variableState.showSuggestions) return
        const text = getTextBeforeCursor()
        if (text && text.startsWith('@')) {
          const searchText = text.substring(1) // 去掉 @
          variableState.searchText = searchText
          if (searchText) {
            variableState.suggestions = allVariables.filter(v =>
              v.key.toLowerCase().includes(searchText.toLowerCase()) ||
              v.label.toLowerCase().includes(searchText.toLowerCase()))
          } else {
            variableState.suggestions = allVariables
          }

          variableState.selectedIndex = 0
        } else {
          // 如果光标前没有 @，关闭建议框
          variableState.showSuggestions = false
        }
      })
    }
    const handleSuggestionKeydown = (e: KeyboardEvent): void => {
      if (!variableState.showSuggestions) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          variableState.selectedIndex = (variableState.selectedIndex + 1) % variableState.suggestions.length
          break
        case 'ArrowUp':
          e.preventDefault()
          variableState.selectedIndex = (variableState.selectedIndex - 1 + variableState.suggestions.length) % variableState.suggestions.length
          break
        case 'Enter':
        case 'Tab':
          e.preventDefault()
          insertVariable(variableState.suggestions[variableState.selectedIndex])
          break
        case 'Escape':
          e.preventDefault()
          variableState.showSuggestions = false
          break
      }
    }

    const getTextBeforeCursor = (): string => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return ''

      const range = selection.getRangeAt(0).cloneRange()
      range.collapse(true)

      // 创建一个新的范围，从当前段落开始到光标位置
      const tempRange = document.createRange()
      tempRange.selectNodeContents(range.startContainer.parentElement || range.startContainer)
      tempRange.setEnd(range.startContainer, range.startOffset)

      // 获取文本内容
      const text = tempRange.toString()

      // 从后往前找到最后一个非变量内的 $ 符号
      let lastIndex = text.length - 1
      let inVariable = false
      let bracketCount = 0

      for (let i = text.length - 1; i >= 0; i--) {
        if (text[i] === '}') {
          inVariable = true
          bracketCount++
        } else if (text[i] === '{') {
          bracketCount--
          if (bracketCount === 0) inVariable = false
        } else if (text[i] === '@' && !inVariable) {
          lastIndex = i
          break
        }
      }

      return text.substring(lastIndex)
    }

    // 插入变量
    const insertVariable = (variable: TemplateVariable): void => {
      if (!editorRef.value) return
      // 确保编辑器获得焦点
      editorRef.value.focus()

      // 删除已输入的变量触发文本（如 @pat）
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const tempRange = document.createRange()
        tempRange.selectNodeContents(range.startContainer.parentElement || range.startContainer)
        tempRange.setEnd(range.startContainer, range.startOffset)

        const text = tempRange.toString()
        let deleteCount = 0

        // 计算需要删除的字符数（从 @ 开始）
        for (let i = text.length - 1; i >= 0; i--) {
          if (text[i] === '@') {
            deleteCount = text.length - i
            break
          }
        }

        if (deleteCount > 0) {
          // 删除已输入的触发文本
          for (let i = 0; i < deleteCount; i++) {
            editorRef.value.deleteBackward('character')
          }
        }
      }

      // 插入格式化的变量
      const variableText = `${'{{' + variable.key + '}}'}`
      editorRef.value.insertText(variableText)
      // 关闭建议框
      variableState.showSuggestions = false

      // 插入后确保编辑器保持焦点
      setTimeout(() => {
        if (editorRef.value) {
          editorRef.value.focus()
        }
      }, 0)
    }
    // 验证模板变量
    const validateTemplateVariables = (html: string): boolean => {
      const invalidVars: string[] = []
      const regex = /\${([^}]+)}/g
      let match

      while ((match = regex.exec(html)) !== null) {
        const varName = match[1]
        // 检查变量是否在预定义列表中
        const isValid = allVariables.some(v => v.key === varName)
        if (!isValid) {
          invalidVars.push(varName)
        }
      }

      variableState.invalidVariables = invalidVars

      // 如果有无效变量，添加错误样式
      nextTick(() => {
        if (editorContainerRef.value) {
          const editorElement = editorContainerRef.value.querySelector('.w-e-text-container')
          if (editorElement) {
            if (invalidVars.length > 0) {
              editorElement.classList.add('has-invalid-variables')
            } else {
              editorElement.classList.remove('has-invalid-variables')
            }
          }
        }
      })

      return invalidVars.length === 0
    }

    // 高亮显示无效变量
    const highlightInvalidVariables = (): void => {
      if (!editorRef.value || variableState.invalidVariables.length === 0) return

      const html = editorRef.value.getHtml()
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = html
      const textNodes = []
      const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null)

      let node
      while ((node = walker.nextNode())) {
        textNodes.push(node)
      }
      let hasChanges = false
      for (const textNode of textNodes) {
        const text = textNode.nodeValue || ''
        let newText = text

        for (const invalidVar of variableState.invalidVariables) {
          const regex = new RegExp(`\\{${invalidVar}\\}`, 'g')
          if (regex.test(newText)) {
            newText = newText.replace(regex, `<span class="invalid-variable">{${invalidVar}}</span>`)
            hasChanges = true
          }
        }

        if (text !== newText) {
          const span = document.createElement('span')
          span.innerHTML = newText
          textNode.parentNode?.replaceChild(span, textNode)
        }
      }

      if (hasChanges) {
        editorRef.value.setHtml(tempDiv.innerHTML)
        const style = document.createElement('style')
        style.textContent = `
          .invalid-variable {
            background-color: #ffebee;
            color: #f44336;
            border-bottom: 1px wavy #f44336;
          }
        `
        document.head.appendChild(style)
      }
    }
    return (): JSX.Element => (
      <div class="report-template-editor" style={{ height: props.height }}>
        <Toolbar
          editor={editorRef.value}
          defaultConfig={customToolbarConfig.value}
          mode="default"
          style={{ borderBottom: '1px solid #ccc' }}
          class="toolbar-container"
        />
        {props.showVariableTools && (
          <div class="variable-toolbar">
            {variableState.invalidVariables.length > 0 && (
              <Tooltip
                title={`发现 ${variableState.invalidVariables.length} 个无效变量: ${variableState.invalidVariables.join(', ')}`}
                color="red"
              >
                <Button
                  type="primary"
                  danger
                  size="small"
                  onClick={highlightInvalidVariables}
                >
                  {variableState.invalidVariables.length} 个无效变量
                </Button>
              </Tooltip>
            )}
          </div>
        )}
        <Editor
          defaultConfig={editorConfig.value}
          mode="default"
          modelValue={valueHtml.value}
          onChange={(editor: IDomEditor) => {
            valueHtml.value = editor.getHtml()
          }}
          style={{ height: 'calc(100% - 42px)', overflowY: 'hidden' }}
          onOnCreated={handleCreated}
          onOnChange={handleChange}
          class="editor-container"
        />
        {variableState.showSuggestions && variableState.suggestions.length > 0 && (
          <div
            class="variable-suggestions"
            style={{
              left: variableState.triggerPos.left,
              top: variableState.triggerPos.top,
              position: 'absolute',
              zIndex: 1000,
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              maxHeight: '200px',
              overflow: 'auto',
              width: '250px'
            }}
          >
            {variableState.suggestions.map((variable, index) => (
              <div
                key={variable.key}
                class={`suggestion-item ${index === variableState.selectedIndex ? 'selected' : ''}`}
                onClick={() => {
                  insertVariable(variable)
                }}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  backgroundColor: index === variableState.selectedIndex ? '#e6f7ff' : 'transparent',
                  borderBottom: '1px solid #f0f0f0'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{variable.label}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{'{' + variable.key + '}'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
})