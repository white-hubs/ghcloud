<template>
  <custom-modal
    v-model:visible="visible"
    :isMinimized="isMinimized"
    @changeIsMinimized="changeMinimized"
    className="trail-modal"
    title="历史轨迹"
    @close="closeModal"
  >
    <div class="trail-modal-content flex-column">
      <div class="user">
        <div class="avatar">
          <img v-if="stateInfo.file" :src="stateInfo.file.path" alt="" srcset="" />
          <img v-else src="/resource/v1/command-dispatch-migrate/commandDispatch/images/default-avatar.png" alt="" />
        </div>
        <div class="user-info">
          <div class="status-name">
            <span class="name">{{ stateInfo.name }}</span>
            <div class="status">在线</div>
          </div>
          <div class="number">电话号码: {{ stateInfo.mobile }}</div>
        </div>
      </div>
      <div class="search-trail-toolbar">
        <div class="item">
          <label>开始时间:</label>
          <a-date-picker
            v-model:value="searchParams.period.startTime"
            :disabled-date="disabledDate"
            value-format="YYYY-MM-DD"
            :getCalendarContainer="(triggerNode) => triggerNode.parentNode"
          />
          <div class="reset" @click="handleReset">重置</div>
        </div>
        <div class="item">
          <label>结束时间:</label>
          <a-date-picker
            v-model:value="searchParams.period.endTime"
            :disabled-date="disabledEndDate"
            value-format="YYYY-MM-DD"
            :getCalendarContainer="(triggerNode) => triggerNode.parentNode"
          />
          <div class="reset search" @click="handleSearch">查询</div>
        </div>
        <div class="item check-box">
          <label></label>
          <a-checkbox @change="handleCheckChange">在地图上显示</a-checkbox>
        </div>
      </div>
      <div class="trail-step" ref="trailStep">
        <div class="list-container">
          <template v-if="trailList.length > 0">
            <div class="step-item" v-for="(item, index) in trailList" :key="index">
              <div class="step-icon">
                <div class="dot-out" v-if="index !== 0">
                  <div class="dot-in"></div>
                </div>
                <div class="step-icon-image" v-else>
                  <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/dot-icon.png" alt="" srcset="" />
                </div>
                <div class="line" v-if="index !== trailList.length - 1"></div>
              </div>

              <div class="step-content">
                <div class="step-title">{{ item.timeFormat }}</div>
                <div class="step-desc">{{ item.address }}</div>
              </div>
            </div>
          </template>
          <div v-else class="empty">
            <a-empty></a-empty>
          </div>
          <div class="pagination" v-if="pagination.total > 0">
            <a-pagination
              v-model:current="pagination.pageNumber"
              v-model:pageSize="pagination.pageSize"
              size="small"
              :total="pagination.total"
              @change="changePagination"
            />
          </div>
        </div>
      </div>
    </div>
  </custom-modal>
</template>

<script>
import { CloseOutlined } from "@ant-design/icons-vue";
import moment from "moment";
import { defineComponent, reactive, toRefs, ref, getCurrentInstance, onMounted, watch } from "vue";

