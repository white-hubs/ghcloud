<template>
  <div>
    <a-select ref="select" v-model:value="value" style="width: 100%;" @change="handleChange" class="select-input"
      placeholder="请选择换班班次" :disabled="readonly" v-if="!props.readonly">
      <a-select-option :value="item.id" v-for="(item, i) in options" :key="i">
        {{ item.name }}
      </a-select-option>
    </a-select>
    <span v-else>{{ props.modelValue?props.modelValue.name:'--' }}</span>
  </div>
</template>
<script lang="ts" setup>
import { getExchangeClasses } from "@/api/attendance";
import { computed, onMounted, ref, watch } from "vue";

type OfficialSeal = {
  id: string;
  name: string;
};
interface DAMNU_ENABLE {
  [key: string]: any; // 字段扩展声明
}
const props = withDefaults(
  defineProps<{
    modelValue?: OfficialSeal | null;
    readonly?: boolean;
    formData: DAMNU_ENABLE;
    params: string;
    params1: string;
    params2: string;
  }>(),
  {
    modelValue: null,
    readonly: false,
  }
);

const options = ref<OfficialSeal[]>([]);
const value = ref(props.modelValue?.id);
const emits = defineEmits(["update:modelValue"]);

const handleChange = (val: string) => {
  const index = options.value?.findIndex((e) => e.id === val);
  emits("update:modelValue", options.value[index]);
};

const userId = computed(() => {
  let user = props.params
    ? props.formData[props.params]
    : props.formData.sponsorId ?? "";
  return user && user.id ? user.id : user;
});
const workType = computed(() => {
  let workType = props.params1
    ? props.formData[props.params1]
    : props.formData.sponsorId ?? "";
  return workType;
});
const day = computed(() => {
  let changeDate = props.params2
    ? props.formData[props.params2]
    : '';
  return changeDate;
});

const params=computed(() => {
  return {
    staffId:userId.value??'',
    workType:workType.value?.id??'',
    day:day.value??'',
  }
})

watch(()=>params.value,async ()=>{
  if(!params.value.staffId) return;
  if(!params.value.workType) return;
  if(!params.value.day) return;
  if(!props.readonly){
    value.value= void 0;
    emits("update:modelValue",null)
    options.value.length=0
  }
  const res = await getExchangeClasses(params.value);
  options.value = res;
},{deep:true})


onMounted(async () => {
  if (props.modelValue) {
    options.value = [props.modelValue];
  }
});
</script>
<style scoped>
.select-input {
  width: 100%;
}
</style>
