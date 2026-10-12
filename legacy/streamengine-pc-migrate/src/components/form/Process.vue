<template>
  <a-spin v-if="!initialized" class="index-spin" size="large" />
  <div :style="{ visibility: initialized ? 'visible' : 'hidden' }">
    <ul class="template-timeline timeline" v-if="historicalPath.length > 0">
      <li class="template-timeline-item" v-for="(item, i) in historicalPath" :key="i">
        <div class="template-timeline-item-tail"></div>
        <div class="template-timeline-item-head">{{ item.nodeName }}</div>
        <!--历史节点-->
        <div class="template-timeline-item-content" v-if="item.assigneeList.length === 0">
          <div class="self-select-item" v-if="item.selfSelect">
            <template
              v-if="item.selectRange&&selfSelectApproveUsers[item.nodeKey]&&selfSelectApproveUsers[item.nodeKey].length">
              <template v-for="(selectedUser,index) in selfSelectApproveUsers[item.nodeKey]">
                <Avatar show-close @close="()=>handleCloseUser(item,index)">{{
                  getAvatarText(selectedUser.name) }}</Avatar>
              </template>
            </template>
            <div class="add-button" @click="()=>handleOpenSelectUser(item)">
              <span>+</span>
            </div>
            <div class="desc">
              <div>发起人自选</div>
              <div class="range">自选范围：{{ item.selectRange?.typeName }}</div>
            </div>
          </div>
          <div class="content-item" v-for="(taskOperationItem, index) in item.taskOperations" :key="index">
            <!--处理人-->
            <template v-if="taskOperationItem.operation">
              <div class="item-boby">
                <Avatar>{{ getAvatarText(taskOperationItem.operation.operator.name) }}</Avatar>
                <div class="info">
                  <span class="title">{{ getTypeName(taskOperationItem.operation.type) }}</span>
                  <span class="desc">
                    <template v-if="!['COPY', 'SUBMIT'].includes(taskOperationItem.operation.type)">
                      <span style="margin-right: 120px">
                        {{ taskOperationItem.operation.operator.name }}
                        <span style="color: var(--template-primary-color)"
                          v-if="taskOperationItem.operation.type === 'PASS'">(已同意)</span>
                        <span style="color: var(--template-error-color)"
                          v-else-if="taskOperationItem.operation.type === 'REJECT'">(已拒绝)</span>
                      </span>
                      时间：{{ dayjs(taskOperationItem.operation.createTime).format("YYYY-MM-DD HH:mm:ss") }}
                      <span style="margin-left: 120px"
                        v-if="item.approvalCommentConfig?.supportHandwrittenSignature&&taskOperationItem.operation.approvalOpinion?.sign">
                        电子签名:
                        <SignPic :sign-id="taskOperationItem.operation.approvalOpinion.sign" />
                      </span>
                    </template>
                    <template v-else>
                      时间：{{ dayjs(taskOperationItem.operation.createTime).format("YYYY-MM-DD HH:mm:ss") }}
                    </template>
                  </span>
                  <span class="opinion-text" v-if="taskOperationItem.operation.type!=='TRANSFER'&&item.approvalCommentConfig?.supportText">审批意见：{{taskOperationItem.operation.approvalOpinion?.text ||'--'}}</span>
                  <span class="opinion-text" v-if="taskOperationItem.operation.type==='TRANSFER'">转交备注：{{taskOperationItem.operation.approvalOpinion?(taskOperationItem.operation.approvalOpinion?.text ||'--'):'--'}}</span>
                </div>
              </div>
            </template>
            <!--待处理人-->
            <template v-if="taskOperationItem.residualOperator">
              <div class="item-boby">
                <Avatar>{{ getAvatarText(taskOperationItem.residualOperator.name) }}</Avatar>
                <div class="info" style="justify-content: center;">
                  <span class="title">{{taskOperationItem.residualOperator.name}}&nbsp;&nbsp;待处理</span>
                </div>
              </div>
            </template>
            <!--节点评论-->
            <template v-if="taskOperationItem.feedbackLogs">
              <ul class="comment" >
                <li v-for="comment in taskOperationItem.feedbackLogs">
                  <div class='name'>
                    <span>{{comment.feedbackUser||'--'}}</span>
                    <span style="margin-left:10px">{{ comment.feedbackTime?dayjs(comment.feedbackTime).format('YYYY-MM-DD HH:mm:ss'):''}}</span></div>
                  <div class="desc">{{comment.feedbackInfo}}</div>
                  <div class="flex-start" style="display: grid;grid-template-columns: repeat(9, 1fr);gap: 5px; ">
                    <a-image :src="file.path" width="100px" height="100px"  style='padding:5px' v-for="file in comment.fileVOList.filter(e=>!typeList.includes(e.type))" ></a-image>
                  </div>   
                  <div class="flex-start" v-for="file in comment.fileVOList.filter(e=>typeList.includes(e.type))">
                    <div @click="preview(file)" style='margin-right: 10px;text-align: center;color: #e2e2e2;cursor: pointer;'>
                      <div class='file-name'>{{ file.name }}</div>
                    </div>
                  </div>   
                </li>
              </ul>
            </template>
          </div>
        </div>
        <!--预展示节点-->
        <div class="template-timeline-item-content">
          <SetApprover :assignee-list="item.assigneeList" :node-id="item.nodeKey" :pre-add-sign="item.preAddSign" />
        </div>
      </li>
    </ul>
    <a-empty v-else description="暂无进度" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
    <SelfSelectUser :selectedRows="selfCurrentSelected.selectedRows" :url="currentSelectUrl"
      :active-id="selfCurrentSelected.activeIds" @selected="handleSelfSelected" v-model:visible="selectedUserVisible"
      :search-params="searchParams" />
  </div>
