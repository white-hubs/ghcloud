<template>
  <div class="container">
    <div class='left-list'>
      <div class="list-top">
        <div>字典项</div>
        <a @click="addDict">新增字典项</a>
      </div>
      <div class="list-search">
        <a-input placeholder="请输入" v-model:value="selectKeyword" />
        <a-button type="primary" @click="dictSearch">搜索</a-button>
      </div>
      <div class="list-content">
        <a-list item-layout="vertical" :loading="loading" :data-source="dictItemsDataSource">
          <template #renderItem="{ item }">
            <a-list-item>
              <div :class="['list-item',item.code===selectedDictCode&&'selected']" @click.stop="handleSelectDict(item)">
                <a-popover :content="item.remarks">
                  <div class="item-name">{{ item.remarks }}</div>
                </a-popover>
                <!-- <div class="item-operate">
                  <EditOutlined style="cursor: pointer;" />
                  <a-popconfirm title="确定要删除本条数据嘛?" ok-text="确定" cancel-text="取消">
                    <DeleteOutlined style="color:red;margin-left: 10px;cursor: pointer;" />
                  </a-popconfirm>
                </div> -->
              </div>
            </a-list-item>
          </template>
        </a-list>
      </div>
    </div>
    <a-modal v-model:visible="visible" title="新增字典项" ok-text="确认" cancel-text="取消" @ok="handleConfirm">
      <a-form :labelCol="{
                style: {
                  width: '110px'
                }
              }" ref="formRef" :model="formState" :rules="rules">
        <a-form-item has-feedback label="字典名称" name="remarks">
          <a-input v-model:value="formState.remarks" placeholder="请输入字典名称" type="text" />
        </a-form-item>
        <a-form-item has-feedback label="字典项编码" name="code">
          <a-input v-model:value="formState.code" placeholder="请输入字典项编码" type="text" />
        </a-form-item>
        <a-form-item has-feedback label="变更通知方式" name="changeNotice">
          <a-select mode="multiple" v-model:value="formState.changeNotice" :options="noticeOptions" placeholder="请输入字典项编码"
            type="text" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>

</template>
<script lang='jsx'>
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  ref,
  toRaw,
  onMounted,
} from "vue";
import { tableColumns, timeFormat } from "@/utils/common";
import { enabled, gender } from "@/utils/enumerate";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
export default defineComponent({
  components: {
    EditOutlined,
    DeleteOutlined
  },
  emits: ['changeSelect'],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const formRef = ref()
    const state = reactive({
      selectKeyword: '',
      selectedDictCode: '',
      loading: false,
      dictItemsDataSource: [],
      visible: false,
      noticeOptions: [
        {
          label: 'RocketMQ',
          value: 'ROCKET_MQ'
        }, {
          label: 'redis',
          value: 'REDIS'
        }
      ],
      formState: {
        code: '',
        remarks: '',
        changeNotice: [],
      },
      rules: {
        code: [
          {
            required: true,
            message: '请输入字典编码'
          }
        ],
        remarks: [
          {
            required: true,
            message: '请输入字典名称'
          }
        ]
      }
    });
    let allDict = []
    onMounted(() => {
      getAllDictList()
    });
    const getAllDictList = async () => {
      try {
        state.loading = true
        const result = await proxy.$api.getAllDictLst()
        allDict = result
        state.dictItemsDataSource = result
        if (!result.length) return;
        state.selectedDictCode = result[0].code
        emit('changeSelect', result[0])
      } finally {
        state.loading = false
      }

    }
    const handleConfirm = async () => {
      await formRef.value.validate()
      const payload = {
        ...state.formState,
        changeNotice: state.formState.changeNotice.join(',')
      }
      await proxy.$api.addDictItem(payload)
      proxy.$message.success('新增成功')
      state.visible = false
      getAllDictList()
    }
    const dictSearch = () => {
      state.dictItemsDataSource = allDict.filter(item => item.remarks.includes(state.selectKeyword))
    }
    const addDict = () => {
      state.visible = true
    }
    const handleSelectDict = (item) => {
      state.selectedDictCode = item.code
      emit('changeSelect', item)
    }

    return {
      formRef,
      ...toRefs(state),
      handleConfirm,
      handleSelectDict,
      addDict,
      dictSearch,
    };
  },
});
</script>
<style scoped lang="less">
.container {
  height: 100%;
}

:deep(.content-left) {
  padding-top: 0px !important;
}

.list-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.left-list {
  width: 254px;
  height: 100%;
  background: #fff;
  padding: 12px 12px 12px 6px;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;

  .list-content {
    flex: 1;
    overflow-y: auto;
    margin-top: 12px;

    .selected {
      background-color: #1890ff;
      color: #fff;
    }

    .list-item {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .item-name {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .list-search {
    display: flex;
    flex-shrink: 0;
    gap: 6px;
  }

  :deep(.ant-list-item) {
    text-align: left;
    padding: 4px;
    border-bottom: 0;
    cursor: pointer;
  }
}
</style>