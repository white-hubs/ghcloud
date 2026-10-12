<template>
  <CubeLoading :visible="loading" />
  <div class="process">
    <div class="wrap">
      <div class="timeline">
        <template v-for="(item, index) in processList" :key="item.nodeKey">
          <div class="item dotted" v-for="(item2, index2) in item.personList" :key="index2">
            <div class="left">{{ item2.person.name.substring(item2.person.name.length>2?item2.person.name.length-2:0) }}</div>
            <div class="right">
              <div class="top">
                <div class="txt">{{ item.nodeName }}</div>
                <div class="txt">{{ item2.person.createTime?dayjs(item2.person.createTime).format('YYYY-MM-DD HH:mm:ss'):'' }}</div>
              </div>
              <div class="info title">{{ item2.person.name }}</div>
              <div class="info tip success">{{ getTypeName(item2.person.type) }}</div>
              <ul class="comment">
                <li v-for="comment in item2.feedbackLogs">
                  <div class='name'>
                    <span>{{comment.feedbackUser||'--'}}</span>
                    <span style="margin-left:10px">{{ comment.feedbackTime?dayjs(comment.feedbackTime).format('YYYY-MM-DD HH:mm:ss'):''}}</span></div>
                  <p class="desc">{{comment.feedbackInfo}}</p>
                  <div class="flex-start">
                    <!-- <VanImage v-if="!typeList.includes(file.type)" :src="file.path"  style='width:60px; margin: 10px;' ></VanImage>
                    <div v-else @click="preview(file)" style='margin-right: 10px;text-align: center;color: #e2e2e2;'>
                      <div class='file-name'>{{ file.name }}</div>
                    </div> -->
                    <FileContainer :item="file"  v-for="file in comment.fileVOList"/>
                  </div>   
                </li>
              </ul>
              <div class="info ellipsis" v-if="item.approvalCommentConfig?.supportText">
                {{getOperationLabel(item2)}}：{{ item2.person.approvalOpinion?.text||'--' }}
              </div>
              <div class="info nowrap" v-if="item.approvalCommentConfig?.supportHandwrittenSignature">
                电子签名：
                <ImgSign :sign="item2.person.approvalOpinion?.sign" errTxt="暂无" />
              </div>
            </div>
          </div>
          <!-- 预分配人，当前不是活跃节点 可以添加人员 -->
          <div class="item edit dotted" v-if="!item.personList?.length">
            <div class="left">
              <div class="dot"></div>
            </div>
            <div class="right">
              <div class="top">
                <div class="txt">{{ item.nodeName }}</div>
              </div>
              <div class="list" :style="{justifyContent:item.assigneeList.length>4?'flex-start':'flex-end'}">
                <template v-for="(item2, index2) in item.assigneeList" :key="index2">
                  <div class="cell">
                    <van-icon class="icon" name="friends-o">
                      <van-icon class="close" name="cross" v-if="item2.preReduceSign"
                        @click="handleDelete(item2.id, item.nodeKey)" />
                    </van-icon>
                    <div class="txt">{{ item2.name }}</div>
                  </div>
                  <van-icon class="arrow" name="plus" v-if="index2<item.assigneeList.length-1||item.preAddSign" />
                </template>
                <van-icon class="add" name="plus" @click="handlePick(item.nodeKey)" v-if="item.preAddSign" />
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>

  <!-- 选择员工 -->
  <VanPopup v-model:show="showPicker" position="right" duration="0.2">
    <UserSelectGroup v-if="showPicker" @cancel="showPicker = false;" @confirm="confirmPick" :multiple="multiple"
      :disableIds="disableIds" :activeIds="activeIds.map(e=>{return e})" :active-users="activeUsers" />
  </VanPopup>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ITaskOption, ProcessLine, ProcessRoute } from '../../domain/process'
import { processService } from '../../service/process/process'
import { FormFlowInstance } from '../../domain/form-flow'
import { formFlowService } from '../../service/form-flow/form-flow.service'
import UserSelectGroup from '../../component/project/user-picker/user-select-group.vue'
import ImgSign from '../../component/project/img-sign/img-sign.vue'
import dayjs from 'dayjs'
import { getNode } from '../../service/form-flow/form-flow.hook'
import CubeLoading from '../dynamic-table/component/cube-loading.vue'
import { FileState, kkFilePreview } from '@ghcloud/cube-utils'
import FileContainer from './file-container.vue'
const processInstanceId = ref<string>()
// 员工
const showPicker = ref(false)
const multiple = ref(true)
let { query: { processId='' , notOperates: showOperates,businessType='',isLogin} } = useRoute() as ProcessRoute
const props=defineProps<{
  active:String
}>()
const typeList = ['doc', 'docx', 'excel', 'xlsx', 'xls', 'pdf', 'ppt', 'txt','mp4']
const preview = (item: FileState): void => {
  if (typeList.includes(item.type ?? '')) {
    kkFilePreview(item)
  }
}
// 流程进度
const processList = ref<ProcessLine[]>([])
const getProcessInfo = async (processId: string,flowKey:string) => {
  processList.value = await processService.getProcessLine({processInstanceId:processId?processId:undefined ,flowKey:flowKey})
  processList.value.map((item) => {
    // 组装person数组
    let personArr = item.taskOperations?.map((item2) => {
      let { residualOperator, operation, feedbackLogs } = item2
      let person = {}
      if (residualOperator != null) person = { ...residualOperator }
      if (operation != null) {
        person = { ...operation, ...operation.operator }
      }
      return { person, feedbackLogs }
    }).flat()

    item.personList = personArr
    
    // 判断是否可以点击添加， 如果不能添加（加签），也就不能删除（减签）
    if (item.assigneeList?.length) {
      item.isAdd = getNowNode(item.nodeKey)
    }
  })
}
// 流程状态
const getTypeName = (type: string) => {
  let name = "处理中";
  switch (type) {
    case "SUBMIT":
      name = "提交";
      break;
    case "UNDO":
      name = "撤销";
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
    case "WITHDRAW":
      name = "撤回";
      break;
    default:
      break;
  }
  return name;
};