import { isInRadius } from "../../../../../utils/common";
import customModal from "../custom-modal/index.vue";
export default defineComponent({
  props: {
    stateInfo: {
      type: Object,
      default: {},
    },
    visible: {
      type: Boolean,
      default: () => false,
    },
    isMinimized: {
      type: Boolean,
      default: false,
    },
  },
  name: "historyTrailModal",
  components: { CloseOutlined, customModal },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const trailStep = ref();
    const state = reactive({
      trailList: [],
      searchParams: {
        period: {
          startTime: moment().add(-7, "d").format("YYYY-MM-DD"),
          endTime: moment().format("YYYY-MM-DD"),
        },
      },
      pagination: {
        pageNumber: 1,
        pageSize: 6,
        total: 1,
      },
    });

    onMounted(() => {
      getTrailList();
    });
    const disabledDate = (current) => {
      return current && current > moment().endOf("day");
    };
    const disabledEndDate = (current) => {
      if (state.searchParams.period.startTime) {
        return (
          current &&
          (current > moment(state.searchParams.period.startTime).add(7, "days").endOf("day") ||
            current < moment(state.searchParams.period.startTime))
        );
      }
      return current && current > moment().endOf("day");
    };
    const closeModal = () => {
      emit("close");
    };
    const handleCheckChange = async (e) => {
      if (e.target.checked) {
        proxy.$message.loading({ content: "正在获取历史轨迹，请稍后...", duration: 0 });

        const allData = await getAllData();
        const pointes = allData.map((item) => [item.lng, item.lat]);

        // 过滤不在半径范围内的点
        const filteredPointes = pointes.filter((point) => {
          const lnglat = new AMap.LngLat(point[0], point[1]);
          const centerPoint = new AMap.LngLat(proxy.$store.getters.mapConfig.lnglat[0], proxy.$store.getters.mapConfig.lnglat[1]);
          const radius = Number(proxy.$store.getters.mapConfig.radius);
          const distance = AMap.GeometryUtil.distanceOfLine([lnglat, centerPoint]);
          return distance <= radius;
        });

        emit("historyPointLines", filteredPointes);
        proxy.$message.destroy();
      } else {
        emit("clearHistoryPointLines");
      }
    };
    const handleReset = () => {
      state.searchParams.period.startTime = "";
      state.searchParams.period.endTime = "";
      state.pagination.pageNumber = 1;
      getTrailList();
    };
    const handleSearch = () => {
      state.pagination.pageNumber = 1;
      getTrailList();
    };
    const changeMinimized = (bol) => {
      emit("update:isMinimized", bol);
    };
    const buildPeriod = () => {
      const startTime = state.searchParams.period.startTime ?? "";
      const endTime = state.searchParams.period.endTime ?? "";
      let period = "";
      if (startTime && !endTime) {
        period = startTime;
      } else if (endTime && !startTime) {
        period = endTime;
      }
      if (startTime && endTime) {
        period = [startTime, endTime].join(",");
      }
      return period || "2020-01-01,2023-10-10";
    };
    const updateTrailList = (result) => {
      const records = Array.isArray(result?.records) ? result.records : [];
      state.pagination.total = result?.total ?? 0;
      state.trailList = records.map((item) => {
        return {
          ...item,
          timeFormat: moment(item.uploadTime).format("YYYY-MM-DD HH:mm:ss"),
        };
      });
      return records;
    };
    const getTrailList = async ({ allowPageFallback = false } = {}) => {
      if (!state.searchParams.period.startTime && !state.searchParams.period.endTime) {
        state.trailList = [];
        state.pagination.total = 0;
        return proxy.$message.warning("请选择时间");
      }
      const params = {
        userId: props.stateInfo.id,
        period: buildPeriod(),
        ...state.pagination,
      };
      const result = await proxy.$api.getHistoryTrack(params);
      const records = updateTrailList(result);
      const maxPage = Math.max(1, Math.ceil((result?.total ?? 0) / state.pagination.pageSize));
      if (allowPageFallback && records.length === 0 && (result?.total ?? 0) > 0 && state.pagination.pageNumber > maxPage) {
        state.pagination.pageNumber = maxPage;
        const retryResult = await proxy.$api.getHistoryTrack({
          ...params,
          pageNumber: state.pagination.pageNumber,
        });
        updateTrailList(retryResult);
      }
    };
    const getAllData = async () => {
      let allData = [];
      let currentPage = 1;
      let totalPages = 1;
      const params = {
        userId: props.stateInfo.id,
        period: buildPeriod(),
        pageSize: 5,
      };
      try {
        while (currentPage <= totalPages) {
          const { pages, records } = await proxy.$api.getHistoryTrack({ ...params, pageNumber: currentPage });
          allData = [...allData, ...records];
          currentPage++;
          totalPages = pages;
        }
        return allData;
      } catch (error) {
        throw error;
      }
    };
    const changePagination = (pageNumber, pageSize) => {
      state.pagination.pageNumber = pageNumber;
      state.pagination.pageSize = pageSize;
      getTrailList({ allowPageFallback: true });
      trailStep.value?.scrollTo({
        top: 0,
      });
    };
    return {
      changePagination,
      closeModal,
      handleReset,
      changeMinimized,
      trailStep,
      handleSearch,
      disabledEndDate,
      disabledDate,
      handleCheckChange,
      ...toRefs(state),
    };
  },
});
</script>
<style lang="less">
.trail-modal {
  width: 356px;
  position: fixed;
  top: calc(50% - 300px);
  left: calc(50% - 180px);
  background: linear-gradient(180deg, rgba(13, 43, 97, 0.9) 0%, rgba(8, 28, 65, 0.9) 100%);

  .trail-modal-header {
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

      > span {
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

  .trail-modal-content {
    width: 100%;
    padding: 16px 8px;

    .user {
      margin: 0 12px;
      padding: 5px 14px;
      display: flex;
      background: url("/resource/v1/command-dispatch-migrate/commandDispatch/images/contentBg.png") no-repeat 100% 100%;
      align-items: center;
      gap: 12px;

      .avatar {
        width: 52px;
        height: 52px;
        opacity: 1;
        border: 1px solid #388ef3;
        border-radius: 50%;
        padding: 2px;

        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }
      }

      .user-info {
        display: flex;
        flex-direction: column;

        .status-name {
          display: flex;
          align-items: center;
          gap: 6px;

          .name {
            font-size: 20px;
            font-family:
              Source Han Sans CN-Medium,
              Source Han Sans CN;
            font-weight: 500;
            color: #ffffff;
          }

          .status {
            padding: 2px 6px;
            background: rgba(75, 255, 55, 0.1);
            border-radius: 2px 2px 2px 2px;
            font-size: 12px;
            font-family:
              PingFang SC-Regular,
              PingFang SC;
            font-weight: 400;
            color: #1ec138;
          }
        }

        .number {
          font-size: 13px;
          font-family:
            Source Han Sans CN-Regular,
            Source Han Sans CN;
          font-weight: 400;
          color: #a2b5d6;
        }
      }
    }

    .search-trail-toolbar {
      padding: 13px 12px 11px 14px;
      margin-top: 30px;
      display: flex;
      flex-direction: column;
      background: #0e285b;
      gap: 8px;

      .item {
        color: #cbd5e5;
        display: flex;
        align-items: center;
        gap: 12px;

        label {
          width: 60px;
          flex-shrink: 0;
        }

        .reset {
          padding: 4px 12px;
          border: 1px solid rgba(33, 108, 195, 0.5);
          font-size: 12px;
          font-family:
            Source Han Sans CN-Regular,
            Source Han Sans CN;
          font-weight: 400;
          color: #ffffff;
          border-radius: 4px;
          background: #1f4790;
          cursor: pointer;
        }

        .search {
          background: #2989ff;
          border: 1px solid#2989FF;
        }
      }
    }

    .trail-step {
      margin-top: 6px;
      height: 300px;
      overflow-y: scroll;
      padding: 20px 26px 46px 26px;
      display: flex;
      flex-direction: column;
      background: #0f2858;

      .step-item {
        display: flex;
        align-items: stretch;
        gap: 18px;
        height: 84px;

        .step-icon {
          position: relative;
          margin-top: 5px;

          .dot-out {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #3b61a8;
            border: 2px solid rgba(255, 255, 255, 0.1);

            .dot-in {
              width: 10%;
              height: 10px;
              border-radius: 50%;
              background: #3b61a8;
            }
          }

          .step-icon-image {
            width: 12px;
            height: 12px;
            position: relative;

            img {
              width: 24px;
              height: 24px;
              position: absolute;
              right: -5px;
            }
          }

          .line {
            position: absolute;
            top: 14px;
            left: 5px;
            height: 84px;
            width: 1px;
            border-right: 1px dashed rgba(255, 255, 255, 0.1);
          }
        }

        .step-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 1px;

          &:first-child {
            padding-top: 4px;
          }

          .step-title {
            font-size: 13px;
            font-family: Roboto-Regular, Roboto;
            font-weight: 400;
            color: #cbd5e5;
          }

          .step-desc {
            font-size: 12px;
            font-family:
              Source Han Sans-Regular,
              Source Han Sans;
            font-weight: 400;
            color: #cbd5e5;
            margin-bottom: 20px;
          }
        }
      }
    }
  }
}
</style>
<style lang="less">
.trail-modal {
  .ant-pagination {
    color: rgba(228, 228, 228, 1) !important;
  }

  .ant-pagination-item-active {
    background: transparent !important;
  }

  .ant-pagination-item-ellipsis {
    color: rgba(228, 228, 228, 1) !important;
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

  .ant-form-item-label > label {
    color: rgba(255, 255, 255, 0.8);
  }

  .check-box {
    width: 100%;

    .ant-checkbox-wrapper {
      color: #fff;
      width: 60% !important;

      .ant-checkbox-inner {
        background: #0c3173;
        border-radius: 2px 2px 2px 2px;
        opacity: 1;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
    }
  }

  .ant-input {
    background: transparent;
    border: 1px solid #374870;
    color: #ffffff;
  }

  .ant-calendar-picker:hover .ant-calendar-picker-input:not(.ant-input-disabled) {
    border: 1px solid #374870;
  }

  .ant-input-affix-wrapper {
    background-color: transparent;
    border: 1px solid #374870;
  }

  .ant-upload.ant-upload-select-picture-card {
    background-color: transparent;
    border: 1px solid #374870;
  }

  .ant-calendar-picker-icon {
    color: rgba(255, 255, 255, 0.4) !important;
  }

  .ant-upload {
    color: rgba(255, 255, 255, 0.2);
  }

  .ant-calendar {
    background-color: #374870;
    border: 1px solid #2989ff;
  }

  .ant-calendar-input {
    background: transparent;
    border: solid 1px #2989ff;
  }

  .ant-calendar-header .ant-calendar-prev-year-btn {
    color: rgba(255, 255, 255, 0.8);
  }

  .ant-calendar-header a:hover {
    color: #ffffff;
  }

  .ant-calendar-header .ant-calendar-year-select {
    color: rgba(255, 255, 255, 0.8);
  }

  .ant-calendar-picker-container {
    color: #ffffff;
  }

  .ant-calendar-date {
    color: rgba(255, 255, 255, 0.8);
  }

  .ant-calendar-last-month-cell .ant-calendar-date,
  .ant-calendar-next-month-btn-day .ant-calendar-date {
    color: rgba(255, 255, 255, 0.4);
  }
}
</style>
