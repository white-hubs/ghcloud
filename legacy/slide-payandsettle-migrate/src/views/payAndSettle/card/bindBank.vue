<template lang="pug">
//- div hahahh
div.businessCtr
  div.businessInfo {{isEdit? '编辑':'新增'}}银行卡
  div.flex.content
    a-form(ref="bindForm" :model="data" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol" labelAlign="right")
      a-form-item(label="商家名称" name="holder")
        a-input(:value="data.holder" placeholder="请选择商家名称" @click="showMerchant" :disabled="isEdit" )

      a-form-item( label="联系人姓名" name="liaison")
        a-input(:value="data.liaison" placeholder="请输入联系人姓名" disabled )

      a-form-item( label="联系人手机" name="phone")
        a-input(:value="data.phone" placeholder="请输入联系人手机" disabled )

      a-form-item( label="银行名称" name="type")
        //- a-input(v-model:value="data.type")
        Select(v-model:value="data.type" :options="options" :placeholder="placeholder" )

      a-form-item(label="银行卡卡号" name="code")
        a-input(v-model:value.trim="data.code" placeholder="请输入银行卡卡号" )

      a-form-item( label="开户行" name="issuer")
        a-input(v-model:value.trim="data.issuer" placeholder="请输入开户行" )
  div.buttonCtr
    a-space(:size="16")
      a-button(type="primary" @click="onSubmit") {{isEdit? "保存":'新增'}}
      a-button(@click="cancel") 取消 
  a-modal(v-model:visible="visible" centered title="商户列表" :width="1200" :maskClosable="false" @ok="getInfo" @cancel="cancelChecked")
    a-form.pb2(ref="form" :model="model" layout="inline")
      a-form-item(label="")
        a-input(v-model:value="model.keyword" allowClear)
      a-form-item
        a-space
          a-button(type="primary") 查询
    a-table(
      :data-source="tableData" 
      :columns="columns" 
      boordered 
      :rowKey="(record) => record.id" 
      :rowSelection="rowSelection" 
      :scroll="{x:1100,y:500}" 
      :custom-row="customRow"
      size="middle" 
      :pagination="pagination"
      @change="changePage"
      :loading="loading")   
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
} from "vue";
import { useRoute, useRouter } from "vue-router";
import _ from "lodash";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();

    const bindForm = ref();

    const item = JSON.parse(route.query.item);

    const model = reactive({
      keyword: null,
    });

    const merchantInfo = ref({
      name: null,
      id: null,
      liaison: null,
      phone: null,
      userId: null,
    });

    const state = reactive({
      data: {
        walletId: null, //钱包id
        id: null, //id
        userId: null, //用户id
        code: null, //银行卡号
        type: null, //银行
        holder: null, // 用户名称
        issuer: null, // 开户行
        phone: null, //联系人电话
        liaison: null, //联系人
      },
      spinning: false,
      isEdit: false,
      placeholder: "请选择银行",
      operate: "",
      params: {
        pageNumber: 1,
        pageSize: 10,
      },
      visible: false,
      tableData: null,
      columns: [
        {
          dataIndex: "name",
          key: "name",
          title: "商家名称",
          slots: {
            customRender: "name",
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
          dataIndex: "liaison",
          key: "liaison",
          title: "联系人名称",
          slots: {
            customRender: "liaison",
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
          dataIndex: "phone",
          key: "phone",
          title: "联系人手机",
          slots: {
            customRender: "phone",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
      ],
      nowCheckItem: {
        id: null,
        name: null,
        liaison: null,
        phone: null,
      },
      pagination: {
        total: 0,
        position: "bottom",
        defaultPageSize: 10,
        // showSizeChanger: true,
        // pageSizeOptions: ["1", "5", "10", "20", "50"],
        // showTotal: (total) => `共${total}条数据`,
      },
      loading: false,
      tableHeight: 0,
    });
    const selectedRowKeys = ref(null);

    const getData = async () => {
      if (item?.merchant?.id) {
        state.isEdit = true;
        state.data = item;
        state.data.liaison = item.merchant.liaison;
        state.data.phone = item.merchant.phone;
        state.data.name = item.merchant.name;
        state.data.holder = item.merchant.name;
        state.data.userId = item.merchant.userId;
        selectedRowKeys.value = item?.merchant?.id;
        merchantInfo.value.id = item?.merchant?.id;
        merchantInfo.value.name = item?.merchant?.name;
        merchantInfo.value.liaison = item?.merchant?.liaison;
        merchantInfo.value.phone = item?.merchant?.phone;
        merchantInfo.value.userId = item?.merchant?.userId;
        state.nowCheckItem = await _.cloneDeep(merchantInfo.value);
      } else {
        state.isEdit = false;
      }
    };

    onMounted(() => {
      getData();
      getMerchant();

      // setTimeout(() => {
      //   const contentHei = document.querySelector(
      //     ".view_content .ant-layout-content"
      //   ).clientHeight;
      //   state.tableHeight = contentHei - 180;
      // }, 100);
    });

    const getMerchant = (data) => {
      state.loading = true;
      proxy.$api
        .getRechargeUser(data,"get" )
        .then((res) => {
          state.tableData = res.records;
          state.pagination.total = res.total;
        })
        .finally(() => {
          state.loading = false;
        });
    };

    const changePage = (e) => {
      getMerchant({ pageNumber: e.current });
    };

    const options = [
      { name: "BCM(交通银行)", id: "BCM" },
      { name: "CCB(中国建设银行)", id: "CCB" },
      { name: "ICBC(中国工商银行)", id: "ICBC" },
      { name: "PSBC(中国邮政储蓄银行)", id: "PSBC" },
      { name: "ABC(中国农业银行)", id: "ABC" },
      { name: "HJXCT(海吉星超通卡)", id: "HJXCT" },
    ];

    const rules = {
      holder: [
        {
          required: true,
          message: "请输入",
        },
      ],
      code: [
        {
          required: true,
          message: "请输入",
        },
      ],
      type: [
        {
          required: true,
          message: "请输入",
        },
      ],
      issuer: [
        {
          required: true,
          message: "请输入",
        },
      ],
    };

    const onSubmit = () => {
      if (state.isEdit) {
        proxy.$api
          .modifyBankCard(state.data,"put" )
          .then(() => {
            bindForm.value.resetFields();
            state.isEdit = false;
            proxy.$message.success("操作成功");
            router.back(-1);
          })
          .catch(() => {
            proxy.$message.error("保存失败");
          });
      } else {
        state.data.userId = merchantInfo.value.userId;
        bindForm.value.validate().then(() => {
          proxy.$api
            .addBankCard(state.data,"post" )
            .then(() => {
              bindForm.value.resetFields();
              proxy.$message.success("操作成功");
              router.back(-1);
            })
            .catch(() => {
              proxy.$message.error("保存失败");
            })
            .finally(function(){});
        });
      }
    };

    const cancel = () => {
      // if (state.isEdit) {
      //   state.isEdit = false;
      //   bindForm.value.resetFields();
      // } else {
      router.back(-1);
      // }
    };

    const cancelChecked = () => {
      merchantInfo.value = _.cloneDeep(state.nowCheckItem);
      selectedRowKeys.value = _.cloneDeep(state.nowCheckItem.id);
    };

    const showMerchant = () => {
      state.visible = true;
    };

    const onSelectChange = (changableRowKeys, selectedRows) => {
      selectedRowKeys.value = changableRowKeys;
      merchantInfo.value.id = selectedRows.id;
      merchantInfo.value.name = selectedRows.name;
      merchantInfo.value.liaison = selectedRows.liaison;
      merchantInfo.value.phone = selectedRows.phone;
      merchantInfo.value.userId = selectedRows.userId;
    };
    const rowSelection = computed(() => {
      return {
        type: "radio",
        selectedRowKeys: unref(selectedRowKeys),
        onChange: onSelectChange,
      };
    });

    const getInfo = () => {
      selectedRowKeys.value = _.cloneDeep(merchantInfo.value.id);
      state.nowCheckItem = _.cloneDeep(merchantInfo.value);
      state.data.holder = merchantInfo.value.name;
      state.data.liaison = merchantInfo.value.liaison;
      state.data.phone = merchantInfo.value.phone;
      state.data.userId = merchantInfo.value.userId;
      state.visible = false;
    };

    const customRow = (record) => {
      return {
        onClick: () => {
          onSelectChange(record.id, record);
        },
      };
    };

    return {
      model,
      labelCol: {
        span: 6,
      },
      wrapperCol: {
        span: 14,
      },
      ...toRefs(state),
      name,
      bindForm,
      rules,
      onSubmit,
      cancel,
      options,
      showMerchant,
      rowSelection,
      getInfo,
      customRow,
      cancelChecked,
      changePage,
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
  height: calc(100% - 52px);
  .left {
    width: 50%;
    height: calc(100% - 70px);
    padding: 20px 40px;
    .top {
      width: 100%;
      height: 32px;
      align-items: center;
      justify-content: space-between;
      // height: 70px;
      // line-height: 70px;
      // vertical-align: middle;
    }
    .bottom {
      width: 100%;
      height: calc(100% - 32px);
      padding-top: 10px;
      text-align: left;
      overflow-y: auto;
      .pt1 {
        justify-content: space-between;
      }
    }
    .title {
      font-family: @fontMedium;
    }
  }
}
:deep(.ant-form) {
  display: grid;
  grid-template-columns: repeat(1, 100%);
  grid-template-rows: repeat(6, 40px);
  padding: 20px 40px;
  label {
    display: inline-block;
    width: 120px;
  }
  .ant-select-selector,
  .ant-select-selection-search-input {
    height: 40px !important;
  }
  .ant-select-selection-item,
  .ant-select-selection-placeholder {
    height: 40px;
    line-height: 40px;
  }
}
:deep(.ant-modal-content) {
  height: 100%;
}
:deep(.ant-input:focus:first-child) {
  border-right-width: 0px !important;
}
</style>
