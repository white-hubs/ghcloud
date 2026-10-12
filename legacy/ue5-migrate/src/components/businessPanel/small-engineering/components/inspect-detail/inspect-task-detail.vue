<template>
  <div id="inspectDetail">
    <div class="alarmDetail-modal">
      <div class="alarmDetail-modal-header">
        <div class="header-title">
          <IconFont type="icon-offline" :style="{ fontSize: '24px', color: 'rgba(41, 137, 255, 1)' }" />
          <span>巡检任务详情</span>
        </div>
        <div style="display: flex;">
          <div class="header-close">
            <CloseOutlined @click="closeModal" />
          </div>
        </div>
      </div>
      <a-spin :spinning="loadingDataSource">
        <div class="alarmDetail-modal-content flex-column">
          <div class="conent-body" style="padding-bottom: 10px;overflow-y: auto;">
            <div class="alarmDetail-info">
              <div class="info-item">
                <div class="info-item-title">
                  <div class="title-icon"></div>
                  <div class="title-text">基本信息</div>
                </div>
                <div class="info-item-form">
                  <div class="form-item">
                    <div class="form-item-label">任务名称:</div>
                    <div class="form-item-content">{{ formState?.name || "--" }}</div>
                  </div>
                  <div class="form-item">
                    <div class="form-item-label">所属计划:</div>
                    <div class="form-item-content">{{ formState?.planName || "--" }}</div>
                  </div>
                  <div class="form-item">
                    <div class="form-item-label">发布人:</div>
                    <div class="form-item-content">{{ formState?.publisherName || "--" }}</div>
                  </div>
                  <div class="form-item">
                    <div class="form-item-label">巡查类型:</div>
                    <div class="form-item-content">{{ formState?.typeName || '--'}}</div>
                  </div>
                  <div class="form-item">
                    <div class="form-item-label">巡检级别:</div>
                    <div class="form-item-content">{{ formState.level === 'GENERAL' ? '紧急' : '普通 '}}</div>
                  </div>
                  <div class="form-item">
                    <div class="form-item-label">执行人:</div>
                    <div class="form-item-content">{{ formState?.receiveNames || "--" }}</div>
                  </div>
                  <div class="form-item">
                    <div class="form-item-label">发布时间:</div>
                    <div class="form-item-content">{{formState.updateTime?dayjs(formState.updateTime).format('YYYY-MM-DD HH:mm:ss') : "--" }}
                    </div>
                  </div>
                  <div class="form-item">
                    <div class="form-item-label">截止时间:</div>
                    <div class="form-item-content">{{formState.validEndTime?dayjs(formState.validEndTime).format('YYYY-MM-DD HH:mm:ss') : "--"
                      }}</div>
                  </div>
                  <div class="form-item">
                    <div class="form-item-label">任务状态:</div>
                    <div class="form-item-content">{{ taskStatus[formState?.status] || "--" }}</div>
                  </div>
                </div>
              </div>
              <div class="info-item">
                <div class="info-item-title">
                  <div class="title-icon"></div>
                  <div class="title-text">执行进度</div>
                </div>
                <div class="table_header">
                  <div v-for="item in table_header">{{ item }}</div>
                </div>
                <div class="table_content">
                  <div v-for="(item, index) in recordTaskResultList">
                    <div class="content">
                      <div>{{ item.targetName || '--' }}</div>
                      <div>{{ item.targetCategory || '--' }}</div>
                      <div>{{ item.status || '--' }}</div>
                      <div>{{ item.itemName || '--' }}</div>
                      <div>{{ item.result || '--' }}</div>
                      <div>{{ item.nickname || '--' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
</a-spin>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, watch, onUnmounted, ref } from "vue";
import { CloseOutlined } from "@ant-design/icons-vue";
import { inspectTaskDetail, inspectTaskDetailRate } from "@/api/maintain";
import dayjs from "dayjs";

const emit = defineEmits(["close"]);

interface Props {
  title?: string;
  parameter: Record<string, any>;
}
const props = defineProps<Props>();
const datainfo = reactive<Record<string, any>>({
  id: props.parameter.id,
  marketTenant: props.parameter.marketTenant,
  marketName: props.parameter.marketName || props.parameter.name,
  authInfo: null
});
const loadingDataSource = ref(false)
const table_header = [
  "巡检对象名称",
  "巡检对象类",
  "状态",
  "巡检项",
  "巡检结果",
  "执行人",
];
const formState = ref({
  name:'',
  planName:'',
  publisherName:'',
  typeName:'',
  level:'',
  receiveNames:'',
  updateTime:'',
  validEndTime:'',
  status:'',
})
const recordTaskResultList = ref([])
const taskStatus = {
  SPLIT: '待拆解',
  ACCEPT: '待接收',
  EXECUTING: '进行中',
  OVER: '已完成',
  EXPIRE: '已过期',
  STOP: '已终止',
  CONFIRM: '待确认',
  OVERTIME: '超时完成'
}
const resultType = {
  ABNORMAL:'异常',
  NORMAL:'正常',
}
const targetCategoryType = {
  DEVICE: '设备',
  STALL: '档位',
  PROPERTY: ' 资产',
  SITE_POINT: '现场点',
  RISK_SOURCE: '风险源',
  SMALL_ENGINEERING: '小散工程',
}
watch(
  () => props.parameter,
  async () => {
    datainfo.marketTenant = props.parameter.marketTenant;
    datainfo.id = props.parameter.id;
    datainfo.businessType = props.parameter.businessType;
    Object.assign(datainfo, props.parameter);
  },
  { deep: true, immediate: true }
);
const closeModal = () => {
  emit("close")
};
const getData = async () => {
  const params = {
    id:props.parameter.id,
    businessType: props.parameter.businessType
  }
  loadingDataSource.value = true
  formState.value = await inspectTaskDetail(params)
  const res = await inspectTaskDetailRate(params)
  recordTaskResultList.value = res.recordTaskResultList.map(item => {
      return {
        ...item,
        status: taskStatus[item.status],
        result:resultType[item.result]||'--',
        targetCategory:targetCategoryType[item.targetCategory]||'--'  
      }
    }
  )
  loadingDataSource.value = false

};
onMounted(() => {
  const el = document.getElementById('inspectDetail')
  document.body.appendChild(el)
  getData();
});
</script>

<style lang="less" scoped>
.videInfo {
  width: 1439px !important;
  padding: 0 10px !important;
  overflow-y: hidden !important;
}

.alarmDetail-wrap {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 9009;
}

.alarmDetail-modal {
  width: 800px;
  height: 760px;
  position: fixed;
  z-index: 1011;
  top: .52083rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(11, 21, 33, 0.9);
  border: 1px solid rgba(41, 137, 255, 1);

  &.full {
    width: 100%;
    height: 100%;
  }

  .alarmDetail-modal-header {
    height: 50px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);

    .header-title {
      display: flex;
      align-items: center;
      justify-content: flex-start;

      >span {
        font-size: 16px;
        font-family: PingFang SC-Medium;
        font-weight: 500;
        color: #ffffff;
        margin-left: 4px;
      }
    }

    .header-close {
      width: 30px;
      height: 30px;
      background: #101010;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      span {
        font-size: 12px;
      }
    }

    .header-back {
      margin-right: 10px;
    }
  }

  .alarmDetail-modal-content {
    height: 650px;
    width: 100%;
    padding: 0 16px;
    overflow: hidden;

    .content-tabs {
      height: 55px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-size: 14px;
      font-family: PingFang SC-Regular;
      font-weight: 400;
      color: #ffffff;

      >div {
        width: 84px;
        height: 26px;
        opacity: 1;
        border: 1px solid rgba(183, 197, 211, 0.3);
        margin-right: 12px;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0px 0px 2px 0px rgba(56, 142, 243, 0.45);
        cursor: pointer;

        >span {
          display: inline-block;
          color: white;
          width: 12px;
          height: 12px;
          border-radius: 2px;
          margin-left: 2px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        &.active {
          background: #2989ff;

          >span {
            color: rgba(4, 14, 38, 0.96);
            background: white;
          }
        }
      }
    }

    .conent-body {
      // height: calc(100% - 55px);
      flex: 1;
      overflow: hidden;
      overflow-y: scroll;
    }
  }

  .vidiconcontent {
    height: 670px;
  }
}

