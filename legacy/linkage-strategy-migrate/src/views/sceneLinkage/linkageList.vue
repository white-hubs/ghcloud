<template>
    <div class="content">
        <g-table :title="pageTitle"
            :api="api"
            :btns="btns"
            tableCode="SCENE_LINKAGE"
            :search="search"
            :columns="columns"
            :scrollX="900"
            editMode="page"
            :rowSelection="true"
            >
            <template #btn="{record}">
                <a-button type="link" @click="executeLinkage(record)">执行</a-button>
            </template>
        </g-table>
        <a-modal title="执行场景控制" v-model:visible="visible" @ok="handleOk" @cancel="close">
            <a-form ref="formRef" :model="form" :rules="rules">
                <a-form-item label="密码" name="password">
                    <a-input type="password" v-model:value="form.password" placeholder="请输入密码"></a-input>
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script>
import { defineComponent, getCurrentInstance, reactive, ref, toRefs } from "vue";
import {types} from "@/utils/enumerate"
import {putFullTime} from "@/utils/common"
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
    setup(){
        const formRef = ref(null);
        const { pageTitle } = usePageName()
        const {proxy} = getCurrentInstance();
        const state = reactive({
            api:{
                list:"getSceneRulePage",
                deleteSingle:"deleteRule",
                delete:"batchDeleteRule",
                path:"/sceneLinkageEdit",
            },
            btns:["add","edit","deleteSingle","delete"],
            search:[
                { label: "", value: "keyword", placeholder: "请输入场景名称搜索" },
            ],
            columns:[
                {
                    title: '场景名称',
                    dataIndex: 'name',
                    key: 'name',
                },
                {
                    title: '触发次数',
                    dataIndex: 'triggerNum',
                    key: 'triggerNum',
                    slots:{
                        customRender:'triggerNum'
                    },
                    customRender:({text}) =>{
                        return text == null?'0':text
                    }
                },
                {
                    title: '更新时间',
                    dataIndex: 'updateTime',
                    key: 'updateTime',
                    slots:{
                        customRender:'updateTime'
                    },
                    customRender:({text}) =>{
                        return putFullTime(text)
                    }
                },
                {
                    title: '操作',
                    dataIndex: 'action',
                    key: 'action',
                    slots: {
                        customRender: "action",
                    },
                }
            ],
            form:{
                password:""
            },
            rules:{
                password:[
                    {required:true,message: '请输入密码'}
                ]
            },
            visible:false,
            currentExecuteLinkage:null,
        })
        const executeLinkage = async (record) =>{
            state.currentExecuteLinkage = record;
            state.visible = true;
        }
        const handleOk = () =>{
            formRef.value.validate().then(async () =>{
                const data = await proxy.$api.triggerSceneLinkage({id:state.currentExecuteLinkage.id,password:state.form.password});
                if(data){
                    proxy.$message.success("下发指令成功！");
                    close()
                }
            })
        }
        const close = () =>{
            state.visible = false;
            state.form.password = null;
        }
        return {
            ...toRefs(state),
            formRef,
            executeLinkage,
            handleOk,
            close,
            pageTitle
        }
    }
})
</script>

<style scoped>
.content{
height: 82vh;
overflow: auto;

}

</style>