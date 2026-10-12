<template>
  <custom-modal className="select-circle-person-modal" :isMinimized="isMinimized" @changeIsMinimized="changeIsMinimized"
    title="圈选人员" @close="closeModal" v-model:visible="visible">
    <div class="select-circle-content">
      <div class="left-list">
        <div class="list-title">
          <a-checkbox v-model:checked="checkAll" @change="onCheckAllChange"
            :indeterminate="indeterminate">全部在线人员</a-checkbox>
        </div>
        <div class="list" v-if="deviceList.length">
          <div class="list-item">
            <a-checkbox-group v-model:value="checkedList">
              <div v-for="item in deviceList" :key="item.id" class="checked-item">
                <label>
                  <a-checkbox :value="item.id">{{ item.name }}</a-checkbox>
                </label>
              </div>
            </a-checkbox-group>
          </div>
        </div>
        <a-empty description="暂无数据或设备不在线" v-else />
      </div>
      <div class="center-btn" @click="handleSelected">
        <RightOutlined :style="{ fontSize: '18px' }" />
      </div>
      <div class="right-list">
        <div class="list-title">{{ "当前选中人员" }}</div>
        <div class="list" v-if="selectedList.length">
          <div class="list-item" v-for="item in selectedList" :key="item.id">
            <div class="name">{{item.name }}</div>
            <div class="btn" @click="removeSelected(item)">
              <DeleteOutlined :style="{ color: '#DE1504', fontSize: '12px' }" />
              <span>删除</span>
            </div>
          </div>
        </div>
        <div class="no-data" v-else>
          <a-empty />
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <div class="button" @click="handleMultipleCall(false)">多人通话</div>
      <div class="button" @click="handleMultipleCall(true)">多人视讯</div>
    </div>
  </custom-modal>
</template>

