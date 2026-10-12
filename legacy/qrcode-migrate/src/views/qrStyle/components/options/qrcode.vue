<template>
    <a-form>
        <a-form-item label="宽度">
            <a-input v-model:value="formData.component.width" type="number" @change="changeNumberValue('width')"></a-input>
        </a-form-item>
        <a-form-item label="高度">
            <a-input v-model:value="formData.component.height" type="number" @change="changeNumberValue('height')"></a-input>
        </a-form-item>
        <a-form-item label="x位置">
            <a-input v-model:value="formData.component.left" type="number" @change="changeNumberValue('left')"></a-input>
        </a-form-item>
        <a-form-item label="y位置">
            <a-input v-model:value="formData.component.top" type="number" @change="changeNumberValue('top')"></a-input>
        </a-form-item>
        <a-form-item label="二维码图标">
            <a-switch v-model:checked="formData.component.icon" @change="changeSwitch(formData.component.icon)"/>
        </a-form-item>
        <a-form-item label="上传" v-if="formData.component.icon">
            <el-g-upload @onChangeFile="changeFile" :file="fileList" :sceneCode="GLOBAL_SCENE_CODE.qrCodeBackground"></el-g-upload>
        </a-form-item>
    </a-form>
</template>

<script>
import { defineComponent,ref,watch} from "vue";
import elGUpload from "./el-g-upload.vue"
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'

export default defineComponent({
    components:{elGUpload},
    props:{
        value:{
            type:Object,
            default:() =>{
                return {}
            }
        }
    },
    setup(props,{emit}){
        const formData = ref(props.value);
        const fileList = ref([]);
        watch(() =>props.value,(val) =>{
            formData.value = val
        })
        if(formData.value.component.url){
            fileList.value = [{name:"",url:formData.value.component.url}]
        }
        const changeNumberValue = (key) =>{
            formData.value.component[key] = Number(formData.value.component[key]);
        }
        const changeFile = (data) =>{
            if(data.length){
                formData.value.component.url = data[0].url;
            }else{
                formData.value.component.url = "";
            }
            emit("update:value",formData.value)
        }
        const changeSwitch = (val) =>{
            if(!val){
                formData.value.component.url = ""
                fileList.value = []
            }  
            emit("update:value",formData.value)
        }
        return {
            formData,
            fileList,
            changeNumberValue,
            changeFile,
            changeSwitch,
            GLOBAL_SCENE_CODE
        }
    }
})
</script>

<style>

</style>