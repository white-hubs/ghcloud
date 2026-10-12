<template>
  <div
    class="content"
    :style="menuName !== '综合分析' ? (['小散工程', '电动车管理'].includes(menuName) ? 'justify-content: space-evenly;width: auto;' : 'margin-left:100px;width:110%;'): ''"
    v-if="['电气安全', '小散工程', '电动车管理'].includes(menuName)"
  >
    <template v-for="(item, key) in alarmlist" :key="`${menuName}_${key}`">
      <div class="data" v-if="TopPanelMap[menuName][key]">
        <div class="name">
          <div
            class="crile"
            :style="img[menuName][TopPanelMap[menuName][key]]"
            v-if="!img[menuName]['list'].includes(TopPanelMap[menuName][key])"
          ></div>
          <div
            class="image"
            v-if="img[menuName]['list'].includes(TopPanelMap[menuName][key])"
          >
            <img :src="getSnImage(img[menuName][TopPanelMap[menuName][key]])" />
          </div>

          {{ TopPanelMap[menuName][key] }}
        </div>

        <div
          class="number"
          :style="`background-image:-webkit-linear-gradient(top,#FFFFFF,${
            color[menuName][TopPanelMap[menuName][key]]
          });`"
          v-if="TopPanelMap[menuName][key]"
        >
          <count-to :startVal="0" :endVal="item" :duration="2000" separator=""></count-to>
          <!-- <span class="ratio">环比{{ item.ratio }}  <img :src="getSnImage('up.png')" alt=""> </span> -->
        </div>
      </div>
    </template>
  </div>
  <div
    class="content"
    :style="menuName !== '综合分析' ? 'margin-left:100px;width:110%;' : ''"
    v-if="menuName == '安防监控'"
  >
    <template v-for="(item, key) in alarmlist" :key="`${menuName}_${key}`">
      <div class="data" v-if="TopPanelMap[menuName][key]">
        <div class="name">
          <div
            class="crile"
            :style="img[menuName][TopPanelMap[menuName][key]]"
            v-if="!img[menuName]['list'].includes(TopPanelMap[menuName][key])"
          ></div>
          <div
            class="image"
            v-if="img[menuName]['list'].includes(TopPanelMap[menuName][key])"
          >
            <img :src="getSnImage(img[menuName][TopPanelMap[menuName][key]])" />
          </div>

          {{ TopPanelMap[menuName][key] }}
        </div>

        <div
          class="number"
          :style="`background-image:-webkit-linear-gradient(top,#FFFFFF,${
            color[menuName][TopPanelMap[menuName][key]]
          });`"
          v-if="TopPanelMap[menuName][key]"
        >
          <count-to :startVal="0" :endVal="item" :duration="2000" separator=""></count-to>
          <!-- <span class="ratio">环比{{ item.ratio }}  <img :src="getSnImage('up.png')" alt=""> </span> -->
        </div>
      </div>
    </template>
  </div>
  <div
  v-if="menuName=='消防安全'||menuName=='用气安全'||menuName=='安全管理'"
    class="content"
    :style="menuName !== '综合分析' ? 'margin-left:100px;width:110%;' : ''"
 
  >
    <template v-for="(item, key) in alarmlist" :key="`${menuName}_${key}`">
      <div class="data" v-if="TopPanelMap[menuName][key]">
        <div class="name">
          <div
            class="crile"
            :style="img[menuName][TopPanelMap[menuName][key]]"
            v-if="!img[menuName]['list'].includes(TopPanelMap[menuName][key])"
          ></div>
          <div
            class="image"
            v-if="img[menuName]['list'].includes(TopPanelMap[menuName][key])"
          >
            <img :src="getSnImage(img[menuName][TopPanelMap[menuName][key]])" />
          </div>

          {{ TopPanelMap[menuName][key] }}
        </div>

        <div
          class="number"
          :style="`background-image:-webkit-linear-gradient(top,#FFFFFF,${
            color[menuName][TopPanelMap[menuName][key]]
          });`"
          v-if="TopPanelMap[menuName][key]"
        >
          <count-to :startVal="0" :endVal="item" :duration="2000" separator=""></count-to>
          <!-- <span class="ratio">环比{{ item.ratio }}  <img :src="getSnImage('up.png')" alt=""> </span> -->
        </div>
      </div>
    </template>
  </div>
  <div class="content1" v-if="menuName == '综合分析'">
 
    <div
      v-for="(item, key) in alarmlist"
      class="data"
      :style="
        [TopPanelMap[menuName][key]] == '今年未响应报警数(个)' ? 'margin-left:-20px' :
        [TopPanelMap[menuName][key]] == '今年未处理报警数(个)' ? 'margin-left:-105px':
        [TopPanelMap[menuName][key]] == '危险源建档数(个)' ? 'margin-left:-30px' 
        : ''
      "
      :key="`${menuName}_${key}`">
      <div class="name" v-if="TopPanelMap[menuName][key]">
        <div
          class="crile"
          :style="img[menuName][TopPanelMap[menuName][key]]"
          v-if="!img[menuName]['list'].includes(TopPanelMap[menuName][key])"
        ></div>
        <div
          class="image"
          v-if="img[menuName]['list'].includes(TopPanelMap[menuName][key])"
        >
          <img :src="getSnImage(img[menuName][TopPanelMap[menuName][key]])" />
        </div>

        {{ TopPanelMap[menuName][key] }}
      </div>

      <div
        class="number"
        :style="`background-image:-webkit-linear-gradient(top,#FFFFFF,${
          color[menuName][TopPanelMap[menuName][key]]
        });`"
        v-if="TopPanelMap[menuName][key]"
      >
        <count-to :startVal="0" :endVal="item" :duration="2000" separator=""></count-to>
        <!-- <span class="ratio">环比{{ item.ratio }}  <img :src="getSnImage('up.png')" alt=""> </span> -->
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { TableColumnType, message } from "ant-design-vue";
import { onMounted, reactive, ref, watch, watchEffect } from "vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import {
  compreStatistical,
  electricSafetyCard,
  fireSafetyCard,
  safety,
  useAirCard,
  looseWorkCarCard,
  electricCarCard
} from "@/api/shennong/compre";
import { getSnImage } from "@/utils/getImage";
import { TopPanelMap,img ,color} from "./alarmlist";
import { storeMenu } from '@/piniaStore/menu'
import moment from 'moment'
const piniaStoreMenu = storeMenu();
interface AlarmType {
  name: string;
  number: number;
  ratio: string;
  color: string;
  sizecolor: string;
}
interface Props {
  title: string;
}
const yearPeriod = [moment().startOf("year").format('YYYY-MM-DD 00:00:00'), moment().endOf("year").format('YYYY-MM-DD 23:59:59')];
const getlist = {
  综合分析: async () => {
    return await compreStatistical({});
  },
  安防监控: async () => {
    return await electricSafetyCard({
      applicationCode: "SECURITY_MONITORING",
      period: yearPeriod.join(',')
    });
  },
  电气安全: async () => {
    return await electricSafetyCard({
      applicationCode: "ELECTRICMANAGE",
      period: yearPeriod.join(',')
    });
  },
  消防安全: async () => {
    return await fireSafetyCard({
      applicationCode: "FIRECONTROL",
    });
  },
  用气安全: async () => {
    return await useAirCard({
      applicationCode: "GAS_MANAGEMENT",
    });
  },
  安全管理: async () => {
    return await safety({});
  },
  小散工程: async () => {
    return await looseWorkCarCard();
  },
  电动车管理: async () => {
    return await electricCarCard();
  },
};
const props = withDefaults(defineProps<Props>(), {
  title: "综合分析",
});
const alarmlist = ref();
const menuName = ref()
onMounted(async () => {
  menuName.value = props.title || piniaStoreMenu.currentMenu || '综合分析'
  const data = await getlist[menuName.value]();
  alarmlist.value = data;
});
watch(
  () => props.title,
  async () => {
    menuName.value = props.title || piniaStoreMenu.currentMenu || '综合分析'
    const data = await getlist[menuName.value]();
    alarmlist.value = data;
  },
  {deep: true, immediate: true}
);

</script>

<style lang="less" scoped>
.content {
  display: flex;
  justify-content: space-between;

  padding: 10px 35px;
  .name {
    position: relative;
    height: 16px;
    line-height: 16px;
    font-size: 14px;
    padding-left: 10px;
    font-weight: 500;
    color: #93aadb;
    .crile {
      width: 6px;
      height: 6px;
      background: #8db2ef;

      box-shadow: 0px 0px 1px 5px rgba(141, 178, 239, 0.2);
      border-radius: 50%;
      position: absolute;
      top: 2px;
      left: -4px;
    }
    .two {
      background: #c5a98c;
      box-shadow: 0px 0px 1px 5px rgba(197, 169, 140, 0.2);
    }
    .image {
      width: 46px;
      height: 46px;
      position: absolute;
      top: 0px;
      left: -45px;
      img {
        width: 46px;
        height: 46px;
      }
    }
  }
  .number {
    font-size: 32px;
    font-family: PangMenZhengDao;
    font-weight: 400;
    margin-left: 20px;
    background-image: -webkit-linear-gradient(top, #ffffff, #ffffff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .ratio {
    margin-left: 10px;
    font-size: 12px;
    font-family: Source Han Sans CN-Reg;
    font-weight: 400;
    color: rgba(237, 73, 73, 1);
  }
}
.content1 {
  margin-left: 20px;
  width: 98%;
  display: flex;
  justify-content: space-between;

  padding: 10px 35px;
  .name {
    position: relative;
    height: 16px;
    line-height: 16px;
    font-size: 14px;
    padding-left: 10px;
    font-weight: 500;
    // color: #93aadb;
    color: #d1d8e9;
    .crile {
      width: 6px;
      height: 6px;
      background: #8db2ef;

      box-shadow: 0px 0px 1px 5px rgba(141, 178, 239, 0.2);
      border-radius: 50%;
      position: absolute;
      top: 2px;
      left: -4px;
    }
    .two {
      background: #c5a98c;
      box-shadow: 0px 0px 1px 5px rgba(197, 169, 140, 0.2);
    }
    .image {
      width: 46px;
      height: 46px;
      position: absolute;
      top: 0px;
      left: -45px;
      img {
        width: 46px;
        height: 46px;
      }
    }
  }
  .number {
    font-size: 32px;
    font-family: PangMenZhengDao;
    font-weight: 400;
    margin-left: 20px;
    background-image: -webkit-linear-gradient(top, #ffffff, #ffffff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .ratio {
    margin-left: 10px;
    font-size: 12px;
    font-family: Source Han Sans CN-Reg;
    font-weight: 400;
    color: rgba(237, 73, 73, 1);
  }
}
.gh-count-to {
  font-family: PangMenZhengDao;
}
</style>
