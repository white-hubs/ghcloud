<template lang="pug">
div
  g-detail(
    ref="detailRef"
    title="来货报备"
    :formList="formList"
    :api="api"
  )
    template(v-slot:btn="item")
      a-button(type="primary" danger @click="openModal(item.record)" v-if="status === 'AUDIT'") 不通过
      a-button(type="primary" @click="examine(true,item.record)"  v-if="status === 'AUDIT'") 通过
  a-modal(v-model:visible="visible" title="不通过" @cancel="closeModal" @ok="examine(false)" :maskClosable="false" centered)
    a-form(ref="remarkForm" :model="dataForm" :rules="rules" :bodyStyle="{padding: '0'}" )
      a-form-item(label="不通过原因：" name="auditRemark")
        a-textarea.textarea(v-model:value="dataForm.auditRemark" placeholder="请输入" showCount :maxlength="200")
</template>
<script>
import {
  defineComponent,
  reactive,
  getCurrentInstance,
  ref,
  toRefs,
  createVNode,
} from "vue";
import { useRoute, useRouter } from "vue-router";
// import { porkReportId } from "@/api/meatSlider";
import { timeFormat, getFreshLabel } from "@/utils/common";
import { Modal } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
export default defineComponent({
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const status = ref("");
    const detailRef = ref();

    const state = reactive({
      data: null,
      originPlace: "",
      formList: [
        {
          title: "报备信息",
          form: [
            {
              label: "商家名称",
              value: "supplierName",
              disabled: true,
              html: true,
              detailFun: (value, form) => {
                return `<span> ${value ? value : "--"} </span><span class="${
                  form.riskLevel
                    ? form.riskLevel === "LOW"
                      ? "riskLow"
                      : form.riskLevel === "MEDIUM"
                      ? "riskMedium"
                      : "riskHigh"
                    : ""
                }">${
                  form.riskLevel
                    ? form.riskLevel === "LOW"
                      ? "低风险"
                      : form.riskLevel === "MEDIUM"
                      ? "中风险"
                      : "高风险"
                    : "--"
                }</span>`;
              },
            },
            { label: "商家编号", value: "supplierCode", disabled: true },
            { label: "档位号", value: "stallName", disabled: true },
            { label: "报备单号", value: "code", disabled: true },
            {label: "报备商品", value: "goodsCategoryName",disabled: true,
              html: true,
              detailFun: (value, form) => {
                return `<span style="margin-left:5px;"> ${form.goodsCategoryName ? form.goodsCategoryName : "--"} </span><span class="${
                  form.freshLabel
                    ? getFreshLabel(form.freshLabel).color
                    : ""
                }">${
                  form.freshLabel
                    ? getFreshLabel(form.freshLabel).name
                    : ""
                }</span>`;
              },
            },
            {
              label: "报备时间",
              value: "reportTime",
              detailFun: (value) => {
                return value ? timeFormat(value) : "--";
              },
              disabled: true,
            },
            {
              label: "报备片数",
              value: "reportSlices",
              disabled: true,
              unit: "片",
            },
            {
              label: "报备重量",
              value: "reportWeight",
              disabled: true,
              unit: "Kg",
            },
            { label: "车牌号", value: "vehiclePlate", disabled: true },
            {
              label: "到场时间",
              value: "arrivedTime",
              detailFun: (value) => {
                return value ? timeFormat(value) : "--";
              },
              disabled: true,
            },
          ],
        },
        {
          title: "产地检疫信息",
          form: [
            {
              label: "屠宰场",
              value: "abattoirName",
              disabled: true,
              detailFun: (value) => {
                return value ? value : "--";
              },
            },
            { label: "屠宰场代码", value: "abattoirCode", disabled: true },
            { label: "养殖场", value: "originPlace", component: "a-input" },
            {
              label: "审核时间",
              value: "auditTime",
              detailFun: (value) => {
                return value ? timeFormat(value) : "--";
              },
              disabled: true,
            },
            { label: "操作员", value: "auditorName", disabled: true },
            {
              label: "检疫证号",
              value: "pratiqueCode",
              detailFun: (value) => {
                return value ? value : "--";
              },
              disabled: true,
            },
            {
              label: "检疫证",
              value: "files",
              component: "a-upload",
              singleLine: true,
              detailValue: "files",
            },
            // {
            //   label: "检疫证",
            //   value: "fileVOS",
            //   component: "a-upload",
            //   singleLine: true,
            //   detailValue: "fileVOS",
            // },
          ],
        },
        {
          title: "审核信息",
          form: [
            {
              label: "审核结果",
              value: "status",
              html: true,
              detailFun: (value) => {
                status.value = value;
                if (value) {
                  if (value === "FAILED") {
                    return '<span class="deleteRow">不通过</span>';
                  } else if (value === "PASSED") {
                    return '<span class="normalRow">通过</span>';
                  } else if (value === "RESCINDED") {
                    return "已撤销";
                  } else {
                    return "待审核";
                  }
                } else {
                  return "--";
                }
              },
            },
            // {
            //   label: "审核结果",
            //   value: "reportStatus",
            //   html: true,
            //   detailFun: (value) => {
            //     if (value) {
            //       if (value === "FAILED") {
            //         return '<span class="deleteRow">不通过</span>';
            //       } else if (value === "PASSED") {
            //         return '<span class="normalRow">通过</span>';
            //       } else if (value === "RESCINDED") {
            //         return "已撤销";
            //       } else {
            //         return "待审核";
            //       }
            //     } else {
            //       return "--";
            //     }
            //   },
            // },
            {
              label: "不通过原因",
              value: "auditRemark",
              showCondition: (form) => {
                if (form && form.status === "FAILED") {
                  return true;
                } else {
                  return false;
                }
              },
            },
          ],
        },
      ],
      api: {
        detail: "porkReportId",
      },
    });

    const remarkForm = ref();
    const visible = ref(false);
    const dataForm = reactive({
      porkReportId: "",
      status: "",
      auditRemark: null,
      originPlace: "",
    });

    const rules = {
      auditRemark: [
        {
          required: true,
          message: "请输入不通过原因",
        },
      ],
    };

    const examine = (status, record) => {
      if (record) {
        dataForm.porkReportId = record.form.id;
        dataForm.originPlace = record.form.originPlace;
      }
      if (status) {
        Modal.confirm({
          title: "提示",
          content: "是否审核通过？",
          okText: "确定",
          cancelText: "取消",
          centered: true,
          icon: createVNode(ExclamationCircleOutlined),
          onOk: () => {
            dataForm.status = "PASSED";
            proxy.$api
              .porkReportAudit(dataForm, "put")
              .then((res) => {
                router.back(-1);
                proxy.$message.success("操作成功");
              })
              .catch(() => {
                detailRef.value.getData();
              });
          },
        });
      } else {
        dataForm.status = "FAILED";
        remarkForm.value.validate().then(() => {
          proxy.$api
            .porkReportAudit(dataForm,"put" )
            .then((res) => {
              router.back(-1);
              proxy.$message.success("操作成功");
            })
            .catch(() => {
              detailRef.value.getData();
            });
        });
      }
    };

    const openModal = (record) => {
      dataForm.porkReportId = record.form.id;
      dataForm.originPlace = record.form.originPlace;
      visible.value = true;
    };
    const closeModal = () => {
      visible.value = false;
    };

    return {
      status,
      detailRef,
      ...toRefs(state),
      route,
      remarkForm,
      dataForm,
      rules,
      visible,
      timeFormat,
      examine,
      openModal,
      closeModal,
    };
  },
});
</script>
