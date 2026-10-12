<template>
    <div class="wrapper">
        <div class="design-header">
            <h3>样式设置</h3>
        </div>
        <div class="design-form">
            <a-form :v-model="contain.configObj">
                <a-form-item label="名称" name="contain.configObj.name">
                    <a-input v-model:value="contain.configObj.name" type="text" placeholder="二维码样式名称"></a-input>
                </a-form-item>
                <a-form-item label="大小">
                    <a-input v-model:value="contain.configObj.width" type="number" style="width:100px"></a-input>
                    <span>*</span>
                    <a-input v-model:value="contain.configObj.height" type="number" style="width:100px"></a-input>
                </a-form-item>
                <a-form-item label="背景颜色">
                    <avue-input-color color-format="hex" :show-alpha="false" placeholder="请选择颜色" v-model="contain.configObj.backgroundColor" ></avue-input-color>
                </a-form-item>
                <a-form-item label="背景图片">
                    <el-g-upload :file="initFileList" @onChangeFile="changeFile"  :sceneCode="GLOBAL_SCENE_CODE.qrCodeBackground"></el-g-upload>
                </a-form-item>
            </a-form>
        </div>
    </div>
</template>

<script>
import { defineComponent, inject, reactive, toRefs, onMounted, computed, ref } from "vue";
import elGUpload from "./options/el-g-upload.vue"
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
export default defineComponent({
    components:{elGUpload},
    setup(){
        const contain = inject('contain');
        const upLoad = ref(null);
        const state = reactive({
            initFileList:[]
        })
        onMounted(() =>{
            if(contain.configObj.backgroundImage){
                state.initFileList = [{name:"",url:contain.configObj.backgroundImage}]
            }
        })
        const changeFile = (data) =>{
            if(data.length){
                contain.configObj.backgroundImage = data[0].url;
                contain.configObj.imgId = data[0].id;
            }else{
                contain.configObj.backgroundImage = "";
                contain.configObj.imgId = "";
            }
        }
        return {
            ...toRefs(state),
            contain,
            changeFile,
            upLoad,
            GLOBAL_SCENE_CODE
        }
    }
})
</script>

<style lang="less" scoped>
.design-form{
    padding: 8px;
    span{
        margin: 0 16px;
    }
}
</style>