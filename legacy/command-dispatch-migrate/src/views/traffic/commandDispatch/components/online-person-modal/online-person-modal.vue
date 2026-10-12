<template>
  <div class="person-list-container">
    <custom-modal className="online-person-modal" v-model:visible="visible" :isMinimized="isMinimized"
      @changeIsMinimized="changeIsMinimized" title="现场人员" @close="handleClose">
      <template #header-center>
        <div class="online-stat">在线人数{{onlineCount}}/<span>{{ personList.length }}</span> </div>
      </template>
      <div class="person-content">
        <div class="content-search">
          <a-space :size="12">
            <a-input v-model:value="keyword" placeholder="请输入人员查询"></a-input>
            <span style="color: #fff;flex-shrink: 0;">部门:</span>
            <a-tree-select v-model:value="organizationIds" show-search style="width: 180px"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" placeholder="请选择部门" :replace-fields="{
              children: 'children',
              key: 'id',
              value: 'id',
              title: 'name',
            }" :tree-data="deptList"></a-tree-select>
            <a-button class="searchBtn" @click="getPersonList">查询</a-button>
            <a-button class="resetBtn" @click="handleReset">重置</a-button>
          </a-space>
          <div class="person-list">
            <div v-if="personList.length">
              <a-list item-layout="vertical" size="large" :pagination="pagination" :data-source="personList">
                <template #renderItem="{ item }">
                  <a-list-item :key="item.id">
                    <div class="item">
                      <div class="img">
                        <img v-if="item.file" :src="item.file.path" class="avatar" alt="" srcset="">
                        <img v-else src="/resource/v1/command-dispatch-migrate/commandDispatch/images/default-avatar.png" class="avatar" alt="">
                      </div>
                      <div class="user">
                        <div class="info">
                          <div class="name-status">
                            <div class="name">{{ item.name }}</div>
                            <div :class="['status',!item.isOnline&&'offline']">{{ item.isOnline?'在线':'离线' }}</div>
                          </div>
                          <div class="phone">联系电话：{{ item.mobile?item.mobile:'--' }}</div>
                        </div>
                        <div class="operate">
                          <img :class="['call',!item.isOnline&&'not-allowed']" src="/resource/v1/command-dispatch-migrate/commandDispatch/images/record-icon.png" alt=""
                            srcset="" @click.stop="handleSelectPerson(item)">
                          <img :class="['call',!item.isOnline&&'not-allowed']" src="/resource/v1/command-dispatch-migrate/commandDispatch/images/audio-call.png" alt=""
                            srcset="" @click.stop="handleMakeCall(item,false)">
                          <img :class="['call',!item.isOnline&&'not-allowed']" src="/resource/v1/command-dispatch-migrate/commandDispatch/images/video-call.png" alt=""
                            srcset="" @click.stop="handleMakeCall(item,true)">
                        </div>
                      </div>
                    </div>
                  </a-list-item>
                </template>

              </a-list>
            </div>
            <div v-else class="empty">
              <a-empty></a-empty>
            </div>
          </div>
        </div>
      </div>

    </custom-modal>
    <!-- <div v-show="makeCallModalVisible">
      <makeCallModal v-model:isMinimized="makeCallIsMinimized" v-model:visible="makeCallModalVisible"
        :callInfo="callInfo" @close="makeCallModalVisible=false" @openVideoConference="openVideoConference"
        @openAudioConference="openAudioConference" />
    </div> -->
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted, watch, computed } from "vue";