.vidicon {
  height: 725px;
}

.bottom-btn {
  position: absolute;
  bottom: 10px;
  left: 380px;
  display: flex;
  z-index: 10;

  &.stow {
    left: 25px;
    transition: all 1s ease-in;
  }

  &.open {
    left: 380px;
    transition: all 1s ease-in;
  }

  .btn-box {
    height: 56px;
    display: flex;
    background: linear-gradient(180deg, #134297 0%, #12316a 100%);
    margin-right: 16px;
    border-radius: 6px 6px 6px 6px;

    .line {
      width: 2px;
      height: 34px;
      background: linear-gradient(90deg, #09204a 50%, #13387f 100%);
      margin-top: 11px;
    }

    .btn-item {
      width: 60px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      &.active {
        p {
          color: #2bac7e;
        }
      }

      p {
        margin: 0;
        color: #bcd2ed;
        font-size: 12px;
      }
    }
  }
}

.not-data {
  text-align: center;
  margin-top: 16px;
}

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
        color: rgba(226, 226, 226, 0.5);
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
            width: calc(100% - 50px);
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

.table_header {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  display: flex;
  color: #fff;
  line-height: 48px;

  div {
    flex: 1;
    padding: 0 15px;
    text-align: center;
  }
}
.table_content {
  color: #fff;

  .no-content {
    display: flex;
    justify-content: center;

    :deep(.content) {
      margin-top: 5%;
    }
  }

  .content {
    display: flex;

    div {
      width: 20%;
      line-height: 48px;
      height: 48px;
      border-bottom: 1px solid rgba(105, 116, 140, 0.5);
      text-align: center;
      white-space: nowrap;
      color: rgba(217, 231, 255, 1);
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
