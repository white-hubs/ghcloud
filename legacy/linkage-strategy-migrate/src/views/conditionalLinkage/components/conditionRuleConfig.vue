<template>
<div class="sub">
    <div class="add-row">
        <span>联动条件：</span>
        <a-button type="primary" @click="addConditionalRule">
            添加
            <PlusOutlined />
        </a-button>
    </div>
    <div class="config-row flex-between" v-for="(item,index) in configData" :key="index">
        <div class="left">
            <conditional-rule v-model:ruleConfig="configData[index]"></conditional-rule>
        </div>
        <div class="right">
            <a-button type="link" danger @click="deleteConditionalRule(index)">删除</a-button>
        </div>
    </div>
</div>
</template>

<script>
import { defineComponent, reactive,watch ,toRefs} from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import conditionalRule from "./conditionalRule.vue"
export default defineComponent({
    components:{PlusOutlined,conditionalRule},
    props:{
        ruleConfig:{
            type:Array,
            default:() =>{
                return []
            }
        }
    },
    setup(props){
        const state = reactive({
            configData:[]
        })
        const addConditionalRule = () =>{
            state.configData.push({
                deviceProdCategoryCodeConcat:null,
                deviceProdCategoryName:null,
                deviceProdId:null,
                deviceProdName:null,
                id:null,
                code:null,
                name:null,
                areaId:null,
                areaName:null,
                propCode:null,
                propName:null,
                op:null,
                opName:null,
                oprand:null,
                delayTime:null})
        }
        const deleteConditionalRule = (index) =>{
            state.configData.splice(index,1);
        }
        watch(() =>props.ruleConfig,(value) =>{
            state.configData = value
        },
        {deep:true}
        )
        return {
            ...toRefs(state),
            addConditionalRule,
            deleteConditionalRule
        }
    }
})
</script>

<style>

</style>