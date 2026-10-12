<template>
  <div class="court-trial-list">
    <Vue3SeamlessScroll :list="dataSource" :step="0.5" hover :singleHeight="40" :waitTime="1000">
      <div class="item" v-for="item in dataSource" :key="item.id">
        <div class="title">
          <img src="/resource/v1/ue5-migrate/assets/images/notice-icon.png" alt="">
          <div>{{ item.title }}</div>
        </div>
        <div class="content">
          <div class="row-item">
            <div class="label">案号</div>
            <span>：</span>
            <div class="value">{{ item.case }}</div>
          </div>
          <div class="row-item">
            <div class="label">案由</div>
            <span>：</span>
            <div class="value">{{ item.reason }}</div>
          </div>
          <div class="row-item">
            <div class="label">主审法官</div>
            <span>：</span>
            <div class="value">{{item.name}}</div>
          </div>
          <div class="row-item">
            <div class="label">开庭时间</div>
            <span>：</span>
            <div class="value">{{ item.time }}</div>
          </div>
        </div>
      </div>
    </Vue3SeamlessScroll>
  </div>
</template>

<script setup lang='ts'>
import { reactive, toRefs, onMounted } from 'vue';
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";

interface dataSource {
    id: string,
    title: string,
    case: string,
    reason: string,
    name: string,
    time: string
}
interface Props {
	dataSource: dataSource[];
}
const props = withDefaults(defineProps<Props>(), {
  dataSource:()=> [
    {
      id: '1',
      title: '',
      case: '',
      reason: '',
      name: '',
      time: ''
    }
  ]
})
onMounted(() => {
})

</script>
<style scoped lang='less'>
.court-trial-list {
  .item {
    background: linear-gradient(to right, rgba(21, 108, 220, 0.30), rgba(21, 108, 220, 0.30));
    border-radius: 4px;
    margin-bottom: 8px;
    padding: 12px;

    .title {
      padding: 0 20px 0 0;
      display: flex;
      background: linear-gradient(to right, rgba(41, 135, 255, 0), rgba(41, 135, 255, 0.98), rgba(41, 135, 255, 0.90), rgba(28, 118, 233, 0.58), rgba(21, 108, 220, 0));
      font-size: 14px;
      font-family: Source Han Sans CN, Source Han Sans CN-Regular;
      font-weight: Regular;
      text-align: left;
      color: #f4f9ff;

      img {
        width: 16px;
        height: 16px;
        margin-right: 4px;
      }
    }

    .content {
      .row-item {
        margin-top: 4px;
        display: flex;
        align-items: center;
        font-size: 12px;
        font-family: Source Han Sans CN, Source Han Sans CN-Regular;
        font-weight: Regular;
        text-align: justify;
        color: #d9e7ff;

        .label {
          text-align: justify;
          text-align-last: justify;
          width: 60px;

          &::after {
            content: '';
            display: inline-block;
            width: 100%;
            display: none;
          }
        }
      }
    }
  }
}
</style>