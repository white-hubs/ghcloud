<template>
  <VanField
    v-if="props.readonly"
    :label="props.label"
    :required="props.required"
    :model-value="props.modelValue?props.modelValue?.join('，'):''"
    readonly />
  <template v-else>
  <VanField is-link readonly :label="props.label" :required="props.required"
    :model-value="props.modelValue?props.modelValue?.join('，'):''" :error-message="props.errorMessage" @click="pick"
    :placeholder="props.placeholder" clearable @clear="emit('update:modelValue', '')" />
  <VanPopup v-model:show="state.showPicker" round position="bottom"
    :style="{ minHeight: '30vh' }">
    <div class="van-picker__toolbar">
      <button type="button" class="van-picker__cancel" @click="cancelPick">取消</button>
      <button type="button" class="van-picker__confirm" @click="confirmPick">确认</button>
    </div>
    <van-checkbox-group v-model="checked">
      <van-cell-group inset>
        <van-cell v-for="(item, index) in columns" clickable :key="item.text" :title="item.text" @click="toggle(index)">
          <template #right-icon>
            <van-checkbox :name="item.value" ref="checkboxRefs" @click.stop />
          </template>
        </van-cell>
      </van-cell-group>
    </van-checkbox-group>
  </VanPopup>
  </template>
</template>

<script setup lang="ts">
import { FormItemExpose } from '../../../../business/dynamic-table/form-item'
import { PickerOption } from 'vant'
import { onMounted } from 'vue'
import { computed, reactive, ref } from 'vue'

const props = withDefaults(defineProps<{
  options: string[] | PickerOption[];
  label?: string;
  required?: boolean;
  modelValue?: string[];
  errorMessage?: string;
  placeholder?: string;
  readonly?: boolean;
}>(), {
  placeholder: '请选择选项'
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: string[] | string): void;
}>()
const checked = ref<string[]>([]);
const state = reactive<{
  showPicker: boolean;
}>({
  showPicker: false
})
const checkboxRefs = ref(props.modelValue?props.modelValue:[]);
const toggle = (index: number) => {
  //@ts-ignore
  checkboxRefs.value[index].toggle();
};
const columns = computed<PickerOption[]>(() => {
  if (optionsIsColumn(props.options)) {
    return props.options
  }
  return props.options.map(d => ({ text: d, value: d }))
  function optionsIsColumn(options: unknown[]): options is PickerOption[] {
    return typeof options[0] === 'object'
  }
})
onMounted(()=>{
  checked.value = props.modelValue?props.modelValue:[]
})
defineExpose<FormItemExpose>({
  validate: () => checked.value.length > 0
})

function pick() {
  state.showPicker = true
}
function cancelPick() {
  state.showPicker = false
  checked.value = []
}
function confirmPick() {
  emit('update:modelValue', checked.value.length?checked.value:'')
  state.showPicker = false
}
</script>

<style scoped></style>
