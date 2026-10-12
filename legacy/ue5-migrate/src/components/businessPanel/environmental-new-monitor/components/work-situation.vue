<template>
  <div class="situation_list">
    <div class="situation_item" v-for="item in contentList" @click="handleCurrent(item)">
      <img :src="getAssetsImage('overView75.png')" alt="">
      <div class="situation_title">{{ item.name }}</div>
      <div class="situation_value">{{ item.value }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getAssetsImage } from '@/utils/getImage'

interface Props {
    contentList: {
        name: string,
        value: string,
    }[];
}
const emit = defineEmits(["handlecurrent"]);

const handleCurrent = (item) => {
  emit("handlecurrent", item);
};
const props = withDefaults(defineProps<Props>(), {
});
</script>
<style lang="less" scoped>
.situation_list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;

  .situation_item {
    cursor: pointer;
    width: 48%;
    height: 80px;
    margin-top: 30px;
    background: rgba(0, 0, 0, 0.03) linear-gradient(180deg, rgba(41, 137, 255, 0) 0%, rgba(41, 137, 255, 0.35) 100%);
    border-radius: 4px 4px 4px 4px;
    border: 1px solid rgba(231, 242, 255, 0.2);
    color: #fff;
    position: relative;

    img {
      position: absolute;
      top: -20px;
      left: 5px;
      width: 30px;
      height: 48px;
    }

    .situation_title {
      font-size: 16px;
      color: #E6F7FF;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap
    }

    .situation_value {
      margin-top: 10px;
      font-size: 14px;
      color: #FFFFFF;
      text-indent: 0;
      box-sizing: border-box;
      text-align: center;
    }

    div {
      text-indent: 40px;
    }
  }
}</style>