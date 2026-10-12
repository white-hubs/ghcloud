<template>
  <gLayout :title="pageTitle">
    <template #content-table>
      <div class="channelBox">
        <div @click="configuration(item)" class="channelCard" v-for="item in thirdServiceList">
          <div style="font-size: 16px; font-weight: bold">{{ item.name }}</div>
        </div>
        <AliasManage />
        <PersonCellPhoneEncryption />
      </div>
    </template>
  </gLayout>
  <a-modal centered v-model:visible="showModal" :title="clickItem?.name ?? ''" @ok="handleOk" :confirmLoading="confirmLoading">
    <template v-if="clickItem">
      <a-form :label-col="{ style: { width: '120px !important' } }" :model="formState" ref="formRef">
        <a-form-item
          v-for="item in clickItem.variable"
          :key="item.key"
          :label="item.label"
          :name="item.key"
          :rules="[{ required: item.require ?? false, message: '请输入' }]"
        >
          <template v-if="item.component">
            <component
              :is="item.component"
              v-bind="item.componentProps ?? {}"
              v-model:value="formState[item.key]"
              v-model:checked="formState[item.key]"
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

import AliasManage from "./alias-manage/alias-manage.vue";
import PersonCellPhoneEncryption from "./person-cell-phone-encryption.vue";
import { ITEM_CODE, CONFIG } from "./service-configuation-config.ts";
import { cubeDictionaryService } from "@/api/service";

const confirmLoading = ref(false);
const formRef = ref();
const showModal = ref(false);
const formState = ref();
const thirdServiceList = ref<DictionaryTree[]>([]);
const baseInfo = ref({ id: "", name: "", code: "" });
const { pageTitle } = usePageName();
const clickItem = ref<{
  name: string;
  code: string;
  variable: {
    key: string;
    label: string;
    component?: string;
    componentProps?: Record<string, any>;
    require: boolean;
  }[];
}>();

const configuration = async (item: DictionaryTree) => {
  message.loading("获取配置中...");
  clickItem.value = CONFIG.find((e) => e.code === item.code) as {
    name: string;
    code: string;
    variable: {
      key: string;
      label: string;
      component?: string;
      componentProps?: Record<string, any>;
      require: boolean;
    }[];
  };
  const data = await cubeDictionaryService.getDataDictionaryById({ id: item.id as string });
  //初始化配置项(是否有新增key,有就加上)
  const variable = data.variable ? JSON.parse(data.variable) : {};
  const currentVariable = CONFIG.find((x) => x.code === item.code)?.variable ?? [];
  currentVariable.forEach((item) => {
    !Object.keys(variable).includes(item.key) && (variable[item.key] = item.defaultValue ?? undefined);
  });
  for (const item of currentVariable) {
    const value = variable[item.key];
    if (item.transferValue && value) {
      const transferValue = await item.transferValue(variable[item.key]);
      if (item.componentProps[transferValue.propsKey]) {
        item.componentProps[transferValue.propsKey] = transferValue.value;
      }
    }
  }
  formState.value = variable;
  baseInfo.value.id = data.id as string;
  baseInfo.value.name = data.name as string;
  baseInfo.value.code = data.code as string;
  showModal.value = true;
  confirmLoading.value = false;
  message.destroy();
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
        remarks: "系统通用业务配置",
      });
    }
    await getThirdService();
  } catch (error) {}
};
// 业务设置列表
const getThirdService = async () => {
  thirdServiceList.value = await cubeDictionaryService.getDictionaryByItem({ itemCode: ITEM_CODE });
  // 初始化业务服务项(如果没有，在字典中添加)
  let insertNewDictionary = false;
  const taskList: DictionaryTree[] = [];
  CONFIG.forEach(async (item) => {
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
  try {
    confirmLoading.value = true;
    await formRef.value.validate();
    const variable = JSON.stringify(formState.value);
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
    message.error("修改失败");
  } finally {
    confirmLoading.value = false;
  }
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

:deep(.content-table) {
  overflow: auto !important;
}

:deep(.layout-footer) {
  display: none;
}
</style>
