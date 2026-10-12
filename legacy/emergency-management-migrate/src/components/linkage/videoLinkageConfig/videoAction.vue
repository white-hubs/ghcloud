<template>
<div>
    <a-form layout="inline">
        <a-form-item>
            <div class="flex-between">
                <a-input v-model:value="videoData.name" placeholder="请选择设备" :disabled="true" @change="changeVideo"></a-input>
                <a-button type="primary" @click="openModal">添加</a-button>
            </div>
        </a-form-item>
        <a-form-item>
            <g-select :options="videoEvent" :field="null" v-model:value="videoData.type" style="width:200px"></g-select>
        </a-form-item>
        <a-form-item v-if="videoData.type == 'VIDEOTAPE'">
            <a-input type="number" v-model:value="videoData.time" addon-after="s" placeholder="输入录像时间"></a-input>
        </a-form-item>
        <a-form-item v-if="videoData.type == 'PHOTOGRAPH'">
            <a-input type="number" v-model:value="videoData.intervalTime" addon-before="每" addon-after="s" placeholder="输入抓拍时间"></a-input>
        </a-form-item>
        <a-form-item v-if="videoData.type == 'PHOTOGRAPH'">
            <a-input type="number" v-model:value="videoData.durationTime" addon-before="抓拍" addon-after="张" placeholder="输入抓拍张数"></a-input>
        </a-form-item>
        <a-form-item v-if="showActionType">
            <g-select :options="actionTypes" :field="null" v-model:value="videoData.executeMode" style="width:200px"></g-select>
        </a-form-item>
    </a-form>
    <a-modal v-model:visible="visible" title="选择摄像机" :width="1000" @ok="handleOk">
        <!-- <a-form layout="inline">
            <a-form-item label="所属区域">
                <a-cascader v-model:value="search.areaId" :options="areaList" :fieldNames="{'label':'name','value':'id'}" change-on-select placeholder="请选择区域" />
            </a-form-item>
            <a-form-item>
                <a-input placeholder="请输入关键字"></a-input>
            </a-form-item>
            <a-form-item>
                <a-space :size="16">
                    <a-button type="primary">查询</a-button>
                    <a-button>重置</a-button>
                </a-space>
            </a-form-item>
        </a-form> -->
        <div class="table-body">
            <a-table :dataSource="tableData" :columns="tableColumns" rowKey="id" :pagination="false" size="small" bordered :row-selection="{type:'radio',selectedRowKeys:selectedRowKeys,onChange:onSelectChange}"></a-table>
        </div>
        <div class="page-body">
            <a-pagination v-model:current="search.pageNumber" v-model:page-size="search.pageSize" :total="total" :show-total="total => `共 ${total} 条数据`" @change="changeTablePage"/>
        </div>
    </a-modal>
</div>
</template>

<script lang="jsx">
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs } from "vue";
import {actionTypes,videoEvent} from "@/utils/enumerate";
export default defineComponent({
    props:{
        configData:{
            type:Object,
            default: () =>{
                return {}
            }
        },
        showActionType:{
            type:Boolean,
            default:true
        }
    },
    setup(props,{emit}){
        const {proxy} = getCurrentInstance();
        const state = reactive({
            videoEvent:videoEvent,
            actionTypes:actionTypes,
            videoData:{},
            visible:false,
            search:{
                areaId:"",
                keyword:"",
                pageSize:10,
                pageNumber:1,
            },
            total:0,
            tableColumns:[
                {
                    title:"摄像机编号",
                    dataIndex:"code",
                    key:"code"
                },
                {
                    title:"摄像机名称",
                    dataIndex:"name",
                    key:"name"
                },
                {
                    title:"摄像机型号",
                    dataIndex:"modelName",
                    key:"modelName"
                }
            ],
            tableData:[],
            selectedRowKeys:[],
            selectedRows:[],
        })
        const getVideoPage = async () =>{
            const data = await proxy.$api.getVideoPage(state.search);
            if(data){
                state.tableData = data.records;
                state.total = data.total;
            }
        }
        const openModal = () =>{
            state.visible = true;
            getVideoPage();
        }
        const handleOk = () =>{
            if(state.selectedRows.length){
                const {id,name,code} = state.selectedRows[0];
                state.videoData.id = id;
                state.videoData.code = code;
                state.videoData.name = name;
                state.videoData.token = state.selectedRows[0].iotConfig.identify;
                state.visible = false;
            }
            else {
                proxy.$message.warning("请选择摄像机");
            }
        }
        const onSelectChange = (selectedRowKeys, selectedRows) =>{
            state.selectedRows = selectedRows;
            state.selectedRowKeys = selectedRowKeys;
        }
        const changeTablePage = (page,pageSize) =>{
            state.search.pageNumber = page;
            getVideoPage()
        }
        const changeVideo = () =>{
            emit("update:configData",state.videoData);
        }
        onMounted(() =>{
            state.videoData = props.configData;
        })
        return {
            ...toRefs(state),
            onSelectChange,
            changeTablePage,
            getVideoPage,
            openModal,
            handleOk,
            changeVideo
        }
    }
})
</script>

<style>

</style>