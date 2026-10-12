<template>
  <Modal
    v-model:visible="modalVisible"
    title="设备"
    width="900px"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >

    <Form layout="inline" :model="searchForm">
      <FormItem label="设备类型:">
        <Select 
          placeholder="请选择设备类型" 
          v-model:value="searchForm.instrumentType" 
          style="width: 180px" 
          :options="instrumentTypeList" 
          allowClear  
          :field-names="{label: 'categoryName',value: 'categoryCode'}"
        ></Select>
      </FormItem>
      <FormItem>
        <Input 
          v-model:value="searchForm.keyword" 
          placeholder="请输入设备名称或编码" 
          style="width: 200px"
        />
      </FormItem>
      <FormItem>
        <Button type="primary" @click="getData">查询</Button>
      </FormItem>
      <FormItem>
        <Button @click="reset">重置</Button>
      </FormItem>
    </Form>
    <Table
      rowKey="deviceId"
      :data-source="dataSource"
      :columns="columns"
      :row-selection="rowSelection"
      :pagination="false"
      :scroll="{ y: 380 }"
      size="middle"
      :loading="loading"
      style="margin-top: 10px;"
    >
    </Table>
    <div style="display: flex;justify-content: flex-end;margin: 10px 0px;">
      <Pagination 
        @change="pageChange"  
        size="small" 
        :total="pagination.total" 
        :show-total="(total: any) => `共 ${total} 条 第${pagination.current}/${pagination.pages}页`"
        v-model:current="pagination.current"
        v-model:pageSize="pagination.pageSize"
      ></Pagination>
    </div>
    <template #footer>
      <Button key="back" @click="handleCancel">取消</Button>
      <Button key="submit" type="primary" @click="handleConfirm">确定</Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from "vue";
import { Modal, Table } from "ant-design-vue/es";
import type { ColumnProps } from 'ant-design-vue/es/table'
import { DeviceList, ClassifySettingsPage } from "@/api/energyOverview";

type Key = ColumnProps['key'];
interface Props {
  visible?: boolean;
  selectedDeviceIds?: string[];
  selectedDevices?: any[];
}
const props = withDefaults(defineProps<Props>(), {
  visible: false,
  selectedDeviceIds: () => [],
  selectedDevices: () => [],
});

const emit = defineEmits(['update:visible', 'confirm'])

const modalVisible = ref(false)
const loading = ref(false)
const instrumentTypeList = ref([])
const pagination = reactive({
  total: 0,
  pages: 1,
  pageSize: 10,
  current: 1,
})
const dataSource = ref([])
const columns = ref([
  {
    dataIndex: "code",
    title: "设备编码",
    align: 'center',
  },
  {
    dataIndex: "deviceName",
    title: "设备名称",
    align: 'center',
  },
  {
    dataIndex: "instrumentName",
    title: "设备类型",
    align: 'center',
    customRender: ({ text }: { text: string }) => {
      return text || '--';
    },
  },
  {
    dataIndex: "deviceAreaName",
    title: "所在区域",
    align: 'center',
    customRender: ({ text }: { text: string }) => {
      return text || '--';
    },
  },
])
const searchForm = reactive({
  instrumentType: '',
  keyword: "",
});
const selectedList = ref<any[]>([]) // 保存所有已选中的设备对象（跨页）
const selected = ref<Key[]>([]) // 保存所有已选中的设备ID（跨页）
const rowSelection = computed(() => {
  return {
    selectedRowKeys: selected.value,
    onChange: (selectedRowKeys: Key[], selectedRows: any[]) => {
      // 获取当前页的所有设备ID
      const currentPageDeviceIds = dataSource.value.map((item: any) => item.deviceId);
      
      // 更新选中状态：保留其他页的选中项，更新当前页的选中项
      const otherPageSelected = selected.value.filter(
        (id: Key) => !currentPageDeviceIds.includes(id)
      );
      selected.value = [...otherPageSelected, ...selectedRowKeys] as Key[];
      
      // 合并新选中的设备到已选列表，去重
      const newSelectedRows = selectedRows.filter(
        (row: any) => !selectedList.value.some((item: any) => item.deviceId === row.deviceId)
      );
      selectedList.value = [...selectedList.value, ...newSelectedRows];
      
      // 移除取消选中的设备（只移除当前页取消选中的）
      selectedList.value = selectedList.value.filter((item: any) =>
        selected.value.includes(item.deviceId)
      );
    },
    onSelectAll: (isSelected: boolean, selectedRows: any[], changeRows: any[]) => {
      const currentPageDeviceIds = dataSource.value.map((item: any) => item.deviceId);
      
      if (isSelected) {
        // 全选：添加当前页所有设备
        const newSelectedIds = changeRows.map((row: any) => row.deviceId);
        const otherPageSelected = selected.value.filter(
          (id: Key) => !currentPageDeviceIds.includes(id)
        );
        selected.value = [...otherPageSelected, ...newSelectedIds] as Key[];
        
        // 合并设备对象
        const newRows = changeRows.filter(
          (row: any) => !selectedList.value.some((item: any) => item.deviceId === row.deviceId)
        );
        selectedList.value = [...selectedList.value, ...newRows];
      } else {
        // 取消全选：只移除当前页的设备
        const otherPageSelected = selected.value.filter(
          (id: Key) => !currentPageDeviceIds.includes(id)
        );
        selected.value = otherPageSelected as Key[];
        
        // 移除当前页的设备对象
        selectedList.value = selectedList.value.filter(
          (item: any) => !currentPageDeviceIds.includes(item.deviceId)
        );
      }
    },
  };
})

