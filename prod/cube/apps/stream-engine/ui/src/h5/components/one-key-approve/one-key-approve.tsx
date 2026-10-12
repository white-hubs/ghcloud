import { Button, Loading, Step, Steps } from 'vant'
import { defineComponent } from 'vue'
import './one-key-approve.less'
export const OneKeyApprove= defineComponent({
  emits:['update:show','confirm','handleApprove'],
  props:{
    taskQueen:{ /** 任务Queen */
      type:Object,
      default:()=>{
        return {
          ignore:[],
          success:[],
          fail:[],
          todo:[],
        }
      }
    },
    approveActive:{
      type:Number,
      default:0
    },
    show:{
      type:Boolean,
      default:false
    },
    taskLength:{ /*任务数*/
      type:Number,
      default:0
    },
    processNum:{ /*已处理任务数*/
      type:Number,
      default:0
    }
  },
  setup(props,{emit,slots}){
    const goBack=()=>{
      emit('update:show',false)
      emit('confirm')
      sessionStorage.removeItem('taskQueen')
    }
    const handleApprove=()=>{
      emit('handleApprove')
    }
    return ()=>
      <div v-show={props.show} class='approve-wrapper'>
        <Steps active={props.approveActive}>
          <Step>工单处理</Step>
          <Step>批量审批</Step>
          <Step>审批完成</Step>
        </Steps>
        {
          props.approveActive === 0
            ?<div class="approve-tips">
              <Loading size="24px" vertical>
                处理中... { props.processNum } / { props.taskLength }
              </Loading>
            </div>
          :props.approveActive === 1
            ?<div class="approve-tips" > 
              <Loading size="24px" vertical>
                审批中... { props.processNum } / { props.taskLength }
              </Loading>
            </div>
          :props.approveActive === 2?
            <div class="approve-tips" > 
              <p>审批结果</p>
              {slots.default?.()}
              {/* <Button v-show={[...props.taskQueen.ignore, ...props.taskQueen.fail].length>0} type="primary" block onClick={handleApprove} style='margin-bottom:10px'>手动审批</Button> */}
              <Button block onClick={goBack}>返回</Button>
            </div>
          :null
        }
      </div>
  }
})