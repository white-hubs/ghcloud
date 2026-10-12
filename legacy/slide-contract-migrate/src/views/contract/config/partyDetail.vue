<template>
  <g-layout title="甲方信息">
    <template #content-search>
      <g-detail-form
        :formList="formList"
        :api="api"
        :rules="rules"
        ref="formRef"
      ></g-detail-form>
    </template>
    <template #content-table>
      <div class="group-partition">
        <div class="add-btn">
          <a-button
            type="primary"
            @click="addTable"
            v-if="route.query.type !== 'detail'"
            >新增</a-button
          >
        </div>
        <a-table
          :columns="columns"
          :data-source="dataSource"
          :rowKey="(record) => record.id"
          size="middle"
          :pagination="false"
        >
          <template #name="{ text, record }">
            <div>
              <a-input
                v-if="editableData[record.id]"
                v-model:value.trim="editableData[record.id].name"
                style="margin: -5px 0"
                placeholder="输入签约人"
              />
              <template v-else>
                {{ text }}
              </template>
            </div>
          </template>
          <template #remark="{ text, record }">
            <div>
              <a-input
                v-if="editableData[record.id]"
                v-model:value="editableData[record.id].remark"
                style="margin: -5px 0"
                maxlength="30"
                placeholder="输入备注,不超过30个汉字"
              />
              <template v-else>
                {{ text ? text : "--" }}
              </template>
            </div>
          </template>
          <template #enabled="{ record }">
            <a-switch
              v-model:checked="editableData[record.id].enabled"
              v-if="editableData[record.id]"
              key="editableData"
              checked-children="启用"
              un-checked-children="禁用"
            ></a-switch>
            <a-switch
              v-model:checked="record.enabled"
              key="record"
              disabled
              checked-children="启用"
              un-checked-children="禁用"
              v-else
            ></a-switch>
          </template>
          <template
            #operation="{ record }"
            v-if="route.query.type !== 'detail'"
          >
            <div class="editable-row-operations">
              <span v-if="editableData[record.id]">
                <a @click="saveRecord(record.id)">保存</a>
                <a-popconfirm
                  title="是否确定取消?"
                  @confirm="cancelRecord(record.id)"
                >
                  <a>取消</a>
                </a-popconfirm>
              </span>
              <span v-else>
                <a @click="editRecord(record.id)">编辑</a>
                <a-popconfirm
                  title="是否确定删除?"
                  @confirm="deleteRecord(record.id)"
                >
                  <a class="deleteRow">删除</a>
                </a-popconfirm>
              </span>
            </div>
          </template>
        </a-table>
      </div>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
      <a-button
        @click="submit"
        type="primary"
        v-if="route.query.type !== 'detail'"
        >保存</a-button
      >
    </template>
  </g-layout>
</template>

