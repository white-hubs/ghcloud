<template>
  <div style="opacity: 0; height: 0">
    <input type="text" autocomplete="off" />
    <input type="password" />
  </div>
  <gLayout :title="
      RouteInfo.type == 'add'
        ? '群控组-新增'
        : RouteInfo.type == 'edit'
        ? '群控组-编辑'
        : '群控组-详情'
    ">
    <template #content-table>
      <div class="item-title">基本信息</div>
      <Form layout="inline" :model="GroupControlData" ref="gDetailForm">
        <div style="
            display: flex;

            width: 100%;
            height: 53px;
          ">
          <FormItem label="群控组名称:" v-bind="validateInfos.groupControlName">
            <Input placeholder="请输入群控组名称" style="width: 400px" auto-complete="new-password" ref="groupControlNameRef"
              :maxlength="30" :readonly="isreadonly" allowClear v-model:value.trim="GroupControlData.groupControlName"
              @change="changeInputType" :disabled="PathQuery.type == 'check' ? true : false"></Input>
          </FormItem>
          <FormItem label="控制密码:" :style="PathQuery.type == 'check' ? 'margin-left: 250px' : ''">
            <span v-if="PathQuery.type == 'check'">
              <span>
                {{
                eyes
                ? GroupControlData.password.replace(/./g, "*")
                : GroupControlData.password
                }}
              </span>
              <i style="cursor: pointer" class="iconfont"
                :class="eyes ? 'icon-yanjing_yincang' : 'icon-yanjing_xianshi'" @click="setPass"></i>
            </span>
            <InputPassword v-if="PathQuery.type !== 'check'" placeholder="请输入控制密码" :readonly="isreadonly"
              auto-complete="new-password" @change="passchange" :maxlength="30" style="width: 400px"
              :disabled="PathQuery.type == 'check' ? true : false" v-model:value.trim="GroupControlData.password">
            </InputPassword>
          </FormItem>
          <FormItem label="控制密码确认:" v-bind="validateInfos.confirmpass" v-if="PathQuery.type !== 'check'">
            <InputPassword placeholder="控制密码确认" @change="confirmpasschange" :readonly="isreadonly" style="width: 400px"
              :maxlength="30" :disabled="PathQuery.type == 'check' ? true : false"
              v-model:value.trim="GroupControlData.confirmpass"></InputPassword>
          </FormItem>
        </div>
      </Form>
      <div style="
          display: flex;
          justify-content: space-between;
          width: 160px;
          align-items: center;
          margin-bottom: 10px;
        ">
        <div style="margin-right: 10px">照明回路</div>
        <Button size="small" type="primary" @click="addLoop" v-if="PathQuery.type !== 'check'">
          <template #icon><plus-outlined /></template>
          添加回路
        </Button>
      </div>
      <div style="height: calc(100vh - 440px)">
        <Table :columns="columns" :data-source="GroupControlDataList" bordered :scroll="{ y: 380 }" :pagination="false">
          <template #bodyCell="{ column, text, record, index }">
            <template v-if="column.dataIndex === 'index'">
              {{ index + 1 }}
            </template>
            <template v-if="column.dataIndex === 'handle' && PathQuery.type !== 'check'">
              <Popconfirm title="确认删除?" ok-text="确认" cancel-text="取消" @confirm="deleteDevice(record)">
                <a style="color: red">删除</a>
              </Popconfirm>
            </template>
          </template>
        </Table>
      </div>
    </template>
    <template #footer-page>
      <Button @click="goBack">返回</Button>
      <Button v-if="PathQuery.type !== 'check'" type="primary" @click="SaveGroupControl"
        :loading="SaveGroupControlLoading">
        保存
      </Button>
    </template>
  </gLayout>
  <div class="modal">
    <Modal v-model:visible="visible" title="添加回路" ok-text="确认" cancel-text="取消" width="800px" @ok="LoophandleOk">
      <div style="
          width: 450px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        ">
        <!-- <div>控制组名称:</div> -->

        <Input v-model:value.trim="DetailsPagination.keyword" style="width: 300px" placeholder="请输入回路名称" />
        <Button type="primary" @click="addLoop">查询</Button>
        <Button @click="reset">重置</Button>
      </div>
      <Table :scroll="{ y: 480 }" :columns="LoopColumns" :row-selection="rowSelection" :data-source="LoopList"
        :pagination="false" :rowKey="row => row" bordered></Table>
      <div style="overflow: hidden">
        <Pagination :pageSizeOptions="['10', '20', '30', '50']"
          style="z-index: 999; position: absolute; right: 15px; bottom: 61px" show-size-changer
          v-model:current="DetailsPagination.pageNumber" v-model:pageSize="DetailsPagination.pageSize" :showTotal="
            total =>
              `共 ${total} 条   第${DetailsPagination.pageNumber}/${Math.ceil(
                total / DetailsPagination.pageSize,
              )}页`
          " :total="DetailsPagination.total" @change="onShowSizeChange" />
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import {
  Button,
  Form,
  FormItem,
  Input,
  InputPassword,
  Pagination,
  Popconfirm,
  Table,
  TableColumnsType,
  Modal,
  message,
  PaginationProps,
  TablePaginationConfig,
} from "ant-design-vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import gLayout from "@/components/common/gLayout.vue";
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
// Iconfont CSS loaded from resources
// Note: Add <link rel="stylesheet" href="/resource/v1/intelligent-lighting-migrate/iconfont/iconfont.css"> in index.html
// Or import dynamically: import('/resource/v1/intelligent-lighting-migrate/iconfont/iconfont.css')
import Crypto from "@/utils/crypot";
import {
  GetSecurityDevicePage,
  AddGroupControl,
  GetGroupControl,
  PutGroupControl,
  screenHandGroupControl,
} from "~/src/api/gruopControl";
import { Rule } from "ant-design-vue/lib/form/interface";
import { TableRowSelection } from "ant-design-vue/lib/table/interface";
const router = useRouter();
const route = useRoute();
let isreadonly = ref<boolean>(true);
let PathQuery = reactive({
  id: route?.query?.id,
  type: route?.query?.type,
});
/**限制填 */
const changeInputType = () => {};
/**限制密码输入 */
const passchange = (e: any) => {
  GroupControlData.password = e.target.value
    .replace(/[^\w\.\/]/gi, "")
    .replace(/\./g, "");
};
const confirmpasschange = (e: any) => {
  GroupControlData.confirmpass = e.target.value
    .replace(/[^\w\.\/]/gi, "")
    .replace(/\./g, "");
};
// 点击眼睛
let eyes = ref<boolean>(true);
const setPass = () => {
  eyes.value = !eyes.value;
};
const getDetiles = () => {
  GetGroupControl(PathQuery.id).then(res => {
    let { data } = res;

    GroupControlData.groupControlName = data.groupControlName;
    GroupControlData.password = data.password;
    GroupControlData.confirmpass = data.password;
    GroupControlDataList.value = data.deviceDetails.map(
      (dataInfo: {
        groupControlName: string;
        deviceName: string;
        areaName: string;
        id: string;
        deviceId: string;
      }) => {
        return {
          groupControlName: dataInfo.groupControlName,
          deviceName: dataInfo.deviceName,
          areaName: dataInfo.areaName,
          id: dataInfo.id,
          deviceId: dataInfo.deviceId,
        };
      },
    );
  });
};
if (PathQuery.type == "check" || PathQuery.type == "edit") {
  getDetiles();
}
setTimeout(() => {
  isreadonly.value = false;
}, 1000);
/**新增群控组数据字典 */
let GroupControlData = reactive<api.addGroup>({
  deviceDetails: [],
  password: "",
  groupControlName: "",
  confirmpass: "",
  ascription: "INTELLIGENT_LIGHTING",
});
const useForm = Form.useForm;
let validatePass2 = async (_rule: Rule, value: string) => {
  if (value !== GroupControlData.password) {
    return Promise.reject("两次密码不一致");
  } else {
    return Promise.resolve();
  }
};
const { resetFields, validate, validateInfos } = useForm(
  GroupControlData,
  reactive({
    groupControlName: [
      {
        required: true,
        message: "请输入群控组名称",
      },
    ],
    confirmpass: [{ validator: validatePass2, trigger: "change" }],
  }),
);
/**
 * 保存新增群控组
 */
