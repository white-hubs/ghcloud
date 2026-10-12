<template>
  <div class="sub-panel flex-column">
    <div style="border-bottom: none" class="sub-panel-header flex-between">
      <div class="title flex-between">
        <div class="mark">
          <img :src="getSnImage(images)" alt="" style="margin-left:10px">
          <div class="box"></div>
        </div>
        <span>{{ title }}</span>
        <slot name="title"></slot>
      </div>
      <div class="extra">
        <slot name="extra"></slot>
      </div>

    </div>
    <div class="sub-panel-content">
      <slot />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { getSnImage } from '@/utils/getImage'
import { ref } from 'vue'

interface Props {
  title?: string;
  image?:string
}

const props = withDefaults(defineProps<Props>(), {
  title: "标题",
  image:'',
});
const images=ref(props.image)
</script>
<style scoped lang="less">
.sub-panel {
  width: 100%;
  .sub-panel-header {
    background-image: url('/resource/v1/ue5-sn-migrate/assets/images/sn/bg-1.png');
    background-repeat: no-repeat;
    background-size: 100% 50%;
    background-position: left bottom;
    display: flex;
    align-items: center;
    width: 100%;
    height: 50px;
    opacity: 1;
    .extra {
      margin-top: 5px;
      flex: 1;
    }
  }

  &-header {
    width: 100%;
    height: 50px;
    .title {
      font-size: 20px;
      color: #ffffff;
      font-family: Source Han Sans CN, Source Han Sans CN-Bold;
      font-weight: Bold;
      span{
        white-space: nowrap;
      }
      img {
        width: 40px;
        height: 40px;
      }
    }
  }
}



.sub-panel-content {
  padding: 10px 0 0 0;
  flex: 1;
  overflow: hidden;
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
:deep(.ant-select-selection-item){
color:rgba(97, 148, 247, 1) !important;
margin-top: 0px!important;

}
:deep(.ant-select-arrow){
color:rgba(97, 148, 247, 1) !important;
// margin-top: 0px!important;

}
</style>
