<template lang="pug">
div
  g-layout(title="档位费用-设置")
    template(#content-search)
      g-detail-form(
        :formList="formList"
        :api="api"
        :rules="rules"
        ref="formRef"
      )
    template(#content-table)
      .group-partition
        a-table(:dataSource="dataSource" :columns="columns" :pagination="false")
          template(#calculationMode="{ record }")
            .editable-cell
              .editable-cell-input-wrapper(v-if="editableData[record.chargeProjectId]")
                a-select(v-model:value="editableData[record.chargeProjectId].calculationMode" placeholder="请选择计算方式")
                  a-select-option(:value="item.value" v-for="item in calculationMode" :key="item.value") {{ item.name }}
              div(v-else)
                a-select(v-model:value="record.calculationMode" disabled placeholder="请选择计算方式")
                  a-select-option(:value="item.value" v-for="item in calculationMode" :key="item.value") {{ item.name }}
          template(#unitPrice="{ text, record }")
            a-input-number(:precision="2" v-if="editableData[record.chargeProjectId]" v-model:value="editableData[record.chargeProjectId].unitPrice" style="margin: -5px 0" )
            span(v-else) {{ text }}
          template(#billingCycle="{ record }")
            .editable-cell
              .editable-cell-input-wrapper(v-if="editableData[record.chargeProjectId]")
                a-select(v-model:value="editableData[record.chargeProjectId].billingCycle" placeholder="请选择计费周期")
                  a-select-option(:value="item.value" v-for="item in billingCycle" :key="item.value") {{ item.name }}
              div(v-else)
                a-select(v-model:value="record.billingCycle" disabled placeholder="请选择计费周期")
                  a-select-option(:value="item.value" v-for="item in billingCycle" :key="item.value") {{ item.name }}
          template(#operation="{ record }")
            .editable-row-operations
              span(v-if="editableData[record.chargeProjectId]")
                a(@click="saveRecord(record.chargeProjectId)") 保存
                a-popconfirm(title="确定取消?" @confirm="cancel(record.chargeProjectId)")
                  a 取消
              span(v-else)
                a(@click="editRecord(record.chargeProjectId)") 编辑
              a-popconfirm(v-if="dataSource.length && !editableData[record.chargeProjectId]" title="确定移除?" @confirm="onDelete(record.chargeProjectId)")
                a(class="deleteRow") 移除
        .table-btn
          a-button(type="link" @click="showFeeTemplate") 选择模板
          a-button(type="link" @click="showPaymentItems") 选择费项
    template(#footer-page)
      a-button(@click="goBack") 返回
      a-button(type="primary" @click="submit") 确定
  paymentItemsModal(:visible="paymentItemsVisible" :activeId="activeId" @close="closePaymentItems")
  feeTemplateModal(:visible="feeTemplateVisible" @close="closeFeeTemplate")
</template>

<script lang='jsx'>
import paymentItemsModal from "../../components/paymentItems.vue";
import feeTemplateModal from "../../components/feeTemplate.vue";
import {
  defineComponent,
  ref,
  reactive,
  getCurrentInstance,
  toRefs,
  createVNode,
} from "vue";
import { cloneDeep } from "lodash-es";
import { useRoute, useRouter } from "vue-router";
import { calculationMode, billingCycle } from "@/utils/enumerate";
export default defineComponent({
  components: { paymentItemsModal, feeTemplateModal },
  setup() {
    const formRef = ref();
    const route = useRoute();
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const paymentItemsVisible = ref(false);
    const feeTemplateVisible = ref(false);
    const state = reactive({
      id: null,
      name: null,
      practicalArea: null,
      builtUpArea: null,
      activeId: [],
      calculationMode: calculationMode,
      billingCycle: billingCycle,
      formList: [
        {
          title: "基本信息",
          form: [
            { label: "档位名称", value: "name" },
            { label: "档位编号", value: "code" },
            { label: "建筑面积", value: "builtUpArea", unit: "m²" },
            { label: "实际面积", value: "practicalArea", unit: "m²" },
          ],
        },
        {
          title: "费用规则",
        },
      ],
      api: {
        detail: "getStall",
      },
      rules: {
        name: [
          {
            required: true,
            message: "请输入模板名称",
            trigger: "blur",
          },
        ],
      },
    });
    const editableData = reactive({});
    const dataSource = ref([]);
    const columns = [
      {
        title: "收费项目",
        dataIndex: "chargeProjectName",
        key: "chargeProjectName",
      },
      {
        title: "计算方式",
        dataIndex: "calculationMode",
        key: "calculationMode",
        slots: {
          customRender: "calculationMode",
        },
      },
      {
        title: "单价",
        dataIndex: "unitPrice",
        key: "unitPrice",
        slots: {
          customRender: "unitPrice",
        },
      },
      {
        title: "计费周期",
        dataIndex: "billingCycle",
        key: "billingCycle",
        slots: {
          customRender: "billingCycle",
        },
      },
      {
        title: "金额",
        dataIndex: "amount",
        key: "amount",
        slots: {
          customRender: "amount",
        },
      },
      {
        title: "操作",
        dataIndex: "operation",
        slots: {
          customRender: "operation",
        },
      },
    ];
    if (route.query.id) {
      proxy.$api.getStallCost(route.query.id,"get" ).then((res) => {
        dataSource.value = res;
      });
    }
    const onDelete = (key) => {
      dataSource.value = dataSource.value.filter(
        (item) => item.chargeProjectId !== key
      );
      delete editableData[key];
    };
    const editRecord = (key) => {
      editableData[key] = cloneDeep(
        dataSource.value.filter((item) => key === item.chargeProjectId)[0]
      );
    };
    const saveRecord = (key) => {
      if (!editableData[key].unitPrice) {
        proxy.$message.warn("请输入单价");
        return;
      }
      switch (editableData[key].calculationMode) {
        case "CALCULATED_BUILD_AREA_PRICE":
          editableData[key].amount =
            state.builtUpArea * editableData[key].unitPrice;
          break;
        case "CALCULATED_PRICE":
          editableData[key].amount = editableData[key].unitPrice;
          break;
        case "CALCULATED_REAL_AREA_PRICE":
          editableData[key].amount =
            state.practicalArea * editableData[key].unitPrice;
          break;
        default:
          break;
      }
      Object.assign(
        dataSource.value.filter((item) => key === item.chargeProjectId)[0],
        editableData[key]
      );
      delete editableData[key];
    };
    const cancel = (key) => {
      delete editableData[key];
    };
    const showPaymentItems = () => {
      state.activeId = dataSource.value.map((item) => {
        return item.chargeProjectId;
      });
      paymentItemsVisible.value = true;
    };
    const showFeeTemplate = () => {
      feeTemplateVisible.value = true;
    };
    const closePaymentItems = (data) => {
      if (data) {
        dataSource.value = data.map((item) => {
          return {
            chargeProjectName: item.name,
            chargeProjectId: item.id,
            calculationMode: "CALCULATED_PRICE",
            unitPrice: 0,
            amount: 0,
            billingCycle: "MONTH",
          };
        });
      }
      paymentItemsVisible.value = false;
    };
    const closeFeeTemplate = (data) => {
      if (data) {
        proxy.$api.getCostTmp(data,"get" ).then((res) => {
          dataSource.value = res.costRuleVOS.map((item) => {
            return Object.assign(item, { amount: 0 });
          });
          feeTemplateVisible.value = false;
        });
      } else {
        feeTemplateVisible.value = false;
      }
    };
    const submit = () => {
      formRef.value.formRef.validate().then(() => {
        if (dataSource.value.length === 0) {
          proxy.$message.warn("费用规则不能为空");
          return;
        }
        if (Object.keys(editableData).length === 0) {
          if (route.query.id) {
            proxy.$api
              .postStallCost({
                id: route.query.id,
                costDetailParams: dataSource.value,
              },"post")
              .then(() => {
                proxy.$message.success("操作成功");
                goBack();
              });
          }
        } else {
          proxy.$message.warn("请先保存费用规则");
        }
      });
    };
    const goBack = () => {
      history.back()
    };
    return {
      ...toRefs(state),
      formRef,
      labelCol: {
        span: 5,
      },
      wrapperCol: {
        span: 14,
      },
      editableData,
      dataSource,
      columns,
      paymentItemsVisible,
      feeTemplateVisible,
      onDelete,
      editRecord,
      saveRecord,
      cancel,
      showPaymentItems,
      closePaymentItems,
      showFeeTemplate,
      closeFeeTemplate,
      submit,
      goBack,
    };
  },
});
</script>

<style lang="less" scoped>

.editable-row-operations a {
  margin-right: 8px;
}
.table-btn {
  text-align: left;
}
</style>
