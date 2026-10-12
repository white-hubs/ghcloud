<template>
  <g-layout title="业务配置">
    <template #content-table>
      <div class="detail-form">
        <a-form ref="areaTraffic" :model="areaModel" :rules="areaRules">
          <div class="item-title">管理人员配置</div>
          <a-form-item label="通知方式" name="noticeModes">
            <g-select
              v-model:value="areaModel.noticeModes"
              :mode="'multiple'"
              url="dangerNoticeMethod"
              :field="{ noticeModeName: 'label', noticeMode: 'value' }"
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
                      v-if="item.mgmtType === 'PERSONNEL'"
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
        <a-form>
          <div class="item-title">提交配置</div>
          <a-form-item label="系统自动生成">
            <a-switch
              v-model:checked="areaModel.autoGenFault"
              checked-children="开启"
              un-checked-children="关闭"
            ></a-switch>
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
    const equipTraffic = ref();
    const state = reactive({
      areaModel: {
        noticeModes: [],
        configs: [],
        autoGenFault: false,
      },
      areaRules: {
        noticeModes: [{ required: true, message: "请选择通知方式" }],
      },
      options: [
        { name: "管理人员", id: "MANAGEMENT", disabled: false },
        { name: "指定部门", id: "DEPARTMENT", disabled: false },
        { name: "指定岗位职责", id: "POST", disabled: false },
        { name: "指定人员", id: "PERSONNEL", disabled: false },
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

    const equipAdd = () => {
      if (state.equipModel.configs.length) {
        const res = state.equipModel.configs.every((item) => item.mgmtType);
        if (res) {
          // 排除
          const checkedType = state.equipModel.configs.map(
            (item) => item.mgmtType
          );
          if (state.equipModel.configs.length >= state.options.length) {
            proxy.$message.warn("没有其他选项了");
            return;
          }
          state.equipModel.configs.push({
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
        state.equipModel.configs.push({
          mgmtType: "",
          mgmtValues: [],
          options: _.cloneDeep(state.options),
        });
      }
    };

    const deleteArea = (index) => {
      state.areaModel.configs.splice(index, 1);
    };
    const deleteEquip = (index) => {
      state.equipModel.configs.splice(index, 1);
    };

    const changeSelect = (index, value, option, type) => {
      state[type].configs.splice(index + 1);
    };

    const save = async () => {
      areaTraffic.value
        .validate()
        .then(() => {
          const params = { ...state.areaModel };
          proxy.$api.faultTrafficSet(params, "post").then(() => {
            proxy.$message.success("操作成功");
            getConfig();
          });
        })
        .catch(function(){});
    };

    const getConfig = () => {
      proxy.$api.faultTraffic().then((res) => {
        state.areaModel = res.length
          ? res[0]
          : {
              noticeModes: [],
              configs: [],
            };
        state.areaModel.configs = state.areaModel.configs.filter((item) => {
          item.options = _.cloneDeep(state.options);
          item.mgmtValues = item.mgmtValue ? item.mgmtValue.split("-") : [];
          return item;
        });
      });
    };

    onMounted(() => {
      getConfig();
    });

    return {
      areaTraffic,
      equipTraffic,
      ...toRefs(state),
      changeSelect,
      deleteEquip,
      deleteArea,
      equipAdd,
      areaAdd,
      save,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");
</style>
