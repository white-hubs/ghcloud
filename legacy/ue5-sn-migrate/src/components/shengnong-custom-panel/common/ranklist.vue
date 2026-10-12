<template>
  <div class="rank-main">
    <div class="top-title" @click="showTipModal = true">{{ title }}
      <img class="top-icon" :src="getSnImage('top-icon.png')" alt="" />
    </div>
    <div class="scroll-wrap">
      <!-- <vue3-seamless-scroll :list="props.listData" :step="step" hover :singleHeight="70"
            :waitTime="waitTime"> -->
      <div class="content">
        <div
          class="box"
          :class="index < 3 ? 'big' : ''"
          v-for="(item, index) in listData"
          :style="{ animationDelay: (index + 1) / 8 + 's' }"
          @click="showrank(item)"
        >
          <div
            class="sort"
            :class="`sort${index} `"
            :style="index < 3 ? 'font-size:20px' : ''"
          >
            {{ index + 1 }}
          </div>
          <div
            class="name"
            :class="`name${index}`"
            :style="index < 3 ? 'font-size:20px' : ''"
          >
            <!-- <img class="icon" :src="getSnImage('f2.png')" alt=""> -->
            <!-- <div class="icon"></div> -->
            {{ item.name }}
          </div>
          <div class="value" :class="`value${index}`">
            <count-to
              :startVal="0"
              :endVal="item.status?Number(item.ratio):0"
              :duration="2000"
              separator=""
              :style="index < 3 ? 'font-size:20px' : ''"
            ></count-to>
            <div class="unit">分</div>
          </div>
        </div>
      </div>
      <!-- </vue3-seamless-scroll> -->
    </div>
  </div>
  <modal-table :show="showmodal" :title="reinInfo.name" @close="close">
    <reinsurancemodle :id="reinInfo.id" v-if="showmodal" :status="reinInfo.status"></reinsurancemodle>
  </modal-table>
  <modal-table :show="showTipModal" title="风险指数说明" @close="showTipModal = false" width="973px">
    <tip-modal v-if="showTipModal"></tip-modal>
  </modal-table>
</template>
<script setup lang="ts">
import { getSnImage } from "@/utils/getImage";
import modalTable from "@/components/modal-table/modal.vue";
import reinsurancemodle from "./reinsurancemodle.vue";
import tipModal from "./tip-modal.vue";
import { onMounted, reactive, ref, watch } from "vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import scrollParmas from "@/components/businessPanel/public/rollTable/scrollParmas";

interface Props {
  title: string;
  listData: {
    iconImg?: string;
    name: string;
    count: number;
    ratio: string | number;
    color?: string;
    unit?: string;
    status:boolean;
  }[];
}
const props = withDefaults(defineProps<Props>(), {
  title: "风险指数排行",
});
const showmodal = ref(false);
const showTipModal = ref(false);
const reinInfo = reactive({
  name:'',
  id:'',
  status:false,
});
const showrank = (item) => {
  showmodal.value = true;
  Object.assign(reinInfo, item);
};
const close = () => {
  showmodal.value = false;
};
</script>

