<template>
  <a-spin :spinning="currentGroup.type">
    <gLayout title="照明群控" :showfooter="false">
      <template #header-btn></template>
      <template #content-table>
        <div class="lightingList">
          <div
            class="lightingGroup primary-color-before"
            v-for="(item, index) in LightingGroupList"
            v-if="LightingGroupList.length > 0"
            :style="item == undefined ? 'opacity:0;' : 'opacity:1'"
          >
            <div class="header">
              <div>
                <div class="header_name" :title="item?.groupControlName">
                  {{ item?.groupControlName }}
                </div>
                <div style="font-size: 12px; color: #666666">
                  控制数:{{ item?.num }}
                </div>
              </div>
              <div
                style="cursor: pointer"
                @click="ViewLog(item?.groupControlName, item?.id)"
              >
                日志
                <right-outlined style="font-size: 12px" />
              </div>
            </div>
            <div class="GroupContent">
              <Button @click="AllOpen(item, '1')" :disabled="item?.num == 0">
                全开
              </Button>
              <Button
                :disabled="item?.num == 0"
                style="margin-left: 30px"
                @click="AllOpen(item, '0')"
              >
                全关
              </Button>
            </div>
          </div>
          <a-empty v-else style="margin: auto" />
        </div>
        <Pagination
          style="float: right; margin-bottom: 10px"
          show-size-changer
          :pageSizeOptions="['20', '30', '40', '50']"
          v-model:current="GroupControlPagination.current"
          v-model:pageSize="GroupControlPagination.pageSize"
          :total="GroupControlPagination.total"
          :showTotal="
            total =>
              `共 ${total} 条   第${GroupControlPagination.current}/${Math.ceil(
                total / GroupControlPagination.pageSize,
              )}页`
          "
          @change="onShowSizeChange"
        />
      </template>
    </gLayout>
  </a-spin>
  <!-- 日志对话框 -->
  <Modal
    v-model:visible="visible"
    :title="visibleTitle"
    @ok="LoghandleOk"
    okText="确认"
    cancelText="取消"
    width="1000px"
  >
    <Table
      :columns="LogColumns"
      :data-source="logDateList"
      :pagination="false"
    ></Table>
    <div style="overflow: hidden">
      <Pagination
        style="z-index: 999; position: absolute; right: 15px; bottom: 61px"
        show-size-changer
        v-model:current="LogontrolPagination.current"
        v-model:pageSize="LogontrolPagination.pageSize"
        :total="LogontrolPagination.total"
        :showTotal="
          total =>
            `共 ${total} 条   第${LogontrolPagination.current}/${Math.ceil(
              total / LogontrolPagination.pageSize,
            )}页`
        "
        @change="onShowSizeChangeLog"
      />
    </div>
  </Modal>
  <!-- 开关操作对话框
   -->
  <Modal
    v-model:visible="isLockVisible"
    title="照明群控"
    :confirmLoading="!isLockVisible"
    @ok="PasswordHandleOk"
    okText="确认"
    cancelText="取消"
  >
    <div
      style="
        color: #000;
        height: 200px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
      "
    >
      <div style="margin-left: 10px; display: flex">
        群控名称:
        <div
          style="
            margin-left: 15px;

            width: 220px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          "
          :title="LightingData.groupControlName"
        >
          {{ LightingData.groupControlName }}
        </div>
      </div>
      <div style="margin-left: 10px">
        群控动作:
        <span style="margin-left: 15px">
          {{ LightingData.openGate == "1" ? "全开" : "全关" }}
        </span>
      </div>

      <div>
        <Form name="custom-validation" ref="passwordDom" :model="GroupPassword">
          <a-form-item
            label="控制密码"
            name="password"
            :rules="{
              required: true,
              message: '请填写密码',
              trigger: 'change',
            }"
          >
            <a-input
              v-model:value="GroupPassword.password"
              @change="changePass"
              type="password"
            />
          </a-form-item>
        </Form>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import {
  Button,
  Modal,
  Form,
  Table,
  Pagination,
  TableColumnsType,
  TablePaginationConfig,
  PaginationProps,
  message,
} from "ant-design-vue";

import { RightOutlined, QuestionCircleOutlined } from "@ant-design/icons-vue";
import gLayout from "@/components/common/gLayout.vue";
import { ref, onMounted, reactive } from "vue";
import {
  GetGroupControlList,
  GroupControlLogs,
  GroupControlHandle,
  PasswordCheck,
} from "~/src/api/gruopControl";
import Crypto from "@/utils/crypot";
const ErrorImg = '/resource/v1/intelligent-lighting-migrate/assets/error.png'
onMounted(function(){});

