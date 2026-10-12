import { ref, unref, reactive, defineComponent, computed, onMounted, type PropType } from "vue";
import { Modal, Form, Cascader, Input, Button, Table } from '@ghcloud/cube-ui';
import { cubeDeviceCenterService } from "../../../api/service"
import type { ProductIotCategoryTree, DeviceInstancePage } from '@ghcloud/cube-iot-center-service'
import './repair-device-associated.less';

interface SearchFormState {
  prodCategoryCode: string[];
  keyword: string;
}

interface PaginationState {
  showTotal: (total: number) => string;
  total: number;
  position: string;
  pageSize: number;
  current: number;
}

// 定义表格列的接口
interface TableColumn {
  dataIndex: string;
  title: string;
  width?: number;
  customRender?: (params: { record: DeviceInstancePage; }) => JSX.Element | string;
}

interface TableState {
  dataSource: DeviceInstancePage[];
  selectedRowKeys: string[];
  selectedRows: DeviceInstancePage[];
  allList: DeviceInstancePage[];
  selected?: DeviceInstancePage[];
  pagination: PaginationState;
  columns: TableColumn[];
}

export const RepairDeviceAssociationModal = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    rowKey: {
      type: String,
      default: 'id'
    },
    columns: {
      type: Array as PropType<TableColumn[]>,
      default: () => []
    },
  },
  emits: ['close'],
  setup (props, { emit }) {
    const searchForm = reactive<SearchFormState>({
      prodCategoryCode: [],
      keyword: "",
    });

    const spinning = ref<boolean>(false);
    const selectAll = ref<boolean>(false);
    const show = ref<boolean>(false);
    const options = ref<ProductIotCategoryTree[]>([]);

    const state = reactive<TableState>({
      dataSource: [],
      selectedRowKeys: [],
      selectedRows: [],
      allList: [],
      pagination: {
        showTotal: (total: number): string =>
          `共 ${total} 条   第${state.pagination.current}/${Math.ceil(
            total / state.pagination.pageSize
          )}页`,
        total: 0,
        position: "bottom",
        pageSize: 10,
        current: 1,
      },
      columns: [
        {
          dataIndex: "code",
          title: "设备编码",
        },
        {
          dataIndex: "name",
          title: "设备名称",
        },
        {
          dataIndex: "genreName",
          title: "产品品类",
          customRender: ({ record }: { record: DeviceInstancePage; }): string => {
            return record.productInfo?.productCategory.name ?? '--';
          },
        },
        {
          dataIndex: "modelName",
          title: "设备型号",
          customRender: ({ record }: { record: DeviceInstancePage; }): string => {
            return record.productInfo?.modelName ?? '--';
          },
        },
        {
          dataIndex: "brandName",
          title: "设备品牌",
          customRender: ({ record }: { record: DeviceInstancePage; }): string => {
            return record.productInfo?.brandName ?? '--';
          },
        },
        {
          dataIndex: "areaName",
          title: "所属区域",
          width: 200,
          customRender: ({ record }: { record: DeviceInstancePage; }): string => {
            return record?.area?.pathName ?? '--';
          },
        },
      ],
    });

    const modalVisible = computed<boolean>(() => {
      return props.visible;
    });

    const rowSelection = computed(() => {
      return {
        selectedRowKeys: unref(state.selectedRowKeys),
        onChange: (keys: string[], selectedRows: DeviceInstancePage[]): void => {
          state.selectedRowKeys = keys;
          state.allList = selectedRows;
        },
      };
    });

    const close = (data?: string): void => {
      show.value = true;
      reset();
      if (data === "ok") {
        getFilter();
        emit("close", state.allList, selectAll.value, false);
        spinning.value = true;
      } else {
        emit("close", [], selectAll.value, true);
      }
    };

    const reset = (): void => {
      Object.assign(searchForm, {
        genreId: null,
        prodCategoryCode: [],
        keyword: "",
      });
      state.pagination.current = 1;
      getData();
    };

    const getData = (): void => {
      spinning.value = true;
      const obj = {
        filterTagCodes: [`builtin.app::OUTSOURCE_REPAIR`],
        applicationCode: 'OUTSOURCE_REPAIR',
        pageNumber: state.pagination.current,
        pageSize: state.pagination.pageSize,
        keyword: searchForm.keyword,
        categoryCode: searchForm.prodCategoryCode.join('-')
      };

      cubeDeviceCenterService.getDeviceInstancePageAll(obj).then((res) => {
        state.dataSource = res.records;
        state.pagination.total = res.total;
        spinning.value = false;
      });
    };

    const getFilter = (): void => {
      state.selected = [];
      state.selected = state.selectedRows.filter((item: DeviceInstancePage): boolean => {
        if (state.selectedRowKeys.indexOf(item.id ?? '') > -1) {
          return true;
        }
        return false;
      });
    };

    const pageChange = (pageData: { current: number; pageSize: number; }): void => {
      const { current, pageSize } = pageData;
      state.pagination.current = current;
      state.pagination.pageSize = pageSize;
      getData();
    };

    onMounted((): void => {
      cubeDeviceCenterService.getIotProductCategoryTree().then((res) => {
        options.value = res ?? [];
      });
      getData();
    });

    return (): JSX.Element => (
      <Modal
        v-model:visible={modalVisible.value}
        confirmLoading={show.value}
        width="1000px"
        title={props.title}
        onCancel={() => close()}
        onOk={() => close('ok')}
      >
        <Form layout="inline" model={searchForm} class="modal-form">
          <Form.Item label="品类品类">
            <Cascader
              v-model:value={searchForm.prodCategoryCode}
              placeholder="请输入"
              style={{ width: '200px' }}
              fieldNames={{
                label: 'categoryName',
                value: 'categoryCode',
                children: 'children',
              }}
              options={options.value}
              changeOnSelect
            />
          </Form.Item>
          <Form.Item label="">
            <Input v-model:value={searchForm.keyword} placeholder="请输入设备名称或编码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={getData}>查询</Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={reset}>重置</Button>
          </Form.Item>
        </Form>

        <Table
          rowKey={props.rowKey}
          dataSource={state.dataSource}
          columns={props.columns.length ? props.columns : state.columns}
          rowSelection={rowSelection.value}
          pagination={state.pagination}
          scrollY='450'
          size='middle'
          onChange={pageChange}
          loading={spinning.value}
        />
      </Modal>
    );
  }
});