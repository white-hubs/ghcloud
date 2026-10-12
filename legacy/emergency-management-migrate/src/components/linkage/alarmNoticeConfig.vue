<template>
    <div class="sub">
        <div class="add-row">
            <span>报警通知：</span>
            <a-button type="primary" @click="addLinkageDeviceConfig">
                添加
                <PlusOutlined />
            </a-button>
        </div>
        <div class="config-row flex-between" v-for="(item,index) in alarmNoticeConfig.actionConfig" :key="index">
            <div class="left">
                <!-- <a-space :size="16">
                    <g-select :options="[]" :field="null" v-model:value="item.department" placeholder="请选择部门" style="width:200px"></g-select>
                    <g-select :options="[]" :field="null" v-model:value="item.post" placeholder="请选择岗位" style="width:200px"></g-select>
                </a-space> -->
                <notify-object-config v-model:configData="alarmNoticeConfig.actionConfig[index]" :notifyOject="item"></notify-object-config>
            </div>
            <div class="right">
                <a-button type="link" danger @click="deleteDeviceConfig(index)">删除</a-button>
            </div>
        </div>
    </div>
</template>

<script lang="jsx">
import { defineComponent,reactive,ref,toRefs,watch } from "vue";
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
        }
    },
    setup(props){
        watch(() =>props.actionConfig,(value) =>{
            state.alarmNoticeConfig.actionConfig = value
        },
        {deep:true}
        )
        const state = reactive({
            actionTypes:actionTypes,
            alarmNoticeConfig:{
                actionType:"ALARM_NOTIFY_ACTION",
                actionConfig:[]
            }
        })
        const addLinkageDeviceConfig = () =>{
            state.alarmNoticeConfig.actionConfig.push({postId:null,departmentId:null})
        }
        const deleteDeviceConfig = (index) =>{
            state.alarmNoticeConfig.actionConfig.splice(index,1)
        }
        return {
            ...toRefs(state),
            addLinkageDeviceConfig,
            deleteDeviceConfig
        }
    }
})
</script>

<style lang="less" scoped>
    .add-row,.config-row{
        margin-bottom: 10px;
    }
</style>