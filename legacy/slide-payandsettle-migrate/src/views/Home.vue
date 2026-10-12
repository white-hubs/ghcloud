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
        name: "财务管理",
        path: "",
        children: [
          { name: "市场总账", path: "/marketAll" },
          { name: "市场账户", path: "/marketAccount" },
          { name: "商家账户", path: "/businessAccount" },
        ],
      },
      {
        name: "充值提现",
        path: "",
        children: [
          { name: "商家充值", path: "/recharge" },
          { name: "充值记录", path: "/rechargeRecord" },
          { name: "提现审批", path: "/approve" },
        ],
      },
      {
        name: "卡片管理",
        path: "",
        children: [
          { name: "会员卡", path: "/memberCard" },
          { name: "银行卡", path: "/bankCard" },
        ],
      },
      {
        name: "支付配置",
        path: "",
        children: [
          { name: "微信支付配置", path: "/wechatPay" },
          { name: "银行卡验证", path: "/bankcardPay" },
          { name: "钱包支付", path: "/walletPay" },
        ],
      },
      {
        name: "消息通知",
        path: "",
        children: [
          { name: "支付通知", path: "/msgNotice" },
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
