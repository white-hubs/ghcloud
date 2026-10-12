import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { usePageName } from '@ghcloud/cube-utils'
import { AliasTable } from '@ghcloud/generic-component'
import { Button, Form, FormItem, message, PopOver, Modal, Input, PopConfirm } from '@ghcloud/cube-ui'
import { cubeOutsourceService } from '../../api/service'
import type { RepairModeModel } from '@ghcloud/cube-outsource-service'

interface ModeData {
  dataSource: RepairModeModel[];
  loading: boolean;
  modalVisible: boolean;
  modalTitle: string;
  currentRecord: RepairModeModel | null;
  formData: {
    name: string;
  };
}

export const RepairMode = defineComponent({
  setup (){
    const { pageTitle } = usePageName()
    const formRef = ref();

    const state = reactive<ModeData>({
      dataSource: [],
      loading: false,
      modalVisible: false,
      modalTitle: pageTitle,
      currentRecord: null,
      formData: {
        name: ""
      }
    })

    // 表头定义
    const columns = [
      {
        title: "委外模式",
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
        dataIndex: "action",
        title: "操作",
        customRender: ({ record }: { record: RepairModeModel; }): JSX.Element => {
          return (
            <div>
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

    const getTableList = async (): Promise<void> => {
      try {
        state.loading = true;
        const result = await cubeOutsourceService.repairMode();
        state.dataSource = result || [];
      } catch (error) {
        message.error('获取数据失败');
      } finally {
        state.loading = false;
      }
    };

    const handleAdd = (): void => {
      state.modalTitle = "新增委外模式";
      state.currentRecord = null;
      state.formData.name = "";
      state.modalVisible = true;
    };

    const handleEdit = (record: RepairModeModel): void => {
      state.modalTitle = "编辑委外模式";
      state.currentRecord = record;
      state.formData.name = record.name;
      state.modalVisible = true;
    };

    const handleDelete = async (record: RepairModeModel): Promise<void> => {
      if (record.id) {
        try {
          await cubeOutsourceService.repairModeDelete(record.id);
          message.success('删除成功');
          getTableList();
        } catch (error) {
          message.error('删除失败');
        }
      } else {
        message.info('操作失败')
      }
    };

    const handleSubmit = async (): Promise<void> => {
      try {
        await formRef.value.validate();
        if (state.currentRecord){
          const params = {
            ...state.formData,
            id: state.currentRecord.id,
          };
          await cubeOutsourceService.repairModeEdit(params);
          message.success('编辑成功');
        } else {
          await cubeOutsourceService.repairModeAdd(state.formData);
          message.success('新增成功');
        }
        state.modalVisible = false;
        getTableList();
      } catch (error) {
      }
    };

    const handleCancel = (): void => {
      state.modalVisible = false;
    };

    // 表单验证规则
    const rules = {
      name: [{ required: true, message: "请输入委外模式" }]
    };

    onMounted(() => {
      getTableList();
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
              tableCode="OUTSOURCE_MODE"
            />
            <Modal
              v-model:visible={state.modalVisible}
              title={state.modalTitle}
              onOk={handleSubmit}
              onCancel={handleCancel}
            >
              <Form
                ref={formRef}
                model={state.formData}
                rules={rules}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
              >
                <FormItem label="委外模式" name="name">
                  <Input
                    v-model:value={state.formData.name}
                    placeholder="请输入委外模式"
                    maxlength={20}
                  />
                </FormItem>
              </Form>
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