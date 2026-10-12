<template>
    <div class="row flex-start">
        <span class="label">{{ attributeItem.attributeName }}：</span>
        <a-radio-group button-style="solid" v-model:value="value" size="small" @change="changeValue">
            <a-radio-button v-for="(item, index) in attributeItem.attributeKeyValueVos" :key="index"
                :value="String(item.value)">
                {{ item.label }}
            </a-radio-button>
        </a-radio-group>
    </div>
</template>

 
<script lang="ts">
import { defineComponent, getCurrentInstance, reactive, toRefs, watch } from "vue";
import {  controlWithPermission } from '@/api/device'
import { message } from "ant-design-vue";
import { cubeDeviceCenterService } from '@/api/service'
export default defineComponent({
    props: {
        curValue: {
            type: [Boolean, String, Number]
        },
        attributeItem: {
            type: Object,
            default: () => {
                return {}
            }
        },
        deviceId: {
            type:  String,
            default: null
        },
        code: {
            type: String,
            default: null
        },
    },

    setup(props,{emit}) {
        const state = reactive({
            value: String(props.curValue),
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
                }).catch(()=>{
                     state.value = String(props.curValue)
                }) .finally(()=>{
                    state.passwordVisible = false
                    state.password = ''
                    emit("toDeviceInfo");
                })
            }, 1000)
        }
        const cancel =async () => {
            state.value = String(props.curValue)
            state.password = ''
        }
        const changeValue = async(value) => {
            state.storageValue = value.target.value
                handleOk()
            emit("toDeviceInfo");
        }
        watch(() => props.curValue, () => {
            state.value =String(props.curValue)
        })
        return {
            ...toRefs(state),
            handleOk,
            cancel,
            changeValue
        }
    }
})
</script>

<style scoped>
.row{
    margin-bottom: 10px;
}
.flex-start {
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

:deep(.ant-radio-button-wrapper) {
    margin-right: 10px;
    margin-top: 5px;
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
</style>