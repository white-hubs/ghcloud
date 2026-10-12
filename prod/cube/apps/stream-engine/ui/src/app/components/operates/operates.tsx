import {  defineComponent, ref, type PropType } from 'vue'
import {Button, Space} from 'ant-design-vue'
import {FormProcessOperate, FormProcessOperateEnum, ProcessType} from '@ghcloud/cube-stream-engine-core'
import type { ButtonType } from 'ant-design-vue/lib/button'
export const Operates=defineComponent({
  emits:['goBack','submit','process'],
  props:{
    operateButtons:{  //按钮组
      type: Array as PropType<FormProcessOperate[]>,
      default:()=>{
        return []
      }
    },
    type:{
      type:String,
      default:'add'
    },
  },
  setup(props,{emit}){
    const isLoading=ref(false) //发起loading
    const showSignModal = ref(false); //打开审批意见弹窗
    const handlingName = ref(""); //处理流程
    // 返回
    const goBack=()=>{
      emit('goBack')
    }
    // 发起
    const submit=()=>{
      emit('submit')
    }
    // 流程操作
    const processHandle=(operateItem:FormProcessOperate)=>{
      emit('process',operateItem)
    }
    return ()=>
      <Space size={10} style={{display:'flex'}}>
        <Button onClick={goBack}>返回</Button>
        <Button type="primary" onClick={submit} loading={isLoading.value} v-show={props.type === ProcessType.ADD}>发起</Button>
        {
          props.operateButtons.map((item,index)=>
            <Button 
              key={index} 
              onClick={()=>{processHandle(item)}} 
              type={FormProcessOperateEnum[item].btnType as ButtonType} 
              loading={handlingName.value === item && !showSignModal}>
              {FormProcessOperateEnum[item].cnName}
            </Button>
        )}
      </Space>
  }
})