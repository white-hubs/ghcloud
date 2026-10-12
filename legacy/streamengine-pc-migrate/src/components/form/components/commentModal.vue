<template>
  <a-modal v-model:visible="showCommentPicker" centered width="1000px" @cancel="closeModal">
      <a-form :model="form" class="modal-form" >
        <a-form-item label="评论">
        <a-textarea v-model:value="form.feedbackInfo" placeholder="请输入内容" :auto-size="{ minRows: 3, maxRows: 5 }" />
      </a-form-item>
      <a-form-item label="附件">
       <FileUpload
        v-if="showCommentPicker"
        :modelValue="form.fileIdList"
        :readonly="false"
        @update:modelValue="(val) => {
          form.fileIdList = val
        }"
      />
      </a-form-item>
      </a-form>
    <template #footer>
      <a-button key="back" @click="closeModal">取消</a-button>
      <a-button key="submit" type="primary" :loading="loading" @click="handleOk">提交</a-button>
    </template>
  </a-modal>
</template>
<script setup lang="ts">
import { inject, reactive, Ref, ref,  } from 'vue'
import { message } from 'ant-design-vue'
import {  setFeedBack } from '@/api/flow'
import FileUpload from '../../form/formItems/FileUpload.vue'
import { FlowForm } from '@/domain/form-flow'
const flowForm = inject("flowForm") as Ref<FlowForm>;
const props= defineProps({
  taskId: {
    type: String,
    default: ''
  },
  processId: {
    type: String,
    default: ''
  },
  taskNodeKey: {
    type: String,
    default: ''
  },
})

const emits = defineEmits(['updateComment'])

const loading = ref(false)
const showCommentPicker = ref(false)
const form = reactive({
  feedbackInfo: '',
  fileIdList: [],
});
const open = ()=>{
form.feedbackInfo=''
form.fileIdList=[]
showCommentPicker.value=true
}
const closeModal=()=>{
  showCommentPicker.value=false
}
const isUpdateComment=ref(false)
const handleOk = async () => {
  try {
    loading.value = true
    await setFeedBack({
      ...form,
      processId: props.processId,
      taskNodeKey:props.taskNodeKey,
      taskId: props.taskId,
      fileIdList:form.fileIdList.map((x:{id:string})=>x.id),
    });
    showCommentPicker.value=false
    message.success('提交成功');
    isUpdateComment.value=true
  } catch (error) {
    message.error(error.response.data.message??'保存失败');
  } finally {
    loading.value = false
  }
}

defineExpose({
  open,
  isUpdateComment
})
</script>

<style scoped lang="less">
.top-step {
  margin-bottom: 20px
}

.modal-form {
  margin: 20px 0px;
}
</style>