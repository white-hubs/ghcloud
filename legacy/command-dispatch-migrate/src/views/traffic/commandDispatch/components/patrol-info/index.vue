<template>
  <custom-modal v-model:visible="visible" :isMinimized="isMinimized" @changeIsMinimized="changeIsMinimized" title="任务详情"
    className="patrol-info-modal patrol-info" @close="closeModal">
    <div class="patrol-info-modal-content flex-column">
      <div class="content-body">
        <div class="info-item">
          <div class="info-item-title">
            <div class="title-icon"></div>
            <div class="title-text">基本信息</div>
          </div>
          <div class="info-item-form">
            <div class="form-item">
              <div class="form-item-label">任务名称:</div>
              <div class="form-item-content">{{ info?.taskName ?? "--" }}</div>
            </div>
            <div class="form-item">
              <div class="form-item-label">任务时间:</div>
              <div class="form-item-content">
                {{ info.startTime+ '-' + info.endTime }}
              </div>
            </div>
            <div class="form-item">
              <div class="form-item-label">巡更时间:</div>
              <div class="form-item-content">
                {{ info?.executeData ?? "--" }}
              </div>
            </div>
            <div class="form-item">
              <div class="form-item-label">状态:</div>
              <div class="form-item-content">
                {{ info?.statusName ?? "--" }}
              </div>
            </div>
          </div>
        </div>
        <div class="info-item">
          <div class="info-item-title">
            <div class="title-icon"></div>
            <div class="title-text">巡更详情</div>
          </div>
          <a-radio-group v-model:value="executePeriod" button-style="solid">
            <a-radio-button v-for="item in  info.executePeriod" :key="item" :value="item">{{ item
              }}</a-radio-button>
          </a-radio-group>
          <div class="patrol-point-table">
            <custom-table :loading="loading" :columns="columns" :dataSource="dataSource">
              <template #viewImage="slot">
                <a-button type="link" @click="handleClickShow(true,slot.row)" style="padding-left: 0;">查看图片</a-button>
              </template>
            </custom-table>
          </div>
        </div>
      </div>
    </div>
    <div class="info-bottom" v-if="!info.affirmState">
      <div @click.stop="handleConfirm">我已确认知晓</div>
    </div>
    <a-modal v-model:visible="showModal" wrapClassName="image-modal" title="查看图片" @ok="showModal=false">
      <div style="display: flex;align-items: center;gap: 10px;flex-wrap: wrap;max-height: 500px;overflow-y: auto;">
        <a-image-preview-group>
          <a-image :width="200" :src="item.path" v-for="item in previewImageList" :key="item.path" />
        </a-image-preview-group>
      </div>

    </a-modal>
  </custom-modal>
</template>

<script>
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted, watch } from "vue";
import {
  CloseOutlined,
} from "@ant-design/icons-vue";
import { Modal, ImagePreviewGroup } from 'ant-design-vue';
import customTable from '../custom-table/index.vue'
import moment from "moment";
import customModal from '../custom-modal/index.vue'

const PATROL_POINT_RES_ENUM = {
  ABNORMAL: '异常',
  NORMAL: '正常'
}
export default defineComponent({
  props: {
    visible: {
      Boolean,
      default: false
    },
    value: {
      type: String,
      default: ""
    },
    isMinimized: {
      Boolean,
      default: false
    },
    info: {
      type: Object,
      default: () => { }
    }
  },
  components: { CloseOutlined, customTable, customModal },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      pagination: {
        pageNumber: 1,
        pageSize: 10,
        total: 1
      },
      showModal: false,
      previewImageList: [],
      executePeriod: props.info.executePeriod[0],
      loading: false,
      columns: [
        {
          title: '序号',
          dataIndex: 'orderNum',
          key: 'orderNum'
        },
        {
          title: '巡更点',
          dataIndex: 'locationName',
          ellipsis: true,
          key: 'locationName'

        },
        {
          title: '所属区域',
          dataIndex: 'areaName',
          ellipsis: true,
          key: 'areaName'
        },
        {
          title: '巡更人员',
          dataIndex: 'userName',
          key: 'userName'
        },
        {
          title: '巡更时间',
          dataIndex: 'patrolTime',
          ellipsis: true,
          key: 'patrolTime'
        },
        {
          title: '巡更结果',
          dataIndex: 'resultStatusName',
          key: 'resultStatusName'
        },
        {
          title: '操作',
          dataIndex: 'viewImage',
          key: 'viewImage',
        },
      ],
      dataSource: []
    })
    onMounted(() => {
      getDataSource()
    })
    watch(() => state.executePeriod, () => {
      getDataSource()
    })
    const getDataSource = async () => {
      try {
        state.loading = true
        const params = {
          taskId: props.info.id,
          executePeriod: state.executePeriod
        }
        const result = await proxy.$api.getPatrolTaskByTime(params)
        state.dataSource = result.map(item => {
          return {
            ...item,
            areaName: item.arae.length ? item.arae.map(item => item.name).join('/') : "--",
            patrolTime: item.patrolDate ? moment(item.patrolDate).format('YYYY-MM-DD HH:mm:ss') : '--',
            resultStatusName: item.patrolResult ? PATROL_POINT_RES_ENUM[item.patrolResult] : '--',
          }
        })
      } catch (error) {
      } finally {
        state.loading = false
      }
    }
    const changePagination = (pageNumber, pageSize) => {
      state.pagination.pageNumber = pageNumber
    }
    const handleConfirm = () => {
      Modal.confirm({
        title: '提示',
        content: '是否确认已知晓当前巡更异常？',
        onOk: async () => {
          const params = {
            id: props.info.id,
          }
          await proxy.$api.confirmedAbnormalPatrolTask(params)
          proxy.$message.success('已确认')
          emit('close')
          emit('getList')
        },
        class: 'confirm-modal',
        onCancel() {
        },
      });
    }
    const handleClickShow = (val, row) => {
      if (!row.files) {
        proxy.$message.error('暂无图片')
        return
      }
      if (!row.files.length) {
        proxy.$message.error('暂无图片')
        return
      }
      state.previewImageList = row.files
      state.showModal = true
    }
    const closeModal = () => {
      emit('close')
    }
    const changeIsMinimized = (bol) => {
      emit('update:isMinimized', bol)
    }
    return {
      closeModal,
      changePagination,
      handleConfirm,
      handleClickShow,
      ...toRefs(state),
      changeIsMinimized
    }
  }
})
</script>
<style lang="less">
.confirm-modal,
.image-modal {
  .ant-modal-header {
    background: rgba(4, 14, 38, 0.96) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .ant-modal-title {
    color: #fff !important;
  }

  .ant-modal-content {
    background: rgba(4, 14, 38, 0.96) !important;

    .ant-modal-confirm-title,
    .ant-modal-confirm-content,
    .ant-modal-body {
      color: #fff !important;
    }

    .ant-modal-confirm-btns {
      .ant-btn-primary {
        background: #2989ff;
        border-color: #2989ff;
      }

    }


    .ant-modal-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }


  }
}

