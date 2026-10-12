<template>
  <div
    :class="['content', menuName === '电气安全' ? 'dq' : menuName === '小散工程' ? 'xs' : menuName === '电动车管理' ? 'ddc' : '']"
    v-if="['电气安全', '小散工程', '电动车管理'].includes(menuName)"
  >
    <template v-for="(item, key) in alarmlist" :key="`${menuName}_${key}`">
      <div class="data" v-if="TopPanelMap[menuName][key]"  @click="handleClick(menuName, item, key)">
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
          <span class="unit">个</span>
          <!-- <span class="ratio">环比{{ item.ratio }}  <img :src="getSnImage('up.png')" alt=""> </span> -->
        </div>
      </div>
    </template>
  </div>
  <div
    :class="['content', menuName === '安防监控' ? 'af' :  '']"
    v-if="menuName == '安防监控'"
  >
    <template v-for="(item, key) in alarmlist" :key="`${menuName}_${key}`">
      <div class="data" v-if="TopPanelMap[menuName][key]" @click="handleClick(menuName, item, key)">
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
          <span class="unit">个</span>
          <!-- <span class="ratio">环比{{ item.ratio }}  <img :src="getSnImage('up.png')" alt=""> </span> -->
        </div>
      </div>
    </template>
  </div>
  <div
  v-if="menuName=='消防安全'||menuName=='用气安全'||menuName=='安全管理'"
    :class="['content', menuName === '安全管理' ? 'aq' : menuName === '用气安全' ? 'yq' :  menuName === '消防安全' ? 'xf': '']"
  >
    <template v-for="(item, key) in alarmlist" :key="`${menuName}_${key}`">
      <div class="data" :class="['data', TopPanelMap[menuName][key]=== '未完成安全任务数' ? 'no-cursor' : '']" v-if="TopPanelMap[menuName][key]" @click="handleClick(menuName, item, key)">
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
          <span class="unit">个</span>
          <!-- <span class="ratio">环比{{ item.ratio }}  <img :src="getSnImage('up.png')" alt=""> </span> -->
        </div>
      </div>
    </template>
  </div>
  <div class="content1" v-if="menuName == '综合分析'">
 
    <div
      v-for="(item, key) in alarmlist"
      class="data"
      :key="`${menuName}_${key}`"
      >
      <div class="name" v-if="TopPanelMap[menuName][key]" @click="handleClick(menuName, item, key)">
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
        <span class="unit">个</span>
        <!-- <span class="ratio">环比{{ item.ratio }}  <img :src="getSnImage('up.png')" alt=""> </span> -->
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
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
import { topPanelClick } from './alarmlist-event'

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
      period: yearPeriod.join(','),
      type: "THIS_YEAR",
    });
  },
  电气安全: async () => {
    return await electricSafetyCard({
      applicationCode: "ELECTRICMANAGE",
      period: yearPeriod.join(','),
      type: "THIS_YEAR",
    });
  },
  消防安全: async () => {
    const [electricData, fireData] = await Promise.all([
      electricSafetyCard({
        applicationCode: "FIRECONTROL",
        period: yearPeriod.join(','),
        type: "THIS_YEAR",
      }),
      fireSafetyCard({
        applicationCode: "FIRECONTROL",
        // period: yearPeriod.join(','),
        // type: "THIS_YEAR",
      })
    ]);
    return { ...electricData, ...fireData };
  },
  用气安全: async () => {
    return await electricSafetyCard({
      applicationCode: "GAS_MANAGEMENT",
      period: yearPeriod.join(','),
      type: "THIS_YEAR",
    });
  },
  安全管理: async () => {
    return await safety({
      period: yearPeriod.join(','),
      type: "THIS_YEAR",
    });
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
const application = new Map([
  ['安防监控', 'SECURITY_MONITORING'],
  ['电气安全', 'ELECTRICMANAGE'],
  ['消防安全', 'FIRECONTROL'],
  ['电动车管理', ''],
  ['安全管理', ''],
  ['综合分析', ''],
])
const handleClick = (menuName, item, key) => {
  topPanelClick({
    applicationCode: application.get(menuName),
    menuName,
    key,
    name: TopPanelMap[menuName][key],
    period: yearPeriod.join(','),
    type: "THIS_YEAR",
  })
}

</script>

<style lang="less" scoped>
.aq{
  width:600px;
  margin: 0 auto;
  .content .data {
    &:last-child{
      cursor: text;
    }
  }
}
.yq{
  width:350px;
  margin: 0 auto;
}
.xf{
  width:500px;
  margin: 0 auto;
}
.dq{
  width:500px;
  margin: 0 auto;
}
.af{
  width:350px;
  margin: 0 auto;
}
.dq{
  width:350px;
  margin: 0 auto;
}
.xs{
  width:400px;
  margin: 0 auto;
}
.ddc{
  width:420px;
  margin: 0 auto;
}
.content {
  display: flex;
  justify-content: space-between;
  padding: 10px 35px;
  .data{
    cursor: pointer;
  }
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
.unit{
  display: inline-block;
  font-size: 13px;
  font-family: Source Han Sans CN, Source Han Sans CN-Medium;
  text-align: left;
  color: rgba(255,255,255,0.50);
  line-height: 13px;
}
.content .data.no-cursor{
  cursor: not-allowed;
}
</style>