<script>
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted, computed } from "vue";
import {
  CloseOutlined,
  RightOutlined
} from "@ant-design/icons-vue";
import { dispatchConfig } from '../../../../../../webrtc-plugin'
import { useStore } from 'vuex'
import customModal from '../custom-modal/index.vue'
import { isInRadius } from '../../../../../utils/common'
export default defineComponent({
  props: {
    circlingPersons: {
      type: Array,
      default: []
    },
    visible: {
      type: Boolean,
      default: () => false
    },
    isMinimized: {
      type: Boolean,
      default: false
    },
  },
  name: 'selectCirclingPerson',
  components: { CloseOutlined, RightOutlined, customModal },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const store = useStore()
    const state = reactive({
      deviceList: [],
      checkedList: [],
      selectedList: [],
      checkAll: false,
      indeterminate: false,
    })


    const closeModal = () => {
      emit('close')
    }
    const webrtcInstance = computed(() => store.getters.webrtcInstance)
    const localUser = computed(() => store.getters.userInfo ?? { name: '张三' })
    const removeSelected = (record) => {
      state.selectedList = state.selectedList.filter(
        (item) => item.id !== record.id
      );
      state.deviceList.push(record);
    };
    const handleSelected = () => {
      state.checkedList.forEach((code) => {
        let index = state.deviceList.findIndex((item) => item.id === code);
        state.selectedList.push(state.deviceList[index]);
        state.deviceList.splice(index, 1);
      });
      state.checkedList = [];
      state.checkAll = false;
    }
    onMounted(() => {
      state.selectedList = props.circlingPersons
      store.getters.hasConfig && getDispatchDeviceList()
    })
    const onCheckAllChange = (e) => {
      state.checkedList = e.target.checked
        ? state.deviceList.map((item) => item.code)
        : [];
      state.indeterminate = false;
    };
    const handleMultipleCall = async (isVideo) => {
      if (!state.selectedList.length) return proxy.$message.warning('请选择成员')
      const mediaControl = document.getElementById('member-control-host')
      const members = state.selectedList.map(item => item.id)
      const meetingName = `${localUser.value.name}发起的的${isVideo ? '视频' : "语音"}通话`
      store.commit('commandDispatch/SET_MEETING_TITLE', meetingName)
      await webrtcInstance.value.startConference(members, mediaControl, meetingName, isVideo)
      proxy.$emitter.emit("startConference", 'video');
      store.commit('userInfo/SET_USER_INFO', {
        ...localUser.value,
        openVideo: isVideo
      })
      emit('openVideoConference')
      closeModal()
    }
    const getDispatchDeviceList = async () => {
      const result = await proxy.$api.getOnlineUserList()
      const selectedIds = state.selectedList.map(item => item.id)
      state.deviceList = result.filter(item => {
        return !selectedIds.includes(item.id) && isInRadius(item) && item.id !== localUser.value.id
      })
    };

    const changeIsMinimized = (bol) => {
      emit('update:isMinimized', bol)
    }

    return {
      changeIsMinimized,
      closeModal,
      onCheckAllChange,
      removeSelected,
      handleSelected,
      handleMultipleCall,
      ...toRefs(state)
    }
  }
})
</script>
<style lang="less">
.select-circle-person-modal {
  width: 1050px;
  position: fixed;
  top: calc(50% - 200px);
  left: calc(50% - 525px);
  // transform: translate(-50%, -50%);
  z-index: 20;
  background: linear-gradient(180deg, rgba(13, 43, 97, 0.9) 0%, rgba(8, 28, 65, 0.9) 100%);


  .select-circle-person-modal-header {
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
    gap: 20px;

    .button {
      background: #2989FF;
      border-radius: 4px 4px 4px 4px;
      padding: 5px 20px;
      font-size: 14px;
      font-family: Source Han Sans-Medium, Source Han Sans;
      font-weight: 500;
      color: #FFFFFF;
      cursor: pointer;
    }
  }

  .center-btn {
    width: 42px;
    height: 42px;
    background: #535e7c;
    line-height: 42px;
    text-align: center;
    margin: 18px;
    margin-top: 180px;
    border-radius: 2px 2px 2px 2px;
    cursor: pointer;
  }

  .select-circle-content {
    font-size: 14px;
    color: #e2e2e2;
    height: 460px;
    display: flex;
    justify-content: space-between;

    .left-list {
      height: 100%;
      overflow: hidden;
      border: solid 1px #3a4653;
      padding: 16px;
      flex: 1;
    }

    .list {
      height: calc(100% - 30px);
      overflow: auto;
    }

    .list-title {
      margin-bottom: 16px;
      font-family: "PingFang SC-Medium, PingFang SC";
      font-weight: 500;
      color: #ffffff;
    }

    .list-item {
      font-size: 14px;
      color: #ffffff;

      .btn {
        color: #de1504;
      }
    }

    .checked-item {
      line-height: 30px;
    }

    .right-list {
      flex: 1;
      border: solid 1px #3a4653;
      padding: 16px;

      .list,
      .no-data {
        height: calc(100% - 80px);
        overflow: auto;
      }

      .list-item {
        height: 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .btn {
        cursor: pointer;

        span {
          margin-left: 4px;
        }
      }

      .footer-btn {
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-top: 1px solid #3a4653;

        >div {
          font-size: 12px;
          width: 78px;
          height: 30px;
          background: #1e3664;
          border-radius: 2px 2px 2px 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-right: 10px;
        }

        .disabled {
          cursor: no-drop;
        }
      }
    }
  }

}
</style>
<style lang="less">
.select-circle-person-modal {
  .select-circle-content {
    .ant-checkbox-wrapper {
      font-size: 14px;
      font-family: "PingFang SC-Medium, PingFang SC";
      font-weight: 500;
      color: #ffffff;
    }

    .ant-checkbox-checked .ant-checkbox-inner {
      background-color: #216cc3;
      border-color: #216cc3;
    }

    .ant-checkbox-wrapper:hover .ant-checkbox-inner,
    .ant-checkbox:hover .ant-checkbox-inner,
    .ant-checkbox-input:focus+.ant-checkbox-inner {
      border-color: #216cc3;
    }

    .ant-checkbox-indeterminate .ant-checkbox-inner::after {
      border-color: #216cc3;
      background-color: #216cc3;
    }
  }
}
</style>
