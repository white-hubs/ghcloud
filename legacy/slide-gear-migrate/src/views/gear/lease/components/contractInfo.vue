<template>
  <div class="detail-form">
    <a-form
      ref="formRef"
      layout="inline"
      :model="form"
      :rules="rules"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
      <div class="item-title">基础信息</div>
      <a-form-item label="签约方式">
        {{ route.query.type !== "renewal" ? "新签" : "续签" }}
      </a-form-item>
      <a-form-item label="合同编号" v-if="route.query.id && form.code">
        {{ form.code }}
      </a-form-item>
      <a-form-item label="原合同编号" v-if="route.query.id && form.oldCode">
        {{ form.oldCode }}
      </a-form-item>
      <a-form-item label="合同状态" v-if="route.query.id && form.status">
        {{
          contractStatus.filter((item) => item.value === form.status)[0].name
        }}
      </a-form-item>
      <a-form-item
        label="合同状态"
        name="status"
        v-if="route.query.type === 'supplementary'"
      >
        <a-select
          v-model:value="form.status"
          placeholder="请选择合同状态"
          :disabled="disabled"
        >
          <a-select-option value="STATUS_BE_EFFECTIVE" key="STATUS_BE_EFFECTIVE"
            >待生效</a-select-option
          >
          <a-select-option value="STATUS_EFFECTIVE" key="STATUS_EFFECTIVE"
            >已生效</a-select-option
          >
          <a-select-option value="STATUS_BE_OVERDUE" key="STATUS_BE_OVERDUE"
            >过期</a-select-option
          >
          <a-select-option value="STATUS_STOP" key="STATUS_STOP"
            >终止</a-select-option
          >
        </a-select>
      </a-form-item>
      <a-form-item
        label="原合同编号"
        name="code"
        v-if="route.query.type === 'supplementary'"
      >
        <span v-if="route.query.type === 'detail'">{{ form.code }}</span>
        <a-input
          v-else
          v-model:value="form.code"
          placeholder="请输入原合同编号"
        ></a-input>
      </a-form-item>
      <a-form-item label="合同类型" name="contractTypeId">
        <span v-if="route.query.type === 'detail'">
          {{ form.contractTypeName }}
        </span>
        <a-tree-select
          v-else
          v-model:value="form.contractTypeId"
          placeholder="请选择合同类型"
          :tree-data="typeSource"
          @change="changeContractType"
          :disabled="disabled"
          :style="{ width: '300px' }"
        ></a-tree-select>
      </a-form-item>
      <a-form-item label="合同模板" name="contractTmpId">
        <span v-if="route.query.type === 'detail'">
          {{ form.contractTmpName }}
        </span>
        <a-select
          v-else
          v-model:value="form.contractTmpId"
          placeholder="请选择合同模板"
          @change="changeContractTmp"
          :disabled="disabled"
        >
          <a-select-option
            :value="item.id"
            v-for="item in templateSource"
            :key="item.id"
            >{{ item.name }}</a-select-option
          >
        </a-select>
      </a-form-item>
      <a-form-item label="创建日期" v-if="form.createTime">{{
        form.createTime
      }}</a-form-item>
      <a-form-item label="创建来源" v-if="route.query.id">
        {{ form.source === "CREATE_APPROVE" ? "审批创建" : "手动创建" }}
      </a-form-item>
      <a-form-item label="签订方式" v-if="route.query.type === 'supplementary'"
        >线下签订</a-form-item
      >
      <a-form-item
        label="签订日期"
        v-if="
          (route.query.type === 'supplementary' || form.signTime) &&
          route.query.type !== 'renewal'
        "
        name="signTime"
      >
        <span v-if="route.query.type === 'detail'">{{ form.signTime }}</span>
        <a-date-picker
          v-else
          v-model:value="form.signTime"
          placeholder="请选择签订日期"
          :disabled="disabled"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item
        label="纸质编号"
        name="paperCode"
        v-if="
          (route.query.type === 'supplementary' || form.paperCode) &&
          route.query.type !== 'renewal'
        "
      >
        <span v-if="route.query.type === 'detail'">{{ form.paperCode }}</span>
        <a-input
          v-else
          v-model:value="form.paperCode"
          placeholder="请输入原合同编号"
          :disabled="disabled"
        ></a-input>
      </a-form-item>
      <a-form-item
        label="终止日期"
        v-if="form.status === 'STATUS_STOP'"
        name="stopTime"
      >
        <span v-if="route.query.type === 'detail'">{{ form.stopTime }}</span>
        <a-date-picker
          v-else
          v-model:value="form.stopTime"
          placeholder="请选择终止日期"
          :disabled="disabled"
        />
      </a-form-item>
      <a-form-item
        label="终止原因"
        v-if="form.status === 'STATUS_STOP'"
        name="stopReason"
      >
        <span v-if="route.query.type === 'detail'">{{
          form.stopReason ? form.stopReason : "--"
        }}</span>
        <a-textarea
          v-else
          v-model:value="form.stopReason"
          placeholder="请输入终止原因"
          :rows="4"
          :disabled="disabled"
        />
      </a-form-item>
      <a-form-item label="审批单号" v-if="form.approvalNo">
        {{ form.approvalNo }}
      </a-form-item>
      <a-form-item
        label="纸质合同附件"
        name="fileIds"
        class="a-form-item-100"
        v-if="
          (route.query.type === 'supplementary' ||
            route.query.status === 'STATUS_BE_EFFECTIVE' ||
            fileList.length > 0) &&
          route.query.type !== 'renewal'
        "
      >
        <g-upload
          @changeFile="handleChange"
          :file="fileList"
          businessKey="contract"
          :disabled="disabled"
          :sceneCode="GLOBAL_SCENE_CODE.stallInfo"
        ></g-upload>
      </a-form-item>
      <a-form-item
        label="作废日期"
        v-if="
          route.query.type === 'detail' &&
          route.query.status === 'STATUS_ABOLISH'
        "
      >
        {{ form.obsoleteTime }}
      </a-form-item>
      <a-form-item
        label="作废原因"
        v-if="
          route.query.type === 'detail' &&
          route.query.status === 'STATUS_ABOLISH'
        "
      >
        {{ form.obsoleteReason }}
      </a-form-item>
      <div class="item-title">签约信息</div>
      <a-form-item label="出租人(甲方)" name="partyId">
        <span v-if="route.query.type === 'detail'">{{ form.partyName }}</span>
        <a-select
          v-else
          v-model:value="form.partyId"
          placeholder="请选择出租人"
          @change="changePartyA"
          :disabled="disabled"
        >
          <a-select-option
            :value="item.id"
            v-for="item in partyASource"
            :key="item.id"
            >{{ item.name }}</a-select-option
          >
        </a-select>
      </a-form-item>
      <a-form-item label="甲方签约人" name="partySignatoryId">
        <span v-if="route.query.type === 'detail'">{{
          form.partySignatoryName
        }}</span>
        <a-select
          v-else
          v-model:value="form.partySignatoryId"
          placeholder="请选择甲方签约人"
          :disabled="!form.partyId || disabled"
          @change="changePartySignatory"
        >
          <a-select-option
            :value="item.id"
            v-for="item in signatorySource"
            :key="item.id"
            >{{ item.name }}</a-select-option
          >
        </a-select>
      </a-form-item>
      <a-form-item label="承租人(乙方)" name="merchantId">
        <a-button
          type="link"
          @click="showBusiness"
          :disabled="disabled"
          v-if="!disabled"
          >选择</a-button
        >
        {{ form.merchantName }}
      </a-form-item>
      <a-form-item label="乙方签约人" name="merchantSignatoryName">
        <span v-if="route.query.type === 'detail'">{{
          form.merchantSignatoryName
        }}</span>
        <a-input
          v-else
          v-model:value="form.merchantSignatoryName"
          placeholder="请输入乙方签约人"
          :disabled="disabled"
        />
      </a-form-item>
      <div class="item-title">租赁信息</div>
      <a-form-item label="承租方式" name="leaseModeId">
        <span v-if="route.query.type === 'detail'">{{
          form.leaseModeId && leaseMode.length
            ? leaseMode.find((z) => form.leaseModeId === z.id).leaseModeName
            : "--"
        }}</span>
        <a-select
          v-else
          v-model:value="form.leaseModeId"
          placeholder="请选择承租方式"
          @change="changeLeaseMode"
          :disabled="disabled"
        >
          <a-select-option
            :value="item.id"
            v-for="item in leaseMode"
            :key="item.id"
            >{{ item.leaseModeName }}</a-select-option
          >
        </a-select>
      </a-form-item>
      <a-form-item label="租赁时长" name="leaseDuration">
        <span v-if="route.query.type === 'detail'">{{
          form.leaseDuration && leaseDurationSource.length
            ? leaseDurationSource.find((z) => form.leaseDuration === z.value)
                .name
            : "--"
        }}</span>
        <a-select
          v-else
          v-model:value="form.leaseDuration"
          placeholder="请选择租赁时长"
          :disabled="!form.leaseModeId || disabled"
          @change="changeLeaseDuration"
        >
          <a-select-option
            :value="item.value"
            v-for="item in leaseDurationSource"
            :key="item.value"
            >{{ item.name }}</a-select-option
          >
        </a-select>
      </a-form-item>
      <a-form-item
        label="租赁期限"
        name="leaseStartTime"
        :wrapper-col="{ span: 22 }"
        class="a-form-item-100"
      >
        <span v-if="route.query.type === 'detail'">
          {{ form.leaseStartTime }}至{{ form.leaseEndTime }}
        </span>
        <template v-else>
          <a-date-picker
            v-model:value="form.leaseStartTime"
            placeholder="请选择租赁期限"
            style="width: 120px"
            :disabled="!form.leaseDuration || disabled"
            @change="changeLeaseStartTime"
            :disabled-date="disabledStartDate"
          />--
          <a-date-picker
            v-model:value="form.leaseEndTime"
            placeholder="请选择租赁期限"
            style="width: 120px"
            disabled
          />
        </template>
      </a-form-item>
      <a-form-item
        label="租赁档位"
        name="leaseTargetModifyParams"
        class="a-form-item-100"
      >
        <a-button
          type="link"
          @click="showGear"
          :disabled="!form.leaseStartTime || disabled"
          v-if="!disabled"
          >选择</a-button
        >
        <template v-if="!disabled">
          <a-tag
            v-for="item in form.leaseTargetModifyParams"
            :key="item.businessId"
            @close="deleteLeaseTarget(item.businessId)"
            >{{ item.businessCode }}</a-tag
          >
        </template>
        <template v-else>
          {{
            form.leaseTargetModifyParams
              .map((item) => item.businessCode)
              .join("、")
          }}
        </template>
      </a-form-item>
      <div class="item-title">费用明细</div>
      <div
        class="fee"
        v-for="item in form.leaseTargetModifyParams"
        :key="item.businessId"
      >
        <div class="fee-detail">
          <div>
            {{ item.businessCode }} 所在区域：{{ item.areaName }}
            {{ item.location }} / 建筑面积：{{ item.builtUpArea }}m² /
            实用面积：{{ item.practicalArea }}m²
          </div>
          <div style="padding-right: 20px">
            金额小计 {{ item.totalMoney }} 元
          </div>
        </div>
        <a-table
          :dataSource="item.leaseCostProjectModifyParams"
          :columns="
            !disabled ? columns : columns.filter((z) => z.title !== '操作')
          "
          :pagination="false"
        >
          <template #calculationMode="{ record }">
            <div class="editable-cell">
              <div
                v-if="editableData[record.businessId_chargeProjectId]"
                class="editable-cell-input-wrapper"
              >
                <a-select
                  v-model:value="
                    editableData[record.businessId_chargeProjectId]
                      .calculationMode
                  "
                  placeholder="请选择计算方式"
                  style="width: 200px"
                >
                  <a-select-option
                    :value="item.value"
                    v-for="item in calculationMode"
                    :key="item.value"
                    >{{ item.name }}</a-select-option
                  >
                </a-select>
              </div>
              <div v-else>
                {{
                  calculationMode.find(
                    (item) => item.value === record.calculationMode
                  ).name
                }}
              </div>
            </div>
          </template>
          <template #unitPrice="{ text, record }">
            <div>
              <a-input-number
                :precision="2"
                :min="0"
                v-if="editableData[record.businessId_chargeProjectId]"
                v-model:value="
                  editableData[record.businessId_chargeProjectId].unitPrice
                "
                style="margin: -5px 0"
              />
              <template v-else>
                {{ text }}
              </template>
            </div>
          </template>
          <template #billingCycle="{ record }">
            <div class="editable-cell">
              <div
                v-if="editableData[record.businessId_chargeProjectId]"
                class="editable-cell-input-wrapper"
              >
                <a-select
                  v-model:value="
                    editableData[record.businessId_chargeProjectId].billingCycle
                  "
                  placeholder="请选择计费周期"
                  style="width: 200px"
                >
                  <a-select-option
                    :value="item.value"
                    v-for="item in billingCycle"
                    :key="item.value"
                    >{{ item.name }}</a-select-option
                  >
                </a-select>
              </div>
              <div v-else>
                {{
                  billingCycle.find(
                    (item) => item.value === record.billingCycle
                  ).name
                }}
              </div>
            </div>
          </template>
          <template #operation="{ record }" v-if="!disabled">
            <div class="editable-row-operations">
              <span v-if="editableData[record.businessId_chargeProjectId]">
                <a-button
                  @click="
                    saveRecord(
                      record.businessId_chargeProjectId,
                      item.businessId
                    )
                  "
                  type="link"
                  :disabled="disabled"
                  >保存</a-button
                >
                <a-popconfirm
                  title="确定取消?"
                  @confirm="cancel(record.businessId_chargeProjectId)"
                >
                  <a-button type="link" :disabled="disabled">取消</a-button>
                </a-popconfirm>
              </span>
              <span v-else>
                <a-button
                  @click="
                    editRecord(
                      record.businessId_chargeProjectId,
                      item.businessId
                    )
                  "
                  type="link"
                  :disabled="disabled"
                  >编辑</a-button
                >
              </span>
              <a-popconfirm
                v-if="!editableData[record.businessId_chargeProjectId]"
                title="确定移除?"
                :disabled="disabled"
                @confirm="
                  onDelete(record.businessId_chargeProjectId, item.businessId)
                "
              >
                <a-button class="deleteRow" type="link" :disabled="disabled"
                  >移除</a-button
                >
              </a-popconfirm>
            </div>
          </template>
        </a-table>
        <div class="item-title" v-if="!disabled">
          <a-button
            type="link"
            @click="showPaymentItems(item.businessId)"
            :disabled="disabled || !form.leaseStartTime"
            >选择费项</a-button
          >
        </div>
      </div>
      <a-form-item label="租赁费用总计" name="label14">
        {{ totalFee }} 元
      </a-form-item>
    </a-form>
    <businessModal
      :visible="businessVisible"
      activeId="iid"
      @close="closeBusiness"
    />
    <gearModal :visible="gearVisible" :activeId="[]" @close="closeGear" />
    <paymentItemsModal
      :visible="paymentItemsVisible"
      :activeId="[]"
      @close="closePaymentItems"
    />
  </div>
