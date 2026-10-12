<template>
  <div class="detail-form">
    <a-form ref="formRef" :model="form" :rules="rules" layout="inline">
      <template v-if="form.code">
        <div class="item-title">单据信息</div>
        <a-form-item label="单据编号" name="code">
          {{ form.code }}
        </a-form-item>
        <a-form-item label="单据状态" name="statusName">
          {{ form.statusName }}
        </a-form-item>
      </template>
      <div class="item-title">商家信息</div>
      <a-form-item label="商家名称" name="merchantId">
        <a-button
          type="link"
          @click="showBusiness"
          :disabled="disabled"
          v-if="!disabled"
          >选择</a-button
        >
        {{ form.merchantName }}
      </a-form-item>
      <!-- <a-form-item label="联系人姓名" name="label2"> </a-form-item> -->
      <a-form-item
        label="联系手机号"
        name="merchantPhone"
        v-if="form.merchantPhone"
        >{{ form.merchantPhone }}</a-form-item
      >
      <a-form-item
        label="主营品种"
        name="goodsCategoryNames"
        v-if="form.goodsCategoryNames.length > 0"
      >
        <a-tag v-for="item in form.goodsCategoryNames" :key="item">{{
          item
        }}</a-tag>
      </a-form-item>
      <a-form-item label="主要货源地" name="mainSourceGoodsAddaress">
        <span v-if="route.query.type === 'detail'">{{
          form.mainSourceGoodsAddaress
        }}</span>
        <a-input
          v-else
          v-model:value="form.mainSourceGoodsAddaress"
          placeholder="销售商品的主要来源地方"
          :disabled="disabled"
        />
      </a-form-item>
      <a-form-item label="日均交易量" name="averageDayCount">
        <span v-if="route.query.type === 'detail'"
          >{{ form.averageDayCount }} kg</span
        >
        <a-input
          v-else
          v-model:value="form.averageDayCount"
          placeholder="平均每天的交易数量"
          :disabled="disabled"
          suffix="kg"
        />
      </a-form-item>
      <a-form-item label="日均交易额" name="averageDayMoney">
        <span v-if="route.query.type === 'detail'"
          >{{ form.averageDayMoney }} 元</span
        >
        <a-input
          v-else
          v-model:value="form.averageDayMoney"
          placeholder="平均每天的销售金额"
          :disabled="disabled"
          suffix="元"
        />
      </a-form-item>
      <a-form-item label="自由品牌" name="ownBrand">
        <span v-if="route.query.type === 'detail'">{{ form.ownBrand }}</span>
        <a-input
          v-else
          v-model:value="form.ownBrand"
          placeholder="是否有自己的品牌,输入品牌名称"
          :disabled="disabled"
        />
      </a-form-item>
      <a-form-item label="自有基地" name="ownBase">
        <span v-if="route.query.type === 'detail'">{{ form.ownBase }}</span>
        <a-input
          v-else
          v-model:value="form.ownBase"
          placeholder="是否有自己的生产基地,输入基地名称"
          :disabled="disabled"
        />
      </a-form-item>

      <div class="item-title">租赁需求</div>
      <a-form-item label="需求数量" name="leaseCount">
        <span v-if="route.query.type === 'detail'">{{ form.leaseCount }}</span>
        <a-select
          v-else
          v-model:value="form.leaseCount"
          placeholder="选择档位需求数量"
          :disabled="disabled"
        >
          <a-select-option
            v-for="item in leaseCounts"
            :key="item"
            :value="item"
            >{{ item }}</a-select-option
          >
        </a-select>
      </a-form-item>
      <a-form-item label="租赁用途" name="leasePurpose">
        <span v-if="route.query.type === 'detail'">{{
          form.leasePurpose
        }}</span>
        <a-input
          v-else
          v-model:value="form.leasePurpose"
          placeholder="描述租赁档位后的用途"
          :disabled="disabled"
        />
      </a-form-item>
    </a-form>
    <businessModal
      :visible="businessVisible"
      activeId="iid"
      @close="closeBusiness"
    />
  </div>
