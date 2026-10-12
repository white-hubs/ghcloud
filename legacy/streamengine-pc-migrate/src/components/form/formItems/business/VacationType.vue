<template>
  <div>
    <a-select ref="select" v-model:value="value" style="width:100%;" @change="handleChange" class="select-input"
      placeholder="请选择请假类型" v-if="!props.readonly">
      <a-select-option :value="item.id" v-for="(item, i) in options" :key="i">
        {{ item.name }}
      </a-select-option>
    </a-select>
    <span v-else>{{ props.modelValue?.name || '--' }}</span>
  </div>
</template>
<script lang="ts" setup>
import { getHolidayList } from '@/api/attendance'
import { onMounted, ref } from 'vue'
type VacationType = {
  id: string;
  name: string;
}

const props = withDefaults(defineProps<{
  modelValue?: VacationType | null;
  readonly?: boolean
}>(), {
  modelValue: null,
  readonly: false,
})

const options = ref<VacationType[]>([]);
const value = ref(props.modelValue?.id)
const emits = defineEmits(['update:modelValue'])



const handleChange = (val: string) => {
  const index = options.value?.findIndex(e => e.id === val);
  emits('update:modelValue', options.value[index])
};

onMounted(async () => {
  if(props.readonly){
    return
  }
  const res = await getHolidayList()
  options.value = res.map((d: { id: string; name: string; }) => ({
    id: d.id,
    name: d.name
  }))
})
</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
