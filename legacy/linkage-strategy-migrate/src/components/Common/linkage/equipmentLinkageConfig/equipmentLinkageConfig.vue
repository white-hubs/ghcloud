<template>
    <div class="sub">
        <div class="add-row">
            <span>联动事件：</span>
            <a-button type="primary" @click="addLinkageDeviceConfig">
                添加
                <PlusOutlined />
            </a-button>
        </div>
        <div class="config-row flex-between" v-for="(item,index) in equipmentLinkageConfig.actionConfig" :key="index">
            <div class="left">
                <deive-action :actionShow="actionShow" v-model:configData="equipmentLinkageConfig.actionConfig[index]" ></deive-action>
            </div>
            <div class="right">
                <a-button type="link" danger @click="deleteDeviceConfig(index)">删除</a-button>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent,onMounted,reactive,ref,toRefs, watch } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import {actionTypes} from "@/utils/enumerate";
export default defineComponent({
    components:{
        PlusOutlined
    },
    props:{
        actionConfig:{
            type:Array,
            default:() =>{
                return []
            }
        },
        actionShow:{
            type:Boolean,
            default:true
        },
    },
    setup(props){
        watch(() =>props.actionConfig,(value) =>{
            state.equipmentLinkageConfig.actionConfig = value
        },
        {deep:true}
        )
        const state = reactive({
            actionTypes:actionTypes,
            equipmentLinkageConfig:{
                actionType:"IOT_DEVICE_ACTION",
                actionConfig:[]
            }
        })
        const addLinkageDeviceConfig = () =>{
            state.equipmentLinkageConfig.actionConfig.push({deviceProdCategoryCodeConcat:null,deviceProdCategoryName:null,deviceProdId:null,deviceProdName:null,id:null,code:null,name:null,propCode:null,propName:null,executeMode:"AUTOMATIC",propValue:null})
        }
        const deleteDeviceConfig = (index) =>{
            state.equipmentLinkageConfig.actionConfig.splice(index,1)
        }
        return {
            ...toRefs(state),
            addLinkageDeviceConfig,
            deleteDeviceConfig,
        }
    }
})
</script>

<style lang="less" scoped>
    .add-row,.config-row{
        margin-bottom: 10px;
    }
</style>