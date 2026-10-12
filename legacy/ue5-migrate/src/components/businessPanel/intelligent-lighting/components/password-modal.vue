<template>
  <!-- 密码弹窗 -->
  <Modal :title="title" :width="400" v-model="props.showModal" @close="closeModal" wrapClassName="modal-custom">
    <template #modal-content>
      <div class="modal-layout">
      <div class="table-top">
        <a-form ref="modalFormRef" :model="formState" :rules="formRules" >
          <a-form-item label="设备控制密码" name="password" >
            <a-input-password v-model:value="formState.password" style="width: 220px"></a-input-password>
          </a-form-item>
          <a-form-item name="remember" class="remember" >
            <a-checkbox v-model:checked="formState.remember">记住密码</a-checkbox>
          </a-form-item>
        </a-form>
      </div>
    </div>
    <div class="footer">
      <a-button type="primary" size="middle" :loading="isLoading" @click="handleOk">确定</a-button>
      <a-button size="middle" class="border-button" @click="closeModal">取消</a-button>
    </div>
    </template>
  </Modal>
</template>
<script setup lang="ts">
import Modal from "@/components/modal-table/modal-layout.vue";
import { message } from "ant-design-vue";
import { Rule } from "ant-design-vue/es/form";
import { reactive, ref, shallowRef, watch } from "vue";
import type { FormInstance } from 'ant-design-vue/es'

const emit = defineEmits(['update:showModal', 'ok', 'close'])
const modalFormRef = shallowRef<FormInstance>()

interface Props {
  parameter?: any;
  title: string;
  showModal: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  title: "",
  showModal: false,
  parameter: {},
});
const formState = reactive({
  password: '',
  remember: false
});
const formRules: Record<string, Rule[]> = {
  password: [{ required: true, message: '请输入设备控制密码', trigger: 'blur' }]
}
const isLoading = ref(false);
const closeModal = () => {
  emit('update:showModal', false)
  emit("close");
};
const handleOk = async () => {
  try {
    const values = await modalFormRef.value.validateFields();
    emit('ok')
  } catch (errorInfo) {
  }
}
watch(() => props.showModal, () => {
  modalFormRef.value?.clearValidate()
})
</script>

<style lang="less" scoped>
:deep(.ant-input-affix-wrapper), :deep(.ant-checkbox-inner){
  background: rgba(216, 216, 216, 0.1) !important;
  border: 0.00521rem solid rgba(96, 112, 128, 0.6) !important;
  color: #fff;
}
:deep(.ant-input-password-icon), :deep(.ant-checkbox-wrapper){
  color: #fff !important;
}
:deep(.ant-input), :deep(input[type='password']){
  border: none !important;
  width: 100% !important;
  background: transparent !important;
}
.border-button {
  margin-left: 15px;
  background: rgba(41,137,255,0.1);
  border: 1px solid #2989FF;
  color: #fff;
}
:deep(.modal-width){
  width: 400px !important;
}
.modal-table-wrap{
  .modal-width{
    width: 400px !important;
  }
  a{
    color: #2989FF;
  }
}
.footer {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
:deep(.modal-width){
  width: 400px !important;
}
</style>

<style lang="less">
.modal-custom{
  .modal-width{
    width: 400px !important;
    top: 300px;
  }
  a{
    color: #2989FF;
  }
  .remember {
    margin-top: -10px;
    margin-left: 108px;
  }
}
</style>