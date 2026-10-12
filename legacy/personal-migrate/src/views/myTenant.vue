<template lang="pug">
div.dataTitle
  a-spin(:spinning="loading")
    div.dataDetails(v-if="tenant")
      a-card(v-for="item in tenant" :key="item")
        template(#cover)
          a-image(alt="example" :src="marketPng" width="78px" height="78px")
        a-card-meta.pl1
          template(#title)
            div {{item.name}}
            span(:class="[item.enabled? 'normalRow':'deleteRow']") {{item.enabled? '已启用':'已禁用'}}
          template(#description) 
            a.setMainTenant(v-if="!item.mainEnterprise" @click="setEnterprise(item)") 设为主企业
            span.normalRow.setMainTenant(v-else) 主企业
    a-empty(v-else description="当前暂无企业")
</template>
<script>
import {
  defineComponent,
  reactive,
  getCurrentInstance,
  toRefs,
  onMounted,
  ref,
  watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { timeFormat } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import { reject } from "lodash";
const marketPng = '/resource/v1/bimops-fe-web-migrate-lib/images/market.png'

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();

    const formState = reactive({
      data: {},
      tenant: [],
      loading: false,
      enabled: true,
    });

    const getData = (data) => {
      formState.loading = true;
      proxy.$api
        .tenant(data, "get")
        .then((res) => {
          formState.tenant = res;
        })
        .finally(() => {
          formState.loading = false;
        });
    };

    const setEnterprise = (item) => {
      proxy.$api.setEnterprise({ tenant: item.code }, "put").then(() => {
        getData();
      });
    };

    onMounted(async () => {
      getData();
    });

    return {
      labelCol: {
        span: 4,
      },
      wrapperCol: {
        span: 14,
      },
      ...toRefs(formState),
      timeFormat,
      setEnterprise,
      marketPng,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/dataDetails/index.less");
.dataTitle {
  height: calc(100% - 52px);
  background-color: transparent;
}
.dataDetails {
  grid-template-rows: repeat(auto-fill, 160px);
  grid-column-gap: 16px;
  background-color: transparent;
  padding: 0;
}
:deep(.ant-card) {
  padding: 15px;
  display: flex;
  border-radius: 12px;
  position: relative;
  .ant-card-cover {
    width: 78px;
    // height: 100%;
    img {
      width: 100%;
      height: 100%;
      border-radius: 8px;
    }
  }
  .ant-card-body {
    width: calc(100% - 78px);
    padding: 0;
    // position: relative;
    .ant-card-meta {
      width: 100%;
      // height: 100%;
      margin: 0 0;
      .ant-card-meta-title {
        // display: flex;
        // justify-content: space-between;
        font-size: 20px;
        font-family: @fontMedium;
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
        }
        .deleteRow {
          background-color: #fff3f2;
        }
      }
      .ant-card-meta-description {
        .setMainTenant {
          text-align: center;
          position: absolute;
          left: 20px;
          right: 20px;
          bottom: 15px;
          padding-top: 15px;
          border-top: 1px solid #f3f3f3;
        }
      }
    }
  }
}
</style>
