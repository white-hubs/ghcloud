<template>
  <span v-if="props.readonly">{{ props.modelValue?.map(e => e.name).join('、') || '--' }}</span>
  <a-select v-else ref="select"
    style="width:100%;"
    class="select-input"
    placeholder="请选择角色"
    v-model:value="value"
    @change="handleChange"
    :mode="props.multiple ? 'multiple' : 'default'"
    :maxTagCount="props.multiple ? 3 : null"
    show-search
    optionFilterProp='name'
    allowClear
    :options="options"
    :fieldNames="{ label: 'name', value: 'id' }"
    >
  </a-select>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { cubeOuaaService } from '@/api/service';
import { RoleItem } from '@ghcloud/cube-ouaa-service';

const props = withDefaults(defineProps<{
  modelValue?: RoleItem[] | undefined;
  placeholder?: string;
  readonly?: boolean;
  formData?: any;
  defaultValue?: boolean;
  multiple?:boolean;
}>(), {
  modelValue: undefined,
  placeholder: "请选择角色",
  defaultValue: false,
  readonly: false,
  multiple:false
})
const emits = defineEmits(['update:modelValue','clearValidate'])

const options = ref<RoleItem[]>([]);
const value = ref(props.modelValue ? (props.multiple ? props.modelValue?.map(e => e.id) : props.modelValue[0].id) : (props.multiple ? [] : undefined))
const handleChange = (val: string | string[]) => {
  if (props.multiple) {
    const values = options.value?.filter(e => val.includes(e.id));
    emits('update:modelValue', values)
  } else {
    const index = options.value?.findIndex(e => e.id === val);
    emits('update:modelValue', [options.value[index]])
  }
};

onMounted(async () => {
  if (!props.readonly) {
    const res = await cubeOuaaService.getRole({ enabled: true })
    options.value = res ?? []
  }
})
</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
