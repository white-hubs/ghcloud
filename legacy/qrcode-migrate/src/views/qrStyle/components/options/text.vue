<template>
    <a-form :label-col="labelCol">
        <a-form-item label="文本类型">
            <a-radio-group v-model:value="formData.textType">
                <a-radio value="FIX_TEXT">固定文本</a-radio>
                <a-radio value="ENTITY_ATTRIBUTES">实体属性</a-radio>
            </a-radio-group>
        </a-form-item>
        <a-form-item label="文本内容">
            <a-input v-model:value="formData.text" :max="20" placeholder="请输入文本"></a-input>
        </a-form-item>
        <a-form-item label="实体类型" v-if="formData.textType === 'ENTITY_ATTRIBUTES'">
            <g-select :options="entityTypeOptions" :field="{entityType: 'value',typeName: 'label'}" v-model:value="formData.entityType" style="width:100%" @changeCheck="changeCheck"></g-select>
        </a-form-item>
        <a-form-item label="实体属性" v-if="formData.textType === 'ENTITY_ATTRIBUTES'">
            <g-select :options="entityAttributesOptions" :field="{code: 'value',name: 'label'}" v-model:value="formData.entityAttributesVlaue" style="width:100%" @changeCheck="changeEntityAttributesVaLue"></g-select>
        </a-form-item>
        <a-form-item label="字体大小">
            <a-input type="Number" v-model:value="formData.option.fontSize"></a-input> 
        </a-form-item>
        <a-form-item label="字体颜色">
            <avue-input-color color-format="hex" :show-alpha="false" placeholder="请选择颜色" v-model="formData.option.color" ></avue-input-color>
        </a-form-item>
        <a-form-item label="字体粗细">
            <g-select :options="dicOption.fontWeight" :field="field" v-model:value="formData.option.fontWeight" :allowClear="false" style="width:100%"></g-select>
        </a-form-item>
        <a-form-item label="对齐方式">
            <g-select :options="dicOption.textAlign" :field="field" v-model:value="formData.option.textAlign" :allowClear="false" style="width:100%"></g-select>
        </a-form-item>
        <a-form-item label="背景填充">
            <avue-input-color color-format="hex" :show-alpha="false" placeholder="请选择颜色" v-model="formData.option.backgroundColor" ></avue-input-color>
        </a-form-item>
        <a-form-item label="宽度">
            <a-input type="number" v-model:value="formData.component.width" @change="changeNumberValue('width')"></a-input>
        </a-form-item>
        <a-form-item label="高度">
            <a-input type="number" v-model:value="formData.component.height" @change="changeNumberValue('height')"></a-input>
        </a-form-item>
        <a-form-item label="x位置">
            <a-input type="number" v-model:value="formData.component.left" @change="changeNumberValue('left')"></a-input>
        </a-form-item>
        <a-form-item label="y位置">
            <a-input type="number" v-model:value="formData.component.top" @change="changeNumberValue('top')"></a-input>
        </a-form-item>
    </a-form>
</template>

<script>
import { defineComponent ,getCurrentInstance,onMounted,ref,watch} from "vue";
import {dicOption} from "./config.js";
export default defineComponent({
    props:{
        value:{
            type:Object,
            default:() =>{
                return {}
            }
        }
    },
    setup(props,{emit}){
        const {proxy} = getCurrentInstance();
        const formData = ref(props.value);
        const entityTypeOptions = ref([]);
        const entityAttributesOptions = ref([]);
        const changeNumberValue = (key) =>{
            formData.value.component[key] = Number(formData.value.component[key]);
        }
        onMounted(() =>{
            getEntityType();
        })
        const getEntityType = async () =>{
            const data = await proxy.$api.getEntityType();
            if(data){
                entityTypeOptions.value = data;
                if(formData.value.entityType){
                    changeCheck()
                }
            }
        }
        const changeCheck = (value,option) =>{
            let activeOption = entityTypeOptions.value.find(item =>item.entityType === formData.value.entityType);
            if(activeOption){
                entityAttributesOptions.value = activeOption.attributeVOS
            }
        }
        const changeEntityAttributesVaLue=(value,option) =>{
            if(formData.value.text.indexOf('$$')===-1){
                const text=formData.value.text
                formData.value.text= text.concat(`$$${value}$$`)
            }else{
                formData.value.text=value? formData.value.text.replace(/\$\$.*\$\$/,`$$$${value}$$$`):formData.value.text.replace(/\$\$.*\$\$/,'')
            }
        }
        watch(()=>formData.value.textType,(val)=>{
            if(val==='ENTITY_ATTRIBUTES'){
                if(formData.value.entityAttributesVlaue)formData.value.text=formData.value.text+`$$${formData.value.entityAttributesVlaue}$$`
            }else{
                formData.value.text=formData.value.text.replace(/\$\$.*\$\$/,'')
            }
        })
        watch(() =>props.value,(val) =>{
            formData.value = val
        })
        return {
            formData,
            labelCol:{style:{width:'72px'}},
            field:{value:'value',label:'label'},
            dicOption:dicOption,
            changeNumberValue,
            changeCheck,
            changeEntityAttributesVaLue,
            entityTypeOptions,
            entityAttributesOptions
        }
    }
})
</script>

<style>

</style>