let SaveGroupControlLoading = ref<boolean>(false);
const SaveGroupControl = () => {
  validate().then(async () => {
    SaveGroupControlLoading.value = true;
    let GroupControlDataListString: any = GroupControlDataList.value.map(
      (data: Details.ListType) => {
        return {
          deviceId: data.deviceId,
          areaName: data.areaName,
          deviceName: data.deviceName,
        };
      },
    );
    Object.assign(GroupControlData.deviceDetails, GroupControlDataListString);
    Object.assign(GroupControlData.confirmpass, undefined);
    if (GroupControlDataList.value.length == 0) {
      message.error("至少选择一条回路");
      SaveGroupControlLoading.value = false;
      return;
    }
    if (PathQuery.type == "edit") {
      let { data } = await PutGroupControl(GroupControlData, PathQuery.id);
      if (data.code == 406) {
        message.error(data.message);
        SaveGroupControlLoading.value = false;
        return;
      }
      history.back()
    } else {
      let { data } = await AddGroupControl(GroupControlData);
      SaveGroupControlLoading.value = false;
      if (data.code == 406) {
        message.error(data.message);
        return;
      }
      history.back()
    }

    Object.assign(GroupControlData, {
      deviceDetails: [],
      password: "",
      groupControlName: "",
      confirmpass: "",
      ascription: "INTELLIGENT_LIGHTING",
    });
    GroupControlDataList.value = [];
    message.success("添加群控组成功");
  });
};

