<template>
  <a-dropdown>
    <div class="flex" @click.prevent style="margin-right: 10px;">
      <a-avatar v-if="state.userInfo?.fileVO" :src="`${state.userInfo?.fileVO.path}`"
        :size="{ width: '30px', height: '30px' }">
        {{state.userInfo?.name ||state.userInfo?.username}}</a-avatar>
      <a-avatar v-else :size="{ width: '30px', height: '30px' }">{{state.userInfo?.name
        ||state.userInfo?.username}}</a-avatar>
      <div class="nickname">{{state.userInfo?.name || state.userInfo?.username}}</div>
      <CaretDownFilled style="margin-left: 2px;" v-if="state.userInfo?.name || state.userInfo?.username"/>
    </div>
    <template #overlay>
      <a-menu>
        <a-menu-item @click="personalManage"><a-button type="link" style="width: 100%;">个人管理</a-button></a-menu-item>
        <a-menu-item @click="visible = true;"
          v-if="(state.tenant && state.tenant.length > 1) || (state.outsideTenants?.length && state.outsideTenants.length > 1)">
          <a-button type="link" style="width: 100%;">组织切换</a-button>
        </a-menu-item>
        <a-menu-item @click="logout"><a-button danger type="link" style="width: 100%;">安全退出</a-button></a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
  <a-modal v-model:visible="visible" title="选择企业" centered width="1000" :footer="false">
    <div class="grid">
      <!-- 循环显示内部租户 -->
      <a-card v-for="item in state.tenant" :key="item.id" @click="checkEnterprise(item)"
        :class="{'tenant-selected': item.id === state.nowTenant?.id}">
        <a-card-meta class="pl1">
          <template #title>
            <span>{{item.name}}</span>
            <span :class="[item.enabled ? 'normalRow' : 'deleteRow']">{{item.enabled ? '已启用' : '已禁用'}}</span>
          </template>
        </a-card-meta>
      </a-card>

      <!-- 循环显示外部租户 -->
      <a-card v-for="item in state.outsideTenants" :key="item.id" @click="goOutsideTenant(item)"
        :class="{'tenant-selected': item.id === state.nowTenant?.id}">
        <a-card-meta class="pl1">
          <template #title>
            <span>{{item.name}}</span>
          </template>
          <template #description>
            <span class="normalRow">已启用</span> <!-- 这里假设所有外部租户都是已启用的 -->
          </template>
        </a-card-meta>
      </a-card>
    </div>
  </a-modal>
</template>
<script setup>
import { reactive, createVNode, ref, onMounted,watch } from 'vue';
import { personManageMenus } from "../../../../routes/person-manage-menus";
import { useRouter } from 'vue-router';
import { Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import * as api from '../../../../api'
import qs from "qs";
import _ from "lodash";
import { CaretDownFilled } from '@ant-design/icons-vue';
import { useChildApplication } from '@/hooks/use-child-application';
import { CubeMfRootGlobalState } from '@ghcloud/cube-mf-root';
import { useSystemTitleStore } from '@/hooks/use-system-title';

const visible = ref(false);
const state = reactive({
  userInfo: {
    name: '',
    username: '',
    fileVO: {
      path: '',
    },
  },
  confirming: false,
  tenant: [],
  outsideTenants: [],
  token: {},
  nowTenant: {},
  nowEnterpriseCode: ''
})
const router = useRouter();
const childApplication = useChildApplication()

const personalManage = () => {
  childApplication.toChildApplication({
    'id': personManageMenus.id,
    'code': personManageMenus.code,
    'name': personManageMenus.name,
    'menuVOS':personManageMenus.menu,
    'icon':personManageMenus.icon
  })
};

const systemTitleStore = useSystemTitleStore();

const logout = () => {
  state.confirming = true;
  Modal.confirm({
    title: "提示",
    content: "是否退出登录？",
    okText: "确定",
    cancelText: "取消",
    centered: true,
    icon: createVNode(ExclamationCircleOutlined),
    onOk: async () => {
      try {
        // 第一步:调用后端退出登录接口
        await api.loginOut();
      } catch (error) {
      } finally {
        systemTitleStore.handleLogin();
        sessionStorage.clear();
        window.location.href = '/login';
        state.confirming = false;
      }
    },
    onCancel: () => {
      state.confirming = false;
    },
  });
};
const cubeMfRootGlobalState = CubeMfRootGlobalState.getInstance();
const getData = async () => {  
  state.userInfo = cubeMfRootGlobalState.mfRootState.userInfo;
  state.nowEnterpriseCode = cubeMfRootGlobalState.mfRootState.authInfo.tenant
  const data = await api.tenant();
  if (data && data?.length) {
    state.tenant = data;
    state.nowTenant = data.find(
      (item) => item.code == (state.nowEnterpriseCode)
    );
  }
  await checkEnterprise(state.nowTenant)
  systemTitleStore.setLastTenantId(state.nowTenant?.code);
  state.outsideTenants = window.config.feature.outsideTenants ? window.config.feature.outsideTenants : []
  systemTitleStore.handleLogin();
};

const goOutsideTenant = (e) => {
  if (e.path) window.open(e.path)
}

const checkEnterprise = async (item) => {
  if (!item.enabled) {
    return;
  }

  if (state.nowTenant.code === item.code) {
    return
  }

  // 下级市场跳转
  if (item.webSiteUrl) {
    const url = `${item.webSiteUrl}?access_token=${cubeMfRootGlobalState.mfRootState.authInfo.token}&nowEnterprise=${JSON.stringify({code:cubeMfRootGlobalState.mfRootState.authInfo.tenant})}&refresh_token=${cubeMfRootGlobalState.mfRootState.refreshToken}`
    window.open(url);
    visible.value = false;
    return
  }

  // 切换市场刷新token
  state.nowTenant = item;
  sessionStorage.clear()
  systemTitleStore.setLastTenantId(item.code);
  await cubeMfRootGlobalState.refreshToken(item.code)
};

onMounted(async () => {
  getData();
});
</script>
<style lang="less">
.tenant-selected {
  border-color: var(--cube-theme-var--primary-color-hover) !important
}
.normalRow {
  color:var(--cube-theme-var--primary-color) !important
}
</style>
<style lang="less" scoped>
.flex {
  align-items: center;
  cursor: pointer;
}

.nickname {
  display: inline-block;
  padding-left: 10px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  text-align: right;
}

:deep(.ant-card) {
  padding: 10px;
  width: 250px;
  display: flex;
  cursor: pointer;
  border-radius: 12px;

  .ant-card-body {
    width: 100%;
    padding: 0;
    position: relative;

    .ant-card-meta {
      width: 100%;
      height: 100%;
      margin: 0 0;

      .ant-card-meta-title {
        display: flex;
        justify-content: space-between;
        font-size: 16px;
        font-family: @fontMedium;
      }

      .ant-card-meta-description {
        .setMainTenant {
          position: absolute;
          right: 0px;
          bottom: 0px;
        }

        span {
          width: 58px;
          height: 24px;
          text-align: center;
          border-radius: 4px;
          font-size: 14px;
          display: inline-block;
        }

        .normalRow {
          background-color: #e9fbf6;
          color:var(--cube-theme-var--primary-color) !important
        }

        .blueRow {
          background: #eef7ff;
        }

        .deleteRow {
          background-color: #fff3f2;
        }
      }
    }
  }
}
</style>