<template>
  <VanField v-model="field.value" :required="props.required" clearable :label="props.label" :disabled="props.readonly"
    :placeholder="props.placeholder??'请输入金额'" :type="inputMoneyType" @focus="getFocusMoney" @blur="getBlurMoney">
    <template #extra v-if="moneyUpperText && field.value && props.showChinese">
      <div>{{ moneyUpperText }}&nbsp;&nbsp;&nbsp;</div>
    </template>
  </VanField>
</template>

<script setup lang="ts">
import { FormItemExpose } from '../../../business/dynamic-table/form-item'
import { FieldType } from 'vant';
import { computed, onMounted, reactive, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  label?: string;
  placeholder?: string;
  required?: boolean;
  modelValue: number;
  readonly?: boolean;
  defaultValue?: number;
  showChinese?: boolean;
  disabled?:boolean;
  maxlength?:number;
  precision?:number;
}>(),{
  precision:0
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void;
}>()

defineExpose<FormItemExpose>({
  validate: () => field.numberValue !== null && field.numberValue > 0
})

onMounted(() => {
  if (props.modelValue) {
    field.value = props.modelValue
    getBlurMoney()
  }
})

const inputMoneyType = ref<FieldType>('number')
const field = reactive<{
  value: string | number,
  numberValue: number | null
}>({
  value: '',
  numberValue: props.modelValue ?? null,
})
const getFocusMoney = () => {
  field.value = field.numberValue as number;
  inputMoneyType.value = 'number';
}
const getBlurMoney = () => {
  if(!field.value){
    field.numberValue=null
    return
  }
  //最大长度
  if(props.maxlength&&field.value.toString().length>props.maxlength){
    field.value=field.value.toString().slice(0, props.maxlength);
    if(field.value.charAt(field.value.length - 1)==='.'){
      field.value = field.value.substring(0, field.value.length - 1);
    }
  }

  //被除数
  let dividend=1
  for (let index = 0; index < props.precision; index++) {
    dividend*=10
  }
  field.numberValue = Math.floor(parseFloat(field.value as string) * dividend) / dividend;
  field.value = toMoney(field.numberValue);
  inputMoneyType.value = 'text';
  emit('update:modelValue', field.numberValue)
}

// 将数字转换成金额千字文格式显示
function toMoney(val: number) {
  if (val) {
    return val.toFixed(props.precision).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
  } else {
    const zero = 0
    return zero.toFixed(props.precision)
  }

}

const moneyUpperText = computed(() => {
  return convertCurrency(field.numberValue)
})
function convertCurrency(money: number | null) {
  //汉字的数字
  let cnNums = new Array('零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖');
  //基本单位
  let cnIntRadice = new Array('', '拾', '佰', '仟');
  //对应整数部分扩展单位
  let cnIntUnits = new Array('', '万', '亿', '兆');
  //对应小数部分单位
  let cnDecUnits = new Array('角', '分', '毫', '厘');
  //整数金额时后面跟的字符
  let cnInteger = '整';
  //整型完以后的单位
  let cnIntLast = '元';
  //最大处理的数字
  let maxNum = 999999999999999.9999;
  //金额整数部分
  let integerNum;
  //金额小数部分
  let decimalNum;
  //输出的中文金额字符串
  let chineseStr = '';
  //分离金额后用的数组，预定义
  let parts;
  // 传入的参数为空情况 
  if (money === null) {
    return '';
  }
  if (money >= maxNum) {
    return ''
  }
  // 传入的参数为0情况 
  if (money == 0) {
    chineseStr = cnNums[0] + cnIntLast + cnInteger;
    return chineseStr
  }
  // 转为字符串
  let moneyStr = money.toString();
  // indexOf 检测某字符在字符串中首次出现的位置 返回索引值（从0 开始） -1 代表无
  if (moneyStr.indexOf('.') == -1) {
    integerNum = moneyStr;
    decimalNum = ''
  } else {
    parts = moneyStr.split('.');
    integerNum = parts[0];
    decimalNum = parts[1].substr(0, 4);
  }
  //转换整数部分
  if (parseInt(integerNum, 10) > 0) {
    let zeroCount = 0;
    let IntLen = integerNum.length
    for (let i = 0; i < IntLen; i++) {
      let n = integerNum.substr(i, 1);
      let p = IntLen - i - 1;
      let q = p / 4;
      let m = p % 4;
      if (n == '0') {
        zeroCount++;
      } else {
        if (zeroCount > 0) {
          chineseStr += cnNums[0]
        }
        zeroCount = 0;
        chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
      }
      if (m == 0 && zeroCount < 4) {
        chineseStr += cnIntUnits[q];
      }
    }
    // 最后+ 元
    chineseStr += cnIntLast;
  }
  // 转换小数部分
  if (decimalNum != '') {
    let decLen = decimalNum.length;
    for (let i = 0; i < decLen; i++) {
      let n = decimalNum.substr(i, 1);
      if (n != '0') {
        chineseStr += cnNums[Number(n)] + cnDecUnits[i]
      }
    }
  }
  if (chineseStr == '') {
    chineseStr += cnNums[0] + cnIntLast + cnInteger;
  } else if (decimalNum == '') {
    chineseStr += cnInteger;
  }

  return chineseStr
}
</script>

<style scoped>

</style>
