import type { PropType } from 'vue';
import { computed, defineComponent, reactive, ref, onMounted } from 'vue';
import { Button, Modal, Popconfirm, Spin, message } from 'ant-design-vue';
import { PlusOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import styles from './project-place.module.less';
import { FileUpload } from '@ghcloud/cube-app-design'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import type { OSSFile } from '@ghcloud/generic-component'
import { Form, FormItem, Input, type FormExpose } from '@ghcloud/cube-ui'
import { cubeZhongdaHeshunService } from '@/api/service'
import { cubeFileService } from '@ghcloud/cube-app-design/src/api/service'
interface Place {
  id: string | number;
  dataName: string;
  count: number;
  icon?: string;
}

export default defineComponent({
  name: 'ProjectPlace',
  props: {
    dataType: {
      type: String,
      required: true
    },
    upload: {
      type: Boolean,
      default: false
    },
    onSelect: {
      type: Function as PropType<(id: string | number | undefined) => void>,
      required: true,
    },
    projectId: {
      type: String,
      default: ''
    },
    detail: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },
  emits: ['add', 'edit', 'delete'],
  setup (props, { expose }) {
    const isModalVisible = ref(false);
    const modalTitle = ref('');
    const active = ref<string | number | undefined>(undefined);
    const places = ref<Place[]>([]);
    const buttonLoading = ref(false)
    const totalCount = computed(() => {
      return places.value.reduce((sum, place) => sum + place.count, 0) ?? 0;
    })
    const formState = reactive<{
      editingPlaceId: string | number | null;
      placeName: string;
      files: OSSFile[];
    }>({
      editingPlaceId: null,
      placeName: '',
      files: [],
    })
    const loading = ref(false)
    const formRenderRef = ref<FormExpose>()
    const modalRules = {
      placeName: [
        { required: true, message: '请输入名称' },
      ],
      files: [
        { required: true, message: '请上传文件', trigger: 'blur' },
      ],
    }
    onMounted(() => {
      getList()
    })
    // watch(() => props.projectId, async () => {
    //   await getList()

    // })
    const getList = async (): Promise<void> => {
      loading.value = true;
      try {
        let data;
        data = await cubeZhongdaHeshunService.getTypeAllList({
          dataType: props.dataType,
          projectId: props.projectId
        })
        places.value = data as Place[]
      } finally {
        loading.value = false;
      }

    }
    expose({
      getList
    })
    /**
     * @description: 打开新增弹窗
     */
    const handleAdd = (): void => {
      modalTitle.value = '新建分类';
      formState.placeName = '';
      formState.editingPlaceId = null;
      isModalVisible.value = true;
      formState.files = [];
    };

    /**
     * @description: 打开编辑弹窗
     * @param {Place} place - 要编辑的地点
     */
    const handleEdit = (e, place: Place): void => {
      e.stopPropagation();
      modalTitle.value = '编辑分类';
      formState.placeName = place.dataName;
      formState.editingPlaceId = place.id;
      isModalVisible.value = true;
      if (place.icon){
        getFileList(place.icon)
      }
    };
    const getFileList = async (id: string): Promise<void> => {
      try {
        const data = await cubeFileService.getFileInfo(id)
        formState.files = [data as OSSFile];
      } catch {
        message.error('获取文件失败')
      }
    }
    /**
     * @description: 处理弹窗确认事件
     */
    const handleOk = async (): Promise<void> => {
      try {
        await formRenderRef.value?.validate()

        if (formState.editingPlaceId !== null) {
          await editTypeList()
        } else {
          await addTypeList()
        }
        isModalVisible.value = false;
        getList()
      } catch {
      } finally {

      }


    };

    const addTypeList = async (): Promise<void> =>{
      buttonLoading.value = true;
      try {
        await cubeZhongdaHeshunService.addTypeAllList({
          dataType: props.dataType,
          dataName: formState.placeName,
          icon: formState.files.map((item) =>item.id).join(','),
        });
        getList();
        buttonLoading.value = false;
      } finally {
        buttonLoading.value = false;
      }
    }
    const editTypeList = async (): Promise<void> =>{
      buttonLoading.value = true;
      try {
        await cubeZhongdaHeshunService.editTypeAllList({
          id: formState.editingPlaceId,
          dataType: props.dataType,
          dataName: formState.placeName,
          icon: formState.files.map((item) =>item.id).join(','),
        });
        getList();
      } finally {
        buttonLoading.value = false;
      }
    }
    /**
     * @description: 处理删除事件
     * @param {string | number} id - 要删除的地点ID
     */
    const handleDelete = async (id: string | number): Promise<void> => {
      loading.value = true;
      try {
        buttonLoading.value = true;
        await cubeZhongdaHeshunService.deleteTypeAllList({ id });
        if (active.value === id){
          props.onSelect(id);
          active.value = undefined;
        }
        getList(); // 刷新表格数据
      } catch {
        loading.value = false;
      }
      // props.onDelete(id);
    };

    const handleClick = (id: string | number | undefined): void => {
      props.onSelect(id);
      active.value = id;
    };
    return (): JSX.Element => (
      <Spin spinning={loading.value}>
        <div class={styles['project-place-container']}>
          {!props.detail && <div class={styles['header']}>
            <div>
              {props.title}
            </div>
            <Button type='primary' icon={<PlusOutlined />} onClick={handleAdd}>
              新建
            </Button>
          </div>}
          <div class={styles['place-list']}>
            <div class={styles['place-item']} style={{ background: !active.value ? '#c8c7c7' : '' }} onClick={() => handleClick(undefined)}>
              <span>全部 ({totalCount.value})</span>
            </div>
            {places.value.map((place) => (
              <div key={place.id} class={styles['place-item']} style={{ background: active.value === place.id ? '#c8c7c7' : '' }} onClick={() => handleClick(place.id)} >
                <span class={styles['place-name']}> <div class={styles['place-title']}>{place.dataName}</div>  ({place.count})</span>
                {!props.detail && <span class={styles['actions']}>
                  <FormOutlined class={styles['action-icon']} onClick={(e) => handleEdit(e, place)} />
                  <Popconfirm
                    title='确定要删除吗?'
                    onConfirm={async () => handleDelete(place.id)}
                  >
                    <DeleteOutlined class={styles['action-icon']} />
                  </Popconfirm>
                </span>}
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
            <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: '100px' } }}>
              <FormItem label='名称' name='placeName'>
                <Input v-model:value={formState.placeName} placeholder='请输入名称' />
              </FormItem>
              {props.upload && <FormItem label='文件' name='files'>
                <FileUpload
                  // todo sceneCode={GLOBAL_SCENE_CODE.knowledgeDocument}
                  sceneCode={GLOBAL_SCENE_CODE.disinfectionkeyplace}
                  v-model:value={formState.files}
                  showText={true}
                  maxCount={1}
                  type='picture-card'
                  size={10}
                  customText='支持jpg,png,svg格式,单个附件最大支持10MB'
                  typeList={['.jpg', '.png', '.svg']}
                />
              </FormItem>}
            </Form>
          </Modal>
        </div>
      </Spin>
    );
  },
});