<template lang="pug">
div(style="overflow: hidden;height:100%")
  g-layout(title="缴费单")
      template(#content-table)
          .detail-form
              a-form(ref="formRef" layout="inline" :model="form" :label-col="labelCol" :wrapper-col="wrapperCol")
                  <div class="item-title">单据信息</div>
                  a-form-item(label="单据号" name="code") {{ form.code?form.code:'--' }}
                  a-form-item(label="创建时间" name="createTime" v-if="form.createTime") {{ timeFormat(form.createTime, true) }}
                  a-form-item(label="状态" name="status" v-if="form.status")  {{contractPaymentStatus.filter((item) => item.value === form.status)[0].name}}
                  a-form-item(label="商家名称" name="merchantName")  {{form.merchantName}}
                  a-form-item(label="费用合计" name="totalMoney")  {{Number(form.totalMoney).toFixed(2)}} 元
                  a-form-item(label="支付方式" name="payType" v-if="form.payType")  {{ payType.filter((item) => item.value === form.payType)[0].name }}
                  a-form-item(label="支付金额" name="payMoney" v-if="form.payMoney")  {{Number(form.payMoney).toFixed(2)}}
                  a-form-item(label="支付时间" name="payTime" v-if="form.payTime")  {{ timeFormat(form.payTime, true) }}
                  <div class="item-title">费用明细</div>
                  .fee(v-for="item in form.detailCreateParams" :key="item.businessId")
                      .fee-detail
                          .fee-detail
                              div 档位名称:{{ item.businessName }} 档位编号：{{item.businessCode}}
                              div 金额小计 {{ item.totalMoney }} 元
                      a-table(:dataSource="item.projectDetailCreateParams" :columns="columns" :pagination="false")
      template(#footer-page)
          a-button(@click="goBack") 返回
          a-button(type="primary" @click="submit" v-if="route.query.type === 'add'") 确定
          a-button(type="primary" @click="toPay" v-if="form.status === 'BE_PAID'") 支付
          a-button(type="primary" danger @click="toAbolish" v-if="form.status === 'BE_PAID'") 作废
          a-button(type="primary" @click="toRefund"  v-if="form.status === 'PAID'") 退费
  a-modal(v-model:visible.sync="modalVisible" width="600px" title="支付选择" @ok="submitPay('ok')") 
      a-radio-group(v-model:value="payTypeRadio")
          a-radio(value="ACCOUNT_BALANCE" )  帐户余额（启用：￥{{ balance }}）
          div(style="color: red" v-if="payTypeRadio && balance < form.totalMoney") 余额不足
      a-input-password(v-if="payTypeRadio==='ACCOUNT_BALANCE'" v-model:value="payPassword" placeholder="请输入支付密码" style="margin-top:20px")
  div(id="resolte-contaniner")
</template>
<script lang="jsx">
import {
  defineComponent,
  ref,
  reactive,
  toRefs,
  getCurrentInstance,
  createVNode,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { timeFormat } from "@/utils/common";
import { contractPaymentStatus, payType } from "@/utils/enumerate";
import { Modal } from "ant-design-vue";
export default defineComponent({
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const formState = reactive({
      form: {
        contractId: null,
        merchantId: null,
        merchantName: null,
        totalMoney: 0,
        status: null,
        detailCreateParams: [],
      },
      contractPaymentStatus: contractPaymentStatus,
      payType: payType,
      payTypeRadio: "ACCOUNT_BALANCE",
      payPassword: null,
      modalVisible: false,
      balance: 0,
    });

    const columns = [
      {
        title: "收费项目",
        dataIndex: "chargeProjectName",
        key: "chargeProjectName",
      },
      {
        title: "计费周期",
        dataIndex: "billingCycle",
        key: "billingCycle",
        slots: {
          customRender: "billingCycle",
        },
        customRender: ({ text }) => {
          if (text === "MONTH") {
            return (
              <PopOver position="topLeft" content="按月计费">
                按月计费
              </PopOver>
            );
          } else if (text === "QUARTER") {
            return (
              <PopOver position="topLeft" content="按季度计费">
                按季度计费
              </PopOver>
            );
          } else if (text === "HALF_YEAR") {
            return (
              <PopOver position="topLeft" content="按半年计费">
                按半年计费
              </PopOver>
            );
          } else if (text === "YEAR") {
            return (
              <PopOver position="topLeft" content="按年计费">
                按年计费
              </PopOver>
            );
          }
        },
      },
      {
        title: "期数",
        dataIndex: "periodNumber",
        key: "periodNumber",
        slots: {
          customRender: "periodNumber",
        },
        customRender: ({ text }) => {
          return (
            <PopOver position="topLeft" content={`第${text}期`}>
              {`第${text}期`}
            </PopOver>
          );
        },
      },
      {
        title: "周期时间",
        dataIndex: "time",
        key: "time",
        slots: {
          customRender: "time",
        },
        customRender: ({ text, record }) => {
          return (
            <PopOver
              position="topLeft"
              content={
                timeFormat(record.periodStartTime) +
                "~" +
                timeFormat(record.periodEndTime)
              }
            >
              {timeFormat(record.periodStartTime) +
                "~" +
                timeFormat(record.periodEndTime)}
            </PopOver>
          );
        },
      },
      {
        title: "金额（元）",
        dataIndex: "projectMoney",
        key: "projectMoney",
        slots: {
          customRender: "projectMoney",
        },
      },
    ];
    const handleData = (res) => {
      const str = res.paymentNoticeDetailVOS
        ? res.paymentNoticeDetailVOS
        : null;
      const detailCreateParams = str
        ? JSON.parse(
            JSON.stringify(str).replace(
              /projectDetailVOS/g,
              "projectDetailCreateParams"
            )
          )
        : [];
      formState.form = {
        id: res.id,
        code: res.code,
        contractId: res.contractId,
        merchantId: res.merchantId,
        merchantName: res.merchantName,
        totalMoney: res.totalMoney,
        status: res.status,
        payType: res.payType,
        payTime: res.payTime,
        payMoney: res.payMoney,
        detailCreateParams: detailCreateParams,
      };
    };
    if (route.query.ids) {
      const ids = route.query.ids.split(",");
      proxy.$api
        .postPaymentNoticeGeneraWeb( {
          ids: ids,
        })
        .then((res) => {
          handleData(res);
        });
    }
    if (route.query.id) {
      proxy.$api.getPaymentNotice( route.query.id).then((res) => {
        handleData(res);
      });
    }

    /*返回*/
    const goBack = () => {
      history.back();
    };
    /*新增*/
    const submit = () => {
      Modal.confirm({
        title: "信息确认",
        content: "是否确认创建收费单?",
        onOk() {
          proxy.$api.postPaymentNotice( formState.form).then((res) => {
            proxy.$message.success("操作成功");
            history.back();
          });
        },
        onCancel() {
        },

        class: "test",
      });
    };
    /*点击支付*/
    const toPay = () => {
      proxy.$api
        .getMerchantAccountAssets( formState.form.merchantId)
        .then((res) => {
          formState.modalVisible = true;
          formState.payTypeRadio = "ACCOUNT_BALANCE";
          formState.balance = Number(res.balance);
        });
    };
    const submitPay = () => {
      if (Number(formState.balance) < Number(formState.form.totalMoney)) {
        proxy.$message.warn("余额不足请充值");
        return;
      }
      if (!formState.payPassword) {
        proxy.$message.warn("请输入密码");
        return;
      }
      proxy.$api
        .postPaymentNoticePay( {
          id: route.query.id,
          payType: formState.payTypeRadio,
          password: formState.payPassword,
        })
        .then((res) => {
          proxy.$message.success("操作成功");
          formState.modalVisible = false;
          goBack();
        });
    };
    /*退费*/
    const toRefund = () => {
      let ids = [];
      formState.form.detailCreateParams.forEach((item) => {
        item.projectDetailCreateParams.forEach((s) => {
          ids.push(s.contractCostDetailId);
        });
      });
      history.pushState({},'',`/portal/contract/refundDetail?ids=${ids.join(",")}&type=add`)
 
    };
    /*点击作废*/
    const toAbolish = () => {
      Modal.confirm({
        title: "信息确认",
        content: "是否作废当前缴费单?",
        onOk() {
          proxy.$api
            .postPaymentNoticeAbolish( route.query.id)
            .then((res) => {
              proxy.$message.success("操作成功");
              history.back();
            });
        },
        onCancel() {
        },

        class: "test",
      });
    };
    return {
      ...toRefs(formState),
      route,
      timeFormat,
      labelCol: {
        span: 5,
      },
      wrapperCol: {
        span: 14,
      },
      columns,
      submit,
      goBack,
      toPay,
      toAbolish,
      submitPay,
      toRefund,
    };
  },
});
</script>

<style lang="less" scoped>
.fee {
  margin-bottom: 20px;
  width: 100%;
  .fee-detail {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
}

#resolte-contaniner {
  width: 100%;
  height: 600px;
}


@import url("@/styles/gComponents/gDetailform.less");
</style>
