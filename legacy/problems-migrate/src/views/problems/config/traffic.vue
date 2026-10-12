<template>
  <g-layout :title="pageTitle">
    <template #content-table>
      <div class="detail-form">
        <a-form
          ref="areaTraffic"
          :model="areaModel"
          :rules="rules"
          layout="inline"
        >
          <div class="item-title">区域隐患管理人员配置</div>
          <!-- <a-form-item label="通知方式" name="noticeModes">
            <g-select
              v-model:value="areaModel.noticeModes"
              :mode="'multiple'"
              url="dangerNoticeMethod"
              :field="{ noticeModeName: 'label', noticeMode: 'value' }"
            ></g-select>
          </a-form-item> -->
          <a-form-item label="管理人员" class="a-form-item-100">
            <a-button type="primary" @click="areaAdd" class="mb2"
              >添加</a-button
            >
            <template v-for="(item, index) in areaModel.configs" :key="index">
              <ConfigForm
                :ref="(el) => setRefList(el, index)"
                :model="item"
                :index="index"
                :rules="configRules"
                @deleteItem="deleteArea"
                @changeItem="changeSelect"
                :length="areaModel.configs.length"
                :type="'areaModel'"
              ></ConfigForm>
            </template>
          </a-form-item>
        </a-form>
        <a-form
          ref="equipTraffic"
          :model="equipModel"
          :rules="rules"
          layout="inline"
        >
          <div class="item-title">设备隐患管理人员配置</div>
          <!-- <a-form-item label="通知方式" name="noticeModes">
            <g-select
              v-model:value="equipModel.noticeModes"
              :mode="'multiple'"
              url="dangerNoticeMethod"
              :field="{ noticeModeName: 'label', noticeMode: 'value' }"
            ></g-select>
          </a-form-item> -->
          <a-form-item label="管理人员" class="a-form-item-100">
            <a-button type="primary" class="mb2" @click="equipAdd"
              >添加</a-button
            >
            <template v-for="(item, index) in equipModel.configs" :key="index">
              <ConfigForm
                :ref="(el) => setRef(el, index)"
                :model="item"
                :index="index"
                :rules="configRules"
                @deleteItem="deleteEquip"
                @changeItem="changeSelect"
                :length="equipModel.configs.length"
                :type="'equipModel'"
              ></ConfigForm>
              <!-- <div class="mt2 flex-start">
                <div>
                  <g-select
                    :options="item.options"
                    v-model:value="item.mgmtType"
                    class="mr2"
                    :field="{
                      id: 'value',
                      name: 'label',
                      disabled: 'disabled',
                    }"
                    @change-check="
                      (value, option) =>
                        changeSelect(index, value, option, 'equipModel')
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
                  @click="deleteEquip(index)"
                ></MinusCircleOutlined>
              </div> -->
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
import _ from "lodash";
import ConfigForm from "./configForm.vue";
import { useRouter, useRoute } from "vue-router";
import { timeFormat, millennial } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  components: { MinusCircleOutlined, ConfigForm },
  setup() {
    const { pageTitle } = usePageName()
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const areaTraffic = ref();
    const equipTraffic = ref();
    const state = reactive({
      areaModel: {
        noticeModes: [],
        configs: [],
      },
      rules: {
        noticeModes: [{ required: true, message: "请选择通知方式" }],
      },
      equipModel: {
        noticeModes: [],
        configs: [],
      },
      configRules: {
        mgmtType: [{ required: true, message: "请选择管理人员类型" }],
        mgmtValues: [{ required: true, message: "请选择" }],
      },
      options: [
        { name: "管理人员", id: "MANAGEMENT", disabled: false },
        { name: "指定部门", id: "DEPARTMENT", disabled: false },
        { name: "指定岗位职责", id: "POST", disabled: false },
        { name: "指定人员", id: "PERSONNEL", disabled: false },
      ],
    });

    const configRefList = ref([]);
    const configRefList1 = ref([]);

    const setRefList = (el, index) => {
      configRefList1.value[index] = el;
    };
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
          configRefList1.value.forEach((item) => {
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

    const equipAdd = () => {
      if (state.equipModel.configs.length) {
        const valueRes = state.equipModel.configs.every(
          (item) =>
            (item.mgmtType && item.mgmtType === "MANAGEMENT") ||
            (item.mgmtType &&
              item.mgmtType !== "MANAGEMENT" &&
              item.mgmtValues?.length)
        );
        if (valueRes) {
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
          configRefList.value.forEach((item) => {
            item.formVali();
          });
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
      state[type].configs[index].mgmtValues = [];
      state[type].configs.splice(index + 1);
    };

    const getRes = async () => {
      let res1, res2;
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
            configRefList1.value.forEach((item) => {
              item.formVali();
            });
          }
        })
        .catch(() => {
          res1 = false;
        });
      await equipTraffic.value
        .validate()
        .then(() => {
          const valueRes = state.equipModel.configs.every(
            (item) =>
              (item.mgmtType && item.mgmtType === "MANAGEMENT") ||
              (item.mgmtType &&
                item.mgmtType !== "MANAGEMENT" &&
                item.mgmtValues?.length)
          );
          if (valueRes) {
            res2 = true;
          } else {
            configRefList.value.forEach((item) => {
              item.formVali();
            });
          }
        })
        .catch(() => {
          res2 = false;
        });
      if (res1 && res2) {
        return true;
      } else {
        return false;
      }
    };

    const save = async () => {
      const res = await getRes();
      if (res) {
        state.areaModel.noticeModes=[];
        state.equipModel.noticeModes=[];

        const params = [
          { category: "AREA", ...state.areaModel },
          { category: "DEVICE", ...state.equipModel },
        ];
        proxy.$api.dangerTrafConf(params, "post").then(() => {
          proxy.$message.success("操作成功");
          getConfig();
        });
      }
    };

    const getConfig = () => {
      proxy.$api.dangerTrafConfList().then((res) => {
        state.areaModel = res.filter((item) => item.category === "AREA").length
          ? res.filter((item) => item.category === "AREA")[0]
          : {
              noticeModes: [],
              configs: [],
            };
        state.areaModel.configs = state.areaModel.configs.filter((item) => {
          item.options = _.cloneDeep(state.options);
          // item.mgmtValues = item.mgmtValue ? item.mgmtValue.split("-") : [];
          return item;
        });
        state.equipModel = res.filter((item) => item.category === "DEVICE")
          .length
          ? res.filter((item) => item.category === "DEVICE")[0]
          : {
              noticeModes: [],
              configs: [],
            };
        state.equipModel.configs = state.equipModel.configs.filter((item) => {
          item.options = _.cloneDeep(state.options);
          // item.mgmtValues = item.mgmtValue ? item.mgmtValue.split("-") : [];
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
      setRefList,
      deleteArea,
      equipAdd,
      areaAdd,
      setRef,
      save,
      pageTitle
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
