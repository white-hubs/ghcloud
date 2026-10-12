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
        name: "档位租赁",
        path: "",
        children: [
          { name: "租赁管理", path: "/gearLeaseManage" },
          { name: "发起租赁", path: "/gearLeaseLaunch" },
          { name: "处理租赁", path: "/gearLeasePending" },
        ],
      },
      {
        name: "档位退租",
        path: "",
        children: [
          { name: "退租管理", path: "/gearcheckOutManage" },
          { name: "发起退租", path: "/gearcheckOutLaunch" },
          { name: "处理退租", path: "/gearcheckOutPending" },
        ],
      },
      {
        name: "档位管理",
        path: "",
        children: [
          { name: "档位信息", path: "/gearInfo" },
          { name: "档位类型", path: "/gearType" },
        ],
      },
      {
        name: "档位设置",
        path: "",
        children: [
          { name: "档位信息", path: "/gearFee" },
          { name: "费用模板", path: "/gearFeeTemplate" },
          { name: "收费项目", path: "/gearFeeProject" },
          { name: "承租方式", path: "/gearLeaseMode" },
        ],
      },
      {
        name: "数据统计",
        path: "",
        children: [
          { name: "出租情况", path: "/gearLeaseMode" },
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
          `/portal/gear/login`
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