<script lang="jsx">
import {
  defineComponent,
  ref,
  reactive,
  getCurrentInstance,
  createVNode,
  toRefs,
} from "vue";
import { cloneDeep } from "lodash-es";
import { useRoute, useRouter } from "vue-router";
import { isPhoneNum } from "@/utils/validator.js";
export default defineComponent({
  setup() {
    const formRef = ref();
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const state = reactive({
      formList: [
        {
          title: "甲方公司信息",
          form: [
            {
              label: "甲方名称",
              value: "name",
            },
            {
              label: "联系人",
              value: "liaison",
            },
            {
              label: "联系人手机",
              value: "phone",
            },
            {
              label: "甲方地址",
              value: "address",
            },
            {
              label: "启用状态",
              value: "enabled",
              component: "a-switch",
              defaultValue: true,
              detailFun: (f) => (f ? "启用" : "禁用"),
            },
            {
              label: "备注说明",
              value: "remark",
              component: "a-textarea",
              maxlength: 200,
            },
          ],
        },
        {
          title: "甲方签约人信息",
        },
      ],
      api: {
        detail: "getParty",
      },
      rules: {
        name: [
          {
            required: true,
            message: "请输入甲方名称",
            trigger: "blur",
          },
        ],
        liaison: [
          {
            required: true,
            message: "请输入联系人",
            trigger: "blur",
          },
        ],
        phone: [
          {
            required: true,
            message: "请输入正确手机号",
            trigger: "blur",
            pattern: new RegExp(/^1[3|4|5|6|7|8|9][0-9]{9}$/, "g"),
          },
        ],
        address: [
          {
            required: true,
            message: "请输入甲方地址",
            trigger: "blur",
          },
        ],
      },
    });
    const checkPhone = async (rule, value) => {
      if (!value) {
        return Promise.reject("请输入联系人手机号");
      }
      if (isPhoneNum(value)) {
        return Promise.resolve();
      } else {
        return Promise.reject("输入不正确");
      }
    };
    const dataSource = ref([]);
    const columns = [
      {
        title: "签约人",
        dataIndex: "name",
        width: "25%",
        slots: {
          customRender: "name",
        },
      },
      {
        title: "启用状态",
        dataIndex: "enabled",
        width: "15%",
        slots: {
          customRender: "enabled",
        },
      },
      {
        title: "备注说明",
        dataIndex: "remark",
        width: "40%",
        slots: {
          customRender: "remark",
        },
      },
      {
        title: "操作",
        dataIndex: "operation",
        slots: {
          customRender: "operation",
        },
      },
    ];
    const editableData = reactive({});
    if (route.query.id) {
      proxy.$api.getParty( route.query.id).then((res) => {
        dataSource.value = res.partySignatoryVOS;
      });
    }
    const addTable = () => {
      const id = Math.random();
      const data = {
        name: "",
        enabled: true,
        remark: "",
        id: id,
        status: "new",
      };
      dataSource.value.push(data);
      editableData[id] = data;
    };

    const editRecord = (key) => {
      editableData[key] = cloneDeep(
        dataSource.value.filter((item) => key === item.id)[0]
      );
    };

    const saveRecord = (key) => {
      if (!editableData[key].name) {
        proxy.$message.warning("签约人不能为空");
        return;
      }
      editableData[key].status = "old";
      Object.assign(
        dataSource.value.filter((item) => key === item.id)[0],
        editableData[key]
      );
      delete editableData[key];
    };

    const cancelRecord = (key) => {
      if (!editableData[key].name || editableData[key].status === "new") {
        deleteRecord(editableData[key].id);
        return;
      }
      delete editableData[key];
    };
    const deleteRecord = (key) => {
      dataSource.value.splice(
        dataSource.value.findIndex((item) => item.id === key),
        1
      );
    };
    const goBack = () => {
      history.back();
    };
    const submit = () => {
      formRef.value.formRef
        .validate()
        .then(() => {
          if (dataSource.value.length === 0) {
            proxy.$message.warn("请添加签约人");
            return;
          }
          const data = {
            name: formRef.value.form.name,
            liaison: formRef.value.form.liaison,
            phone: formRef.value.form.phone,
            address: formRef.value.form.address,
            enabled: formRef.value.form.enabled
              ? formRef.value.form.enabled
              : false,
            remark: formRef.value.form.remark,
            id: formRef.value.form.id,
            signatoryModifyParams: dataSource.value,
          };
          if (route.query.id) {
            proxy.$api.putParty( data).then((res) => {
              proxy.$message.success("操作成功");
              goBack();
            });
          } else {
            proxy.$api.postParty( data).then((res) => {
              proxy.$message.success("操作成功");
              goBack();
            });
          }
        })
        .catch((error) => {
        });
    };
    return {
      formRef,
      ...toRefs(state),
      dataSource,
      columns,
      editableData,
      route,
      addTable,
      editRecord,
      saveRecord,
      cancelRecord,
      deleteRecord,
      submit,
      goBack,
    };
  },
});
</script>

<style lang="less" scoped>


.editable-row-operations a {
  margin-right: 8px;
}

.add-btn {
  text-align: right;
  margin-bottom: 10px;
}
</style>
