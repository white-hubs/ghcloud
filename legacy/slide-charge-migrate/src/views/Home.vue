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
<script lang='jsx'>
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
          { name: "看板详情", path: "/enterPanel" },
        ],
      },
      {
        name: "来货报备",
        path: "",
        children: [
          { name: "报备管理", path: "/approachReport" },
        ],
      },
      {
        name: "基础设置",
        path: "",
        children: [
          { name: "订单通知", path: "/enterMsgNotice" },
          { name: "车型配置", path: "/carTypeConfig" },
          { name: "规则分组", path: "/ruleGroup" },
          { name: "报备失效时间", path: "/invalidTime" },
          { name: "收费明细", path: "/feeDetail" },
        ],
      },
      {
        name: "进场明细",
        path: "",
        children: [
          { name: "收费记录", path: "/enterChargeRecord" },
          { name: "结账记录", path: "/enterCheckoutRecord" },
          { name: "收费对账", path: "/enterChargeReconcilie" },
          { name: "对账记录", path: "/enterReconRecord" },
          { name: "进场记录", path: "/enterEnterRecord" },
          { name: "金额修改记录", path: "/enterFeeEditRecord" },
          { name: "重量更改记录", path: "/enterWeightEditRecord" },
          { name: "手动开闸记录", path: "/enterManualOpenRecord" },
        ],
      },
      {
        name: "进场统计",
        path: "/approachStatistic",
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
          `/portal/charge/login`
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
