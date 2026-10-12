<template>
    <div class="row flex-start">
        <span class="label">{{attributeItem.attributeName}}：</span>
        <div class="flex-start">
            <div class="flex-start">
                <div>
                    <span>{{ Number(attributeItem.valueMin) }}&nbsp;</span>
                </div>
                <div style="width:120px">
                    <a-slider v-model:value="value" :min="Number(attributeItem.valueMin)"
                        :max="Number(attributeItem.valueMax)" @change="changeValue" />
                </div>
                <div>
                    <span>&nbsp;{{ Number(attributeItem.valueMax) }}</span>
                </div>
            </div>
            <div>
                <a-input-number v-model:value="value" :min="Number(attributeItem.valueMin)"
                    :max="Number(attributeItem.valueMax)" style="margin-left: 12px;" @change="changeValue" />
            </div>
        </div>
    </div>

</template>

<script>
import { defineComponent, getCurrentInstance, reactive, toRefs, watch } from "vue";
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
            type: [Number, String],
            default: null
        }
    },

    setup(props) {
        const { proxy } = getCurrentInstance();
        const state = reactive({
            value: 0,
            timer: null
        })
        const changeValue = (value) => {
            clearTimeout(state.timer);
            state.timer = setTimeout(() => {
                let params = {
                    deviceId: props.deviceId,
                    propWriteValues: [{
                        originalValue: props.curValue,
                        expectedValue: value,
                        code: props.attributeItem.key
                    }]
                }
                proxy.$api.setDevcieCenterDeviceValue(params).then(res => {
                    proxy.$message.success("下发指令成功")
                })
            }, 500)
        }
        watch(() => props.curValue, () => {
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
.flex-start {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .label {
        flex-shrink: 0;
    }
}

:deep(.ant-radio-button-wrapper) {
    margin-left: 10px;
}
</style>
