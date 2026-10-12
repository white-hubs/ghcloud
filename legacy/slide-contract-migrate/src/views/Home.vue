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
        name: "合同费用",
        path: "",
        children: [
          { name: "合同列表", path: "/contractList" },
          { name: "缴费单", path: "/paymentList" },
          { name: "退费单", path: "/refundList" },
        ],
      },
      {
        name: "合同设置",
        path: "",
        children: [
          { name: "合同模板", path: "/contractTemplate" },
          { name: "甲方信息", path: "/partyA" },
          { name: "合同类型", path: "/contractType" },
        ],
      },
      {
        name: "合同统计",
        path: "",
        children: [
          { name: "合同到期", path: "/contractExpire" },
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
          `/portal/contract/login`
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