</template>

<script lang='jsx'>
import {
  defineComponent,
  reactive,
  ref,
  toRaw,
  toRefs,
  watch,
  onMounted,
  getCurrentInstance,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import businessModal from "../../../components/business.vue";
import { isNum } from "@/utils/validator.js";
export default defineComponent({
  components: {
    businessModal,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const businessVisible = ref(false);
    const formRef = ref();
    const state = reactive({
      form: {
        leaseConfigId: "1433310505107218434",
        contractId: null,
        merchantId: null,
        merchantName: null,
        merchantPhone: null,
        merchantAddress: null,
        goodsCategoryIds: [],
        goodsCategoryNames: [],
        mainSourceGoodsAddaress: null,
        averageDayCount: null,
        averageDayMoney: null,
        ownBase: null,
        ownBrand: null,
        leaseCount: null,
        leasePurpose: null,
        code: null,
        status: null,
        statusName: null,
        progress: null,
      },
      rules: {
        merchantId: [
          {
            required: true,
            message: "请选择商家",
            trigger: "change",
          },
        ],
        leaseCount: [
          {
            required: true,
            message: "请选择档位需求数量",
            trigger: "change",
          },
        ],
        leasePurpose: [
          {
            required: true,
            message: "请输入租赁用途",
            trigger: "blur",
          },
        ],
        mainSourceGoodsAddaress: [
          {
            required: true,
            message: "请输入",
            trigger: "blur",
          },
        ],
        averageDayCount: [
          {
            required: true,
            trigger: "blur",
            validator: isNum,
          },
        ],
        averageDayMoney: [
          {
            required: true,
            trigger: "blur",
            validator: isNum,
          },
        ],
        ownBrand: [
          {
            required: true,
            message: "请输入",
            trigger: "blur",
          },
        ],
        ownBase: [
          {
            required: true,
            message: "请输入",
            trigger: "blur",
          },
        ],
      },
      leaseCounts: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      disabled: route.query.type === "detail" ? true : false,
    });

    const getData = () => {
      if (route.query.id) {
        proxy.$api.getStallLeaseId( route.query.id).then((res) => {
          state.form = Object.assign(res, {
            goodsCategoryNames: res.goodsCategoryName
              ? res.goodsCategoryName.split(",")
              : [],
            averageDayCount: String(res.averageDayCount),
            averageDayMoney: String(res.averageDayMoney),
            leaseCount: String(res.leaseCount),
            goodsCategoryIds: res.goodsCategoryId
              ? res.goodsCategoryId.split(",")
              : [],
            statusName: {
              STALL_LEASE_PROCESSING: "处理中",
              STALL_LEASE_FINISHED: "已完成",
              STALL_LEASE_VOIDED: "已作废",
              STALL_LEASE_PENDING: "待处理",
            }[res.status],
          });
        });
      }
    };
    onMounted(() => {
      getData();
    });
    const showBusiness = () => {
      businessVisible.value = true;
    };
    const closeBusiness = (data) => {
      if (data && data.id) {
        proxy.$api.merchantId(data,"get").then((res) => {
          state.form.merchantId = res.id;
          state.form.merchantName = res.name;
          state.form.merchantPhone = res.phone;
          state.form.merchantAddress = res.address;
          state.form.merchantLiaison = res.liaison;
          state.form.goodsCategoryIds = res.categoryIds;
          state.form.goodsCategoryNames = res.categoryName;
          // formRef.value.validateFields();
          businessVisible.value = false;
        });
      } else {
        // formRef.value.validateFields();
        businessVisible.value = false;
      }
    };
    return {
      formRef,
      ...toRefs(state),
      businessVisible,
      showBusiness,
      closeBusiness,
      route,
    };
  },
});
</script>

<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");

.detail-form .ant-form-item-control-input-content > span.ant-tag {
  width: auto !important;
}
</style>
