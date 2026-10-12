<template>
  <SubPanelTemplate title="院区介绍">
    <div class="hospitalInfo">
      <img v-if="tenantData.logo" :src="tenantData.logo.path" alt="" />
      <div class="hospitalInfo-text">
        <div class="hospitalInfo-title">{{ tenantData.name }}</div>
        <div class="scroll_box">
          <div class="scroll-text">
            {{ tenantData.remark }}
          </div>
        </div>
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";

import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";

import { TenantType } from "@/api/models/ouaa";
import { getTenantDetails } from "@/api/ouaa";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const tenantData = reactive<TenantType>({
  address: "",
  areaCovered: 0,
  building: 0,
  code: "",
  files: [],
  id: "",
  location: "",
  logo: {
    id: "",
    name: "",
    path: "",
    size: "",
    suffix: "",
  },
  name: "",
  remark: "",
});

const getTenantInfo = async () => {
  const tenantId = CubeMfRootGlobalState.getInstance().mfRootState.authInfo.tenant;
  const res = await getTenantDetails(tenantId);
  Object.assign(tenantData, res);
};

onMounted(() => {
  getTenantInfo();
});
</script>

<style scoped lang="less">
.hospitalInfo {
  padding: 10px;

  img {
    width: 336px;
    height: 128px;
  }

  .hospitalInfo-text {
    color: #fff;
    text-align: center;

    .hospitalInfo-title {
      margin: 5px 0;
      font-size: 14px;
    }

    .scroll_box {
      text-align: left;
      overflow: hidden;
      height: 100px;

      .scroll-text {
        animation: scroll 10s linear infinite;
        color: #d9e7ff;
        font-size: 12px;
      }
    }
  }
}

@keyframes scroll {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(-100%);
  }
}
</style>
