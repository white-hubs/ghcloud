import { Card, CloseOutlined, Empty, Form, FormItem, Space } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, watchEffect } from 'vue'
import styles from './form-preview.module.less'
import Sortable from 'sortablejs'
import { useFormDesignStore } from '@/pinia-store/form-design'
import { widgetDefine, type FormItem as FormItemItf } from '../../core/widget'
import { WidgetUI } from '../../core/widget-ui/widget-ui'
import { Button } from 'ant-design-vue'
import { MonacoEditor } from './components/monaco/monaco'

/** 表单预览 */
export const FormPreview = defineComponent({
  setup () {
    const FormRef = ref()
    const MonacoEditorRef = ref()
    const showEditor = ref(false)
    const formDesignStore = useFormDesignStore()
    const { formDesign, clearFormList, toJson, fromJson } = useFormDesignStore()
    watchEffect(()=>{
      if (formDesignStore.formRules.length){
        setTimeout(() => {
          FormRef.value?.clearValidate()
        }, 0);
      }
      setTimeout(() => {
        FormRef.value?.clearValidate()
      }, 0);
    })
    onMounted(() => {
      const formPreviewDom = document.querySelector('.form-preview .iot-configure-card-body .iot-configure-form')
      if (!formPreviewDom) return

      new Sortable(formPreviewDom as HTMLElement, {
        group: {
          name: 'formDesign',
        },
        animation: 150,
        onAdd: (evt): void=> {
          // 阻止 SortableJS 默认的 DOM 复制行为
          evt.item.remove();

          // 将被拖动的元素添加到目标位置
          (typeof evt.oldIndex !== 'undefined' && typeof evt.newIndex !== 'undefined') &&
          formDesign.formList.splice(evt.newIndex, 0, {
            ...widgetDefine[evt.oldIndex],
            key: widgetDefine[evt.oldIndex].name + '_' + Date.now().toString(),
          })
        },
        onUpdate: (evt): void => {
          const { oldIndex, newIndex } = evt
          if (typeof oldIndex === 'undefined' || typeof newIndex === 'undefined') return
          const [removed] = formDesign.formList.splice(oldIndex, 1)
          formDesign.formList.splice(newIndex, 0, removed)
        }
      })
      formDesignStore.formDesign.formItemSelect = undefined
      if (formDesignStore.formDesign.formList.length === 0) {
        formDesignStore.formDesign.formList = [...formDesignStore.formDesign.formList]
      }
    })

    function handleChooseItem (item: FormItemItf): void {
      formDesign.formItemSelect = item
    }

    function toJSONInEditor (): void {
      MonacoEditorRef.value.setValue('json', toJson())
      showEditor.value = true
    }

    function parseJSONFormEditor (val: string): void {
      fromJson(val)
      formDesign.formItemSelect = undefined
    }

    return (): JSX.Element =>
      <Card
        title='表单设计'
        class={`${styles['form-preview']} form-preview`}
        v-slots={{
          extra: () => <Space>
            <Button type='primary' onClick={toJSONInEditor} size='small'>JSON编辑</Button>
            <Button type='primary' size='small'>预览</Button>
            <Button type='primary' danger onClick={clearFormList} size='small'>清空</Button>
          </Space>
        }}
      >
        <Form rules={formDesignStore.formRules} ref={FormRef}>
          {
            formDesign.formList.map((item, index) =>
              <div key={item.key} class={`${styles['form-item']} ${formDesign.formItemSelect?.key === item.key ? styles['selected'] : ''} form-item` } onClick={()=>{
                handleChooseItem(item)
              }}>
                <FormItem label={item.label} name={item.key.toString()}>
                  <WidgetUI formItem={item} readonly={true} />
                </FormItem>
                <div class={styles['close']} onClick={(evt)=>{
                  evt.stopPropagation();formDesign.formList.splice(index, 1)
                }}>
                  <CloseOutlined />
                </div>
              </div>)
          }
        </Form>
        {
          formDesign.formList.length === 0 && <Empty />
        }
        <MonacoEditor ref={MonacoEditorRef} v-model:show={showEditor.value} onSubmit={parseJSONFormEditor} />
      </Card>
  }
})