<style lang="less" scoped>
.big {
  // transform: scale(1.1)!important;
  font-size: 30px !important;
}
.scroll-wrap {
  overflow: hidden;
  // height: 600px;
}
.modal-layout {
  height: 600px;
  overflow: auto;
}
.top-title {
  font-size: 24px;
  font-family: YouSheBiaoTiHei-Bold, YouSheBiaoTiHei;
  font-weight: 400;
  color: #ffffff;
  padding-bottom: 20px;
  padding-left: 64px;
  vertical-align: middle;
}
.top-icon{
  display: inline-block;
  width: 28px;
  height: 28px;
  cursor: pointer;
}
.rank-main {
  position: relative;
  margin-bottom: 30px;
  &::before {
    content: "";
    display: inline-block;
    position: absolute;
    left: 24px;
    top: 10px;
    z-index: 0;
    width: 4px;
    height: 4px;
    background: #72849b;
    border-radius: 50%;
  }
  &::after {
    content: "";
    display: inline-block;
    height: 100%;
    border: 1px dashed #718092;
    position: absolute;
    left: 25px;
    top: 10px;
    z-index: -1;
  }
}
.content {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.rank-main .box:hover {
  opacity: 1;
}
.box {
  width: 100%;
  display: flex;
  cursor: pointer;
  color: #ffffff;
  padding-bottom: 40px;
  justify-content: space-between;
  align-items: center;
  z-index: 1;
  cursor: pointer;
  // opacity: 0.8;
  transform: translateX(-150%);
  animation: floating 0.3s ease-in-out;
  animation-fill-mode: forwards;
  align-items: flex-start;
  height: 8.6vh;
  padding-bottom: 0;
  .sort {
    font-size: 20px;
    font-family: PangMenZhengDao-Regular, PangMenZhengDao;
    font-weight: 400;
    display: inline-block;
    width: 60px;
    height: 35px;
    line-height: 30px;
    background-image: url("/resource/v1/ue5-sn-migrate/assets/images/sn/f1-light.png");
    background-repeat: no-repeat;
    background-size: contain;
    text-align: center;
    text-indent: -8px;
    // margin-top: 8px;
  }
  .sort0 {
    background-image: url("/resource/v1/ue5-sn-migrate/assets/images/sn/f1-light1.png") !important;
  }
  .sort1 {
    background-image: url("/resource/v1/ue5-sn-migrate/assets/images/sn/f1-light2.png") !important;
  }
  .sort2 {
    background-image: url("/resource/v1/ue5-sn-migrate/assets/images/sn/f1-light3.png") !important;
  }
  .icon {
    width: 55px;
    height: 22px;
    margin: 0 10px;
    display: inline-block;
    background-image: url("/resource/v1/ue5-sn-migrate/assets/images/sn/f2-light.png");
    background-repeat: no-repeat;
    background-size: contain;
  }
  .name {
    font-size: 20px;
    text-indent: 16px;
    // font-family: Source Han Sans CN-Medium, Source Han Sans CN;
    font-family: "YouSheBiaoTiHei";
    font-weight: 500;
    line-height: 26px;
    background-image: url("/resource/v1/ue5-sn-migrate/assets/images/sn/f3-light.png");
    background-repeat: no-repeat;
    background-size: 100% 100%;
    flex: 1;
    height: 38px;
    line-height: 38px;
  }
  .name0 {
    background-image: url("/resource/v1/ue5-sn-migrate/assets/images/sn/f3-light1.png") !important;
    font-size: 20px;
  }
  .name1 {
    background-image: url("/resource/v1/ue5-sn-migrate/assets/images/sn/f3-light2.png") !important;
    font-size: 20px;
  }
  .name2 {
    background-image: url("/resource/v1/ue5-sn-migrate/assets/images/sn/f3-light3.png") !important;
    font-size: 20px;
  }
  .value {
    font-size: 20px;
    font-family: PangMenZhengDao-Regular, PangMenZhengDao;
    font-weight: 400;
    display: flex;
    background-image: url("/resource/v1/ue5-sn-migrate/assets/images/sn/f4-light.png");
    background-repeat: no-repeat;
    background-size: contain;
    width: 85px;
    height: 38px;
    line-height: 38px;
    display: flex;
    justify-content: center;
    align-items: baseline;
  }
  .value0 {
    background-image: url("/resource/v1/ue5-sn-migrate/assets/images/sn/f4-light1.png") !important;
    font-size: 20px;
  }
  .value1 {
    background-image: url("/resource/v1/ue5-sn-migrate/assets/images/sn/f4-light2.png") !important;
    font-size: 20px;
  }
  .value2 {
    background-image: url("/resource/v1/ue5-sn-migrate/assets/images/sn/f4-light3.png") !important;
    font-size: 20px;
  }
}
.unit {
  color: #fff;
  font-size: 12px !important;
  font-family: Source Han Sans CN-Regular, Source Han Sans CN;
  margin-left: 2px;
}
.gh-count-to {
  font-family: PangMenZhengDao;
}

@keyframes floating {
  from {
    transform: translateX(-100px);
  }

  50% {
    transform: translateX(-20px);
  }

  to {
    transform: translateX(0);
  }
}
</style>
<style lang="less"></style>
