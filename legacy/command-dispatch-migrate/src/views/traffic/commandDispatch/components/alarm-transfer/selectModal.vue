<template>
    <a-form
      ref="formRef"
      :model="form"
      class="formBody"
      :label-col="{ span: 0 }"
      :wrapper-col="{ span: 20 }"
    >
    <div class="formHeader required">报警指派</div>
      <a-form-item label="报警指派" name="role" >
        <div class="form-item-wrapper">
        <a-select v-model:value="form.role" placeholder="请选择指派类型" style="width: 238px;" @change="handleRoleChange">
          <a-select-option v-for="option in roleOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-select-option>
        </a-select>
          <div class="assignee-wrapper" style="width:450px">
          <div class="selected-items">
            <a-tag v-for="item in form.assignee" :key="item.id" closable @close="form.assignee.splice(form.assignee.indexOf(item), 1)">
              {{ item.name }}
            </a-tag>
          </div>
          <a-button class="searchBtn" @click="openSelectModal(0)">选择</a-button>
        </div>
        </div>
      </a-form-item>
          <div class="formHeader">报警通知</div>

      <a-form-item label="通知方式">
        <div v-for="(notification, index) in form.notifications" :key="index" class="notification-item">
          <a-select
            v-model:value="notification.methods"
            mode="multiple"
            placeholder="请选择通知方式"
            style="width: 270px; margin-right: 10px"
          >
            <a-select-option
              v-for="method in notificationMethodOptions"
              :key="method.value"
              :value="method.value"
              >{{ method.label }}</a-select-option
            >
          </a-select>
          <a-select
            v-model:value="notification.person"
            placeholder="请选择通知类型"
            style="width: 130px; margin-right: 10px"
            @change="handlePersonChange(index)"
          >
            <a-select-option
              v-for="person in personOptions"
              :key="person.value"
              :value="person.value"
              >{{ person.label }}</a-select-option
            >
          </a-select>
          <div class="assignee-wrapper" style="margin-left: 0;">
          <div class="selected-items">
            <a-tag v-for="item in notification.selectedPersons" :key="item.id" closable @close="notification.selectedPersons.splice(notification.selectedPersons.indexOf(item), 1)">
              {{ item.name }}
            </a-tag>
          </div>
          <a-button class="searchBtn"  @click="openSelectModal(index + 1)">选择</a-button>
        </div>
          <plus-outlined
            v-if="index === 0"
            @click="addNotification"
            class="add-icon"
          />
          <minus-circle-outlined
            v-if="index > 0"
            @click="removeNotification(index)"
            class="remove-icon"
          />
        </div>
      </a-form-item>
    </a-form>
    <div class="footer">
      <a-button @click="cancel">取消</a-button>
      <a-button type="primary" @click="confirm" :loading="buttonLoading" style="margin-left: 10px">确认</a-button>
    </div>

    <multi-select-modal
      v-if="isModalVisible"
        v-model:visible="isModalVisible"
        :selectData ='multiSelectModalData.selectData'
        :type="multiSelectModalData.type"
        @confirm="handleModalConfirm"
        :id="transferModal.id"
    />
</template>

<script>
import { defineComponent, reactive, toRefs, ref, onMounted,getCurrentInstance } from "vue";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons-vue";
import MultiSelectModal from './MultiSelectModal.vue';

