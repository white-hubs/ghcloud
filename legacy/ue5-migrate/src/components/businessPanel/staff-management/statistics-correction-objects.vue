<template>
  <SubPanelTemplate title="学生点名记录">
    <a-space :size="24">
      <a-input style="width: 180px;" v-model:value="keyword" placeholder="请输入关键字搜索"></a-input>
      <a-button type="primary" @click="getPersonRollCallPage">搜索</a-button>
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
             <span>{{ item.personName }}</span> 
             <span v-show="item.importantSick == '1'" style="margin-left: 10px;">重点关注对象</span>
            </div>
            <div class="abnormal-statistics-item-right-middle">
              <div class="right-middle-title">所属宿舍:{{item.orgName}}</div>
            </div>
            <div class="abnormal-statistics-item-right-bottom">
              <div>点名时间:</div>
              <div>{{ dayjs(item.rollcallTime).format("YYYY-MM-DD HH:mm:ss") }}</div>
            </div>
          </div>
        </div>
      </vue3-seamless-scroll>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { getAssetsImage } from "@/utils/getImage";
import dayjs from "dayjs";
import { personRollCallPage } from "@/api/lingchuanhik";
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";
import { useStateStore } from '@/pages/state/use-state-store';

const keyword = ref('')
const { globalState } = useStateStore()

const lists = ref([])
const getPersonRollCallPage = async () => {
  const res = await personRollCallPage(
    {
      pageNumber:1,
      pageSize:10,
      keyword:keyword.value,
      areaId:globalState.business.currentAreaId,
    }
  )
  lists.value = res.records
}
onMounted(()=>{
  getPersonRollCallPage()
})
</script>
<style lang="less" scoped>
.abnormal-statistics {
  margin-bottom: 10px;
  overflow: hidden;
  height: 400px;
  .abnormal-statistics-item {
    padding: 8px;
    display: flex;
    align-items: center;
    margin-top: 10px;
    height: 110px;
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
</style>