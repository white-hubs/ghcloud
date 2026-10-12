<template lang="pug">
g-detail(
  ref="detailForm"
  title="抽检上报" 
  :api="api"
  :formList="formList"
  :beforeSave="beforeSave"
  :afterGet="afterGet"
  :rules="rules"
)
  template(v-slot:edit-item="item")
    .item-title 抽检信息
    a-form-item(label="抽检比例" name="requiredCheckRatio")
      span {{item.record?.requiredCheckRatio ? `${item.record?.requiredCheckRatio}%` : '--'}}
    a-form-item(label="规定抽检片数：" name="pratiqueSlices")
      span {{item.record?.requiredCheckSlices ? item.record?.requiredCheckSlices : '--'}}
    a-form-item(label="实际抽检片数：" name="actualCheckSlices")
      a-input-number(v-model:value.trim="item.record.actualCheckSlices" placeholder="实际抽检片数"  :min="0" v-if="route.query.type === 'edit'")
      span(v-else) {{item.record.actualCheckSlices}}
    a-form-item(label="抽检员：" name="inspectorId" v-if="route.query.type === 'edit'") 
      g-select(url="getInspectorList" v-model:value="item.record.inspectorId")
    a-form-item(label="抽检员：" name="inspectorId" v-else) 
      span {{item.record.inspectorName}}
    a-form-item(label="瘦肉精" name="clenbuterol" class="a-form-item-100" v-if="route.query.type === 'edit'")
      a-checkbox-group(v-model:value="clenbuterolIds" @change="handleCheckChange") 
        template(v-for="item in options" :key="item.id")
          span.pt1
            //- a-checkbox(:value="item.id") {{item.name}}
            a-checkbox(:value="item.id") {{item.spotCheckItemName}}
            //-  @change="handleValueChange(item)"
            a-select(
              v-model:value="item.passed"
              style="width: 80px !important"
              :disabled="details || item.selected === 'UNSELECTED'? true : false")
              a-select-option(:value="'POSITIVE'") 阳
              a-select-option(:value="'NEGATIVE'") 阴
              //- a-select-option(:value="true") 阳
              //- a-select-option(:value="false") 阴
    //- a-form-item(label="瘦肉精" name="clenbuterolIds" class="a-form-item-100" v-else)
      template(v-for="i in options" :key="i.id")
          span(v-if="item.record.clenbuterolIds.includes(i.id)") {{i.name}}：
            span.deleteRow.pr2(v-if="i.passed") 阳
            span.normalRow.pr2(v-else) 阴 
    a-form-item(label="瘦肉精" name="clenbuterol" class="a-form-item-100" v-else)
      template(v-for="i in item.record.details" :key="i.id")
          span(v-if="clenbuterolIds.includes(i.id)") {{i.spotCheckItemName}}：
            span.deleteRow.pr2(v-if="i.passed === 'POSITIVE'") 阳
            span.normalRow.pr2(v-else-if="'NEGATIVE'") 阴               
    a-form-item.remark(label="含水量" name="watered" class="a-form-item-100"  v-if="route.query.type === 'edit'")   
      //- item.record.watered
      a-select(
        v-model:value="watered"
        :disabled="details? true : false")
        a-select-option(:value="'POSITIVE'") 阳
        a-select-option(:value="'NEGATIVE'") 阴
        //- a-select-option(:value="'true'") 阳
        //- a-select-option(:value="'false'") 阴
    a-form-item.remark(label="含水量" name="watered" class="a-form-item-100"  v-else)   
      span.itemContent 
        span.deleteRow(v-if="item.record.watered === 'POSITIVE'") 阳
        span.normalRow(v-else-if="'NEGATIVE'") 阴
    a-form-item.remark(label="备注：" name="remark") 
      a-textarea(v-model:value="item.record.remark" showCount :maxlength="200" :auto-size="{ minRows: 2, maxRows: 5 }" v-if="route.query.type === 'edit'" placeholder="请输入")
      span(v-else) {{item.record.remark?item.record.remark:'--'}}
</template>
<script>
import {
  defineComponent,
  reactive,
  getCurrentInstance,
  ref,
  toRefs,
} from "vue";
import { useRoute, useRouter } from "vue-router";

