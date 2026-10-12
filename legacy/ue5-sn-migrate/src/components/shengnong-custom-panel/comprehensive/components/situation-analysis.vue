<template>
    <div class="showPanel">
      <div v-if="statisticsData.length > 0">
        <div
          class="blister"
          :class="classList[index % classList.length]"
          v-for="(item, index) in statisticsData"
          @click="() => {
            $emit('click', item)
          }"
        >
          <div class="ball">
            <img style="width: 100%" :src="getAssetsImage(item.icon)" alt="" />
            <div class="count" :style="`background-image:-webkit-linear-gradient(top,#FFFFFF,${item.color});`">
              <count-to
              :startVal="0"
              :endVal="item.value"
              :duration="2000"
              separator=""
            ></count-to>
            <!-- <span class="unit" :style="`background-image:-webkit-linear-gradient(top,#FFFFFF,${item.color});`">%</span> -->
            </div>
            <div class="blisterTitle">
              <div v-if="item.ratio" class="ratio">
                <span class="ratio-title">{{ item.ratioTit }}</span>
                <img :src="item.ratio > 0?getSnImage('up.png'):getSnImage('down.png')" alt="">
                <div :class="[item.ratio > 0 ? 'up' : 'down']">
                  {{ (item.ratio || 0)+ "%" }}
                </div>
              </div>
              <div class="name">{{ item.name }}</div>
            </div>
          </div>
        </div>
      </div>
      <div style="width: 100%; margin-top: 30px" v-else>
        <noData />
      </div>
    </div>
</template>
<script setup lang="ts">
import { ref,PropType,watch} from "vue";
import { getAssetsImage } from "@/utils/getImage";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import { getSnImage } from "@/utils/getImage";

const props = defineProps({
  data: {
    type: Array as PropType<any>,
    default: () => []
  },
})
const classList = ["right", "top", "left"];
const statisticsData = ref(props.data);
watch(
  () => props.data,
  (n) => {
    statisticsData.value = n;
  }
)
</script>
<style lang="less" scoped>
.showPanel {
  position: relative;
  height: 270px;

  .blister {
    position: absolute;
    width: auto;
    cursor: pointer;

    .unit {
      transform: translate(-50%, -50%);
      font-size: 30px;
      font-weight: 400;
      line-height: 20px;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .ball {
      width: 100%;
      height: 70px;
      border-radius: 50%;
      position: relative;
      color: #ffffff;
      font-family: PangMenZhengDao-Regular, PangMenZhengDao;
      .count{
        position: absolute;
        top: 32%;
        left: 45%;
        transform: translate(-50%, -50%);
        font-size: 30px;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        margin-left: 6px;
      }
    }

    .blisterTitle {
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 16px !important;;
      font-family: Source Han Sans CN-Medium, Source Han Sans CN !important;
      font-weight: 500 !important;
      color: #d4edfd !important;
      line-height: 22px;
      text-wrap: nowrap;
      margin-top: 30px;
      width: 100%;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      text-align: center;
    }
  }

  @keyframes floating {
    from {
      transform: translateY(0);
    }

    50% {
      transform: translateY(-20px);
    }

    to {
      transform: translateY(0);
    }
  }
}

.top {
  top: 24px;
  left: calc(50% - 69px);
  animation: floating 3s ease-in-out infinite;
  .ball {
    color: transparent;
    width: 138px !important;
    height: 138px !important;
    width: 63px;
  }
}
.right {
  right: 13px;
  bottom: 10px;
  animation: floating 4s 0.5s ease-in-out infinite;
  .ball {
    width: 126px !important;
    height: 126px !important;
  }
}

.left {
  bottom: 10px;
  left: 48px;
  animation: floating 5s 1s ease-in-out infinite;
  .ball {
    width: 106px !important;
    height: 106px !important;
  }
}

.bottom {
  right: 44px;
  bottom: 40px;
  animation: floating 6s 1.5s ease-in-out infinite;
  .ball {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    width: 100px !important;
    height: 100px !important;
  }
}
.ratio{
  display: flex;
  align-items: center;
  justify-content: center;
}
.ratio-title{
  font-size: 12px;
  font-family: Source Han Sans CN-Regular, Source Han Sans CN;
  font-weight: 400;
  color: #899BA9;
  line-height: 13px;
  margin-right: 3px;
}
.up {
  font-size: 13px;
  color: #f14545;
}

.down {
  font-size: 13px;
  color: #2ae8bd;
}
</style>
