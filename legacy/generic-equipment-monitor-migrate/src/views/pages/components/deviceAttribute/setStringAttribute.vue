<template>
    <div class="row" style="width: 100%;">
        <span>{{attributeItem.attributeName}}：</span>
        <a-input
            v-model:value="value"
            style="margin-left: 16px; width: 160px"
            @change="changeValue"
        />
    </div>
   
</template>
<script>
import { defineComponent, getCurrentInstance, reactive, toRefs,watch } from "vue";
import { cubeDeviceCenterService } from '@/api/service'
export default defineComponent({
    props:{
        curValue:{
            type:[String,Number],
        },
        attributeItem:{
            type:Object,
            default:() =>{
                return {}
            }
        },
        deviceId:{
            type:[Number,String],
            default:null
        }
    },
   
    setup(props){
        const {proxy} = getCurrentInstance();
        const state = reactive({
            value:props.curValue??0,
            timer:null
        })
        const changeValue = (value) =>{
            clearTimeout(state.timer);
            state.timer = setTimeout(() =>{
                const params = {
                    deviceId:props.deviceId,
                    propWriteValues:[
                        {
                            code:props.attributeItem.attributeCode,
                            expectedValue:value
                        }
                    ]
                }
                cubeDeviceCenterService.controlWithPermission(params).then(res =>{
                    proxy.$message.success("下发指令成功")
                })
            },500)
        }
        watch(() =>props.curValue,() =>{
            state.value = props.curValue;
        })
        return {
            ...toRefs(state),
            changeValue
        }
    }
})
</script>

<style scoped lang="less">
.flex-start{
    display: flex;
    justify-content: flex-start;
    align-items: center;
}
.flex-between{
    display: flex;
    justify-content: space-between;
    align-items: center;
}
:deep(.ant-radio-button-wrapper) {
  margin-left: 10px;
}
</style>