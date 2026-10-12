<template>
  <div >
    <SubPanelTemplate title="司法空间详细列表" class="product-table">
      <div class="tab-container">
        <Tabs :tabsList="tabState.tabList" v-model:active="tabState.active" @change="handleTabChange" />
      </div>
      <RollTable :column="product.column" :data="product.tableData" :showLength="20">
        <template #operate="{ record }">
        <div class="operate-row" @click="positioning(record)">
          定位
        </div>
      </template>
      </RollTable>
    </SubPanelTemplate>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import Tabs from './components/tabs.vue'
import bus from "@/utils/bus";
import {UeClient} from "@ghcloud/cube-visual-sdk";

const ueClient = UeClient.getInstance();

const handleTabChange=(value:string,item)=>{
}
const product = reactive({
  column: [
    {
      title: "空间名称",
      dataIndex: "name",
    },
    {
      title: "所在区域",
      dataIndex: "area",
    },
    {
      title: "操作",
      dataIndex: "operate",
      slots: {
        customRender: "operate",
      },
    },
  ],
  tableData: [
    {
      name: "小法庭（民事标准）",
      area: "办公1区",
    },
    {
      name: "小法庭（民事简易）",
      area: "办公1区",
    },
    {
      name: "大法庭",
      area: "办公1区",
    },
    {
      name: "家事法庭",
      area: "办公2区",
    },
    {
      name: "中法庭(民事多人)",
      area: "办公1区",
    },
    {
      name: "小法庭（刑事标准）",
      area: "办公2区",
    },
    {
      name: "小法庭（刑事简易）",
      area: "办公2区",
    },
    {
      name: "专案法庭",
      area: "办公1区",
    },
    {
      name: "指挥观摩室",
      area: "办公1区",
    },
    {
      name: "小法庭（民事标准）",
      area: "办公1区",
    },
    {
      name: "小法庭（民事简易）",
      area: "办公2区",
    },
    {
      name: "家事法庭",
      area: "办公1区",
    },
    {
      name: "中法庭(民事多人)",
      area: "办公3区",
    },
    {
      name: "大法庭",
      area: "办公1区",
    },
    {
      name: "小法庭（刑事标准）",
      area: "办公3区",
    },
    {
      name: "小法庭（刑事简易）",
      area: "办公3区",
    },
    {
      name: "专案法庭",
      area: "办公1区",
    },
    {
      name: "指挥观摩室",
      area: "办公2区",
    },
    {
      name: "大法庭",
      area: "办公1区",
    },
  ],
});
const tabState = reactive({
  active: 'court',
  tabList:[
    {
      label:'法院',
      value:'court',
      disabled:true
    },
    {
      label:'调解室',
      value:'mediation',
      disabled:true
    },
    {
      label:'诉服大厅',
      value:'litigation',
      disabled:true
    },
    {
      label:'信访大厅',
      value:'petition',
      disabled:true
    }
  ]
})
const positioning = (record) => {
  ueClient.send("getBimtree", { id: '' }, function (children) { 
    if (children.find(e=>e.name === '法院').name === '法院') {
      ueClient.send("getBimtree", { id: children.find(e=>e.name === '法院').id }, function (children) { 
        const list = children.slice(0, 5);
        list.forEach((item) => {
          ueClient.send("hideActor", { id: item.id });
        })
      })
      if (record.name === "小法庭（民事标准）") {
        ueClient.send("changeCameraView", {"location":{"x":1033.3263875245095,"y":-4950.979026460357,"z":1141.5020202958062},"rotation":{"pitch":-57.69044876098633,"yaw":271.04974365234375,"roll":0},"springArmLength":50});
      }else if (record.name === "小法庭（民事简易）") {
        ueClient.send("changeCameraView", {"location":{"x":501.6194486656428,"y":-4904.228883246828,"z":1420.9902879956621},"rotation":{"pitch":-58.566307067871094,"yaw":270.704833984375,"roll":0},"springArmLength":50});
      }else if (record.name === "大法庭") {
        ueClient.send("changeCameraView", {"location":{"x":4285.432856649272,"y":-3739.6979842611863,"z":1052.8342776312415},"rotation":{"pitch":-27.922977447509766,"yaw":267.9696044921875,"roll":0},"springArmLength":50});
      }
      
    }
  })

  bus.emit("setPanel", {
    rightPanelName:'courtSecurityRightPanel',
    leftPanelName:'courtSecurityLeftPanel'
  });
}
</script>
<style lang="less" scoped>
.tab-container {
  display: flex;
  padding-right: 14px;
  justify-self: flex-end;
  padding-bottom: 12px;
}
.operate-row {
    font-size: 12px;
    font-weight: Regular;
    text-align: center;
    color: #2989ff;
}
</style>