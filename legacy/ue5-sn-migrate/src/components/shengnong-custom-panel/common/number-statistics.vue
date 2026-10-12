<template>
  <div :class="['container', props.skin]">
    <div class="box" v-for="item in props.data" :key="item.name" @click="handleClick(item)">
      <div class="left">
        <img class="icon" v-if="item.icon" :src="getSnImage(item.icon)" alt="">
        <span v-if="item.iconTit" class="name">{{ item.iconTit }}</span>
      </div>
      <div class="content">
        <div class="name" v-if="item.name">
          {{ item.name }}
          <span v-if="props.skin === 'row-cell'" :class="['dot', item.color ? item.color : 'blue']"></span>
        </div>
        <div :class="['value', item.color ? item.color : 'blue']">
          <count-to :startVal="0" :endVal="item.value" :duration="2000" separator="" class="number-count" />
          <div v-if="item.unit" class="unit">{{ item.unit }}</div>
          <div v-if="item.ratio" class="ratio">
            <span class="ratio-title">{{ item.ratioTit }}</span>
            <img :src="item.ratio > 0?getSnImage('up.png'):getSnImage('down.png')" alt="">
            <div :class="[item.ratio > 0 ? 'up' : 'down']">
              {{ Math.round(Number((item.ratio || 0)))+ "%" }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getSnImage } from "@/utils/getImage";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue"

export interface NumberStatistics {
  name: string;
  value: number;
  unit?: string | undefined;
  icon?: string | undefined;
  color?: "blue" | "green" | "yellow" | "red";
}
interface Props {
  skin: "grid" | "row" | "row-cell";
  data: {
    value: number;
    name?: string;
    unit?: string | undefined;
    icon?: string | undefined;
    iconTit?: string | undefined;
    ratioTit?: string | undefined;
    ratio?: number | undefined;
    color?: "blue" | "green" | "yellow" | "red";
  }[]
} 
const props = withDefaults(defineProps<Props>(), {
  skin: "grid",
  data: () => []
});
const emit = defineEmits(["click"]);
const handleClick=(item)=>{
  emit('click',item)
}
</script>
<style lang="less" scoped>
  .container {
    display: grid;
    &.grid {
      gap: 12px;
      grid-template-columns: repeat(2, 1fr);
    }
    &.row {
      grid-template-columns: repeat(1, 1fr);
      .box{
        justify-content: space-between;
        .icon{
          margin-right: 10px;
        }
        .content{
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-direction: row;
        }
        .value{
          font-size: 30px;
          display: flex;
          white-space: nowrap;
          align-items: center;
        }
        .ratio{
          display: flex;
          align-items: center;
          margin-left: 5px;
        }
        .ratio-title{
          font-size: 13px;
          font-family: Source Han Sans CN-Regular, Source Han Sans CN;
          font-weight: 400;
          color: #d9e7ff;
          line-height: 21px;
          margin-right: 3px;
        }
        .up {
          font-size: 13px;
          color: #f14545;
          -webkit-text-fill-color: initial;
        }

        .down {
          font-size: 13px;
          color: #2ae8bd;
          -webkit-text-fill-color: initial;
        }
      }
    }
    &.row-cell {
      display: flex;
      align-items: center;
      .box{
        display: flex;
        align-items: center;
        flex: 1;
        .content{
          display: flex;
        }
        &:first-child{
          .value{
            font-size: 30px;
          }
        }
        &:not(:first-child){
          position: relative;
          .content{
            padding-left: 5px;
            margin-left: 6px;
          }
          .dot{
            position: absolute;
            left: 6px;
            top: 12px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(141,178,239,0.30);
            &::after{
              display: inline-block;
              content: '';
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #67b9c1;
            }
          }
          .dot.blue{
            background: rgba(141,178,239,0.2);
            &::after{
              background: #8DB2EF;
            }
          }
          .dot.green{
            background: rgba(141,178,239,0.30);
            &::after{
              background: #67b9c1;
            }
          }
          .dot.yellow{
            background: rgba(197,169,140,0.20);;
            &::after{
              background: #C5A98C;
            }
          }
          .dot.red{
            background: rgba(197,169,140,0.20);;
            &::after{
              background: #C5A98C;
            }
          }


          .value{
            font-size: 28px;
          }
          &::before{
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            display: inline-block;
            content: '';
            background: url("/resource/v1/ue5-sn-migrate/assets/images/sn/s.png") no-repeat;
            width: 1px;
            height: 30px;
          }

        }
      }
    }
    .box {
      cursor: pointer;
      padding: 10px;
      background: linear-gradient(6deg, rgba(127,158,226,0.16) 3%, rgba(157,174,211,0.08) 100%);

      display: flex;
      .icon{
        width: 46px;
        height: auto;
        margin-right: 8px;
      }
      .content {
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .name {
        font-size: 15px;
        font-family: Source Han Sans CN, Source Han Sans CN-Medium;
        font-weight: Medium;
        text-align: left;
        color: #93aadb;
        line-height: 15px;
        margin-bottom: 4px;
        white-space: nowrap;
      }
      .value {
        font-family: "PangMenZhengDao";
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 28px;
        font-family: D-DIN, D-DIN-Regular;
        font-weight: bold;
        text-align: left;
        color: #000000;
        line-height: 28px;
        white-space: nowrap;
      }
      .unit{
        font-size: 12px;
        font-family: Source Han Sans CN, Source Han Sans CN-Regular;
        font-weight: Regular;
        text-align: left;
        color: rgba(255,255,255,0.50) !important;
        line-height: 16px;
        letter-spacing: 0.01px;
        margin-left: 2px;
        display: inline-block;
      }
      .number-count{
        font-size: 28px;
      }
    }
  }
  .gh-count-to{
    font-family: PangMenZhengDao;
  }
  .container .box .value.blue{
    background: linear-gradient(180deg,#ffffff 28%, #a1bffc 78%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .container .box .value.green{
    background: linear-gradient(180deg,#ffffff 28%, #6fcfd8 78%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .container .box .value.yellow{
    background: linear-gradient(180deg,#ffffff 28%, #ffd4a8 78%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .container .box .value.red{
    background: linear-gradient(180deg,#ffffff 28%, #ffc7c6 78%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
</style>