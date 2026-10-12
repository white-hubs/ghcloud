<template>
  <a-menu
    style="width: 256px"
    v-model:openKeys="openKeys"
    v-model:selectedKeys="selectedKeys"
    mode="inline"
  >
    <SidebarItem
      v-for="route in defaultMenus"
      :key="route.path"
      :item="route"
      :base-path="route.path"
    />
  </a-menu>
</template>
<script>
import SidebarItem from "./SidebarItem.vue";
import { defineComponent, ref, watch, onMounted } from "vue";
import {
  MailOutlined,
  QqOutlined,
  AppstoreOutlined,
  SettingOutlined,
} from "@ant-design/icons-vue";
import { getToken } from "@/utils/auth";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const router = useRouter();
    const defaultMenus = [
      {
        name: "数据看板",
        path: "",
        children: [
          { name: "看板详情", path: "/dataPanel" },
        ],
      },
      {
        name: "来货报备",
        path: "",
        children: [
          { name: "数据审核", path: "/dataAudit" },
          { name: "数据查询", path: "/dataSearch" },
        ],
      },
      {
        name: "登记检疫票",
        path: "",
        children: [
          { name: "检疫票登记", path: "/quarantineOrder" },
          { name: "检疫票查询", path: "/quarantineSearch" },
        ],
      },
      {
        name: "食安抽检",
        path: "",
        children: [
          { name: "抽检结果上报", path: "/testResultReport" },
          { name: "抽检结果查询", path: "/testResultSearch" },
        ],
      },
      {
        name: "理货数据",
        path: "",
        children: [
          { name: "理货数据审核", path: "/tallyDataAudit" },
          { name: "理货数据查询", path: "/tallyDataSearch" },
        ],
      },
      {
        name: "食安溯源",
        path: "/goodsTraceability",
      },
      {
        name: "商品跟进",
        path: "",
        children: [
          { name: "商品跟进", path: "/productFollowUp" },
        ],
      },
      {
        name: "数据报表",
        path: "",
        children: [
          { name: "屠宰场报表", path: "/slaughterhouseReport" },
          { name: "销售统计", path: "/salesStatistics" },
        ],
      },
      {
        name: "订单管理",
        path: "/orderManage",
      },
      {
        name: "结算管理",
        path: "",
        children: [
          { name: "结算账单", path: "/settlementBill" },
          { name: "分佣规则", path: "/settlementConfig" },
        ],
      },
      {
        name: "基础设置",
        path: "",
        children: [
          { name: "看板可见性", path: "/panelVisibility" },
          { name: "白条重量设置", path: "/whiteNoteWeight" },
          { name: "屠宰场", path: "/slaughterhouse" },
          { name: "抽检员", path: "/inspectorManage" },
          { name: "抽检比例", path: "/inspectorProportion" },
          { name: "重量损耗", path: "/weightLoss" },
          { name: "最低价格设置", path: "/salePrice" },
        ],
      },
      {
        name: "消息通知",
        path: "",
        children: [
          { name: "报备审核通知", path: "/reportAuditMsg" },
          { name: "理货审核通知", path: "/tallyAuditMsg" },
          { name: "订单通知", path: "/orderMsg" },
          { name: "密码通知", path: "/passwordEditMsg" },
        ],
      },
    ];
    const selectedKeys = ref([]);
    const openKeys = ref([]);

    const handleClick = (e) => {
    };

    const titleClick = (e) => {
    };
    onMounted(() => {
      const token = getToken();
      if (!token || !token.access_token) {
        router.push({ path: "/login" });
      }
    });
    watch(
      () => openKeys,
      (val) => {
      }
    );
    return {
      selectedKeys,
      openKeys,
      handleClick,
      titleClick,
      defaultMenus,
    };
  },

  components: {
    MailOutlined,
    QqOutlined,
    AppstoreOutlined,
    SettingOutlined,
    SidebarItem,
  },
});
</script>
