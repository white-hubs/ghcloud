<template lang="pug">
g-layout(title="商家充值")
  template(#content-table)
    div.businessCtr
      a-spin(:spinning="spinning")
        div.flex.content.justify-between
          div.left 
            div
              a-form.top(layout="inline" :model="model")
                a-form-item 
                  a-input(v-model:value.trim="model.keyword" placeholder="请输入客户信息查询" @pressEnter="search") 
                a-form-item
                  a-space(:size="16") 
                    a-button(type="primary" @click="search") 查询
                    a-button(type="default" @click="reset") 重置
                    a-button(type="primary" @click="manyReadBlock") 读卡
              div.bottom
                a-table(
                  v-if="isSearch"
                  :data-source="tableData" 
                  :columns="columns" 
                  boordered 
                  :rowKey="(record) => record.useForSelect" 
                  :rowSelection="rowSelection" 
                  :scroll="{x:400,y:430}" 
                  :custom-row="customRow" 
                  size="middle" 
                  :pagination="pagination"
                  @change="changePage"
                  :loading="loading") 
                a-empty.p1(v-else description="请输入商家名称或读取会员卡")  
          div.right
            div
              g-vertical-line(title="基础信息")
              div.info.p1
                div 
                  span.itemName 客户名称： 
                  span.itemContent {{merchantInfo?.adminName? merchantInfo?.adminName:'--'}}
                div 
                  span.itemName 商家名称： 
                  span.itemContent {{merchantInfo?.name? merchantInfo?.name:'--'}}
                div 
                  span.itemName 联系人电话： 
                  span.itemContent {{merchantInfo?.adminPhone? merchantInfo?.adminPhone:'--'}}
            div 
              g-vertical-line.pb2(title="充值信息")
              a-form.rightForm(ref="bindForm" :model="recharge" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol")
                a-form-item(label="充值方式" name="mode")
                  g-select(v-model:value="recharge.mode" :options="options" :placeholder="placeholder")
                a-form-item(label="充值金额" name="amount")
                  a-input-number(v-model:value.trim="recharge.amount" placeholder="最少充值1块"  :min="1")
                  span.pl2 元
                a-form-item(label="快捷金额")
                  a-space 
                    a-button( :type="recharge.amount === 500? 'primary':'default'" @click="() => recharge.amount = 500") 500
                    a-button( :type="recharge.amount === 1000? 'primary':'default'" @click="() => recharge.amount = 1000") 1000
                    a-button( :type="recharge.amount === 2000? 'primary':'default'" @click="() => recharge.amount = 2000") 2000  
                    a-button( :type="recharge.amount === 5000? 'primary':'default'" @click="() => recharge.amount = 5000") 5000
  template(#footer-page)
    a-button(type="primary" @click="onSubmit" :loading="btnLoading") 充值  
</template>
<script lang="jsx">
  import {
    defineComponent,
    reactive,
    ref,
    computed,
    unref,
    getCurrentInstance,
    toRefs,
    onMounted,
    createVNode,
    watch,
  } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import _ from "lodash";
  import { Modal } from "ant-design-vue";
  import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
  import axios from "axios";
  import { CheckInstall, rfidreader } from "@/utils/YOWOReaderBase.js";
  import { formatTimeStr } from "ant-design-vue/lib/statistic/utils";
  import {getToken, getNowEnterprise } from '@/utils/auth'
  export default defineComponent({
    setup() {
      const { proxy } = getCurrentInstance();
      const route = useRoute();
      const router = useRouter();
      const bindForm = ref();
      let readContent = "";
      const model = reactive({
        keyword: null,
        pageNumber: 1,
        pageSize: 10,
      });
      const recharge = reactive({
        id: null,
        mode: null,
        amount: null,
      });
      const spinning = ref(false);
      const merchantInfo = ref({
        adminUserId: "",
        adminName: "",
        adminPhone: "",
        name :"",
        supplierId: ""
      });
  
      const state = reactive({
        params: {
          pageNumber: 1,
          pageSize: 10,
        },
        tableData: null,
        columns: [
          {
            dataIndex: "adminName",
            key: "adminName",
            title: "客户名称",
            slots: {
              customRender: "adminName",
            },
          },
          {
            dataIndex: "adminPhone",
            key: "adminPhone",
            title: "联系人电话",
            slots: {
              customRender: "adminPhone",
            },
            customRender: ({ text }) => {
              return (
                <PopOver position="topLeft" content={text ? text : ""}>
                  {text ? text : "--"}
                </PopOver>
              );
            },
          },
          {
            dataIndex: "name",
            key: "name",
            title: "商家名称",
            slots: {
              customRender: "name",
            },
            ellipsis: true,
            customRender: ({ text }) => {
              return (
                <PopOver position="topLeft" content={text ? text : ""}>
                  {text ? text : "--"}
                </PopOver>
              );
            },
          }
        ],
        nowCheckItem: {
          id: null,
          name: null,
          liaison: null,
          phone: null,
        },
        pagination: {
          // current: 1,
          total: 0,
          position: "bottom",
          defaultPageSize: 10,
        },
        loading: false,
        placeholder: "请选择充值方式",
        isSearch: false,
        btnLoading: false,
      });
      const selectedRowKeys = ref(null);
      onMounted(() => {
        // getMerchant();
        try {
          CheckInstall();
          rfidreader.onResult(async (resultdata) => {
            switch (resultdata.FunctionID) {
              case 5:
                if (resultdata.Result > 0) {
                  readContent = readContent + resultdata.strData;
                  if (resultdata.UID === 14) {
                    const data = await proxy.$api.getRechargeUser({
                      keyword: readContent,
                      tenant: getNowEnterprise().code,
                    },"get");
                    state.isSearch = true;
                    state.tableData = data.records;
                    state.pagination.total = data.total;
                    merchantInfo.value = _.cloneDeep(data.records[0]);
                    selectedRowKeys.value = merchantInfo.value?.useForSelect;
                  }
                }
                break;
            }
          });
        } catch (error) {
        }
      });
      const manyReadBlock = () => {
        readContent = "";
        for (let i = 12; i < 15; i++) {
          readBlock(i);
        }
      };
      const readBlock = (blockID) => {
        rfidreader.KeyMode = 0;
        rfidreader.KeyStringMode = 0;
        rfidreader.Repeat = 0;
        rfidreader.UID = blockID;
        rfidreader.M1ReadBlock(blockID, 0);
      };
      const getMerchant = (data) => {
        state.loading = true;
        proxy.$api.getRechargeUser({
            ...data,
            tenant: getNowEnterprise().code,
          },"get")
          .then((res) => {
            state.tableData = res.records;
            state.pagination.total = res.total;
            if (res.records.length === 1) {
              merchantInfo.value = res.records[0];
              selectedRowKeys.value = res.records[0].useForSelect;
            }
          })
          .finally(() => {
            state.loading = false;
          });
      };
  
      const options = [
        { name: "现金", id: "CASH" },
        { name: "微信", id: "WEIXIN_PAY" },
        { name: "POS机刷卡", id: "POS" },
      ];
  
      const rules = {
        mode: [
          {
            required: true,
            message: "请输入",
          },
        ],
        amount: [
          {
            required: true,
            message: "请输入正确的充值金额（最多两位小数,不小于1）",
            pattern: new RegExp(/^\d+(\.\d{0,2})?$/, "g"),
            trigger: ["change", "blur"],
          },
        ],
      };
  
      const changePage = (e) => {
        model.pageNumber = e.current;
        state.pagination.pageSize = e.pageSize;
        state.pagination.current = e.current;
        getMerchant(model);
      };
  
      const onSubmit = () => {
        bindForm.value.validate().then(() => {
          if (!merchantInfo.value.adminUserId) {
            proxy.$message.warn("请选择商户");
            return;
          }
          Modal.confirm({
            title: "提示",
            content: "请确认是否充值？",
            okText: "确定",
            cancelText: "取消",
            centered: true,
            icon: createVNode(ExclamationCircleOutlined),
            onOk: async () => {
              spinning.value = true;
              recharge.id = merchantInfo.value.adminUserId;
              recharge.supplierId = merchantInfo.value.supplierId;
              const signData = {
                mode: recharge.mode,
                amount: recharge.amount,
              };
              const tenant = getNowEnterprise().code;
              const url = `/api/meattrade/supplier/${merchantInfo.value.adminUserId}/account/recharge/v2`;
              const token = await getToken();
              await Object.assign(signData, { tenant: tenant });
              state.btnLoading = true;
              proxy.$api.sign(signData,"post").then((res) => {
                axios
                  .post(
                    url,
                    {
                      ...recharge,
                      tenant: tenant,
                    },
                    {
                      headers: {
                        Authorization: "Bearer " + token.access_token,
                        terminal: window.config.terminal,
                        tenant: tenant,
                        signature: res,
                        "Content-Type": "application/json",
                      },
                    }
                  )
                  .then(() => {
                    proxy.$message.success("操作成功");
                  })
                  .catch((error) => {
                    const res = error.response.data;
                    const errorCode = res.code;
                    if (errorCode === 406) {
                      proxy.$message.warn(res.message);
                    } else {
                      proxy.$message.error(res.message);
                    }
                      
                  })
                  .finally(() => {
                    selectedRowKeys.value = "";
                    merchantInfo.value.adminUserId = "";
                    merchantInfo.value.adminName = "";
                    merchantInfo.value.adminPhone = "";
                    merchantInfo.value.name = "";
                    merchantInfo.value.supplierId = "";
                    recharge.mode = null;
                    recharge.amount = null;
                    reset();
                    spinning.value = false;
                    state.btnLoading = false;
                  });
              });
            },
          });
        });
      };
      const cancel = () => {
        router.back(-1);
      };
      const search = () => {
        // condition.value.pageNumber = 1;
        if (model.keyword) {
          state.isSearch = true;
          state.pagination.current = 1;
          getMerchant(model);
        } else {
          proxy.$message.warn("请输入查询的商户");
        }
      };
      const reset = () => {
        state.isSearch = false;
        model.keyword = null;
        model.pageNumber = 1;
        state.pagination.current = 1;
        getMerchant(model);
      };
      const onSelectChange = (selectedRows) => {
        selectedRowKeys.value = selectedRows.useForSelect;
        merchantInfo.value.adminName = selectedRows.adminName;
        merchantInfo.value.adminPhone = selectedRows.adminPhone;
        merchantInfo.value.name = selectedRows.name;
        merchantInfo.value.adminUserId = selectedRows.adminUserId;
        merchantInfo.value.supplierId = selectedRows.id
      };
      const Select = (record) => {
        selectedRowKeys.value = record.useForSelect;
        merchantInfo.value.adminUserId = record.adminUserId;
        merchantInfo.value.adminName = record.adminName;
        merchantInfo.value.adminPhone = record.adminPhone;
        merchantInfo.value.name = record.name;
        merchantInfo.value.supplierId = record.id
      };
      const rowSelection = computed(() => {
        return {
          type: "radio",
          selectedRowKeys: [unref(selectedRowKeys)],
          // onChange: onSelectChange,
          onSelect: Select,
        };
      });
      const customRow = (record) => {
        return {
          onClick: () => {
            onSelectChange(record);
          },
        };
      };
      watch(
        () => recharge.amount,
        () => {
          const rule = /^\d+(\.\d{0,2})?$/;
          if (rule.test(recharge.amount)) {
            bindForm.value.clearValidate("amount");
          }
        }
      );
      return {
        model,
        recharge,
        labelCol: {
          span: 4,
        },
        wrapperCol: {
          span: 14,
        },
        ...toRefs(state),
        bindForm,
        rules,
        onSubmit,
        cancel,
        options,
        rowSelection,
        customRow,
        merchantInfo,
        changePage,
        search,
        reset,
        spinning,
        manyReadBlock,
      };
    },
  });
  </script>
  <style lang="less" scoped>
  
// @import url("@/styles/theme/color.less");;
  .businessCtr {
    border-radius: 4px;
  }
  .content {
    width: 100%;
    height: 100%;
    .left {
      width: 45%;
      height: 98%;
      // display: flex;
      // &::after {
      //   content: "";
      //   width: 1px;
      //   height: 98%;
      //   border-right: 1px dotted @fontColor;
      //   padding: 16px 0;
      // }
      > div {
        width: 98%;
        height: 100%;
        padding: 10px;
        // box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
        // border-radius: 4px;
        border-right: 1px solid #f3f3f3;
        margin: 0 auto;
      }
      .top {
        width: 100%;
        height: 40px;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        .ant-form-item {
          margin: 0;
        }
      }
      .bottom {
        width: 100%;
        padding: 10px 16px 0 0;
        text-align: left;
        overflow-y: auto;
      }
    }
    .right {
      width: 55%;
      height: 100%;
      padding-left: 20px;
      padding-top: 10px;
      .title {
        width: 100%;
        height: 52px;
        line-height: 52px;
        text-align: left;
        font-family: @fontMedium;
        vertical-align: middle;
        color: @fontColor;
      }
      .info {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        // grid-template-rows: repeat(auto-fill, 40px);
        grid-row-gap: 16px;
        text-align: left;
        color: @fontColor;
      }
    }
  }
  
  :deep(.ant-form.top) {
    grid-template-columns: 50% 50%;
    grid-column-gap: 16px;
    label {
      display: inline-block;
      width: 120px;
    }
  }
  
  :deep(.ant-form.rightForm) {
    grid-template-columns: repeat(1, 100%);
    padding: 0;
    grid-template-rows: auto;
    grid-row-gap: 0px;
    .ant-form-item-label {
      line-height: 32px;
    }
    label {
      display: inline-block;
      // width: 120px;
      line-height: 32px;
    }
    .ant-input-number {
      width: 85%;
    }
  }
  :deep(.ant-modal-content) {
    height: 100%;
  }
  </style>
  