<template>
  <VanSteps :active="approveActive">
    <VanStep>工单处理</VanStep>
    <VanStep>批量审批</VanStep>
    <VanStep>审批完成</VanStep>
  </VanSteps>
  <div class="approve-tips" v-if="approveActive === 0">
    <VanLoading size="24px" vertical>
      处理中... {{ taskDataHandleNum }} / {{ cubeAppTaskList.length }}
    </VanLoading>
  </div>
  <div class="approve-tips" v-else-if="approveActive === 1">
    <VanLoading size="24px" vertical>
      审批中... {{ taskQueen.success.length+taskQueen.fail.length }} / {{ taskQueen.todo.length }}
    </VanLoading>
  </div>
  <div class="approve-tips" v-else-if="approveActive === 2">
    <p>审批结果</p>
    <p class="result">
      <span class="success" @click="showResult('success')">成功：{{ taskQueen.success.length }}</span>
      <span class="fail" @click="showResult('fail')">失败：{{ taskQueen.fail.length }}</span>
      <span class="ignore" @click="showResult('ignore')">忽略：{{ taskQueen.ignore.length }}</span>
    </p>
    <van-button type="primary" v-show="[...taskQueen.ignore, ...taskQueen.fail].length>0" style='margin-bottom:10px'
      block @click="handleApprove">手动审批</van-button>
    <van-button block @click="goBack">返回</van-button>
  </div>
  <VanPopup v-model:show="showResultPopup" position="bottom"
    :style="{ padding: '3vw',overFlow:'scroll',height: '45vh' }">
    <VanCellGroup>
      <VanCell :title="item.title" :value="item.desc" :key="item.processId" v-for="item in resultData" />
    </VanCellGroup>
  </VanPopup>

  <VanPopup :show="showPopup" position="bottom" class="operate-pop">
    <VanForm ref="signPadFormRef">
      <VanCellGroup inset>
        <VanField v-if="needApprovalText" v-model="formState.opinion" name="审批意见" label="审批意见" type="textarea"
          placeholder="请输入审批意见" class="cube-input-textarea" label-width="18vw" />
        <VanField v-if="needApprovalSign" v-model="formState.sign" name="手写签名" required label="手写签名" placeholder="请手写签名"
          :rules="[{ required: true, message: '请手写签名' }]" label-width="18vw" class="cube-input-signPad">
          <template #input>
            <div class="sign-area" @click="showSignPad=true">
              <img :src="signPic" v-if="signPic" />
              <span v-else>轻触开始签名</span>
            </div>
          </template>
        </VanField>
      </VanCellGroup>
      <div class="sub-btn">
        <VanButton block type="primary" :loading="subLoading" @click="handleSignFormSubmit">
          提交
        </VanButton>
      </div>
    </VanForm>
  </VanPopup>
  <van-dialog v-model:show="showSignPad" title="手写签名" show-cancel-button :before-close="signaturePadConfirm">
    <VueSignaturePad id="signature" width="100%" height="40vh" ref="signaturePad" />
  </van-dialog>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ApprovalOpinion, FormFlowInstance } from '../../domain/form-flow';
