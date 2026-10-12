<template>
  <GLayout :title="pageTitle" class="msg-config">
    <template #content-table>
      <Tabs v-model:activeKey="activeKey" type="card" @change="handleTabChange">
        <TabPane v-for="(item, i) in tabs" :key="i" :tab="item.title" force-render>
          <MsgConfigItem ref="msgConfigItems" :business-type="item.businessType" :config="config" :label="item.title" />
        </TabPane>
      </Tabs>
    </template>
    <template #footer-page>
      <Button :loading="subLoading" type="primary" @click="save">保存</Button>
    </template>
  </GLayout>
</template>

<script lang="ts" setup>
import { message } from "ant-design-vue";
import { onMounted, ref } from "vue";

import { useListQueryCache, usePageName } from "@ghcloud/cube-utils";

import { getMessageConfigInfo, saveMessageConfig } from "@/api/asset-management/asset-management";
import type { SceneConfigDTO } from "@/api/asset-management/types";
import GLayout from "@/components/common/g-layout.vue";
import MsgConfigItem from "@/views/system-config/component/msg-config-item.vue";
interface MsgConfigItemComponent {
  getData: () => {
    businessType: string;
    data: SceneConfigDTO[];
  };
}
const { pageTitle } = usePageName();
const tabs = [
  { businessType: "INVENTORY_TASK", title: "盘点任务" },
  { businessType: "MAINTENANCE_OVERDUE_ABOUT", title: "距离资产维保到期" },
  { businessType: "MAINTENANCE_OVERDUE", title: "资产维保到期已过" },
  { businessType: "OPERATE_OVERDUE_ABOUT", title: "距离资产使用到期" },
  { businessType: "OPERATE_OVERDUE", title: "资产使用期限已过" },
  { businessType: "CONSUMABLE_LOWER", title: "耗材库存低于下限" },
  { businessType: "CONSUMABLE_UPPER", title: "耗材库存高于上限" },
];
const activeKey = ref(0);
const queryCache = useListQueryCache({
  defaults: {
    activeKey: 0,
  },
  getState: () => ({
    activeKey: activeKey.value,
  }),
  setState: (next) => {
    activeKey.value = Number(next.activeKey ?? 0);
  },
});
const handleTabChange = (): void => {
  queryCache.sync();
};
const subLoading = ref(false);
const msgConfigItems = ref<MsgConfigItemComponent[]>([]);
const save = async () => {
  const sceneConfigDTOS: SceneConfigDTO[] = [];
  msgConfigItems.value.forEach((element) => {
    const itemData = element.getData().data;
    sceneConfigDTOS.push(...itemData);
  });

  try {
    subLoading.value = true;
    await saveMessageConfig({
      businessType: "PROPERTY",
      sceneConfigDTOS: sceneConfigDTOS,
    });
    message.success("操作成功");
  } catch (error) {
  } finally {
    setTimeout(() => {
      subLoading.value = false;
    }, 500);
  }
};

const config = ref<SceneConfigDTO[]>([]);
onMounted(async () => {
  await queryCache.hydrate();
  const res = await getMessageConfigInfo({ businessType: "PROPERTY" });
  if (res.data) {
    config.value = res.data as SceneConfigDTO[];
  }
  // const res = await queryByBusinessType()
  // if (res.data?.conditions.length) {
  //   const data: unknown[] = []
  //   res.data.conditions.forEach(e => {
  //     data.push(...e)
  //   })
  //   config.value = data
  // }
});
</script>

<style lang="less" scoped>
:deep(.content-table) {
  overflow: overlay !important;
}
</style>
