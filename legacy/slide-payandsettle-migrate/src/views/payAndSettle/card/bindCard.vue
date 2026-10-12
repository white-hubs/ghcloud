<template lang="pug">
div
  g-layout(title="会员卡")
    template(#content-table)
      .detail-form
        a-form(ref="bindForm" :model="data" :rules="rules" layout="inline")
          a-form-item(label="商家名称" name="holder")
            a-input(:value="data.holder" placeholder="请选择商家" @click="showMerchant" :disabled="isEdit" )

          a-form-item( label="联系人姓名" name="liaison")
            a-input(:value="data.liaison" placeholder="请选择商家" disabled )

          a-form-item( label="联系人手机" name="phone")
            a-input(:value="data.phone" placeholder="请选择商家" disabled )

          //- a-form-item( label="银行名称" name="type")
            //- a-input(v-model:value="data.type")
            Select(v-model:value="data.type" :options="options" :placeholder="placeholder")

          //- a-form-item(label="银行卡卡号" name="code")
            a-input(v-model:value="data.code" placeholder="请输入银行卡卡号")

          a-form-item( label="会员卡号" name="code")
            a-input(v-model:value.trim="data.code" placeholder="请输入会员卡号" )
    template(#footer-page)
      a-button(@click="cancel") 返回 
      a-button(type="primary" @click="onSubmit") 确定
    g-modal(
        :visible="visible" 
        title="商户"
        url="merchant"
        :activeId="activeId" 
        :search="modalSearch" 
        :columns="columns" 
        selectionType="radio"
        @close="getInfo"
    )
  //- a-modal(v-model:visible="visible" centered title="商户列表" :width="800" :maskClosable="false" @ok="getInfo" @cancel="cancelChecked")
  //-   a-form.pb2(ref="form" :model="model" layout="inline")
  //-     a-form-item(label="")
  //-       a-input(v-model:value="model.keyword" allowClear @pressEnter="search" :maxlength="20")
  //-     a-form-item
  //-       a-space
  //-         a-button(type="primary" @click="search") 查询
  //-   a-table(
  //-     :data-source="tableData" 
  //-     :columns="columns" 
  //-     boordered 
  //-     :rowKey="(record) => record.id" 
  //-     :rowSelection="rowSelection" 
  //-     :scroll="{x:600,y:500}" 
  //-     :custom-row="customRow" 
  //-     size="small" 
  //-     :pagination="pagination"
  //-     @change="changePage"
  //-     :loading="loading")   
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
  watch,
} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import _ from "lodash";
import { CheckInstall, rfidreader } from "@/utils/YOWOReaderBase.js";
import { message } from "ant-design-vue";
import {getToken, getNowEnterprise } from '@/utils/auth'
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const store = useStore();

    let readNumber = 1,
      currentReadNumber = 1;
    let writeNumber = 1,
      currentWriteNumber = 1;
    let readStatus = true,
      writeStatus = true;
    let ciphertext = "";
    const bindForm = ref();

    const model = reactive({
      keyword: null,
    });

    onMounted(() => {
      // getMerchant();
      CheckInstall();
      rfidreader.onResult((resultdata) => {
        state.rfidreaderData = resultdata;
        switch (resultdata.FunctionID) {
          case 5:
            if (resultdata.Result > 0) {
            }
            break;
          case 6:
            if (resultdata.Result > 0) {
              if (writeNumber === resultdata.UID) {
                bindMerchantCard();
              }
            } else {
              writeStatus = false;
              if (resultdata.Result == -3 || resultdata.Result == -4) {
                proxy.$message.error("请接入实体会员卡！");
                return;
              }
              if (resultdata.Result == -1) {
                proxy.$message.error("没有找到IC卡读卡器！");
                return;
              }
              alert("写入失败，错误：" + resultdata.Result);
            }
            break;
        }
      });
    });
    const merchantInfo = ref({
      name: null,
      id: null,
      liaison: null,
      phone: null,
    });
    const state = reactive({
      data: {
        walletId: null, //钱包id
        id: null, //id
        userId: null, //用户id
        code: null, //会员卡号
        holder: null, // 用户名称
        phone: null, //联系人电话
        liaison: null, //联系人
      },
      spinning: false,
      isEdit: false,
      operate: "发卡",
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
        pageSizeOptions: 10,
        // showSizeChanger: true,
        // pageSizeOptions: ["1", "5", "10", "20", "50"],
        // showTotal: (total) => `共${total}条数据`,
      },
      loading: false,
      tableHeight: 0,
      modalSearch: [
        {
          label: "",
          value: "keyword",
          placeholder: "商户名称",
        },
      ],
      activeId: [],
      rfidreaderData: null,
    });

    const selectedRowKeys = ref(null);

    const getMerchant = (data) => {
      state.loading = true;
      proxy.$api
        .merchant(data,"get" )
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
      if (!state.rfidreaderData) {
        proxy.$message.warn("创建友我科技RFID云服务连接失败，请先安装！");
        top.location =
          "http://www.youwokeji.com.cn/CloudReader/YOWORFIDReaderCloudForWeb.exe";
        return;
      }
      state.data.supplierId = merchantInfo.value.id;
      bindForm.value.validate().then(async () => {
        ciphertext = "";
        let data = await proxy.$api.vipCardEncode({
          supplierId: state.data.supplierId,
          code: state.data.code,
          tenant: getNowEnterprise().code,
        },"post");
        // proxy.$api.vipCardEncode("post",{supplierId:state.data.supplierId,code:state.data.code}).then(res =>{
        // })
        if (data) {
          ciphertext = data;
          // 每次写卡赋值为true
          writeStatus = true;
          data = data.padEnd(96, "0");
          // ic卡每个块最大能写16字节  固定从第3扇区第二块开始写值
          if (data.length > 96) {
            // 每个扇区分4块，第一块放默认秘钥，不进行写值，固定不进行跨扇区写值
            proxy.$message.error("数据错误");
          } else {
            // 超过16字节截取后分区写
            let strArr = [],
              n = 3;
            for (let i = 0, l = data.length; i < l / 32; i++) {
              let a = data.slice(32 * i, 32 * (i + 1));
              strArr.push(a);
            }
            writeNumber = strArr.length; //记录下本次写卡需要写几次
            currentWriteNumber = 0;
            strArr.forEach((item, index) => {
              if (writeStatus) {
                //数据过长需要写多个块时，写到某个块失败就终止写卡
                currentWriteNumber++; //记录当次写卡是第几次写值
                WriteBlock(12 + index, item, currentWriteNumber);
              }
            });
          }
        }
      });
      //  if(data){

      //   // ic卡每个块最大能写16字节  固定从第3扇区第二块开始写值
      //   if(data.lenth<=32){

      //     WriteBlock(9,data)
      //   }
      //   // 每个扇区分4块，第一块放默认秘钥，不进行写值，固定不进行跨扇区写值
      //   else if(data.lenth>96){
      //     proxy.$message.error("数据错误，无法写值");
      //   }
      //   // 超过16字节截取后分区写
      //   else{
      //   }
      // }
      // state.data.supplierId = merchantInfo.value.id;
      // bindForm.value.validate().then(() => {
      //   proxy.$api
      //     .addMemberCard("post", state.data)
      //     .then(() => {
      //       bindForm.value.resetFields();
      //       proxy.$message.success("操作成功");
      //       router.back(-1);
      //     })
      //     .catch(() => {
      //       proxy.$message.error("保存失败");
      //     })
      //     .finally(function(){});
      // });
    };
    // 写卡
    const WriteBlock = (blockID, data, currentWriteNumber) => {
      rfidreader.KeyMode = 0;
      rfidreader.KeyStringMode = 0;
      rfidreader.Repeat = 0;
      rfidreader.UID = currentWriteNumber;
      rfidreader.KeyString = "FFFFFFFFFFFF";
      rfidreader.M1WriteBlock(blockID, data, 0);
    };
    const readBlock = (blockID) => {
      rfidreader.KeyMode = 0;
      rfidreader.KeyStringMode = 0;
      rfidreader.Repeat = 0;
      rfidreader.M1ReadBlock(blockID, 0);
    };
    const bindMerchantCard = async () => {
      const data = await proxy.$api.bindMerchantCard( {
        supplierId: state.data.supplierId,
        code: state.data.code,
        ciphertext: ciphertext,
        tenant: getNowEnterprise().code,
      },"post");
      if (data) {
        proxy.$message.success("绑定成功");
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
      if (merchantInfo.value.id) {
        state.activeId = [merchantInfo.value.id];
      }
      state.visible = true;
    };

    const onSelectChange = (changableRowKeys, selectedRows) => {
      selectedRowKeys.value = changableRowKeys;
      if (selectedRows instanceof Array) {
        merchantInfo.value.id = selectedRows[0].id;
        merchantInfo.value.name = selectedRows[0].name;
        merchantInfo.value.liaison = selectedRows[0].liaison;
        merchantInfo.value.phone = selectedRows[0].phone;
      } else {
        merchantInfo.value.id = selectedRows.id;
        merchantInfo.value.name = selectedRows.name;
        merchantInfo.value.liaison = selectedRows.liaison;
        merchantInfo.value.phone = selectedRows.phone;
      }
    };
    const rowSelection = computed(() => {
      return {
        type: "radio",
        selectedRowKeys: unref(selectedRowKeys),
        onChange: onSelectChange,
      };
    });

    const getInfo = (data) => {
      if (data && data[0]) {
        merchantInfo.value = data[0];
        state.data.holder = data[0].name;
        state.data.liaison = data[0].liaison;
        state.data.phone = data[0].phone;
      }
      state.visible = false;
    };

    const customRow = (record) => {
      return {
        onClick: () => {
          onSelectChange(record.id, record);
        },
      };
    };

    const search = () => {
      getMerchant({ pageNumber: 1, ...model });
    };

    watch(
      () => state.data.holder,
      () => {
        if (state.data.holder) {
          bindForm.value.clearValidate("holder");
        }
      }
    );

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
      search,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");
</style>
