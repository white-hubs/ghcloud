<template>
    <div class="radioBar">
        <a-radio-group @change="changeEvent" v-model:value="value1">
            <a-radio-button :value="item.value" v-for="item in dateList">{{ item.label }}</a-radio-button>
        </a-radio-group>
    </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import moment from "moment";

interface data {
    label: string,
    value: string
}
interface Props {
    dateList: data[],
    flag: boolean
}
const dateFormat = "YYYY-MM-DD HH:mm:ss";
const dateList = [
    {
        label: '今日',
        value: 'TODAY'
    },
    {
        label: '本周',
        value: 'THIS_WEEK'
    },
    {
        label: '本月',
        value: 'THIS_MONTH'
    },
    {
        label: '今年',
        value: 'THIS_YEAR'
    },
]

const emit = defineEmits(['changeDate'])
const value1 = ref("today")
const changeEvent = (params: any) => {
    let model_value = {
        timeType: 'TODAY',
        dateRange: []
    }
    model_value.timeType = params.target.value;
    if (params.target.value === 'TODAY') {
        model_value.dateRange = [moment().format('YYYY-MM-DD 00:00:00'), moment().format(dateFormat)];
    } else if (params.target.value === 'THIS_WEEK') {
        model_value.dateRange = [moment().startOf("week").format('YYYY-MM-DD 00:00:00'), moment().endOf("week").format(dateFormat)];
    } else if (params.target.value === 'THIS_MONTH') {
        model_value.dateRange = [moment().startOf("month").format('YYYY-MM-DD 00:00:00'), moment().endOf("months").format(dateFormat)];
    } else if (params.target.value === 'THIS_YEAR') {
        model_value.dateRange = [moment().startOf("year").format('YYYY-MM-DD 00:00:00'), moment().endOf("year").format(dateFormat)];
    }
    emit('changeDate', model_value)
}
onMounted(() => {
    value1.value = dateList[0].value
    let obj = {
        target: {
            value: 'TODAY'
        }
    }
    changeEvent(obj)
})
</script>
<style lang="less" scoped>
.radioBar {
    text-align: right;
    margin: 6px 0;

    :deep(.ant-radio-button-wrapper) {
        height: 28px;
        line-height: 28px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px 2px 2px 2px;
        font-size: 12px;
        color: #ABB8CB;
        margin-left: 6px;
    }

    :deep(.ant-radio-button-wrapper-checked) {
        color: #fff;
        background: rgba(41, 137, 255, 0.302);
    }
}
</style>