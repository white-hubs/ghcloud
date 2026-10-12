<template lang="pug">
g-layout(title="报备管理")
  template(#content-table)
    template(v-if="type === 'detail'")
      a-tabs(v-model:activeKey="activeKey")
        a-tab-pane(key="1" tab="详情信息")
          g-detail-form(
            :formList="formList"
            :api="api"
            :afterGet="afterGet"
          )
        a-tab-pane(key="2" tab="操作记录" )
          .detail-form
            .item-title 报备信息操作记录
            reportList(:url="'reportModifyRecord'" :columns="reportCol" :ResKey="''")
            .item-title 金额操作记录
            reportList(:url="'reportAllModify'" :columns="feeCol" :ResKey="'feeUpdateList'" :page="false")
            .item-title 重量操作记录
            reportList(:url="'reportAllModify'" :columns="weightCol" :ResKey="'weightUpdateList'" :page="false")
            .item-title 开闸操作记录
            reportList(:url="'reportAllModify'" :columns="openCol" :ResKey="'liftRodList'" :page="false")

    template(v-else)
      g-detail-form(
        ref="addFormRef"
        :formList="addForm"
        :rules="rules")
        template(v-slot:merchantId="{record}")
          a-select(
            v-model:value="merchant"
            style="maxWidth: 300px" 
            placeholder="请选择来货商家" 
            :dropdownStyle="{display: 'none'}"
            :dropdownClassName="'hide'"
            :labelInValue="true"
            @click="checkMerchant")
        template(v-slot:stall="{record}")   
          g-select(
            ref="gSelectRef"
            v-if="merchant.value"
            v-model:value="record.stall"
            :url="'getMerchantBooth'"
            :params="{merchantId:merchant.value}"
            :field="{name: 'label',id: 'value'}"
            :labelInValue="true"
          ) 
          g-select(v-else disabled)
        template(v-slot:carWeight="{record}")  
          a-input(v-model:value="record.carWeight" placeholder="车辆皮重" :disabled="forbidInput" :maxlength="8")
        template(v-slot:carTypeId="{record}")  
          g-select(
            v-model:value="record.carTypeId" 
            :url="'carTypeConfigList'" 
            :placeholder="'请选择车辆类型'"
            :field="{ carTypeName: 'label', id: 'value' }"
            :disabled="forbidInput")
  template(#footer-page)
    a-button(@click="goBack") 返回
    a-button(@click="save" v-if="type !== 'detail'" type="primary") 保存
  ModalTable(
    title="商家"
    :selectedKeys="selectedKeys"
    v-model:value="visible"
    url="wholeSalerPage"
    :columns="columns"
    :params="params"
    :search="modalSearch"
    :searchLength="1"
    :rowKey="'id'"
    :width="800"
    @modal-save="saveModal"
  )  

</template>
<script lang='jsx'>
import {
  defineComponent,
  ref,
  watch,
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { timeFormat, millennial } from "@/utils/common";
import { replaceObjectKeys } from "@pansy/utils";
import reportList from "./reportList.vue";
export default defineComponent({
  components: { reportList },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();

    const nowTime = timeFormat(new Date(), false);
    const type = route.query.type;
    const id = route.query.id;
    const gSelectRef = ref();
    const addFormRef = ref();
    const state = reactive({
      formList: [
        {
          title: "支付信息",
          form: [
            {
              label: "支付时间",
              value: "chargeRecordVO",
              detailFun: (value) => {
                return value?.payTime ? timeFormat(value?.payTime, true) : "--";
              },
            },
            {
              label: "支付方式",
              value: "chargeRecordVO",
              detailFun: (value) => {
                if (value?.payType === "OTHERS") {
                  return "其他";
                } else if (value?.payType === "WEIXIN_PAY") {
                  return "微信支付";
                } else if (value?.payType === "WALLET_PAY") {
                  return "钱包支付";
                } else {
                  return "--";
                }
                // return value?.payType ? value?.payType : "--";
              },
            },
            {
              label: "进门费",
              value: "chargeRecordVO",
              unit: "元",
              detailFun: (value) => {
                return value?.enterFee || value?.enterFee === 0
                  ? millennial(value?.enterFee, true)
                  : "--";
              },
            },
            {
              label: "实际支付费用",
              value: "chargeRecordVO",
              unit: "元",
              detailFun: (value) => {
                return value?.realFee || value?.realFee === 0
                  ? millennial(value?.realFee, true)
                  : "--";
              },
            },
            {
              label: "过磅重量",
              value: "chargeRecordVO",
              unit: "KG",
              detailFun: (value) => {
                return value?.weighValue || value?.weighValue === 0
                  ? millennial(value?.weighValue, true)
                  : "--";
              },
            },
            {
              label: "皮重",
              value: "chargeRecordVO",
              unit: "KG",
              detailFun: (value) => {
                return value?.carWeight || value?.carWeight === 0
                  ? millennial(value?.carWeight, true)
                  : "--";
              },
            },
            {
              label: "净重",
              value: "chargeRecordVO",
              unit: "KG",
              detailFun: (value) => {
                return value?.netWeight || value?.netWeight === 0
                  ? millennial(value?.netWeight, true)
                  : "--";
              },
            },
            {
              label: "支付状态",
              value: "chargeRecordVO",
              detailFun: (value) => {
                if (value?.payStatus === "WAIT_PAY") {
                  return "支付中";
                } else if (value?.payStatus === "PAY_SUCCESS") {
                  return "已支付";
                } else {
                  return "--";
                }
              },
            },
          ],
        },
        {
          title: "进场照片",
          // form: [{ label: "", value: "files", component: "a-upload" }],
          form: [
            {
              label: "",
              value: "entryImagesPaths",
              component: "a-upload",
              detailValue: "entryImagesPaths",
            },
          ],
        },
        {
          title: "基本信息",
          form: [
            { label: "交易区（档位）", value: "stallName" },
            { label: "预计到场时间", value: "expectEnterTime" },
            { label: "来货车辆", value: "carNo" },
            { label: "送货司机", value: "driverName" },
            {
              label: "来货商品",
              value: "purchaseGoodsList",
              detailFun: (item) => {
                const data = [];
                if (item?.length) {
                  for (let i of item) {
                    data.push(i.goodsName);
                  }
                  return data.join("、");
                }
                return "--";
              },
            },
            { label: "报备时间", value: "reportTime" },
          ],
        },
        {
          title: "产地证明",
          form: [
            { label: "检测合格证号", value: "certificate" },
            { label: "报备人", value: "reporter" },
            {
              label: "证件照片",
              value: "files",
              component: "a-upload",
              singleLine: true,
              detailValue: "files",
            },
          ],
        },
      ],
      addForm: [
        {
          title: "来货信息",
          form: [
            {
              label: "来货商家",
              value: "merchantId",
              slot: true,
            },
            {
              label: "交易区(档位)",
              value: "stall",
              slot: true,
            },
            {
              label: "来货商品",
              value: "purchaseGoodsList",
              placeholder: "请选择来货商品",
              // component: "TreeSelect",
              component: "g-TreeSelect",
              url: "getGoodsTypeList",
              api: {
                label: "goodsName",
                value: "goodsCode",
                useVal: false,
                labelInValue: true,
                showItem: "SHOW_CHILD",
              },
              defaultValue: [],
              style: {
                width: "100%",
                maxWidth: "300px",
              },
            },
            {
              label: "来货车辆",
              value: "car",
              placeholder: "请选择来货车辆",
              component: "gSelect",
              url: "noReportCar",
              field: { carNo: "value" },
              labelInValue: true,
            },
            {
              label: "车辆类型",
              value: "carTypeId",
              // placeholder: "请选择车辆类型",
              // component: "gSelect",
              // url: "carTypeConfigList",
              // field: { carTypeName: "label", id: "value" },
              slot: true,
            },
            {
              label: "皮重",
              value: "carWeight",
              slot: true,
            },
            {
              label: "来货司机",
              value: "driverName",
              placeholder: "请输入来货司机",
            },
            {
              label: "司机电话",
              value: "driverPhone",
              placeholder: "请输入来货司机",
            },
            {
              label: "预计到场时间",
              value: "expectEnterTime",
              component: "a-date-picker",
              showTime: true,
              disabled: true,
              defaultValue: nowTime,
              format: "YYYY-MM-DD",
            },
          ],
        },
        {
          title: "产地信息",
          form: [
            { label: "产地", value: "placeOrigin" },
            { label: "检测合格证号", value: "certificate" },
            {
              label: "证明照片",
              value: "fileIds",
              singleLine: true,
              component: "gUpload",
              max: 5,
              detailValue: "fileVOS",
            },
          ],
        },
      ],
      modalSearch: [
        {
          label: "",
          value: "keyword",
          placeholder: "商家名称",
        },
      ],
      merchant: {
        label: null,
        value: null,
      },
      api: {
        detail: "entryFeeReportId",
      },
      visible: false,
      forbidInput: true,
      columns: [
        {
          dataIndex: "name",
          title: "商家名称",
          slots: {
            customRender: "name",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "--"}</PopOver>;
          },
        },
        {
          dataIndex: "liaison",
          title: "联系人姓名",
          slots: {
            customRender: "liaison",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "--"}</PopOver>;
          },
        },
        {
          dataIndex: "phone",
          title: "联系人手机号",
          slots: {
            customRender: "phone",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "--"}</PopOver>;
          },
        },
        {
          dataIndex: "status",
          title: "认证状态",
          slots: {
            customRender: "status",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                content={
                  text
                    ? text === "INVALID"
                      ? "已失效"
                      : text === "UNAUTHORIZED"
                      ? "未认证"
                      : text === "AUDITED"
                      ? "待审核"
                      : text === "CERTIFIED"
                      ? "已认证"
                      : "未通过"
                    : ""
                }
              >
                <g-table-dot
                  content={
                    text
                      ? text === "INVALID"
                        ? "已失效"
                        : text === "UNAUTHORIZED"
                        ? "未认证"
                        : text === "AUDITED"
                        ? "待审核"
                        : text === "CERTIFIED"
                        ? "已认证"
                        : "未通过"
                      : "--"
                  }
                  status={
                    text
                      ? text === "INVALID"
                        ? "blue"
                        : text === "UNAUTHORIZED"
                        ? "audit"
                        : text === "AUDITED"
                        ? "audit"
                        : text === "CERTIFIED"
                        ? "normal"
                        : "delete"
                      : "--"
                  }
                ></g-table-dot>
              </PopOver>
            );
          },
        },
        {
          dataIndex: "type",
          title: "认证类型",
          slots: {
            customRender: "type",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                content={
                  text
                    ? text === "PERSONAL"
                      ? "个人"
                      : text === "ENTERPRISE"
                      ? "企业"
                      : "个体工商户"
                    : ""
                }
              >
                {text
                  ? text === "PERSONAL"
                    ? "个人"
                    : text === "ENTERPRISE"
                    ? "企业"
                    : "个体工商户"
                  : "--"}
              </PopOver>
            );
          },
        },
      ],
      params: {
        status: "CERTIFIED",
      },
      selectedKeys: [],
      rules: {
        merchantId: [{ required: true, message: "请选择来货商家" }],
        purchaseGoodsList: [{ required: true, message: "请选择来货商品" }],
        carTypeId: [{ required: true, message: "请选择车辆类型" }],
        car: [
          { required: true, message: "" },
          {
            validator(rule, value) {
              if (!value) {
                return Promise.reject("请选择来货车辆");
              } else {
                return Promise.resolve();
              }
            },
          },
        ],
        carWeight: [
          { required: true, message: "" },
          {
            pattern: new RegExp(/^\d+(\.\d{0,2})?$/, "g"),
            message: "请输入正确的皮重(最多两位小数)",
          },
        ],
        driverPhone: [
          { required: false, message: "请输入司机电话" },
          {
            pattern: new RegExp(/^1[3|4|5|6|7|8|9][0-9]{9}$/, "g"),
            message: "请输入正确的电话",
          },
        ],
        stall: [{ required: true, message: "请选择交易区(档位)" }],
      },
      feeCol: [
        {
          dataIndex: "oldFee",
          title: "修改前",
          slots: {
            customRender: "oldFee",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? `￥${millennial(text)}` : ""}
              >
                {text || text === 0 ? `￥${millennial(text)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "newFee",
          title: "修改后",
          slots: {
            customRender: "newFee",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? `￥${millennial(text)}` : ""}
              >
                {text || text === 0 ? `￥${millennial(text)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "createTime",
          title: "修改时间",
          slots: {
            customRender: "createTime",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : ""}
              >
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "operator",
          title: "操作员",
          slots: {
            customRender: "operator",
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
      reportCol: [
        { dataIndex: "oldGoods", title: "修改前" },
        { dataIndex: "newGoods", title: "修改后" },
        {
          dataIndex: "updateTime",
          title: "修改时间",
          slots: {
            customRender: "updateTime",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : ""}
              >
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
        },
      ],
      weightCol: [
        {
          dataIndex: "oldWeightValue",
          title: "修改前",
          elllipsis: true,
          slots: {
            customRender: "oldWeightValue",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text, true) : ""}
              >
                {text || text === 0 ? millennial(text, true) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "newWeightValue",
          title: "修改后",
          elllipsis: true,
          slots: {
            customRender: "newWeightValue",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text, true) : ""}
              >
                {text || text === 0 ? millennial(text, true) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "createTime",
          title: "修改时间",
          slots: {
            customRender: "createTime",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : ""}
              >
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "operator",
          title: "操作员",
          slots: {
            customRender: "operator",
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
      openCol: [
        { dataIndex: "liftRodReason", title: "开闸原因" },
        {
          dataIndex: "updateTime",
          title: "开闸时间",
          slots: {
            customRender: "updateTime",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : ""}
              >
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "operator",
          title: "操作员",
          slots: {
            customRender: "operator",
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
    });
    //获取当前数据支付状态和进场状态
    const getStatus = async () => {
      const data = await proxy.$api.entryFeeReportId(id, "get");
      // 判断进场信息和支付信息后构造数据结构
      state.formList = [
        // 完成报备生成进场费用之前不显示
        // 是否进场
        data.reportVO?.status === "OVER_ENTER"
          ? {
              title: "支付信息",
              form: [
                {
                  label: "支付时间",
                  value: "chargeRecordVO",
                  detailFun: (value) => {
                    return value?.payTime
                      ? timeFormat(value?.payTime, true)
                      : "--";
                  },
                },
                {
                  label: "支付方式",
                  value: "chargeRecordVO",
                  detailFun: (value) => {
                    if (value?.payType === "OTHERS") {
                      return "其他";
                    } else if (value?.payType === "WEIXIN_PAY") {
                      return "微信支付";
                    } else if (value?.payType === "WALLET_PAY") {
                      return "钱包支付";
                    } else {
                      return "--";
                    }
                    // return value?.payType ? value?.payType : "--";
                  },
                },
                {
                  label: "进门费",
                  value: "chargeRecordVO",
                  unit: "元",
                  detailFun: (value) => {
                    return value?.enterFee || value?.enterFee === 0
                      ? `￥${millennial(value?.enterFee, true)}`
                      : "--";
                  },
                },
                {
                  label: "实际支付费用",
                  value: "chargeRecordVO",
                  unit: "元",
                  detailFun: (value) => {
                    return value?.realFee || value?.realFee === 0
                      ? `￥${millennial(value?.realFee, true)}`
                      : "--";
                  },
                },
                {
                  label: "过磅重量",
                  value: "chargeRecordVO",
                  detailFun: (value) => {
                    return value?.weighValue || value?.weighValue === 0
                      ? `${millennial(value?.weighValue, true)}KG`
                      : "--";
                  },
                },
                {
                  label: "皮重",
                  value: "chargeRecordVO",
                  detailFun: (value) => {
                    return value?.carWeight || value?.carWeight === 0
                      ? `${millennial(value?.carWeight, true)}KG`
                      : "--";
                  },
                },
                {
                  label: "净重",
                  value: "chargeRecordVO",
                  detailFun: (value) => {
                    return value?.netWeight || value?.netWeight === 0
                      ? `${millennial(value?.netWeight, true)}KG`
                      : "--";
                  },
                },
                {
                  label: "支付状态",
                  value: "chargeRecordVO",
                  detailFun: (value) => {
                    if (value?.payStatus === "WAIT_PAY") {
                      return "支付中";
                    } else if (value?.payStatus === "PAY_SUCCESS") {
                      return "已支付";
                    } else {
                      return "--";
                    }
                  },
                },
              ],
            }
          : {},
        // 完成报备生成进场费用之前不显示
        data.reportVO?.status === "OVER_ENTER"
          ? {
              title: "进场照片",
              form: [
                {
                  label: "",
                  value: "carEnterRecordVO",
                  // component: "a-upload",
                  // detailValue: "carEnterRecordVO",
                  html: true,
                  detailFun: (value) => {
                    let h = "";
                    if (value?.images) {
                      for (let i of value?.images) {
                        h += `<img src="${i.replace(
                          "20201",
                          "30000"
                        )}" style="width:100px;height:100px;margin-left:10px"></img>`;
                      }
                    }

                    return h;
                  },
                },
              ],
            }
          : {},
        {
          title: "基本信息",
          form: [
            {
              label: "交易区(档位)",
              value: "reportVO",
              detailFun: (value) => {
                return value?.stallName ? value?.stallName : "--";
              },
            },
            {
              label: "预计到场时间",
              value: "reportVO",
              detailFun: (value) => {
                return value?.expectEnterTime
                  ? timeFormat(value?.expectEnterTime)
                  : "--";
              },
            },
            {
              label: "来货车辆",
              value: "reportVO",
              detailFun: (value) => {
                return value?.carNo ? value?.carNo : "--";
              },
            },
            {
              label: "送货司机",
              value: "reportVO",
              detailFun: (value) => {
                return value?.driverName ? value?.driverName : "--";
              },
            },
            {
              label: "来货商品",
              value: "reportVO",
              detailFun: (value) => {
                const data = [];
                if (value?.purchaseGoodsList?.length) {
                  for (let i of value?.purchaseGoodsList) {
                    data.push(i.goodsName);
                  }
                  return data.join("、");
                }
                return "--";
              },
            },
            {
              label: "报备时间",
              value: "reportVO",
              detailFun: (value) => {
                return value?.reportTime ? timeFormat(value?.reportTime) : "--";
              },
            },
          ],
        },
        {
          title: "产地证明",
          form: [
            {
              label: "检测合格证号",
              value: "reportVO",
              detailFun: (value) => {
                return value?.certificate ? value?.certificate : "--";
              },
            },
            {
              label: "报备人",
              value: "reportVO",
              detailFun: (value) => {
                return value?.reporter ? value?.reporter : "--";
              },
            },
            {
              label: "证件照片",
              component: "a-upload",
              singleLine: true,
              detailValue: "files",
            },
          ],
        },
      ];
    };

    const afterGet = (form) => {
      return { ...form, files: form.reportVO ? form.reportVO.files : [] };
    };

    const goBack = () => {
      history.back()
    };

    const save = async () => {
      const res = await addFormRef.value.formValidate();
      if (res) {
        const reporter = JSON.parse(sessionStorage.getItem("GH-UserInfo"))?.name;
        let purchaseGoodsList = await JSON.parse(
          addFormRef.value.form?.purchaseGoodsList
        );
        purchaseGoodsList = replaceObjectKeys(purchaseGoodsList, {
          label: "goodsName",
          value: "goodsCode",
        });
        const params = {
          reporter: reporter,
          ...addFormRef.value.form,
          purchaseGoodsList: purchaseGoodsList,
          stallId: addFormRef.value.form.stall?.value,
          stallName: addFormRef.value.form.stall?.label,
          fileIds: addFormRef.value.form?.fileIds
            ? addFormRef.value.form.fileIds.split(",")
            : [],
          carNo: addFormRef.value.form.car?.value,
        };
        delete params.stall;
        delete params.car;
        await proxy.$api.entryFeeReport(params, "post").then((res) => {
          proxy.$message.success("操作成功");
          goBack();
        });
      }
    };

    const checkMerchant = () => {
      state.visible = true;
    };

    const saveModal = (value, item) => {
      if (item[0]) {
        state.merchant.label = item[0].name;
        state.merchant.value = item[0].id;
        addFormRef.value.form.merchantId = item[0].id;
      }

      state.selectedKeys = value;
    };

    const filterCar = (keyword) => {
      proxy.$api
        .carInfo({ keyword: keyword, status: "CHECK_PASS" }, "get")
        .then((res) => {
          if (res && res.records.length) {
            state.forbidInput = true;
            addFormRef.value.form.carTypeId = res.records[0].carTypeId;
            addFormRef.value.form.carWeight = res.records[0].carWeight;
          } else {
            state.forbidInput = false;
            addFormRef.value.form.carTypeId = null;
            addFormRef.value.form.carWeight = "";
            addFormRef.value.formValItem("carWeight");
          }
        });
    };

    onMounted(() => {
      if (type === "detail") {
        getStatus();
      }
    });

    watch(
      () => state.merchant,
      (n) => {
        if (n.label && n.value) {
          addFormRef.value.formValItem("merchantId");
          addFormRef.value.form.stall = null;
          gSelectRef.value?.getData({ merchantId: n.value });
        }
      },
      {
        deep: true,
      }
    );

    watch(
      () => addFormRef.value?.form.car,
      (n) => {
        if (n?.label) {
          filterCar(n?.label);
        } else {
          addFormRef.value.form.carTypeId = null;
          addFormRef.value.form.carWeight = "";
          addFormRef.value.formValItem("carWeight");
        }
      },
      {
        deep: true,
      }
    );

    return {
      id,
      type,
      gSelectRef,
      addFormRef,
      activeKey: ref("1"),
      ...toRefs(state),
      checkMerchant,
      saveModal,
      filterCar,
      afterGet,
      goBack,
      save,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");
:deep(.ant-tabs) {
  height: 100%;
  .ant-tabs-bar.ant-tabs-top-bar {
    background: #fafafa;
  }
}
:deep(.ant-tabs-content) {
  height: calc(100% - 45px);
  padding-top: 10px;
}
.hide {
  display: none;
}
</style>
