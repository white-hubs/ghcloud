<template>
  <SubPanelTemplate title="电梯统计" class="supply-merchant">
    <displayPanel :bg-img="'overView16.png'" :content-list="contentList"></displayPanel>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import displayPanel from "@/components/businessPanel/public/display-panel.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import useCommon from "@/components/hooks/useCommon";

const contentList = ref<any[]>([]);
const { getEquipmentNumber } = useCommon();

const deviceDataInfo = async () => {
  let res: any = await getEquipmentNumber();
  if (!res.deviceNum) {
    return;
  }
  contentList.value = res.deviceGenreNums.map((item: any) => {
    return {
      name: item.genreName,
      value: item.num,
    };
  });
};

onMounted(() => {
  deviceDataInfo();
});
</script>

<style lang="less" scoped></style>
