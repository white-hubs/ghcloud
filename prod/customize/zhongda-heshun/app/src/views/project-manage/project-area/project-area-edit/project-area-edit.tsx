import { defineComponent, onMounted, reactive, ref } from 'vue';
import { cubeZhongdaHeshunService } from '@/api/service';
import { useRoute } from 'vue-router';
import { Button, Form, FormItem, Input, message, MinusCircleOutlined, PlusCircleOutlined, Textarea, type FormExpose } from '@ghcloud/cube-ui';
import styles from './project-area-edit.module.less';
import { ProjectSelect } from '@/components/project-select/project-select';
import { CubeLayout } from '@ghcloud/cube-app-design'

export const ProjectAreaEdit = defineComponent({
  name: 'ProjectAreaEdit',
  setup () {
    const { projectId } = useRoute().query;
    const { id } = useRoute().query;
    const formRef = ref<FormExpose>();
    const formState = reactive<{
      projectId: string | null;
      areaParamList: {
        key: string;
        id?: string;
        areaName: string;
        areaDetail: string;
      }[];
    }>({
      projectId: (projectId as string) ?? null,
      areaParamList: [],
    });

    /**
     * @description: 添加区域项
     */
    const addItem = (): void => {
      formState.areaParamList.push({
        key: `${Date.now()}`,
        areaName: '',
        areaDetail: '',
      });
    };

    /**
     * @description: 移除区域项
     * @param {number} index - 要移除的索引
     */
    const removeItem = (index: number): void => {
      formState.areaParamList.splice(index, 1);
    };

    /**
     * @description: 获取项目区域数据
     */
    const getProjectArea = async (): Promise<void> => {
      if (projectId) {
        const response = await cubeZhongdaHeshunService.getProjectArea(projectId as string);
        formState.areaParamList = response.records.map((item) => ({ ...item, key: item.id ?? `${Date.now()}` })).filter((item) => item.id === id);
        if (!formState.areaParamList.length) {
          addItem();
        }
      } else {
        addItem();
      }
    };

    const saveLoading = ref(false);
    /**
     * @description: 保存项目区域
     */
    const save = async (): Promise<void> => {
      try {
        saveLoading.value = true;
        await formRef.value?.validate();
        const params = {
          ...formState,
        };
        let error = false;
        formState.areaParamList.forEach((item) => {
          if (!item.areaName || !item.areaDetail) {
            message.error('请填写完整区域信息');
            error = true;
          }
        });
        if (error) {
          return;
        }
        if (projectId) {
          const editParams = {
            projectId: params.projectId,
            ...params.areaParamList[0],
          }
          await cubeZhongdaHeshunService.editProjectArea(editParams);
        } else {
          await cubeZhongdaHeshunService.addProjectArea(params);
        }
        message.success('保存成功');
        history.back();
      } finally {
        saveLoading.value = false;
      }
    };

    onMounted(() => {
      getProjectArea();
    });

    const goBack = (): void => {
      history.back();
    };
    const rules = {
      projectId: [{ required: true, message: '请选择所属项目' }],
    };
    const slots = {
      'layout-content': (): JSX.Element =>{
        return (
          <div class={styles['area-container']}>
            <Form model={formState} ref={formRef} rules={rules}>
              <FormItem label='所属项目' name='projectId' >
                <ProjectSelect readonly={projectId} v-model:value={formState.projectId} />
              </FormItem>
              {formState.areaParamList.map((item, index) => (
                <div key={item.key} class={styles['area-item']}>
                  <div class={styles['area-form']}>
                    <FormItem label='区域' required>
                      <Input v-model:value={item.areaName} placeholder='请输入' />
                    </FormItem>
                    <FormItem label='详情' required>
                      <Textarea v-model:value={item.areaDetail} placeholder='请输入' />
                    </FormItem>
                  </div>
                  { !projectId && <div class={styles['area-actions']}>
                    <PlusCircleOutlined class="mr-2 cursor-pointer text-blue-500" style={{ marginRight: '10px' }} onClick={addItem} />
                    {formState.areaParamList.length > 1 && (
                      <MinusCircleOutlined class="cursor-pointer text-red-500" onClick={() => removeItem(index)} />
                    )}
                  </div>}
                </div>
              ))}
            </Form>
          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <div class="text-center p-4 bg-white border-t">
            <Button onClick={goBack} style={{ marginRight: '20px' }} >取消</Button>
            <Button type='primary' class="ml-2" loading={saveLoading.value} onClick={save}>保存</Button>
          </div>
        )
      },
    }

    return (): JSX.Element => (
      <CubeLayout title={`${projectId ? '编辑' : '新增'}区域`} v-slots={slots} >

      </CubeLayout>
    );
  },
});