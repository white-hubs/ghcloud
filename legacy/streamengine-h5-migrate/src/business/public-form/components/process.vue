<template>
  <VanLoading v-show="loading" type="spinner" color="#1989fa" class="loading" />
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

              <div class="info ellipsis" v-if="item.approvalCommentConfig?.supportText">
                {{getOperationLabel(item2)}}：{{ item2.person.approvalOpinion?.text||'--' }}
              </div>
              <div class="info nowrap" v-if="item.approvalCommentConfig?.supportHandwrittenSignature">
                电子签名：
                <ImgSign :sign="item2.person.approvalOpinion?.sign" errTxt="暂无" isPublic />
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
                    </van-icon>
                    <div class="txt">{{ item2.name }}</div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ProcessLine, ProcessRoute } from '../../../domain/process'
import { processService } from '../../../service/process/process'
import { FormFlowInstance } from '../../../domain/form-flow'
import { formFlowService } from '../../../service/form-flow/form-flow.service'
import ImgSign from '../../../component/project/img-sign/img-sign.vue'
import dayjs from 'dayjs'
import { getNode } from '../../../service/form-flow/form-flow.hook'
const processInstanceId = ref<string>()

// 流程进度
const processList = ref<ProcessLine[]>([])
const getProcessInfo = async (processId: string,flowKey:string) => {
  processList.value = await processService.getPublicProcessLine({processInstanceId:processId?processId:undefined ,flowKey:flowKey})
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
const notOperates=ref(false)

onMounted(async () => {
  let { query: { processId='' , notOperates: showOperates,businessType=''} } = useRoute() as ProcessRoute
  processInstanceId.value = processId
  notOperates.value = showOperates === 'true' ? true : false

  // 获取配置
  if(processId){
    formFlowInstance.value = await formFlowService.getPublicFormFlowProcess(processId)
    businessType = formFlowInstance.value.businessType
  }
  const flowForm = await formFlowService.getPublicFormFlow(businessType)
  getProcessInfo(processId,flowForm.flowKey)
  loading.value = false
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
</style>