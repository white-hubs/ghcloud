<template>
  <g-layout :title="pageTitle ?? '业务配置'">
    <template #content-table>
      <div class="detail-form">
        <a-form ref="areaTraffic" :model="areaModel" :rules="areaRules">
          <div class="item-title">更新改造管理人员配置</div>
          <a-form-item label="通知方式" name="channelTypes">
            <g-select
              v-model:value="areaModel.channelTypes"
              :mode="'multiple'"
              url="messageEnum"
              :field="{ nodeModelName: 'label', notModel: 'value' }"
            ></g-select>
          </a-form-item>
          <a-form-item label="管理人员">
            <a-button type="primary" @click="areaAdd" class="mb2"
              >添加</a-button
            >
            <template v-for="(item, index) in areaModel.configs" :key="index">
              <ConfigForm
                :model="item"
                :index="index"
                :type="'areaModel'"
                :rules="configRules"
                @deleteItem="deleteArea"
                @changeItem="changeSelect"
                :ref="(el) => setRef(el, index)"
              >
              </ConfigForm>
            </template>
          </a-form-item>
        </a-form>
      </div>
    </template>
    <template #footer-page>
      <a-button type="primary" @click="save"> 保存</a-button>
    </template>
  </g-layout>
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
import { timeFormat, millennial } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import { useRouter, useRoute } from "vue-router";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons-vue";
import _ from "lodash";
import ConfigForm from "./configForm.vue";
import { usePageName} from '@ghcloud/cube-utils'

export default defineComponent({
  components: { MinusCircleOutlined, ConfigForm },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const areaTraffic = ref();
    const { pageTitle } = usePageName()
    const state = reactive({
      pageTitle: pageTitle,
      areaModel: {
        id: "",
        channelTypes: [],
        configs: [],
      },
      areaRules: {
        channelTypes: [{ required: true, message: "请选择通知方式" }],
      },
      options: [
        { name: "管理人员", id: "MANAGEMENT", disabled: false },
        { name: "指定部门", id: "DEPARTMENT", disabled: false },
        { name: "指定岗位职责", id: "POST", disabled: false },
        { name: "指定人员", id: "PERSONNAL", disabled: false },
      ],
      configRules: {
        mgmtType: [{ required: true, message: "请选择管理人员类型" }],
        mgmtValues: [{ required: true, message: "请选择" }],
      },
    });

    const configRefList = ref([]);
    const setRef = (el, index) => {
      configRefList.value[index] = el;
    };

    const areaAdd = () => {
      if (state.areaModel.configs.length) {
        const valueRes = state.areaModel.configs.every(
          (item) =>
            (item.mgmtType && item.mgmtType === "MANAGEMENT") ||
            (item.mgmtType &&
              item.mgmtType !== "MANAGEMENT" &&
              item.mgmtValues?.length)
        );
        if (valueRes) {
          // 排除
          const checkedType = state.areaModel.configs.map(
            (item) => item.mgmtType
          );
          if (state.areaModel.configs.length >= state.options.length) {
            proxy.$message.warn("没有其他选项了");
            return;
          }
          state.areaModel.configs.push({
            mgmtType: "",
            mgmtValues: [],
            options: _.cloneDeep(state.options).filter((item) => {
              if (checkedType.includes(item.id)) {
                item.disabled = true;
              } else {
                item.disabled = false;
              }
              return item;
            }),
          });
        } else {
          configRefList.value.forEach((item) => {
            item.formVali();
          });
        }
      } else {
        state.areaModel.configs.push({
          mgmtType: "",
          mgmtValues: [],
          options: _.cloneDeep(state.options),
        });
      }
    };

    const deleteArea = (index) => {
      state.areaModel.configs.splice(index, 1);
    };

    const changeSelect = (index, value, option, type) => {
      state[type].configs[index].mgmtValues = [];
      state[type].configs.splice(index + 1);
    };

    const getRes = async () => {
      let res1;
      await areaTraffic.value
        .validate()
        .then(() => {
          const valueRes = state.areaModel.configs.every(
            (item) =>
              (item.mgmtType && item.mgmtType === "MANAGEMENT") ||
              (item.mgmtType &&
                item.mgmtType !== "MANAGEMENT" &&
                item.mgmtValues?.length)
          );
          if (valueRes) {
            res1 = true;
          } else {
            configRefList.value.forEach((item) => {
              item.formVali();
            });
          }
        })
        .catch(() => {
          res1 = false;
        });
      return res1;
    };

    const save = async () => {
      const res = await getRes();
      if (res) {
        proxy.$api.renovConfig(state.areaModel, "post").then(() => {
          proxy.$message.success("操作成功");
          getConfig();
        });
      }
    };

    const getConfig = () => {
      proxy.$api.getRenovConfig().then(async (res) => {
        if (res) {
          state.areaModel = res;
          state.areaModel.configs = state.areaModel.configs.filter(
            async (item) => {
              Object.assign(item, { options: _.cloneDeep(state.options) });
              return item;
            }
          );
        } else {
          state.areaModel = {
            id: "",
            channelTypes: [],
            configs: [],
          };
        }
      });
    };

    onMounted(() => {
      getConfig();
    });

    return {
      areaTraffic,
      ...toRefs(state),
      changeSelect,
      deleteArea,
      areaAdd,
      setRef,
      save,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");
:deep(.ant-form#configForm) {
  display: grid;
  grid-template-columns: repeat(3, 180px);
  grid-column-gap: 16px;
  .ant-form-item {
    width: 100%;
  }
}
</style>
