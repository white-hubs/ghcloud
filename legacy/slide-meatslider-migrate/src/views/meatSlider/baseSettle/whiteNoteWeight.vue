<template lang="pug">
g-table(
    title="白条重量设置"
    :api="api"
    :columns="columns"
    :modal="modal"
    :rules="rules"
    :scrollX="850"
    tableCode="WHITE_NOTE_WEIGHT"
    :btns="['add','edit','deleteSingle']"
)  
</template>
      <script lang="jsx">
      import {
        defineComponent,
        getCurrentInstance,
        onMounted,
        reactive,
        toRefs,
      } from "vue";
    import { millennial, getFreshLabel } from "@/utils/common";
      
      export default defineComponent({
        setup() {
          const { proxy } = getCurrentInstance();
          const state = reactive({
            api: {
              list: "getGoodsWeightConfigs",
              add: "addGoodsWeightConfigs",
              edit: "updateGoodsWeightConfigs",
              deleteSingle: "deleteGoodsWeightConfigs",
              detail: "record",
            },
            columns: [
              {
                title: "商品品类",
                dataIndex: "goodsCategoryName",
                customRender: ({ text }) => {
                  return (
                    <PopOver position="topLeft" content={text ? text : ""}>
                      {text ? text : "--"}
                    </PopOver>
                  );
                },
              },
              {
                title: "标准重量（kg）",
                dataIndex: "standardWeight",
                customRender: ({ text }) => {
                  return (
                    <PopOver position="topLeft" content={text ? text : "--"}>
                      {text || text === 0 ? `${millennial(text)}` : "--"}
                    </PopOver>
                  );
                },
              },
              {
                title: "冷热鲜",
                dataIndex: "freshLabel",
                customRender: ({ text }) => {
                  return (
                    <PopOver position="topLeft" content={text ? text : "--"}>
                      <span style="margin-left:5px;" class={text ? getFreshLabel(text).color : "" }>{text ? getFreshLabel(text).name : "--"}</span>
                    </PopOver>
                  );
                },
              },
              {
                title: "备注",
                dataIndex: "remark",
                key: "remark",
                customRender: ({ text }) => {
                  return (
                    <PopOver position="topLeft" content={text ? text : ""}>
                      {text ? text : "--"}
                    </PopOver>
                  );
                },
              },
              {
                title: "操作",
                slots: {
                  customRender: "action",
                },
              },
            ],
            modal: [
              {
                label: "商品品类",
                value: "goodsCategoryIds",
                component: "g-cascader",
                placeholder: "请选择商品品类",
                url: "getGoodsTypeList",
                field: {
                  id: "value",
                  name: "label",
                },
              },
              {
                label: "标准重量",
                value: "standardWeight",
                placeholder: "请输入标准重量（kg）",
                component: "a-input-number",
                style: {
                  width: "100%",
                },
                addonAfter: "kg"
              },
              {
                label: "冷热鲜",
                value: "freshLabel",
                component: "g-select",
                options: [
                    {
                      value: 'COLD_FRESH',
                      name: "冷鲜",
                      label: "冷鲜",
                    },
                    {
                      value: 'HOT_FRESH',
                      name: "热鲜",
                      label: "热鲜",
                    },
                    {
                      value: 'FROZEN',
                      name: "冻品",
                      label: "冻品",
                    },
                ],
                defaultValue: "",
                placeholder: "请选择冷热鲜",
              },
              {
                label: "备注信息",
                value: "remark",
                component: "a-textarea",
                singleLine: true,
                placeholder: "请输入备注信息",
              },
            ],
            rules: {
              goodsCategoryIds: [{ required: true, message: "请选择商品品类" }],
              standardWeight: [{ required: true, message: "请输入标准重量" }],
            },
          });
          const beforeSave = (record) => {
            let goodsCategoryIds = Array.isArray(record.goodsCategoryIds) ? record.goodsCategoryIds.join(',') : record.goodsCategoryIds
            Object.assign(record, { goodsCategoryId: goodsCategoryIds });
            return record;
          };
          return {
            ...toRefs(state),
            beforeSave
          };
        },
      });
      </script>
      <style lang="less">
      #panelTypes {
        .ant-checkbox-group-item {
          width: 30%;
        }
      }
      .ant-modal .ant-modal-body .ant-form .g-select.ant-select{
        width: 100% !important;
      }
      </style>
      