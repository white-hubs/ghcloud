<template>
  <span v-if="props.readonly">{{ value === true ? '是' : value === false ? '否' : '--' }}</span>
  <a-radio-group v-else v-model:value="value" name="AssetIsExpired" @change="handleChange">
    <a-radio :value="true">是</a-radio>
    <a-radio :value="false">否</a-radio>
  </a-radio-group>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
const props = withDefaults(defineProps<{
  modelValue?: Boolean | null;
  readonly?: boolean
}>(), {
  modelValue: null,
  readonly: false,
})

const value = ref(props.modelValue??null)
const emits = defineEmits(['update:modelValue'])



const handleChange = () => {
  emits('update:modelValue',value.value )
};


</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
