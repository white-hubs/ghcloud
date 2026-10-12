<template>
  <g-layout title="业务配置">
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
            <a-button type="primary" @click="areaAdd">添加</a-button>
            <template v-for="(item, index) in areaModel.configs" :key="index">
              <div class="mt2 flex-start">
                <div class="pr1">
                  <g-select
                    :options="item.options"
                    v-model:value="item.mgmtType"
                    class="mr1"
                    :field="{
                      id: 'value',
                      name: 'label',
                      disabled: 'disabled',
                    }"
                    @change-check="
                      (value, option) =>
                        changeSelect(index, value, option, 'areaModel')
                    "
                  ></g-select>
                  <template
                    v-if="item.mgmtType && item.mgmtType !== 'MANAGEMENT'"
                  >
                    <g-select
                      v-if="item.mgmtType === 'DEPARTMENT'"
                      v-model:value="item.mgmtValues"
                      placeholder="请选择部门"
                      :url="'getOrganizations'"
                      :mode="'multiple'"
                      :max="9"
                    ></g-select>
                    <g-select
                      v-if="item.mgmtType === 'POST'"
                      v-model:value="item.mgmtValues"
                      placeholder="请选择岗位"
                      :url="'position'"
                      :mode="'multiple'"
                      :params="{ pageSize: 1000, pageNumber: 1 }"
                      :max="9"
                    ></g-select>
                    <g-select
                      v-if="item.mgmtType === 'PERSONNAL'"
                      v-model:value="item.mgmtValues"
                      placeholder="请选择人员"
                      :url="'tenantUsers'"
                      :mode="'multiple'"
                      :params="{ pageSize: 1000, pageNumber: 1 }"
                      :max="9"
                    ></g-select>
                  </template>
                </div>
                <MinusCircleOutlined
                  @click="deleteArea(index)"
                ></MinusCircleOutlined>
              </div>
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
export default defineComponent({
  components: { MinusCircleOutlined },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const areaTraffic = ref();
    const state = reactive({
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
    });

    const areaAdd = () => {
      if (state.areaModel.configs.length) {
        const res = state.areaModel.configs.every((item) => item.mgmtType);
        if (res) {
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
          proxy.$message.warn("请将信息填写完整");
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
      state[type].configs.splice(index + 1);
    };

    const save = async () => {
      areaTraffic.value.validate().then(() => {
        proxy.$api.renovConfig(state.areaModel, "post").then(() => {
          proxy.$message.success("操作成功");
          getConfig();
        });
      });
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
      save,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");
</style>