import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons-vue";
import { millennial, getFreshLabel } from "@/utils/common";
export default defineComponent({
  components: {
    MinusCircleOutlined,
    PlusCircleOutlined,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();

    const quarantineRegister = ref();
    const detailForm = ref();

    const state = reactive({
      api: {
        detail: "goodsSafetyId",
        add: "goodsSafety",
        edit: "goodsSafety",
      },
      formList: [
        {
          title: "报备信息",
          form: [
            // { label: "商家名称", value: "merchantName", plaintext: true },
            // { label: "商家编号", value: "merchantCode", plaintext: true },
            { label: "商家名称", value: "supplierName", plaintext: true },
            { label: "商家编号", value: "supplierCode", plaintext: true },
            { label: "报备单号", value: "porkReportCode", plaintext: true },
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
            { label: "报备片数", value: "porkReportSlices", plaintext: true },
            {
              label: "检疫票张数",
              value: "porkReportSlices",
              plaintext: true,
              detailFun: (value) => {
                return value || value === 0
                  ? millennial(Math.ceil(value / 2), false)
                  : "--";
              },
            },
            { label: "备注信息", value: "remark", showCondition: () => false },
            {
              label: "检疫片数",
              value: "pratiqueSlices",
              showCondition: () => false,
            },
            {
              label: "inspectorId",
              value: "inspectorId",
              showCondition: () => false,
            },
          ],
        },
      ],
      rules: {
        clenbuterol: [
          {
            required: true,
            message: "",
          },
          {
            validator(rule, value) {
              if (!value || value === "UNSELECTED") {
                return Promise.reject("请选择瘦肉精");
              } else {
                return Promise.resolve();
              }
            },
          },
        ],
        actualCheckSlices: [
          {
            required: true,
            message: "请输入实际抽检片数",
          },
        ],
        inspectorId: [
          {
            required: true,
            message: "请选择抽检员",
          },
        ],
        watered: [
          {
            required: true,
            message: "请输入",
          },
          // {
          //   validator() {
          //     debugger;
          //     if (state.registerForm.watered === null) {
          //       state.registerForm.watered = false;
          //       return Promise.resolve();
          //     } else {
          //       return Promise.resolve();
          //     }
          //   },
          // },
        ],
      },
      registerForm: {
        // pratiqueSlices: "",
        remark: "",
        ticketInfo: [
          {
            start: "开始票号：",
            end: "结束票号：",
            startKey: "startNum0",
            endKey: "endNum0",
            startNum: "",
            endNum: "",
          },
        ],
        startNum0: "",
        endNum0: "",
      },
    });

    const status = reactive({
      loading: false,
      options: [],
      clenbuterolIds: [],
      watered: "NEGATIVE",
    });

    // 有id
    const id = route.query.id;
    const details = route.query.details;
    if (id) {
      status.loading = true;
      proxy.$api
        .goodsSafetyId({ id: id },"get" )
        .then(async (res) => {
          // debugger
          state.registerForm = { ...state.registerForm, ...res };
          if (!state.registerForm.watered) {
            state.registerForm.watered = false;
          }
          if (
            state.registerForm.inspectorId === 0 ||
            state.registerForm.inspectorId === ""
          ) {
            state.registerForm.inspectorId = null;
          }
          if (
            state.registerForm.actualCheckSlices === 0 ||
            state.registerForm.actualCheckSlices === ""
          ) {
            state.registerForm.actualCheckSlices = null;
          }
          if (res.details) {
            status.options = res.details.map(item=>{
            return item
            });
            status.clenbuterolIds = await res.details
              .filter((item) => item.selected !== "UNSELECTED")
              .map((ele) => ele.id);
          }
          status.watered =
            res.watered === "UNSELECTED" ? "NEGATIVE" : res.watered;
        })
        .finally(() => {
          status.loading = false;
        });
    }

    const cancel = () => {
      router.back(-1);
    };

    const handleCheckChange = async (e) => {
      status.clenbuterolIds = e;
      if (!e.length) {
        detailForm.value.gDetailForm.form.clenbuterol = "";
        status.options = status.options.map((item) => {
          item.selected = "UNSELECTED";
          // item.passed = null;
          return item;
        });
      } else {
        detailForm.value.gDetailForm.form.clenbuterol = "POSITIVE";
        status.options = await status.options.map((item) => {
          if (e.includes(item.id)) {
            item.selected = "SELECTED";
            // item.passed = "NEGATIVE";
          } else {
            item.selected = "UNSELECTED";
            // item.passed = null;
          }
          return item;
        });
        const res = await status.options
          .filter((item) => item.selected === "SELECTED")
          .every((ele) => ele.passed === "NEGATIVE");
        detailForm.value.gDetailForm.form.clenbuterol = res
          ? "NEGATIVE"
          : "POSITIVE";
      }
    };

    const handleValueChange = (e) => {
      // for (let i of state.registerForm.detail) {
      //   if (e.id === i.id) {
      //     i.passed = e.passed;
      //   }
      // }
    };
    const beforeSave = async (form) => {
      status.options = await status.options.filter((item) => {
        if (item.selected === "UNSELECTED") {
          item.passed = "UNSELECTED";
        }
        return item;
      });
      const res = status.options.every(
        (item) => item.passed === "UNSELECTED" || item.passed === "NEGATIVE"
      );
      return {
        ...form,
        details: status.options,
        watered: status.watered,
        clenbuterol: res ? "NEGATIVE" : "POSITIVE",
      };
    };

    const afterGet = (res) => {
      if (res.inspectorId === 0) {
        res.inspectorId = null;
      }
      return res;
    };
    return {
      ...toRefs(status),
      ...toRefs(state),
      route,
      afterGet,
      beforeSave,
      quarantineRegister,
      detailForm,
      cancel,
      // submit,
      details,
      handleCheckChange,
      handleValueChange,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");
.pl2 {
  padding-left: 0px !important;
}
.pt1 {
  margin-right: 50px;
}
.remark{
  word-wrap: break-word;
}
</style>
