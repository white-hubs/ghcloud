import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { usePageName } from '@ghcloud/cube-utils'
import { Button, Form, FormItem, message, PopOver, Modal, Input, Select, TreeSelect, PopConfirm } from '@ghcloud/cube-ui'
import { AliasTable } from '@ghcloud/generic-component'
import { cubeOutsourceService, cubeDeviceCenterService } from "../../api/service"
import type { RepairModeModel, RepairCompanyModel, RepairScopeModel } from '@ghcloud/cube-outsource-service'
import type { ProductIotCategoryTree } from '@ghcloud/cube-iot-center-service'
import './repair-company.less';

interface CompanyData {
  dataSource: RepairCompanyModel[];
  loading: boolean;
  modalVisible: boolean;
  detailVisible: boolean;
  modalTitle: string;
  currentRecord: RepairCompanyModel | null;
  formData: {
    name: string;
    outsourceModelIdList: string[];
    outsourceScopeIdList: string[];
    responsiblePerson: string;
    responsiblePersonPhone: string;
  };
  options: RepairModeModel[];
  treeData: ProductIotCategoryTree[];
}

export const RepairCompany = defineComponent({
  setup () {
    const { pageTitle } = usePageName()
    const formRef = ref();

    const state = reactive<CompanyData>({
      dataSource: [],
      loading: false,
      modalVisible: false,
      detailVisible: false,
      modalTitle: pageTitle,
      currentRecord: null,
      formData: {
        name: "",
        outsourceModelIdList: [],
        outsourceScopeIdList: [],
        responsiblePerson: "",
        responsiblePersonPhone: ""
      },
      options: [],
      treeData: []
    })

    // 表头定义
    const columns = [
      {
        title: "委外公司",
        dataIndex: "name",
        key: "name",
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ""}>
              {text || "--"}
            </PopOver>
          );
        },
      },
      {
        title: "委外模式",
        dataIndex: "outsourceModel",
        key: "outsourceModel",
        ellipsis: true,
        customRender: ({ text }: { text: RepairModeModel[]; }): JSX.Element => {
          let res = text?.length ? text.map((item) => item.name).join(` | `) : "";
          return (
            <PopOver content={text ? res : ""}>
              {text ? res : "--"}
            </PopOver>
          );
        },
      },
      {
        title: "委外范围",
        dataIndex: "outsourceScope",
        key: "outsourceScope",
        ellipsis: true,
        customRender: ({ text }: { text: RepairScopeModel[]; }): JSX.Element => {
          let res = text?.length ? text.map((item) => item.name).join(" | ") : "";
          return (
            <PopOver content={text?.length ? res : ""}>
              {text?.length ? res : "--"}
            </PopOver>
          );
        },
      },
      {
        title: "委外责任人",
        dataIndex: "responsiblePerson",
        key: "responsiblePerson",
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ""}>
              {text || "--"}
            </PopOver>
          );
        },
      },
      {
        title: "责任人手机号码",
        dataIndex: "responsiblePersonPhone",
        key: "responsiblePersonPhone",
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ""}>
              {text || "--"}
            </PopOver>
          );
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        customRender: ({ record }: { record: RepairCompanyModel; }): JSX.Element => {
          return (
            <div>
              <Button
                type="link"
                style={{ padding: '4px' }}
                onClick={() => handleDetail(record)}
              >
                详情
              </Button>
              <Button
                type="link"
                style={{ padding: '4px' }}
                onClick={() => handleEdit(record)}
              >
                编辑
              </Button>
              <PopConfirm
                title='是否确认删除?'
                ok-text='确定'
                cancel-text='取消'
                onConfirm={async () => handleDelete(record)}
              >
                <Button type='link' danger style={{ paddingRight: 0 }}>删除</Button>
              </PopConfirm>
            </div>
          );
        },
      },
    ];

    // 获取数据
    const getTableList = async (): Promise<void> => {
      try {
        state.loading = true;
        const result = await cubeOutsourceService.repairCompany();
        state.dataSource = result ?? [];
      } catch {
        message.error('获取数据失败');
      } finally {
        state.loading = false;
      }
    };

    // 获取委外模式选项
    const getRepairModes = async (): Promise<void> => {
      try {
        const res = await cubeOutsourceService.repairMode();
        state.options = res ?? []
      } catch {}
    };

    // 获取委外范围选项
    const getTreeData = async (): Promise<void> => {
      try {
        const res = await cubeDeviceCenterService.getIotProductCategoryTree();
        state.treeData = res ?? [];
      } catch {}
    };

    // 详情按钮点击
    const handleDetail = (record: RepairCompanyModel): void => {
      state.currentRecord = record;
      state.detailVisible = true;
    };

    const handleDetailClose = (): void => {
      state.detailVisible = false;
    };

    // 新增按钮点击
    const handleAdd = (): void => {
      state.modalTitle = "新增委外公司";
      state.currentRecord = null;
      state.formData = {
        name: "",
        outsourceModelIdList: [],
        outsourceScopeIdList: [],
        responsiblePerson: "",
        responsiblePersonPhone: ""
      };
      state.modalVisible = true;
    };

    // 编辑按钮点击
    const handleEdit = (record: RepairCompanyModel): void => {
      state.modalTitle = "编辑委外公司";
      state.currentRecord = record;
      state.formData = {
        name: record.name,
        outsourceModelIdList: record.outsourceModel?.map(item => item.id) || [],
        outsourceScopeIdList: record.outsourceScope?.map(item => item.deviceGenreId) || [],
        responsiblePerson: record.responsiblePerson,
        responsiblePersonPhone: record.responsiblePersonPhone
      };
      state.modalVisible = true;
    };

    // 删除按钮点击
    const handleDelete = async (record: RepairCompanyModel): Promise<void> => {
      if (record.id) {
        try {
          await cubeOutsourceService.repairCompanyDelete(record.id);
          message.success('删除成功');
          getTableList();
        } catch {
          message.error('删除失败');
        }
      } else {
        message.info('操作失败')
      }
    };

    // 表单提交
    const handleSubmit = async (): Promise<void> => {
      try {
        await formRef.value.validate();

        if (state.currentRecord){
          const params = {
            ...state.formData,
            id: state.currentRecord.id,
          };
          await cubeOutsourceService.repairCompanyEdit(params);
          message.success('编辑成功');
        } else {
          await cubeOutsourceService.repairCompanyAdd(state.formData);
          message.success('新增成功');
        }

        state.modalVisible = false;
        getTableList();
      } catch {}
    };

    // 取消表单
    const handleCancel = (): void => {
      state.modalVisible = false;
    };

    // 表单验证规则
    const rules = {
      name: [{ required: true, message: "请输入委外公司" }],
      outsourceModelIdList: [{ required: true, message: "请选择委外模式" }],
      outsourceScopeIdList: [{ required: true, message: "请选择委外范围" }],
      responsiblePerson: [{ required: true, message: "请输入委外责任人" }],
      responsiblePersonPhone: [
        { required: true, message: "请输入手机号码" },
        {
          // todo 使用全局共用手机号验证，保证一致性
          pattern: new RegExp(/^1(3|4|5|6|7|8|9)\d{9}$/, "g"),
          message: "请输入正确的电话号码",
        },
      ],
    };

    onMounted(() => {
      getTableList();
      getRepairModes();
      getTreeData();
    });

    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <Button type="primary" onClick={handleAdd}>新增</Button>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <div>
            <AliasTable
              rowKey="id"
              dataSource={state.dataSource}
              columns={columns}
              loading={state.loading}
              applicationCode="OUTSOURCE_REPAIR"
              tableCode="OUTSOURCE_COMPANY"
              scrollX={600}
            />

            <Modal
              v-model:visible={state.modalVisible}
              title={state.modalTitle}
              onOk={handleSubmit}
              onCancel={handleCancel}
              width={600}
            >
              <Form
                ref={formRef}
                model={state.formData}
                rules={rules}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
              >
                <FormItem label="委外公司" name="name">
                  <Input
                    v-model:value={state.formData.name}
                    placeholder="请输入委外公司"
                    maxlength={20}
                  />
                </FormItem>
                <FormItem label="委外模式" name="outsourceModelIdList">
                  <Select
                    v-model:value={state.formData.outsourceModelIdList}
                    placeholder="请选择委外模式"
                    mode="multiple"
                    options={state.options}
                    fieldNames={{
                      label: 'name',
                      value: 'id'
                    }}
                    style={{ width: '100%' }}
                  />
                </FormItem>
                <FormItem label="委外范围" name="outsourceScopeIdList">
                  <TreeSelect
                    v-model:value={state.formData.outsourceScopeIdList}
                    placeholder="请选择委外范围"
                    treeData={state.treeData}
                    fieldNames={{
                      label: 'categoryName',
                      value: 'categoryCodeConcat',
                      children: 'children',
                    }}
                    multiple
                    style={{ width: '100%' }}
                  />
                </FormItem>
                <FormItem label="委外责任人" name="responsiblePerson">
                  <Input
                    v-model:value={state.formData.responsiblePerson}
                    placeholder="请输入委外责任人"
                  />
                </FormItem>
                <FormItem label="手机号码" name="responsiblePersonPhone">
                  <Input
                    v-model:value={state.formData.responsiblePersonPhone}
                    placeholder="请输入手机号码"
                  />
                </FormItem>
              </Form>
            </Modal>
            <Modal
              v-model:visible={state.detailVisible}
              title="委外公司详情"
              footer={[
                <Button key="close" onClick={handleDetailClose}>关闭</Button>
              ]}
              onCancel={handleDetailClose}
              width={600}
            >
              {state.currentRecord && (
                <div>
                  <p>委外公司: {state.currentRecord.name}</p>
                  <p>委外模式: {state.currentRecord.outsourceModel?.map(item => item.name).join(' | ') || '--'}</p>
                  <p>委外范围: {state.currentRecord.outsourceScope?.map(item => item.name).join(' | ') || '--'}</p>
                  <p>委外责任人: {state.currentRecord.responsiblePerson || '--'}</p>
                  <p>责任人手机号码: {state.currentRecord.responsiblePersonPhone || '--'}</p>
                </div>
              )}
            </Modal>
          </div>
        )
      }
    }

    return (): JSX.Element => (
      <Layout v-slots={layoutSlots} title={pageTitle} />
    )
  }
})