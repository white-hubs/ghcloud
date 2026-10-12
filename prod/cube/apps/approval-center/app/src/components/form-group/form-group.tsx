import { PlusOutlined, FormOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { Button, Modal, Popconfirm, Spin } from "ant-design-vue";
import type { PropType } from "vue";
import { computed, defineComponent, reactive, ref, onMounted } from "vue";

import { Form, FormItem, Input, type FormExpose } from "@ghcloud/cube-ui";

import { cubeApprovalCenterService } from "@/api/service";
import { getCurrentApplicationCode } from "@/utils/current-application";

import styles from "./form-group.module.less";
interface FormFlowGroupVO {
  formGroupId: string;
  formGroupName: string;
  formGroupCount: number;
}

export const FormGroup = defineComponent({
  props: {
    onSelect: {
      type: Function as PropType<(id: string | number | undefined) => void>,
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
  },
  emits: ["add", "edit", "delete"],
  setup(props, { expose }) {
    const isModalVisible = ref(false);
    const modalTitle = ref("");
    const active = ref<string | number | undefined>(undefined);
    const data = ref<FormFlowGroupVO[]>([]);
    const buttonLoading = ref(false);

    const totalCount = computed(() => {
      return data.value.reduce((sum, place) => sum + place.formGroupCount, 0) ?? 0;
    });
    const formState = reactive<{
      name: string;
      id: string | null;
    }>({
      id: null,
      name: "",
    });
    const loading = ref(false);
    const formRenderRef = ref<FormExpose>();
    const modalRules = {
      name: [{ required: true, message: "请输入分组名称" }],
    };

    onMounted(() => {
      getTypeData();
    });

    const getTypeData = async (): Promise<void> => {
      loading.value = true;
      try {
        const response = await cubeApprovalCenterService.getFormFlowGroupCount({
          application: getCurrentApplicationCode(),
        });
        data.value = Array.isArray(response) ? response : [];
      } catch {
        data.value = [];
      } finally {
        loading.value = false;
      }
    };
    expose({
      getTypeData,
    });

    const handleAdd = (): void => {
      modalTitle.value = "新建分组";
      formState.name = "";
      formState.id = null;
      isModalVisible.value = true;
    };

    const handleEdit = (e: Event, group: FormFlowGroupVO): void => {
      e.stopPropagation();
      modalTitle.value = "编辑分组";
      formState.name = group.formGroupName;
      formState.id = group.formGroupId;
      isModalVisible.value = true;
    };

    const handleOk = async (): Promise<void> => {
      try {
        await formRenderRef.value?.validate();
        if (formState.id !== null) {
          await editFormType();
        } else {
          await addFormType();
        }
        isModalVisible.value = false;
        getTypeData();
      } catch {
      } finally {
      }
    };

    const addFormType = async (): Promise<void> => {
      buttonLoading.value = true;
      try {
        await cubeApprovalCenterService.updateFormFlowGroup({
          id: formState.id ?? "",
          name: formState.name,
          application: getCurrentApplicationCode(),
        });
        getTypeData();
      } finally {
        buttonLoading.value = false;
      }
    };
    const editFormType = async (): Promise<void> => {
      buttonLoading.value = true;
      try {
        await cubeApprovalCenterService.updateFormFlowGroup({
          id: formState.id ?? "",
          name: formState.name,
          application: getCurrentApplicationCode(),
        });
        getTypeData();
      } finally {
        buttonLoading.value = false;
      }
    };

    const handleDelete = async (id: string): Promise<void> => {
      loading.value = true;
      try {
        await cubeApprovalCenterService.deleteFormFlowGroup(id);
        if (active.value === id) {
          active.value = undefined;
          props.onSelect(active.value);
        }
        getTypeData();
      } finally {
        loading.value = false;
      }
    };

    const handleClick = (id: string | number | undefined): void => {
      props.onSelect(id);
      active.value = id;
    };
    return (): JSX.Element => (
      <Spin spinning={loading.value}>
        <div class={styles["form-group-container"]}>
          <div class={styles["header"]}>
            <div>{props.title}</div>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建
            </Button>
          </div>
          <div class={styles["form-group-list"]}>
            <div
              class={styles["form-group-item"]}
              style={{ background: !active.value ? "#c8c7c7" : "" }}
              onClick={() => handleClick(undefined)}
            >
              <span>全部 ({totalCount.value})</span>
            </div>
            {data.value.map((formType) => (
              <div
                key={formType.formGroupId}
                class={styles["form-group-item"]}
                style={{ background: active.value === formType.formGroupId ? "#c8c7c7" : "" }}
                onClick={() => handleClick(formType.formGroupId)}
              >
                <span class={styles["form-group-name"]}>
                  <div class={styles["form-group-title"]}>{formType.formGroupName}</div> ({formType.formGroupCount})
                </span>
                <FormOutlined class={styles["action-icon"]} onClick={(e) => handleEdit(e, formType)} />
                <Popconfirm title="确定要删除吗?" onConfirm={async () => handleDelete(formType.formGroupId)}>
                  <DeleteOutlined class={styles["action-icon"]} />
                </Popconfirm>
              </div>
            ))}
          </div>
          <Modal
            title={modalTitle.value}
            visible={isModalVisible.value}
            onOk={handleOk}
            onCancel={() => (isModalVisible.value = false)}
            confirmLoading={buttonLoading.value}
            destroyOnClose
          >
            <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: "100px" } }}>
              <FormItem label="分组名称" name="name">
                <Input v-model:value={formState.name} placeholder="请输入分组名称" />
              </FormItem>
            </Form>
          </Modal>
        </div>
      </Spin>
    );
  },
});
