<template lang="pug">
g-table(
  ref="feeDetail"
  title="收费明细"
  :columns="chargeActive.columns"
  :search="chargeActive.search"
  :api="chargeActive.api"  
  :slots="chargeActive.slots"
  :btns="btns"
  :beforeGet="beforeGet"
  :editMode="'page'"
  @slot="changeStatus"
  :scrollX="800"
  :key="chargeActive.value"
)
  template(v-slot:btn="item")
    a-popconfirm(
      title="是否删除当前选中？"
      cancelText="取消"
      okText="确定"
      @confirm.stop="DeleteRecord(item.record)")
      a-button.deleteRow(type="link" @click.stop="") 删除
  template(#content-left)
    .charge-type
      .charge-item(v-for="item in chargeList" :class="item.value===chargeActive.value?'primary-color':''" @click="clickCharge(item)") {{item.name}}
</template>
<script lang='jsx'>
import {
  defineComponent,
  reactive,
  ref,
  onMounted,
  onBeforeUnmount,
  toRefs,
  watch,
  getCurrentInstance,
} from "vue";
import { useRouter } from "vue-router";
import { millennial } from "@/utils/common";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();

    const state = reactive({
      chargeActive: {
        value: "CARMODEL_CATEGORY",
        columns: [
          {
            dataIndex: "carTypeName",
            title: "车型名称",
            customRender: ({ text }) => {
              return (
                <PopOver position="topLeft" content={text ? text : ""}>
                  {text ? text : "--"}
                </PopOver>
              );
            },
          },
          {
            dataIndex: "goodsName",
            title: "商品品类",
            customRender: ({ text }) => {
              return (
                <PopOver position="topLeft" content={text ? text : ""}>
                  {text ? text : "--"}
                </PopOver>
              );
            },
          },
          {
            dataIndex: "enterChargeValue",
            title: "通用进场费用（元）",
            slots: { customRender: "enterChargeValue" },
            customRender: ({ text }) => {
              return (
                <PopOver
                  position="topLeft"
                  content={text ? text : text === 0 ? "0.00" : ""}
                >
                  {text ? millennial(text) : text === 0 ? "0.00" : "--"}
                </PopOver>
              );
            },
          },
          {
            dataIndex: "specialChargeValue",
            title: "指定进场费用（元）",
            slots: { customRender: "specialChargeValue" },
            customRender: ({ text }) => {
              return (
                <PopOver
                  position="topLeft"
                  content={text ? text : text === 0 ? "0.00" : ""}
                >
                  {text ? millennial(text) : text === 0 ? "0.00" : "--"}
                </PopOver>
              );
            },
          },
          {
            dataIndex: "status",
            title: "状态",
            slots: {
              customRender: "status",
            },
          },
          { title: "操作", slots: { customRender: "action" }, fixed: "right" },
        ],
        search: [
          {
            placeholder: "车型名称",
            value: "carTypeId",
            component: "g-select",
            url: "carTypeConfigList",
            field: { carTypeName: "label", id: "value" },
          },
          {
            value: "chargeCategoryCode",
            defaultValue: "CARMODEL_CATEGORY",
            component: "span",
          },
        ],
        api: {
          list: "chargeRuleList",
          path: "/feeDetailOperate",
          pathParams: [{ value: "model", defaultValue: "CATEGORY_WEIGHT" }],
        },
        slots: [
          {
            component: "a-switch",
            slot: "status",
          },
        ],
      },
      chargeList: [
        {
          value: "CARMODEL_CATEGORY",
          name: "按车型+品类收费",
          columns: [
            {
              dataIndex: "carTypeName",
              title: "车型名称",
              slots: { customRender: "carTypeName" },
              customRender: ({ text }) => {
                return (
                  <PopOver position="topLeft" content={text}>
                    {text ? text : "--"}
                  </PopOver>
                );
              },
            },
            {
              dataIndex: "goodsName",
              title: "商品品类",
              slots: { customRender: "goodsName" },
              customRender: ({ text }) => {
                return (
                  <PopOver position="topLeft" content={text}>
                    {text ? text : "--"}
                  </PopOver>
                );
              },
            },
            {
              dataIndex: "enterChargeValue",
              title: "通用进场费用（元）",
              slots: { customRender: "enterChargeValue" },
              customRender: ({ text }) => {
                return (
                  <PopOver
                    position="topLeft"
                    content={text ? text : text === 0 ? "0.00" : ""}
                  >
                    {text ? millennial(text) : text === 0 ? "0.00" : "--"}
                  </PopOver>
                );
              },
            },
            {
              dataIndex: "specialChargeValue",
              title: "指定进场费用（元）",
              slots: { customRender: "specialChargeValue" },
              customRender: ({ text }) => {
                return (
                  <PopOver
                    position="topLeft"
                    content={text ? text : text === 0 ? "0.00" : ""}
                  >
                    {text ? millennial(text) : text === 0 ? "0.00" : "--"}
                  </PopOver>
                );
              },
            },
            {
              dataIndex: "status",
              title: "状态",
              slots: {
                customRender: "status",
              },
            },
            {
              title: "操作",
              slots: { customRender: "action" },
              fixed: "right",
            },
          ],
          search: [
            {
              placeholder: "车型名称",
              value: "carTypeId",
              component: "g-select",
              url: "carTypeConfigList",
              field: { carTypeName: "label", id: "value" },
            },
            {
              value: "chargeCategoryCode",
              defaultValue: "CARMODEL_CATEGORY",
              component: "span",
            },
          ],
          api: {
            list: "chargeRuleList",
            path: "/feeDetailOperate",
            pathParams: [{ value: "model", defaultValue: "CARMODEL_CATEGORY" }],
          },
          slots: [
            {
              component: "a-switch",
              slot: "status",
            },
          ],
        },
        //table
        {
          value: "CATEGORY_WEIGHT",
          name: "按品类+重量收费",
          columns: [
            {
              dataIndex: "goodsName",
              title: "商品品类",
              customRender: ({ text }) => {
                return (
                  <PopOver position="topLeft" content={text ? text : ""}>
                    {text ? text : "--"}
                  </PopOver>
                );
              },
            },
            {
              dataIndex: "measureUnit",
              title: "计量单位（kg/T）",
              customRender: ({ text }) => {
                return (
                  <PopOver position="topLeft" content={text ? text : ""}>
                    {text ? text : "--"}
                  </PopOver>
                );
              },
            },
            {
              dataIndex: "weightType",
              title: "重量取值",
              slots: {
                customRender: "weightType",
              },
              customRender: ({ text }) => {
                if (text === "NET_WEIGHT") {
                  return (
                    <PopOver position="topLeft" content="净重">
                      净重
                    </PopOver>
                  );
                } else if (text === "WEIGH_VALUE") {
                  return (
                    <PopOver position="topLeft" content="毛重">
                      毛重
                    </PopOver>
                  );
                } else {
                  return "--";
                }
              },
            },
            {
              dataIndex: "enterChargeValue",
              title: "通用进场费用（元）",
              slots: { customRender: "enterChargeValue" },
              customRender: ({ text }) => {
                return (
                  <PopOver
                    position="topLeft"
                    content={text ? text : text === 0 ? "0.00" : ""}
                  >
                    {text ? millennial(text) : text === 0 ? "0.00" : "--"}
                  </PopOver>
                );
              },
            },
            {
              dataIndex: "specialChargeValue",
              title: "指定进场费用（元）",
              slots: { customRender: "specialChargeValue" },
              customRender: ({ text }) => {
                return (
                  <PopOver
                    position="topLeft"
                    content={text ? text : text === 0 ? "0.00" : ""}
                  >
                    {text ? millennial(text) : text === 0 ? "0.00" : "--"}
                  </PopOver>
                );
              },
            },
            {
              dataIndex: "status",
              title: "状态",
              slots: {
                customRender: "status",
              },
            },
            {
              title: "操作",
              slots: { customRender: "action" },
              fixed: "right",
            },
          ],
          search: [
            {
              placeholder: "重量取值",
              value: "measureUnit",
              component: "a-select",
              options: [
                { name: "T", value: "T" },
                { name: "KG", value: "KG" },
              ],
            },
            { placeholder: "商品品类", value: "goodsName" },
            {
              value: "chargeCategoryCode",
              defaultValue: "CATEGORY_WEIGHT",
              component: "span",
            },
          ],
          api: {
            list: "chargeRuleList",
            path: "/feeDetailOperate",
            pathParams: [{ value: "model", defaultValue: "CATEGORY_WEIGHT" }],
          },
          slots: [
            {
              component: "a-switch",
              slot: "status",
            },
          ],
        },
        {
          value: "AREA_CARMODEL",
          name: "按区域+车型收费",
          columns: [
            {
              dataIndex: "areaName",
              title: "区域名称",
              customRender: ({ text }) => {
                return (
                  <PopOver position="topLeft" content={text ? text : ""}>
                    {text ? text : "--"}
                  </PopOver>
                );
              },
            },
            {
              dataIndex: "carTypeName",
              title: "车型名称",
              customRender: ({ text }) => {
                return (
                  <PopOver position="topLeft" content={text ? text : ""}>
                    {text ? text : "--"}
                  </PopOver>
                );
              },
            },
            {
              dataIndex: "enterChargeValue",
              title: "通用进场费用（元）",
              slots: { customRender: "enterChargeValue" },
              customRender: ({ text }) => {
                return (
                  <PopOver
                    position="topLeft"
                    content={text ? text : text === 0 ? "0.00" : ""}
                  >
                    {text ? millennial(text) : text === 0 ? "0.00" : "--"}
                  </PopOver>
                );
              },
            },
            {
              dataIndex: "specialChargeValue",
              title: "指定进场费用（元）",
              slots: { customRender: "specialChargeValue" },
              customRender: ({ text }) => {
                return (
                  <PopOver
                    position="topLeft"
                    content={text ? text : text === 0 ? "0.00" : ""}
                  >
                    {text ? millennial(text) : text === 0 ? "0.00" : "--"}
                  </PopOver>
                );
              },
            },
            {
              dataIndex: "status",
              title: "状态",
              slots: {
                customRender: "status",
              },
            },
            {
              title: "操作",
              slots: { customRender: "action" },
              fixed: "right",
            },
          ],
          search: [
            {
              placeholder: "区域名称",
              value: "areaId",
              component: "g-cascader",
              url: "getAreaList",
            },
            {
              value: "chargeCategoryCode",
              defaultValue: "AREA_CARMODEL",
              component: "span",
            },
          ],
          api: {
            list: "chargeRuleList",
            path: "/feeDetailOperate",
            pathParams: [{ value: "model", defaultValue: "AREA_CARMODEL" }],
          },
          slots: [
            {
              component: "a-switch",
              slot: "status",
            },
          ],
        }, //table
        {
          value: "AREA_WEIGHT",
          name: "按区域+重量收费",
          columns: [
            {
              dataIndex: "areaName",
              title: "区域名称",
              customRender: ({ text }) => {
                return (
                  <PopOver position="topLeft" content={text ? text : ""}>
                    {text ? text : "--"}
                  </PopOver>
                );
              },
            },
            {
              dataIndex: "measureUnit",
              title: "计量单位（kg/T）",
              customRender: ({ text }) => {
                return (
                  <PopOver position="topLeft" content={text ? text : ""}>
                    {text ? text : "--"}
                  </PopOver>
                );
              },
            },
            {
              dataIndex: "weightType",
              title: "重量取值",
              slots: {
                customRender: "weightType",
              },
              customRender: ({ text }) => {
                if (text === "NET_WEIGHT") {
                  return (
                    <PopOver position="topLeft" content="净重">
                      净重
                    </PopOver>
                  );
                } else if (text === "WEIGH_VALUE") {
                  return (
                    <PopOver position="topLeft" content="毛重">
                      毛重
                    </PopOver>
                  );
                } else {
                  return "--";
                }
              },
            },
            {
              dataIndex: "enterChargeValue",
              title: "通用进场费用（元）",
              slots: { customRender: "enterChargeValue" },
              customRender: ({ text }) => {
                return (
                  <PopOver
                    position="topLeft"
                    content={text ? text : text === 0 ? "0.00" : ""}
                  >
                    {text ? millennial(text) : text === 0 ? "0.00" : "--"}
                  </PopOver>
                );
              },
            },
            {
              dataIndex: "specialChargeValue",
              title: "指定进场费用（元）",
              slots: { customRender: "specialChargeValue" },
              customRender: ({ text }) => {
                return (
                  <PopOver
                    position="topLeft"
                    content={text ? text : text === 0 ? "0.00" : ""}
                  >
                    {text ? millennial(text) : text === 0 ? "0.00" : "--"}
                  </PopOver>
                );
              },
            },
            {
              dataIndex: "status",
              title: "状态",
              slots: {
                customRender: "status",
              },
            },
            {
              title: "操作",
              slots: { customRender: "action" },
              fixed: "right",
            },
          ],
          search: [
            {
              placeholder: "区域名称",
              value: "areaId",
              component: "g-cascader",
              url: "getAreaList",
            },
            {
              value: "chargeCategoryCode",
              defaultValue: "AREA_WEIGHT",
              component: "span",
            },
          ],
          api: {
            list: "chargeRuleList",
            path: "/feeDetailOperate",
            pathParams: [{ value: "model", defaultValue: "AREA_WEIGHT" }],
          },
          slots: [
            {
              component: "a-switch",
              slot: "status",
            },
          ],
        },
      ],
      btns: ["add", "edit", "delete"],
    });
    const clickCharge = (item) => {
      state.chargeActive = item;
    };

    const feeDetail = ref();

    const changeStatus = async (slot, record) => {
      await proxy.$api.chargeRuleStatus({
        id: record.id,
        status: record.status,
      },"put");
      proxy.$message.success("操作成功");
      feeDetail.value.getData();
    };

    const DeleteRecord = async (item) => {
      await proxy.$api.chargeRuleDelete(item.id,"delete");
      proxy.$message.success("操作成功");
      feeDetail.value.getData();
    };
    const beforeGet = (form) => {
      if (form.areaId && form.areaId.length > 0) {
        return { ...form, areaId: form.areaId[form.areaId.length - 1] };
      } else {
        return form;
      }
    };
    onMounted(() => {
      if (sessionStorage.getItem("chargeCategoryCode")) {
        const data = state.chargeList.filter(
          (item) => item.value === sessionStorage.getItem("chargeCategoryCode")
        );
        state.chargeActive = data[0];
      } else {
        state.chargeActive = state.chargeList[0];
      }
    });

    onBeforeUnmount(() => {
      sessionStorage.removeItem("chargeCategoryCode");
    });

    return {
      feeDetail,
      ...toRefs(state),
      clickCharge,
      changeStatus,
      DeleteRecord,
      beforeGet,
    };
  },
});
</script>
<style lang="less" scoped>
.charge-type {
  width: 200px;
  height: 100%;
  margin-right: 10px;
  border: 1px solid #f3f3f3;
  border-bottom: none;
  .charge-item {
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid #f3f3f3;
    cursor: pointer;
  }
}
:deep(.ant-form-item) {
  text-align: left;
}
</style>
