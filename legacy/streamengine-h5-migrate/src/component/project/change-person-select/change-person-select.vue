<template>
  <VanField
    v-if="props.readonly"
    :label="props.label"
    :required="props.required"
    :model-value="selected?.name"
    readonly />
  <template v-else>
  <VanField :label="props.label" is-link readonly
    :placeholder="props.placeholder" @click="pick" :required="props.required" :error-message="errorMessage"
    class="form-item-field">
    <template #input v-if="selected?.name">
      <VanSpace wrap>
        <VanTag type="primary" :closeable="false" size="medium">
          {{ selected?.name }}
        </VanTag>
      </VanSpace>
    </template>
  </VanField>
  <VanPopup v-model:show="showPicker" position="right" duration="0.2">
    <UserSelectGroup @cancel="closePicker" @confirm="confirmPick" :multiple="props.multiple"
      :activeIds="[selected?.id as string]" :active-users="[selected]" />
  </VanPopup>
  </template>
</template>

<script setup lang="ts">
import { computed, onMounted, ref,  } from 'vue'
import { showNotify } from 'vant';
import UserSelectGroup from '../user-picker/user-select-group.vue'
const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  modelValue: {
    type: Object,
    required: false,
    default: () => {}
  },
  multiple: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  dependFormValues: {
    type: Array,
    default: () => []
  },
  params: {
    type: String,
    default: ''
  },
  defaultValue:{
    type: Boolean,
    default: false
  },
  processType:{
    type: String,
  }
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: {id:string,name:string}): void;
  (e: 'close'): void;
  (e: 'confirm'): void;
}>()
const showPicker = ref(false)
const selected = ref<{id:string,name:string}>({
  id:"",
  name:""
});
onMounted(async () => {
  if(props.modelValue){
     selected.value={id:props.modelValue.id,name:props.modelValue.name}
  }
})
function pick() {
  showPicker.value = true
}
function closePicker() {
  showPicker.value = false
  emit('close')
}
function confirmPick(users: {id:string,name:string}[]) {
  if(!users[0].id) return showNotify('请选择人员');;
  selected.value =users[0]
  emit('update:modelValue', selected.value)
  closePicker()
  emit('confirm')
}
const errorMessage = computed(() => {
  return (!validInput.value && props.required) ? `请选择${props.label}` : ''
})

const validInput = ref(true)
defineExpose({
  validate: () => {
    const valid = !!selected.value.id
    validInput.value=valid
    return selected.value.id ? true : false
  },
  showPicker
})
</script>

<style scoped></style>
