import type { FormInstance } from 'ant-design-vue'
import { computed, defineComponent, h, ref, type PropType } from 'vue'

import { formItems } from "./form-items/index"

export const FormItemRender=defineComponent({
  props:{
    formData:{
      type:Object,
      default:()=>{
        return {}
      }
    },
    config:{
      type:Object,
      default:()=>{
        return {}
      }
    },
    formRef:{
      type:Object as PropType<FormInstance>,
      default:()=>{
        return {}
      }
    },
    value:{
      type:String||Number,
      default:null
    }
  },
  setup(props){
    const formItemRef=ref()

const _value = ref(props.value)
    const componentNotFoundMessage = computed(() => h('div', `尚未实现的表单元素[${props.config.name}]`))
    const validator = async () => {
      let validate = true
      let error = ''
      await formItemRef.value?.validator().then(() => {
        validate = true
      }).catch((err: string) => {
        error = err
        validate = false
      })
      if (!validate) {
        if (props.config.name === 'GroupList') {
          setTimeout(() => { clearValidate() }, 0);
        }
        return Promise.reject(error);
      }
      return Promise.resolve();
    }
    const clearValidate = () => {
      if (props.formRef)
        props.formRef.clearValidate(props.config.id)
    }
        //对外暴露验证方法
    defineExpose({
      validator
    })
    return ()=>
      <component ref={props.formRef} formData={props.formData} config={props.config}
    is={formItems[props.config.name] ?? componentNotFoundMessage.value} v-model={_value} v-bind={props.config.props}
    onClearValidate={clearValidate} />
  }
})