<template>
  <div class="detail-form">
    <a-form ref="formRef" layout="inline">
      <template v-if="form.stallRelease.code">
        <div class="item-title">单据信息</div>
        <a-form-item label="单据编号" name="stallRelease.code"
          >{{ form.stallRelease.code }}
        </a-form-item>
        <a-form-item label="单据状态" name="stallRelease.status"
          >{{
            form.stallRelease.status
              ? {
                  STALL_RELEASE_PROCESSING: "处理中",
                  STALL_RELEASE_FINISHED: "已完成",
                  STALL_RELEASE_VOIDED: "已作废",
                  STALL_RELEASE_PENDING: "待处理",
                }[form.stallRelease.status]
              : "--"
          }}
        </a-form-item>
      </template>

      <div class="item-title">商家信息</div>
      <a-form-item label="商家名称" name="stallRelease.merchantName" required>
        <a-button
          type="link"
          @click="showBusiness"
          :disabled="disabled"
          v-if="!disabled"
        >
          选择</a-button
        >
        {{ form.stallRelease.merchantName }}
      </a-form-item>
      <a-form-item
        label="联系人姓名"
        v-if="form.stallRelease.merchantLiaison"
        name="stallRelease.merchantLiaison"
        >{{ form.stallRelease.merchantLiaison }}
      </a-form-item>
      <a-form-item
        label="联系手机号"
        v-if="form.stallRelease.merchantPhone"
        name="stallRelease.merchantPhone"
      >
        {{ form.stallRelease.merchantPhone }}</a-form-item
      >
      <div class="item-title">退租信息</div>
      <div class="a-form-item-100" :style="{ marginBottom: '20px' }">
        <a-table
          :disabled="disabled"
          rowKey="contractId"
          :dataSource="form.contractList"
          :columns="contractColumns"
          :pagination="false"
          :scroll="{ y: 300 }"
          :row-selection="disabled ? false : rowSelection"
        ></a-table>
      </div>
      <a-form-item label="退租时间" required>
        <span v-if="route.query.type === 'detail'">{{
          form.stallReleaseContract.releaseTime
        }}</span>
        <a-date-picker
          v-else
          v-model:value="form.stallReleaseContract.releaseTime"
          :disabled="disabled"
          :disabled-date="disabledDate"
        />
        <span>
          离到期日期剩
          {{ dynamicOverdueDays }}
          天</span
        >
      </a-form-item>
      <a-form-item label="退租原因" required>
        <span v-if="route.query.type === 'detail'">{{
          form.stallReleaseContract.remark
            ? form.stallReleaseContract.remark
            : "--"
        }}</span>
        <a-textarea
          v-else
          v-model:value="form.stallReleaseContract.remark"
          placeholder="输入退租原因"
          :rows="4"
          :disabled="disabled"
        />
      </a-form-item>
      <template
        v-for="item in form.stallRentContractTarget"
        :key="item.stallId"
      >
        <div class="a-form-item-100" style="margin-bottom: 20px">
          <a-divider orientation="left" style="font-size: 14px"
            >{{ item.stallName }}({{ item.stallCode }})</a-divider
          >
          <a-table
            :dataSource="item.detailVOS"
            :columns="feeColumns"
            :pagination="false"
            :scroll="{ y: 300 }"
            :row-selection="
              disabled
                ? false
                : {
                    selectedRowKeys: item.selectedRowKeys,
                    onChange: (selectedRowKeys) =>
                      onSelectChange(selectedRowKeys, item.stallId),
                  }
            "
            rowKey="id"
          ></a-table>
        </div>
        <a-form-item label="金额合计" name="totalMoney">
          {{ item.totalMoney }} 元
        </a-form-item>
        <a-form-item label="设备设施情况" name="remark">
          <span v-if="route.query.type === 'detail'">{{
            item.remark ? item.remark : "--"
          }}</span>
          <a-textarea
            v-else
            v-model:value="item.remark"
            placeholder="输入设备设施情况"
            :rows="4"
            :disabled="disabled"
          />
        </a-form-item>
      </template>
    </a-form>
    <businessModal
      :visible="businessVisible"
      activeId="iid"
      @close="closeBusiness"
    />
    <refundItemsModal
      :visible="refundItemsVisible"
      :activeId="[]"
      @close="closeRefundItems"
    />
  </div>
</template>

