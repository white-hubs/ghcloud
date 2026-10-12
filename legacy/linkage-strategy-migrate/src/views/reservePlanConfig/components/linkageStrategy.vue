<template>
    <div class="tab-pane-content">
        <div class="sub-item">
            <div class="header">
                <g-vertical-line title="基础信息"></g-vertical-line>
            </div>
            <div class="sub-item-content">
                <a-form layout="inline">
                    <a-form-item label="预案名称">
                        <a-input v-model="linkagePlan.basics.name" placeholder="请输入预案名称" style="width:400px"></a-input>
                    </a-form-item>
                    <a-form-item label="备注">
                        <a-textarea v-model="linkagePlan.basics.remark" placeholder="请输入备注，不超过20字" style="width:500px"></a-textarea>
                    </a-form-item>
                </a-form>
            </div>
        </div>
        <div class="sub-item">
            <div class="header">
                <g-vertical-line title="监控联动"></g-vertical-line>
            </div>
            <div class="sub-item-content">
                <div class="add-row">
                    <span>现场抓拍：</span>
                    <a-button type="primary" @click="addLinkageVideoConfig">
                        添加
                        <PlusOutlined />
                    </a-button>
                    <span class="explain">说明：监控录像默认录制时长30秒，报警监控默认每隔5秒抓拍3张；请确认报警设备已关联监控设备！</span>
                </div>
                <div class="config-row flex-between" v-for="(item,index) in linkagePlan.videoLinkage" :key="index">
                    <div class="left">
                        <a-space :size="16">
                            <g-select :options="[]" :field="null" v-model:value="item.device" placeholder="选择摄像机" style="width:200px"></g-select>
                            <g-select :options="videoEvent" :field="null" v-model:value="item.actionEvent" style="width:200px"></g-select>
                            <a-radio-group name="radioGroup" v-model:value="item.actionMode">
                                <a-radio :value="1">手动</a-radio>
                                <a-radio :value="2">自动</a-radio>
                            </a-radio-group>
                        </a-space>
                    </div>
                    <div class="right">
                        <a-button type="link" danger @click="deleteVideoConfig(index)">删除</a-button>
                    </div>
                </div>
            </div>
        </div>
        <div class="sub-item">
            <div class="header">
                <g-vertical-line title="设备联动"></g-vertical-line>
            </div>
            <div class="sub-item-content">
                <div class="add-row">
                    <span>联动动作：</span>
                    <a-button type="primary" @click="addLinkageDeviceConfig">
                        添加
                        <PlusOutlined />
                    </a-button>
                </div>
                <div class="config-row flex-between" v-for="(item,index) in linkagePlan.equipmentLinkage" :key="index">
                    <div class="left">
                        <a-space :size="16">
                            <g-select :options="[]" :field="null" v-model:value="item.deviceType" placeholder="请选择设备类型" style="width:200px"></g-select>
                            <g-select :options="[]" :field="null" v-model:value="item.device" placeholder="请选择设备" style="width:200px"></g-select>
                            <g-select :options="[]" :field="null" v-model:value="item.attribute" placeholder="请选择设备属性" style="width:200px"></g-select>
                            <a-input v-model="value" placeholder="请输入设定的属性数值"></a-input>
                            <a-radio-group name="radioGroup" v-model:value="item.actionMode">
                                <a-radio :value="1">手动</a-radio>
                                <a-radio :value="2">自动</a-radio>
                            </a-radio-group>
                        </a-space>
                    </div>
                    <div class="right">
                        <a-button type="link" danger @click="deleteDeviceConfig(index)">删除</a-button>
                    </div>
                </div>
            </div>
        </div>
        <div class="sub-item">
            <div class="header">
                <g-vertical-line title="消息通知"></g-vertical-line>
            </div>
            <div class="sub-item-content">
                <div class="add-row">
                    <span>消息通知：</span>
                    <a-button type="primary" @click="addMessageNotifyConfig">
                        添加
                        <PlusOutlined />
                    </a-button>
                </div>
                <div class="config-row flex-between" v-for="(item,index) in linkagePlan.messageNotify" :key="index">
                    <div class="left">
                        <div class="config-box">
                            <div class="box-header">
                                <a-form layout="inline">
                                    <a-form-item label="通知方式">
                                        <g-select :options="notifyTypeList" :field="null" v-model:value="item.notifyType" placeholder="请选择通知方式" style="width:200px"></g-select>
                                    </a-form-item>
                                    <a-form-item>
                                        <a-radio-group name="radioGroup" v-model:value="item.actionMode">
                                            <a-radio :value="1">手动</a-radio>
                                            <a-radio :value="2">自动</a-radio>
                                        </a-radio-group>
                                    </a-form-item>
                                </a-form>
                            </div>
                            <div class="box-center">
                                <div class="add-row">
                                    <span>通知人员：</span>
                                    <a-button type="primary" @click="addnotifyPersonnel(index)">
                                        添加
                                        <PlusOutlined />
                                    </a-button>
                                </div>
                                <div class="config-row flex-between" v-for="(element,j) in item.notifyTarget" :key="j">
                                    <div class="left">
                                        <a-space :size="16">
                                            <g-select :options="[]" :field="null" v-model:value="element.department" placeholder="请选择部门" style="width:200px"></g-select>
                                            <g-select :options="[]" :field="null" v-model:value="element.post" placeholder="请选择岗位" style="width:200px"></g-select>
                                        </a-space>
                                    </div>
                                    <div class="right">
                                        <a-button type="link" danger @click="deletenotifyPersonnel(index,j)">删除</a-button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="right">
                        <a-button type="link" danger @click="deleteMessageConfig(index)">删除</a-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent ,reactive, toRefs} from "vue"
