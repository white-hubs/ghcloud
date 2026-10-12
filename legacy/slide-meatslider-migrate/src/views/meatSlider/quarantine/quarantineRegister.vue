<template lang="pug">
g-detail(
  title="登记检疫票"
  :formList="formList"
  :api="api"
  :rules="rules"
  :beforeSave="beforeSave"
  :afterGet="afterGet"
  ref="gDetail"
)
  template(v-slot:edit-item="item")
    .item-title 登记检疫票
    a-form-item(label="检疫片数" name="pratiqueSlices")
      a-input-number(v-model:value.trim="item.record.pratiqueSlices" placeholder="请输入检疫片数" :min="0" v-if="route.query.type !== 'detail'")
      span(v-else) {{item.record.pratiqueSlices}} 
    a-form-item(label="检疫票数")
      span {{num}} 
    a-form-item(label="检疫票号信息" name="pratiqueCodes" class="a-form-item-100")
      a-button(@click="addTickets"  type="primary" v-if="route.query.type !== 'detail'") 添加号段
      div(v-for="item,index in item.record.pratiqueCodes" :key="index" v-else) 
        span.mb2.ticketsNum {{item.split('-')[0]}} 
        span.ticketsNum ~     
        span.mb2.ticketsNum {{item.split('-')[1]}}
    div(style="width:100%" v-if="route.query.type !== 'detail'") 
      quarantineRegisterRule.pl2(ref="registerRule"   v-for="item,index in registerForm.ticketInfo" :key="item" :ticketsNum="item" :ticketList="registerForm.ticketInfo" :index="index" @delete-data="deleteItem" @add-data="fillData" @get-status="getStatus")
     
    a-form-item(label="备注信息")
      a-textarea(v-model:value="item.record.remark" showCount :maxlength="200" allowClear  :auto-size="{ minRows: 2, maxRows: 5 }" placeholder="请输入" v-if="route.query.type !== 'detail'")
      span(v-else) {{item.record.remark?item.record.remark:'--'}}  
