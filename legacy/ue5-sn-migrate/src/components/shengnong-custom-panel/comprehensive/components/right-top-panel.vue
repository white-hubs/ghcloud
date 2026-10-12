<template>
  <SubPanelTemplate title="风险源统计" image="r-c1.png">
  <div class='risk'>
    <ratioList
      :list-data="ratioListData"
      @openmodal="handleClick"
      type="card"
    />
  </div>
</SubPanelTemplate>
<modal-table :show="showModal" :title="`风险源统计【${curName}】`" @close="close" width="1200px">
  <modal-record
    :periodtime="''"
    :marketName="piniaStoreMarket.currentMarketName"
    :parameter="parameter"
    :showClass="showClass"
    v-if="showModal"
  ></modal-record>
</modal-table>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted} from 'vue'
import SubPanelTemplate from "../../common/snPanelTemplate.vue";
import { storeMarket } from "@/piniaStore/other";
import ratioList from "../../common/ratiolist.vue";
import { propertyFilingStatistics } from '@/api/shennong/compre';
import modalTable from "@/components/modal-table/modal.vue";
import ModalRecord from "@/components/shengnong-custom-panel/gasPanel/gastable.vue";
import { subMenuProps } from 'ant-design-vue/lib/menu/src/SubMenu';

const props = withDefaults(
  defineProps<{
    applicationCode: string;
  }>(),
  {
    applicationCode: "",
  }
);
const piniaStoreMarket = storeMarket();
const ratioListData = ref([
  {
    iconImg: "a-c1.png",
    label: "消防设备数",
    value: 0,
    color: "#FFC7C6",
    unit: "个",
  },

  {
    iconImg: "a-c2.png",
    label: "电动车数",
    value: 0,
    color: "#B6CAF3",
    unit: "个",
  },
  {
    iconImg: "a-c3.png",
    label: "氧气瓶数",
    value: 0,
    color: "#FFEBC6",
    unit: "个",
  },
]);
const getData = async () => {
  let param = {
    marketTenant: '',
  };
  const data = await propertyFilingStatistics(param)
  ratioListData.value[0].value = data.fireFightingEquipmentNum;
  ratioListData.value[1].value = data.electricVehicleNum;
  ratioListData.value[2].value = data.flammableEquipmentNum;
};

const showModal = ref(false);
const curName = ref();
const parameter = reactive({});
const labelMap = new Map([
  ["易燃设备数", "FLAMMABLE_EQUIPMENT"],
  ["电动车数", "ELECTRO_MOBILE"],
  ["氧气瓶数", "OXYGEN_CYLINDER"],
  ["消防设备数", "FIRE_FIGHTING_EQUIPMENT"],
])
const showClass = ref(false)
const handleClick = (data) => {
  curName.value = data.label
  const type = labelMap.get(data.label) ?? ''
  if (['OXYGEN_CYLINDER', 'ELECTRO_MOBILE'].includes(type)) {
    Object.assign(parameter, {
      type: '',
      subType: type
    })
    showClass.value = true
  } else {
    Object.assign(parameter, {
      type: type,
      subType: ''
    })
    showClass.value = false
  }
  showModal.value = true;
};
const close = () => {
  showModal.value = false;
};
onMounted(() => {
  getData();
});

</script>
<style lang="less" scoped>
.chart {
  flex: 1;
  height: 260px !important;
}
</style>