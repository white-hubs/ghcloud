<template>
  <div>
    <VanField
      is-link :required="props.required" :model-value="selected?.text" readonly
      name="picker" label="部门" @click="showPicker = true"
    />
    <VanPopup v-model:show="showPicker" position="bottom">
      <VanPicker
        :columns="[{ text: '部门 A', value: '类型 1' }, { text: '部门 B', value: '类型 2' }]" @cancel="hidePicker"
        @confirm="confirmPicker($event.selectedOptions)"
      />
    </VanPopup>
  </div>
</template>
<script setup lang="ts">
import { PickerOption } from 'vant'
import { ref } from 'vue'

const props = defineProps<{
  required?: boolean;
}>()

const showPicker = ref(false)
const selected = ref<PickerOption>()

function hidePicker () {
  showPicker.value = false
}

function confirmPicker (selectedOptions: PickerOption[]) {
  selected.value = selectedOptions[0]
  hidePicker()
}
</script>