const columns: TableColumnsType =
  PathQuery.type == "check"
    ? [
        {
          title: "序号",
          dataIndex: "index",
          align: "center",
          width: "80px",
        },
        {
          title: "回路名称",
          dataIndex: "deviceName",
          align: "center",
        },
        {
          title: "所属区域",
          dataIndex: "areaName",
          align: "center",
          key: "areaName",
        },
      ]
    : [
        {
          title: "序号",
          dataIndex: "index",
          align: "center",
          width: "80px",
        },
        {
          title: "回路名称",
          dataIndex: "deviceName",
          align: "center",
        },
        {
          title: "所属区域",
          dataIndex: "areaName",
          align: "center",
          key: "areaName",
        },
        {
          title: "操作",
          dataIndex: "handle",
          align: "center",
          key: "handle",
        },
      ];
const DetailsPagination = reactive<{
  keyword: string;
  pageNumber: number | undefined;
  pageSize: number;
  total: number | undefined;
  applicationCode: string;
  ids: any;
}>({
  keyword: "",
  pageNumber: 1,
  pageSize: 10,
  total: 0,
  applicationCode: "INTELLIGENT_LIGHTING",
  ids: [],
});

const GroupControlDataList = ref<Details.ListType[]>([]);
/**弹出框操作 */
const visible = ref<boolean>(false);
const LoopList = ref<Details.ListType[]>([]);
const reset = () => {
  DetailsPagination.keyword = "";
  addLoop();
};
const addLoop = async () => {
  DetailsPagination.pageNumber = 1;
  rowselectData.value = [];
  DetailsPagination.ids = GroupControlDataList.value.map((res: any) => {
    return res.deviceId;
  });
  let { data } = await screenHandGroupControl(DetailsPagination);

  LoopList.value = data.records;
  DetailsPagination.total = data.total;

  // LoopList.value

  visible.value = true;
};
/**重置 */

const onShowSizeChange = async (current: number, pageSize: number) => {

  DetailsPagination.pageNumber = current;
  DetailsPagination.pageSize = pageSize;
  let { data } = await screenHandGroupControl(DetailsPagination);
  LoopList.value = data.records;
  DetailsPagination.total = data.total;
};

const LoopColumns: TableColumnsType = [
  {
    title: "回路名称",
    dataIndex: "deviceName",
    align: "center",
    slots: { customRender: "deviceName" },
  },
  {
    title: "所属区域",
    dataIndex: "areaName",
    align: "center",
    key: "areaName",
  },
];
const rowselectData = ref<Details.ListType[]>([]);
const rowSelection = {
  onChange: (selectedRowKeys: any) => {

    let set = [...rowselectData.value, ...selectedRowKeys];
    let map = new Map();
    for (let item of set) {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    }
    rowselectData.value = [...map.values()];
  },
  getCheckboxProps: (record: any) => {
    return {
      disabled:
        GroupControlDataList.value.findIndex(
          res => res.deviceId == record.deviceId,
        ) == -1
          ? false
          : true, // 
    };
  },
};
const LoophandleOk = () => {
  GroupControlDataList.value = [
    ...GroupControlDataList.value,
    ...rowselectData.value,
  ];
  visible.value = false;
};
/**删除设备 */
const deleteDevice = (data: Details.ListType) => {

  GroupControlDataList.value = GroupControlDataList.value.filter((res: any) => {
    return res.id !== data.id;
  });
};
/**地址栏字段 */
let RouteInfo = reactive<{
  type: string;
}>({
  type: "",
});
Object.assign(RouteInfo, useRoute().query);
const goBack = () => {
  history.back()
};
</script>

<style scoped lang="less">
.queryCondition {
  width: 400px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
<style>
.ant-modal-body {
  padding-bottom: 55px;
}
</style>
