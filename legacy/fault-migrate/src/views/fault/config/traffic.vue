<template>
  <g-layout :title="pageTitle">
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
            <a-button type="primary" class="mb2" @click="areaAdd"
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
              ></ConfigForm>
            </template>
          </a-form-item>
        </a-form>
        <a-form :model="faultOrderConfig" :rules="switchRules" ref="switchRef">
          <div class="item-title">提交配置</div>
          <a-form-item label="系统自动生成">
            <a-switch
              v-model:checked="faultOrderConfig.autoFault"
              @change="switchchange"
              checked-children="开启"
              un-checked-children="关闭"
            ></a-switch>
          </a-form-item>
          <template v-if="faultOrderConfig?.autoFault">
            <a-form-item label="状态持续时间" name="duration">
              <a-input
                v-model:value="faultOrderConfig.duration"
                :suffix="'秒'"
              ></a-input>
            </a-form-item>
            <a-form-item label="去重周期" name="deDuplicationPeriod">
              <a-input
                v-model:value="faultOrderConfig.deDuplicationPeriod"
                :suffix="'小时'"
              ></a-input>
            </a-form-item>
          </template>
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
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  components: { MinusCircleOutlined, ConfigForm },
  setup() {
    const { pageTitle } = usePageName()
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const switchRef = ref();
    const areaTraffic = ref();
    const equipTraffic = ref();
    const state = reactive({
      areaModel: {
        // noticeModes: [],
        configs: [],
      },
      faultOrderConfig: {
        duration: "",
        autoFault: false,
        deDuplicationPeriod: "",
      },
      areaRules: {
        // noticeModes: [{ required: true, message: "请选择通知方式" }],
      },
      switchRules: {
        duration: [
          { required: true, message: "请填写状态持续时间" },
          {
            pattern: new RegExp(/^[+]{0,1}(\d+)$/, "g"),
            message: "请输入正整数",
          },
        ],
        deDuplicationPeriod: [
          { required: true, message: "请填写去重周期" },
          {
            pattern: new RegExp(/^[+]{0,1}(\d+)$/, "g"),
            message: "请输入正整数",
          },
        ],
      },
      options: [
        { name: "管理人员", id: "MANAGEMENT", disabled: false },
        { name: "指定部门", id: "DEPARTMENT", disabled: false },
        { name: "指定岗位职责", id: "POST", disabled: false },
        { name: "指定人员", id: "PERSONNEL", disabled: false },
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
            configRefList.value.forEach((item) => {
              item.formVali();
            });
          }
        })
        .catch(() => {
          res1 = false;
        });
      await switchRef.value
        .validate()
        .then(() => {
          res2 = true;
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
        const params = {
          ...state.areaModel,
          faultOrderConfig: state.faultOrderConfig,
        };
        
        delete params.faultOrderConfigVo;
        proxy.$api.faultTrafficSet(params, "post").then(() => {
          proxy.$message.success("操作成功");
          state.faultOrderConfig.deDuplicationPeriod=''
          state.faultOrderConfig.duration=''
          getConfig();
        });
      }
    };

    const getConfig = () => {
      proxy.$api.faultTraffic().then((res) => {
        state.areaModel = res.length
          ? res[0]
          : {
              // noticeModes: [],
              configs: [],
            };
        state.faultOrderConfig = res.length
          ? res[0].faultOrderConfigVo
            ? res[0].faultOrderConfigVo
            : {
                // noticeModes: [],
                faultOrderConfig: {
                  duration: "",
                  autoFault: false,
                  deDuplicationPeriod: "",
                },
              }
          : {
              // noticeModes: [],
              faultOrderConfig: {
                duration: "",
                autoFault: false,
                deDuplicationPeriod: "",
              },
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

    const switchchange=(data)=>{
    if(data){
     state.faultOrderConfig.deDuplicationPeriod=''
          state.faultOrderConfig.duration=''
    }
    
    }
    return {
      switchchange,
      switchRef,
      areaTraffic,
      equipTraffic,
      ...toRefs(state),
      changeSelect,
      deleteArea,
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
