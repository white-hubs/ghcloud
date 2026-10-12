
import { Input } from 'ant-design-vue'
import { defineComponent, onMounted, ref } from "vue";
import { inject } from 'vue';
export const TextInput=defineComponent({
  emits:["update:modelValue","clearValidate"],
  props:{
    modelValue:{
      type:String,
      default:''
    },
    placeholder:{
      type:String,
      default:''
    },
    readonly:{
      type:Boolean,
      default:false
    },
    onkeyup:{
      type:String,
      default:''
    },
    defaultValue:{
      type:String,
      default:''
    },
  },
  setup(props,{emit}){
    const value = ref(props.modelValue || props.defaultValue);
    const processType = inject('processType') as string
    const keyup = (ent: any) => {
      if (value.value && props.onkeyup){
        value.value = value.value.replace(props.onkeyup, "");
      }
      emit("update:modelValue", value.value);
      if(value.value){
        emit("clearValidate")
      }
    };
    onMounted(()=>{
      if(props.defaultValue&&processType==='add'){
        value.value=props.defaultValue
        emit("update:modelValue", value.value);
      }
    })
    return ()=>
    <>
    {
      !props.readonly
      ? <Input
        v-model={value}
        placeholder={!props.readonly ? props.placeholder : ''}
        onKeyup={keyup}
        onChange={()=>{emit('update:modelValue', value)}}
        disabled={props.readonly}
        />
      :<span>{ props.modelValue ?? '--' }</span>
    }
    </>
    }
})




