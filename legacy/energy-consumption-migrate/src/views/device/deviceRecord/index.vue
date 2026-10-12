<template>
  <GLayout title="采集读数记录">
    <template #content-left>
      <Spin :spinning="treeLoading">
        <div class="overflow-y-auto w-300px" :style="scrollY ? `height:${scrollY + 120}px` : ''">
          <Tree
            :default-expand-all="true"
            v-model:expandedKeys="expandedKeys"
            v-model:selectedKeys="selectedKeys"
            v-model:checkedKeys="checkedKeys"
            checkable
            :selectable="false"
            :tree-data="treeData"
            :fieldNames="field"
            @check="handleCheck"
          >
          </Tree>
        </div>
      </Spin>
    </template>
    <template #content-table>
      <div class="pt-10px pl-10px">
        <Form class="form-body">
          <FormItem label="仪表类型">
            <Select
              placeholder="请选择仪表类型"
              style="width: 180px"
              v-model:value="queryState.state.instrumentType"
              allowClear
              :options="meterTypeList"
              :field-names="{ label: 'categoryName', value: 'categoryCode' }"
            ></Select>
          </FormItem>
          <FormItem label="时间范围:">
            <RangePicker v-model:value="queryState.state.period" valueFormat="YYYY-MM-DD" :allow-clear="false"></RangePicker>
          </FormItem>
          <FormItem label="设备名称:" style="width: 300px">
            <Input placeholder="请输入设备名称，编号查询" v-model:value="queryState.state.deviceKeyword"></Input>
          </FormItem>
          <FormItem>
            <Button
              type="primary"
              @click="
                () => {
                  queryState.resetPage();
                  queryState.writeCache();
                  getList();
                }
              "
              >查询</Button
            >
            <Button class="ml-10px" style="margin-right: 10px" @click="reset">重置</Button>
            <Button type="primary" style="margin-right: 10px" @click="handleImport">导入</Button>
            <Button type="primary" style="margin-right: 10px" @click="handleExport">导出</Button>

            <Popconfirm
              title="确定要删除选中的数据吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleBatchDelete"
              :disabled="selectedRowKeys.length === 0"
            >
              <Button type="primary" danger :disabled="selectedRowKeys.length === 0" style="margin-right: 10px"> 批量删除 </Button>
            </Popconfirm>
          </FormItem>
        </Form>
        <div style="margin-top: 10px">
          <span style="margin-right: 10px; color: #1890ff"> 已选 {{ selectedRowKeys.length }} 条 </span>
        </div>
        <div class="mt-10px">
          <Table
            :columns="columns"
            :data-source="tableSource"
            :loading="loading"
            :pagination="false"
            :scroll="{ y: scrollY }"
            :row-selection="rowSelection"
            :row-key="(record) => getRecordId(record)"
          >
            <template #bodyCell="{ column, index, record }">
              <template v-if="column.dataIndex === 'action'">
                <Popconfirm title="确定要删除这条数据吗？" ok-text="确定" cancel-text="取消" @confirm="handleDelete(record)">
                  <Button type="link" danger>删除</Button>
                </Popconfirm>
              </template>
              <template v-if="column.dataIndex === 'readValue' && editRow === index">
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px">
                  <InputNumber v-model:value="readValue" placeholder="请输入用量" style="width: 80px"></InputNumber>
                  <Button type="link" @click="updateEdit(record)" style="padding: 0">
                    <CheckOutlined />
                  </Button>

                  <Button type="link" @click="cancelEdit" style="padding: 0">
                    <CloseOutlined />
                  </Button>
                </div>
              </template>
              <template v-else-if="column.dataIndex === 'readValue' && editRow !== index">
                <div
                  style="display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer"
                  @click="edit(index, record)"
                >
                  <span>{{ record.readValue || 0 }}</span>
                  <EditOutlined style="color: #1890ff; font-size: 14px" />
                </div>
              </template>
            </template>
          </Table>
          <Pagination
            class="pagination-footer"
            v-model:current="queryState.state.pageNumber"
            v-model:pageSize="queryState.state.pageSize"
            :show-size-changer="false"
            :show-total="(total) => `共 ${total} 条 第${queryState.state.pageNumber}/${queryState.state.pages}页`"
            :total="queryState.state.total"
            @change="tableChange"
            style="margin-top: 10px; float: right"
          ></Pagination>
        </div>
      </div>
    </template>
  </GLayout>
  <!-- 批量导入弹窗 -->
  <Modal v-model:visible="importVisible" title="批量导入" width="600px" @cancel="cancelImport" :afterClose="cancelImport">
    <div class="import-steps">
      <div class="step-item">
        <span class="step-label">1、选择设备:</span>
        <div class="step-content">
          <Select
            mode="multiple"
            v-model:value="selectedDevices"
            :maxTagCount="3"
            :options="deviceOptions"
            placeholder="请选择设备"
            :field-names="{ label: 'deviceName', value: 'deviceId' }"
            :open="false"
            :showArrow="false"
            style="flex: 1; margin-right: 10px"
            @change="handleDeviceChange"
          >
          </Select>
          <Button type="primary" @click="openDeviceModal">选择</Button>
        </div>
      </div>
      <div class="step-item">
        <span class="step-label">2、下载模板:</span>
        <div class="step-content">
          <a class="template-link" :class="{ disabled: selectedDevices.length === 0 }" @click="downloadTemplate">读数记录模板.xlsx</a>
        </div>
      </div>
      <div class="step-item">
        <span class="step-label">3、按模板填写上传:</span>
        <div class="step-content">
          <Upload :file-list="fileList" :remove="handleRemove" :before-upload="beforeUpload" accept=".xlsx,.xls" :max-count="1">
            <Button type="primary">点击上传</Button>
          </Upload>
        </div>
      </div>
    </div>
    <template #footer>
      <Button key="back" @click="cancelImport">取消</Button>
      <Button key="submit" type="primary" @click="handleImportSubmit" :disabled="fileList.length === 0" :loading="importLoading"
        >导入</Button
      >
    </template>
  </Modal>
  <!-- 设备选择弹窗 -->
  <DeviceSelectModal
    v-model:visible="deviceModalVisible"
    :selected-device-ids="selectedDevices"
    :selected-devices="deviceOptions"
    @confirm="handleDeviceSelect"
  />
  <!-- 导入结果弹窗 -->
  <Modal v-model:visible="importResultVisible" title="导入结果" width="600px">
    <div class="import-result">
      <div class="result-summary">
        <span
          >成功<span class="success-count">{{ importResult.successCount || 0 }}</span
          >条, 失败<span class="fail-count">{{ importResult.failCount || 0 }}</span
          >条</span
        >
      </div>
      <div v-if="importResult.errorList && importResult.errorList.length > 0" class="fail-table">
        <Table :columns="failColumns" :data-source="importResult.errorList" :pagination="false" size="small"> </Table>
      </div>
    </div>
    <template #footer>
      <Button type="primary" @click="closeImportResult">我知道了</Button>
    </template>
  </Modal>
