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
<script lang="jsx">
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
        name: "车辆管理",
        path: "",
        children: [
          { name: "车辆列表", path: "/parkVehList" },
          { name: "黑名单管理", path: "/blacklist" },
          { name: "白名单管理", path: "/whiteList" },
        ],
      },
      {
        name: "车场管理",
        path: "",
        children: [
          { name: "实时监控", path: "/parkingMonitor" },
          { name: "车道管理", path: "/vehicleLane" },
        ],
      },
      {
        name: "收费管理",
        path: "",
        children: [
          { name: "收费规则", path: "/chargeRule" },
        ],
      },
      {
        name: "基础信息",
        path: "",
        children: [
          { name: "车卡管理", path: "/vehicleCard" },
          { name: "播报信息", path: "/broadcast" },
        ],
      },
      {
        name: "车场明细",
        path: "",
        children: [
          { name: "进出流水记录", path: "/turnover" },
          { name: "入场修正记录", path: "/enterCorrect" },
          { name: "入场补录记录", path: "/enterRepair" },
          { name: "收费对账", path: "/chargeReconcile" },
          { name: "对账记录", path: "/reconcileRecord" },
          { name: "缴费记录", path: "/payRecord" },
          { name: "手动开闸记录", path: "/manualOpenRecord" },
        ],
      },
      {
        name: "统计报表",
        path: "",
        children: [
          { name: "收费统计", path: "/parkRechargeRecord" },
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
        history.pushState(
            { current: location.pathname + location.search }, '',
            `/portal/park/login`
          )
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
