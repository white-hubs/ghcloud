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
  background: var(--dispatch-modal-bg, rgba(255, 255, 255, 0.98));
  border: 1px solid var(--dispatch-border, #dbe4ef);
  box-shadow: var(--dispatch-shadow-strong, 0 12px 32px rgba(26, 54, 93, 0.18));
  color: var(--dispatch-text, #1f2d3d);

  .trail-modal-header {
    height: 50px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--dispatch-border, #dbe4ef);

    .header-title {
      display: flex;
      align-items: center;
      justify-content: flex-start;

      > span {
        font-size: 16px;
        font-family: PingFang SC-Medium;
        font-weight: 500;
        color: var(--dispatch-text, #1f2d3d);
        margin-left: 4px;
      }
    }

    .header-close {
      width: 24px;
      height: 24px;
      background: var(--dispatch-map-blue-soft, #eaf4ff);
      color: var(--dispatch-map-blue, #216cc3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 1px solid var(--dispatch-map-blue-border, #cfe0f3);
      border-radius: 4px;
    }
  }

  .trail-modal-content {
    width: 100%;
    padding: 16px 8px;

    .user {
      margin: 0 12px;
      padding: 5px 14px;
      display: flex;
      background: var(--dispatch-panel-bg-soft, #f6f9fd);
      border: 1px solid var(--dispatch-border-soft, #e8eef6);
      border-radius: 6px;
      align-items: center;
      gap: 12px;

      .avatar {
        width: 52px;
        height: 52px;
        opacity: 1;
        border: 1px solid #216cc3;
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
            color: var(--dispatch-text, #1f2d3d);
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
          color: var(--dispatch-text-secondary, #64748b);
        }
      }
    }

    .search-trail-toolbar {
      padding: 13px 12px 11px 14px;
      margin-top: 30px;
      display: flex;
      flex-direction: column;
      background: var(--dispatch-panel-bg-soft, #f6f9fd);
      border: 1px solid var(--dispatch-border-soft, #e8eef6);
      gap: 8px;

      .item {
        color: var(--dispatch-text-secondary, #64748b);
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
          color: var(--dispatch-map-blue, #216cc3);
          border-radius: 4px;
          background: var(--dispatch-map-blue-soft, #eaf4ff);
          cursor: pointer;
        }

        .search {
          background: #216cc3;
          border: 1px solid#216cc3;
          color: white;
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
      background: var(--dispatch-panel-bg-soft, #f6f9fd);
      border: 1px solid var(--dispatch-border-soft, #e8eef6);
      // color:black

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
            color: black;
          }

          .step-desc {
            font-size: 12px;
            font-family:
              Source Han Sans-Regular,
              Source Han Sans;
            font-weight: 400;
            color: black;
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
    // color: rgba(228, 228, 228, 1) !important;
  }

  .ant-pagination-item-active {
    // background: transparent !important;
  }

  .ant-pagination-item-ellipsis {
    // color: rgba(228, 228, 228, 1) !important;
  }

  .ant-pagination-item {
    border-color: #d1d1d1;
    // color: rgba(228, 228, 228, 1) !important;

    a {
      // color: rgba(228, 228, 228, 1) !important;
    }
  }

  .ant-pagination.mini .ant-pagination-prev,
  .ant-pagination.mini .ant-pagination-next {
    color: rgba(228, 228, 228, 1) !important;
  }

  .ant-pagination-prev a,
  .ant-pagination-next a {
    // color: rgba(228, 228, 228, 1) !important;
  }

  .ant-form-item-label > label {
    // color: var(--dispatch-text, #1f2d3d);
  }

  .check-box {
    width: 100%;

    .ant-checkbox-wrapper {
      color: var(--dispatch-text, #1f2d3d);
      width: 60% !important;

      .ant-checkbox-inner {
        background: var(--dispatch-input-bg, #ffffff);
        border-radius: 2px 2px 2px 2px;
        opacity: 1;
        border: 1px solid var(--dispatch-map-blue-border, #cfe0f3);
      }
    }
  }

  .ant-input {
    background: var(--dispatch-input-bg, #ffffff);
    border: 1px solid var(--dispatch-map-blue-border, #b9d5f4);
    color: var(--dispatch-text, #26384d);
  }

  .ant-calendar-picker:hover .ant-calendar-picker-input:not(.ant-input-disabled) {
    border: 1px solid var(--dispatch-map-blue, #1976d2);
  }

  .ant-input-affix-wrapper {
    background-color: var(--dispatch-input-bg, #ffffff);
    border: 1px solid var(--dispatch-map-blue-border, #b9d5f4);
  }

  .ant-upload.ant-upload-select-picture-card {
    background-color: var(--dispatch-panel-bg-soft, #f5f9ff);
    border: 1px solid var(--dispatch-map-blue-border, #b9d5f4);
  }

  .ant-calendar-picker-icon {
    color: var(--dispatch-text-secondary, #68798d) !important;
  }

  .ant-upload {
    color: var(--dispatch-text-secondary, #68798d);
  }

  .ant-calendar {
    background-color: var(--dispatch-card-bg, #ffffff);
    border: 1px solid var(--dispatch-map-blue-border, #b9d5f4);
  }

  .ant-calendar-input {
    background: var(--dispatch-input-bg, #ffffff);
    border: solid 1px var(--dispatch-map-blue-border, #b9d5f4);
  }

  .ant-calendar-header .ant-calendar-prev-year-btn {
    color: var(--dispatch-text-secondary, #68798d);
  }

  .ant-calendar-header a:hover {
    color: var(--dispatch-map-blue, #1976d2);
  }

  .ant-calendar-header .ant-calendar-year-select {
    color: var(--dispatch-text, #26384d);
  }

  .ant-calendar-picker-container {
    color: var(--dispatch-text, #26384d);
  }

  .ant-calendar-date {
    color: var(--dispatch-text, #26384d);
  }

  .ant-calendar-last-month-cell .ant-calendar-date,
  .ant-calendar-next-month-btn-day .ant-calendar-date {
    color: var(--dispatch-text-muted, #91a1b2);
  }
}
</style>
