<template>
  <SubPanelTemplate title="老师进出记录">
    <deviceModule :data-list="dataList"></deviceModule>
    <a-space :size="24">
      <a-input style="width: 180px;" v-model:value="keyword" placeholder="请输入关键字搜索"></a-input>
      <a-button type="primary" @click="getPoliceTodayLeavePage">搜索</a-button>
    </a-space>
    <div class="abnormal-statistics">
      <vue3-seamless-scroll :list="lists" :step="lists.length>4?0.5:0" hover :singleHeight="40" :waitTime="1000">
        <div class="abnormal-statistics-item" v-for="item in lists" :key="item.id">
          <div class="abnormal-statistics-item-left">
            <img v-if="item?.file?.path" :src="item?.file?.path" alt="" srcset="">
            <img v-else :src="getAssetsImage('alarm-default.png')" alt="" srcset="">
          </div>
          <div class="abnormal-statistics-item-right">
            <div class="abnormal-statistics-item-right-top">
              {{ item.name }}
            </div>
            <div class="abnormal-statistics-item-right-middle">
              <div class="right-middle-title">编号:{{item.number}}</div>
              <div class="right-middle-title">电话号码:{{item.phoneNo}}</div>
              <div class="right-middle-title">所属部门:{{item.orgName}}</div>
            </div>
            <div class="abnormal-statistics-item-right-bottom">
              <div>进入时间:</div>
              <div>{{ dayjs(item.inTime).format("YYYY-MM-DD HH:mm:ss") }}</div>
            </div>
          </div>
        </div>
      </vue3-seamless-scroll>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";
import { getAssetsImage } from "@/utils/getImage";
import deviceModule from "../public/deviceModule.vue";
import dayjs from "dayjs";
import { areaTodayUserStat, policeTodayLeavePage } from "@/api/lingchuanhik";
import { useStateStore } from '@/pages/state/use-state-store';

const { globalState } = useStateStore()
const dataList = ref([
  {
    title: "进入人数",
    value: '1',
    ringRatio: false,
  },
  {
    title: "离开人数",
    value: '17',
    ringRatio: false,
  },
   {
    title: "遗留人数",
    value: '17',
    ringRatio: false,
  },
]);
const keyword = ref('')
const lists = ref([])
const getPoliceTodayLeavePage = async () => {
  const res = await policeTodayLeavePage({
      pageNumber:1,
      pageSize:10,
      keyword:keyword.value,
      areaId:globalState.business.currentAreaId,
  })
  lists.value = res.records
}
const getAreaTodayUserStat = async () => {
  const res = await areaTodayUserStat({
    areaId:globalState.business.currentAreaId,
    type:2
  })
  dataList.value[0].value = res.enter
  dataList.value[1].value = res.exit
  dataList.value[2].value = res.leave
}
onMounted(()=>{
  getAreaTodayUserStat()
  getPoliceTodayLeavePage()
})
</script>
<style lang="less" scoped>
.abnormal-statistics {
  margin-top: 10px;
  overflow: hidden;

  .abnormal-statistics-item {
    padding: 8px;
    display: flex;
    align-items: center;
    margin-top: 10px;
    height: 130px;
    cursor: pointer;
    background: linear-gradient(90deg, rgba(0, 34, 61, 0.00), #002a56 50%, #002a56 51%, rgba(9, 49, 114, 0.00));

    .abnormal-statistics-item-left {
      img {
        width: 62px;
        height: 62px;
      }
    }

    .abnormal-statistics-item-right {
      margin-left: 20px;
      flex: 1;

      .abnormal-statistics-item-right-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 2px;
        font-size: 20px;
        color: #fff;
      }

      .abnormal-statistics-item-right-middle {
        margin-top: 2px;

        div {
          font-size: 20px;
          color: #d9e5ff;
        }

        .right-middle-title {
          color: #fff;
          font-size: 16px;
        }

      }

      .abnormal-statistics-item-right-bottom {
        display: flex;
        align-items: center;
        margin-top: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        div {
          font-size: 14px;
          color: #7A89A9;

        }
      }
    }
  }
}

:deep(.deviceBox) {
  width: 100px !important;
}
</style>