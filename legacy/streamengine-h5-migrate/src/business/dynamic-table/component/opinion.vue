<template>
  <VanPopup v-model:show="show" position="bottom" class="operate-pop" closeable @closed="afterClose">
    <VanForm ref="signPadFormRef">
      <VanCellGroup inset>
        <van-cell title="处理操作" :value="typeName" class="handling-text" />
        <VanField v-if="nowNode.props.opinion" v-model="formState.opinion" name="审批意见" label="审批意见" type="textarea"
          placeholder="请输入审批意见" :rules="[{ required: false }]" class="cube-input-textarea" label-width="18vw" />
        <VanField v-if="nowNode.props.sign" v-model="formState.sign" name="手写签名" required label="手写签名"
          placeholder="请手写签名" :rules="[{ required: true, message: '请手写签名' }]" label-width="18vw"
          class="cube-input-signPad">
          <template #input>
            <div class="sign-area" @click="clickSignArea">
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
import { ApprovalOpinion, FormFlowInstance, FormProcessOperate, FormProcessOperateEnum } from '../../../domain/form-flow';
import { getAuthHeaders } from '@ghcloud/cube-app-js-sdk';
import { getNode } from '../../../service/form-flow/form-flow.hook';
import { formFlowService } from '../../../service/form-flow/form-flow.service';
import { showNotify } from 'vant';
import { computed, inject, onMounted, reactive, ref } from 'vue';
//@ts-ignore
import { VueSignaturePad } from "vue-signature-pad";
import { fileService } from '../../../service/file'
import { closePage, endTask } from '../../../infrastructure/close'
import { cubeFileService } from '../../../service/service'
import { BUSINESS_KEY_TO_SCENE_CODE, GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service';
import { useRoute } from 'vue-router';

const isChildrenComponent = inject('isChildrenComponent') as boolean
const props = withDefaults(defineProps<{
  processId: string;
  formData: Record<string, unknown>;
  formFlowProcess: FormFlowInstance;
  typeName:string
}>(), {

})
const emits = defineEmits(['upload:show','loading'])
const show = ref(false)
const handlingType = ref<FormProcessOperate>();
const showSignPad = ref(false) // 纯H5手写签名
const isFirstTaskActive = ref(false) //当前节点是否是第一个审批节点
const signaturePad = ref();
const route = useRoute()
const sceneCode = BUSINESS_KEY_TO_SCENE_CODE.get(route.query.businessType as string??'') ?? GLOBAL_SCENE_CODE.approvalCenter
// 当前节点信息
const nowNode = computed(() => {
  const flowObj = JSON.parse(props.formFlowProcess.properties.processJson)
  const nowNode = getNode(flowObj, props.formFlowProcess.key)
  if (nowNode && isUndefined(nowNode.props.sign)) {
    nowNode.props.sign = true
  }
  if (nowNode && isUndefined(nowNode.props.opinion)) {
    nowNode.props.opinion = true
  }
  return nowNode
  function isUndefined(obj: any) {
    return typeof obj === 'undefined'
  }
})


const subLoading = ref(false)
const formState = reactive({
  sign: '',
  opinion: ''
})
const signPic = ref('') //签名回显图片
const clickSignArea = async () => {
  showSignPad.value=true
}
// H5 手写签名回调
const signaturePadConfirm = async (action:string) => {
  try {
    if(action==='confirm'){
      const { isEmpty, data } = signaturePad.value.saveSignature();
      if (isEmpty) {
        return false
      }
      let fileObj = dataURLtoFile(data, "sign-" + new Date().valueOf() + ".png");
      const res = await cubeFileService.uploadFile({ 
        file: fileObj,
        tenant:getAuthHeaders().tenant, 
        businessKey: 'maintain', 
        sceneCode: sceneCode
      })
      try {
        sceneCode && await cubeFileService.persistFile(sceneCode,[res.id])
      } catch (error) {
        
      }
      formState.sign = res.id??'';
      signPic.value = res.path??''
    }
  } catch (error) {
    
  } finally{
    signaturePad.value.clearSignature()
    return true
  }
}

const signPadFormRef = ref()
const handleSignFormSubmit = async () => {
  signPadFormRef.value.validate().then(async () => {
    if (!handlingType.value) {
      return
    }
    try {
      subLoading.value = true
      const params: { [key: string]: any } = {}
      if (nowNode.value.props.opinion) {
        params.text = formState.opinion
      }
      if (nowNode.value.props.sign) {
        params.sign = formState.sign
      }
      signPadFormRef.value.resetValidation()
      await handleSubmitWithApprovalOpinion(handlingType.value, params)
      emits('upload:show', false)
    } catch (error) {
    } finally {
      subLoading.value = false
    }
  })
}

const handleSubmitWithApprovalOpinion = async (operate: FormProcessOperate, approvalOpinion: ApprovalOpinion | null = null) => {
  if (FormProcessOperate.PASS === operate) {
    await handleComplete(approvalOpinion)
  }
  if (FormProcessOperate.REJECT === operate) {
    await handleREJECT(approvalOpinion)
  }
  if (FormProcessOperate.BACK === operate) {
    await handleBack(approvalOpinion)
  }
  if (FormProcessOperate.WITHDRAW === operate) {
    await handleWidthDraw(approvalOpinion)
  }
}

//完成
const handleComplete = async (approvalOpinion: ApprovalOpinion | null = null) => {
  try {
    emits('loading',true)
    await formFlowService.processApprove(props.formFlowProcess.id, props.formData, approvalOpinion,props.formFlowProcess)
    closePage('',isChildrenComponent)
    emits('loading',false)
  } catch (error) {
    emits('loading',false)
  }finally{
    endTask()
  }
}

//拒绝
const handleREJECT = async (approvalOpinion: ApprovalOpinion | null = null) => {
  try {
    await formFlowService.processReject(props.formFlowProcess.id, props.formData, approvalOpinion)
    closePage('',isChildrenComponent)
  } catch (error) {
  }finally{
    endTask()
  }
}

//退回
const handleBack = async (approvalOpinion: ApprovalOpinion | null = null) => {
  try {
    await formFlowService.processBack(props.formFlowProcess.id, approvalOpinion)
    closePage('',isChildrenComponent)
  } catch (error) {
  }finally{
    endTask()
  }
}
//撤回
const handleWidthDraw = async (approvalOpinion: ApprovalOpinion | null = null) => {
  try {
    await formFlowService.postProcessWidthDraw(props.formFlowProcess.id, approvalOpinion)
    closePage('',isChildrenComponent)
  } catch (error) {
  }finally{
    endTask()
  }
}

onMounted(async () => {
  isFirstTaskActive.value = await formFlowService.firstTaskActive(props.processId);
  handleSignConfig()
});
const handleSignConfig=async ()=>{
  if(!nowNode.value?.props.sign) return
  if(!nowNode.value.props.signConfig.useLastSign) return;
  const result=await formFlowService.getLastUserSign()
  if(result&&result.id){
    formState.sign=result.id
    signPic.value=result.path
  }
  
}

//弹层关闭后 清空数据
const afterClose=()=>{
  formState.opinion=''
  formState.sign=''
  signPic.value=''
}

// 对父级暴露方法
const processHandle = (type: FormProcessOperate,name:string) => {
  handlingType.value = type
  if (FormProcessOperate.BACK === handlingType.value && isFirstTaskActive.value) {
    showNotify('第一个审批节点不支持回退')
    return
  }
  if (nowNode.value.props.sign || nowNode.value.props.opinion) {
    show.value = true
    return
  }
  //不需要额外传 审批意见 手写签名
  handleSubmitWithApprovalOpinion(handlingType.value, null)
}

defineExpose({
  processHandle
})

//将base64转换为文件对象
function dataURLtoFile(dataurl: string, filename: string) {
  let arr = dataurl.split(",");
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
<style lang="less">
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