export default defineComponent({
  components: {
    PlusOutlined,
    MinusCircleOutlined,
    MultiSelectModal,
  },
  props: {
    transferModal: {
      type: Object,
      default: () => ({ visible: false }),
    },
  },
  setup(props, { emit }) {
    const formRef = ref(null);
     const { proxy } = getCurrentInstance();
    const state = reactive({
      form: {
        role: 'USER',
        assignee: [],
        notifications: [
          {
            methods: [],
            person: null,
            selectedPersons: [],
          },
        ],
      },
      buttonLoading:false,
      isModalVisible: false,
      activeIndex: null,
      // Mock data for different types
      departmentOptions: [],
      postOptions: [],
      roleDataOptions: [],
      personDataOptions: [],
      roleOptions: [
        { label: '人员', value: 'USER' },
        { label: '部门', value: 'DEPARTMENT' },
        { label: '角色', value: 'ROLE' },
        { label: '岗位', value: 'POSITION' },
      ],
      notificationMethodOptions: [],
      personOptions: [
        { label: '人员', value: 'USER' },
        { label: '角色', value: 'ROLE' },
      ],
      multiSelectModalData: {
        selectData: [],
        type: 'USER',
      },
    });


    const openSelectModal = (index) => {
      if(index){
        state.activeIndex = index;
        if(!state.form.notifications[index - 1].person){
          proxy.$message.error('请选择通知类型');
          return;
        }
      }else{
        state.activeIndex = 0;
      }
      state.isModalVisible = true;
      if(state.activeIndex){
        state.multiSelectModalData.type = state.form.notifications[index -1].person;
        state.multiSelectModalData.selectData = state.form.notifications[index -1].selectedPersons;
      }else{
      state.multiSelectModalData.type = state.form.role;
      state.multiSelectModalData.selectData = state.form.assignee;
      } 
    };

    const handleModalConfirm = (selectedItems) => {
      if(state.activeIndex){
        state.form.notifications[state.activeIndex - 1].selectedPersons = selectedItems;
      }else{
        state.form.assignee = selectedItems;

      }
        state.isModalVisible = false;
    };

    const addNotification = () => {
      if (state.form.notifications.length < 5) {
        state.form.notifications.push({
          methods: [],
          person: null,
          selectedPersons: [],
        });
      }
    };

    const removeNotification = (index) => {
      state.form.notifications.splice(index, 1);
    };
    const handleRoleChange = () =>{
      state.form.assignee = [];
    }
    const handlePersonChange = (index) =>{
      state.form.notifications[index].selectedPersons = [];
    }
    const cancel = () => {
      emit("close");
    };

    const confirm = () => {
      formRef.value
        .validate()
        .then(() => {
          // Create a deep copy to prevent unintended reactivity issues
          // const formData = JSON.parse(JSON.stringify(state.form));
          // emit("confirm", formData);
          if(!state.form.assignee.length){
            proxy.$message.error('请选择接收人');
            return;
          }
          putMessageAlarm()
        })
        .catch((error) => {
        });
    };
    const putMessageAlarm = async () => { 
      const user = {
        targetType:state.form.role,
        targetIds:[]
      }
      const data = {
        assignUser:{},
        ccMessageNotifies:[]
      }
      user.targetIds = state.form.assignee.map(e => {
            return e.id
          })
      // data.ccMessageNotifies = []
      state.form.notifications.map(e => {
        const config = e.selectedPersons.map(per => {
            if(e.person === 'USER'){
              return {
                userId: per.id,
                userName: per.name,
              }
            }else if(e.person === 'ROLE'){
              return {
                roleId: per.id,
                roleName: per.name,
              }
            }
          })
          if(e.methods.length&&e.person&&config.length){
            data.ccMessageNotifies.push({
              channelTypes: e.methods,
              targetModifyParams: [{
                messageTargetNotify:e.person,
                targetConfig:config
              }]
            })
          }
        
      })
      data.assignUser = user;
      state.buttonLoading = true;
      try{
        await proxy.$api.alarmHandelAssignNew(props.transferModal.id, data)
        proxy.$message.success('提交成功');
        emit("close");
      }finally{
        state.buttonLoading = false;
      }
    }
  onMounted(async() => {
    const code = `${props.transferModal.applicationCode}_ALARM_ASSIGN_NOTIFY`
    const allChannels = await proxy.$api.satMsgChannels()
    const selectChannels = await proxy.$api.satMsgSceneReceive(code)
    const filteredData = allChannels.filter(item => selectChannels.channelCodes.includes(item.channelCode))
    state.notificationMethodOptions = filteredData.map(e => {
      return {
        label: e.channelName,
        value: e.channelCode
      }
    })

    });
    return {
      ...toRefs(state),
      formRef,
      addNotification,
      removeNotification,
      cancel,
      confirm,
      openSelectModal,
      handleModalConfirm,
      handleRoleChange,
      handlePersonChange
    };
  },
});
</script>

<style lang="less" scoped>
.form-item-wrapper{
  display: flex;
  align-items: center;
}
.assignee-wrapper {
  display: flex;
  align-items: center;
  margin-left: 10px;
  width: 380px;
  .selected-items {
    flex-grow: 1;
    border: 1px solid #374870;
    border-radius: 2px;
    padding:0 4px;
    min-height: 32px;
    margin-right: 8px;
    display: flex;
    align-items: center;
  }
}

.notification-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;

  .add-icon,
  .remove-icon {
    font-size: 18px;
    cursor: pointer;
    margin-left: 8px;
    color: white;
  }
}

.footer {
  width: 100%;
  text-align: right;
  margin-top: 20px;
}
.formBody{
  padding: 10px;
}
 :deep(.ant-input) {
    color: #ffffff;
    background-color: transparent;
    border-color: #2989ff;

    &:hover {
      border-color: #2989ff;
    }
  }
    :deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
    background: transparent;
    border: 1px solid #374870;
    color: #ffffff;
  }

  .searchBtn {
    background: #2989ff;
    color: #ffffff;
    border-color: #2989ff;
  }
  .formHeader{
    color:#fff;
    font-size: 18px;
    line-height: 20px;
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    &::before{
      content: '';
      display: inline-block;
      width: 3px;
      height: 20px;
      background: #2989ff;
      margin-right: 10px;
    }
  }
  .required{
    &::after{
      content: '*';
      color: red;
      margin-left: 5px;
    }
  }
  .ant-form-item{
    padding: 0 28px;
  }
  :deep(.ant-select-selector) {
    .ant-select-selection-overflow{
      color: black !important;
    }
  }
</style>
