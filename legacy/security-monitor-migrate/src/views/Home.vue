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
import { defineComponent, ref, watch, onMounted ,getCurrentInstance} from "vue";
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
        name: "数据总览",
        path: "/overView",
      },
      {
        name: "多路视频",
        path: "/multipleVideo",
      },
      {
        name:"巡逻线路",
        path:"/patrolLine"
      },
      {
        name:"巡逻记录",
        path:"/patrolRecord"
      },
      {
        name:"报警记录",
        path:"/alarmPage"
      },
      {
        name:"报警配置",
        path:"/alarmRulesList"
      },
      {
        name:"报警统计",
        path:"/alarmStatistics"
      },
      {
        name:"报警处理统计",
        path:"/alarmHandelStatistics"
      },
      {
        name:"巡逻路线统计",
        path:"/patrolStatistics"
      },
      {
        name:"安全分析",
        path:"/safetyAnalysis"
      },
      {
        name:"监控设备",
        path:"/applicationEquipment"
      }
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