import { closePage } from '../../infrastructure/close'
import { fileService } from '../../service/file';
import { getNowNode, getPermission } from '../../service/form-flow/form-flow.hook';
import { formFlowService } from '../../service/form-flow/form-flow.service';
import { cubeAppService, getAuthHeaders } from '@ghcloud/cube-app-js-sdk';
import { RefreshNativeBusiness } from '@ghcloud/cube-app-js-sdk/src/js/cube-app.service';
import { onMounted, reactive, ref } from 'vue';
//@ts-ignore
import { VueSignaturePad } from "vue-signature-pad";
import { cubeFileService } from '../../service/service'
import { BUSINESS_KEY_TO_SCENE_CODE, GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service';

interface ApprovalItem {
  title: string
  processId: string,
} 

/** 是否需要签名 */
const needApprovalText = ref(false)
/** 是否需要审批意见 */
const needApprovalSign = ref(false)
/** 审批意见数据 */
const formState = reactive({sign: '',opinion: ''})
const route=useRoute()

/** 单个审批方法 */
const handlePass = async (flowInstance:FormFlowInstance,formData:Record<string, any>,approvalOpinion: ApprovalOpinion | null = null) => {
  await formFlowService.processApprove(flowInstance.id, formData, approvalOpinion,flowInstance,true)
}

/** 批量审批方法 */
const handlePassBatch = async () => {
  approveActive.value = 1
  const taskList=taskQueen.value.todo.map(task=>{
    return new Promise(async (resolve)=>{
      const approvalOpinion: { [key: string]: any } = {}
      task.approvalOpinion.opinion && (approvalOpinion.text = formState.opinion)
      task.approvalOpinion.sign && (approvalOpinion.sign = formState.opinion)
      try {
        await handlePass(
          task.flowInstance,
          task.formData,
          approvalOpinion,
        )
        taskQueen.value.success.push({
          processId:task.processId,
          title:task.title
        })
      } catch (error) {
        taskQueen.value.fail.push({
          processId:task.processId,
          reason:(error as {message:string}).message || '流程处理失败',
          title:task.title
        })
      }
      resolve('done')
    })
  })
  await Promise.all(taskList)
  approveActive.value = 2
  sessionStorage.setItem('taskQueen', JSON.stringify([...taskQueen.value.fail, ...taskQueen.value.ignore]))
}

const approveActive = ref(0)
const showPopup = ref(false)
const subLoading = ref(false)
const signPic = ref('') //签名回显图片
const signaturePad = ref();
const showSignPad = ref(false) // 纯H5手写签名面板
const sceneCode = BUSINESS_KEY_TO_SCENE_CODE.get(route.query.businessType as string??'') ?? GLOBAL_SCENE_CODE.approvalCenter
// H5 手写签名回调
const signaturePadConfirm = async (action:string) => {
  if(action==='confirm'){
    const { isEmpty, data } = signaturePad.value.saveSignature();
    if (isEmpty) {
      return false
    }
    let fileObj = dataUrlToFile(data, "sign-" + new Date().valueOf() + ".png");
    const res =await cubeFileService.uploadFile({ file: fileObj,tenant:getAuthHeaders().tenant, businessKey: 'maintain',
     sceneCode: sceneCode
     })
    formState.sign = res.id??'';
    signPic.value = res.path??''
    return true
  }else{
    signaturePad.value.clearSignature()
    return true
  }
}
const signPadFormRef = ref()
const handleSignFormSubmit = async () => {
  signPadFormRef.value.validate().then(async () => {
    try {
      subLoading.value = true
      const params: { [key: string]: any } = {}
      if (needApprovalText.value) {
        params.text = formState.opinion
      }
      if (needApprovalSign.value) {
        params.sign = formState.sign
      }
      signPadFormRef.value.resetValidation()
      showPopup.value = false
      handlePassBatch()
    } catch (error) {
    } finally {
      subLoading.value = false
    }
  })
}
/** 结果详情 */
const resultData = ref<{title: string, desc: string,processId:string}[]>([])
const showResultPopup = ref(false)
const showResult=(type:'success'|'fail'|'ignore') => {
  resultData.value=taskQueen.value[type].map(e=>{
    return {
      title:e.title,
      desc:e?.reason ??'成功',
      processId:e.processId
    }
  })
  if(resultData.value.length === 0) return;
  showResultPopup.value = true
}
 // 手动审批
const router = useRouter()
const handleApprove = (): void => {
  router.push({ path: '/initiating-work-order', query: { processType: 'HANDLING' } })
}

/** APP传过来的任务列表 */
const cubeAppTaskList = ref<ApprovalItem[]>([]);

/** 任务Queen */
const taskQueen = ref<{
  ignore:{title:string,processId:string,reason:string}[],
  success:{title:string,processId:string,reason?:string}[],
  fail:{title:string,processId:string,reason:string}[],
  todo:{title:string,processId:string,formData:any,approvalOpinion:{sign:boolean,opinion:boolean},flowInstance:FormFlowInstance}[],
}>({
  ignore:[],
  success:[],
  fail:[],
  todo:[],
})

const taskDataHandleNum = ref(0);
/** 单个任务梳理 */
const taskDataHandle = async (task:ApprovalItem) => {
  try {
    // 流程实例
    const flowInstance = await formFlowService.getFormFlowProcess(task.processId,true)
    const formData = JSON.parse(flowInstance.data)
    const formOptions = JSON.parse(flowInstance.properties.formJson)

    // 验证是否有未填写必填项
    for (const key in formOptions) {
        const item = formOptions[key];
        if(item.props.required){
          const itemPermission = getPermission(item, flowInstance.properties.processJson, flowInstance.key ?? '')
          if(itemPermission.show && !itemPermission.readonly && !formData[item.id]){
            // 当前表单包含必填项，但是没有值
            taskQueen.value.ignore.push({
              processId:task.processId,
              reason:`${item.title}为必填项`,
              title:task.title
            })
            return Promise.resolve()
          }
        }
    }

    // 验证是否需要审批意见
    const nowNode = getNowNode(flowInstance)
    if(!nowNode){
      taskQueen.value.ignore.push({
        processId:task.processId,
        reason:`流程已结束`,
        title:task.title
      })
      return Promise.resolve()
    }
    nowNode.props.opinion && (needApprovalText.value = true)
    nowNode.props.sign && (needApprovalSign.value = true)

    taskQueen.value.todo.push({
      processId:task.processId,
      title:task.title,
      formData,
      approvalOpinion:{
        sign:nowNode.props.sign,
        opinion:nowNode.props.opinion
      },
      flowInstance
    })
  } catch (error) {
    taskQueen.value.fail.push({
      processId:task.processId,
      reason:'流程数据处理出错',
      title:task.title
    })
  }

  return Promise.resolve()
}

/** 创建任务Queen */
const createTaskQueen = async () => {
  await Promise.all( cubeAppTaskList.value.map( async e => { await taskDataHandle(e);
      return taskDataHandleNum.value++; 
    }) 
  ) 
}


onMounted(async()=>{
  document.title = '一键审批'

  // 1、获取APP传过来的数据
  const appBusinessData = await cubeAppService.getBusinessData()
  const key='flowProcessHandleBatchData'
  // const appBusinessData={
  //   flowProcessHandleBatchData:[
  //     {title: '1',processId: 'd58b3414-e1c9-11ee-9b37-169ab42071d4'},
  //     // {title: '1',processId: 'd58b3414-e1c9-11ee-9b37-169ab42071d4'},
  //   ]
  // }
  cubeAppTaskList.value = appBusinessData[key] as ApprovalItem[] ?? []
  // 2、创建任务Queen
  await createTaskQueen()

  // 3、若是否需要手写签名或者审批意见则阻断
  if(needApprovalSign.value || needApprovalText.value){
    showPopup.value = true
    return
  }
  // 4、批量审批
  handlePassBatch()

})

const goBack =()=>{
  cubeAppService.refreshNativeData(RefreshNativeBusiness.FLOW_PROCESS)
  sessionStorage.removeItem('taskQueen')
  closePage()
}

//将base64转换为文件对象
function dataUrlToFile(dataUrl: string, filename: string) {
  let arr = dataUrl.split(",");
  //@ts-ignore
  let mime = arr[0].match(/:(.*?);/)[1];
  let bstr = atob(arr[1]);
  let n = bstr.length;
  let u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  //转换成file对象
  return new File([u8arr], filename, { type: mime });
}
</script>

<style lang="less" scoped>
.van-steps {
  margin-top: 30vh;
  padding: 0 10vw;
}
</style>
<style lang="less">
.approve-tips {
  padding: 10vw;
  text-align: center;
  font-size: 3.5vw;
  color: var(--van-text-color-2);

  .result {
    display: flex;
    justify-content: space-around;
    margin-bottom: 10vw;

    .success {
      color: var(--van-success-color);
      text-decoration: underline;
      text-decoration-color: var(--van-success-color);
    }

    .fail {
      color: var(--van-danger-color);
      text-decoration: underline;
      text-decoration-color: var(--van-danger-color);
    }

    .ignore {
      color: var(--van-warning-color);
      text-decoration: underline;
      text-decoration-color: var(--van-warning-color);
    }
  }
}

.operate-pop {
  height: 100vh;
  background-color: #F3F7FA;
  padding-top: 12vw;

  .sub-btn {
    background: #FFFFFF;
    box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.07);
    width: 100%;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 0;
    box-sizing: border-box;
    padding: 4vw 3vw;
  }

  // .van-cell-group,
  // .van-cell {
  //   // background-color: white;
  // }

  .handling-text {
    .van-cell__value {
      color: #FF4158;
    }
  }

  .sign-area {
    width: 100%;
    height: 20vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #FAFAFA;

    img {
      max-width: 100%;
      max-height: 100%;
    }
  }
}
</style>