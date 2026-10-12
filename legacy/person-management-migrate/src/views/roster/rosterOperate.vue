<template>
  <GDetail ref="gDetailForm" :formList="formList" :api="api" :rules="rules" :afterGet="afterGet" :title="title"></GDetail>
</template>
<script lang="jsx">
import dayjs from "dayjs";
import { computed, defineComponent, onMounted, reactive, toRefs, ref } from "vue";
import { useRoute } from "vue-router";

import { KEYWORD_ALIAS } from "@ghcloud/cube-business-alias-manage-plugin";
import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";
import { CubeMdataService } from "@ghcloud/cube-mdata-service";

import { ITEM_CODE, ROSTER_CONFIG } from "../field-config/field-config";
import GDetail from "./gDetail.vue";
import { authStore } from "@/api/auth-store";
import { deptTree, getAppointmentList, getStaffEnum, getPositionList } from "@/api/index";
import { applyRosterDerivedFields } from "@/utils/roster-derived";

export default defineComponent({
  components: { GDetail },
  setup() {
    const route = useRoute();
    const cubeDictionaryService = new CubeDictionaryService(authStore);
    const cubeMdataService = new CubeMdataService(authStore);
    const validatorCheck = async (rule, value) => {
      if (value && value.length > 20) {
        return Promise.reject("最多输入20个字符");
      }
      return Promise.resolve();
    };
    const baseRules = {
      name: [
        { required: true, message: `请输入${KEYWORD_ALIAS.staff}姓名` },
        { validator: validatorCheck, trigger: "blur" },
      ],
      mobile: [{ required: true, message: "请输入联系电话" }],
      organizationId: [{ required: true, message: "请选择部门" }],
    };
    const dynamicFields = ref([
      { fieldName: "出生日期", key: "dateOfBirth", show: true, required: true, alias: "" },
      { fieldName: "年龄", key: "age", show: true, required: false, alias: "" },
      { fieldName: "职位", key: "postIds", show: true, required: true, alias: "" },
      { fieldName: "岗位", key: "appointmentIds", show: true, required: true, alias: "" },
      { fieldName: "员工类型", key: "type", show: true, required: true, alias: "" },
      { fieldName: "性别", key: "gender", show: true, required: true, alias: "" },
      { fieldName: "婚姻状况", key: "maritalStatus", show: true, required: false, alias: "" },
      { fieldName: "学历", key: "education", show: true, required: true, alias: "" },
      { fieldName: "专业", key: "speciality", show: true, required: false, alias: "" },
      { fieldName: "毕业院校", key: "university", show: true, required: false, alias: "" },
      { fieldName: "民族", key: "nation", show: true, required: false, alias: "" },
      { fieldName: "政治面貌", key: "politicalStatus", show: true, required: false, alias: "" },
      { fieldName: "地址", key: "address", show: true, required: false, alias: "" },
      { fieldName: "紧急联系人", key: "emergencyContact", show: true, required: true, alias: "" },
      { fieldName: "联系人电话", key: "emergencyContactMobile", show: true, required: true, alias: "" },
      { fieldName: "所在区域", key: "areaIdList", show: true, required: true, alias: "" },
      { fieldName: "工号", key: "jobNumber", show: true, required: false, alias: "" },
      { fieldName: "身份证号", key: "idCard", show: true, required: false, alias: "" },
      { fieldName: "短号", key: "cornet", show: true, required: false, alias: "" },
      { fieldName: "员工状态", key: "status", show: true, required: true, alias: "" },
      { fieldName: "入职日期", key: "inductionDate", show: true, required: true, alias: "" },
      { fieldName: "司龄", key: "companyYears", show: true, required: false, alias: "" },
      { fieldName: "试用期", key: "probationPeriod", show: true, required: true, alias: "" },
      { fieldName: "计划转正日期", key: "planRegularWorkerDate", show: true, required: false, alias: "" },
      { fieldName: "转正日期", key: "regularWorkerDate", show: true, required: false, alias: "" },
      { fieldName: "离职日期", key: "quitDate", show: true, required: false, alias: "" },
      { fieldName: "首次缴纳社保时间", key: "paySocialInsuranceFirstDate", show: true, required: true, alias: "" },
      { fieldName: "工龄", key: "workingYears", show: true, required: false, alias: "" },
      { fieldName: "员工", key: "staff", alias: "" },
    ]);
    const state = reactive({
      api: {
        detail: "getStaffDetail",
        add: "postStaffInfo",
        edit: "postStaffInfo",
      },
      model: null,
      rules: {},
      formList: [
        {
          title: "基本信息",
          form: [
            {
              label: `${KEYWORD_ALIAS.staff}姓名`,
              value: "name",
              placeholder: `请输入${KEYWORD_ALIAS.staff}姓名`,
            },
            {
              label: "联系电话",
              value: "mobile",
              placeholder: "请输入联系电话",
            },
            {
              label: "性别",
              value: "gender",
              detailValue: "genderName",
              component: "aSelect",
              url: "getStaffEnum",
              params: { type: "gender" },
              placeholder: "请选择性别",
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "gender")?.show ?? false;
              },
            },
            {
              label: "婚姻状况",
              value: "maritalStatus",
              detailValue: "maritalStatusName",
              component: "aSelect",
              url: "getStaffEnum",
              params: { type: "maritalStatus" },
              field: {
                value: "value",
                name: "label",
              },
              placeholder: "请选择婚姻状况",
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "maritalStatus")?.show ?? false;
              },
            },
            {
              label: "出生日期",
              value: "dateOfBirth",
              component: "a-date-picker",
              valueFormat: "YYYY-MM-DD",
              format: "YYYY-MM-DD",
              placeholder: "请选择出生日期",
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "dateOfBirth")?.show ?? false;
              },
              detailFun: (data) => {
                return data ? dayjs(data).format("YYYY-MM-DD") : "--";
              },
              onChange: (value, form) => {
                applyRosterDerivedFields(form);
              },
            },
            {
              label: "年龄",
              value: "age",
              component: "a-input-number",
              min: 0,
              precision: 0,
              placeholder: "请输入年龄",
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "age")?.show ?? false;
              },
            },
            {
              label: "学历",
              value: "education",
              detailValue: "educationName",
              component: "aSelect",
              url: "getStaffEnum",
              params: { type: "edu" },
              field: {
                value: "value",
                name: "label",
              },
              placeholder: "请选择学历",
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "education")?.show ?? false;
              },
            },
            {
              label: "专业",
              value: "speciality",
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "speciality")?.show ?? false;
              },
            },
            {
              label: "毕业院校",
              value: "university",
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "university")?.show ?? false;
              },
            },
            {
              label: "民族",
              value: "nation",
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "nation")?.show ?? false;
              },
            },
            {
              label: "政治面貌",
              value: "politicalStatus",
              detailValue: "politicalStatusName",
              component: "aSelect",
              url: "getStaffEnum",
              params: { type: "political" },
              field: {
                value: "value",
                name: "label",
              },
              placeholder: "请选择政治面貌",
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "politicalStatus")?.show ?? false;
              },
            },
            {
              label: "地址",
              value: "address",
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "address")?.show ?? false;
              },
            },
            {
              label: "紧急联系人",
              value: "emergencyContact",
              placeholder: "请输入紧急联系人",
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "emergencyContact")?.show ?? false;
              },
            },
            {
              label: "联系人电话",
              value: "emergencyContactMobile",
              placeholder: "请输入联系人电话",
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "emergencyContactMobile")?.show ?? false;
              },
            },
            {
              label: "所在区域",
              value: "areaIdList",
              component: "a-tree-select",
              placeholder: "请选择区域",
              multiple: true,
              showSearch: true,
              treeNodeFilterProp: "title",
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "areaIdList")?.show ?? false;
              },
            },
          ],
        },
        {
          title: `${KEYWORD_ALIAS.company}信息`,
          form: [
            {
              label: `${KEYWORD_ALIAS.staff}类型`,
              value: "type",
              detailValue: "typeName",
              component: "aSelect",
              url: "getStaffEnum",
              params: { type: "staffType" },
              field: {
                value: "value",
                name: "label",
              },
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "type")?.show ?? false;
              },
              placeholder: `请选择${KEYWORD_ALIAS.staff}类型`,
            },
            {
              label: "工号",
              value: "jobNumber",
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "jobNumber")?.show ?? false;
              },
            },
            {
              label: "身份证号",
              value: "idCard",
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "idCard")?.show ?? false;
              },
              onChange: (value, form) => {
                applyRosterDerivedFields(form);
              },
            },
            {
              label: "短号",
              value: "cornet",
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "cornet")?.show ?? false;
              },
            },
            {
              label: "部门",
              value: "organizationId",
              detailValue: "organizationName",
              component: "a-tree-select",
              placeholder: "请选择部门",
              showSearch: true,
              treeNodeFilterProp: "title",
            },
            {
              label: "岗位",
              value: "appointmentIds",
              component: "aSelect",
              url: "getAppointmentList",
              mode: "multiple",
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "appointmentIds")?.show ?? false;
              },
              placeholder: "请选择岗位",
            },
            {
              label: "职位",
              value: "postIds",
              detailValue: "postNames",
              component: "aSelect",
              url: "getPositionList",
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "postIds")?.show ?? false;
              },
              placeholder: "请选择职位",
            },
            {
              label: "员工状态",
              value: "status",
              detailValue: "statusName",
              component: "aSelect",
              url: "getStaffEnum",
              params: { type: "staffStatus" },
              field: {
                value: "value",
                name: "label",
              },
              placeholder: `请选择${KEYWORD_ALIAS.staff}状态`,
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "status")?.show ?? false;
              },
            },
            {
              label: "入职日期",
              value: "inductionDate",
              component: "a-date-picker",
              format: "YYYY-MM-DD",
              valueFormat: "YYYY-MM-DD",
              placeholder: "请选择入职日期",
              detailFun: (data) => {
                return data ? dayjs(data).format("YYYY-MM-DD") : "--";
              },
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "inductionDate")?.show ?? false;
              },
              onChange: (value, form) => {
                applyRosterDerivedFields(form);
              },
            },
            {
              label: "司龄",
              value: "companyYears",
              component: "a-input-number",
              min: 0,
              precision: 0,
              placeholder: "请输入司龄",
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "companyYears")?.show ?? false;
              },
            },
            {
              label: "试用期",
              value: "probationPeriod",
              detailValue: "probationPeriodName",
              component: "aSelect",
              url: "getStaffEnum",
              params: { type: "probationPeriod" },
              field: {
                value: "value",
                name: "label",
              },
              placeholder: "请选择试用期",
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "probationPeriod")?.show ?? false;
              },
            },
            {
              label: "计划转正日期",
              value: "planRegularWorkerDate",
              component: "a-date-picker",
              format: "YYYY-MM-DD",
              valueFormat: "YYYY-MM-DD",
              placeholder: "请选择计划转正日期",
              detailFun: (data) => {
                return data && data !== "Invalid date" ? dayjs(data).format("YYYY-MM-DD") : "--";
              },
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "planRegularWorkerDate")?.show ?? false;
              },
            },
            {
              label: "转正日期",
              value: "regularWorkerDate",
              component: "a-date-picker",
              format: "YYYY-MM-DD",
              valueFormat: "YYYY-MM-DD",
              placeholder: "请选择转正日期",
              detailFun: (data) => {
                return data && data !== "Invalid date" ? dayjs(data).format("YYYY-MM-DD") : "--";
              },
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "regularWorkerDate")?.show ?? false;
              },
            },
            {
              label: "离职日期",
              value: "quitDate",
              component: "a-date-picker",
              format: "YYYY-MM-DD",
              valueFormat: "YYYY-MM-DD",
              placeholder: "请选择离职日期",
              detailFun: (data) => {
                return data && data !== "Invalid date" ? dayjs(data).format("YYYY-MM-DD") : "--";
              },
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "quitDate")?.show ?? false;
              },
            },
            {
              label: "首次缴纳社保",
              value: "paySocialInsuranceFirstDate",
              component: "a-month-picker",
              format: "YYYY-MM",
              valueFormat: "YYYY-MM-DD",
              placeholder: "请选择首次缴纳社保时间",
              detailFun: (data) => {
                return data ? dayjs(data).format("YYYY-MM") : "--";
              },
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "paySocialInsuranceFirstDate")?.show ?? false;
              },
              onChange: (value, form) => {
                applyRosterDerivedFields(form);
              },
            },
            {
              label: "工龄",
              value: "workingYears",
              component: "a-input-number",
              min: 0,
              precision: 0,
              placeholder: "请输入工龄",
              showCondition: (form) => {
                return dynamicFields.value.find((x) => x.key === "workingYears")?.show ?? false;
              },
            },
          ],
        },
      ],
      options: [
        { name: "时", id: "hour" },
        { name: "天", id: "day" },
      ],
      confirmInfo: null,
    });
    const afterGet = (res) => {
      return applyRosterDerivedFields({
        ...res,
        dateOfBirth: res.dateOfBirth ? dayjs(res.dateOfBirth).format("YYYY-MM-DD") : null,
        inductionDate: res.inductionDate ? dayjs(res.inductionDate).format("YYYY-MM-DD") : null,
        planRegularWorkerDate: res.planRegularWorkerDate ? dayjs(res.planRegularWorkerDate).format("YYYY-MM-DD") : null,
        paySocialInsuranceFirstDate: res.paySocialInsuranceFirstDate ? dayjs(res.paySocialInsuranceFirstDate).format("YYYY-MM-DD") : null,
        quitDate: res.quitDate ? dayjs(res.quitDate).format("YYYY-MM-DD") : null,
        regularWorkerDate: res.regularWorkerDate ? dayjs(res.regularWorkerDate).format("YYYY-MM-DD") : null,
      });
    };
    const title = computed(() => {
      if (route.query.id) {
        return route.query.type === "detail" ? `${KEYWORD_ALIAS.staff}详情` : `${KEYWORD_ALIAS.staff}编辑`;
      } else {
        return `${KEYWORD_ALIAS.staff}新增`;
      }
    });
    const transformArea = (data) => {
      return data.map((item) => ({
        title: item.name,
        value: item.id,
        key: item.id,
        children: item.children && item.children.length > 0 ? transformArea(item.children) : undefined,
      }));
    };
    const setFormItemOptions = (value, options) => {
      for (const formSection of state.formList) {
        const formItem = formSection.form.find((item) => item.value === value);
        if (formItem) {
          formItem.options = options;
          return;
        }
      }
    };
    onMounted(() => {
      getConfigList();
      getStaffEnum({ type: "gender" }).then((res) => {
        setFormItemOptions(
          "gender",
          res.data.map((item) => {
            return {
              value: item.value,
              label: item.name,
            };
          }),
        );
      });
      getStaffEnum({ type: "maritalStatus" }).then((res) => {
        setFormItemOptions(
          "maritalStatus",
          res.data.map((item) => {
            return {
              value: item.value,
              label: item.name,
            };
          }),
        );
      });
      getStaffEnum({ type: "edu" }).then((res) => {
        setFormItemOptions(
          "education",
          res.data.map((item) => {
            return {
              value: item.value,
              label: item.name,
            };
          }),
        );
      });
      getStaffEnum({ type: "political" }).then((res) => {
        setFormItemOptions(
          "politicalStatus",
          res.data.map((item) => {
            return {
              value: item.value,
              label: item.name,
            };
          }),
        );
      });

      getStaffEnum({ type: "staffType" }).then((res) => {
        setFormItemOptions(
          "type",
          res.data.map((item) => {
            return {
              value: item.value,
              label: item.name,
            };
          }),
        );
      });
      const transformDep = (data) => {
        return data.map((item) => ({
          title: item.name,
          value: item.id,
          key: item.id,
          children: item.children && item.children.length > 0 ? transformDep(item.children) : undefined,
        }));
      };
      deptTree().then((res) => {
        setFormItemOptions("organizationId", transformDep(res.data));
      });
      getAppointmentList().then((res) => {
        setFormItemOptions(
          "appointmentIds",
          res.data.records.map((item) => {
            return {
              value: item.id,
              label: item.name,
            };
          }),
        );
      });
      getPositionList().then((res) => {
        setFormItemOptions(
          "postIds",
          res.data.records.map((item) => {
            return {
              value: item.id,
              label: item.name,
            };
          }),
        );
      });
      getStaffEnum({ type: "staffStatus" }).then((res) => {
        setFormItemOptions(
          "status",
          res.data.map((item) => {
            return {
              value: item.value,
              label: item.name,
            };
          }),
        );
      });
      getStaffEnum({ type: "probationPeriod" }).then((res) => {
        setFormItemOptions(
          "probationPeriod",
          res.data.map((item) => {
            return {
              value: item.value,
              label: item.name,
            };
          }),
        );
      });
      cubeMdataService.getAreaTree().then((res) => {
        setFormItemOptions("areaIdList", transformArea(res));
      });
    });
    // 获取字段
    const getConfigList = async () => {
      const fieldConfig = await cubeDictionaryService.getDictionaryItemByCode({ code: ITEM_CODE });
      if (fieldConfig) {
        const dictionaryItem = await cubeDictionaryService.getDictionaryByItem({ itemCode: ITEM_CODE });
        if (dictionaryItem.find((x) => x.code === "roster")) {
          const dataList =
            (
              dictionaryItem.find((x) => x.code === "roster")?.variable &&
              JSON.parse(dictionaryItem.find((x) => x.code === "roster")?.variable ?? "")
            )?.fields ?? [];
          const initFields = ROSTER_CONFIG.variable.fields;
          const savedFieldMap = new Map(dataList.map((item) => [item.key, item]));
          dynamicFields.value = initFields.map((item) => {
            const saved = savedFieldMap.get(item.key);
            return saved
              ? {
                  ...item,
                  show: saved.show,
                  required: saved.required,
                  alias: saved.alias ?? "",
                }
              : { ...item };
          });
          //更新表单项名称
          state.formList.forEach((formItem, index) => {
            formItem.form = formItem.form.map((item, index) => {
              const current = dynamicFields.value.find((x) => x.key === item.value);
              if (typeof current?.alias !== "undefined" && current.alias !== "") {
                item.label = current.alias;
              }
              return item;
            });
          });
        }
      }
      const dynamicRules = dynamicFields.value.filter((x) => x.show && x.required);
      if (dynamicRules.length === 0) {
        state.rules = baseRules;
      } else {
        dynamicRules.forEach((x) => {
          let obj = {};
          obj[x.key] = [
            {
              required: true,
              message: `${x.fieldName}不能为空`,
            },
          ];
          state.rules = Object.assign(baseRules, obj);
        });
      }
      if (state.rules?.idCard) {
        state.rules.idCard.push({ validator: validateIdCard, trigger: "blur" });
      } else {
        state.rules.idCard = [{ validator: validateIdCard, trigger: "blur" }];
      }
    };
    // 身份证号码校验
    const validateIdCard = async (rule, value) => {
      // 空值处理：允许空值（由必填规则控制）
      if (!value || value.trim().length === 0) {
        return Promise.resolve();
      }

      const sId = value.trim();
      let iSum = 0;
      const aCity = {
        11: "北京",
        12: "天津",
        13: "河北",
        14: "山西",
        15: "内蒙",
        21: "辽宁",
        22: "吉林",
        23: "黑龙",
        31: "上海",
        32: "江苏",
        33: "浙江",
        34: "安徽",
        35: "福建",
        36: "江西",
        37: "山东",
        41: "河南",
        42: "湖北",
        43: "湖南",
        44: "广东",
        45: "广西",
        46: "海南",
        50: "重庆",
        51: "四川",
        52: "贵州",
        53: "云南",
        54: "西藏",
        61: "陕西",
        62: "甘肃",
        63: "青海",
        64: "宁夏",
        65: "新疆",
        71: "台湾",
        81: "香港",
        82: "澳门",
        83: "台湾",
        91: "国外",
      };

      // 1. 基本格式校验（18位，前17位数字，最后一位允许数字/Xx）
      if (!/^[1-9]\d{16}(\d|X|x)$/.test(sId)) {
        return Promise.reject(new Error("请输入正确的身份证号"));
      }

      // 2. 地址码校验（前2位合法地区）
      const areaCode = parseInt(sId.substr(0, 2), 10);
      if (!aCity[areaCode]) {
        return Promise.reject(new Error("请输入正确的身份证号"));
      }

      // 3. 出生日期校验（格式与有效性）
      const year = sId.substr(6, 4);
      const month = sId.substr(10, 2);
      const day = sId.substr(12, 2);
      const sBirthday = `${year}-${month}-${day}`;
      const d = new Date(sBirthday.replace(/-/g, "/"));
      // 验证日期是否有效（避免2月30日等错误）
      if (
        d.getFullYear().toString() !== year ||
        (d.getMonth() + 1).toString().padStart(2, "0") !== month ||
        d.getDate().toString().padStart(2, "0") !== day
      ) {
        return Promise.reject(new Error("请输入正确的身份证号"));
      }

      // 4. 校验码校验（第18位算法验证）
      const normalizedId = sId.replace(/x$/i, "a"); // 统一处理末尾x为a
      for (let i = 17; i >= 0; i--) {
        iSum += (Math.pow(2, i) % 11) * parseInt(normalizedId.charAt(17 - i), 11);
      }
      if (iSum % 11 !== 1) {
        return Promise.reject(new Error("请输入正确的身份证号"));
      }

      // 所有校验通过
      return Promise.resolve();
    };
    return {
      ...toRefs(state),
      afterGet,
      title,
      validateIdCard,
    };
  },
});
</script>