/**限制不能输入空格 */
const changePass = (value: any) => {
  GroupPassword.password = value.target.value.replace(/\s+/g, "");
};
/** 群控组数据*/
const GroupControlPagination = reactive<{
  current: number;
  pageSize: number;
  total: number;
}>({
  current: 1,
  pageSize: 20,
  total: 0,
});
const GroupControlList = () => {
  GetGroupControlList({
    keyword: "",
    pageNumber: GroupControlPagination.current,
    pageSize: GroupControlPagination.pageSize,
  }).then(response => {
    let length = response.data.records.length;
    let newarr =
      length > 0
        ? length < 5
          ? new Array(5 - length)
          : new Array(5 - (length % 5))
        : length % 5 == 0
        ? []
        : [];
    // [..., ...newarr];
    LightingGroupList.value = [...response.data.records, ...newarr];


    GroupControlPagination.total = response.data.total;
  });
};
GroupControlList();

const onShowSizeChange = (current: number, pageSize: number) => {
  GroupControlPagination.current = current;
  GroupControlPagination.pageSize = pageSize;
  GroupControlList();
};

let LightingGroupList = ref<Array<LightingGroup.LightingGroupData>>([]);
/**全开全关操作 */
const isLockVisible = ref<boolean>(false);
const LightingData = reactive<LightingGroup.LightingGroupData>({
  groupControlName: "",
  id: "",
  num: 0,
  updateTime: "",
  isLock: false,
});
let passwordDom = ref<any>(null);
const GroupPassword = reactive<{
  password: string;
}>({
  password: "",
});
let currentGroup = reactive<{
  type: any;
  id: string;
}>({
  type: false,
  id: "",
});
const AllOpen = async (
  Info: LightingGroup.LightingGroupData,
  openGate: string,
) => {
  if (Info.isLock) {
    LightingData.openGate = openGate;
    Object.assign(LightingData, Info);
    GroupPassword.password = "";
    isLockVisible.value = Info.isLock;
  } else {
    currentGroup.type = true;
    GroupControlHandle({
      groupControlId: Info.id,
      openGate: openGate,
      applicationCode: "INTELLIGENT_LIGHTING",
    }).then(res => {
      currentGroup.type = !res.data;
      message.success("操作成功");
      isLockVisible.value = false;
    })
  }
  // let data= await GroupControlHandle(Info.id)
};

/**全开or全关对话框 */
const PasswordHandleOk = () => {
  passwordDom.value.validate().then(() => {
    PasswordCheck({
      groupControlId: LightingData.id,
      password: Crypto.encrypt(GroupPassword.password),
    }).then(res => {
      currentGroup.type = true;
      if (res.data) {
        GroupControlHandle({
          groupControlId: LightingData.id,
          openGate: LightingData.openGate,
          applicationCode: "INTELLIGENT_LIGHTING",
        }).then(() => {
          message.success("操作成功");
          GroupPassword.password = "";

          isLockVisible.value = false;
          currentGroup.type = !res.data;
        });
      } else {
        currentGroup.type = false;
        message.error("当前密码不正确");
      }
    });
  });
};
/**
 * 查看日志
 */
const visible = ref<boolean>(false);
const visibleTitle = ref<string>("");
const LogontrolPagination = reactive<{
  current: number;
  pageSize: number;
  total: number;
}>({
  current: 1,
  pageSize: 10,
  total: 0,
});
let logData = ref<string>("");
let logDateList = ref<LightingGroup.LogDataType[]>([]);
const getLogList = async (id: string) => {
  let { data } = await GroupControlLogs(id, {
    pageNumber: LogontrolPagination.current,
    pageSize: LogontrolPagination.pageSize,
  });
  logDateList.value = data.records;
  LogontrolPagination.total = data.total;
};
const ViewLog = async (name: string, id: string) => {
  logData.value = id;
  getLogList(id);
  visibleTitle.value = name;
  visible.value = true;
};

const onShowSizeChangeLog = (current: number, pageSize: number) => {
  LogontrolPagination.current = current;
  LogontrolPagination.pageSize = pageSize;
  getLogList(logData.value);
};
const LoghandleOk = () => {
  visible.value = false;
};
const LogColumns: TableColumnsType = [
  {
    title: "回路名称",
    dataIndex: "deviceName",
    key: "deviceName",
  },
  {
    title: "群控动作",
    dataIndex: "action",
    key: "action",
  },
  {
    title: "执行结果",
    dataIndex: "result",
    key: "result",
  },
];
</script>

<style scoped lang="less">
.lightingList {
  height: calc(100vh - 310px);

  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-content: baseline;
  gap: 16px;

  .lightingGroup {
    width: 318px;
    height: 176px;
    border: 1px solid #e5e8ef;
    border-radius: 4px 4px 0px 0px;
    // margin-top: 20px;
    // margin-left: 1%;
    box-sizing: border-box;
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 70px;
      background: #f5f7fa;
      padding: 0 16px;
      .header_name {
        width: 230px;
        font-size: 14px;
        font-weight: 500;
        overflow: hidden;
        font-weight: bold;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .GroupContent {
      height: 59%;
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 16px;
    }
  }
}
</style>