const loading = ref(true)
const formFlowInstance = ref<FormFlowInstance>()
const getOperationLabel=(taskOperation:any)=>{
   const isTransfer=taskOperation.type==='TRANSFER'
   return isTransfer?'备注':'审批意见'
}
// 当前节点信息
const getNowNode = ((nodeKey: string) => {
  if (!formFlowInstance.value) {
    return null
  }
  const flowObj = JSON.parse(formFlowInstance.value.properties.processJson)
  const nowNode = getNode(flowObj, nodeKey)
  const { type, props } = nowNode
  // 判断是否可以点击删除，添加 按钮
  // 当前节点的type == "APPROVAL" -> 当前节点的props.designatedApprover 
  return (type == "APPROVAL" || type == "COPY") && props.designatedApprover
})
// 预减签
const handleDelete = async (id: string, nodeKey: string) => {
  if (!processInstanceId.value) return null
  await processService.preReduceSign(processInstanceId.value, nodeKey, [id])
  // 回显
  processList.value.map((item) => {
    if (item.nodeKey == nodeKey) {
      let result = item.assigneeList?.filter(item2 => item2.id != id)
      item.assigneeList = result
    }
  })
}
// 点击添加人员按钮
let addNodeKey = ref<string>()
const disableIds = ref<string[]>([])
const activeIds = ref<string[]>([])
const activeUsers = ref<{id:string,name:string}[]>([])
const handlePick = (nodeKey: string) => {
  addNodeKey.value = nodeKey

  //回显已添加的人员
  const findeIndex = processList.value.findIndex(e => e.nodeKey === nodeKey)
  const assigneeList = processList.value[findeIndex].assigneeList
  activeIds.value = assigneeList!.map(e => {
    return e.id
  })
  activeUsers.value = assigneeList!.map(e => {
    return {id:e.id,name:e.name}
  })
  disableIds.value = assigneeList!.filter((e) => {
    if (!e.preReduceSign) {
      return e
    }
  }).map(ele => { return ele.id })

  showPicker.value = true
}
// 指定审批人
const confirmPick = async (selectUsers: {id:string,name:string}[]) => {
  showPicker.value = false
  const ids: string[] = []
  const filterUser: { id: string, name: string, preReduceSign: boolean }[] = []
  //过滤到已存在的人
  const findeIndex = processList.value.findIndex(e => e.nodeKey === addNodeKey.value)
  const assigneeList = processList.value[findeIndex].assigneeList
  selectUsers.forEach((item) => {
    const userIndex= assigneeList!.findIndex(e => e.id === item.id)
    if (userIndex === -1||(userIndex!==-1&&assigneeList![userIndex].preReduceSign)) {
      ids.push(item.id)
      filterUser.push({
        id: item.id, name: item.name, preReduceSign: true
      })
    }
  })

  if (!processInstanceId.value || !addNodeKey.value || !ids ||ids.length===0) return null
  //@ts-ignore
  await processService.approver(processInstanceId.value, addNodeKey.value, ids)
  // 回显
  if (filterUser.length) {
    processList.value.map((item) => {
      if (item.nodeKey == addNodeKey.value) {
        item.assigneeList = unique(item.assigneeList?.concat(filterUser)??[])
      }
    })
  }

  //数组更具id去重
  function unique(arr1: any[]) {
    const res = new Map()
    return arr1.filter((item: { id: any }) => !res.has(item.id) && res.set(item.id, 1))
  }
}


const notOperates=ref(false)

