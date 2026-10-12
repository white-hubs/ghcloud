<template>
  <g-layout :title="type === 'detail' ? `案例详情` : type === 'add' ? `案例新增` : `案例编辑`">
    <template #content-table>
      <template v-if="type !== 'detail'">
        <g-detail-form ref="detailRef" :api="api" :formList="formList" :rules="rules" :afterGet="afterGet" v-if="initStatus">
          <template v-slot:productCategoryCode="{ record }">
            <a-cascader
              v-model:value="record.productCategoryCode"
              :options="productCategoryOptions"
              :field-names="{ label: 'categoryName', value: 'categoryCode', children: 'children' }"
              placeholder="请选择"
            ></a-cascader>
          </template>
          <template v-slot:faultPhenomenon="{ record }">
            <g-edit
              v-if="type !== 'detail'"
              :id="'faultPhenomenon'"
              ref="faultPhenomenonInput"
              :text="record.faultPhenomenon"
              @get-html="(e) => getHtml('faultPhenomenon', e)"
              :height="200"
              placeholder="请填写现象"
              style="margin-right: 60px"
            ></g-edit>
          </template>
          <template v-slot:faultReason="{ record }">
            <g-edit
              v-if="type !== 'detail'"
              :id="'faultReason'"
              ref="faultReasonInput"
              :text="record.faultReason"
              @get-html="(e) => getHtml('faultReason', e)"
              :height="200"
              placeholder="请填写原因"
              style="margin-right: 60px"
            ></g-edit>
          </template>
          <template v-slot:treatmentMeasures="{ record }">
            <g-edit
              v-if="type !== 'detail'"
              :id="'treatmentMeasures'"
              ref="treatmentMeasuresInput"
              :text="record.treatmentMeasures"
              @get-html="(e) => getHtml('treatmentMeasures', e)"
              :height="200"
              placeholder="请填写处理措施"
              style="margin-right: 60px"
            ></g-edit>
          </template>
          <template v-slot:fileIds="{ record }">
            <g-upload
              :file="record.files"
              v-model:value="record.fileIds"
              :businessKey="'ouaa'"
              @changeFile="changeFile1"
              :sceneCode="GLOBAL_SCENE_CODE.faultOrderCase"
            ></g-upload>
          </template>
        </g-detail-form>
      </template>
      <template v-else>
        <a-tabs v-model:activeKey="activeKey">
          <a-tab-pane key="1" tab="案例详情">
            <g-detail-form :api="api" :formList="formList" :rules="rules">
              <template v-slot:productCategoryCode="{ record }"> </template>
            </g-detail-form>
          </a-tab-pane>
          <a-tab-pane key="2" tab="频次" force-render>
            <a-spin :spinning="spinning">
              <div class="top flex-start">
                <div class="total">
                  <div>
                    <div class="title pb2">总数</div>
                    <div class="times">
                      <span class="num">{{ echartsTotal }}</span>
                      <span class="unit">次</span>
                    </div>
                  </div>
                </div>
                <div class="echartsCtr">
                  <LineModel :data="lineData"></LineModel>
                </div>
              </div>
            </a-spin>
            <!-- <div class="tableCtr">
              <s-table
                ref="tableRef"
                :api="tableApi"
                :columns="columns"
                size="small"
                :btns="[]"
                :search="search"
                :beforeGet="beforeGet"
                :params="{ id: tableParams }"
              >
                <template #prebtn="{ record }">
                  <a @click="detailItem(record)"> 详情 </a>
                </template>
              </s-table>
            </div> -->
          </a-tab-pane>
        </a-tabs>
      </template>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
      <a-button v-if="type !== 'detail'" @click="save" type="primary"> 保存 </a-button>
    </template>
  </g-layout>
</template>
<script lang="jsx">
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { timeFormat, millennial } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import { replaceObjectKeys } from "@pansy/utils";
import { getCurrentInstance, defineComponent, createVNode, onMounted, reactive, toRefs, watch, ref } from "vue";
import { useRouter, useRoute } from "vue-router";

import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";

