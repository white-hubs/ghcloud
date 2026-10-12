<template>
  <div class="user-pop">
    <VanPopup v-model:show="show" position="bottom" class="operate-pop" closeable @closed="afterClose">
      <VanForm>
        <VanCellGroup inset>
          <van-cell title="处理操作" :value="props.typeName" class="handling-text" />
          <UserPicker ref="UserPickerRef" placeholder="请选择转交人员" required label="转交人员" title="转交人员"
            v-model:model-value="users" @confirm="confirm" :multiple="true" />
          <VanField name="备注" v-model="remark" label="备注" type="textarea" placeholder="请输入转交备注"
            :rules="[{ required: false }]" class="cube-input-textarea" label-width="18vw" />
        </VanCellGroup>
        <div class="sub-btn">
          <VanButton block type="primary" :loading="loading" @click="submitTransfer">
            提交
          </VanButton>
        </div>
      </VanForm>
    </VanPopup>
  </div>
</template>
<script setup lang="ts">
import UserPicker from '../../../component/project/user-picker/user-picker.vue';
import { StaffUser } from '../../../domain/user';
import { formFlowService } from '../../../service/form-flow/form-flow.service';
import { showNotify } from 'vant';
import { inject, ref } from 'vue';
import { closePage, endTask } from '../../../infrastructure/close'

const UserPickerRef = ref();
const show=ref(false)
const loading=ref(false)
const remark=ref('')
const isChildrenComponent = inject('isChildrenComponent') as boolean
const props = withDefaults(defineProps<{
  taskId: string;
  typeName:string
}>(), {})
const users = ref<StaffUser[]>([])
const afterClose=()=>{
  show.value=false
}
const confirm = async () => {
  if (users.value.length === 0) {
    showNotify('请选择转交人员');
    return
  }
}
const submitTransfer=async ()=>{
 const usersId=users.value.map(x=>x.id).join(',')
 const passValidate= UserPickerRef.value.validate()
 if(!passValidate) return;
 try {
  loading.value=true
  await formFlowService.processTransfer(props.taskId, usersId,remark.value);
  show.value=false
  closePage('',isChildrenComponent)
 } catch (error) {
 } finally {
    endTask()
  loading.value=false
 }

}
const showPicker = () => {
  show.value=true
  // UserPickerRef.value.showPicker = true
}
defineExpose({
  showPicker
})
</script>
<style scoped lang="less">
// .user-pop {
//   :deep(.form-item-field) {
//     display: none;
//   }
// }</style>