</template>
<script setup lang="ts">
import { CheckOutlined, EditOutlined, CloseOutlined } from "@ant-design/icons-vue";
import { message, Modal, Upload, Popconfirm } from "ant-design-vue/es";
import type { UploadFile } from "ant-design-vue/es";
import { type ColumnsType } from "ant-design-vue/es/table/Table";
import dayjs from "dayjs";
import { computed, onMounted, ref } from "vue";
import * as XLSX from "xlsx";

import { useCubeQueryState } from "@ghcloud/cube-app-design";

import DeviceSelectModal from "./components/device-select-modal.vue";
import {
  ClassifySettingsPage,
  ReadRecordPage,
  ReadRecordUpdate,
  ReadRecordDelete,
  readLogExport,
  readRecordTemplateExport,
  readRecordImport,
  DeviceList,
} from "@/api/energyOverview";
import { getAreaList } from "@/api/record";
import GLayout from "@/components/common/gLayout.vue";
import { treeAddLevel } from "@/utils/common";

const queryState = useCubeQueryState({
  storage: "url",
  initialState: {
    instrumentType: undefined as string | undefined,
    areaIds: "",
    deviceKeyword: "",
    period: [] as unknown as [string, string],
    pageNumber: 1,
    pageSize: 10,
    total: 0,
    pages: 1,
  },
  cacheFields: ["instrumentType", "areaIds", "deviceKeyword", "period", "pageNumber", "pageSize"],
  resolveValue: (field, raw) => {
    if (field === "pageNumber" || field === "pageSize" || field === "pages") return Number(raw);
    return raw;
  },
});

