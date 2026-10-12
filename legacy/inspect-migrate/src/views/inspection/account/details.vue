<template>
  <g-layout title="巡检记录详情">
    <template #content-table>
      <g-detail-form ref="detailForm" :api="api" :formList="formList" :afterGet="afterGet">
        <template v-slot:edit-item>
          <div class="item-title">工单关联</div>
          <div v-if="model?.recordToBusinessVOS.length" class="a-form-item-100">
            <a-table :dataSource="model.recordToBusinessVOS" :columns="orderCol" :pagination="false">
              <template #action="{ record }">
                <a-button type="link" @click="goOrderPage(record)">详情</a-button>
              </template>
            </a-table>
          </div>
          <a-empty v-else description="暂无关联工单"></a-empty>
          <div class="item-title">巡检结果</div>
          <template v-if="model?.standardVOS.length">
            <div class="a-form-item-100 inspectResult">
              <div v-for="item in model?.standardVOS" :key="item.id" class="mb2">
                <div class="title pb1">{{ item.standardName }}</div>
                <!-- <div>
                  结果：
                  <span :class="item.tempAddFlag ? 'normal' : 'unNormal'">
                    {{ item.tempAddFlag ? "正常" : "异常" }}
                  </span>
                </div> -->
                <!-- <div class="flex">
                  <span> 巡检项： </span> -->
                <div>
                  <template v-for="(ele, index) in item.itemVOS" :key="ele.id">
                    <div class="flex-start">
                      <div class="sortNum">{{ index + 1 }}、</div>
                      <span>{{ ele.itemName }} ：</span>
                      <span :class="[!ele.errorValueFlag ? 'normal' : 'abnormal']">
                        {{ ele.itemResultName }}
                      </span>
                    </div>
                    <div class="mb1 mt1 flex">
                      <div class="sortNum"></div>
                      <span>
                        描述信息：{{ ele.errorDesc ? ele.errorDesc : "--" }}
                      </span>
                    </div>
                    <div v-if="ele.fileVOS?.length" class="flex">
                      <div class="sortNum"></div>
                      <a-image-preview-group>
                        <a-image v-for="el in ele.fileVOS" :key="el.id" :src="el.path" :width="100"
                          :height="100"></a-image>
                      </a-image-preview-group>
                    </div>
                  </template>
                </div>
                <!-- </div> -->
              </div>
            </div>
          </template>
          <a-empty v-else description="暂无巡检结果"></a-empty>
        </template>
      </g-detail-form>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
      <a-button type="primary" v-if="model?.status === 'TO_BE_CONFIRMED'" @click="openModal">
        确认故障
      </a-button>
    </template>
  </g-layout>
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
import { timeFormat } from "@/utils/common";
import { useRouter, useRoute } from "vue-router";
import gLayout from '@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/components/global/Common/gLayout'
import gDetailForm from '@/components/Common/gDetailForm.vue'
export default defineComponent({
  components: {
    gLayout,
    gDetailForm
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();
    const modalForm = ref();
    const detailForm = ref();
    const state = reactive({
      api: {
        detail: "inspectAccountId",
      },
      model: null,
      formList: [
        {
          title: "基本信息",
          form: [
            {
              label: "发布时间",
              value: "createTime",
              detailFun: (value) => {
                return value ? timeFormat(value, true) : "--";
              },
            },
            { label: "巡检对象", value: "targetName" },
            {
              label: "任务名称",
              value: "taskName",
              html: true,
              detailFun: (value, form) => {
                return value
                  ? `<a href="./inspectionTaskDetails?type=detail&id=${form.taskId}&businessType=${route.query.businessType}">${value}</a>`
                  : "--";
              },
            },
            {
              label: "巡检计划",
              value: "planName",
              html: true,
              detailFun: (value, form) => {
                return value
                  ? `<a href="./inspectionPlanOperate?type=detail&id=${form.planId}&businessType=${route.query.businessType}">${value}</a>`
                  : "--";
              },
            },
            { label: "巡检人员", value: "nickname" },
            {
              label: "巡检时间",
              value: "time",
              detailFun: (value) => {
                return value ? timeFormat(value, true) : "--";
              },
            },
            {
              label: "状态",
              value: "status",
              detailFun: (value) => {
                switch (value) {
                  case "EXECUTING":
                    return "待巡检";
                  case "OVER":
                    return "已完成";
                  case "EXPIRE":
                    return "已过期";
                  case "STOP":
                    return "已终止";
                  case "CONFIRM":
                    return "待确认";
                  case "SPLIT":
                    return "待拆解";
                  case "ACCEPT":
                    return "待接收";
                  case "OVERTIME":
                    return "超时完成";
                  default:
                    return "--";
                }
              },
            },
            {
              label: "巡检结果",
              value: "result",
              html: true,
              detailFun: (value) => {
                switch (value) {
                  case "ABNORMAL":
                    return '异常'
                  case "NORMAL":
                    return '正常'
                  default:
                    return '--'
                }
              },
            },
            { label: "协同人", value: "assistNames" },
          ],
        },
      ],
      confirmPerson: "",
      visible: false,
      confirmModel: {
        faultId: "",
        confirmResult: "",
        processInstanceId: "31236485",
        remark: "",
      },
      rules: {
        confirmResult: [{ required: true, message: "请选择确认结果" }],
        processInstanceId: [{ required: true, message: "请选择业务流程" }],
      },
      options: [
        { name: "时", id: "hour" },
        { name: "天", id: "day" },
      ],
      confirmInfo: null,
      orderCol: [
        // ：fault_report
        // 隐患排查：hidden_danger
        {
          dataIndex: "businessCategory",
          title: "任务类型",
          slots: {
            customRender: "businessCategory",
          },
          customRender: ({ text }) => {
            let res;
            switch (text) {
              case "FAULT":
                res = "故障报修";
                break;
              case "HIDDENDANGER":
                res = "隐患排查";
                break;
            }
            return (
              <PopOver position="topLeft" content={text ? res : ""}>
                {text ? res : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "businessName",
          title: "名称",
          slots: {
            customRender: "businessName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "createTime",
          title: "时间",
          slots: {
            customRender: "createTime",
          },
          ellipsis: true,
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
          dataIndex: "businessStatus",
          title: "状态",
          slots: {
            customRender: "businessStatus",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
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
        },
      ],
    });

    const goBack = () => {
      // router.push('/inspectionAccount')
      history.back()
    };

    const afterGet = (res) => {
      state.model = res;
      return res;
    };

    const openModal = () => {
      state.visible = true;
    };

    const goPage = () => {
      router.push({
        path: "/faultOrderDetails",
        query: {
          id: state.confirmInfo.ticketId,
          type: "detail",
          hiddenDangerId: state.confirmInfo.faultId,
        },
      });
    };
    const goOrderPage = (record) => {
      if (record.businessCategory === "HIDDENDANGER") {
        const target = `/portal/stream-engine-render/index?businessType=HIDDENDANGER&processInstanceId=${record.businessId}&type=detail&title=隐患排查`
        history.pushState(history.state, "", target)
      } else {
        const target = `/portal/stream-engine-render/index?businessType=FAULT&processInstanceId=${record.businessId}&type=detail&title=故障报修`
        history.pushState(history.state, "", target)
      }
    };

    const submit = () => {
      modalForm.value.validate().then(() => {
        proxy.$api.faultConfirm(state.confirmModel, "put").then(() => {
          proxy.$message.success("操作成功");
          goBack();
        });
      });
    };

    const cancel = () => {
      state.confirmModel = {
        hiddenDangerCategoryId: "",
        hiddenDangerCategoryName: "",
        hiddenDangerTypeId: "",
        hiddenDangerTypeName: "",
        hiddenDangerLevelId: "",
        hiddenDangerLevelName: "",
        confirmResult: "",
        limitTime: "",
        limitTimeType: "hour",
        processInstanceId: "",
        processInstanceName: "",
        remark: "",
      };
      state.confirmModel.faultId = route.query.id;
      modalForm.value.resetFields();
      state.visible = false;
    };

    const changeUnit = () => {
      const base = state.confirmModel.limitTimeType;
      state.confirmModel.limitTimeType = base === "hour" ? "day" : "hour";
    };

    const changeLabel = (option, type) => {
      state.confirmModel[type] = option.label;
    };

    onMounted(() => {
      state.confirmModel.faultId = route.query.id;
    });

    return {
      modalForm,
      detailForm,
      ...toRefs(state),
      changeLabel,
      goOrderPage,
      changeUnit,
      timeFormat,
      openModal,
      afterGet,
      goPage,
      goBack,
      submit,
      cancel,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");

.ctr {
  width: 100%;
  height: 100%;
}

:deep(.ant-timeline) {
  width: 30%;
  margin: 0 auto;
}

.recordBtn {
  padding: 0;
}

.inspectResult {
  .title {
    font-weight: 500;
    font-weight: bold;
  }
}

:deep(.ant-image-img) {
  width: 100%;
  height: 100%;
}

.sortNum {
  width: 30px;
  height: 22px;
}
</style>
