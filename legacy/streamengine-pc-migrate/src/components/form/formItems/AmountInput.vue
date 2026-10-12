<template>
  <div>
    <a-input-number v-model:value="value" :placeholder="placeholder" @change="emits('update:modelValue', value)"
      class="amount-input" :precision="props.precision" :max="99999999999999.99" :maxlength="props.maxlength"
      :min="props.minNum" :formatter="thousandAndDecimal" :parser="parser" :disabled="readonly" :controls="false"
      :onfocus="() => onFoucs = true" :onblur="() => onFoucs = false" />
    <span v-show="value !== null" v-if="props.showChinese">大写:{{ moneyUpperText }}</span>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
const props = withDefaults(defineProps<{
  modelValue?: number | null
  placeholder?: string
  readonly?: boolean
  showChinese?: boolean
  maxlength?: number
  maxNum?: number
  minNum?: number
  precision?: number;
}>(), {
  modelValue: null,
  placeholder: "请输入金额",
  readonly: false,
  showChinese: false,
  maxlength: 100000,
  precision: 0
})
const emits = defineEmits(['update:modelValue'])

const moneyUpperText = computed(() => {
  return convertCurrency(value.value)
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

function thousandAndDecimal(val: string) {
  if (onFoucs.value) {
    return val
  } else {
    if (val) {
      return parseFloat(val).toFixed(props.precision).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    } else {
      const zero = 0
      return zero.toFixed(props.precision)
    }
  }
}
function parser(val: string) {
  let reg = /^(-)*(\d+)\.(\d\d).*$/;
  return val.replace(/\￥\s?|(,*)/g, '').replace(reg, '$1$2.$3');
}
const onFoucs = ref(false)

watch(() => props.modelValue, () => {
  if (props.readonly) {
    value.value = props.modelValue
  }
})
const value = ref(props.modelValue)
</script>
<style scoped>
.amount-input {
  width: 100%;
}
</style>