<template>
  <a-spin :spinning="loading">
    <div class="alarmDetail-info">
      <div class="info-item">
        <div class="info-item-title">
          <div class="title-icon"></div>
          <div class="title-text">基本信息</div>
        </div>
        <div class="info-item-form">
          <div class="form-item">
            <div class="form-item-label">巡检对象:</div>
            <div class="form-item-content">{{ formState?.targetName || "--" }}</div>
          </div>
          <div class="form-item">
            <div class="form-item-label">巡检任务:</div>
            <div class="form-item-content">{{ formState?.taskName || "临时巡检" }}</div>
          </div>
          <div class="form-item">
            <div class="form-item-label">巡检时间:</div>
            <div class="form-item-content">{{ formState?.timeText || '--'}}</div>
          </div>
          <div class="form-item">
            <div class="form-item-label">巡检结果:</div>
            <div class="form-item-content">
              <span :style="{color: formState?.result === 'ABNORMAL' ? '#FF3D3D':'#1EC138' }">{{ formState?.result ===
                "NORMAL" ? "正常" : formState?.result === "ABNORMAL" ? "异常" : "--" }}</span>
            </div>
          </div>
          <div class="form-item">
            <div class="form-item-label">巡检人:</div>
            <div class="form-item-content">{{ formState?.nickname || "--" }}</div>
          </div>
        </div>
      </div>
      <div class="info-item">
        <div class="info-item-title">
          <div class="title-icon"></div>
          <div class="title-text">巡检结果</div>
        </div>
        <!-- <noData v-if="!formState?.standardVOS.length" /> -->
        <result :dataSource="formState"></result>
      </div>
    </div>
  </a-spin>
</template>

<script>
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted,onUnmounted } from "vue";
import { getErrItemTagRecordDetail } from "@/api/snMarket";
import result from "./result.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import moment from "moment";
import { storeArea } from "@/piniaStore/area";
import { getMarketConfig } from "@/api/shennong/alarm";
import { message } from "ant-design-vue";
import axios from "axios";
import qs from 'qs'
const piniaStoreArea = storeArea();

export default defineComponent({
  props: {
    parameter: {
      type: Object,
      default: {},
    },
  },
  components: { result, noData },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      formState: {
        targetName: '',
        taskName: '',
        planName: '',
        nickname: '',
        time: '',
        status: '',
        result: '',
        assistNames: '',
        projectFiles: [],
        superviseUser: [],
        standardVOS: [],
      },
      loading: false,
      marketTenant: '',
    });
    const marketData = piniaStoreArea.marketDataCN ?? []
    const getMarketListData = async () => {
      const tenant = marketData.find(e => e.marketName === props.parameter.name)?.marketTenant
      state.marketTenant = props.parameter.marketTenant || tenant;
    };
    const getData = () => {
      try {
        state.loading = true;
        getErrItemTagRecordDetail({ id: props.parameter.id }).then((res) => {
          state.loading = false;
          state.formState = res
          state.formState.timeText = res?.time ? moment(res?.time).format("YYYY-MM-DD HH:mm:ss") : ''
        });
      } catch (error) {
        state.loading = false;
        proxy.$message.error(error.message || '请求失败，请稍后再试')
      } finally {
        state.loading = false;
      }
    };

    onMounted(() => {
      getMarketListData()
      getMarketDetail(state.marketTenant)
    });
    const getMarketToken = async (data) => {
      return new Promise((resolve, reject) => {
        const params = {
          grant_type: "client_credentials",
          client_id: data.account,
          client_secret: data.password,
        }
        axios.post(`${data?.url}/api/ouaa/oauth/token`, qs.stringify(params)).then(async (value) => {
          resolve(value.data)
        }).catch((error) => {
          resolve(null)
          message.destroy()
        })
      })
    }
    const getMarketDetail = async (marketTenant) => {
      message.destroy()
      getMarketConfig({ id: marketTenant }).then(async (data) => {
        const res = await getMarketToken(data)
        sessionStorage.setItem("market-tenant", data?.marketTenant);
        sessionStorage.setItem("market-token", res.access_token);
        sessionStorage.setItem("market-baseUrl", data?.url);
        getData()
      }).catch((error) => {
        message.error("未获取到授权信息")
        sessionStorage.removeItem("market-token");
        sessionStorage.removeItem("market-baseUrl");
        sessionStorage.removeItem("market-tenant");
      })
    }
    onUnmounted(() => {
      sessionStorage.removeItem("market-token");
      sessionStorage.removeItem("market-baseUrl");
      sessionStorage.removeItem("market-tenant");
    });
    return {
      ...toRefs(state),
      getData,
    };
  },
});
</script>

<style lang="less" scoped>
.alarmDetail-info {
  font-size: 16px;

  .info-item {
    border-bottom: 1px #394254 dashed;
    padding-bottom: 4px;
    margin-bottom: 16px;

    &:last-child {
      border-bottom: none;
    }

    .info-item-title {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      margin-bottom: 16px;

      &:first-child {
        margin-top: 16px;
      }

      .title-text {
        font-size: 14px;
        font-family: PingFang SC-Medium;
        font-weight: 500;
        color: #ffffff;
      }

      .title-icon {
        width: 14px;
        height: 14px;
        background: rgba(41, 137, 255, 0.5);
        border-radius: 50%;
        position: relative;
        margin-right: 4px;

        &::before {
          content: "";
          position: absolute;
          width: 8px;
          height: 8px;
          background: #2989ff;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }

    .info-item-form {
      display: flex;
      flex-wrap: wrap;

      .form-item {
        display: flex;
        width: 33.33%;
        line-height: 14px;
        color: #fff;
        font-size: 14px;
        margin-bottom: 12px;
        padding-left: 18px;

        .ellipsis {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        >div {
          display: inline-block;

          &.form-item-label {
            width: 90px;
            height: 20px;
            text-align: left;
            vertical-align: top;
            margin-right: 5px;
            white-space: nowrap;
          }

          &.form-item-content {
            width: calc(100% - 70px);
            color: rgba(226, 226, 226, 1);
          }
        }
      }

      .form-imgs {
        display: flex;
      }

      .form-image {
        width: 60px;
        height: 60px;
        background: wheat;
        margin-right: 8px;
        display: inline-block;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}
</style>