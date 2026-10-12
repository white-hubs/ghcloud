<template>
    <a-space :size="16">
        <g-select url="getDeviceTypsList" :showSearch="true" v-model:value="deviceData.genreId" placeholder="请选择设备类型" style="width:200px" @changeCheck="changeDeviceType"></g-select>
        <g-select :options="deviceModelList" v-model:value="deviceData.modelId" placeholder="请选择设备型号" style="width:200px" @changeCheck="changeDeviceModel"></g-select>
        <div class="flex-between">
            <a-input v-model:value="deviceData.name" placeholder="请选择设备" :disabled="true"></a-input>
            <a-button type="primary" @click="openModal">添加</a-button>
        </div>
        <g-select :options="deviceAttribute" :field="{'code':'value','name':'label'}" v-model:value="deviceData.propCode" placeholder="请选择设备属性" style="width:200px" @changeCheck="changeDeviceAttribute"></g-select>
        <a-input v-model:value="deviceData.propValue" placeholder="请输入设定的属性数值" @change="changePropValue"></a-input>
        <g-select :options="actionTypes" :field="null" v-model:value="deviceData.executeMode" style="width:200px" @changeCheck="changeExecuteMode"></g-select>
        
        <a-modal v-model:visible="visible" title="选择设备" @ok="handleOk" :width="1000">
            <a-form layout="inline">
                <a-form-item label="所属区域">
                    <a-cascader v-model:value="search.areaId" :options="areaList" :fieldNames="{'label':'name','value':'id'}" change-on-select placeholder="请选择区域" />
                </a-form-item>
                <a-form-item>
                    <a-input v-model:value="search.keyword" placeholder="请输入关键字"></a-input>
                </a-form-item>
                <a-form-item>
                    <a-space :size="16">
                        <a-button type="primary" @click="getIotDeviceList">查询</a-button>
                        <a-button>重置</a-button>
                    </a-space>
                </a-form-item>
            </a-form>
            <div class="table-body">
                <a-table :dataSource="tableData" :columns="tableColumns" rowKey="id" :pagination="false" size="small" bordered :row-selection="{type:'radio',selectedRowKeys:selectedRowKeys,onChange:onSelectChange}"></a-table>
            </div>
            <div class="page-body">
                <a-pagination v-model:current="search.pageNumber" v-model:page-size="search.pageSize" :total="total" :show-total="total => `共 ${total} 条数据`" @change="changeTablePage"/>
            </div>
        </a-modal>
    </a-space>
</template>

<script lang="jsx">
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs } from "vue";
import {deleteNullChi} from "@/utils/common";
import {actionTypes} from "@/utils/enumerate"
export default defineComponent({
    props:{
        configData:{
            type:Object,
            default: () =>{
                return {}
            }
        }
    },
    setup(props,{emit}){
        const {proxy} = getCurrentInstance();
        const state = reactive({
            actionTypes:actionTypes,
            deviceData:{},
            deviceModelList:[],
            deviceList:[],
            deviceAttribute:[],
            visible:false,
            areaList:[],
            total:0,
            search:{
                areaId:"",
                keyword:"",
                pageNumber:1,
                pageSize:10,
            },
            tableData:[],
            tableColumns:[
                {
                    title:"设备编号",
                    dataIndex:"code",
                    key:"code"
                },
                {
                    title:"设备名称",
                    dataIndex:"name",
                    key:"name"
                },
                {
                    title:"设备类型",
                    dataIndex:"genreName",
                    key:"genreName"
                },
                {
                    title:"所属区域",
                    dataIndex:"areaName",
                    key:"areaName"
                },
            ],
            selectedRowKeys:[],
            selectedRows:[]
        })
        // 选择设备类型
        const changeDeviceType = (value,record) =>{
            getDeviceModel(value);
            state.deviceData.modelName = record.label;
            state.deviceData.modelId = null;
            state.deviceData.id = null;
            state.deviceData.code = null;
            state.deviceData.name = null;
            state.deviceData.propCode = null;
            state.deviceData.propName = null;
            state.deviceData.propValue = null;
        }
        // 获取设备型号
        const getDeviceModel = async(value) =>{
            const data = await proxy.$api.getDeviceModelList({genreId:value});
            if(data){
                state.deviceModelList = data;
            }
        }
        // 选择设备型号
        const changeDeviceModel = async (value,record) =>{
            getModelAttribute(value);
            state.deviceData.modelName = record.label;
            state.deviceData.id = null;
            state.deviceData.code = null;
            state.deviceData.name = null;
            state.deviceData.propCode = null;
            state.deviceData.propName = null;
            state.deviceData.propValue = null;
            
        }
        // 获取设备属性
        const getModelAttribute = async (value) =>{
            const data = await proxy.$api.getModelAttribute({modelId:value});
            if(data){
                state.deviceAttribute = data
            }
        }
        const changeDeviceAttribute = (value,record) =>{
            state.deviceData.propValue = null;
            state.deviceData.propName = record.label
        }
        const changePropValue = () =>{
            emit("update:configData",state.deviceData);
        }
        const changeExecuteMode = () =>{
            emit("update:configData",state.deviceData);
        }

        const openModal = () =>{
            state.visible = true;
            getIotDeviceList();
        }
        // 获取设备实例列表
        const getIotDeviceList = async() =>{
            const data = await proxy.$api.getIotDeviceList({...state.search,areaId:state.search.areaId.length?state.search.areaId[state.search.areaId.length-1]:"",genreId:state.deviceData.genreId,modelIdList:state.deviceData.modelId});
            if(data){
                state.tableData = data.records;
                state.total = data.total;
            }
        } 
        // 获取区域
        const getAreaList = async () =>{
            const data = await proxy.$api.getAreaList();
            if(data){
                state.areaList = deleteNullChi(data)
            } 
        }
        const changeTablePage = (page,pageSize) =>{
            state.search.pageNumber = page;
            getIotDeviceList()
        }
        const onSelectChange = (selectedRowKeys, selectedRows) =>{
            state.selectedRows = selectedRows;
            state.selectedRowKeys = selectedRowKeys;
        }
        const handleOk  = () =>{
            if(state.selectedRows.length){
                const {id,code,name} = state.selectedRows[0];
                state.deviceData.id = id;
                state.deviceData.code = code;
                state.deviceData.name = name;
                state.visible = false;
            }
            else {
                proxy.$message.warning("请选择设备");
            }
        }
        onMounted(() =>{
            state.deviceData = props.configData;
            getAreaList()
            if(state.deviceData.genreId){
                getDeviceModel(state.deviceData.genreId);
            }
            if(state.deviceData.modelId){
                getModelAttribute(state.deviceData.modelId);
            }
        })
        return {
            ...toRefs(state),
            changeDeviceType,
            changeDeviceModel,
            changeDeviceAttribute,
            changePropValue,
            openModal,
            changeTablePage,
            handleOk,
            onSelectChange,
            changeExecuteMode,
            getIotDeviceList
        }
    }
})
</script>

<style lang="less" secoped>
    .table-body{
        margin: 16px 0;
    }
    .page-body{
        width: 100%;
        text-align: right;
    }

</style>