import { Cell, CellGroup, Popup } from 'vant'
import { defineComponent, ref, watch } from 'vue'
import './approval-result.less'
interface Queen{
  title: string, 
  desc: string,
  processId:string;
  reason: string; 
}
export const ApprovalResult= defineComponent({
  emits:['update:show','confirm'],
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
    show:{
      type:Boolean,
      default:false
    }
  },
  setup(props,{emit}){
    const showPopup = ref(false)
    const confirmType=ref('ok')
    watch(()=>props.show,()=>{
      showPopup.value=props.show
    })
    /** 结果详情 */
    const resultData = ref<Queen[]>([])
    const showResultPopup = ref(false)
    //查看结果
    const showResult=async(type:'success'|'fail'|'ignore') => {
      resultData.value=props.taskQueen.value[type].map((e: Queen)=>{
        return {
          title:e.title,
          desc:e?.reason ??'成功',
          processId:e.processId
        }
      })
      if(resultData.value.length === 0) return;
      confirmType.value='back'
    showResultPopup.value = true
    }
    return ()=>
      <>
        <div class="approve-tips">
          <p class="result">
            <span class="success" onClick={()=>showResult('success')}>成功：{ props.taskQueen.value?.success.length }</span>
            <span class="fail" onClick={()=>showResult('fail')}>失败：{ props.taskQueen.value?.fail.length }</span>
            <span class="ignore" onClick={()=>showResult('ignore')}>忽略：{ props.taskQueen.value?.ignore.length }</span>
          </p>
        </div>
        <Popup v-model:show={showResultPopup.value} position="bottom" style=" height: 50vh ">
          <CellGroup >
            {
              resultData.value.map(item=>
                <Cell title={item.title} value={item.desc} key={item.processId} />
              )
            }
          </CellGroup>
        </Popup>
      </>
  }
})