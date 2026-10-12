<template>
    <div class="row flex-between" style="width: 100%;">
        <span>{{attributeItem.attributeName}}：</span>
        <div class="flex-start">
            <div class="flex-start" v-if="Number(attributeItem.valueMin)!==Number(attributeItem.valueMax)">
                <div>
                    <span>{{ attributeItem.valueMin ? Number(attributeItem.valueMin) : '--' }}&nbsp;</span>
                </div>
                <div style="width: 200px">
                    <Slider
                    v-model:value="value"
                    :min="Number(attributeItem.valueMin)"
                    :max="Number(attributeItem.valueMax)"
                    @change="changeValue"
                    />
                </div>
                <div>
                    <span>&nbsp;{{ attributeItem.valueMax ? Number(attributeItem.valueMax) : '--'}}</span>
                </div>
            </div>
            <div>
                <InputNumber
                    v-model:value="value"
                    :min="Number(attributeItem.valueMin)"
                    :max="Number(attributeItem.valueMax)"
                    style="margin-left: 16px; width: 80px"
                    @change="changeValue"
                    :precision="attributeItem.precision"
                />
            </div>
        </div>
    </div>
   
</template>
<script>
import {message} from 'ant-design-vue'
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
                    message.success("下发指令成功")
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