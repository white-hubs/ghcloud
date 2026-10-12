<template>
  <SubPanelTemplate title="项目介绍">
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
  <SubPanelTemplate title="在线预约和咨询服务">
    <div class="table-box">
      <RollTable :column="columns" :data="data" :showLength="8"> </RollTable>
    </div>
  </SubPanelTemplate>
  <div class="jump-box">
    <div class="item">
      <img class="item-left" @click="jumpTo('https://www.chengdu.com.cn/')" :src="getAssetsImage('bbb.png')" alt="">
    </div>
    <div class="item">
      <img class="item-left" @click="jumpTo('https://pz.chengdu.com.cn/')" :src="getAssetsImage('aaa.png')" alt="">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import { getAssetsImage } from '@/utils/getImage';

const introduce = ref({
    title:'创新港园区介绍',
    details:'项目总投资50亿元，占地约200亩，可容纳在校学生人数达3000余人，项目按照“高校+科创+配套”的功能布局，将建成研究院、研究生分院、产业学院以及成果孵化平台、科技创新服务平台等设施。项目建成投运后计划引进两院院士、蓉漂计划专家等高层次人才上百人，进一步补足天府中药城在功能性平台搭建、领军人才集聚等方面的短板。',
    imgUrl:'overView18.png'
})
const columns = ref([
  {
    title: "类型",
    dataIndex: "type",
  },
  {
    title: "名称",
    dataIndex: "name",
  },
  {
    title: "时间",
    dataIndex: "time",
  },
]);
const data = ref<any>([
  {
    type:'预约',
    name:'A企业',
    time:'2024-07-01'
  },
  {
    type:'预约',
    name:'B企业',
    time:'2024-07-01'
  },
  {
    type:'预约',
    name:'B企业',
    time:'2024-07-01'
  },
  {
    type:'预约',
    name:'B企业',
    time:'2024-07-01'
  },
  {
    type:'预约',
    name:'C企业',
    time:'2024-07-01'
  },
  {
    type:'咨询',
    name:'A企业',
    time:'2024-07-01'
  },
  {
    type:'咨询',
    name:'A企业',
    time:'2024-07-01'
  },
  {
    type:'咨询',
    name:'A企业',
    time:'2024-07-01'
  },
  {
    type:'咨询',
    name:'A企业',
    time:'2024-07-01'
  },
]);
const jumpTo = (url:string)=>{
  window.open(url)
}
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
    animation: scroll 20s linear infinite;
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
.table-box{
  height: 300px;
}
.jump-box{
  margin-top: 40px;
  .item{
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #2989FF;
    font-size: 18px;
    margin-bottom: 30px;
    .item-left{
      width: 340px;
    }
    .item-right{
      align-self: flex-end;
    }
  }
}
</style>