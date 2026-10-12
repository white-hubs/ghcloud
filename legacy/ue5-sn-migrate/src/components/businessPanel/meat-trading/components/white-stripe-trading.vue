<template>
  <SubPanelTemplate :title="props.title">
    <template #extra>
      <div>
        <DateInlineForm :timeList="timeList" v-model:modelValue="topTimeFrame" @search="changeTopTimeFrame"></DateInlineForm>
      </div>
    </template>
    <div class="body" v-show="props.areaAlarmRank.length > 0" style="min-height: 250px">
      <div class="table-head">
        <span v-for="item in props.tableHead">{{ item }}</span>
      </div>
      <EventAlarmItem v-for="(item, index) in props.areaAlarmRank" :sort="index + 1" :name="item.name"
        :linkRatio="item.chainRatio" :count="item.alarmNum" :ratio="item.ratio + '%'" :code="item.code" />
    </div>
    <div class="body" style="min-height: 150px" v-show="props.areaAlarmRank.length <= 0">
      <noData></noData>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted} from 'vue'
import noData from "../../public/noData.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DateInlineForm from "../../public/dateInlineForm.vue";
import { ModelValueItf } from "../../public/types";
import EventAlarmItem from "../../public/eventAlarmItem.vue";
import { setTimeType } from "@/utils/common";
type propsData = {
  title: string;
  tableHead: string[];
  areaAlarmRank: any[];
};
const timeList = [
			{ label: "今日", value: "TODAY" },
			{ label: "近7天", value: "THIS_WEEK" },
			{ label: "近30天", value: "THIS_MONTH" },
			{ label: "近1年", value: "THIS_YEAR" }
		]
const emit = defineEmits(["getTime"]);
const props = withDefaults(defineProps<propsData>(), {});
let topTimeFrame = ref<ModelValueItf>();

const changeTopTimeFrame = ()=> {
  emit('getTime',setTimeType(topTimeFrame.value.timeType))
}

</script>
<style scoped lang="less">
.table-head {
  width: 340px;
  height: 32px;
  background: rgba(145, 194, 242, 0.1955);
  border-radius: 0px 0px 0px 0px;
  line-height: 32px;
  display: flex;
  justify-content: space-between;
  padding: 0 5px;
  margin-bottom: 20px;

  span {
    font-size: 14px;
    color: #FFFFFF;

  }
}

.more {
  color: #91C2F2;
  font-size: 14px;
  cursor: pointer;
}
</style>