<template>
<a-form ref="formRef" :model="formData" layout="inline" class="comform">
    <template v-for="item in formItem">
        <a-form-item 
            :label="item.title" 
            :name="item.key"
            :style="{ width: item.itemWidth || 'auto' }"
            :labelCol="{span: item.labelCol ? item.labelCol : 6}"
            :wrapperCol="{span: item.labelCol ? 24-item.labelCol : 18}"
        >
            <!-- 输入框 -->
            <a-input 
                v-model:value="formData[item.key]" 
                :allowClear="true" 
                autocomplete="off"  
                :placeholder="item.placeholder ? item.placeholder : '请输入'"
                :disabled="item.disabled ? true : false"
                v-if="item.type === 'input'"/>
            <!-- 下拉选择 -->
            <a-select 
                v-model:value="formData[item.key]"
                :placeholder="item.placeholder || '请选择'"
                :allowClear="item.allowClear ? true : false"
                :disabled="item.disabled ? true : false"
                v-if="item.type === 'select'"
            >
                <a-select-option :value="option.value" v-for="option in item.options">{{ option.label }}</a-select-option>
            </a-select>
            <!-- 时间选择 -->
            <a-date-picker 
                v-model:value="formData[item.key]"
                :allowClear="true" 
                valueFormat="YYYY-MM-DD"
                style="width: 100%;"
                :disabled="item.disabled ? true : false"
                v-if="item.type === 'datePicker'"
            />
            <!-- 时间范围选择框 -->
            <a-range-picker
                v-model:value="formData[item.key]"
                :allowClear="true"
                valueFormat="YYYY-MM-DD"
                style="width: 100%;"
                :disabled="item.disabled ? true : false"
                v-if="item.type === 'rangePicker'"
            />
        </a-form-item>
    </template>
</a-form>
</template>
<script setup lang="ts">
import { computed, reactive } from "vue";
import type {FormItem} from "./type";
interface Props {
    formItem:FormItem[]
}
const props = withDefaults(defineProps<Props>(),{
    formItem: () =>[]
})
const formData = computed(() =>{
    let data:any = reactive({})
    props.formItem.forEach(item =>{
        data[item.key] = item.defaultVal || undefined
    })
    return data
})
const onSubmit = () =>{
    return formData
}
defineExpose({
    onSubmit
})
</script>
<style lang="less">
.comform{
    .ant-form-item{
        .ant-form-item-label > label{
            color: #FFFFFF;
        }
        .ant-picker,.ant-input-affix-wrapper{
            color: #FFFFFF;
            background: rgba(96, 112, 128, 0.6);
            border: 1px solid rgba(96,112,128,0.6);
        }
        .ant-picker-input > input{
            color: #FFFFFF;
        }
        .ant-picker-separator,.ant-picker-suffix{
            color: rgba(255,255,255,0.8) !important;
        }
        .ant-input{
            background-color: transparent;
            color: #FFFFFF;
        }
        .anticon.ant-input-clear-icon{
            color: rgba(255,255,255,0.8);
        }
    }
}
</style>