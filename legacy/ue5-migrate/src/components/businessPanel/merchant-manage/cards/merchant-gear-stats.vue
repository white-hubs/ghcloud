<template>
  <SubPanelTemplate title="商户/档位统计">
    <div class="gear-position flex-center">
      <div class="gear-position-box" v-for="item in merchant" :key="item.name">
        <div class="gear-position-name">{{ item.name }}</div>
        <div class="gear-position-value">
          <CountTo :startVal="0" :endVal="item.value" :duration="2000" separator="" />
        </div>
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import { visualizationCount } from "@/api/merchant";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const merchant = ref([
  {
    name: "商户总数（个）",
    value: 0,
  },
  {
    name: "档位总数（个）",
    value: 0,
  },
]);

const getMerchantData = async () => {
  let res = await visualizationCount();
  merchant.value[0].value = res.merchantTotal;
  merchant.value[1].value = res.gearTotal;
};

onMounted(() => {
  getMerchantData();
});
</script>

<style lang="less" scoped>
.gear-position {
  .gear-position-box {
    width: 200px;

    .gear-position-name {
      font-size: 14px;
      color: #aaaaaa;
    }

    .gear-position-value {
      font-size: 18px;
      color: #fff;
      font-weight: bold;
    }
  }
}
</style>
