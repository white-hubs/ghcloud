<template>
  <div class="avatar primary-color">
    <span class="text" v-if="!groupImg">
      <slot></slot>
    </span>
    <img :src="IconGroupUser" class="icon" v-else />
    <CloseCircleTwoTone v-if="props.showClose" class="close-icon" two-tone-color="#c3c3c3" @click="emits('close')" />
  </div>
</template>
<script setup lang="ts">
const IconGroupUser = '/resource/v1/streamengine-pc-migrate/icon-group-user.png'
import { CloseCircleTwoTone } from "@ant-design/icons-vue";
const props = withDefaults(
  defineProps<{
    groupImg?: boolean;
    showClose?: boolean;
  }>(),
  {
    groupImg: false,
    showClose: false,
  }
);
const emits = defineEmits(['close'])
</script>
<style scoped lang="less">
.avatar {
  width: 50px;
  height: 50px;
  border-radius: 4px 4px 4px 4px;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  position: relative;

  .text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .icon {
    width: 26px;
    height: 26px;
  }

  .close-icon {
    position: absolute;
    font-size: 18px;
    top: -9px;
    right: -9px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      color: var(--ant-error-color);
    }
  }
}
</style>
