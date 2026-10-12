<template>
<div>
    <a-space>
        <a-button v-for="(val,key,i) in btns" :key="i" :type="checkedBtn == key?'primary':'default'" size="middle" @click="getDateSubsce(key)">{{val}}</a-button>
        <a-range-picker v-model:value="dates" :disabled-date="disabledPriceRangeDate" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" :allowClear="false" @change="changePicker"/>
    </a-space>
</div>
</template>
<script lang="jsx">
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import Moment from "moment";
export default defineComponent({
    setup(props,{emit}){
        const state = reactive({
            btns:{
                "TODAY":"今日",
                // "NEARLY_7_DAYS":"近7天",
                // "NEARLY_30_DAYS":"近30天",
                "THIS_WEEK":"本周",
                "THIS_MONTH":"本月",
                // "RECENT_THREE_MONTH":"近三月",
                // "RECENT_HALF_YEAR":"近半年",
                "THIS_YEAR":"全年"
            },
            dates:[],
            checkedBtn:"TODAY",
            period:"",
        })
        onMounted(() =>{
            state.period = Moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')+ ',' + Moment().format('YYYY-MM-DD HH:mm:ss');
            state.dates = [Moment().startOf('days').format('YYYY-MM-DD HH:mm:ss'), Moment().format('YYYY-MM-DD HH:mm:ss')]
            emit("update:value",state.period);
            emit("change",state.checkedBtn)
        })
        const getDateSubsce = (key) =>{
            state.checkedBtn = key;
            const nowTime = Moment().format('YYYY-MM-DD HH:mm:ss');
            let startTime;
            if(key == 'TODAY'){
                startTime = Moment().startOf('days').format('YYYY-MM-DD HH:mm:ss');
            }else if(key == 'THIS_WEEK'){
                startTime = Moment() .startOf('weeks').format('YYYY-MM-DD HH:mm:ss');
            }else if(key == 'THIS_MONTH'){
                startTime = Moment().startOf('months').format('YYYY-MM-DD HH:mm:ss');
            }else if(key == 'RECENT_THREE_MONTH'){
                startTime = Moment().subtract(3,'month').format('YYYY-MM-DD HH:mm:ss');
            }else if(key == 'RECENT_HALF_YEAR'){
                startTime = Moment().subtract(6,'month').format('YYYY-MM-DD HH:mm:ss');
            }else if(key == 'THIS_YEAR'){
                startTime = Moment().startOf('years').format('YYYY-MM-DD HH:mm:ss');
            }else if(key == 'NEARLY_7_DAYS'){
                startTime = Moment().startOf('days').add('-6','days').format('YYYY-MM-DD HH:mm:ss');
            }else if(key == 'NEARLY_30_DAYS'){
                startTime = Moment().startOf('days').add('-29','days').format('YYYY-MM-DD HH:mm:ss');
            }
            state.dates = [startTime,nowTime];
            state.period = startTime + ',' + nowTime;
            emit("update:value",state.period);
            emit("change",state.checkedBtn)
        }
        const changePicker = () =>{
            state.checkedBtn = "";
            if(state.dates[0] == state.dates[1]){
                state.dates[0] = Moment(state.dates[0]).format('YYYY-MM-DD 00:00:00');
                state.dates[1] = Moment(state.dates[1]).format('YYYY-MM-DD 23:59:59');
            }
            state.period = state.dates[0] + ',' + state.dates[1];
            emit("update:value",state.period);
            emit("change",state.checkedBtn);
        }
        const disabledPriceRangeDate = (current) =>{
            return current > Moment().endOf('day')//禁用今天之后的日期
        }
        return{
            ...toRefs(state),
            getDateSubsce,
            changePicker,
            disabledPriceRangeDate
        }
    }
})
</script>

<style lang="less" scoped>
:deep(.ant-btn){
    margin-left: 0 !important;
}
</style>