<template>
    <div class="row flex-start">
        <span class="label">{{ attributeItem.attributeName }}</span>
        <div class="flex-start">
            <div class="sliderBox flex-start" v-if="attributeItem.valueMin||attributeItem.valueMax">
                <div>
                    <span style="color:#B7C5D3">{{ Number(attributeItem.valueMin) }}&nbsp;</span>
                </div>
                <div style="width: 100px">
                    <a-slider v-model:value="value" :min="Number(attributeItem.valueMin)"
                        :max="Number(attributeItem.valueMax)" @change="changeValue" />
                </div>
                <div>
                    <span style="color:#B7C5D3">&nbsp;{{ Number(attributeItem.valueMax) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance, reactive, toRefs, watch } from "vue";
import { message } from "ant-design-vue";
import { cubeDeviceCenterService } from '@/api/service'
export default defineComponent({
    props: {
        curValue: {
            type: [Boolean, String, Number],
        },
        attributeItem: {
            type: Object,
            default: () => {
                return {}
            }
        },
        deviceId: {
            type: String,
            default: null
        }
    },
    emits: ['update:curValue'],
    setup(props,{emit}) {
        const state:{
            value:string|number,
            passwordVisible:boolean,
            storageValue:string,
            password:string,
            timer?:any
        } = reactive({
            value:Number(props.curValue),
            timer: null,
            passwordVisible:false,
            storageValue:'',
            password:'',
        })
        const handleOk = async () => {
            clearTimeout(state.timer);
            state.timer = setTimeout(() => {
                let params = {
                    deviceId: props.deviceId,
                    propWriteValues: [
                        {
                            code: props.attributeItem.attributeCode,
                            expectedValue: state.storageValue
                        }
                    ]
                }
                cubeDeviceCenterService.controlWithPermission(params).then(res => {
                    message.success("下发指令成功")
                    emit('update:curValue',state.value)
                }).catch(()=>{
                     state.value = Number(props.curValue)
                    message.error("下发指令失败")
                }) .finally(()=>{
                    state.passwordVisible = false
                    state.password = ''
                })
            }, 1000)
        }
        const cancel =async () => {
            state.value = Number(props.curValue)
            state.password = ''
        }
        const changeValue = async (value) => {
            state.storageValue = value
            handleOk()
        }
        watch(() => props.curValue, () => {
            state.value =Number(props.curValue)
        })
        return {
            ...toRefs(state),
            changeValue,
            cancel,
            handleOk
        }
    }
})
</script>

<style scoped lang="less">
.row {
    margin-bottom: 10px;
}

.flex-start {
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

:deep(.ant-radio-button-wrapper) {
    margin-right: 10px;
    height: 24px;
    line-height: 24px;
}

.label {
    height: 24px;
    background: linear-gradient(90deg, rgba(41, 137, 255, 0.35) 0%, rgba(41, 137, 255, 0.1) 100%), rgba(1, 11, 23, 0.2);
    color: #C5D6EE;
    white-space: nowrap;
    padding: 0 10px;
}

.sliderBox {
    height: 26px;
    background: rgba(8, 20, 35, 0.6);
    padding: 4%;
}
</style>