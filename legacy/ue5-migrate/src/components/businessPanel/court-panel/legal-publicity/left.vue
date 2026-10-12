<template>
    <div>
      <SubPanelTemplate title="党建要闻及制度">
        <div class="information">
            <div class="demoTab">
                <a-tabs v-model:activeKey="activeKey" style="position: absolute; right: 20px" >
                    <a-tab-pane key="1" tab="党建要闻"></a-tab-pane>
                    <a-tab-pane key="2" tab="党建规章制度" force-render></a-tab-pane>
                </a-tabs>
            </div>
            <div class="content">
                <img class="hostImg" :src="getAssetsImage('legal-1.png')" alt="">
                <div class="desc">
                    <div class="title">
                        <img class="icon" :src="getAssetsImage('legal-6.png')" alt="">
                        <div class="one-line">中央和国家机关部门机关党委书记学习贯彻习近平</div>
                    </div>
                    <div class="info">为及时对外发布、解读相关政策和建政策直通、增强政策认同感…</div>
                </div>
            </div>
            <div class="list">
                <Vue3SeamlessScroll :list="studyList" :step="0.5" hover :singleHeight="50" :waitTime="1000">
                    <div class="item two-line" v-for="item in informationList" :key="item.id">
                        {{ item.label }}
                        <!-- <p>{{ item.label }}</p> -->
                        <!-- <p>{{ item.time }}</p> -->
                    </div>
                </Vue3SeamlessScroll>
            </div>
        </div>
      </SubPanelTemplate>
      <SubPanelTemplate :title="'党组织活动'">
        <template #extra>
          <div>
            <DateInlineForm :timeList="timeList" v-model:modelValue="topTimeFrame" @search="changeTopTimeFrame"></DateInlineForm>
          </div>
        </template>
        <div class="activity-data">
            <PlanPie :pieData="activityList">
                <img :src="getAssetsImage('legal-2.png')" />
            </PlanPie>
            <elevatorAnalysisList :contentList="activityList"></elevatorAnalysisList>
        </div>
        <!-- <div class="activity">
            <div class="activity-title">近期活动</div>
            <div class="list">
                <Vue3SeamlessScroll :list="studyList" :step="0.5" hover :singleHeight="34" :waitTime="1000">
                    <div class="row one-line" v-for="(item, index) in studyList" :key="item.id">
                        <div class="num">{{ index + 1 }}</div>{{ item.label }}
                    </div>
                </Vue3SeamlessScroll>
            </div>
        </div> -->
      </SubPanelTemplate>
      <SubPanelTemplate title="党员考核统计分析">
        <div class="monitorPanelBox">
        <monitorPanel v-for="(item, index) in monitorPanelData" :key="item.name" :monitorPanelData="item"></monitorPanel>
        </div>
        <div class="elevator-analysis">
            <div class="chart">
                <elevator-analysis-pie :pieData="workList">
                <div style="color: #fff;text-align: center;font-size: 14px;">2171</div>
                <div style="color: #fff;text-align: center;font-size: 10px;">党员人数</div>
                </elevator-analysis-pie>
            </div>
            <elevatorAnalysisList :showRatio="true" :contentList="workList" class="pie_list"></elevatorAnalysisList>
            </div>
      </SubPanelTemplate>
    </div>
  </template>
  
<script setup lang="ts">
import { ref} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { getAssetsImage } from '@/utils/getImage';
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import monitorPanel from "@/components/businessPanel/court-panel/court-overview/components/monitor-panel.vue"
const activeKey = ref("1");
const topTimeFrame = ref({
    timeType:'quarter',
});
const timeList = [
    { label: "本月度", value: "mouth" },
    { label: "本季度", value: "quarter" },
    { label: "本年度", value: "year" },
]
const activityList = ref<{ name: string; value: number; color: string }[]>(
    [
        { name: "活动类型1", value: 30000, color: "#FFAB10" },
        { name: "活动类型2", value: 2000, color: "#2F8DFF" },
        { name: "活动类型3", value: 748, color: "#F14545" },
        { name: "活动类型4", value: 6000, color: "#19F8F7" },
        { name: "活动类型5", value: 6000, color: "#2AE8BD" },
    ]
);

const monitorPanelData = ref([
  {
    imgPath: 'legal-3.png',
    value: '20',
    unit: '个',
    name: '党支部数'
  },
  {
    imgPath: 'legal-4.png',
    value: '2151',
    unit: '个',
    name: '党员人数'
  },
])
const workList = ref([
  {
    name:'总分90-100',
    value:33,
    color:'#29C2FF'
  },
  {
    name:'总分80-90',
    value:13,
    color:'#FFAB10'
  },
  {
    name:'总分70-80',
    value:10,
    color:'#2989FF'
  },
  {
    name:'总分60-70',
    value:26,
    color:'#19F8F7'
  },
  {
    name:'60以下',
    value:18,
    color:'#2AE8BD'
  },
])
const studyList = [
  { id: '1', label: "中央和国家机关部门机关党委书记学习贯彻习近平…" },
  { id: '2', label: "紧紧依靠群众 真诚服务群众" },
  { id: '3', label: "凝神聚力抓改革促发展" },
  { id: '4', label: "深入学习贯彻习近平总书记关于社会工作的重要论述…" },
  { id: '5', label: "做好新时代流动党员管理工作的指导性文件" },
]
const informationList = [
  { id: '1',  time: "2024-09-10 12:35", label: "紧紧依靠群众 真诚服务群众" },
  { id: '2',  time: "2024-09-10 12:35", label: "凝神聚力抓改革促发展" },
  { id: '3',  time: "2024-09-10 12:35", label: "深入学习贯彻习近平总书记关于社会工作的重要论述…" },
  { id: '4',  time: "2024-09-10 12:35", label: "做好新时代流动党员管理工作的指导性文件" },
]
  const topXData = ref<string[]>([])
  const topYData = ref<number[]>([])
  const changeTopTimeFrame = ()=>{
    
  }
  </script>
  <style lang="less" scoped>
    @import url('./left.less');
  </style>