import { PlusOutlined } from "@ant-design/icons-vue";
import {videoEvent,notifyTypeList} from "@/utils/enumerate"
export default defineComponent({
    components:{
        PlusOutlined
    },
    setup(){
        const state = reactive({
            videoEvent:videoEvent,
            notifyTypeList:notifyTypeList,
            linkagePlan:{
                basics:{
                    name:"",
                    remark:""
                },
                videoLinkage:[],
                equipmentLinkage:[],
                messageNotify:[],
                alarmNotify:[],
            },
        })
        const addLinkageVideoConfig = () =>{
            state.linkagePlan.videoLinkage.push({device:"",actionEvent:1,actionMode:1});
        }
        const deleteVideoConfig = (index) =>{
            state.linkagePlan.videoLinkage.splice(index,1);
        }
        const addLinkageDeviceConfig = () =>{
            state.linkagePlan.equipmentLinkage.push({deviceType:"",device:"",attribute:"",value:"",actionMode:1})
        }
        const deleteDeviceConfig = (index) =>{
            state.linkagePlan.equipmentLinkage.splice(index,1)
        }
        const addMessageNotifyConfig = () =>{
            state.linkagePlan.messageNotify.push({notifyType:"",notifyTarget:[],actionMode:1})
        }
        const deleteMessageConfig = (index) =>{
            state.linkagePlan.messageNotify.splice(index,1);
        }
        const addnotifyPersonnel = (index) =>{
            state.linkagePlan.messageNotify[index].notifyTarget.push({department:"",post:""})
        }
        const deletenotifyPersonnel = (index,j) =>{
            state.linkagePlan.messageNotify[index].notifyTarget.splice(j,1);
        }
        return{
            ...toRefs(state),
            addLinkageVideoConfig,
            deleteVideoConfig,
            addLinkageDeviceConfig,
            deleteDeviceConfig,
            addMessageNotifyConfig,
            deleteMessageConfig,
            addnotifyPersonnel,
            deletenotifyPersonnel
        }
    }
})
</script>

<style lang="less" scepod>
.tab-pane-content{
    padding: 0 16px;
    height: 100%;
    overflow: auto;
    .header{
        padding: 16px 0;
    }
    .sub-item-content{
        margin: 0 16px;
        .explain{
            font-size: 12px;
            color: #aaa;
            margin-left: 16px;
        }
        .add-row,.config-row{
            margin-bottom: 10px;
            // border-bottom: solid 1px #aaa;
            .left{
                flex: 1;
            }
        }
        >.config-row{
            margin-left: 64px;
        }
    }
}
.config-box{
    border: 1px solid #aaa;
    padding: 0 16px;
    .box-header{
        padding: 8px 16px;
        border-bottom: 1px solid #aaa;
    }
    .box-center{
        padding: 8px 16px;
    }
}
</style>