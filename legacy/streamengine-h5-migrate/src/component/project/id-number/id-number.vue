<template>
  <VanField v-model="textValue" :label="props.label" type="text" :required="props.required" :disabled="props.readonly"
    :placeholder="props.placeholder" :formatter="formatter" format-trigger="onChange" :maxlength="props.maxlength"/>
</template>

<script setup lang="ts">
import { FormItemExpose } from '../../../business/dynamic-table/form-item'
import { onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  label?: string;
  placeholder?: string;
  required?: boolean;
  modelValue?: string;
  readonly?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  maxlength?: number;
  onkeyup?: string;
}>(), {
  placeholder: '请输入身份证号码',
  maxlength:500
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>()

const textValue = ref(props.modelValue ?? '')

watch(textValue, () => {
  emit('update:modelValue', textValue.value)
})

watch(()=>props.modelValue, () => {
  textValue.value=props.modelValue??''
})
const validateSecIdCard=(value:string) =>{
    var iSum = 0
    var sId = value
    var aCity = {
        11: '北京',
        12: '天津',
        13: '河北',
        14: '山西',
        15: '内蒙',
        21: '辽宁',
        22: '吉林',
        23: '黑龙',
        31: '上海',
        32: '江苏',
        33: '浙江',
        34: '安徽',
        35: '福建',
        36: '江西',
        37: '山东',
        41: '河南',
        42: '湖北',
        43: '湖南',
        44: '广东',
        45: '广西',
        46: '海南',
        50: '重庆',
        51: '四川',
        52: '贵州',
        53: '云南',
        54: '西藏',
        61: '陕西',
        62: '甘肃',
        63: '青海',
        64: '宁夏',
        65: '新疆',
        71: '台湾',
        81: '香港',
        82: '澳门',
        83: '台湾',
        91: '国外'
    }
    if (!/^\d{17}(\d|x)$/i.test(sId)) {
        return false
    }
    sId = sId.replace(/x$/i, 'a')
    // 非法地区
    if (aCity[parseInt(sId.substr(0, 2))] == null) {
        return false
    }
    var sBirthday = sId.substr(6, 4) + '-' + Number(sId.substr(10, 2)) + '-' + Number(sId.substr(12, 2))
    var d = new Date(sBirthday.replace(/-/g, '/'))
    // 非法生日
    if (sBirthday != (d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate())) {
        return false
    }
    for (var i = 17; i >= 0; i--) {
        iSum += (Math.pow(2, i) % 11) * parseInt(sId.charAt(17 - i), 11)
    }
    if (iSum % 11 != 1) {
        return false
    }
    return true
}
defineExpose<FormItemExpose>({
  validate:() =>{
    if(props.required&&!textValue.value){
      return '请输入身份证号码'
    }
    if (textValue.value&&!validateSecIdCard(textValue.value??'')) {
      return '请输入正确的身份证号码'
    }
	  return true
  },
})

onMounted(() => {
  if (props.defaultValue&&!props.modelValue) {
    textValue.value = props.defaultValue;
    emit('update:modelValue', textValue.value);
  }
})

//去除首位空格
const formatter = (value: string) =>{
  let res=value.trim()
  if(res&&props.onkeyup){
    res=res.replace(props.onkeyup, '')
  }
  return res
};
</script>

<style scoped></style>
