<template>
    <div class="row flex-start">
        <span class="label">{{ attributeItem.attributeName }}：</span>
        <a-radio-group button-style="solid" v-model:value="value" @change="changeValue">
            <a-radio-button v-for="(item, index) in attributeItem.attributeKeyValueVos" :key="index"
                :value="String(item.value)">
                {{ item.label }}
            </a-radio-button>
        </a-radio-group>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, watch } from "vue";
import { commandMap } from '@/components/basic/header/chat-assistant/ai-command'
import { message } from "ant-design-vue";
import { cubeDeviceCenterService } from '@/api/service'
import {UeClient} from "@ghcloud/cube-visual-sdk";
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
    emits: ['update:curValue'],
    setup(props,{emit}) {
        const ueClient = UeClient.getInstance();
        const state = reactive({
            value:String(props.curValue),
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
                try {
                    //联动模型孪生体 开关
                    if (props.code) {
                        ueClient.send('getActorsByProps', { props: { "Element_标记": props.code, } }, function (res) {
                            if (res.actors.length) {
                                const actorId = res.actors[0].id
                                const data = {
                                    id: actorId,
                                    on:true,
                                    strength: 1,
                                    color:0
                                }
                                if (params.propWriteValues[0].expectedValue === '1') {
                                    data.on = true
                                }else{
                                    data.on = false
                                }
                                // 对模型下发开关指令
                                ueClient.send('switchLight', [data]);
                            }
                        });
                    }
                } catch (error) {

                }
                }).catch(()=>{
                     state.value = String(props.curValue)
                }) .finally(()=>{
                    state.passwordVisible = false
                    state.password = ''
                })
            }, 1000)
        }
        const cancel =async () => {
            state.value = String(props.curValue)
            state.password = ''
        }
        const changeValue = async(value) => {
            if (value?.target?.value) {
                state.storageValue = value.target.value
            }else{
                state.storageValue = props.attributeItem.attributeKeyValueVos.find(item=>item.value===value)?.value
                state.value = state.storageValue
            }
            handleOk()
        }
        watch(() => props.curValue, () => {            
            state.value =String(props.curValue) 
        })
        // commandMap.set('editDeviceStatus', (value)=>changeValue(value))// 修改设备物联状态
        return {
            ...toRefs(state),
            changeValue,
            handleOk,
            cancel
        }
    }
})
</script>

<style scoped>
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
:deep(.ant-radio-button-wrapper-checked){
    background-color: #40a9ff !important;
}
</style>