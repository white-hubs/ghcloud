<template>
  <div class="channelCard" @click="showUserModal">指定人员手机号加密</div>
  <modal-table title="选择人员" v-model:value="modal.visible" url="tenantUserList" :params="{ enabled: true }"
    :columns="modal.columns" :search="modal.search" :searchLength="3" :width="1300" :selectType="'checkbox'"
    :selectedKeys="userIds ?? []"
    @modal-save="chengUser"></modal-table>
</template>
<script setup>
import { ITEM_CODE } from './service-configuation-config.ts';
import { onMounted, ref } from 'vue';
import { cubeDictionaryService } from '@/api/service'
import { QueryType } from '@ghcloud/cube-dictionary-service'
import { message } from 'ant-design-vue';

const modal = ref({
  visible: false,
  url: "",
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
      slots: {
        customRender: "gender",
      },
      customRender: ({ text }) => {
        const genderValues = {
          MALE: '男',
          FEMALE: '女',
          NONE: '未知'
        }
        return text ? genderValues[text] : '--';
      },
    },
    {
      title: "职位",
      dataIndex: "positions",
      key: "positions",
      slots: {
        customRender: "positions",
      },
      customRender: ({ text }) => {
        if (!text) return '--';
        if (!text.length) return '--';
        const positions = text.map((item) => item.name);
        return positions.join(",");
      },
    },
    {
      title: "工作状态",
      dataIndex: "workStatus",
      key: "workStatus",
      slots: {
        customRender: "workStatus",
      },
      customRender: ({ text }) => {
        const workStatus = {
          REST: '休息',
          WORKING: '在岗',
          LEAVE_POST: '离岗',
          AWAY_BUSINESS: '出差',
          ASK_LEAVE: '请假'
        }
        return text ? workStatus[text] : '--';
      },
    },
  ],
  search: [
    {
      label: "部门",
      value: "organizationId",
      component: "g-select",
      placeholder: "请选择部门",
      url: "getOrganizations",
      field: { id: "value", name: "label", },
    },
    {
      label: "",
      value: "keyword",
      placeholder: "请输入人员名称",
    },
  ],
})
const userIds = ref(null)
const personConfig = ref([])
const chengUser = async (selectedKeys, selectedItems) => {
  try {
    let params = []
    if (selectedKeys.length) {
      params = selectedKeys.map(item => {
        return {
          name: 'true',
          code: ITEM_CODE,
          itemCode: ITEM_CODE,
          remarks: '指定人员手机号加密',
          userId: item
        }
      })
    }
    params.forEach(p => {
      personConfig.value.forEach(u => {
        if (p.userId === u.userId) {
          p.id = u.id
        }
      })
    })
    const data = await cubeDictionaryService.batchUserDictionaryAddOrUpdate(params)
    message.success('操作成功');
  } catch (error) {
    message.error((error)?.errorMessage ?? '操作失败')
  } finally {
    await initData()
  }
};
const showUserModal = () => {
  modal.value.visible = true;
};
const initData = async () => {
  try {
    const userConfig = await cubeDictionaryService.getUserDictionaryList({
      itemCode: ITEM_CODE,
      queryType: QueryType.ALL
    })
    userIds.value = userConfig.length ? userConfig.map(e => e.userId) : null
    personConfig.value = userConfig ?? []
  } catch (error) {
  }
};
onMounted(async () => {
  await initData()
})

</script>
<style scoped lang="less">
.channelBox {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  .channelCard {
    cursor: pointer;
    width: 270px;
    height: 150px;
    margin: 0 50px 20px 0;
    background-color: rgb(242, 242, 242);
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
  }
}
</style>