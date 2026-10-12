<template>
  <VanPopup v-model:show="show" position="right" class="operate-pop" closeable @closed="afterClose">
    <VanForm ref="signPadFormRef">
      <VanCellGroup inset>
        <VanField  v-model="formState.feedbackInfo"  label="评论" type="textarea"
          rows="3" autosize
          placeholder="请输入内容"  class="cube-input-textarea" label-width="18vw" />
        <VanField name="uploader" label="附件">
          <template #input>
            <FileUpload v-model="fileList"/>
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
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue';
import { formFlowService } from '@/service/form-flow/form-flow.service'
import FileUpload from '@/component/basic/input/file-upload.vue';
import { showToast } from 'vant'

const props = withDefaults(defineProps<{
  taskId: string;
  processId: string;
  taskNodeKey: string;
  flowKey:string;
}>(), {

})
const emits = defineEmits(['upload:show', 'onCommentSuccess'])
const isCommentSuccess = ref(false)
const show = ref(false)
const fileList = ref<any[]>([])

const subLoading = ref(false)
const formState = reactive<{feedbackInfo:string,fileIdList:string[]}>({
  feedbackInfo: '',
  fileIdList: [],
})

const handleSignFormSubmit = async () => {
  try {
    subLoading.value = true
    await formFlowService.setFeedBack({
      ...formState,
      processId: props.processId,
      taskNodeKey:props.taskNodeKey,
      taskId: props.taskId,
      fileIdList:fileList.value.map(e=>e.id),
    })
    isCommentSuccess.value = true
  } catch (error) {
  }finally{
    showToast('提交成功')
    subLoading.value = false
    show.value=false
  }
  
}


//弹层关闭后 清空数据
const afterClose=()=>{
  formState.feedbackInfo=''
  formState.fileIdList=[]
  fileList.value=[]
  emits('onCommentSuccess', isCommentSuccess.value)
}
const open = ()=>{
  formState.feedbackInfo=''
  isCommentSuccess.value = false
  formState.fileIdList=[]
  fileList.value=[]
  show.value=true
}
defineExpose({
  open
})

</script>
<style lang="less">
.operate-pop {
  height: 100vh;
  background-color: #F3F7FA;
  padding-top: 12vw;
  width: 100vw;
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