//表格数据
const getData = async () => {
  loading.value = true;
  const obj = {
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
    keyword: searchForm.keyword,
    instrumentType: searchForm.instrumentType,
  };
  try {
    const { data } = await DeviceList(obj);
    dataSource.value = data.records;
    pagination.total = data.total;
    pagination.pages = data.pages;
    
    // 数据加载完成后，确保当前页的选中状态正确
    // selected.value 已经包含了所有已选中的设备ID（跨页的），不需要重新计算
    // 只需要确保当前页的设备对象在 selectedList 中
    const currentPageDeviceIds = data.records.map((item: any) => item.deviceId);
    const currentPageSelectedIds = selected.value.filter((id: Key) =>
      currentPageDeviceIds.includes(id)
    );
    
    // 如果当前页有已选中的设备，确保它们的对象在 selectedList 中
    if (currentPageSelectedIds.length > 0) {
      const currentPageSelectedRows = data.records.filter((item: any) =>
        currentPageSelectedIds.includes(item.deviceId)
      );
      
      // 合并当前页的设备对象到已选列表，去重
      currentPageSelectedRows.forEach((row: any) => {
        if (!selectedList.value.some((item) => item.deviceId === row.deviceId)) {
          selectedList.value.push(row);
        }
      });
    }
  } catch (error) {
  } finally {
    loading.value = false;
  }
};

//重置 
const reset = () => {
  Object.assign(searchForm, {
    instrumentType: '',
    keyword: "",
  });
  pagination.current = 1;
  getData();
}

const pageChange = (current: number, pageSize: number) => {
  pagination.current = current;
  pagination.pageSize = pageSize;
  getData();
}

const handleConfirm = () => {
  // 合并所有已选设备（包括之前传入的和当前页选中的）
  // 先使用之前传入的设备对象（可能不在当前页）
  const allSelectedDevices = props.selectedDevices ? [...props.selectedDevices] : []
  // 然后合并当前页选中的设备，去重
  selectedList.value.forEach((device: any) => {
    if (!allSelectedDevices.some((item: any) => item.deviceId === device.deviceId)) {
      allSelectedDevices.push(device)
    }
  })
  // 最后根据 selected.value 过滤，确保只返回真正选中的设备
  const finalSelectedDevices = allSelectedDevices.filter((device: any) =>
    selected.value.includes(device.deviceId)
  )
  emit('confirm', finalSelectedDevices)
  modalVisible.value = false
}

const handleCancel = () => {
  modalVisible.value = false
}

watch(() => props.visible, (val) => {
  modalVisible.value = val
  if (val) {
    // 如果有已选设备，回显它们
    if (props.selectedDeviceIds && props.selectedDeviceIds.length > 0) {
      selected.value = [...props.selectedDeviceIds] as Key[]
      // 如果有已选设备对象，直接使用它们（包括不在当前页的设备）
      if (props.selectedDevices && props.selectedDevices.length > 0) {
        selectedList.value = [...props.selectedDevices]
      } else {
        selectedList.value = []
      }
    } else {
      selected.value = []
      selectedList.value = []
    }
    getData()
  }
}, { immediate: true, deep: true })

watch(() => modalVisible.value, (val) => {
  emit('update:visible', val)
})

onMounted(async () => {
  const { data } = await ClassifySettingsPage()
  instrumentTypeList.value = data.records;
});
</script>

<style lang="less" scoped>
@import url("@/style/theme/color.less");
</style>