<script lang='jsx'>
import {
  defineComponent,
  reactive,
  ref,
  computed,
  unref,
  toRaw,
  watch,
  toRefs,
  onMounted,
  getCurrentInstance,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { timeFormat } from "@/utils/common";
import businessModal from "../../../components/business.vue";
import refundItemsModal from "../../../components/refundItems.vue";
export default defineComponent({
  components: {
    businessModal,
    refundItemsModal,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const formRef = ref();
    const { proxy } = getCurrentInstance();
    const businessVisible = ref(false);
    const refundItemsVisible = ref(false);
    const state = reactive({
      form: {
        stallRelease: {
          code: null,
          statusName: null,
          merchantAddress: null,
          merchantId: null,
          merchantLiaison: null,
          merchantName: null,
          merchantPhone: null,
        },
        contractList: [],
        stallReleaseContract: {
          contractId: null,
          releaseTime: null,
          totalMoney: null,
          remark: null,
          overdueDays: null,
        },
        stallRentContractTarget: [],
      },
      contractColumns: [
        {
          title: "合同编号",
          dataIndex: "contractCode",
          key: "contractCode",
        },
        {
          title: "合同状态",
          dataIndex: "contractStatus",
          key: "contractStatus",
          slots: {
            customRender: "contractStatus",
          },
          customRender: ({ text }) => {
            let str = "";
            if (text === "STATUS_DRAFT") {
              str = "草稿";
            } else if (text === "STATUS_BE_SIGNED") {
              str = "待签定";
            } else if (text === "STATUS_BE_EFFECTIVE") {
              str = "待生效";
            } else if (text === "STATUS_EFFECTIVE") {
              str = "已生效";
            } else if (text === "STATUS_BE_OVERDUE") {
              str = "过期";
            } else if (text === "STATUS_STOP") {
              str = "终止";
            } else {
              str = "作废";
            }
            return (
              <PopOver position="topLeft" content={str}>
                {str}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "leaseTerm",
          key: "leaseTerm",
          title: "租赁期限",
          slots: {
            customRender: "leaseTerm",
          },
          customRender: ({ text, record }) => {
            return (
              <PopOver
                position="topLeft"
                content={
                  timeFormat(record.leaseStartTime, false) +
                  "~" +
                  timeFormat(record.leaseEndTime, false)
                }
              >
                {timeFormat(record.leaseStartTime, false) +
                  "~" +
                  timeFormat(record.leaseEndTime, false)}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "targets",
          key: "targets",
          title: "租赁档位",
          slots: {
            customRender: "targets",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text.map((item) => item.businessName).join("/")}
              >
                {text.map((item) => item.businessName).join("/")}
              </PopOver>
            );
          },
        },
      ],
      feeColumns: [
        {
          title: "收费项目",
          dataIndex: "chargeProjectName",
          key: "chargeProjectName",
          slots: {
            customRender: "chargeProjectName",
          },
        },
        {
          title: "计费周期",
          dataIndex: "billingCycle",
          key: "billingCycle",
          slots: {
            customRender: "billingCycle",
          },
          customRender: ({ text }) => {
            let str = "";
            if (text === "MONTH") {
              str = "按月计费";
            } else if (text === "QUARTER") {
              str = "按季度计费";
            } else if (text === "HALF_YEAR") {
              str = "按半年计费";
            } else if (text === "YEAR") {
              str = "按年计费";
            }
            return (
              <PopOver position="topLeft" content={str}>
                {str}
              </PopOver>
            );
          },
        },
        {
          title: "期数",
          dataIndex: "periodNumber",
          key: "periodNumber",
          slots: {
            customRender: "periodNumber",
          },
        },
        {
          title: "周期时间",
          dataIndex: "periodTime",
          key: "periodTime",
          slots: {
            customRender: "periodTime",
          },
          customRender: ({ text, record }) => {
            return (
              <PopOver
                position="topLeft"
                content={
                  timeFormat(record.periodStartTime, false) +
                  "~" +
                  timeFormat(record.periodEndTime, false)
                }
              >
                {timeFormat(record.periodStartTime, false) +
                  "~" +
                  timeFormat(record.periodEndTime, false)}
              </PopOver>
            );
          },
        },
        {
          title: "金额(元)",
          dataIndex: "projectMoney",
          key: "projectMoney",
          slots: {
            customRender: "projectMoney",
          },
        },
        {
          title: "状态",
          dataIndex: "status",
          key: "status",
          slots: {
            customRender: "status",
          },
          customRender: ({ text }) => {
            let str = "";
            if (text === "BE_PAID") {
              str = "待付";
            } else if (text === "PAID") {
              str = "已付";
            } else if (text === "ABOLISH") {
              str = "作废";
            } else {
              str = "未知";
            }
            return (
              <PopOver position="topLeft" content={str}>
                {str}
              </PopOver>
            );
          },
        },
      ],
      disabled: route.query.type === "detail" ? true : false,
      leaseEndTime: null,
    });
    const rules = {
      "stallRelease.merchantName": [
        {
          required: true,
          message: "请选择商家",
          trigger: "change",
        },
      ],
      "stallReleaseContract.releaseTime": [
        {
          required: true,
          message: "请选择退租时间",
          trigger: "change",
        },
      ],
      stallReleaseContract: {
        remark: [
          {
            required: true,
            message: "请输入退租原因",
            trigger: "blur",
            type: String,
          },
        ],
      },
    };
    const rowSelection = computed(() => {
      return {
        type: "radio",
        selectedRowKeys: unref(state.form.stallReleaseContract.contractId),
        onChange: (keys) => {
          const data = state.form.contractList.find(
            (item) => item.contractId === keys[0]
          );
          state.form.stallReleaseContract.contractId = keys[0];
          state.leaseEndTime = data.leaseEndTime;
          getcontractLease(keys[0]);
        },
      };
    });
    const dynamicOverdueDays = computed(() => {
      if (state.form.stallReleaseContract.releaseTime && state.leaseEndTime) {
        var startDate = Date.parse(state.form.stallReleaseContract.releaseTime);
        var endDate = Date.parse(state.leaseEndTime);
        var days = (state.leaseEndTime - startDate) / (1 * 24 * 60 * 60 * 1000);
        // alert(days);
        return Math.ceil(days);
      }
      return state.form.stallReleaseContract.overdueDays || 0;
    });
    const showBusiness = () => {
      businessVisible.value = true;
    };

    /*获取商户下的合同列表*/
    const getStallReleaseMine = (id) => {
      proxy.$api.getStallReleaseMine( id).then((res) => {
        state.form.stallRentContractTarget = [];
        if (
          state.form.stallReleaseContract &&
          state.form.stallReleaseContract.contractId
        ) {
          if (route.query.type === "detail") {
            state.form.contractList = res.filter(
              (item) =>
                item.contractId === state.form.stallReleaseContract.contractId
            );
          } else {
            state.form.contractList = res;
          }

          state.form.stallRentContractTarget =
            state.form.stallRentContractTarget.map((item) => {
              let totalMoney = 0;
              let selectedRowKeys = [];
              if (route.query.type === "detail") {
                item.detailVOS = item.detailVOS.filter((d) => d.mark);
              }
              item.detailVOS.forEach((d) => {
                if (d.mark) {
                  selectedRowKeys.push(d.id);
                }
                totalMoney += Number(d.projectMoney);
              });
              item["selectedRowKeys"] = selectedRowKeys;
              return { ...item, totalMoney: Number(totalMoney).toFixed(2) };
            });
          if (state.form.stallReleaseContract.contractId) {
            getcontractLease(state.form.stallReleaseContract.contractId);
          }
        } else if (res && res[0]) {
          state.form.contractList = res;
          state.form.stallReleaseContract.contractId = res[0].contractId;
          state.form.stallReleaseContract.overdueDays = res[0].overdueDays;
          state.leaseEndTime = res[0].leaseEndTime;
          getcontractLease(res[0].contractId);
        }
      });
    };
    /*获取合同下的档位*/
    const getcontractLease = (id) => {
      proxy.$api
        .getStallLeaseContractMine( { contractId: id })
        .then((res) => {
          state.form.stallRentContractTarget = res.map((item) => {
            let totalMoney = 0;
            let selectedRowKeys = [];
            item.detailVOS.forEach((d) => {
              selectedRowKeys.push(d.id);
              totalMoney += Number(d.projectMoney);
            });
            item["selectedRowKeys"] = selectedRowKeys;
            return { ...item, totalMoney: Number(totalMoney).toFixed(2) };
          });
        });
    };
    const closeBusiness = (data) => {
      if (data && data.id) {
        proxy.$api.merchantId(data,"get" ).then((res) => {
          state.form.stallRelease.merchantId = res.id;
          state.form.stallRelease.merchantName = res.name;
          state.form.stallRelease.merchantPhone = res.phone;
          state.form.stallRelease.merchantAddress = res.address;
          state.form.stallRelease.merchantLiaison = res.liaison;
          businessVisible.value = false;
        });
        getStallReleaseMine(data.id);
      } else {
        state.form.stallReleaseContract = {
          contractId: null,
          releaseTime: null,
          totalMoney: null,
          remark: null,
          overdueDays: null,
        };
        businessVisible.value = false;
      }
    };

    const showRefundItems = () => {
      refundItemsVisible.value = true;
    };
    const closeRefundItems = (data) => {
      refundItemsVisible.value = false;
    };
    const getData = () => {
      proxy.$api.getStallReleaseId( route.query.id).then((res) => {
        state.form = res;
        state.form.stallReleaseContract.releaseTime = timeFormat(
          res.stallReleaseContract.releaseTime,
          false
        );
        getStallReleaseMine(res.stallRelease.merchantId);
      });
    };
    onMounted(() => {
      if (route.query.id) {
        getData();
      }
    });
    const onSelectChange = (selectedRowKeys, stallId) => {
      state.form.stallRentContractTarget.forEach((item, index) => {
        if (item.stallId === stallId) {
          state.form.stallRentContractTarget[index].selectedRowKeys =
            selectedRowKeys;
          let totalMoney = 0;
          state.form.stallRentContractTarget[index].detailVOS.forEach((d) => {
            if (selectedRowKeys.indexOf(d.id) > -1) {
              totalMoney += Number(d.projectMoney);
            }
          });
          state.form.stallRentContractTarget[index].totalMoney =
            totalMoney.toFixed(2);
        }
      });
    };
    //不可选择日期
    const disabledDate = (current) => {
      return current && timeFormat(current) > timeFormat(state.leaseEndTime);
    };
    return {
      ...toRefs(state),
      rules,
      businessVisible,
      refundItemsVisible,
      rowSelection,
      formRef,
      route,
      showBusiness,
      closeBusiness,
      showRefundItems,
      closeRefundItems,
      onSelectChange,
      dynamicOverdueDays,
      disabledDate,
    };
  },
});
</script>

<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");
</style>
