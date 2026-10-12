<template>
  <SubPanelTemplate title="天府中药城介绍">
    <div class="hospitalInfo">
      <img :src="getAssetsImage(introduce.imgUrl)" alt="">
      <div class="hospitalInfo-text">
        <div class="hospitalInfo-title">{{introduce.title}}</div>
        <div class="scroll_box">
          <div class="scroll-text">
            {{introduce.details}}
          </div>
        </div>
      </div>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="双湖片区介绍">
    <div class="total-num">
      <img :src="getAssetsImage('circel-halo4.png')" class="bg-img" />
      <img :src="getAssetsImage('circel-halo3.png')" class="img2 rotate reverse" />
      <img :src="getAssetsImage('overView46.png')" class="img3 rotate reverse" />
      <a-progress :stroke-color="{ '0%': '#2C8BFF', '100%': '#B2D4FF', }" :percent="30" type="circle"
        strokeLinecap="square" trailColor="rgba(255, 255, 255, 0.1)" />
      <img :src="getAssetsImage('bubble.png')" class="img3 rotate" />
      <div class="value">
        <img :src="getAssetsImage('overView44.png')" class="img3" />
      </div>
      <div class="list">
        <div :class="['item' + index]" class="item" v-for="(item, index) in callStatisticsData.list">
          <div>
            <CountTo :startVal="0" :endVal="item.value" :duration="2000" separator="" />
            <span class="fs12">
              {{ item.unit }}
            </span>
          </div>
          <div class="fs12">{{ item.name }}</div>
        </div>

      </div>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="客户关系管理">
    <div class="line-chart">
      <stackedLine :title="lineData.title" :yData="lineData.yData" :xData="lineData.xData"
        :color="['#2989FF', '#FF6E23']"></stackedLine>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import { getAssetsImage } from '@/utils/getImage';
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import stackedLine from "@/components/businessPanel/public/charts/stackedLine/stackedLine.vue";

const introduce = ref({
    title:'天府中药城',
    details:'四川彭州经开区天府中药城面积15.25平方公里，是四川省起步最早、综合实力最强、三次产业链条最完整的中医药产业聚集地，聚焦现代中药创新，着力构建“种研制贸医养”的全产业链体系，努力打造全国一流的现代中医药研发制造基地和中医药传承创新发展示范区。已聚集四川新绿色药业等医药健康企业279家，拥有年销售过亿元中药单品10个，2023年医药制造业产值达100.05亿元，同比增长10.88%，中药制造规上产值稳居全省第一。全面建设“一带一路沿线国家医药贸易中心，已入驻商贸流通企业40余家，贵细中药材贸易商家380余家，2023年实现医药贸易流通额近48亿元。园区以创新驱动引领高质量发展，专注于中医药创新和大健康应用领域，引入成都中医药大学天府中医药创新港、四川中医药职业学院等科研创新及人才培养平台，努力打造成为中医药创新极核。目前，园区共有工业企业923家，其中规上企业122家。2023年全年累计实现规上企业产值188.07亿元，同比增长1.2%，税收13.41亿，同比增长26.4%；规上工业增加值增速5.6%。2024年 1-11月实现规上产值162.55亿元。',
    imgUrl:'overView18.png'
})
const callStatisticsData = reactive({
    totalNum: 34563,
    list: [
        { name: "入驻企业", value: 120, unit: '个' },
        { name: "招商项目", value: 76, unit: '个' },
        { name: "发展案例", value: 4, unit: '个' },
        { name: "周边配套", value: 12, unit: '个' },
    ]
})
const lineData = reactive({
    title: "",
    xData: ['4', '8', '12', '16', '20', '24'],
    yData: [
        {
            data: [10, 12, 14, 5, 16, 10],
            name: "需求数",
            colors: [
                {
                    offset: 0,
                    color: "rgba(41, 137, 255, 1)",
                },
                {
                    offset: 1,
                    color: "rgba(41, 137, 255, 0.20)",
                },
            ],
        },
        {
            data: [10, 12, 14, 5, 16, 8],
            name: "处理数",
            colors: [
                {
                    offset: 0,
                    color: "rgba(255, 110, 35, 1)",
                },
                {
                    offset: 1,
                    color: "rgba(255, 110, 35, 0.02)",
                },
            ],
        },
    ],
});
</script>
<style lang="less" scoped>
.hospitalInfo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px;

  img {
    width: 152px;
    height: 128px;
  }

  .hospitalInfo-text {
    width: 169px;
    color: #fff;
    font-size: 12px;

    .hospitalInfo-title {
      font-size: 14px;
      margin-bottom: 5px;
    }
  }
}

.scroll_box {
  height: 100px;
  overflow: hidden;

  .scroll-text {
    animation: scroll 50s linear infinite;
    color: #D9E7FF;
  }
}

@keyframes scroll {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(-100%);
  }
}

.total-num {
  margin: auto;
  position: relative;
  width: 159px;
  height: 153px;

  img,
  .value {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .img1 {
    width: 159px;
    height: 153px;
  }

  .img2 {
    width: 142px;
    height: 142px;
  }

  .img3 {
    width: 80px;
    height: 80px;
  }

  :deep(.ant-progress) {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 125px;
    height: 125px;
    transform: translate(-50%, -50%) rotate(-25deg);

    .ant-progress-text {
      display: none;
    }

    .ant-progress-inner {
      display: contents;
    }
  }


  .value {
    display: flex;
    flex-flow: column;
    align-items: center;

    :deep(.gh-count-to) {
      font-size: 22px;
      font-family: "YouSheBiaoTiHei";
      font-weight: bold;
      color: #FFFFFF;
      margin-bottom: -4px;

    }

    &:last-child {
      font-size: 12px;
      font-weight: 400;
      color: #D0DEEE;
    }
  }
}

.fs12 {
  font-size: 16px
}

.bg-img {
  position: absolute;
  height: 100%;
}

:deep(.gh-count-to) {
  font-size: 22px;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: -4px;

}

.list {
  width: 100%;
  display: flex;
  position: relative;
  left: 0;
  width: 100%;
  height: 100%;
  color: #D9E7FF;

  .item {
    position: absolute;
    width: 150px;
    font-size: 14px;
    font-family: Source Han Sans CN-Regular, Source Han Sans CN;
    font-weight: 400;
    text-align: center;
  }

  .item0 {
    left: -100px;
    top: 15px;
  }

  .item1 {
    left: 100px;
    top: 15px;
  }

  .item2 {
    left: -100px;
    top: 82px;
  }

  .item3 {
    left: 105px;
    top: 82px;
  }
}

@keyframes rotate {
  from {
    transform: translate(-50%, -50%) rotate(0);
  }

  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
.line-chart{
  height: 280px;
}
</style>