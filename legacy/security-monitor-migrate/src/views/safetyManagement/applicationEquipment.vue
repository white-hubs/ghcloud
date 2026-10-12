<template>
    <g-table
    ref="tableRef"
    :title="pageTitle"
    :api="api"
    :btns="btns"
    :search="search"
    :columns="columns">
        <template #header-btns>
            <a-button type="primary" @click="addDevice">关联设备</a-button>
        </template>
        <template #beforeBtn="{record}">
            <a-popconfirm
              title="是否移除当前选中？"
              cancelText="取消"
              okText="确定"
              @confirm.stop="deleteRecord(record)"
            >
                <a-button class="deleteRow" type="link" danger>移除</a-button>
            </a-popconfirm>
        </template>
    </g-table>
    
    <g-modal :visible="modal.visible" title="设备" rowKey="deviceId" url="getDevices" :activeId="[]" :search="modal.search" :columns="modal.columns" selectionType="checkbox" @close="closeModal">

    </g-modal>
</template>

<script lang="jsx">
import { usePageName } from "@ghcloud/cube-utils"
import { defineComponent, getCurrentInstance, reactive, toRefs,ref } from "vue";
export default defineComponent({
    setup(){
        const {proxy} = getCurrentInstance();
        const tableRef = ref(null);
        const { pageTitle } = usePageName();
        const state = reactive({
            pageTitle: pageTitle,
            api:{
                list:"getSecurityDevicePage",
                deleteSingle:"deleteSecurityDevice",
            },
            btns:[],
            search:[
                {
                    component:"span",
                    value:"applicationCode",
                    defaultValue:"SECURITY_MONITORING"
                },
                {
                    label:"",
                    value:"keyword",
                    placeholder:"请输入设备型号或设备名称"
                }
            ],
            columns:[
                {
                    dataIndex:"code",
                    title:"设备编码"
                },
                {
                    dataIndex:"deviceName",
                    title:"设备名称"
                },
                {
                    dataIndex:"genreName",
                    title:"产品分类",
                    slots:{
                        customRender:"genreName"
                    },
                    customRender:({text}) =>{
                        return text?text:"--"
                    }
                },
                {
                    dataIndex:"modelName",
                    title:"设备型号",
                    slots:{
                        customRender:"modelName"
                    },
                    customRender:({text}) =>{
                        return text?text:"--"
                    }
                },
                {
                    dataIndex:"brandName",
                    title:"设备品牌",
                    slots:{
                        customRender:"brandName"
                    },
                    customRender:({text}) =>{
                        return text?text:"--"
                    }
                },
                {
                    dataIndex:"area",
                    title:"所属区域",
                    slots:{
                        customRender:"area"
                    },
                    customRender:({text}) =>{
                        return text?text:"--"
                    }
                },
                {
                    dataIndex:"action",
                    title:"操作",
                    slots:{
                        customRender:"action"
                    }
                },
            ],
            modal:{
                visible:false,
                search:[
                    {
                        value:"applicationCode",
                        defaultValue:"SECURITY_MONITORING",
                        component:"span"
                    },
                    {
                        label:"产品分类",
                        value:"genreId",
                        component:"g-select",
                        url:"getDeviceGenre",
                        field:{id: "value",name: "label"}
                    },
                    {
                        label:"",
                        value:"keyword",
                        placeholder:"请输入设备名称或型号"
                    }
                ],
                columns:[
                    {
                        dataIndex:"code",
                        title:"编码"
                    },
                    {
                        dataIndex:"deviceName",
                        title:"设备名称"
                    },
                    {
                        dataIndex:"genreName",
                        title:"产品分类",
                        slots:{
                            customRender:"genreName"
                        },
                        customRender:({text}) =>{
                            return text?text:"--"
                        }
                    },
                    {
                        dataIndex:"modelName",
                        title:"设备型号",
                        slots:{
                            customRender:"modelName"
                        },
                        customRender:({text}) =>{
                            return text?text:"--"
                        }
                    },
                    {
                        dataIndex:"brandName",
                        title:"设备品牌",
                        slots:{
                            customRender:"brandName"
                        },
                        customRender:({text}) =>{
                            return text?text:"--"
                        }
                    },
                    {
                        dataIndex:"areaName",
                        title:"所属区域",
                        slots:{
                            customRender:"areaName"
                        },
                        customRender:({text}) =>{
                            return text?text:"--"
                        }
                    }
                ],

            }
        })
        const addDevice = () =>{
            state.modal.visible = true
        }
        const closeModal = (data) =>{
            if(data){
                let params = data.map(item =>{
                    return {...item,applicationCode:"SECURITY_MONITORING"}
                })
                proxy.$api.addSecurityDevice(params).then(res =>{
                    state.modal.visible = false;
                    tableRef.value.getData();
                })
            }else{
                state.modal.visible = false
            }
            
        }
        const deleteRecord = (record) =>{
            proxy.$api.deleteSecurityDevice(record.id).then(res =>{
                proxy.$message.success("操作成功");
                tableRef.value.getData()
            })
        }
        return {
            ...toRefs(state),
            tableRef,
            addDevice,
            closeModal,
            deleteRecord
        }
    }
})
</script>

<style>

</style>