onMounted(async () => {
  processInstanceId.value = processId
  notOperates.value = showOperates === 'true' ? true : false

  // 获取配置
  if(processId){
    formFlowInstance.value = await formFlowService.getFormFlowProcess(processId)
    businessType = formFlowInstance.value.businessType
  }
  const flowForm =await formFlowService.getFormFlow(businessType)
  getProcessInfo(processId,flowForm.flowKey)
  loading.value = false
})
watch(()=>props.active,async()=>{
  if(props.active==='1'){
    // 获取配置
  if(processId){
    businessType = formFlowInstance.value?.businessType??''
  }
    const flowForm =await formFlowService.getFormFlow(businessType)
    getProcessInfo(processId,flowForm.flowKey)
  }
})
</script>
<style scoped lang="less">
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.process {
  background: #F3F7FA;
  // overflow-y: auto;
  height: 100vh;
  width: 100%;
  position: relative;
  overflow-y: scroll;

  .ellipsis {
    overflow: hidden;
    -webkit-line-clamp: 2;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    word-break: break-all;
    width: 100%;
  }

  .wrap {
    margin: 12px;
    padding: 16px 12px;
    background: #fff;
    border-radius: 6px;

    .dotted {
      position: relative;
      z-index: 9;

      &::after {
        content: '';
        display: block;
        border-left: 1px dashed #D0D0D0;
        position: absolute;
        left: 19px;
        top: 38px;
        height: 100%;
        z-index: -1;

      }

      &.edit {
        &::after {
          top: 18px;
        }
      }
    }

    .timeline {
      .item {
        display: flex;
        padding-bottom: 30px;

        &:last-child {
          &.dotted::after {
            display: none;
          }
        }

        .left {
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--van-primary-color);
          border-radius: 4px;
          font-size: 14px;
          height: 28px;
          width: 40px;
          padding: 5px;
          color: #fff;
          margin-right: 12px;
          word-break: keep-all;
        }

        .right {
          flex: 1;

          .top {
            color: #999999;
            line-height: 20px;
            font-size: 12px;
            display: flex;
            justify-content: space-between;

            .txt {}
          }

          .info {
            color: #666666;
            line-height: 20px;
            font-size: 13px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;

            &.title {
              color: #1F3140;
              line-height: 24px;
              font-size: 15px;

            }

            &.tip {
              display: flex;
              align-items: center;
              margin-top: 6px;
              height: 21px;
              background: #F2F2F6;
              border-radius: 4px 4px 4px 4px;
              font-size: 14px;
              line-height: 24px;
              padding: 7px 10px;
              margin: 6px 0;

              &.success {
                color: #6AB539;
              }

              &.waring {
                color: #FF4158;
              }
            }
          }
          .comment{
            width: calc(100vw - 100px);
            height: auto;
            border-radius: 4px;
            padding:0px;
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
              word-break: break-all;
              word-wrap: break-word;
              white-space: pre-wrap;
            }
            .desc{
              padding:4px;
              font-size: 14px;
              color: #999999;
              word-break: break-all;
              word-wrap: break-word;
              white-space: pre-wrap;
            }
          }
          .nowrap {
            white-space: nowrap;
            display: flex;
            justify-content: flex-start;
            align-items: center;
          }
        }

        &.edit {
          align-items: baseline;
          cursor: pointer;

          .left {
            min-width: 38px;
            padding: 0;
            display: flex;
            background: none;
            justify-content: center;

            .dot {
              width: 14px;
              height: 14px;
              background: linear-gradient(315deg, #005DFF 0%, #0089FF 69%, #5FB5FF 100%);
              box-shadow: 0px 2px 4px 0px rgb(4 139 255 / 20%);
              border-radius: 50%;
              padding: 0;
            }

          }

          .right {
            flex: 1;

            .top {

              .txt {
                font-size: 14px;

              }
            }

            .list {
              margin-top: 12px;
              display: flex;
              justify-content: flex-end;
              flex-wrap: wrap;
              width: 100%;
            }

            :deep(.van-image__img) {
              border-radius: 4px !important;
            }

            .cell {
              position: relative;
              display: flex;
              align-items: center;
              flex-direction: column;
              margin-bottom: 4vw;
              white-space: nowrap;

              .icon {
                width: 10vw;
                height: 10vw;
                background: var(--van-primary-color);
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 22px;
                color: #fff;
                margin: 0 2vw;
              }

              .close {
                background: #DFDFDF;
                border-radius: 50%;
                font-size: 12px;
                position: absolute;
                top: -7px;
                right: -7px;
                color: #A2A3A5;
                padding: 2px;
                display: flex;
                align-items: center;
              }

              .txt {
                color: #999;
                line-height: 21px;
                font-size: 13px;
              }
            }

            .arrow {
              color: #999;
              font-size: 3.5vw;
              display: flex;
              height: 10vw;
              align-items: center;

              &.van-icon-minus {
                transform: rotate(-75deg);
              }
            }

            .add {
              width: 34px;
              height: 34px;
              background: #FFFFFF;
              border-radius: 4px;
              border: 1px solid #D6D6D6;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              color: #999;
              margin-left: 10px;
            }
          }
        }

      }

    }

  }
}
.file-name{color:var(--van-primary-color)}
.flex-start{
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 3 列，每列等宽 */
  gap: 5px; /* 设置列间距 */
}
</style>