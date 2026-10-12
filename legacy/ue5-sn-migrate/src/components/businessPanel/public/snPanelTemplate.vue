<template>
  <div class="sub-panel flex-column">
    <div style="border-bottom: none" class="sub-panel-header flex-between">
      <div class="title flex-between">
        <div class="mark">
          <img :src="getSnImage(images)" alt="" style="margin-left:10px">
          <div class="box"></div>
        </div>
        <span>{{ title }}</span>
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

  // height: 100%;
  .sub-panel-header {
    background-image: url('/resource/v1/ue5-sn-migrate/assets/images/sn/bg.png');
    background-repeat: no-repeat;
    background-size: auto;
    display: flex;
    align-items: center;
    width: 100%;
    height: 35px;
    opacity: 1;
    // border: 1px solid;
    // border-image: linear-gradient(307deg,
    //     rgba(23.24876368045807,
    //       31.309058368206024,
    //       41.04860454797745,
    //       0.14519304037094116),
    //     rgba(144.42477822303772, 194.49645459651947, 255, 0.9019607901573181),
    //     rgba(131.41564428806305,
    //       176.97708427906036,
    //       232.03073412179947,
    //       0.820716142654419),
    //     rgba(0, 0, 0, 0)) 1 1;

    .extra {
      margin-top: 5px;
    }
  }

  &-header {
    width: 100%;
    height: 50px;

    // border-bottom: rgba(255, 255, 255, 0.3) solid 1px;
    .title {
      font-size: 18px;
      color: #ffffff;
      font-family: sourceMedium;

      img {
        width: 40px;
        height: 40px;
      }
    }
  }
}

.mark {
  // margin-right: 10px;
  // padding: 5px;
  // border: 1px solid #2989ff;
  // .box {
  //   width: 8px;
  //   height: 8px;
  //   background: #ffffff;
  // }
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
