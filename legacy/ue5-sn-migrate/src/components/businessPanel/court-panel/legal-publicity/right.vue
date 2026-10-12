<template>
  <div>
    <SubPanelTemplate title="法律研究">
      <div class="activity">
          <div class="demoTab">
              <a-tabs v-model:activeKey="activeKey" style="position: absolute; right: 20px" >
                  <a-tab-pane key="1" tab="案例研究"></a-tab-pane>
                  <a-tab-pane key="2" tab="审执研究" force-render></a-tab-pane>
              </a-tabs>
          </div>
          <div class="list">
            <Vue3SeamlessScroll :list="studyList" :step="0.5" hover :singleHeight="34" :waitTime="1000">
              <div class="row one-line" v-for="(item, index) in studyList" :key="item.id">
                  <div class="num">{{ index + 1 }}</div>{{ item.label }}
              </div>
            </Vue3SeamlessScroll>
        </div>
        <div class="activity-title">案件快报</div>
        <div class="case">
          <Vue3SeamlessScroll :list="caseList" :step="0.5" hover :singleHeight="64" :waitTime="1000">
            <div class="row" v-for="item in caseList" :key="item.id">
              <div class="time">{{ item.time }}</div>
              <div class="desc two-line">{{ item.label }}</div>
            </div>
          </Vue3SeamlessScroll>
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="法院宣传">
      <div class="activity-title">法院要闻</div>
      <div class="information">
        <div class="content">
            <img class="hostImg" :src="getAssetsImage('legal-1.png')" alt="">
            <div class="desc">
                <div class="title">
                    <img class="icon" :src="getAssetsImage('legal-6.png')" alt="">党建引领聚合力基层治
                </div>
                <div class="info">为及时对外发布、解读相关政策和建政策直通、增强政策认同感…</div>
            </div>
        </div>
        <!-- <div class="list">
          <Vue3SeamlessScroll :list="informationList" :step="0.5" hover :singleHeight="58" :waitTime="1000">
            <div class="item two-line" v-for="item in informationList" :key="item.id">
              <p>{{ item.label }}</p>
              <p>{{ item.time }}</p>
            </div>
          </Vue3SeamlessScroll>
        </div> -->
      </div>
      <div class="activity-title">法官风采</div>
      <div class="judge">
        <Vue3SeamlessScroll :list="judgeList" :step="0.5" hover :singleHeight="40" :waitTime="1000">
          <div class="row" v-for="item in judgeList" :key="item.id">
            <img class="img" :src="getAssetsImage('legal-5.png')" alt="">
            <div class="desc two-line">{{ item.label }}</div>
          </div>
        </Vue3SeamlessScroll>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { getAssetsImage } from '@/utils/getImage';
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";

const activeKey = ref("1");
const studyList = [
  { id: '1', label: "邹某水污染违法行为强制执行案" },
  { id: '2', label: "某公司超标排放水污染物环保行政处罚案" },
  { id: '3', label: "某公司诉某区生态环境局、某区政府环保行政处罚及" },
  { id: '4', label: "四川省生态环境厅与某公司申请确认生态环境损害赔" },
  { id: '5', label: "王某某、雷某某非法捕捞水产品刑事附带民事公益诉" },
]
const caseList = [
  { id: '1',  time: "2024-09-10 12:35", label: "成都十大最佳！成都中院改革案例入选" },
  { id: '2',  time: "2024-09-10 14:05", label: "成都中院召开党组（扩大）会议，专题传达学习" },
  { id: '3',  time: "2024-09-10 12:00", label: "成都市中级人民法院关于2024年成都市法院系统" },
  { id: '4',  time: "2024-09-10 09:30", label: "成都中院传达学习贯彻张军院长来川来蓉调研精神" },
  { id: '5',  time: "2024-09-10 11:40", label: "邓修明在四川法院调研时强调：持续学深悟透做实." },
]
const judgeList = [
  { id: '1',  label: "群众需求系心头 为民服务解民忧" },
  { id: '2',  label: "她，是“双百政法英模”，更是贴心“闺女”、是“祝妈" },
  { id: '3',  label: "市政法英模先进事迹报告会举行，成都法院有他" },
  { id: '4',  label: "你好，“三多”法官" },
  { id: '5',  label: "争做司法审判“排头兵” 开创未成年人司法保护新局面" },
]
const informationList = [
  { id: '1',  time: "2024-09-10 12:35", label: "邹某水污染违法行为强制执行案" },
  { id: '2',  time: "2024-09-10 12:35", label: "某公司超标排放水污染物环保行政处罚案" },
  { id: '3',  time: "2024-09-10 12:35", label: "某公司诉某区生态环境局、某区政府环保行政处罚及" },
  { id: '4',  time: "2024-09-10 12:35", label: "四川省生态环境厅与某公司申请确认生态环境损害赔" },
  { id: '5',  time: "2024-09-10 12:35", label: "王某某、雷某某非法捕捞水产品刑事附带民事公益诉" },
]
const topXData = ref<string[]>([])
const topYData = ref<number[]>([])
const changeTopTimeFrame = ()=>{
  
}
</script>
<style lang="less" scoped>
  @import url('./right.less');
</style>