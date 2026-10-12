<template>
  <custom-modal v-model:visible="visible" title="选择人员" className="person-check-modal"
    @changeIsMinimized="changeMinimized" :isMinimized="isMinimized" @close="closeModal">
    <div class="person-modal-content flex-column">
      <div class="tool-bar">
        <div class="tool-bar-item">
          <a-input v-model:value="searchParams.keyword" placeholder="搜索姓名号码"></a-input>
          <div class="search" @click="handleSearch">查询</div>
        </div>
        <div class="tool-bar-item check-box">
          <a-checkbox @change="handleChangeCheckbox">仅显示在线人员</a-checkbox>
        </div>
      </div>
      <div class="person-list">
        <a-list item-layout="horizontal" :pagination="pagination" :data-source="userList">
          <template #renderItem="{item}">
            <a-list-item>
              <div
                :class="['person-item',activePersonIds.includes(item.id)&&'active-person',!item.account&&'not-allowed']"
                @click="handleClickPerson(item)">
                <a-list-item-meta :description="item.mobile?item.mobile:'--'">
                  <template #avatar>
                    <img v-if="item.file" :src="item.file.path" alt="">
                    <img v-else src="/resource/v1/command-dispatch-migrate/commandDispatch/images/default-avatar.png" alt="">
                  </template>
                  <template #title>
                    <div class="title">
                      <div class="name"> {{ item.name }}</div>
                      <div :class="['status',!item.account&&'offline']">{{ item.account?'在线':'离线' }}</div>
                    </div>
                  </template>
                </a-list-item-meta>
              </div>
            </a-list-item>
          </template>

        </a-list>
      </div>
    </div>
    <div class="modal-footer">
      <div class="button" @click="handleConfirm">确定</div>
    </div>

  </custom-modal>

</template>