</template>
<script setup lang="ts">
import { getProcessLine, getProcessInstanceHistoricalPath } from "@/api/flow"
import { FileState, kkFilePreview } from '@ghcloud/cube-utils'
import { ProcessHistoricalPath } from "@/domain/form-flow"
import { Empty } from "ant-design-vue"
import dayjs from "dayjs"
import { Ref, computed, inject, nextTick, onMounted, ref, watch } from "vue"
import SelfSelectUser from './components/SelfSelectUser.vue'
import Avatar from "./components/Avatar.vue"
import SetApprover from "./components/SetApprover.vue"
import SignPic from "./components/SignPic.vue"
import { FlowForm } from "@/domain/form-flow"
import { ProcessType } from "@/typings/process"
const processId = inject("processId") as string;
const props=defineProps({
  activeTab: {
    type: Number,
    default: 2
  },
})
const flowForm = inject("flowForm") as Ref<FlowForm>;
const searchParams=ref<{key:string,value:string[]}[]>([])
const historicalPath = ref<ProcessHistoricalPath[]>([]);
const initialized = ref(false)
const selectedUserVisible=ref(false)
const selfSelectApproveUsers=ref<Record<string,any[]>>({})
const selfCurrentSelected=ref<Record<string,any>>({
  type: '',
  nodeKey:'',
  activeIds:[],
  selectedRows:[]
})
const handleCloseUser=(item:ProcessHistoricalPath,index:number)=>{
  selfSelectApproveUsers.value[item.nodeKey].splice(index,1)
}
const currentSelectUrl=computed(()=>{
  const selectedUrlEnum:Record<string,string>={
    ASSIGN_USER:'batchGetUserByIds',
    ROLE:'batchGetUserByRoleIds',
    ALL:'getStaffList'
  }
  return selectedUrlEnum[selfCurrentSelected.value.type] ?? 'getStaffList'
})

const handleSelfSelected=(selectedVals:any[])=>{
  if(!selfCurrentSelected.value.nodeKey) return;
  selfSelectApproveUsers.value[selfCurrentSelected.value.nodeKey] = selectedVals
}
/*获取流程*/
const getLine = async () => {
  const typeEnum:Record<string,string>={
    ASSIGN_USER:'指定人员',
    ROLE:'角色',
    ALL:'所有'
  }
  const res= await getProcessLine({processInstanceId: processId,flowKey:flowForm.value.flowKey})
  historicalPath.value = res.map((item: ProcessHistoricalPath)=>{
    return {
      ...item,
      selectRange:item.selectRange?{
        ...item.selectRange,
        typeName:typeEnum[item.selectRange.type]
      }:{}
    }
  })
  nextTick(() => {
    //左侧文字宽度设置
    const heads = document.querySelectorAll('.template-timeline-item-head')
    const widthArr: number[] = []
    heads.forEach((item: Element) => {
      const ele = item as HTMLElement
      widthArr.push(ele.offsetWidth)
    })
    const maxWidth = Math.max(...widthArr)
    heads.forEach((item: Element) => {
      const ele = item as HTMLElement
      ele.style.width = maxWidth + 'px'
    })

    //虚线位置设置
    const lines = document.querySelectorAll('.template-timeline-item-tail')
    lines.forEach((item: Element) => {
      const ele = item as HTMLElement
      ele.style.left = maxWidth + 10.5 + 'px'
    })
    initialized.value = true
  })
};
const handleOpenSelectUser=(ProcessHistoricalPath:ProcessHistoricalPath)=>{
  const {selectRange,nodeKey}=ProcessHistoricalPath
  if(!selectRange) {
    return
  };
  selfCurrentSelected.value.type=selectRange.type
  selfCurrentSelected.value.nodeKey=nodeKey
  if(
    selfSelectApproveUsers.value[selfCurrentSelected.value.nodeKey]&&selfSelectApproveUsers.value[selfCurrentSelected.value.nodeKey].length
  ){
    selfCurrentSelected.value.activeIds= [...selfSelectApproveUsers.value[selfCurrentSelected.value.nodeKey].map(item=>item.id)]
    selfCurrentSelected.value.selectedRows=[...selfSelectApproveUsers.value[selfCurrentSelected.value.nodeKey]] 
  }else{
    selfCurrentSelected.value.activeIds=[]
    selfCurrentSelected.value.selectedRows=[]
  }
  searchParams.value= [{key:'ids',value:selectRange.ids}]
  selectedUserVisible.value=true

}
const getTypeName = (type: string) => {
  let name = "处理中";
  switch (type) {
    case "SUBMIT":
      name = "提交";
      break;
    case "UNDO":
      name = "撤销";
      break;
      case "WITHDRAW":
      name = "撤回";
      break;
    case "REPEAT":
      name = "重新提交";
      break;
    case "APPROVAL":
      name = "审批";
      break;
    case "BACK":
      name = "退回";
      break;
    case "COPY":
      name = "抄送";
      break;
    case "REJECT":
      name = "拒绝";
      break;
    case "FINISHED":
      name = "完成";
      break;
    case "TRANSFER":
      name = "转交";
      break;
    case "PASS":
      name = "审批通过";
      break;
    default:
      break;
  }
  return name;
};

