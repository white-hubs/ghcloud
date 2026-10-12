<template lang="pug">
div.datactr
  div.infoTitle.verticalLine 租户租用信息
  div.dataTitle 
    a-spin(:spinning="spinning")
      div
        div.name 租用概览
        div.dataDetails 
          div 
            span.itemName 租户名称：
            span.itemContent {{data?.name? data?.name:'--'}}
          //- div 
            span.itemName 租用总应用数：
            span.itemContent {{data?.merchantCode? data?.merchantCode:'--'}}
          //- div 
            span.itemName 到期应用数：
            span.itemContent {{data?.porkReportCode? data?.porkReportCode:'--'}}
          //- div 
            span.itemName 正常应用数：
            span.itemContent {{data?.practicalArea? data?.practicalArea:'--'}} 
      div      
        div.flex.justify-between.name.pr2.bottomLine
          div 租用详情
          a-button(type="primary" @click="openProductModal") 添加产品
        //- a-table.p2(
          v-if="data?.applicationVOS"
          :data-source="data?.applicationVOS"
          :columns="columns"
          size="small"
          bordered
          :rowKey="(record)=>record.id"
          :pagination="pagination"
          @change="changePage"
          :loading="loading") 
          tempalte(#title)
            div.flex
              a-form(layout="inline" :model="model")
                a-form-item(label="")
                  a-input(v-model:value="model.keyword")
          template(#enabled="{record,text}")
            a-switch(:checked="text")
           
        template(v-for="item,index in data?.productVOS" :key="item.id") 
          div.p2.flex.justify-between
            div.productLineName  {{item.name}}
            a-button(type="primary" @click="showModal(item,index)") 添加应用
          div.ml2  
            template(v-for="ele,idx in item.applicationVOS" :key="ele.id") 
              a-tooltip(v-if="ele.name.length > 4" :title="ele.name")
                a-tag(:closable="!ele.icon" @close="handleClose(index,ele)") {{ `${ele.name.slice(0, 4)}...` }}
              a-tag(v-else :closable="!ele.icon" @close="handleClose(index,ele)") {{ele.name}}
        a-empty(v-if="!data?.productVOS")      
  div.btnctr
    a-space(:size="16")
      a-button(@click="cancel") 返回
      a-button(type="primary" @click="save") 保存
  a-modal(v-model:visible="visible" title="新增租用" @cancel="closeModal" @ok="addApp" :maskClosable="false" centered)
    a-form(ref="remarkForm" :model="dataForm" :rules="rules" labelAlign="right")
      template(v-if="checkedType === 'applications'")
        a-form-item(:label="`租用租户`")
          span {{data?.name}}
        a-form-item(label="租用应用" name="rentApp")
          Select(v-model:value="dataForm.rentApp" :placeholder="'请选择应用'" :size="'large'" :dataMethod="'productApp'" :params="params" :mode="'multiple'")   
      template(v-else) 
        a-form-item(label="新增产品" name="product")    
          Select(v-model:value="dataForm.product" :placeholder="'请选择产品'" :dataMethod="'productList'" :size="'large'" :mode="'multiple'")
          //- a-input(v-model:value="dataForm.product")
</template>
<script lang='jsx'>
import {
  defineComponent,
  reactive,
  getCurrentInstance,
  ref,
  toRefs,
  createVNode,
  onMounted,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { timeFormat, tableColumns } from "@/utils/common";
import { Modal } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";

export default defineComponent({
  setup() {
    const { proxy, ctx } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const formState = reactive({
      data: null,
      nowProduct: null,
      nowProductLineIndex: null,
      params: { id: "" },
      products: [],
      checkedType: "",
    });

    const tableState = reactive({
      columnList: ["name", "enabled"],
      columns: null,
      loading: false,
      pagination: {
        current: 1,
        total: 0,
        defaultPageSize: 10,
      },
    });

    const status = reactive({
      spinning: false,
    });

    const remarkForm = ref();
    const visible = ref(false);
    const dataForm = reactive({
      id: "",
      rentApp: [],
      product: [],
    });
    const rules = {
      rentApp: [
        {
          required: true,
          message: "请选择租用应用",
        },
      ],
      product: [
        {
          required: true,
          message: "请选择添加产品",
        },
      ],
    };

    onMounted(() => {
      tableState.columns = tableColumns("rentDetails", tableState.columnList);
      if (code) {
        getData({ code: code });
      }
    });

    // 有code
    const code = route.query.tenantCode;

    const getData = async (data) => {
      status.spinning = true;
      await proxy.$api.tenantCode("get", data).then((res) => {
        formState.data = res;
        // tableState.pagination.total = res.total;
        status.spinning = false;
      });
    };

    const cancel = () => {
      formState.data = null;
      router.back(-1);
    };

    const showModal = (item, index) => {
      formState.checkedType = "applications";
      formState.params.id = item.id;
      formState.nowProduct = item;
      formState.nowProductLineIndex = index;
      const productLineIds = formState.products.map((item) => item.id);
      if (!productLineIds.includes(item.id)) {
        formState.products.push({
          id: item.id,
          applicationIds: [],
        });
      }

      visible.value = true;
    };

    const openProductModal = () => {
      formState.checkedType = "addProduct";
      visible.value = true;
    };

    const handleClose = (index, ele) => {
      formState.data.productVOS[index].applicationVOS =
        formState.data.productVOS[index].applicationVOS.filter(
          (item) => item.id !== ele.id
        );
    };

    const addApp = async () => {
      remarkForm.value.validate().then(async () => {
        const repeat = [];
        const newData = [];
        if (formState.checkedType === "applications") {
          // 多选状态下循环查询应用信息
          for (let i of dataForm.rentApp) {
            // 查询应用详情
            const data = await proxy.$api.appId("get", i);
            if (data) {
              const obj = {
                id: data.id,
                name: data.name,
              };
              const appIds = formState.data?.productVOS[
                formState.nowProductLineIndex
              ].applicationVOS.map((item) => item.id);

              if (appIds.includes(obj.id)) {
                repeat.push(obj);
              } else {
                newData.push(obj);
              }
            }
          }
          if (repeat.length) {
            for (let i of repeat) {
              proxy.$message.warn(`${i.name}为重复的应用`);
            }
          } else if (newData.length) {
            for (let n of newData) {
              await formState.data?.productVOS[
                formState.nowProductLineIndex
              ].applicationVOS.push(n);
              closeModal();
            }
          }
        } else if (formState.checkedType === "addProduct") {
          for (let j of dataForm.product) {
            // 查询产品详情
            const productDetail = await proxy.$api.productId("get", {
              id: j,
            });
            const productIds = formState.data?.productVOS.map((item) => item.id)
              ? formState.data?.productVOS.map((item) => item.id)
              : [];
            const data = {
              id: j,
              name: productDetail ? productDetail.name : "",
              applicationVOS: [],
            };
            if (productIds.includes(j)) {
              repeat.push(data);
              // proxy.$message.warn(`${productDetail.name}为重复的产品`);
              // return;
            } else {
              // formState.data?.productVOS.push(data);
              newData.push(data);
              closeModal();
            }
          }
          if (repeat.length) {
            for (let i of repeat) {
              proxy.$message.warn(`${i.name}为重复的产品`);
            }
          } else if (newData.length) {
            for (let n of newData) {
              await formState.data?.productVOS.push(n);
              closeModal();
            }
          }
        }
      });
    };

    const closeModal = () => {
      visible.value = false;
      remarkForm.value.resetFields();
    };

    const save = () => {
      Modal.confirm({
        title: "保存",
        content: "是否保存当前操作?",
        okText: "确定",
        cancelText: "取消",
        centered: true,
        onOk: async () => {
          const product = [];
          for (let i of formState.data.productVOS) {
            const data = {
              id: i.id,
              applicationIds: i?.applicationVOS?.length
                ? i?.applicationVOS?.map((item) => item.id)
                : [],
            };
            product.push(data);
          }
          await proxy.$api.tenantCode("put", {
            code: code,
            products: product,
          });
          proxy.$message.success("操作成功");
          getData({ code: code });
        },
      });
    };

    const changePage = (e) => {
      tableState.pagination.current = e.current;
      getData({ id: id, pageNumber: e.current });
    };

    return {
      ...toRefs(status),
      ...toRefs(tableState),
      labelCol: {
        span: 4,
      },
      wrapperCol: {
        span: 14,
      },
      ...toRefs(formState),
      cancel,
      remarkForm,
      visible,
      dataForm,
      rules,
      addApp,
      closeModal,
      changePage,
      save,
      showModal,
      openProductModal,
      handleClose,
    };
  },
});
</script>
<style lang="less" scoped>
// @import url("@/styles/index.less");
@import url("@/styles/dataDetails/index.less");
:deep(.ant-form-item-label) {
  width: 7rem;
  height: 40px;
  line-height: 40px;
  text-align: right;
}
:deep(.ant-form-item-control-input) {
  height: 100%;
  line-height: 1.5;
}
.timesTitle {
  font-family: @fontMedium;
  color: @fontColor;
  font-size: 14px;
  & ~ div {
    font-family: @fontRegular;
    color: @fontColor;
    font-size: 14px;
  }
}
.justify-between {
  align-items: center;
}
</style>