const scrollY = ref<number>(200);
const scrollHandle = () => {
  let tableHeight = 0;
  const clientHeight = document.querySelector(".content-table")?.clientHeight;
  if (clientHeight) {
    tableHeight = clientHeight - 220;
  }
  scrollY.value = tableHeight;
};
onMounted(async () => {
  // 设置表格滚动
  scrollHandle();
  window.addEventListener("resize", function () {
    scrollHandle();
  });
});
const field = {
  key: "id",
  title: "areaName",
  children: "children",
};
// 获取当月开始和结束日期
const getCurrentMonthRange = (): [string, string] => {
  const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
  const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");
  return [startOfMonth, endOfMonth];
};

const readValue = ref("");
const loading = ref(true);
const tableSource = ref([]);
const expandedKeys = ref([]);
const selectedKeys = ref([]);
const treeData = ref([]);
const checkedKeys = ref([]);
const treeLoading = ref(false);
const meterTypeList = ref([]);
// 表格选中相关
const selectedRowKeys = ref<string[]>([]);
const selectedRows = ref<any[]>([]);
const allSelectedRows = ref<any[]>([]); // 保存全量选中数据（跨页）
const columns: ColumnsType = [
  {
    title: "序号",
    dataIndex: "sort",
    slots: {
      customRender: "sort",
    },
    customRender: ({ index }) => {
      return index + 1;
    },
    width: 60,
  },
  {
    title: "设备编码",
    dataIndex: "deviceCode",
    ellipsis: true,
    align: "center",
    customRender: ({ text }) => {
      return text == "" ? "--" : text;
    },
    width: 100,
  },
  {
    title: "设备名称",
    dataIndex: "deviceName",
    ellipsis: true,
    align: "center",
    customRender: ({ text }) => {
      return text == "" ? "--" : text;
    },
    width: 100,
  },
  {
    title: "上期抄表时间",
    dataIndex: "preDateTime",
    ellipsis: true,
    align: "center",
    customRender: ({ text }) => {
      return text;
    },
    width: 120,
  },
  {
    title: "上次抄表数",
    dataIndex: "preReadValue",
    ellipsis: true,
    align: "center",
    customRender: ({ text }) => {
      return text;
    },
    width: 100,
  },
  {
    title: "本期抄表时间",
    dataIndex: "curDateTime",
    ellipsis: true,
    align: "center",
    customRender: ({ text }) => {
      return text;
    },
    width: 120,
  },
  {
    title: "抄表值",
    dataIndex: "readValue",
    align: "center",
    customRender: ({ text }) => {
      return text;
    },
    width: 140,
  },
  {
    title: "用量",
    dataIndex: "usage",
    ellipsis: true,
    align: "center",
    customRender: ({ text }) => {
      return text;
    },
    width: 100,
  },
  {
    dataIndex: "action",
    title: "操作",
    fixed: "right",
    width: 120,
    ellipsis: true,
  },
];
const tableChange = (current: number, pageSize: number) => {
  queryState.setPage(current || 1, pageSize);
  getList();
};
const handleCheck = (value: any) => {
  queryState.state.pageNumber = 1;
  queryState.state.areaIds = value.join(",");
  getList();
};
const getTreeData = async () => {
  treeLoading.value = true;
  const { data } = await getAreaList({});
  treeData.value = treeAddLevel(data, "level");
  treeLoading.value = false;
};
const getInstrumentType = async () => {
  const { data } = await ClassifySettingsPage();
  meterTypeList.value = data.records;
};
const reset = () => {
  queryState.clearCache();
  queryState.update({
    instrumentType: undefined,
    areaIds: "",
    deviceKeyword: "",
    period: getCurrentMonthRange(),
  });
  queryState.resetPage();
  getList();
};
const getList = async () => {
  loading.value = true;
  const { data } = await ReadRecordPage({
    areaIds: queryState.state.areaIds,
    deviceKeyword: queryState.state.deviceKeyword,
    pageSize: queryState.state.pageSize,
    pageNumber: queryState.state.pageNumber,
    instrumentType: queryState.state.instrumentType,
    period: queryState.state.period.join(",") === "," ? "" : queryState.state.period.join(","),
  });
  tableSource.value = data.records;
  queryState.state.total = data.total;
  queryState.state.pages = data.pages;
  loading.value = false;
  editRow.value = -1;
  // 数据更新后，清理无效的选中状态（移除不存在的行的选中）
  if (selectedRowKeys.value.length > 0) {
    const currentPageIds = data.records.map((item: any) => getRecordId(item));
    // 只保留当前页存在的选中keys
    selectedRowKeys.value = selectedRowKeys.value.filter((key: string) => {
      // 如果key在当前页，保留；如果不在当前页，检查是否在全量选中数据中
      if (currentPageIds.includes(key)) {
        return true;
      }
      // 检查是否在全量选中数据中（跨页选中）
      return allSelectedRows.value.some((item: any) => getRecordId(item) === key);
    });
  }
};
const editRow = ref(-1);
//生成记录唯一ID（deviceId + curDateTime）
const getRecordId = (record: any): string => {
  if (!record) return "";
  const deviceId = record.deviceId || "";
  const curDateTime = record.curDateTime || record.curTime || "";
  // 确保返回有效的ID，如果都为空则使用临时ID作为fallback
  if (!deviceId && !curDateTime) {
    return `temp_${Date.now()}_${Math.random()}`;
  }
  return `${deviceId}_${curDateTime}`;
};
//打开编辑
const edit = (index: number, record: any) => {
  editRow.value = index;
  readValue.value = record.readValue ? record.readValue : "";
};
//取消编辑
const cancelEdit = () => {
  editRow.value = -1;
  readValue.value = "";
};
//提交编辑
const updateEdit = async (record: any) => {
  await ReadRecordUpdate({ ...record, readValue: readValue.value });
  message.success("操作成功");
  editRow.value = -1;
  readValue.value = "";
  getList();
};
//删除单条记录
const handleDelete = async (record: any) => {
  try {
    // 构建删除参数：dateRangeList格式
    const dateRangeList = [
      {
        time: record.curDateTime || record.curTime || record.preDateTime || "", // 使用本期抄表时间
        deviceId: record.deviceId || Number(record.deviceId) || 0, // 设备ID
      },
    ];
    await ReadRecordDelete(dateRangeList);
    message.success("删除成功");
    // 从全量选中数据中移除（使用组合ID）
    const recordId = getRecordId(record);
    allSelectedRows.value = allSelectedRows.value.filter((item: any) => getRecordId(item) !== recordId);
    selectedRowKeys.value = selectedRowKeys.value.filter((id: string) => id !== recordId);
    getList();
  } catch (error) {
    message.error("删除失败");
  }
};
//批量删除
const handleBatchDelete = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning("请选择要删除的数据");
    return;
  }
  try {
    // 从全量选中数据中构建删除参数
    const dateRangeList = allSelectedRows.value.map((record: any) => ({
      time: record.curDateTime || record.curTime || record.preDateTime || "", // 使用本期抄表时间
      deviceId: record.deviceId || Number(record.deviceId) || 0, // 设备ID
    }));
    await ReadRecordDelete(dateRangeList);
    message.success("批量删除成功");
    // 清空选中状态
    selectedRowKeys.value = [];
    selectedRows.value = [];
    allSelectedRows.value = [];
    getList();
  } catch (error) {
    message.error("批量删除失败");
  }
};
//表格行选择配置
const rowSelection = computed(() => {
  return {
    selectedRowKeys: selectedRowKeys.value.filter((key: string) => {
      // 确保key在当前页存在，或者在全量选中数据中
      const currentPageIds = tableSource.value.map((item: any) => getRecordId(item));
      if (currentPageIds.includes(key)) {
        return true;
      }
      return allSelectedRows.value.some((item: any) => getRecordId(item) === key);
    }),
    onChange: (keys: string[], rows: any[]) => {
      // 更新当前页选中
      selectedRows.value = rows;

      // 更新全量选中数据
      // 先移除当前页的数据（避免重复）
      const currentPageIds = tableSource.value.map((item: any) => getRecordId(item));
      allSelectedRows.value = allSelectedRows.value.filter((item: any) => !currentPageIds.includes(getRecordId(item)));
      // 然后添加当前页新选中的数据
      allSelectedRows.value = [...allSelectedRows.value, ...rows];
      // 更新选中keys（包含所有页面的选中）
      selectedRowKeys.value = allSelectedRows.value.map((item: any) => getRecordId(item)).filter((id: string) => id);
    },
    onSelectAll: (selected: boolean, selectedRows: any[], changeRows: any[]) => {
      if (selected) {
        // 全选：添加当前页所有数据到全量选中
        const currentPageIds = tableSource.value.map((item: any) => getRecordId(item));
        allSelectedRows.value = allSelectedRows.value.filter((item: any) => !currentPageIds.includes(getRecordId(item)));
        allSelectedRows.value = [...allSelectedRows.value, ...selectedRows];
        selectedRowKeys.value = allSelectedRows.value.map((item: any) => getRecordId(item)).filter((id: string) => id);
      } else {
        // 取消全选：从全量选中中移除当前页数据
        const currentPageIds = tableSource.value.map((item: any) => getRecordId(item));
        allSelectedRows.value = allSelectedRows.value.filter((item: any) => !currentPageIds.includes(getRecordId(item)));
        selectedRowKeys.value = allSelectedRows.value.map((item: any) => getRecordId(item)).filter((id: string) => id);
      }
    },
  };
});
//前端导出Excel（使用xlsx第三方库）
const exportToExcel = async (data: any[], fileName: string) => {
  if (data.length === 0) {
    message.warning("没有可导出的数据");
    return;
  }

  try {
    // 动态导入xlsx库

    // 格式化时间为 YYYY/M/D H:MM 格式
    const formatDateTime = (dateStr: string) => {
      if (!dateStr || dateStr === "--") return "--";
      try {
        const date = dayjs(dateStr);
        if (!date.isValid()) return dateStr;
        return date.format("YYYY/M/D H:mm");
      } catch {
        return dateStr;
      }
    };

    // 准备表头
    const headers = ["序号", "设备编码", "设备名称", "上期抄表时间", "上次抄表数", "本期抄表时间", "抄表值", "用量"];

    // 准备数据
    const worksheetData = data.map((item: any) => {
      return {
        序号: item.deviceId ? item.deviceId.toString() : "",
        设备编码: item.deviceCode !== undefined && item.deviceCode !== null && item.deviceCode !== "" ? item.deviceCode : "--",
        设备名称: item.deviceName !== undefined && item.deviceName !== null && item.deviceName !== "" ? item.deviceName : "--",
        上期抄表时间: formatDateTime(item.preDateTime),
        上次抄表数: item.preReadValue !== undefined && item.preReadValue !== null ? item.preReadValue : "--",
        本期抄表时间: formatDateTime(item.curDateTime),
        抄表值: item.readValue !== undefined && item.readValue !== null ? item.readValue : "--",
        用量: item.usage !== undefined && item.usage !== null ? item.usage : "--",
      };
    });

    // 创建工作簿
    const workbook = XLSX.utils.book_new();

    // 创建工作表（使用json_to_sheet，会自动处理表头）
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // 设置列宽
    worksheet["!cols"] = [
      { wch: 15 }, // 序号
      { wch: 20 }, // 设备编码
      { wch: 20 }, // 设备名称
      { wch: 20 }, // 上期抄表时间
      { wch: 15 }, // 上次抄表数
      { wch: 20 }, // 本期抄表时间
      { wch: 15 }, // 抄表值
      { wch: 15 }, // 用量
    ];

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // 导出文件
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    message.success("导出成功");
  } catch (error) {
    message.error("导出失败，请确保已安装xlsx库（运行: bun add xlsx）");
  }
};

