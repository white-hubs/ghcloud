<template>
  <div class="group-content">
    <Avatar :group-img="true"></Avatar>
    <div class="info">
      <span class="title" style="cursor:pointer;" @click="toggle">多人审批
        <DownOutlined class="down-outline"
          :style="{ transform: activeKey.length ? 'scaleX(1.2) scaleY(0.8)' : 'rotate(-90deg)' }" />
      </span>
    </div>
    <a-collapse v-model:activeKey="activeKey" ghost>
      <a-collapse-panel key="1" :showArrow="false">
        <div class="group" style="widows: 100%">
          <div class="item">
            <Avatar>张三撒</Avatar>
            <div class="info">
              <span class="title">审批通过</span>
              <span class="desc">
                <span style="margin-right: 120px"> 张三撒(<span style="color: var(--ant-primary-color)">已同意</span>)</span>
                发起时间：2020-07-18 10:09:09
              </span>
            </div>
          </div>
          <div class="item">
            <Avatar>张三撒</Avatar>
            <div class="info">
              <span class="title">审批通过</span>
              <span class="desc">
                <span style="margin-right: 120px"> 张三撒(<span style="color: var(--ant-primary-color)">已同意</span>)</span>
                发起时间：2020-07-18 10:09:09
              </span>
            </div>
          </div>
          <div class="item">
            <Avatar>张三撒</Avatar>
            <div class="info">
              <span class="title">审批通过</span>
              <span class="desc">
                <span style="margin-right: 120px"> 张三撒(<span style="color: var(--ant-primary-color)">已同意</span>)</span>
                发起时间：2020-07-18 10:09:09
              </span>
            </div>
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>
<script setup lang="ts">
import Avatar from "./Avatar.vue";
import { DownOutlined } from "@ant-design/icons-vue";
import { ref } from "vue";
const activeKey = ref(['1']);
const toggle = () => {
  activeKey.value = activeKey.value.length > 0 ? [] : ['1']
}
</script>
<style scoped lang="less">
.group-content {
  display: block;
  width: 100%;

  .info {
    display: inline-block;
    width: unset;
    transform: translateY(-6px);

    .title {
      margin: 0 5px;
    }

    .down-outline {
      font-size: 12px;
      margin-left: 5px;
      transform: scaleX(1.2) scaleY(0.8);
      transition: all 0.3s;
    }
  }

  .group {
    .item {
      max-width: 860px;
      height: 78px;
      background: #f2f2f7;
      border-radius: 4px 4px 4px 4px;
      margin-top: 20px;
      display: flex;
      align-items: center;
      padding-left: 12px;

      .info {
        display: inline-flex;
        transform: unset;
      }
    }
  }

  .template-collapse {
    background-color: transparent;
    border: 0;

    :deep(.template-collapse-header) {
      display: none;
    }

    :deep(.template-collapse-content-box) {
      padding: 0;
    }

    :deep(.template-collapse-item) {
      border: 0;
    }
  }
}
</style>