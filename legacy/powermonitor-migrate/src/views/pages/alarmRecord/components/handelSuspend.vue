<template>
<a-modal title="挂起" v-model:visible="visible" @ok="handleOk" @cancel="cancel">
    <a-form :label-col="labelCol" :wrapper-col="wrapperCol" ref="modalFormRef" :model="form">
        <a-form-item label="预计处理时间">
            <a-date-picker v-model:value="form.estimatedProcessTime" value-format="YYYY-MM-DD" style="width:100%"/>
        </a-form-item>
        <a-form-item label="挂起原因">
            <a-textarea v-model:value="form.remark" placeholder="请输入挂起原因" allow-clear />
        </a-form-item>
        <a-form-item label="图片">
            <g-upload ref="upLoad" :max="3" businessKey="alarm" @changeFile="changeFile"></g-upload>
        </a-form-item>
    </a-form>
</a-modal>
</template>

<script lang="jsx">
import { defineComponent, reactive, ref, toRefs } from "vue";
export default defineComponent({
    setup(props,{emit}){
        const modalFormRef = ref();
        const upLoad = ref();
        const state = reactive({
            visible:false,
            form:{
                estimatedProcessTime:"",
                remark:"",
                fileVOS:[]
            }
        })
        const handleOk = () =>{
            emit('modal-save',state.form);
        }
        const cancel = () =>{
            modalFormRef.value.resetFields();
            state.form = {
                estimatedProcessTime:"",
                remark:"",
                fileVOS:[]
            }
            upLoad.value.fileList = [];
            state.visible = false;
        }
        const changeFile = (fileId) =>{
            const fileList = upLoad.value.fileList;
            state.form.fileVOS = fileList.map(item =>{
                return item.response.data
            })
        }
        return {
            ...toRefs(state),
            handleOk,
            cancel,
            labelCol: { span: 5 },
            wrapperCol: { span: 18 },
            changeFile,
            upLoad,
            modalFormRef
        }
    }
})
</script>

<style>

</style>