//导出=========================================================================================================================================================
const handleExport = async () => {
  if (!queryState.state.period[0] || !queryState.state.period[1]) {
    message.warning("请选择时间范围");
    return;
  }

  // 如果有选中的数据，使用前端导出
  if (selectedRowKeys.value.length > 0 && allSelectedRows.value.length > 0) {
    exportToExcel(allSelectedRows.value, "采集读数记录");
    return;
  }

  // 如果没有选中数据，使用后端导出
  if (tableSource.value.length === 0) {
    message.warning("未查询到数据，无法导出");
    return;
  }
  const exportData = ref();
  const exportTitle = ref();
  //导出
  const param = {
    areaIds: queryState.state.areaIds,
    instrumentType: queryState.state.instrumentType,
    period: queryState.state.period.join(","),
    deviceKeyword: queryState.state.deviceKeyword,
  };
  const { data } = await readLogExport(param);
  exportData.value = data;
  exportTitle.value = "采集读数记录.xlsx";
  //生成excel
  const link = document.createElement("a");
  const blob = new Blob([exportData.value], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  link.style.display = "none";
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", exportTitle.value);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
//导入相关=========================================================================================================================================================
const importVisible = ref(false);
const deviceModalVisible = ref(false);
const selectedDevices = ref<string[]>([]);
const deviceOptions = ref<any[]>([]);
const fileList = ref<UploadFile[]>([]);
const importLoading = ref(false);
const importResultVisible = ref(false);
const importResult = ref<{
  successCount: number;
  failCount: number;
  errorList: Array<{
    errorRow: number;
    errorMsg: string;
  }>;
}>({
  successCount: 0,
  failCount: 0,
  errorList: [],
});
const failColumns = [
  {
    title: "失败excel行数",
    dataIndex: "errorRow",
    key: "errorRow",
    align: "center",
    width: 150,
  },
  {
    title: "失败原因",
    dataIndex: "errorMsg",
    key: "errorMsg",
    align: "center",
  },
];

const handleImport = () => {
  importVisible.value = true;
  selectedDevices.value = [];
  deviceOptions.value = [];
  fileList.value = [];
};

const cancelImport = () => {
  importVisible.value = false;
  selectedDevices.value = [];
  deviceOptions.value = [];
  fileList.value = [];
};

const openDeviceModal = () => {
  deviceModalVisible.value = true;
};

const handleDeviceSelect = (devices: any[]) => {
  deviceOptions.value = devices;
  selectedDevices.value = devices.map((d: any) => d.deviceId);
  deviceModalVisible.value = false;
};

const handleDeviceChange = (value: string[]) => {
  deviceOptions.value = deviceOptions.value.filter((d: any) => value.includes(d.deviceId));
};

const downloadTemplate = async () => {
  if (selectedDevices.value.length === 0) {
    message.warning("请先选择设备");
    return;
  }
  try {
    const param = {
      deviceIdList: selectedDevices.value,
    };
    const { data } = await readRecordTemplateExport(param);
    const link = document.createElement("a");
    const blob = new Blob([data as BlobPart], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    link.style.display = "none";
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "读数记录模板.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("模板下载成功");
  } catch (error) {
    message.error("模板下载失败");
  }
};

const handleRemove = (file: UploadFile) => {
  const index = fileList.value.indexOf(file);
  const newFileList = fileList.value.slice();
  newFileList.splice(index, 1);
  fileList.value = newFileList;
};

const beforeUpload = (file: UploadFile) => {
  // 只允许上传一个文件，新文件直接替换旧文件
  fileList.value = [file];
  return false;
};

const handleImportSubmit = async () => {
  if (fileList.value.length === 0) {
    message.warning("请选择要上传的文件");
    return;
  }
  try {
    importLoading.value = true;
    const formData = new FormData();
    formData.append("file", fileList.value[0] as any);
    // formData.append('deviceIds', selectedDevices.value.join(','))
    const { data } = await readRecordImport(formData);
    // 处理返回结果
    if (data) {
      // 处理错误列表，使用实际返回的字段名
      const errorList = data.errorList || [];
      const failCount = errorList.length;
      importResult.value = {
        successCount: data.successCount || 0,
        failCount: failCount,
        errorList: errorList,
      };
      // 关闭导入弹窗
      cancelImport();
      // 显示结果弹窗
      importResultVisible.value = true;
      // 如果有成功的数据，刷新列表
      if (importResult.value.successCount > 0) {
        getList();
      }
    } else {
      message.success("导入成功");
      cancelImport();
      getList();
    }
  } catch (error: any) {
    // 如果错误响应中包含结果数据，也展示结果
    if (error?.response?.data?.data) {
      const resultData = error.response.data.data;
      // 处理错误列表，使用实际返回的字段名
      const errorList = resultData.errorList || [];
      const failCount = errorList.length;
      importResult.value = {
        successCount: resultData.successCount || 0,
        failCount: failCount,
        errorList: errorList,
      };
      cancelImport();
      importResultVisible.value = true;
      if (importResult.value.successCount > 0) {
        getList();
      }
    } else {
      message.error("导入失败");
    }
  } finally {
    importLoading.value = false;
  }
};
const closeImportResult = () => {
  importResultVisible.value = false;
  importResult.value = {
    successCount: 0,
    failCount: 0,
    errorList: [],
  };
};

onMounted(() => {
  getTreeData();
  getList();
  getInstrumentType();
});
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");

.import-steps {
  .step-item {
    margin-bottom: 20px;
    display: flex;
    align-items: flex-start;

    .step-label {
      min-width: 120px;
      display: inline-block;
      margin-right: 10px;
    }

    .step-content {
      flex: 1;
      display: flex;
      align-items: center;

      .template-link {
        color: #1890ff;
        cursor: pointer;
        text-decoration: underline;

        &:hover {
          color: #40a9ff;
        }

        &.disabled {
          color: #bfbfbf;
          cursor: not-allowed;
          text-decoration: none;

          &:hover {
            color: #bfbfbf;
          }
        }
      }
    }
  }
}

.import-result {
  .result-summary {
    margin-bottom: 20px;
    font-size: 14px;

    .success-count {
      color: #52c41a;
      font-weight: bold;
      margin: 0 4px;
    }

    .fail-count {
      color: #ff4d4f;
      font-weight: bold;
      margin: 0 4px;
    }
  }

  .fail-table {
    margin-top: 20px;
  }
}
.form-body {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  .energy-form-item {
    margin-bottom: 0;
  }
}
.pagination-footer {
  position: fixed;
  bottom: 20px;
  right: 20px;
}
</style>
