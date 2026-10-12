<template>
  <div class="sub-panel flex-column bg-img">
    <div style="border-bottom: none" class="sub-panel-header flex-between">
      <div
        class="title flex-between"
        :class="{ 'zoomable-title': zoomable }"
        @click="handleTitleClick"
      >
        <span class="sub-title">{{ title }}</span>
      </div>
      <slot name="extra"></slot>
    </div>
    <div class="sub-panel-content">
      <slot />
    </div>
  </div>
  <div>
  </div>
</template>
<script lang="ts" setup>
interface Props {
  title?: string;
  zoomable?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  title: "标题",
  zoomable: false,
});

const emit = defineEmits<{
  'title-click': [];
}>();

const handleTitleClick = () => {
  if (props.zoomable) {
    emit('title-click');
  }
};
</script>
<style scoped lang="less">
.sub-panel {
  width: 100%;

  // height: 100%;
  &-header {
    width: 100%;
    height: 50px;
    border-bottom: rgba(255, 255, 255, 0.3) solid 1px;
    background-image: url("../../../../assets/images/overView117.png");
    background-size: 100%;
    background-repeat: no-repeat;
    .title {
      font-size: 18px;
      color: #ffffff;
      font-family: sourceMedium;
    }
  }
}

.mark {
  margin-right: 10px;
  padding: 5px;
  border: 1px solid #2989ff;

  .box {
    width: 8px;
    height: 8px;
    background: #ffffff;
  }
}

.sub-panel-content {
  margin-top: 4px;
  flex: 1;
  overflow: hidden;
  background: rgba(6,19,59,0.10);
  border: 1px solid rgba(34,174,230,0.30);
  border-radius: 4px;
}

.lineBox {
  display: flex;
  align-items: center;

  div {
    height: 0px;
    opacity: 1;
  }
}

.lineBox div:nth-child(1) {
  width: 24px;
  border-top: 1px solid #ffffff;
}

.lineBox div:nth-child(2) {
  width: 329px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.lineBox div:nth-child(3) {
  width: 12px;
  height: 2px;
  background: #2989ff;
  margin-left: 3px;
}

.sub-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 250px;
  font-size: 16px;
  text-indent: 18px;
}

.zoomable-title {
  cursor: pointer;
  user-select: none;

  &:hover {
    opacity: 0.85;
  }
}
</style>
