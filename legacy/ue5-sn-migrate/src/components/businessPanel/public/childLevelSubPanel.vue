<template>
  <div class="sub-panel">
    <div class="child-panel-box">
      <div class="sub-panel-front"></div>
      <div class="child-panel-header flex-between">
        <div class="title flex-between">
          <div class="mark">
            <div class="box"></div>
          </div>
          <span class="sub-title">{{ title }}</span>
          <slot name="titleIcon"></slot>
        </div>
        <div class="sub-panel-extra">
          <slot name="extra"></slot>
        </div>
      </div>
    </div>
    <div class="sub-panel-content">
      <slot />
    </div>
  </div>
</template>
<script lang="ts" setup>
interface Props {
  title?: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: "标题",
});
</script>
<style scoped lang="less">
.sub-panel {
  width: 100%;

}

.child-panel-box {
  display: flex;
  align-items: center;

  .sub-panel-front {
    width: 2px;
    height: 14px;
    background: #2989ff;
    margin-right: 4px;
  }

  .child-panel-header {
    display: flex;
    align-items: center;
    height: 36px;
    flex: 1;
    padding-left: 10px;
    background: linear-gradient(to right, rgba(41, 137, 255, 0.5), rgba(41, 137, 255, 0));
  }
}

.sub-title {
  font-size: 14px;
  text-align: left;
  font-weight: bold;
  color: #e6f2ff;
}

.sub-panel-content {
  padding: 10px 0 0 0;
  flex: 1;
  overflow: hidden;
}
.sub-panel-extra{
  height: 27px;
}
.lineBox {
  display: flex;
  align-items: center;

  div {
    height: 0px;
    opacity: 1;
  }
}
</style>