</template>

<script lang='jsx'>
import {
  defineComponent,
  reactive,
  ref,
  computed,
  toRefs,
  getCurrentInstance,
  onMounted,
  watch,
} from "vue";
import { cloneDeep } from "lodash-es";
import businessModal from "../../../components/business.vue";
import gearModal from "../../../components/gear.vue";
import paymentItemsModal from "../../../components/paymentItems.vue";
import { useRoute, useRouter } from "vue-router";
import { replaceObjectKeys } from "@pansy/utils";
import {
  calculationMode,
  billingCycle,
  contractStatus,
} from "@/utils/enumerate";
import { timeFormat } from "@/utils/common.js";
import {GLOBAL_SCENE_CODE} from "@ghcloud/cube-file-service"
export default defineComponent({
  props: {
    contractId: {
      type: String,
      default: null,
    },
    byContractId: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    businessModal,
    gearModal,
    paymentItemsModal,
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const formRef = ref();
    const businessVisible = ref(false);
    const gearVisible = ref(false);
    const paymentItemsVisible = ref(false);
    const fileList = ref([]);

    const formState = reactive({
      form: {
        signTime: null,
        paperCode: null,
        stopTime: null,
        stopReason: null,
        code: null,
        status: null,
        signType: null,
        approvalNo: null,
        source: null,
        createTime: null,
        contractTypeId: null,
        contractTypeName: null,
        contractTmpId: null,
        contractTmpName: null,
        partyId: null,
        partyName: null,
        partyLiaison: null,
        partyPhone: null,
        partyAddress: null,
        partySignatoryId: null,
        partySignatoryName: null,
        merchantId: null,
        merchantName: null,
        merchantSignatoryName: null,
        merchantPhone: null,
        merchantAddress: null,
        merchantLiaison: null,
        businessType: "LEASE_STALL",
        leaseModeId: null,
        leaseModeName: null,
        leaseDurationUnit: null,
        leaseDuration: null,
        leaseStartTime: null,
        leaseEndTime: null,
        leaseTargetModifyParams: [],
        fileIds: [],
      },
      typeSource: [],
      templateSource: [],
      partyASource: [],
      signatorySource: [],
      leaseDurationSource: [],
      leaseMode: [],
      calculationMode: calculationMode.filter((item) => item.label !== "全部"),
      contractStatus: contractStatus.filter((item) => item.label !== "全部"),
      billingCycle: billingCycle.filter((item) => item.label !== "全部"),
      paymentItems_businessId: null,
      disabled: route.query.type === "detail" ? true : false,
    });
    const rules = {
      contractTypeId: [
        {
          required: true,
          message: "请选择合同类型",
          trigger: "change",
        },
      ],
      contractTmpId: [
        {
          required: true,
          message: "请选择合同模板",
          trigger: "change",
        },
      ],
      partyId: [
        {
          required: true,
          message: "请选择出租人",
          trigger: "change",
        },
      ],
      partySignatoryId: [
        {
          required: true,
          message: "请选择甲方签约人",
          trigger: "change",
        },
      ],
      merchantId: [
        {
          required: true,
          message: "请选择承租人",
          trigger: "change",
        },
      ],
      merchantSignatoryName: [
        {
          required: true,
          message: "请输入乙方签约人",
          trigger: "blur",
        },
      ],
      leaseModeId: [
        {
          required: true,
          message: "请选择承租方式",
          trigger: "change",
        },
      ],
      leaseDuration: [
        {
          required: true,
          message: "请选择租赁时长",
          trigger: "change",
        },
      ],
      leaseStartTime: [
        {
          required: true,
          message: "请选择租赁期限",
          trigger: "change",
          type: "date",
        },
      ],
      stopTime: [
        {
          required: true,
          message: "请选择终止日期",
          trigger: "change",
          type: "date",
        },
      ],
      stopReason: [
        {
          required: true,
          message: "请输入终止原因",
          trigger: "change",
        },
      ],
      paperCode: [
        {
          required: true,
          message: "请输入纸质合同编号",
          trigger: "change",
        },
      ],
      code: [
        {
          required: true,
          message: "请输入原合同编号",
          trigger: "change",
        },
      ],
      signTime: [
        {
          required: true,
          message: "请选择签订日期",
          trigger: "change",
          type: "date",
        },
      ],
      status: [
        {
          required: true,
          message: "请选择合同状态",
          trigger: "change",
        },
      ],
      fileIds: [
        {
          required: true,
          message: "请上传合同附件",
          trigger: "change",
          type: "array",
        },
      ],
      leaseTargetModifyParams: [
        {
          required: true,
          message: "请选择租赁档位号",
          trigger: "change",
          type: "array",
        },
      ],
    };
    const editableData = reactive({});

    const columns = [
      {
        title: "收费项目",
        dataIndex: "chargeProjectName",
        key: "chargeProjectName",
      },
      {
        title: "计算方式",
        dataIndex: "calculationMode",
        key: "calculationMode",
        slots: {
          customRender: "calculationMode",
        },
      },
      {
        title: "单价",
        dataIndex: "unitPrice",
        key: "unitPrice",
        slots: {
          customRender: "unitPrice",
        },
      },
      {
        title: "计费周期",
        dataIndex: "billingCycle",
        key: "billingCycle",
        slots: {
          customRender: "billingCycle",
        },
      },
      {
        title: "金额",
        dataIndex: "projectMoney",
        key: "projectMoney",
        slots: {
          customRender: "projectMoney",
        },
      },
      {
        title: "操作",
        dataIndex: "operation",
        slots: {
          customRender: "operation",
        },
      },
    ];
    const totalFee = computed(() => {
      let fee = 0;
      formState.form.leaseTargetModifyParams.forEach((item) => {
        fee += Number(item.totalMoney);
      });
      return fee.toFixed(2);
    });

    /*获取合同类型*/
    const getType = () => {
      proxy.$api
        .getContractTypes( {
          enabled: true,
        })
        .then((res) => {
          let data = res.map((item) => {
            return Object.assign(item, {
              children: item.contractTypeVOS,
              id: Math.random(1000),
              disabled: true,
            });
          });
          formState.typeSource = replaceObjectKeys(data, {
            disabled: "disabled",
            children: "children",
            id: "value",
            name: "title",
          });
        });
    };
    /*获取合同模板*/
    const getTemplate = () => {
      proxy.$api
        .getContractTmps( {
          enabled: true,
        })
        .then((res) => {
          formState.templateSource = res.records;
        });
    };
    /*获取出租人（甲方）*/
    const getPartyA = () => {
      proxy.$api
        .getPartys( {
          enabled: true,
        })
        .then((res) => {
          formState.partyASource = res.records;
        });
    };
    /*获取承租方式*/
    const getLeaseMode = () => {
      proxy.$api.getLeaseModes().then((res) => {
        formState.leaseMode = res;
        if (formState.form.leaseModeId) {
          formState.leaseMode.forEach((item) => {
            if (item.id === formState.form.leaseModeId) {
              const durationUnit = item.durationUnit === "MONTH" ? "月" : "年";
              formState.form.leaseDurationUnit = item.durationUnit;
              formState.form.leaseModeName = item.leaseMode;
              item.leaseDuration.forEach((l) => {
                formState.leaseDurationSource.push({
                  name: l + durationUnit,
                  value: String(l),
                });
              });
            }
          });
        }
      });
    };
    getLeaseMode();
    /*获取甲方签约人*/
    const getSignatorySource = (value) => {
      proxy.$api.getParty( value).then((res) => {
        formState.signatorySource = res.partySignatoryVOS;
      });
    };
    /*选择合同状态*/
    const disabledStartDate = (startValue) => {
      if (!startValue) {
        return false;
      }
      if (route.query.type === "supplementary") {
        if (formState.form.status === "STATUS_EFFECTIVE") {
          //已生效
          const date = new Date();
          return startValue.valueOf() > date;
        } else if (formState.form.status === "STATUS_BE_EFFECTIVE") {
          //待生效
          const date = new Date();
          return startValue.valueOf() < date;
        }
      }
      return false;
    };

    /*选择合同类型*/
    const changeContractType = (value, label) => {
      formState.form.contractTypeName = label[0] ? label[0] : "";
    };
    /*选择合同模板*/
    const changeContractTmp = (value, option) => {
      formState.form.contractTmpName = option.children[0]
        ? option.children[0].children
        : "";
    };
    /*选择出租人*/
    const changePartyA = (value) => {
      const data = formState.partyASource.filter((item) => item.id === value);
      (formState.form.partyName = data[0].name),
        (formState.form.partyLiaison = data[0].liaison),
        (formState.form.partyPhone = data[0].phone),
        (formState.form.partyAddress = data[0].address),
        (formState.form.partySignatoryId = null);
      getSignatorySource(value);
    };
    /*选择甲方签约人*/
    const changePartySignatory = (value, option) => {
      formState.form.partySignatoryName = option.children[0]
        ? option.children[0].children
        : "";
    };
    /*选择承租方式*/
    const changeLeaseMode = (value) => {
      formState.form.leaseDuration = null;
      formState.form.leaseStartTime = null;
      formState.form.leaseEndTime = null;
      formState.leaseDurationSource = [];
      formState.leaseMode.forEach((item) => {
        if (item.id === value) {
          const durationUnit = item.durationUnit === "MONTH" ? "月" : "年";
          formState.form.leaseDurationUnit = item.durationUnit;
          formState.form.leaseModeName = item.leaseMode;
          item.leaseDuration.forEach((l) => {
            formState.leaseDurationSource.push({
              name: l + durationUnit,
              value: String(l),
            });
          });
        }
      });
      formState.form.leaseTargetModifyParams = [];
    };
    /*获取几个月后日期*/
    const addmulMonth = (dtstr, n) => {
      var s = dtstr.split("-");
      var yy = parseInt(s[0]);
      var mm = parseInt(s[1]);
      var dd = parseInt(s[2]);
      var dt = new Date(yy, mm, dd);
      var num = dt.getMonth() + parseInt(n);
      if (num / 12 >= 1) {
        yy += Math.floor(num / 12);
        mm = num % 12 === 0 ? 12 : num % 12;
      } else {
        if (mm === 12) {
          mm = 0;
          if (n < 12) {
            yy += Math.floor((num + 12) / 12);
          }
        }
        mm += parseInt(n);
      }
      var dt2 = new Date(yy, mm, 0);
      dd = dd > dt2.getDate() ? dt2.getDate() : dd;
      if (dd === 1) {
        if (mm === 1) {
          mm = 12;
          yy = yy - 1;
        } else {
          mm = mm - 1;
          var dt3 = new Date(yy, mm, 0);
          dd = dt3.getDate();
        }
      } else {
        dd = dd - 1;
      }
      return (
        yy + "-" + (mm < 10 ? "0" + mm : mm) + "-" + (dd < 10 ? "0" + dd : dd)
      );
    };
    /*选择租赁期限*/
    const changeLeaseStartTime = (value, dateString) => {
      if (formState.form.leaseDurationUnit === "MONTH") {
        formState.form.leaseEndTime = addmulMonth(
          dateString,
          formState.form.leaseDuration
        );
      } else {
        formState.form.leaseEndTime = addmulMonth(
          dateString,
          formState.form.leaseDuration * 12
        );
      }
      formState.form.leaseTargetModifyParams = [];
    };

    /*选择租赁时长*/
    const changeLeaseDuration = () => {
      formState.form.leaseStartTime = null;
      formState.form.leaseEndTime = null;
      formState.form.leaseTargetModifyParams = [];
    };
    //选择文件
    const handleChange = (data) => {
      formState.form.fileIds = data;
    };

    /*删除租赁档位号*/
    const deleteLeaseTarget = (businessId) => {
      formState.form.leaseTargetModifyParams =
        formState.form.leaseTargetModifyParams.filter(
          (item) => item.businessId !== businessId
        );
    };

    const onDelete = (key, businessId) => {
      formState.form.leaseTargetModifyParams.forEach((item) => {
        if (item.businessId === businessId) {
          item.leaseCostProjectModifyParams =
            item.leaseCostProjectModifyParams.filter(
              (l) => l.businessId_chargeProjectId !== key
            );
        }
      });
      const data = {
        webCreateParams: [
          {
            businessId: businessId,
            leaseStartTime: timeFormat(formState.form.leaseStartTime, false),
            leaseEndTime: timeFormat(formState.form.leaseEndTime, false),
            projectWebCreateParams:
              formState.form.leaseTargetModifyParams.filter(
                (item) => businessId === item.businessId
              )[0].leaseCostProjectModifyParams,
          },
        ],
      };
      proxy.$api.postContractLeaseCostDetail( data).then((res) => {
        formState.form.leaseTargetModifyParams.forEach((item) => {
          if (businessId === item.businessId) {
            item.totalMoney = Number(res[0].money).toFixed(2);
          }
        });
        delete editableData[key];
      });
    };
    const editRecord = (key, businessId) => {
      formState.form.leaseTargetModifyParams.forEach((item) => {
        if (item.businessId === businessId) {
          item.leaseCostProjectModifyParams.forEach((l) => {
            if (key === l.businessId_chargeProjectId) {
              editableData[key] = cloneDeep(l);
            }
          });
        }
      });
    };
    const saveRecord = (key, businessId) => {
      if (!editableData[key].unitPrice) {
        proxy.$message.warn("请输入单价");
        return;
      }

      formState.form.leaseTargetModifyParams.forEach((item) => {
        if (businessId === item.businessId) {
          switch (editableData[key].calculationMode) {
            case "CALCULATED_BUILD_AREA_PRICE":
              editableData[key].projectMoney =
                item.builtUpArea * editableData[key].unitPrice;
              break;
            case "CALCULATED_PRICE":
              editableData[key].projectMoney = editableData[key].unitPrice;
              break;
            case "CALCULATED_REAL_AREA_PRICE":
              editableData[key].projectMoney =
                item.practicalArea * editableData[key].unitPrice;
              break;
            default:
              break;
          }
          item.leaseCostProjectModifyParams.forEach((l) => {
            if (key === l.businessId_chargeProjectId) {
              Object.assign(l, editableData[key]);
            }
          });
        }
      });

      const data = {
        webCreateParams: [
          {
            businessId: businessId,
            leaseStartTime: timeFormat(formState.form.leaseStartTime, false),
            leaseEndTime: timeFormat(formState.form.leaseEndTime, false),
            projectWebCreateParams:
              formState.form.leaseTargetModifyParams.filter(
                (item) => businessId === item.businessId
              )[0].leaseCostProjectModifyParams,
          },
        ],
      };
      proxy.$api.postContractLeaseCostDetail( data).then((res) => {
        formState.form.leaseTargetModifyParams.forEach((item) => {
          if (businessId === item.businessId) {
            item.totalMoney = Number(res[0].money).toFixed(2);
          }
        });
        delete editableData[key];
      });
    };
    const cancel = (key) => {
      delete editableData[key];
    };

    const resetForm = () => {
      formRef.value.resetFields();
    };

    const showBusiness = () => {
      businessVisible.value = true;
    };

    const closeBusiness = (data) => {
      if (data) {
        formState.form.merchantId = data.id;
        formState.form.merchantName = data.name;
        formState.form.merchantLiaison = data.liaison;
        formState.form.merchantPhone = data.phone;
        formState.form.merchantAddress = data.address
          ? data.address
          : "默认地址";
      }

      businessVisible.value = false;
      formRef.value.validateFields(["merchantId"]);
    };
    const showGear = () => {
      gearVisible.value = true;
    };
    const closeGear = (data) => {
      if (data) {
        formState.form.leaseTargetModifyParams = [];

        data.forEach((item) => {
          let leaseCostProjectModifyParams = [];
          let projectMoney = 0;
          let totalMoney = 0;
          item.stallCosts.forEach((s) => {
            switch (s.calculationMode) {
              case "CALCULATED_BUILD_AREA_PRICE":
                projectMoney = item.builtUpArea * s.unitPrice;
                break;
              case "CALCULATED_PRICE":
                projectMoney = s.unitPrice;
                break;
              case "CALCULATED_REAL_AREA_PRICE":
                projectMoney = item.practicalArea * s.unitPrice;
                break;
              default:
                break;
            }
            totalMoney += projectMoney;
            leaseCostProjectModifyParams.push({
              ...s,
              businessId_chargeProjectId: item.id + s.id,
              projectMoney: projectMoney,
            });
          });
          const obj = {
            businessType: item.type,
            businessId: item.id,
            businessName: item.name,
            businessCode: item.code,
            location: item.location,
            areaName: item.areaName,
            practicalArea: item.practicalArea,
            builtUpArea: item.builtUpArea,
            totalMoney: totalMoney,
            leaseBusinessJson: JSON.stringify(item),
            leaseCostProjectModifyParams: leaseCostProjectModifyParams,
          };
          formState.form.leaseTargetModifyParams.push(obj);
        });
      }

      gearVisible.value = false;
      formRef.value.validateFields(["leaseTargetModifyParams"]);
      //动态计算费用
      const webCreateParams = formState.form.leaseTargetModifyParams.map(
        (item) => {
          return {
            businessId: item.businessId,
            leaseStartTime: timeFormat(formState.form.leaseStartTime, false),
            leaseEndTime: timeFormat(formState.form.leaseEndTime, false),
            projectWebCreateParams: item.leaseCostProjectModifyParams,
          };
        }
      );
      const data2 = {
        webCreateParams: webCreateParams,
      };
      proxy.$api.postContractLeaseCostDetail( data2).then((res) => {
        formState.form.leaseTargetModifyParams.forEach((item) => {
          res.forEach((r) => {
            if (r.businessId === item.businessId) {
              item.totalMoney = Number(r.money).toFixed(2);
            }
          });
        });
      });
    };
    const showPaymentItems = (id) => {
      formState.paymentItems_businessId = id;
      paymentItemsVisible.value = true;
    };
    const closePaymentItems = (data) => {
      if (data) {
        const arr = data.map((item) => {
          return {
            chargeProjectName: item.name,
            businessId_chargeProjectId:
              formState.paymentItems_businessId + item.id,
            chargeProjectId: item.id,
            calculationMode: "CALCULATED_PRICE",
            unitPrice: 0,
            projectMoney: 0,
            billingCycle: "MONTH",
          };
        });
        formState.form.leaseTargetModifyParams.forEach((item) => {
          if (item.businessId === formState.paymentItems_businessId) {
            item.leaseCostProjectModifyParams = arr;
            item.leaseCostProjectModifyParams.forEach((l) => {
              editableData[l.businessId_chargeProjectId] = cloneDeep(l);
            });
          }
        });
        // formRef.value.validateFields();
      }
      paymentItemsVisible.value = false;
    };
    const returnData = () => {
      if (route.query.type === "supplementary") {
        const data2 = {
          contractSupplementaryParam: {
            name: "",
            signType: "SIGNATURE_NEW",
            type: "CONTRACT_LEASE",
            contractTypeId: formState.form.contractTypeId,
            contractTypeName: formState.form.contractTypeName,
            code: formState.form.code,
            contractTmpId: formState.form.contractTmpId,
            contractTmpName: formState.form.contractTmpName,
            signTime: formState.form.signTime
              ? timeFormat(formState.form.signTime, false)
              : null,
            paperCode: formState.form.paperCode,
            status: formState.form.status,
            stopReason: formState.form.stopReason,
            fileIds: formState.form.fileIds,
            source: "CREATE_MANUAL",
            signConcludeType: "OFFLINE",
            signInfoModifyParam: {
              partyId: formState.form.partyId,
              partyName: formState.form.partyName,
              partyLiaison: formState.form.partyLiaison,
              partyPhone: formState.form.partyPhone,
              partyAddress: formState.form.partyAddress,
              partySignatoryId: formState.form.partySignatoryId,
              partySignatoryName: formState.form.partySignatoryName,
              merchantId: formState.form.merchantId,
              merchantName: formState.form.merchantName,
              merchantLiaison: formState.form.merchantLiaison,
              merchantPhone: formState.form.merchantPhone,
              merchantAddress: formState.form.merchantAddress,
              merchantSignatoryName: formState.form.merchantSignatoryName,
            },
          },
          contractLeaseModifyParam: {
            businessType: formState.form.businessType,
            leaseModeId: formState.form.leaseModeId,
            leaseModeName: formState.form.leaseModeName,
            leaseDurationUnit: formState.form.leaseDurationUnit,
            leaseDuration: formState.form.leaseDuration,
            leaseStartTime: timeFormat(formState.form.leaseStartTime, false),
            leaseEndTime: formState.form.leaseEndTime,
          },
          leaseTargetModifyParams: formState.form.leaseTargetModifyParams,
        };
        return data2;
      } else {
        const data = {
          contractCreateParam: {
            name: "",
            signType:
              route.query.type === "renewal"
                ? "SIGNATURE_RENEWAL"
                : "SIGNATURE_NEW",
            type: "CONTRACT_LEASE",
            contractTypeId: formState.form.contractTypeId,
            contractTypeName: formState.form.contractTypeName,
            contractTmpId: formState.form.contractTmpId,
            contractTmpName: formState.form.contractTmpName,
            code: formState.form.code,
            source: "CREATE_MANUAL",
            signConcludeType: "OFFLINE",
            signInfoModifyParam: {
              partyId: formState.form.partyId,
              partyName: formState.form.partyName,
              partyLiaison: formState.form.partyLiaison,
              partyPhone: formState.form.partyPhone,
              partyAddress: formState.form.partyAddress,
              partySignatoryId: formState.form.partySignatoryId,
              partySignatoryName: formState.form.partySignatoryName,
              merchantId: formState.form.merchantId,
              merchantName: formState.form.merchantName,
              merchantLiaison: formState.form.merchantLiaison,
              merchantPhone: formState.form.merchantPhone,
              merchantAddress: formState.form.merchantAddress,
              merchantSignatoryName: formState.form.merchantSignatoryName,
            },
          },
          contractLeaseModifyParam: {
            businessType: formState.form.businessType,
            leaseModeId: formState.form.leaseModeId,
            leaseModeName: formState.form.leaseModeName,
            leaseDurationUnit: formState.form.leaseDurationUnit,
            leaseDuration: formState.form.leaseDuration,
            leaseStartTime: timeFormat(formState.form.leaseStartTime, false),
            leaseEndTime: formState.form.leaseEndTime,
          },
          leaseTargetModifyParams: formState.form.leaseTargetModifyParams,
        };
        return data;
      }
    };
    const getData = () => {
      /*获取数据详情*/
      if (route.query.id) {
        let id = route.query.id;
        if (props.byContractId && !props.contractId) {
          return;
        } else if (props.contractId) {
          id = props.contractId;
        }
        proxy.$api.getcontractLease( id).then((res) => {
          if (res) {
            getSignatorySource(res.contractVO.contractSignInfoVO.partyId);

            if (
              res.contractVO.status !== "STATUS_DRAFT" &&
              route.query.type !== "renewal"
            ) {
              formState.disabled = true;
            }

            const str = JSON.stringify(res.contractLeaseTargetVOS).replace(
              /contractLeaseCostProjectVOS/g,
              "leaseCostProjectModifyParams"
            );
            const contractLeaseTargetVOS = JSON.parse(str).map((item) => {
              const leaseCostProjectModifyParams =
                item.leaseCostProjectModifyParams.map((c) => {
                  return {
                    ...c,
                    businessId_chargeProjectId: item.businessId + c.id,
                  };
                });
              const leaseBusinessJson = item.leaseBusinessJson
                ? JSON.parse(item.leaseBusinessJson)
                : null;
              return {
                ...item,
                leaseCostProjectModifyParams: leaseCostProjectModifyParams,
                location: leaseBusinessJson ? leaseBusinessJson.location : null,
                areaName: leaseBusinessJson ? leaseBusinessJson.areaName : null,
                builtUpArea: leaseBusinessJson
                  ? leaseBusinessJson.builtUpArea
                  : null,
                practicalArea: leaseBusinessJson
                  ? leaseBusinessJson.practicalArea
                  : null,
              };
            });
            const fileIds = [];
            fileList.value = [];
            if (res.contractVO.fileVOS) {
              res.contractVO.fileVOS.forEach((item) => {
                fileIds.push(item.id);
                fileList.value.push({
                  uid: item.id,
                  name: item.name,
                  status: "done",
                  url: item.path,
                  response: {
                    data: item,
                  },
                });
              });
            }
            formState.form = {
              fileIds: fileIds,
              code: res.contractVO.code,
              oldCode: res.contractVO.oldCode,
              stopReason: res.contractVO.stopReason
                ? res.contractVO.stopReason
                : "无",
              stopTime: res.contractVO.stopTime
                ? timeFormat(res.contractVO.stopTime, false)
                : null,
              signTime: res.contractVO.signTime
                ? timeFormat(res.contractVO.signTime, false)
                : null,
              createTime: res.contractVO.createTime
                ? timeFormat(res.contractVO.createTime, false)
                : null,
              obsoleteTime: res.contractVO.obsoleteTime
                ? timeFormat(res.contractVO.obsoleteTime, false)
                : null,
              obsoleteReason: res.contractVO.obsoleteReason,
              status: res.contractVO.status,
              signType: res.contractVO.signType,
              paperCode: res.contractVO.paperCode,
              approvalNo: res.contractVO.approvalNo,
              source: res.contractVO.source,
              contractTypeId: res.contractVO.contractTypeId,
              contractTypeName: res.contractVO.contractTypeName,
              contractTmpId: res.contractVO.contractTmpId,
              contractTmpName: res.contractVO.contractTmpName,
              partyId: res.contractVO.contractSignInfoVO.partyId,
              partyName: res.contractVO.contractSignInfoVO.partyName,
              partyLiaison: res.contractVO.contractSignInfoVO.partyLiaison,
              partyPhone: res.contractVO.contractSignInfoVO.partyPhone,
              partyAddress: res.contractVO.contractSignInfoVO.partyAddress,
              partySignatoryId:
                res.contractVO.contractSignInfoVO.partySignatoryId,
              partySignatoryName:
                res.contractVO.contractSignInfoVO.partySignatoryName,
              merchantId: res.contractVO.contractSignInfoVO.merchantId,
              merchantName: res.contractVO.contractSignInfoVO.merchantName,
              merchantPhone: res.contractVO.contractSignInfoVO.merchantPhone,
              merchantAddress:
                res.contractVO.contractSignInfoVO.merchantAddress,
              merchantLiaison:
                res.contractVO.contractSignInfoVO.merchantLiaison,
              merchantSignatoryName:
                res.contractVO.contractSignInfoVO.merchantSignatoryName,
              businessType: res.contractLeaseVO.businessType,
              leaseModeId: res.contractLeaseVO.leaseModeId,
              leaseModeName: res.contractLeaseVO.leaseModeName,
              leaseDurationUnit: res.contractLeaseVO.leaseDurationUnit,
              leaseDuration: String(res.contractLeaseVO.leaseDuration),
              leaseStartTime: timeFormat(
                res.contractLeaseVO.leaseStartTime,
                false
              ),
              leaseEndTime: timeFormat(res.contractLeaseVO.leaseEndTime, false),
              leaseTargetModifyParams: contractLeaseTargetVOS,
            };
            getLeaseMode();
          }
        });
      }
    };
    watch(
      () => props.contractId,
      () => {
        getData();
      }
    );
    onMounted(() => {
      getData();
      if (route.query.type !== "detail") {
        getPartyA();
        getTemplate();
        getType();
      }
    });
    return {
      route,
      router,
      formRef,
      labelCol: {
        span: 5,
      },
      wrapperCol: {
        span: 14,
      },
      ...toRefs(formState),
      rules,
      columns,
      editableData,
      businessVisible,
      gearVisible,
      paymentItemsVisible,
      totalFee,
      timeFormat,
      fileList,
      disabledStartDate,
      returnData,
      resetForm,
      deleteLeaseTarget,
      onDelete,
      editRecord,
      saveRecord,
      cancel,
      showBusiness,
      closeBusiness,
      showGear,
      closeGear,
      showPaymentItems,
      closePaymentItems,
      changePartyA,
      changeLeaseMode,
      changeContractType,
      changeContractTmp,
      changePartySignatory,
      changeLeaseStartTime,
      changeLeaseDuration,
      handleChange,
      GLOBAL_SCENE_CODE
    };
  },
});
</script>

<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");

.fee {
  margin-bottom: 20px;
  width: 100%;

  .fee-detail {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
}
</style>