import makeCallModal from '../make-call-modal/index.vue'
import { dispatchConfig } from '../../../../../../webrtc-plugin'
import { useStore } from 'vuex'
import { isInRadius } from "../../../../../utils/common";
import customModal from '../custom-modal/index.vue'
export default defineComponent({
  props: {
    stateInfo: {
      type: Object,
      default: {}
    },
    visible: {
      type: Boolean,
      default: () => false
    },
    isMinimized: {
      Boolean,
      default: false
    },
  },
  name: 'online-person-modal',
  components: { makeCallModal, customModal },
  emits: ['update:visible', 'focusPerson', 'updateCallInfo', 'openAudioConference', 'openVideoConference'],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const store = useStore()
    const state = reactive({
      personList: [],
      deptList: [],
      keyword: '',
      organizationIds: '',
      makeCallModalVisible: false,
      makeCallIsMinimized: false,
      callInfo: {
        isVideo: false,
        number: '',
        mobile: '',
        file: null,
        userName: ''
      },

    })
    const pagination = {
      onChange: (page) => {
      },
      pageSize: 3,
    };
    const handleClose = () => {
      emit('update:visible', false)
    }
    const openAudioConference = () => {
      emit('openAudioConference')
    }
    const openVideoConference = () => {
      emit('openVideoConference')
    }
    const onlineCount = computed(() => {
      return state.personList.filter(item => item.account && isInRadius(item)).length
    })
    const getDept = async () => {
      const data = await proxy.$api.getOrganizations();
      state.deptList = data;
    };
    const getPersonList = async () => {
      if (!store.getters.hasConfig) return;
      const result = await proxy.$api
        .getCommunicateUserList({ keyword: state.keyword, organizationIds: state.organizationIds ? [state.organizationIds] : [] })
      state.personList = result.map(item => {
        return {
          ...item,
          isOnline: item.account && isInRadius(item)
        }
      }).filter(item => item.id !== store.getters.userInfo.id)
      state.personList.sort((a, b) => {
        if (a.isOnline === b.isOnline) return 0;
        return a.isOnline ? -1 : 1
      })
    }
    const handleSelectPerson = (item) => {
      if (!item.isOnline) return;
      emit('focusPerson', item)
    }
    const webrtcInstance = computed(() => store.getters.webrtcInstance)
    const handleMakeCall = (item, isVideo) => {
      if (!item.isOnline) return;
      if (webrtcInstance.value.callState !== 'IDLE') {
        proxy.$message.error('当前正在通话中，请先结束通话')
        return
      }
      state.callInfo.isVideo = isVideo
      state.callInfo.number = item.id
      state.callInfo.mobile = item.mobile
      state.callInfo.file = item.file
      state.callInfo.userName = item.name
      emit('makeCall', state.callInfo)
      const mediaControl = document.getElementById(`local-make-call-video`);
      if (!webrtcInstance.value) return;
      webrtcInstance.value.makeCall(item.id, mediaControl, isVideo);
    }
    watch(() => props.visible, (newVal) => {
      if (newVal) {
        getPersonList()
      }
    })
    const handleReset = () => {
      state.keyword = ''
      state.organizationIds = ''
      getPersonList()
    }

    onMounted(() => {
      getPersonList()
      getDept()
    })

    const changeIsMinimized = (bol) => {
      emit('update:isMinimized', bol)
    }


    return {
      ...toRefs(state),
      handleSelectPerson,
      getPersonList,
      pagination,
      handleClose,
      handleReset,
      handleMakeCall,
      onlineCount,
      openAudioConference,
      openVideoConference,
      changeIsMinimized
    }
  }
})
</script>
<style lang='less'>
.person-content {
  .ant-list-items {
    min-height: 280px;

    .ant-list-item {
      padding: 0 !important;
    }
  }

  .ant-pagination {
    color: rgba(228, 228, 228, 1) !important;
  }

  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    background: transparent !important;
    border: 1px solid #374870 !important;
    color: #ffffff !important;
  }

  .ant-pagination-item {
    background: transparent !important;
  }

  .ant-pagination-item-active {
    background: linear-gradient(180deg, #134297 0%, #12316a 100%) !important;
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

  .ant-pagination-prev,
  .ant-pagination-next {
    color: rgba(228, 228, 228, 1) !important;
  }

  .ant-pagination-prev a,
  .ant-pagination-next a {
    background: transparent !important;
    color: rgba(228, 228, 228, 1) !important;
  }
}


.online-person-modal {
  width: 600px;
  position: fixed;
  top: calc(100vh - 632px);
  left: 670px;
  background: rgba(4, 14, 38, 0.96);
  border: 1px solid rgba(41, 137, 255, 1);





  .online-stat {
    font-size: 18px;
    font-family: Source Han Sans CN, Source Han Sans CN-Medium;
    font-weight: Medium;
    text-align: center;
    color: #ffffff;
    line-height: 18px;
    text-shadow: 0px 0px 4px 0px #2989ff;

    span {
      color: rgba(255, 255, 255, 0.50);
    }
  }

  .person-content {
    padding: 18px 15px 30px;

    .content-search {
      .searchBtn {
        background: #2989ff;
        color: #ffffff;
        border-color: #2989ff;
      }

      .resetBtn {
        color: #2989ff;
        background: #000000;
        border-color: #2989ff;
      }


      .ant-input {
        background: transparent;
        border: 1px solid rgba(183, 197, 211, 0.3);
        color: rgba(183, 197, 211, 1);
      }
    }

    .person-list {
      height: 350px;
      margin-top: 12px;

      .empty {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .item {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
        gap: 10px;

        .avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
        }

        &:last-child {
          .user {
            border-bottom: none;
          }
        }

        .user {
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.10);



          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;

          .info {

            .name-status {
              display: flex;
              align-items: center;

              .name {
                font-size: 18px;
                font-family: Source Han Sans CN, Source Han Sans CN-Medium;
                font-weight: Medium;
                text-align: center;
                color: #ffffff;
              }

              .status {
                background: rgba(30, 193, 56, 0.30);
                border-radius: 2px;
                padding: 4px 5px;
                font-size: 12px;
                font-family: Source Han Sans CN, Source Han Sans CN-Regular;
                font-weight: Regular;
                text-align: left;
                margin-left: 10px;
                color: #1EC138;
              }

              .offline {
                background: rgba(255, 151, 55, 0.30);
                color: #FF9737
              }
            }

            .phone {
              margin-top: 12px;
              font-size: 13px;
              text-align: left;
              font-family: Source Han Sans CN, Source Han Sans CN-Regular;
              font-weight: Regular;
              text-align: left;
              color: #b6bcc2;
            }
          }

          .operate {
            display: flex;
            align-items: center;
            gap: 20px;

            .call {
              cursor: pointer;
            }

            .not-allowed {
              cursor: not-allowed;
            }

            img {
              width: 32px;
              height: 32px
            }
          }

        }


      }
    }

  }

}
</style>