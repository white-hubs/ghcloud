<template>
  <a-input
    v-model:value="value"
    :placeholder="!props.readonly ? placeholder : ''"
    :onkeyup="keyup"
    maxlength="500"
    @change="emits('update:modelValue', value)"
    :disabled="readonly"
    v-if="!props.readonly"
  />
  <span v-else>{{ props.modelValue ?? '--' }}</span>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { inject } from 'vue';

const processType = inject('processType') as string
const props = withDefaults(
  defineProps<{
    modelValue?: string | null;
    placeholder?: string;
    readonly?: boolean;
    onkeyup?: string;
    defaultValue?: string | null;
  }>(),
  {
    modelValue: null,
    placeholder: "请输入身份证号",
    readonly: false,
    onkeyup: "",
    defaultValue: null,
  }
);
const emits = defineEmits(["update:modelValue","clearValidate"]);
const keyup = (ent: any) => {
  if (value.value && props.onkeyup){
    value.value = value.value.replace(props.onkeyup, "");
  }
  emits("update:modelValue", value.value);
  if(value.value){
    emits("clearValidate")
  }
};
const value = ref(props.modelValue || props.defaultValue);

onMounted(()=>{
  if(props.defaultValue&&processType==='add'){
    value.value=props.defaultValue
    emits("update:modelValue", value.value);
  }
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
const validator = async () => {
	if (value.value&& !validateSecIdCard(value.value??'')) {
		return Promise.reject("请输入正确的身份证号");
	}
	return Promise.resolve();
};
//对外暴露验证方法
defineExpose({
	validator,
});
</script>
