<template>
  <gLayout :title="pageTitle">
    <template #content-table>
      <div class="channelBox">
        <div
          @click="handleClick(item)"
          class="channelCard"
          v-for="item in thirdServiceList.filter((e) => THIRD_PART_CONFIG.find((ele) => ele.code === e.code))"
        >
          <div style="font-size: 16px; font-weight: bold">{{ item.name }}</div>
        </div>
      </div>
    </template>
  </gLayout>
  <a-modal
    centered
    v-model:visible="showModal"
    :title="clickItem?.name ?? ''"
    @ok="handleOk"
    :confirmLoading="confirmLoading"
    :destroyOnClose="true"
    width="600px"
    @cancel="handleCancel"
  >
    <template v-if="clickItem">
      <a-form
        :label-col="{ style: { width: '120px !important' } }"
        :model="formState"
        ref="formRef"
        style="max-height: 600px; padding-right: 10px; overflow-y: auto"
      >
        <a-form-item
          v-for="item in clickItem.variable"
          :key="item.key"
          :label="item.label"
          :name="item.key"
          :rules="[{ required: item.require ?? false, message: `请输入${item.label}` }]"
        >
          <template v-if="item.component">
            <component
              :is="item.component"
              v-bind="item.componentProps ?? {}"
              v-model:value="formState[item.key]"
              style="width: 100%"
            ></component>
          </template>
          <a-input v-model:value="formState[item.key]" :placeholder="item.componentProps?.placeholder ?? '请输入'" v-else />
        </a-form-item>
      </a-form>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import gLayout from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gLayout.vue";
import { message } from "ant-design-vue";
import { ref, onMounted } from "vue";

import type { DictionaryTree } from "@ghcloud/cube-dictionary-service/src/type";
import { usePageName } from "@ghcloud/cube-utils";

import { ITEM_CODE, THIRD_PART_CONFIG } from "./third-part-config";
import { useFormConfig } from "./use-form-config";
import { cubeDictionaryService } from "@/api/service";

const { pageTitle } = usePageName();
const { formState, clickItem, configuration } = useFormConfig();
const confirmLoading = ref(false);
const formRef = ref();
const showModal = ref(false);
const thirdServiceList = ref<DictionaryTree[]>([]);
const baseInfo = ref({ id: "", name: "", code: "" });
const handleClick = async (item: DictionaryTree) => {
  configuration(item).then((data) => {
    baseInfo.value.id = data.id as string;
    baseInfo.value.name = data.name as string;
    baseInfo.value.code = data.code as string;
    showModal.value = true;
    confirmLoading.value = false;
  });
};
//添加字典项
const getDictionaryItem = async (): Promise<void> => {
  try {
    const dictionaryItem = await cubeDictionaryService.getDictionaryItemByCode({
      code: ITEM_CODE,
    });
    if (!dictionaryItem) {
      await cubeDictionaryService.addDataDictionaryItem({
        code: ITEM_CODE,
        remarks: "第三方服务配置",
      });
    }
    await getThirdService();
  } catch (error) {}
};
// 第三方服务列表
const getThirdService = async () => {
  thirdServiceList.value = await cubeDictionaryService.getDictionaryByItem({ itemCode: ITEM_CODE });
  // 初始化第三方服务项(如果没有，在字典中添加)
  let insertNewDictionary = false;
  const taskList: DictionaryTree[] = [];
  THIRD_PART_CONFIG.forEach(async (item) => {
    const findItem = thirdServiceList.value.find((x) => x.code === item.code);
    if (!findItem) {
      taskList.push({
        code: item.code,
        itemCode: ITEM_CODE,
        name: item.name,
      });
      insertNewDictionary = true;
    } else {
      findItem.name = item.name;
    }
  });
  await Promise.all(
    taskList.map(async (e) => {
      await addDataDictionary(e);
    }),
  );
  if (insertNewDictionary) {
    thirdServiceList.value = await cubeDictionaryService.getDictionaryByItem({ itemCode: ITEM_CODE });
  }
};
//添加字典
const addDataDictionary = async (item: DictionaryTree) => {
  await cubeDictionaryService.addDataDictionary({
    code: item.code ?? "",
    itemCode: ITEM_CODE ?? "",
    name: item.name ?? "",
  });
};
const handleOk = async () => {
  let isValid = false;
  try {
    confirmLoading.value = true;
    await formRef.value.validate();
    isValid = true;
    let variable = JSON.stringify(formState.value);
    // todo: 为提测处理通讯服务层级问题
    if (baseInfo.value.code === "THIRD_SERVICE::correspond_service") {
      variable = JSON.stringify({
        providerCode: formState.value.providerCode ?? "",
        config: {
          ...formState.value,
        },
      });
    }
    await cubeDictionaryService.updateDataDictionary({
      id: baseInfo.value.id,
      name: baseInfo.value.name,
      code: baseInfo.value.code,
      variable: variable,
      version: "",
      remarks: "",
    });
    showModal.value = false;
    clickItem.value = undefined;
    message.success("修改成功");
  } catch (error) {
    isValid && message.error("修改失败");
  } finally {
    confirmLoading.value = false;
  }
};
const handleCancel = () => {
  showModal.value = false;
  formState.value = undefined;
  clickItem.value = undefined;
};
onMounted(() => {
  getDictionaryItem();
});
</script>

<style scoped lang="less">
.channelBox {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  .channelCard {
    cursor: pointer;
    width: 270px;
    height: 150px;
    margin: 0 50px 20px 0;
    background-color: rgb(242, 242, 242);
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
  }
}
</style>
