<template>
  <a-spin :tip="'Loading...'" size="large" class="login-spin" :spinning="progressNum < 100">
    <div class="globe">
      <canvas id="canvas"></canvas>
    </div>
  </a-spin>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from "vue"
import { World } from "./index"
let app = null
let returnBtnShow = ref(false)

const emit=defineEmits(['renderCompleted'])
const progressText=ref('0.00%')
const progressNum=ref(0)
onMounted(() => {
  app = new World(document.getElementById("canvas"))
  // 资源加载进度
  app.assets.on("onProgress", (path, itemsLoaded, itemsTotal) => {
    let progress = (itemsLoaded / itemsTotal) * 100
    progressNum.value=progress
    let bfb = progress.toFixed(2) + "%"
    progressText.value=bfb
  })
  app.on("renderCompleted", () => {
    emit('renderCompleted')
  })

})
onBeforeUnmount(() => {
  app && app.destroy()
})
// 返回上一级
const goBack = () => {
  returnBtnShow.value = false
  app && app.goBack()
}
</script>

<style lang="scss">
.login-spin{
  top: 50% !important;
  transform: translateY(-50%) scale(1.5);
}
#canvas,
.globe {
  width: 100vw;
  height: 100vh;
  /* background-color: #000; */
}

.globe {
  background: url("/resource/v1/ue5-sn-migrate/globe-map/assets/earth/sky-texture2.jpg");
  background-size: cover;
}

// 返回按钮
.return-btn {
  position: absolute;
  left: 50%;
  bottom: 10px;
  z-index: 9991;
  transform: translateX(-50%);
  padding: 5px 24px;
  color: #fff;
  border: 1px solid #2bc4dc;
  margin-bottom: 10px;
  font-size: 12px;
  text-align: center;
  opacity: 0.5;
  display: block;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    opacity: 1;
  }
}

.clouds-wrap {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 99999;
  pointer-events: none;

  .cloud {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: url("/resource/v1/ue5-sn-migrate/globe-map/assets/earth/cloud.png") no-repeat;
    background-size: contain;
    transform: translate(110%, 0px);

    &:nth-child(1) {
      margin-left: -400px;
      margin-top: -300px;
      width: 150%;
      height: 150%;
    }

    &:nth-child(2) {
      width: 200%;
      height: 200%;
    }

    &:nth-child(3) {
      width: 300%;
      height: 300%;
      margin-left: -900px;
      margin-top: -900px;
    }
  }
}

.info-point {
  /* position: absolute;
  left: 200px;
  top: 200px; */
  background: rgba(0, 0, 0, 0.5);
  color: #4469b3;
  font-size: 14px;
  width: 170px;
  height: 106px;
  padding: 16px 12px 0;

  &-wrap {

    &:after,
    &:before {
      display: block;
      content: "";
      position: absolute;
      top: 0;
      width: 15px;
      height: 15px;
      border-top: 1px solid #4469b3;
    }

    &:before {
      left: 0;
      border-left: 1px solid #4469b3;
    }

    &:after {
      right: 0;
      border-right: 1px solid #4469b3;
    }

    &-inner {

      &:after,
      &:before {
        display: block;
        content: "";
        position: absolute;
        bottom: 0;
        width: 15px;
        height: 15px;
        border-bottom: 1px solid #4469b3;
      }

      &:before {
        left: 0;
        border-left: 1px solid #4469b3;
      }

      &:after {
        right: 0;
        border-right: 1px solid #4469b3;
      }
    }
  }

  &-line {
    position: absolute;
    top: 7px;
    right: 12px;
    display: flex;

    .line {
      width: 5px;
      height: 2px;
      margin-right: 5px;
      background: #4469b3;
    }
  }

  &-content {
    .content-item {
      display: flex;
      height: 28px;
      line-height: 28px;
      background: rgba(35, 47, 58, 0.6);
      margin-bottom: 5px;

      .label {
        width: 60px;
        padding-left: 10px;
      }

      .value {
        color: #ffffff;
      }
    }
  }
}

.sz-label {
  &-wrap {
    transform: translate(50%, 200%);
    opacity: 0;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0 18px 0 0;
    /* margin-left: 50px; */
    height: 53px;
    border-radius: 30px 30px 30px 0px;
    background: linear-gradient(90deg, #2d3d63 0%, rgba(34, 45, 72, 0.63) 116.13%);
  }

  .number {
    color: #748bb9;
    font-size: 24px;
  }

  .name {
    color: #fff;
    font-size: 24px;
    padding: 0 15px 0 10px;

    span {
      display: block;
    }
  }

  .no {
    color: #ffffff;
    /* text-shadow: 0px 0px 4px 0px #7efbf6; */
    /* text-shadow: 0 0 5px #7efbf6, 0 0 10px #7efbf6; */
    font-size: 30px;
    font-weight: 700;
    padding: 0 15px;
    border-radius: 24px 0px;
    border: 3px solid #bdd3fa;
    background: linear-gradient(222deg, #4469b3 0%, #6f8ece 96.2%);
  }

  .yellow {
    .no {
      color: #fef99e !important;
      background: linear-gradient(222deg, #8a7344 0%, #b6a684 96.2%);
    }

    .sz-label-wrap {
      background: linear-gradient(90deg, #8a7344 0%, #39341f 116.13%);
    }

    .number {
      color: #fff;
    }
  }
}

.city-label {
  color: #fff;

  font-size: 12px;

  .other-label {
    display: flex;
    align-items: center;
    padding: 5px;
    border-radius: 4px;
  }

  &.blur {
    filter: blur(2px);
    opacity: 0.5;
  }
}

.other-label {
  transform: translateY(200%);
  opacity: 0;
  background: none;
}</style>
