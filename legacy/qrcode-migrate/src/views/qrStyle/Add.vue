<template>
    <div class="content">
        <g-layout title="二维码样式设计">
            <template #content-table>
                <div class="designer">
                    <div class="left">
                        <canvas-design></canvas-design>
                    </div>
                    <div class="center">
                        <container></container>
                    </div>
                    <div class="right">
                        <control-design></control-design>
                    </div>
                </div>
            </template>
            <template #footer-btn>
                <div class="footer-button">
                    <a-button @click="back">返回</a-button>
                    <a-button type="primary" @click="save">保存</a-button>
                </div>
            </template>
        </g-layout>
    </div>
</template>

<script>
import { defineComponent,provide,reactive,toRefs, ref, getCurrentInstance, onMounted } from "vue"
import qrcodeConfig from "./components/QR";
import canvasDesign from "./components/canvasDesign.vue"
import controlDesign from "./components/controlDesign.vue"
import container from "./components/container.vue"
import { useRoute, useRouter } from "vue-router";
import { cloneDeep } from 'lodash-es';
export default defineComponent({
    components:{
        canvasDesign,
        controlDesign,
        container
    },
    setup(props) {
        const router = useRouter();
        const route = useRoute();
        const {proxy} = getCurrentInstance();
        const { id,type } = route.query;
        let activeFlag = ref([]);
        const contain = reactive({
            configObj:cloneDeep(qrcodeConfig),   //整个文本对象
        })
        provide("contain",contain);
        provide("activeFlag",activeFlag);
        provide("changeActive",(data) =>{
            activeFlag.value = data
        })
        onMounted(async() =>{
            if(id){
                const data = await proxy.$api.getQrcodeStyleDetailById({id:id});
                if(data){
                    contain.configObj = JSON.parse(data.configJson);
                }
            }
        })
        const save = async() =>{
            if(type==='edit'){
                editQrcodeStyle()
            }else{
                addQrcodeStyle()
            }
        }
        const addQrcodeStyle = async () =>{
            const data = await proxy.$api.addQrcodeStyle({configJson:JSON.stringify(contain.configObj)});
            if(data){
                proxy.$message.success("保存成功")
            }
        }
        const editQrcodeStyle = async () =>{
            const data = await proxy.$api.editQrcodeStyle({configJson:JSON.stringify(contain.configObj),id:id});
            if(data){
                proxy.$message.success("修改成功")
            }
        }
        const back = () =>{
            router.back()
        }
        return{
            ...toRefs(contain),
            activeFlag,
            save,
            back
        }
    }
    
})
</script>

<style lang="less" scoped>
:deep(.content-search){
    padding-top:0 !important;
}
:deep(.footer-btn){
    width: 100%;
    text-align: right;
}
.designer{
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    .left{
        width: 300px;
        border-right: 1px solid #F3F3F3;
    }
    .center{
        flex: 2;
        overflow: hidden;
    }
    .right{
        width: 300px;
        border-left: 1px solid #F3F3F3;
    }
}
</style>