//名字截取最后两个字符
const getAvatarText = computed(() => {
  return (text: string): string => {
    return text.substring(text.length > 2 ? text.length - 2 : 0)
  }
})
const typeList = ['doc', 'docx', 'excel', 'xlsx', 'xls', 'pdf', 'ppt', 'txt','mp4']
const preview = (item: FileState): void => {
  if (typeList.includes(item.type ?? '')) {
    kkFilePreview(item)
  }
}
watch(()=>props.activeTab,()=>{
  if(props.activeTab===2){
    getLine()
  }
},{immediate:true})
defineExpose({
  selfSelectApproveUsers
})
onMounted(() => {
  getLine();
});
</script>
<style scoped lang="less">
.index-spin {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.timeline {
  box-sizing: border-box;
  width: 850px;
  max-width: calc(100% - 80px);
  margin-top: 35px;
  padding: 0;
  list-style: none;

  .template-timeline-item {
    position: relative;
    display: flex;
    margin: 0;
    padding: 0 0 20px;
    font-size: 14px;
    list-style: none;
  }

  > .template-timeline-item:last-child {
    .template-timeline-item-tail {
      display: none;
    }
  }

  .template-timeline-item-head {
    display: inline-block;
    width: auto;
    height: auto;
    border: 0;
    color: black;
    position: relative;
    white-space: nowrap;
    text-align: right;
    flex-shrink: 0;

    &::after {
      position: absolute;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 1px solid #999999;
      right: -19px;
      top: 4px;
      content: '';
    }
  }

  .template-timeline-item-tail {
    position: absolute;
    height: calc(100% - 20px);
    top: 20px;
    border-left: 1px dashed #d8d8d8;
  }

  .template-timeline-item-content {
    position: relative;
    display: flex;
    flex-flow: column;
    top: -15px;
    margin: 0 0 0 30px;
    width: 100%;
    word-break: break-word;

    .self-select-item {
      display: flex;
      gap: 10px;
      font-size: 16px;

      .add-button {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 20px;
        width: 50px;
        height: 50px;
        border-radius: 4px;
        cursor: pointer;
        border: 1px dashed #d8d8d8;

        span {
          margin-bottom: 4px;
        }
      }

      .desc {
        display: flex;
        height: 50px;
        flex-direction: column;
        justify-content: space-between;

        .range {
          font-size: 14px;
          font-weight: 400;
          color: #999999;
          white-space: nowrap;

        }
      }

    }

    .content-item {
      display: inline-flex;
      flex-flow: column;
      margin-bottom: 10px;

      .item-boby {
        display: flex;
      }

      .info {
        display: inline-flex;
        flex-flow: column;
        margin-left: 12px;
        width: 100%;

        .title {
          font-size: 16px;
          font-weight: 400;
          color: rgba(0, 0, 0, 0.85);
          margin-bottom: 4px;
          text-align: left;

          .down-outline {
            font-size: 12px;
            margin-left: 5px;
            transform: scaleX(1.2) scaleY(0.8);
          }
        }

        .desc {
          font-size: 14px;
          font-weight: 400;
          color: #999999;
          white-space: nowrap;
        }

        .opinion-text {
          background: #f2f2f7;
          border-radius: 4px 4px 4px 4px;
          padding: 8px 10px;
          font-size: 14px;
          font-weight: 400;
          color: #999999;
          min-height: 60px;
          max-width: 798px;
          margin-top: 13px;
          text-align: left;
        }
      }
    }
    .comment{
      width: calc(100% - 62px);
      min-width: 588px;
      transform: translateX(62px);
      height: auto;
      padding: 0px;
      li{
        text-decoration: none;
        list-style: none;  /* 新增清除列表样式 */
        padding:10px;
        border-radius: 4px;
        background: #f2f2f6;
        margin:10px 0px;
      }
      .name{
        padding:4px;
        font-size: 14px;
        color: rgba(0,0,0,0.85);
      }
      .desc{
        padding:4px;
        font-size: 14px;
        color: #999999;
      }
    }
  }
}
.file-name{color:var(--cube-theme-var--primary-color)}
.flex-start{
  display: flex;
  justify-content: flex-start;
}
</style>