.ant-radio-group-solid .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
  background: #2989ff !important;
  border-color: #2989ff !important;
}


.pagination {
  padding: 23px 0;
  text-align: center;
  position: relative;
}



.patrol-info-modal {
  width: 900px;
  height: 650px;
  position: fixed;
  top: calc(50% - 325px);
  left: calc(50% - 450px);
  background: rgba(4, 14, 38, 0.96);
  border: 1px solid rgba(41, 137, 255, 1);

  .info-bottom {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;

    div {
      padding: 4px 12px;
      color: #fff;
      border-radius: 2px;
      background: #2989ff;
      cursor: pointer;
    }
  }

  .info-item {
    border-bottom: 1px #394254 dashed;
    padding-bottom: 4px;
    margin-bottom: 16px;

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .info-item-title {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      margin-bottom: 16px;

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

    .patrol-point-table {
      height: 290px;
      margin-top: 10px;
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

        >div {
          display: inline-block;

          &.form-item-label {
            width: 80px;
            height: 20px;
            text-align: right;
            vertical-align: top;
            margin-right: 5px;
          }

          &.form-item-content {
            width: calc(100% - 70px);
            color: rgba(226, 226, 226, 1);
          }
        }
      }

      .form-video {
        width: 200px;
        height: 110px;
        margin-right: 8px;
        margin-bottom: 8px;
        overflow: hidden;

        video {
          width: 100%;
          height: 100%;
        }

        img {
          width: 100%;
          height: 100%;
        }
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

  &.full {
    width: 100%;
    height: 100%;
  }

  .content-search {
    margin-bottom: 16px;

    :deep(.ant-input) {
      color: #ffffff;
      background-color: transparent;
      border-color: #2989ff;

      &:hover {
        border-color: #2989ff;
      }
    }

    .searchBtn {
      background: #2989ff;
      color: #ffffff;
      border-color: #2989ff;
    }
  }

  .patrol-info-modal-header {
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
      width: 24px;
      height: 24px;
      background: #101010;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  }

  .patrol-info-modal-content {
    height: 535px;
    width: 100%;
    padding: 16px 16px 0;

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

    .content-body {
      // height: calc(100% - 55px);
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      overflow-y: scroll;

      .content-table {
        flex: 1;
      }
    }
  }

  .vidiconcontent {
    height: 670px;
  }
}

.patrol-info {
  .ant-radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .ant-pagination {
    color: rgba(228, 228, 228, 1) !important;
  }

  .ant-pagination-item-active {
    background: transparent !important;
  }

  .ant-pagination-item {
    border-color: #d1d1d1;
    color: rgba(228, 228, 228, 1) !important;

    a {
      color: rgba(228, 228, 228, 1) !important;
    }
  }

  .ant-pagination.mini .ant-pagination-prev,
  .ant-pagination.mini .ant-pagination-next {
    color: rgba(228, 228, 228, 1) !important;
  }

  .ant-pagination-prev a,
  .ant-pagination-next a {
    color: rgba(228, 228, 228, 1) !important;
  }
}
</style>