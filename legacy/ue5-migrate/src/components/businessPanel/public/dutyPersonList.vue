<template>
  <div class="dutyPersonList">
    <!-- <div class="top">
      <div class="tit">今日在岗人数</div>
      <div class="statstics"><span>{{ arrive }}</span>/{{ total }}</div>
    </div> -->
    <div class="list">
      <vue3-seamless-scroll :list="list" :step="step" hover :singleHeight="74" :waitTime="waitTime">
        <div class="item" v-for="(item, index) in list" :key="index">
          <div class="content">
            <a-avatar :src="'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'" :size="46"> </a-avatar>
            <div class="info">
              <div class="user">
                <span class="name">{{ item.staffName }}</span>
                <span class="phone">{{ item.mobile }}</span>
              </div>
              <div class="duty">班次名称:{{ item.className || '' }} {{ (item.startWorkTime &&item.endWorkTime) ? `(${item.startWorkTime}-${item.endWorkTime})`:'无班次' }}</div>
            </div>
          </div>
          <div :class="['status']">
            在岗
          </div>
        </div>
      </vue3-seamless-scroll>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { withDefaults, reactive } from "vue";
import { Vue3SeamlessScroll } from 'vue3-seamless-scroll';
import { fakeUser } from "./fake-user";
import scrollParmas from "./rollTable/scrollParmas";
import { StaffResultList } from '@/api/models/attendance'
// 在岗人数组件
interface Props {
  title?: string;
  arrive: number,
  total: number,
  list: StaffResultList[]
}
const props = withDefaults(defineProps<Props>(), {
  title: "标题",
});
const { step, waitTime } = scrollParmas()
</script>
<style lang="less">
.dutyPersonList {
  .top {
    height: 50px;
    line-height: 50px;
    display: flex;
    justify-content: space-between;
    padding: 0 16px 0 12px;
    background-image: url("/resource/v1/ue5-migrate/assets/images/dutybg.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;

    .tit {
      color: #d0deee;
      font-size: 16px;
    }

    .statstics {
      color: #9aa8af;
      font-size: 22px;

      span {
        text-shadow: 0px 0px 8px rgba(42, 232, 189, 0.502);
        color: #58eac9;
      }
    }
  }

  .list {
    height: 100%;
    overflow: hidden;

    .item {
      padding: 14px 0 12px;
      border-bottom: 1px solid rgba(217, 231, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;

      .content {
        display: flex;
        align-items: center;
      }

      .status {
        width: 50px;
        height: 30px;
        background: rgba(42, 232, 189, 0.1);
        border-radius: 4px 4px 4px 4px;
        color: #2ae8bd;
        line-height: 30px;
        font-size: 14px;
        text-align: center;
      }

      .isnotduty {
        background: rgba(210, 216, 223, 0.5);
        color: #0e0e0f;
      }

      .info {
        margin-left: 12px;

        .user {
          line-height: 21px;

          .name {
            font-size: 16px;
            color: #fff;
          }

          .phone {
            color: #e6f7ff;
            font-size: 14px;
            margin-left: 20px;
          }
        }

        .duty {
          color: #e6f7ff;
          font-size: 14px;
          margin-top: 4px;
          line-height: 21px;
        }
      }
    }
  }
}
</style>
