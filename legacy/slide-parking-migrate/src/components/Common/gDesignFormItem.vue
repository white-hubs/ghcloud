<template>
  <a-form-item :label="f.label" v-for="(f, fIndex) in formData" :key="fIndex">
    {{ modifyData(f) }}
  </a-form-item>
</template>

<script lang="jsx">
//用于表单设计器的表单回显
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
export default defineComponent({
  props: {
    formData: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const isJsonString = str => {
      try {
        const toObj = JSON.parse(str) // json字符串转对象
        /*
            判断条件 1. 排除null可能性 
                    2. 确保数据是对象或数组
        */
        if (toObj && typeof toObj === 'object') { 
          return true
        }
      } catch {
        return false
      }
      return false
    }
    //表单数据修改
    const modifyData = (f) => {
      let label = [];
      if (f.formItemType === "select" || f.formItemType === "checkbox") {
        const options = JSON.parse(f.options);
        options.forEach((item) => {
          if (f.value.indexOf(item.value) > -1&&item.label) {
            label.push(item.label);
          }
        });
      } else {
        if (f.value) {
          if(isJsonString(f.value)){
            if(JSON.parse(f.value)){
              label.push(JSON.parse(f.value)); 
            }else{
              label.push('--'); 
            }
          }else{
            if(f.value.trim()){
              label.push(f.value);
            }else{
              label.push('--'); 
            }
          }
        } else {
          label.push("--");
        }
      }
      return label.length>0?label.join("、"):'--';
    };
    return {
      modifyData,
    };
  },
});
</script>

<style></style>
