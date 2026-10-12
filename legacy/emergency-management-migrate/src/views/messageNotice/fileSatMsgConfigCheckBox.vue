<template>
  <a-form :model="model" v-bind="layout">
    <div class="pt2">
      <a-form-item label="通知条件">
        预案文件已到期
      </a-form-item>
      <a-form-item label="通知方式">
        <a-checkbox-group v-model:value="model.noticeWays" @change="change">
          <a-checkbox v-for="item in noticeBox" :key="item.value" :value="item.value" @change="updateValue">{{
            item.label }}</a-checkbox>
        </a-checkbox-group>
      </a-form-item>
      <a-form-item label="通知模板">
        【预案文件名称】已过期，请及时维护管理。
      </a-form-item>
      <a-form-item label="通知人员">
        <div v-for="(item,i) in model.emergencyFileNoticeObjs" class="person-item">
          <a-select v-model:value="item.emergencyFileTypeId" size="middle" style="width: 200px; margin-right: 10px"
            :options="fileTypeOptions" placeholder="请选择文件类型" @change="updateValue" />
          <a-input-group compact>
            <a-select v-model:value="item.objId" style="width: 200px" :open="false" mode="multiple"
              :options="item.selectOption">
              <template #suffixIcon />
            </a-select>
            <a-button type="primary" @click="clickSelectBtn(i)">选择人员</a-button>
          </a-input-group>
          <a-button v-if="i===0" shape="circle" type="primary" size="small" style="margin-left: 10px;margin-top: 3px;"
            @click="addNoticeType()">
            <template #icon><plus-outlined /></template>
          </a-button>
          <a-button v-else-if="i!==0" shape="circle" danger style="margin-left: 10px;margin-top: 3px;" size="small"
            @click="delNoticeType(i)">
            <template #icon><minus-outlined /></template>
          </a-button>
        </div>
      </a-form-item>
    </div>
  </a-form>
  <modal-table title="选择人员" v-model:value="visible" url="tenantUserList" :params="{ enabled: true }" :columns="columns"
    :search="search" :searchLength="3" :width="1200" @modal-save="selectUser" selectType="checkbox"
    :selectedKeys="selectedKeys" :selectedRows='selectedRows'></modal-table>
</template>
<script lang="jsx">
import { fileTypeList } from "@/api";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons-vue";
import {
  defineComponent,
  getCurrentInstance,
  reactive,
  toRefs,
  watch,
  ref,
  onMounted,
} from "vue";
import { useRouter, useRoute } from "vue-router";

export default defineComponent({
  props: {
    model: {
      type: Object,
    },
    noticeMethod: {
      type: Array,
    },
  },
  components: {
    PlusOutlined,
    MinusOutlined,
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const form = ref(props.model);

    const moduleID = ref();

    moduleID.value = props?.model?.satMsgChannelConfigVOS?.find((res) => res.channelType == 'CHANNEL_VOICE')?.channelTmpId
    let noticeBox = ref(props.noticeMethod)

    const state = reactive({
      fileTypeOptions: [],
      layout: {
        labelCol: { span: 2 },
        wrapperCol: {
          span: 20,
        },
      },
      visible: false,
      columns: [
        {
          title: "名称",
          dataIndex: "name",
          key: "name",
        },
        {
          title: "联系电话",
          dataIndex: "mobile",
          key: "mobile",
        },
        {
          title: "性别",
          dataIndex: "gender",
          key: "gender",
          customRender: ({ text }) => {
            return text === "MALE" ? "男" : "女";
          },
        }
      ],
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "请输入人员名称",
        },
      ],
      selectedKeys: [],
      selectedRows: [],
      selectIndex: 0
    });

    const updateValue = () => {
      emit("update:model", form.value);
    }

    const clickSelectBtn = (index) => {
      state.selectIndex = index
      state.visible = true
      const emergencyFileNoticeObj = props.model.emergencyFileNoticeObjs[index]
      emergencyFileNoticeObj.selectOption = (emergencyFileNoticeObj.selectOption ?? []).filter(e=>emergencyFileNoticeObj.objId.includes(e.value))

      state.selectedKeys = emergencyFileNoticeObj.selectOption.map(e => e.value)
      state.selectedRows = emergencyFileNoticeObj.selectOption.map(e => {
        return {
          id: e.value,
          name: e.label
        }
      })
    };
const selectUser = (selectedKeys, selectedItems) => {
  selectedItems = selectedItems.filter(e => selectedKeys.includes(e.id))
  const index = state.selectIndex
  form.value.emergencyFileNoticeObjs[index].selectOption = selectedItems.map(e => {
    return { label: e.name, value: e.id }
  })
  form.value.emergencyFileNoticeObjs[index].objId = selectedItems.map(e => e.id)
  updateValue()
}

const addNoticeType = (index) => {
  form.value.emergencyFileNoticeObjs.push({
    emergencyFileTypeId: undefined,
    objType: 'USER',
    objId: [],
  })
  updateValue()
}

const delNoticeType = (index, i) => {
  form.value.emergencyFileNoticeObjs.splice(index, 1)
  updateValue()
}

onMounted(async () => {
  fileTypeList().then(res => {
    state.fileTypeOptions = res.map(e => {
      return {
        label: e.name,
        value: e.id
      }
    })
  })
})

watch(() => props.model, () => { form.value = props.model })


return {
  form,
  moduleID,
  noticeBox,
  ...toRefs(state),
  addNoticeType,
  delNoticeType,
  selectUser,
  clickSelectBtn,
  updateValue
};
  },
});
</script>
<style lang="less" scoped>
.title {
  font-family: @fontMedium;
  font-weight: 500;
  font-size: 16px;
}

.person-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;

  :deep(.ant-input-group.ant-input-group-compact) {
    width: 300px;
  }
}
</style>
