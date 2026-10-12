<template lang="pug">
div(style="height:100%")
  g-table(
    title="交易流水"
    :api="api"
    :btns="btns"
    :search="search"
    :columns="columns"
  )
    template(#header-btns)
      a-button(type="primary" @click="toActivation('修改支付密码')" v-if="walletStatus === 'ACTIVATED'") 修改支付密码
      a-button(type="primary" @click="toActivation('激活市场虚拟帐户')" v-else) 激活账户
    template(#content-data)
      div.statistics 
        div 
          div.statisticsName 全部
          div.statisticsItem ￥{{statistics.assets? statistics.assets:'--'}}
        div 
          div.statisticsName 启用
          div.statisticsItem ￥{{statistics.balance? statistics.balance:'--'}}
        div 
          div.statisticsName 冻结
          div.statisticsItem ￥{{statistics.frozen? statistics.frozen:'--'}}
  a-modal(v-model:visible.sync="modalVisible" v-if="modalVisible" width="600px" :title="modalTitle"  :closable="false"  @ok="submitModal" centered)
    a-form(:model="modalForm" :rules="rules" ref="formRef" :label-col="{span: 4 }")
      template(v-if="modalTitle==='激活市场虚拟帐户'")
        a-form-item(label="密码" name="password")
          a-input-password(v-model:value="modalForm.password"  allowClear placeholder="请输入密码" :maxlength="6")
        a-form-item(label="确认密码" name="secondNewPassword")
          a-input-password(v-model:value="modalForm.secondNewPassword"  allowClear placeholder="再次输入密码" :maxlength="6")
      template(v-else)
        a-form-item(label="密码" name="oldPassword")
          a-input-password(v-model:value="modalForm.oldPassword"  allowClear placeholder="请输入旧密码" :maxlength="6")
        a-form-item(label="新密码" name="password")
          a-input-password(v-model:value="modalForm.password"  allowClear placeholder="请输入六位新密码" :maxlength="6")
        a-form-item(label="确认新密码" name="secondNewPassword")
          a-input-password(v-model:value="modalForm.secondNewPassword"  allowClear placeholder="再次输入六位新密码" :maxlength="6")

               
</template>
<script lang="jsx">
import { moneyFlow, fundType } from "@/utils/enumerate.js";
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  createVNode,
  ref,
  onMounted,
} from "vue";
import { useRouter } from "vue-router";
import { CaretDownOutlined } from "@ant-design/icons-vue";
import { timeFormat, millennial, tableColumns } from "@/utils/common";
import Title from "ant-design-vue/lib/typography/Title";
import {getToken, getNowEnterprise } from '@/utils/auth'
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const dateFormat = "YYYY/MM/DD";
    const formRef = ref();
    const state = reactive({
      columnList: [
        "businessId",
        "type",
        "flow",
        "payer",
        "payee",
        "amount",
        "createTime",
        "remark",
      ],
      columns: [
        {
          mark: "businessId",
          dataIndex: "business.id",
          key: "businessId",
          title: "流水号",
          slots: {
            customRender: "businessId",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "type",
          dataIndex: "type",
          key: "type",
          title: "业务类型",
          slots: {
            customRender: "type",
          },
          customRender: ({ text, record }) => {
            return (
              <PopOver
                position="topLeft"
                content={record.business ? record.business.name : ""}
              >
                {record.business ? record.business.name : "--"}
              </PopOver>
            );
          },
          // width: 150,
          ellipsis: true,
        }, {
          mark: "flow",
          dataIndex: "flow",
          key: "flow",
          title: "资金流向",
          slots: {
            customRender: "flow",
          },
          customRender: ({ text }) => {
            if (text === "INCOME") {
              return (
                <PopOver position="topLeft" content="入账">
                  入账
                </PopOver>
              );
            } else {
              return (
                <PopOver position="topLeft" content="出账">
                  出账
                </PopOver>
              );
            }
          },
          ellipsis: true,
        }, {
          mark: "payer",
          dataIndex: "sourceMerchant.name",
          key: "sourceMerchant.name",
          title: "出账方",
          slots: {
            customRender: "payer",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          ellipsis: true,
        }, {
          mark: "payee",
          dataIndex: "targetMerchant.name",
          key: "targetMerchant.name",
          title: "入账方",
          slots: {
            customRender: "payee",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          ellipsis: true,
        }, {
          mark: "amount",
          dataIndex: "amount",
          key: "amount",
          title: "金额",
          slots: {
            customRender: "amount",
          },

          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? `￥${millennial(text)}` : ""}
              >
                {text || text === 0 ? `￥${millennial(text)}` : "--"}
              </PopOver>
            );
          },
          ellipsis: true,
        }, {
          mark: "createTime",
          dataIndex: "createTime",
          key: "createTime",
          title: "交易时间",
          slots: {
            customRender: "createTime",
          },

          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : ""}
              >
                {text ? `${timeFormat(text, true)}` : "--"}
              </PopOver>
            );
          },
          ellipsis: true,
        }, {
          mark: "remark",
          dataIndex: "remark",
          key: "remark",
          title: "备注",
          slots: {
            customRender: "remark",
          },

          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          ellipsis: true,
        }
      ],
      api: {
        list: "transactions",
      },
      btns: [],
      search: [
        {
          label: "业务类型",
          value: "business",
          component: "a-select",
          defaultValue: " ",
          options: fundType.filter((item) => {
            if (item.value !== "DEPOSIT" && item.value !== "WITHDRAW") {
              return item;
            }
          }),
          placeholder: "请选择",
        },
        {
          label: "资金流向",
          value: "flow",
          component: "a-select",
          defaultValue: " ",
          options: moneyFlow,
          placeholder: "请选择",
        },
        {
          label: "交易时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
        { label: "", value: "keyword", placeholder: "流水号" },
      ],
      statistics: {
        total: null,
        platform: null,
        merchant: null,
      },
      walletStatus: "ACTIVATED",
      modalVisible: false,
      modalTitle: "激活市场虚拟帐户",
      modalForm: {
        password: "",
        oldPassword: "",
        secondNewPassword: "",
      },
      rules: {
        oldPassword: [
          {
            required: true,
            message: "请输入旧密码",
          },
        ],
        password: [
          {
            required: true,
            message: "请输入新密码",
          },
          {
            validator(rule, value) {
              if (
                state.modalForm.password &&
                state.modalForm.secondNewPassword
              ) {
                formRef.value.validateFields("secondNewPassword");
                return Promise.resolve();
              } else {
                return Promise.resolve();
              }
            },
          },
        ],
        secondNewPassword: [
          {
            required: true,
            message: "请确认新密码",
          },
          {
            validator(rule, value) {
              if (state.modalForm.password) {
                if (
                  value !== state.modalForm.password &&
                  state.modalForm.secondNewPassword
                ) {
                  return Promise.reject("确认密码与新密码不相同");
                } else {
                  return Promise.resolve();
                }
              }
            },
          },
        ],
      },
    });
    const getAllData = (data) => {
      const tenant = JSON.parse(sessionStorage.getItem("GH-NowEnterprise"))?.code;
      proxy.$api.marketAll(tenant, "get").then((res) => {
        state.statistics.assets = res.assets;
        state.statistics.balance = res.balance;
        state.statistics.frozen = res.frozen;
        if (state.walletStatus !== "ACTIVATED") {
          state.modalVisible = true;
        }
      });
    };
    //获取市场钱包
    const getWallet = () => {
      const tenant = JSON.parse(sessionStorage.getItem("GH-NowEnterprise"))?.code;
      proxy.$api.getWallet(tenant).then((res) => {
        state.walletStatus = res.status;
        if (res.status === "ACTIVATED") {
          getAllData();
        } else {
          state.modalVisible = true;
        }
      });
    };
    onMounted(() => {
      // state.columns = tableColumns("accountManage", state.columnList);
      getWallet();
    });
    const toActivation = (title) => {
      state.modalForm = {
        password: "",
        oldPassword: "",
        secondNewPassword: "",
      };
      state.modalTitle = title;
      state.modalVisible = true;
    };
    const submitModal = () => {
      const tenant = getNowEnterprise().code;
      if (state.modalTitle === "激活市场虚拟帐户") {
        formRef.value.validate().then((res) => {
          proxy.$api
            .postWalletActivate({
              password: state.modalForm.password,
              tenant: tenant,
            }, "post")
            .then((res) => {
              state.modalVisible = false;
              proxy.$message.success("操作成功");
              getWallet();
            });
        });
      } else {
        formRef.value.validate().then((res) => {
          proxy.$api
            .putWalletPassword({
              originalPassword: state.modalForm.oldPassword,
              updatedPassword: state.modalForm.password,
              tenant: tenant,
            }, "put")
            .then((res) => {
              state.modalVisible = false;
              proxy.$message.success("操作成功");
            });
        });
      }
    };
    return {
      formRef,
      ...toRefs(state),
      toActivation,
      submitModal,
    };
  },
});
</script>
<style scoped lang="less">
.statistics {
  width: 100%;
  height: 130px;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(3, 32%);
  grid-template-rows: repeat(1, 100%);
  grid-column-gap: 2%;
  align-items: center;

  .statisticsItem {
    font-size: 20px;
    padding-top: 10px;
  }

  >div:nth-child(1) {
    background-color: @statistics1;
  }

  >div:nth-child(2) {
    background-color: @statistics2;
  }

  >div:nth-child(3) {
    background-color: @statistics3;
  }

  >div {
    padding: 20px;
  }
}</style>