import { getBusinessPrefix } from "../../../hooks/useBusinessPrefix";
import { usePageName } from "../../../hooks/usePageName";
import LineModel from "./lineModel.vue";
import { cubeDeviceCenterService } from "@/api/service";
import { getCurrentApplicationCode } from "@/hooks/useCurrentApplication";
export default defineComponent({
  components: {
    LineModel,
  },
  setup() {
    const { title: pageTitle } = usePageName();
    const businessPrefix = getBusinessPrefix();
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const type = route.query.type;
    const tableRef = ref();
    const detailRef = ref();
    const faultReasonInput = ref();
    const faultPhenomenonInput = ref();
    const treatmentMeasuresInput = ref();
    const productCategoryOptions = ref();
    const state = reactive({
      activeKey: "1",
      api: {
        detail: "faultCaseId",
      },
      formList: [
        {
          title: "案例",
          form: [
            { label: "案例名称", value: "name", maxlength: 20, placeholder: "请输入" },
            {
              label: `${businessPrefix}类型`,
              value: "faultType",
              component: "g-select",
              url: "faultType",
              labelInValue: true,
              field: { name: "label", id: "value" },
              detailValue: "faultTypeName",
              placeholder: "请选择",
            },
            {
              label: "产品品类",
              value: "productCategoryCode",
              slot: true,
              detailValue: "productCategoryName",
            },
            {
              label: "现象",
              value: "faultPhenomenon",
              component: "g-edit",
              singleLine: true,
              slot: type === "detail" ? false : true,
              html: type !== "detail" ? false : true,
              detailFun: (value) => {
                return value;
              },
            },
            {
              label: "原因",
              value: "faultReason",
              slot: type === "detail" ? false : true,
              html: type !== "detail" ? false : true,
              detailFun: (value) => {
                return value;
              },
              singleLine: true,
            },
            {
              label: "处理措施",
              value: "treatmentMeasures",
              slot: type === "detail" ? false : true,
              html: type !== "detail" ? false : true,
              detailFun: (value) => {
                return value;
              },
              singleLine: true,
            },
            {
              label: "附件",
              value: "fileIds",
              component: type === "detail" ? "a-upload" : "g-upload",
              slot: type === "detail" ? false : true,
              detailValue: "files",
            },
          ],
        },
      ],
      rules: {
        name: [{ required: true, message: "请输入类型名称" }],
        faultType: [{ required: true, message: `请选择${businessPrefix}类型` }],
        productCategoryCode: [{ required: getCurrentApplicationCode() === "FAULT", message: "请选择产品品类" }],
        faultPhenomenon: [{ required: true, message: "请输入现象" }],
        faultReason: [{ required: true, message: "请输入原因" }],
        treatmentMeasures: [{ required: true, message: "请输入处理措施" }],
        fileIds: [{ required: true, message: "请上传附件" }],
      },
      names: {
        faultTypeName: "",
        deviceTypeName: "",
      },
      tableApi: {
        list: "faultTimes",
      },
      tableParams: route.query.id,
      timesTable: [],
      columns: [
        {
          dataIndex: "code",
          title: `${businessPrefix}单编号`,
          slots: {
            customRender: "code",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver content={text} position="topLeft">
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "submitTime",
          title: "工单时间",
          slots: {
            customRender: "submitTime",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? timeFormat(text, true) : ""}>
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "objName",
          title: `${businessPrefix}设备`,
          slots: {
            customRender: "objName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver content={text} position="topLeft">
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "faultTime",
          title: "时间",
          slots: {
            customRender: "faultTime",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? timeFormat(text, true) : ""}>
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "faultResult",
          title: "处理结果",
          slots: {
            customRender: "faultResult",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            let res;
            if (text === "CONFIRMED") {
              res = "确认";
            } else if (text === "NO_PROCESS") {
              res = "暂不处理";
            } else if (text === "UNRESOLVED") {
              res = "处理失败";
            } else if (text === "RESOLVED") {
              res = "处理成功";
            }
            return (
              <PopOver position="topLeft" content={text ? res : ""}>
                {text ? res : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
          fixed: "right",
          width: 200,
        },
      ],
      pagination: {
        total: 0,
        pageSize: 10,
        pageNumber: 1,
      },
      echartsTotal: 0,
      lineData: {
        series: [],
        xAxisData: [],
        boundaryGap: true,
      },
      search: [
        {
          label: "处理结果",
          value: "faultResult",
          component: "g-select",
          options: [
            { label: "处理失败", value: "UNRESOLVED" },
            { label: "处理成功", value: "RESOLVED" },
          ],
        },
        {
          label: "时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
          format: "YYYY-MM-DD",
        },
      ],
      spinning: false,
    });
    const initStatus = ref(false);

    const goBack = () => {
      // router.push('/faultCase')
      history.go(-1);
    };

    const detailItem = (record) => {
      router.push({
        path: "/faultDetails",
        query: {
          id: record.id ? record.id : "",
          type: "detail",
        },
      });
    };

    const getHtml = (type, e) => {
      detailRef.value.form[type] = e;
      detailRef.value.formValItem(type);
    };

    const save = async () => {
      faultReasonInput.value.getHtml();
      faultPhenomenonInput.value.getHtml();
      treatmentMeasuresInput.value.getHtml();
      const res = await detailRef.value.formValidate();
      if (res) {
        const params = {
          ...detailRef.value.form,
          productCategoryCode: detailRef.value.form?.productCategoryCode.join("-"),
          faultTypeId: detailRef.value.form?.faultType.value,
          faultTypeName: detailRef.value.form?.faultType.label,
          applicationCode: getCurrentApplicationCode(),
        };
        params.id
          ? proxy.$api.faultCaseId(params, "put").then(() => {
              proxy.$message.success("操作成功");
              goBack();
            })
          : proxy.$api.faultCaseAdd(params, "post").then(() => {
              proxy.$message.success("操作成功");
              goBack();
            });
      }
    };

    const changeFile1 = (e) => {
      detailRef.value.form.fileIds = e;
    };

    const afterGet = (form) => {
      return {
        ...form,
        deviceType: {
          label: form.deviceTypeName,
          value: form.deviceTypeId,
          key: form.deviceTypeId,
        },
        faultType: {
          label: form.faultTypeName,
          value: form.faultTypeId,
          key: form.faultTypeId,
        },
        files: replaceObjectKeys(form.files, {
          businessKey: "businessKey",
          id: "id",
          name: "name",
          path: "url",
          refCount: "refCount",
          size: "size",
          suffix: "suffix",
          type: "type",
        }),
        fileIds: form.files.map((item) => item.id),
        productCategoryCode: form.productCategoryCode.split("-"),
      };
    };

    const getRecent = () => {
      state.spinning = true;
      proxy.$api.recentMonth(route.query.id).then((res) => {
        if (res) {
          state.echartsTotal = res.total;
          state.lineData.xAxisData = res.months.map((item) => item.timeFlag);
          state.lineData.series = [
            {
              name: "频次",
              type: "line",
              stack: "Total",
              data: res.months.map((item) => item.num),
            },
          ];
        }
        state.spinning = false;
      });
    };

    const beforeGet = (params) => {
      const res = params.date
        ? {
            ...params,
            period: `${params.date[0]},${params.date[1]}`,
          }
        : params;
      delete res.date;
      return res;
    };

    onMounted(async () => {
      if (getCurrentApplicationCode() === "FAULT") {
        try {
          await cubeDeviceCenterService.getIotProductCategoryTree().then((res) => {
            productCategoryOptions.value = res;
          });
        } catch (error) {}
      } else {
        state.formList[0].form.splice(2, 1);
      }
      setTimeout(() => {
        initStatus.value = true;
      }, 0);
    });

    watch(
      () => state.activeKey,
      (n) => {
        if (n == "2") {
          getRecent();
          tableRef.value?.getData();
        }
      },
    );

    return {
      type,
      tableRef,
      detailRef,
      faultReasonInput,
      faultPhenomenonInput,
      treatmentMeasuresInput,
      initStatus,
      ...toRefs(state),
      changeFile1,
      detailItem,
      beforeGet,
      afterGet,
      getHtml,
      goBack,
      save,
      productCategoryOptions,
      pageTitle,
      businessPrefix,
      GLOBAL_SCENE_CODE,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");
:deep(.ant-tabs-top-content) {
  height: calc(100% - 60px);
}
.top {
  width: 100%;
  height: 200px;
  .total {
    width: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    .title {
      font-size: 20px;
      font-weight: bold;
    }
    .times {
      text-align: center;
      .num {
        font-size: 32px;
        font-weight: bold;
      }
    }
  }
  .echartsCtr {
    flex: 1;
    height: 100%;
  }
}
:deep(.ant-spin-nested-loading) {
  width: 100%;
  height: 200px;
  .ant-spin-container {
    width: 100%;
    height: 100%;
  }
}
.tableCtr {
  width: 100%;
  height: calc(100% - 200px);
  .ctr {
    padding: 0;
  }
}
:deep(.ant-tabs-nav-wrap) {
  background-color: #f3f3f3;
}
</style>