<script>
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted, computed } from "vue";
import {
  CloseOutlined,
} from "@ant-design/icons-vue";
import customModal from '../custom-modal'
import { useStore } from "vuex";
export default defineComponent({
  props: {
    multiple: {
      type: Boolean,
      default: false
    },
    visible: {
      type: Boolean,
      default: false
    },
    isMinimized: {
      type: Boolean,
      default: false
    },
  },
  name: 'checkPersonModal',
  components: { CloseOutlined, customModal },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const store = useStore()
    const localUser = computed(() => store.getters.userInfo ?? { name: '指挥调度中心' })
    let allList = []
    let isSearch = false
    const state = reactive({
      userList: [],
      searchParams: {
        keyword: ''
      },
      activePersonIds: []
    })

    const pagination = {
      pageSize: 5,
    }
    const handleGroup = (item) => {
      if (props.multiple) {
        if (state.activeGroupIds.includes(item.id)) {
          state.activeGroupIds = state.activeGroupIds.filter(id => id !== item.id)
        } else {
          state.activeGroupIds.push(item.id)
        }
      } else {
        if (state.activeGroupIds.includes(item.id)) {
          state.activeGroupIds = []
        } else {
          state.activeGroupIds = [item.id]
        }
      }
    }
    const handleChangeCheckbox = (e) => {
      if (e.target.checked) {
        state.userList = state.userList.filter(item => item.account)
      } else {
        getUserList()
      }
    }
    const handleConfirm = () => {
      if (!state.activePersonIds.length) return proxy.$message.warning('请选择人员')
      !props.multiple ? emit('confirm', state.activePersonIds[0]) : emit('confirm', state.activePersonIds)
      closeModal()
    }
    const handleClickPerson = (item) => {
      if (!item.account) return;
      if (props.multiple) {
        if (state.activePersonIds.includes(item.id)) {
          state.activePersonIds = state.activePersonIds.filter(id => id !== item.id)
        } else {
          state.activePersonIds.push(item.id)
        }
      } else {
        if (state.activePersonIds.includes(item.id)) {
          state.activePersonIds = []
        } else {
          state.activePersonIds = [item.id]
        }
      }

    }
    const closeModal = () => {
      emit('close')
    }
    onMounted(() => {
      getUserList()
    })


    const handleSearch = () => {
      if (state.searchParams.keyword) {
        isSearch = true
      } else {
        isSearch = false
        state.activeGroupId = ''
        state.activePersonId = ''
      }
      getUserList()
    }
    // 初始获取部门数据
    const getUserList = async () => {
      const result = await proxy.$api.getCommunicateUserList({
        keyword: state.searchParams.keyword
      });
      state.userList = result.filter(item => item.account && item.id !== localUser.value.id)
    }
    const changeMinimized = (bol) => {
      emit('update:isMinimized', bol)
    }
    return {
      pagination,
      closeModal,
      changeMinimized,
      handleSearch,
      handleGroup,
      handleConfirm,
      handleClickPerson,
      handleChangeCheckbox,
      ...toRefs(state)
    }
  }
})
</script>
<style lang="less">
.person-check-modal {
  width: 456px;
  position: fixed;
  top: calc(50% - 250px);
  left: calc(50% - 178px);
  background: linear-gradient(180deg, rgba(13, 43, 97, 0.9) 0%, rgba(8, 28, 65, 0.9) 100%);


  .person-modal-header {
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

  .modal-footer {
    margin-top: 16px;
    margin-bottom: 19px;
    display: flex;
    justify-content: center;
    align-items: center;

    .button {
      background: #2989FF;
      border-radius: 4px 4px 4px 4px;
      padding: 5px 34px;
      font-size: 14px;
      font-family: Source Han Sans-Medium, Source Han Sans;
      font-weight: 500;
      color: #FFFFFF;
      cursor: pointer;
    }
  }

  .ant-empty-description {
    color: #fff;
  }

  .person-modal-content {
    width: 100%;
    padding: 8px;


    .tool-bar {
      padding: 12px;
      background: #0E285B;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .tool-bar-item {
      display: flex;
      gap: 12px;
      align-items: center;

      .search {
        padding: 5px 12px;
        font-size: 12px;
        cursor: pointer;
        font-family: Source Han Sans CN-Regular, Source Han Sans CN;
        font-weight: 400;
        background: #2989FF;
        border-radius: 4px 4px 4px 4px;
        color: #FFFFFF;
        flex-shrink: 0;
      }
    }

    .person-list {
      padding: 12px;
      height: 400px;
      overflow-y: auto;
      background: #0F2858;
      display: flex;
      flex-direction: column;
      gap: 8px;

      .ant-list-item {
        border-bottom: none !important;

        .title {
          display: flex;
          align-items: center;
          gap: 12px;

          .name {
            font-family: Source Han Sans CN-Medium, Source Han Sans CN;
            font-weight: 500;
            color: #FFFFFF;
          }

          .status {
            padding: 2px 6px;
            background: rgba(75, 255, 55, 0.1);
            border-radius: 2px 2px 2px 2px;
            font-size: 12px;
            font-family: PingFang SC-Regular, PingFang SC;
            font-weight: 400;
            color: #1EC138;
          }

          .offline {
            background: rgba(255, 151, 55, 0.30);
            color: #FF9737
          }
        }
      }

      .person-item {
        padding: 6px 12px;
        color: #fff;
        width: 100%;

        .ant-list-item-meta-content,
        .ant-list-item-meta-title,
        .ant-list-item-meta-description {
          color: #fff
        }
      }

      .not-allowed {
        cursor: not-allowed;
      }

      .active-person {
        background: rgba(4, 20, 39, 0.8);
      }

      img {
        width: 40px;
        height: 40px;
      }

      // .list-item {
      //   .active-group {
      //     background: linear-gradient(270deg, rgba(41, 137, 255, 0.8) 0%, rgba(41, 137, 255, 0) 100%) !important;
      //     font-size: 16px !important;
      //   }

      //   .list-group {
      //     padding: 5px 12px;
      //     background: linear-gradient(270deg, rgba(41, 137, 255, 0.2) 0%, rgba(41, 137, 255, 0) 100%);
      //     font-size: 14px;
      //     font-family: Source Han Sans-Medium, Source Han Sans;
      //     font-weight: 500;
      //     color: #FFFFFF;
      //     display: flex;
      //     align-items: center;
      //     justify-content: space-between;
      //     position: relative;
      //     cursor: pointer;

      //     .arrow-down {
      //       transform: rotate(315deg) !important;
      //       top: 10px !important;
      //     }

      //     .triangle {
      //       position: absolute;
      //       top: 14px;
      //       right: 12px;
      //       width: 9px;
      //       height: 9px;
      //       background: linear-gradient(45deg, #fff, #fff 50%, transparent 50%, transparent 100%);
      //       transform: rotate(135deg);
      //       // transform: rotate(315deg);
      //     }
      //   }

      //   .persons {
      //     padding: 7px 0;

      //     .active-person {
      //       background: #2989FF;
      //     }

      //     .disabled {
      //       cursor: not-allowed !important;
      //       pointer-events: none;
      //       opacity: 0.6;
      //     }

      //     .person-item {
      //       display: flex;
      //       padding: 5px 22px;
      //       justify-content: space-between;
      //       align-items: center;
      //       cursor: pointer;

      //       .person-name {
      //         font-size: 12px;
      //         font-family: Source Han Sans-Regular, Source Han Sans;
      //         font-weight: 400;
      //         color: #FFFFFF;
      //       }

      //       .status {
      //         display: flex;
      //         align-items: center;
      //         gap: 4px;

      //         .dot-online {
      //           background: #1EC138 !important;
      //         }

      //         .dot {
      //           width: 4px;
      //           height: 4px;
      //           background: rgba(255, 255, 255, 0.6);
      //           border-radius: 50%;
      //         }

      //         .online {
      //           color: #1EC138;
      //         }

      //         span {
      //           font-size: 12px;
      //           font-family: Source Han Sans-Regular, Source Han Sans;
      //           font-weight: 400;
      //           color: rgba(255, 255, 255, 0.6);
      //         }
      //       }
      //     }
      //   }
      // }
    }
  }

}
</style>
<style lang="less">
.person-check-modal {
  .ant-form-item-label>label {
    color: rgba(255, 255, 255, 0.8);
  }

  .check-box {
    width: 100%;

    .ant-checkbox-wrapper {
      color: #fff !important;
      width: 60% !important;

      .ant-checkbox-inner {
        background: #0C3173;
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
