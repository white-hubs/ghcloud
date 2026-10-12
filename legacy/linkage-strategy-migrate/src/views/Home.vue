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
        name: "条件联动",
        path: "",
        id: 2,
        children: [
          {
            name: "条件联动",
            path: "/conditionalLinkageList",
            id: "2-1",
          },
          {
            name: "联动日志",
            path: "/conditionalLinkageRecord",
            id: "1-2",
          },
        ],
      },
      {
        name: "场景联动",
        path: "",
        id: 3,
        children: [
          {
            path: "/sceneLinkageList",
            name: "场景联动",
            id: "3-1",
          },
          {
            path: "/sceneLinkageRecord",
            name: "联动日志",
            id: "3-2",
          },
        ],
      },
      {
        name: "定时联动",
        path: "",
        id: 4,
        children: [
          {
            path: "/timeLinkageList",
            name: "定时联动",
            id: "4-1",
          },
          {
            path: "/timeLinkageRecord",
            name: "联动日志",
            id: "4-1",
          },
        ],
      },
      {
        name: "业务配置",
        path: "",
        id: 5,
        children: [
          {
            path: "/messageNotice",
            name: "消息配置",
            id: "5-1",
          },
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
