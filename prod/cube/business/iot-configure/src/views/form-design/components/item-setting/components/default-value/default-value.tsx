import { useFormDesignStore } from '@/pinia-store/form-design'
import { DataType } from '@/views/form-design/core/widget'
import { WidgetUI } from '@/views/form-design/core/widget-ui/widget-ui'
import { Input } from '@ghcloud/cube-ui'
import { defineComponent } from 'vue'

export const DefaultValue = defineComponent({
  setup () {
    const { formDesign } = useFormDesignStore()


    return (): JSX.Element =>{
      if (!formDesign.formItemSelect){
        return <div>请选择一个表单项</div>
      }

      if (['textAlert'].includes(formDesign.formItemSelect.name)){
        return <Input v-model:value={formDesign.formItemSelect.props.value} />
      } else if (['input'].includes(formDesign.formItemSelect.name)){
        const type = formDesign.formItemSelect.props.dataType === DataType.STRING ? 'text' : 'number'
        return <Input type={type} v-model:value={formDesign.formItemSelect.props.value} />
      } else if (['select', 'radioGroup', 'checkboxGroup'].includes(formDesign.formItemSelect.name)){
        return <WidgetUI formItem={formDesign.formItemSelect} v-model:value={formDesign.formItemSelect.props.value} />
      } else {
        return <div>未实现</div>
      }
    }
  }
})