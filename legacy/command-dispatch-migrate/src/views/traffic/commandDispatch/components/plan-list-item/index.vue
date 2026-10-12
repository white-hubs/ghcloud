<template>
  <div class="plan-list-item">
    <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/plan-file-icon.png" alt="" />
    <div class="info">
      <div class="title">{{ planInfo.name }}</div>
      <div class="event">{{ planInfo.emergencyEventTypeName }}</div>
      <div class="desc">{{ planInfo.remark }}</div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    planInfo: {
      type: Object,
      default: ""
    }
  },
  name: 'planListItem',
  setup(props, { emit }) {

  }
})
</script>

<style lang="less" scoped>
.plan-list-item {
  background: rgba(4, 20, 39, 0.8);
  border-radius: 4px 4px 4px 4px;
  border: 1px solid rgba(41, 137, 255, 0.3);
  padding: 14px 28px 14px 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #0C2D57;
  }

  img {
    width: 54px;
    height: 54px;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .title {
      font-size: 16px;
      font-family: Source Han Sans CN-Medium, Source Han Sans CN;
      font-weight: 500;
      color: #FFFFFF;
    }

    .event {
      font-size: 12px;
      font-family: Source Han Sans CN-Medium, Source Han Sans CN;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.8);
    }

    .desc {
      font-size: 12px;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.5);
    }
  }
}
</style>