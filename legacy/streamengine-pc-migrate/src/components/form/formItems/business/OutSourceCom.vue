<template>
  <div>
    <a-select
      ref="select"
      v-model:value="value"
      style="width: 100%"
      @change="handleChange"
      class="select-input"
      placeholder="请选择委外公司"
      :disabled="props.readonly"
      v-if="!props.readonly"
    >
      <a-select-option :value="item.id" v-for="(item, i) in options" :key="i">
        {{ item.name }}
      </a-select-option>
    </a-select>
    <span v-else>{{ props.modelValue?.name ?? "--" }}</span>
  </div>
</template>
<script lang="ts" setup>
import { outsourceCompanyList } from "@/api/outSource";
import { onMounted, ref, watch } from "vue";

type CommonType = {
  id: string;
  name: string;
};

const props = withDefaults(
  defineProps<{
    modelValue?: CommonType | null;
    readonly?: boolean;
    formData: any;
    params: string;
  }>(),
  {
    modelValue: null,
    readonly: false,
  }
);

const options = ref<CommonType[]>([]);
const value = ref(props.modelValue?.id);
const emits = defineEmits(["update:modelValue"]);

const handleChange = (val: string) => {
  const index = options.value?.findIndex((e) => e.id === val);
  emits("update:modelValue", options.value[index]);
};
const getCompList = async (id?: string) => {
  const res = await outsourceCompanyList(id);
  options.value = res.map((item: { id: string; name: string }) => {
    return {
      id: item.id,
      name: item.name,
    };
  });
};
watch(
  () => props.formData[props.params],
  () => {
    if (props.readonly) return;
    if (props.formData[props.params] && props.formData[props.params].length) {
      getCompList(props.formData[props.params][0].id);
    }
  },
  { immediate: true }
);

onMounted(async () => {
  if (!props.readonly) {
    getCompList();
  }
});
</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
