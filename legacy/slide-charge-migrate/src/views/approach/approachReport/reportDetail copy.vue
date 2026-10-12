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
        template(v-slot:carNo="{record}")  
          div.flex.justify-start
            g-select(
              :style="{maxWidth:'245px'}"
              v-model:value="carNo"
              :mode="'tags'"
              :showSearch="true"
              :url="'noReportCar'"
              :placeholder="'来货车辆'"
              @change="carChange"
            )
            a-button(type="primary" @click="checkBelong") {{province}}{{city}}
        template(v-slot:carWeight="{record}")  
          a-input(v-model:value="carWeight" placeholder="车辆皮重" :disabled="!record.carNo")
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
import reportList from "./reportList";
import { useRouter, useRoute } from "vue-router";
import { timeFormat, millennial } from "@/utils/common";
import { replaceObjectKeys } from "@pansy/utils";
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
              component: "TreeSelect",
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
              value: "carNo",
              placeholder: "请输入来货车辆",
              slot: true,
            },
            {
              label: "车辆类型",
              value: "carTypeId",
              placeholder: "请选择车辆类型",
              component: "gSelect",
              url: "carTypeConfigList",
              field: { carTypeName: "label", id: "value" },
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
              component: "app-date-picker",
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
      carWeight: "",
      carNo: [],
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
      choseBelong: false,
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
        carNo: [
          { required: true, message: "请输入来货车辆" },
          {
            validator() {},
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
      province: "川",
      clickPro: "",
      city: "A",
      clickCity: "",
      provinceChose: true,
      options: [
        {
          name: "浙",
          id: "浙",
          key: "浙江",
        },
        {
          name: "鲁",
          id: "鲁",
          key: "山东",
        },
        {
          name: "苏",
          id: "苏",
          key: "江苏",
        },
        {
          name: "沪",
          id: "沪",
          key: "上海",
        },
        {
          name: "闽",
          id: "闽",
          key: "福建",
        },
        {
          name: "皖",
          id: "皖",
          key: "安徽",
        },
        {
          name: "赣",
          id: "赣",
          key: "江西",
        },
        {
          name: "粤",
          id: "粤",
          key: "广东",
        },
        {
          name: "桂",
          id: "桂",
          key: "广西",
        },
        {
          name: "琼",
          id: "琼",
          key: "海南",
        },
        {
          name: "鄂",
          id: "鄂",
          key: "湖北",
        },
        {
          name: "湘",
          id: "湘",
          key: "湖南",
        },
        {
          name: "豫",
          id: "豫",
          key: "河南",
        },
        {
          name: "京",
          id: "京",
          key: "北京",
        },
        {
          name: "津",
          id: "津",
          key: "天津",
        },
        {
          name: "冀",
          id: "冀",
          key: "河北",
        },
        {
          name: "晋",
          id: "晋",
          key: "山西",
        },
        {
          name: "蒙",
          id: "蒙",
          key: "内蒙古",
        },
        {
          name: "宁",
          id: "宁",
          key: "宁夏",
        },
        {
          name: "新",
          id: "新",
          key: "新疆",
        },
        {
          name: "清",
          id: "清",
          key: "青海",
        },
        {
          name: "陕",
          id: "陕",
          key: "陕西",
        },
        {
          name: "甘",
          id: "甘",
          key: "甘肃",
        },
        {
          name: "川",
          id: "川",
          key: "四川",
        },
        {
          name: "云",
          id: "云",
          key: "云南",
        },
        {
          name: "贵",
          id: "贵",
          key: "贵州",
        },
        {
          name: "藏",
          id: "藏",
          key: "西藏",
        },
        {
          name: "渝",
          id: "渝",
          key: "重庆",
        },
        {
          name: "辽",
          id: "辽",
          key: "辽宁",
        },
        {
          name: "吉",
          id: "吉",
          key: "吉林",
        },
        {
          name: "黑",
          id: "黑",
          key: "黑龙江",
        },
      ],
      letterList: [
        { label: "A", value: "A" },
        { label: "B", value: "B" },
        { label: "C", value: "C" },
        { label: "D", value: "D" },
        { label: "E", value: "E" },
        { label: "F", value: "F" },
        { label: "G", value: "G" },
        { label: "H", value: "H" },
        { label: "J", value: "J" },
        { label: "K", value: "K" },
        { label: "L", value: "L" },
        { label: "M", value: "M" },
        { label: "N", value: "N" },
        { label: "P", value: "P" },
        { label: "Q", value: "Q" },
        { label: "R", value: "R" },
        { label: "S", value: "S" },
        { label: "T", value: "T" },
        { label: "U", value: "U" },
        { label: "V", value: "V" },
        { label: "W", value: "W" },
        { label: "X", value: "X" },
        { label: "Y", value: "Y" },
        { label: "Z", value: "Z" },
      ],
    });
    //获取当前数据支付状态和进场状态
    const getStatus = async () => {
      const data = await proxy.$api.entryFeeReportId(id,"get" );
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
          // purchaseGoodsList: replaceObjectKeys(purchaseGoodsList, {
          //   label: "goodsName",
          //   value: "goodsCode",
          // }),
          purchaseGoodsList: purchaseGoodsList,
          stallId: addFormRef.value.form.stall?.value,
          stallName: addFormRef.value.form.stall?.label,
          fileIds: addFormRef.value.form?.fileIds
            ? addFormRef.value.form.fileIds.split(",")
            : [],
        };
        delete params.stall;
        await proxy.$api.entryFeeReport(params,"post" ).then((res) => {
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

    const carChange = (e) => {
      if (e.length) {
        state.carNo = [e.reverse()[0]];
      } else {
        state.carNo = [];
      }
      addFormRef.value.form.carNo = e.reverse()[0];
    };

    const checkBelong = () => {
      state.choseBelong = true;
    };
    const next = () => {
      state.provinceChose = false;
    };
    const prev = () => {
      state.provinceChose = true;
    };

    const clickBelong = (type, id) => {
      if (type == "province") {
        state.clickPro = id;
      } else {
        state.clickCity = id;
      }
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

    return {
      id,
      type,
      gSelectRef,
      addFormRef,
      activeKey: ref("1"),
      ...toRefs(state),
      checkMerchant,
      clickBelong,
      checkBelong,
      saveModal,
      carChange,
      afterGet,
      goBack,
      save,
      next,
      prev,
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
.province,
.city {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-column-gap: 16px;
  grid-row-gap: 16px;
}
</style>