</template>
<script>
import {
  defineComponent,
  reactive,
  getCurrentInstance,
  ref,
  computed,
  toRefs,
  watch,
  onMounted,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import _ from "lodash";
import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons-vue";

import quarantineRegisterRule from "./quarantineRegisterRule.vue";
import { timeFormat, millennial, getFreshLabel } from "@/utils/common";

export default defineComponent({
  components: {
    MinusCircleOutlined,
    PlusCircleOutlined,
    quarantineRegisterRule,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();

    const registerRule = ref();
    const gDetail = ref();

    const state = reactive({
      registerForm: {
        // pratiqueSlices: "",
        remark: "",
        ticketInfo: [
          {
            startNum: "",
            endNum: "",
          },
        ],
      },
    });

    const status = reactive({
      formList: [
        {
          title: "报备信息",
          form: [
            {
              label: "商家名称",
              value: "supplierName",
              plaintext: true,
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
            { label: "商家编号", value: "supplierCode", plaintext: true },
            // { label: "商家名称", value: "merchantName", plaintext: true },
            // { label: "商家编号", value: "merchantCode", plaintext: true },
            { label: "报备单号", value: "porkReportCode", plaintext: true },
            {label: "报备商品", value: "goodsCategoryName",disabled: true,
              html: true,
              detailFun: (value, form) => {
                return `<span style="margin-left:5px;"> ${form.goodsCategoryName ? form.goodsCategoryName: "--"} </span><span class="${
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
                return value ? millennial(Math.ceil(value / 2), false) : 0;
              },
            },
            { label: "备注信息", value: "remark", showCondition: () => false },
            {
              label: "检疫片数",
              value: "pratiqueSlices",
              showCondition: () => false,
            },
          ],
        },
      ],
      api: {
        detail: "pratiqueRegisterId",
        add: "pratiqueRegister",
        edit: "pratiqueRegister",
      },
      rules: {
        pratiqueSlices: [
          {
            required: true,
            message: "请输入正确的片数（正整数）",
            pattern: new RegExp(/^[1-9]\d*$/, "g"),
          },
        ],
        pratiqueCodes: [
          {
            required: true,
            message: "请输入检疫票信息",
          },
        ],
      },
      loading: false,
      ticketsList: null,
      num: 0,
      checkStatus: null,
    });

    const getStatus = (value) => {
      status.checkStatus = value;
    };

    // 填充数据
    const fillData = (index, model) => {
      state.registerForm.ticketInfo[index].startNum =
        model.startNum || model.endNum;
      state.registerForm.ticketInfo[index].endNum =
        model.endNum || model.startNum;
      state.registerForm.ticketInfo[index].status = model.status;
      gDetail.value.gDetailForm.form.pratiqueCodes = [];
      state.registerForm.ticketInfo.forEach((item) => {
        if (item.status) {
          if (item.startNum && item.endNum) {
            gDetail.value.gDetailForm.form.pratiqueCodes.push(
              `${item.startNum}-${item.endNum}`
            );
          } else if (item.startNum && !item.endNum) {
            gDetail.value.gDetailForm.form.pratiqueCodes.push(
              `${item.startNum}-${item.startNum}`
            );
          } else if (!item.startNum && item.endNum) {
            gDetail.value.gDetailForm.form.pratiqueCodes.push(
              `${item.endNum}-${item.endNum}`
            );
          }
        }
      });
    };

    // 添加票段
    const add = () => {
      state.registerForm.ticketInfo.push({
        startNum: "",
        endNum: "",
      });
    };
    // 先校验再添加票段
    const addTickets = () => {
      const res = state.registerForm.ticketInfo.every((item) => {
        return item.startNum || item.endNum;
      });
      if (res) {
        add();
      } else {
        proxy.$message.warn("请至少填写开始票号或结束票号");
      }
    };

    // 删减票段
    const deleteItem = (index) => {
      state.registerForm.ticketInfo.splice(index, 1);
      gDetail.value.gDetailForm.form.pratiqueCodes = [];
      state.registerForm.ticketInfo.forEach((item) => {
        if (item.status) {
          if (item.startNum && item.endNum) {
            gDetail.value.gDetailForm.form.pratiqueCodes.push(
              `${item.startNum}-${item.endNum}`
            );
          } else if (item.startNum && !item.endNum) {
            gDetail.value.gDetailForm.form.pratiqueCodes.push(
              `${item.startNum}-${item.startNum}`
            );
          } else if (!item.startNum && item.endNum) {
            gDetail.value.gDetailForm.form.pratiqueCodes.push(
              `${item.endNum}-${item.endNum}`
            );
          }
        }
      });
    };

    // 字符串拼接

    const cancel = () => {
      router.back(-1);
    };

    const merge = (intervals, r = []) => {
      // 排序后的数组
      const sortArr = _.cloneDeep(intervals).sort(
        (a, b) => a?.startNum - b?.startNum
      );

      const len = sortArr.length;
      for (let i = 0; i < len; i++) {
        if (!r.length) {
          r.unshift(sortArr[i]);
        } else {
          if (sortArr[i].startNum <= r[0].endNum + 1) {
            r[0].endNum = Math.max(sortArr[i].endNum, r[0].endNum);
          } else {
            r.unshift(sortArr[i]);
          }
        }
      }
      const res = r.every((item) => {
        return item.startNum && item.endNum;
      });
      if (res) {
        status.num = 0;
        for (let idx of r) {
          if (idx.startNum !== "" && idx.endNum !== "") {
            status.num += Number(idx.endNum) - Number(idx.startNum) + 1;
            if (r.length === 1 && !r[0].startNum && !r[0].endNum) {
              status.num = status.num - 1;
            }
          }
        }
      }
      return r;
    };

    watch(
      () => state.registerForm.ticketInfo,
      () => {
        status.ticketsList = merge(state.registerForm.ticketInfo, []);
      },
      {
        deep: true,
      }
    );
    const afterGet = (res) => {
      state.registerForm.ticketInfo = [];
      if (res.pratiqueCodes?.length) {
        for (let i = 0; i < res.pratiqueCodes?.length; i++) {
          // debugger;
          const begin = res.pratiqueCodes[i].split("-")[0];
          const end = res.pratiqueCodes[i].split("-")[1];
          if (i === 0) {
            state.registerForm.ticketInfo[0] = {
              startNum: begin,
              endNum: end,
              status: true,
            };
          } else {
            state.registerForm.ticketInfo.push({
              startNum: begin,
              endNum: end,
              status: true,
            });
          }
        }
      }
      res.pratiqueSlices = res.pratiqueSlices === 0 ? 1 : res.pratiqueSlices;
      return res;
    };

    const beforeSave = async (form) => {
      // 筛选出开始结束都有票号的数据进行判断
      const result = state.registerForm.ticketInfo.filter((item) => {
        if (item.startNum && item.endNum) {
          return item;
        }
      });

      if (result.length === 0) {
        proxy.$message.warn("请填写票号信息");
        return;
      }

      const final = result.every((item) => {
        return item.status === true;
      });
      if (final) {
        const codes = [];
        let data = {
          id: "",
          porkReportId: "",
          pratiqueCodes: [],
          pratiqueSlices: "",
          pratiqueTickets: "",
          remark: "",
        };
        for (let i = 0; i < status.ticketsList?.length; i++) {
          const str = `${String(status.ticketsList[i].startNum)}-${String(
            status.ticketsList[i].endNum
          )}`;
          codes.push(str);
        }

        data.id = form.id;
        data.porkReportId = form.porkReportId;
        data.pratiqueCodes = codes.sort((a, b) => {
          return a.split("-")[0] - b.split("-")[0];
        });
        data.pratiqueSlices = form.pratiqueSlices;
        data.pratiqueTickets = status.num;
        data.remark = form.remark;
        return data;
      } else {
        return form;
      }
    };
    return {
      ...toRefs(status),
      ...toRefs(state),
      registerRule,
      gDetail,
      route,
      cancel,
      addTickets,
      deleteItem,
      fillData,
      timeFormat,
      millennial,
      getStatus,
      beforeSave,
      afterGet,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");
.pl2 {
  padding-left: 0px !important;
}
</style>
