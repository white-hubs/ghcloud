<template lang="pug">
g-layout(
  title="收费规则")
  template(#header-btn)
    a-button(type="primary" @click="openModal") 复制计费规则
  template(#content-left)
    .treeTitle.pb1.pl1 车辆类型
    Tree(
      :url="'carTypeOther'" 
      :fieldNames="fieldNames" 
      :mode="false"
      @getClickNode="getClickNode")
  template(#content-table) 
    a-form(ref="form" :model="model" :rules="rules" v-if="model.carTypeId")
      a-form-item(label="收费模式" name="ruleCategory")
        a-radio-group(v-model:value="model.ruleCategory")
          a-radio(:value="'TIME_SHARING_CHARGE'") 分时收费
          //- a-radio(:value="'SECTIONAL_FIXED_CHARGE'") 分段固定收费
          //- a-radio(:value="'SEGMENTED_DYNAMIC_CHARGE'") 分段动态收费
      a-form-item(label="免费时长" name="freeDuration")
        a-input(v-model:value="model.freeDuration" placeholder="请输入免费时长"  style="width:180px" addon-after="分钟")
      div.title.mb2.pb1.flex.justify-between
        span 收费规则  
        a-button(@click="add" type="primary" v-if="model.ruleCategory !== 'TIME_SHARING_CHARGE'") 添加规则
      template(v-if="model.ruleCategory === 'TIME_SHARING_CHARGE'")
        div.rulesGroup
          a-form(ref="timeRulesRef" :model="model" :rules="rules" layout="inline")
            a-form-item(label="每满" name="duration")
              a-input(addon-after="小时" style="width:180px" v-model:value="model.duration")
            a-form-item(label="收费" name="durationFee")
                a-input(addon-after="元" style="width:180px" v-model:value="model.durationFee")
      template(v-else)
        div.rulesGroup
          a-form(ref="itemRef" :model="model" :rules="rules" layout="inline")
            a-form-item(label="" name="duration")
              a-input(v-model:value="model.duration" style="width: 180px")
              //- span.pl1.pr1 小时内，{{model.ruleCategory === 'SEGMENTED_DYNAMIC_CHARGE' ? '每小时收费' : '收费'}}：
            a-form-item(:label="`小时内，${model.ruleCategory === 'SEGMENTED_DYNAMIC_CHARGE' ? '每小时收费' : '收费'}`")  
            a-form-item(label="" name="durationFee")  
              a-input(addon-after="元" v-model:value="model.durationFee" style="width: 180px")
        template(v-if="model.ruleCategory === 'SECTIONAL_FIXED_CHARGE'")
          template(v-for="item,index in fixedRules")
            div.rulesGroup
              rulesGroup(
                :linkWords="'收费'" 
                :baseData="item" 
                :index="index"
                :length="fixedRules.length" 
                @delete-data="deleteFixed" 
                :ref="el=> setFixedRef(el,index)" 
                @change-status="changeFixedStatus")
        template(v-if="model.ruleCategory==='SEGMENTED_DYNAMIC_CHARGE'")
          //- a-form-item(label="")
            a-input(v-model:value="model.duration" style="width: 180px")
            span.pl1.pr1 小时内，每小时收费：
            a-input(addon-after="元" v-model:value="model.durationFee" style="width: 180px")
          template(v-for="item,index in dynamicData")
            div.rulesGroup
              rulesGroup(
                :linkWords="'每小时收费'" 
                :baseData="item" 
                :index="index" 
                :length="dynamicData.length" 
                @delete-data="deleteItem" 
                :ref="el=> setRef(el,index)" 
                @change-status="changeStatus")
      a-form-item(label="每天最高收费" name="durationFeeMax")
          a-input(addon-after="元" style="width:180px" v-model:value="model.durationFeeMax")
    a-empty(description="请选择车辆类型" v-else)     
  template(#footer-page)   
    a-button(type="primary" @click="save" :disabled="!model.carTypeId") 保存
  a-modal(v-model:visible="visible" title="复制计费规则" centered @ok="modalSave" @cancel="modalCancel" :width="500")  
    a-form(ref="modalForm" :model="formModal" :rules="modalRules")
      a-form-item(label="已设置计费规则车型" name="copyCardTypeId")
        g-select(v-model:value="formModal.copyCardTypeId" :placeholder="'请选择已设置计费规则车型'" :url="'rulesVeh'" :field="{carTypeName: 'label', carTypeId: 'value'}")
      a-form-item(label="应用车型" name="carTypeIds" v-if="formModal.copyCardTypeId")
        a-checkbox-group(v-model:value="formModal.carTypeIds")
          div.checkboxCtr
            template(v-for="item in carList" :key="item.id")
              a-checkbox(:value="item.id" :disabled="item.id === formModal.copyCardTypeId") {{item.carTypeName}}

</template>

<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  reactive,
  toRefs,
  watch,
  ref,
} from "vue";
import { millennial, timeFormat } from "@/utils/common";

import rulesGroup from "./rulesGroup.vue";
export default defineComponent({
  components: { rulesGroup },
  setup() {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      model: {
        id: "",
        ruleCategory: "TIME_SHARING_CHARGE",
        carTypeId: "",
        duration: "",
        durationFee: "",
        freeDuration: "",
        durationFeeMax: "",
        enabled: true,
      },
      rules: {
        ruleCategory: [{ required: true, message: "请选择收费模式" }],
        freeDuration: [
          { required: true, message: "请输入免费时长" },
          {
            pattern: new RegExp(/^[+]{0,1}(\d+)$/, "g"),
            message: "请输入正整数(包含0)",
          },
        ],
        durationFeeMax: [
          { required: true, message: "请输入最高收费金额" },
          {
            pattern: new RegExp(/^\d+(\.\d{0,2})?$/, "g"),
            message: "请输入正确的金额(最多两位小数)",
          },
        ],
        duration: [
          { required: true, message: "请输入时长(小于24的正整数)" },
          {
            pattern: new RegExp(/^[+]{0,1}(\d+)$/, "g"),
            message: "请输入正整数(包含0)",
          },
        ],
        durationFee: [
          { required: true, message: "请输入收费金额" },
          {
            pattern: new RegExp(/^\d+(\.\d{0,2})?$/, "g"),
            message: "请输入正确的金额(最多两位小数)",
          },
        ],
      },
      fieldNames: {
        children: "children",
        label: "carTypeName",
        key: "id",
      },
      // { durationStart: "", durationEnd: "", durationFee: "" },
      dynamicData: [],
      fixedRules: [],
      visible: false,
      modalRules: {
        copyCardTypeId: [{ required: true, message: "请选择计费规则基础车型" }],
        carTypeIds: [{ required: true, message: "请选择应用车型" }],
      },
      formModal: {
        copyCardTypeId: "",
        carTypeIds: [],
      },
      carList: [],
    });

    const form = ref();
    const refs = ref([]);
    const itemRef = ref();
    const modalForm = ref();
    const fixedRefs = ref([]);
    const timeRulesRef = ref();

    const setRef = (rule, index) => {
      refs.value[index] = rule;
    };

    const setFixedRef = (rule, index) => {
      fixedRefs.value[index] = rule;
    };

    const getData = (key) => {
      proxy.$api.getChargeRules(key,"get" ).then((res) => {
        if (res.length) {
          const data = res.filter((item) => item.enabled);
          state.model = data[0];
          if (data.ruleCategory === "SEGMENTED_DYNAMIC_CHARGE") {
            state.dynamicData = data.parkingChargeRuleDetailVOS;
          } else if (data.ruleCategory === "SECTIONAL_FIXED_CHARGE") {
            state.fixedRules = data.parkingChargeRuleDetailVOS;
          }
        } else {
          state.model.id = "";
          state.model.ruleCategory = "TIME_SHARING_CHARGE";
          state.model.duration = "";
          state.model.durationFee = "";
          state.model.freeDuration = "";
          state.model.durationFeeMax = "";
          state.model.enabled = true;
        }
      });
    };

    const getCarList = () => {
      proxy.$api.carTypeOther(null,"get").then((res) => {
        state.carList = res;
      });
    };

    const getCategoryData = (car, cate) => {
      proxy.$api
        .vehChargeRules({ carTypeId: car, ruleCategory: cate },"get" )
        .then((res) => {
          if (typeof res === "object") {
            state.model = res;
            if (res.ruleCategory === "SEGMENTED_DYNAMIC_CHARGE") {
              state.dynamicData = res.parkingChargeRuleDetailVOS;
            } else if (res.ruleCategory === "SECTIONAL_FIXED_CHARGE") {
              state.fixedRules = res.parkingChargeRuleDetailVOS;
            }
          }
        });
    };

    const getClickNode = (selected, node) => {
      // dataRef为选中节点原始数据,node.eventKey为设置的数据的key值
      if (selected) {
        state.model.carTypeId = node.eventKey;
        getData(node.eventKey);
      } else {
        state.model.carTypeId = "";
      }
    };

    const save = () => {
      form.value
        .validate()
        .then(() => {
          if (state.model.ruleCategory === "SEGMENTED_DYNAMIC_CHARGE") {
            let res = state.dynamicData.every((item) => item.status);
            if (res) {
              // 保存操作
              const params = {
                ...state.model,
                parkingChargeRuleDetailModifyParam: state.dynamicData,
                enabled: true,
              };
              proxy.$api.chargeRules(params,"post").then(() => {
                proxy.$message.success("操作成功");
              });
            } else {
              refs.value.forEach((item) => {
                item.formVal();
              });
            }
          } else if (state.model.ruleCategory === "SECTIONAL_FIXED_CHARGE") {
            let res = state.fixedRules.every((item) => item.status);
            if (res) {
              const params = {
                ...state.model,
                parkingChargeRuleDetailModifyParam: state.fixedRules,
                enabled: true,
              };
              // 操作
              proxy.$api.chargeRules(params,"post").then(() => {
                proxy.$message.success("操作成功");
              });
            } else {
              fixedRefs.value.forEach((item) => {
                item.formVal();
              });
            }
          } else {
            timeRulesRef.value.validate().then(() => {
              const params = {
                ...state.model,
                // parkingChargeRuleDetailModifyParam: [],
                enabled: true,
              };
              proxy.$api.chargeRules(params,"post").then(() => {
                proxy.$message.success("操作成功");
              });
            });
          }
        })
        .catch(() => {
          if (state.model.ruleCategory === "SEGMENTED_DYNAMIC_CHARGE") {
            refs.value.forEach((item) => {
              item.formVal();
            });
          } else if (state.model.ruleCategory === "SECTIONAL_FIXED_CHARGE") {
            fixedRefs.value.forEach((item) => {
              item.formVal();
            });
          } else {
            timeRulesRef.value.validate().then(function(){});
          }
        });
    };

    const add = () => {
      // 初始值
      itemRef.value.validate().then(() => {
        if (state.model.ruleCategory === "SEGMENTED_DYNAMIC_CHARGE") {
          if (state.dynamicData.length) {
            let res = state.dynamicData.every((item) => item.status);
            if (res) {
              state.dynamicData.push({
                durationStart:
                  state.dynamicData[state.dynamicData.length - 1].durationEnd,
                durationEnd: "",
                durationFee: "",
                status: false,
                ruleId: "",
              });
            } else {
              refs.value.forEach((item) => {
                item.formVal();
              });
            }
          } else {
            state.dynamicData.push({
              durationStart: state.model.duration,
              durationEnd: "",
              durationFee: "",
              status: false,
              ruleId: "",
            });
          }
        } else {
          if (state.fixedRules.length) {
            let res = state.fixedRules.every((item) => item.status);
            if (res) {
              state.fixedRules.push({
                durationStart:
                  state.fixedRules[state.fixedRules.length - 1].durationEnd,
                durationEnd: "",
                durationFee: "",
                status: false,
                ruleId: "",
              });
            } else {
              fixedRefs.value.forEach((item) => {
                item.formVal();
              });
            }
          } else {
            state.fixedRules.push({
              durationStart: state.model.duration,
              durationEnd: "",
              durationFee: "",
              status: false,
              ruleId: "",
            });
          }
        }
      });
    };

    const deleteItem = (index) => {
      state.dynamicData.splice(index, 1);
    };

    const changeStatus = (status, index) => {
      state.dynamicData[index].status = status;
      state.dynamicData.splice(index + 1);
    };

    const deleteFixed = (index) => {
      state.fixedRules.splice(index, 1);
    };

    const changeFixedStatus = (status, index) => {
      state.fixedRules[index].status = status;
      state.fixedRules.splice(index + 1);
    };

    const openModal = () => {
      state.visible = true;
      getCarList();
    };
    const modalSave = () => {
      modalForm.value.validate().then(() => {
        proxy.$api.rulesCopy(state.formModal,"post" ).then(() => {
          proxy.$message.success("操作成功");
          modalCancel();
        });
      });
    };
    const modalCancel = () => {
      modalForm.value.resetFields();
      // modalForm.value.clearValidate();
      state.visible = false;
    };

    watch(
      () => state.model.duration,
      (n, o) => {
        if (n !== o) {
          state.dynamicData = [];
          state.fixedRules = [];
        }
      }
    );
    watch(
      () => state.model.ruleCategory,
      () => {
        form.value.clearValidate();
        state.model.duration = "";
        state.model.durationFee = "";
        state.model.freeDuration = "";
        state.model.durationFeeMax = "";
        // 获取数据
        getCategoryData(state.model.carTypeId, state.model.ruleCategory);
      }
    );
    watch(
      () => state.formModal.copyCardTypeId,
      (n, o) => {
        if (n !== o) {
          state.formModal.carTypeIds = [];
        }
      }
    );
    return {
      refs,
      form,
      itemRef,
      fixedRefs,
      modalForm,
      timeRulesRef,
      ...toRefs(state),
      changeFixedStatus,
      changeStatus,
      getClickNode,
      setFixedRef,
      deleteFixed,
      modalCancel,
      deleteItem,
      openModal,
      modalSave,
      setRef,
      save,
      add,
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.content-left) {
  width: 200px;
  position: relative;
  border-right: 1px solid #f3f3f3;
  text-align: left;
  padding-right: 16px;
  .ant-tree-switcher {
    display: none;
  }
  .treeTitle {
    width: 100%;
    height: 32px;
    line-height: 32px;
    font-weight: bold;
    background-color: #f3f3f3;
  }
}

:deep(.content-right) {
  position: relative;
  .content-table {
    padding: 0 16px;
  }
}
:deep(.ant-form) {
  text-align: left;
  .rulesGroup {
    height: 56px;
  }
}
:deep(.ant-empty) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.title {
  height: 32px;
  font-size: 14px;
  font-weight: bold;
  border-bottom: 1px solid #f3f3f3;
}
.flex {
  align-items: center;
}
.checkboxCtr {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(auto-fill, 32px);
  align-items: center;
}
</style>
