<template>
  <a-modal v-model:visible="visible" wrapClassName="role-person-modal" title="查看人员" centered="centered" @ok="save"
    @cancel="cancel" width="800px">
    <div class="role-user">
      <div class="pb2">
        <a-form ref="formRef" layout="inline">
          <a-form-item label="姓名">
            <a-input v-model:value="state.keyword" />
          </a-form-item>
          <a-form-item>
            <a-space :size="16">
              <a-button type="primary" @click="onSearch">查询</a-button>
              <a-button type="default" @click="handleReset">重置</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>
      <a-table :columns="columns" :dataSource="state.dataSource" size="small" :pagination="true"></a-table>
    </div>
    <template #footer>
      <a-button key="submit" type="primary" @click="cancel">确定</a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { reactive, toRefs, onMounted, computed, watch } from 'vue';
import { cubeOuaaService } from '@/api/service'
const props = defineProps({
  value: {
    type: Boolean,
    default: false
  },
  roleId: {
    type: String,
    default: ''
  },
})
const emit = defineEmits(['update:value'])
const visible = computed({
  get() {
    return props.value
  },
  set(val) {
    emit('update:value', val)
  }
})
watch(() => visible.value, () => {
  if (visible.value) {
    getData()
  }
})
const getData = async () => {
  const result = await cubeOuaaService.getRoleUserList({
    keyword: state.keyword,
    roleIds: props.roleId
  })
  state.dataSource = result
}
const onSearch = () => {
  getData()
}
const handleReset = () => {
  state.keyword = ''
  getData()
}
const save = () => {
  emit('save')
}
const cancel = () => {
  emit('update:value', false)
}
/**
* 数据部分
*/
const state = reactive({
  dataSource: [],
  keyword: ''
})
const columns = [{
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
  title: "部门",
  dataIndex: "organizations",
  key: "organizations",
  slots: {
    customRender: "organizations",
  },
  customRender: ({ text }) => {
    return text && text.length > 0 ? text.map(e => e.name).join('/') : '--'
  },
},
{
  title: "性别",
  dataIndex: "gender",
  key: "gender",
  slots: {
    customRender: "gender",
  },
  customRender: ({ text }) => {
    const genderValues = {
      MALE: '男',
      FEMALE: '女',
      NONE: '保密'
    }
    return text ? genderValues[text] : '--';
  },
},
]
onMounted(() => {
})
// 使用toRefs解构
// let { } = { ...toRefs(state) } 
defineExpose({
  ...toRefs(state)
})

</script>
<style lang='less'>
.role-user {
  .ant-pagination {
    margin: 0;
    padding: 10px;
  }
}

.role-person-modal {
  .ant-modal-body {
    padding-left: 0;
    padding-right: 0;
    padding-bottom: 0;
  }
}
</style>
<style scoped lang='less'></style>