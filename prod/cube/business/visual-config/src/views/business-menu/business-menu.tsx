import { defineComponent, ref, onMounted, reactive, nextTick } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Input, Table, message, Button, Form, FormItem, Modal, PopConfirm, InputNumber, Textarea, Cascader } from '@ghcloud/cube-ui'
import { type SceneMenuData, type IModal, initFormData } from './business-menu-i'
import {
  getScenePage,
  addSceneMenu, editSceneMenu,
  deleteSceneMenu,
  getAreaList, type GetAreaList
} from '@/api/mdata'
import { FileUpload } from '@ghcloud/cube-app-design'
import type { FormInstance } from 'ant-design-vue'
import type { GetSceneMenu } from '@/api/models/mdata'
import CheckboxGroup from '@ghcloud/cube-ui/src/components/checkbox-group/checkbox-group'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import { useUtils } from '@/hooks/use-utils'
import { cubeDictionaryService } from "@/api/service";
import type { GetDictionaryByItem } from "@ghcloud/cube-dictionary-service";

export const BusinessMenu = defineComponent({
  setup: () => {
    const { getProjectId } = useUtils()
    const projectId = getProjectId()
    const uploadRef = ref<{ clearAll: () => void; }>()
    const tableData = ref<GetSceneMenu[]>([])
    const scrollY = ref<number>(200)
    const tableLoading = ref<boolean>(true)
    const scenarioTypesOptions = [
      { label: '建筑', value: 'BUILD', tips: '勾选后请务必到设备关联中关联设备,否则建筑中无设备展示' },
      { label: '管网', value: 'PIPE_NETWORK', tips: '勾选后请务必保证在模型的标签跟业务菜单名称一致,否则无法加载模型' }]
    const modal: IModal = reactive({
      visible: false,
      title: '新增业务菜单',
    })
    let formData = reactive({ ...initFormData })
    const formRef = ref<FormInstance>()
    const rulesRef = {
      name: [
        { required: true, message: '请输入菜单名称' },
        { max: 6, message: '最多输入6个字' },
      ],
      // fileId: [{ required: true, message: '请上传图片' }],
      scenarioType: [{ required: true, message: '请至少选择一项场景' }],
    };
    const businessAreaOptions = ref<GetAreaList[]>([]);
    const dictCode = "UE5_BUSINESS_MENU_EXPAND";
    // const dictCode = "ue5_business_menu_expand";
    const hideActorsValue = ref<string[]>([]);
    const formState = reactive({
      perspective: {
        variable: "",
      },
      hideActors: {
        variable: "",
      },
    });

    const initConfig = (code: string): GetDictionaryByItem[] => {
      const perspectiveConfig = {
        id: "",
        name: "视角参数",
        code: `${code}_perspective`,
        remarks: "",
        version: "",
        flag: false,
        variable: "",
        itemCode: dictCode,
      };
      const hideActorsConfig = {
        id: "",
        name: "隐藏楼栋",
        code: `${code}_hideActors`,
        remarks: "",
        version: "",
        flag: false,
        variable: "",
        itemCode: dictCode,
      };
      return [perspectiveConfig, hideActorsConfig];
    };

    const getDetail = async (code: string): Promise<void> => {
      try {
        const res = await cubeDictionaryService.getDictionaryByItem({
          itemCode: dictCode,
        });
        const filtercode = ["perspective", "hideActors"].map((item) => `${code}_${item}`);
        const resConfig = res.filter((item) => filtercode.includes(item.code));
        const config = !resConfig.length ? initConfig(code) : resConfig;
        formState.perspective =
          (config?.find((i) => i.code === `${code}_perspective`) as unknown as GetDictionaryByItem) ??
          (initConfig(code).find((config) => config.code === `${code}_perspective`) as GetDictionaryByItem);
        formState.hideActors =
          (config?.find((i) => i.code === `${code}_hideActors`) as unknown as GetDictionaryByItem) ??
          (initConfig(code).find((config) => config.code === `${code}_hideActors`) as GetDictionaryByItem);

        // 处理多选回显
        if (formState.hideActors.variable) {
          hideActorsValue.value = JSON.parse(formState.hideActors.variable)
        } else {
          hideActorsValue.value = [];
        }
      } catch {
      }
    };

    const getDictionary = async (code: string): Promise<void> => {
      try {
        const dictionaryItem = await cubeDictionaryService.getDictionaryItemByCode({
          code: dictCode,
        });
        if (!dictionaryItem || dictionaryItem.length === 0 || JSON.stringify(dictionaryItem) === '{}') {
          await cubeDictionaryService.addDataDictionaryItem({
            code: dictCode,
            remarks: "UE5业务菜单扩展配置",
          });
        }
        await getDetail(code);
      } catch {}
    };

    const resetDictionary = (): void => {
      formState.perspective = { variable: "" };
      formState.hideActors = { variable: "" };
      hideActorsValue.value = [];
    };

    onMounted(async () => {
      getSceneList()
      businessAreaOptions.value = await getAreaList();
      nextTick(() => {
        getScrollY()
      })
    })
    // 获取业务菜单
    const getSceneList = async (): Promise<void> => {
      const params = {
        projectId,
      }
      const res = await getScenePage(params)
      tableLoading.value = false
      tableData.value = res
    }
    // 新增/编辑/删除业务菜单========================================================================================
    const openModal = async (type: 'add' | 'edit', record?: SceneMenuData): Promise<void> => {
      if (type === 'add') {
        modal.title = '新增业务菜单'
        formData = reactive({ ...initFormData })
      } else if (type === 'edit' && record) {
        modal.title = '编辑业务菜单'
        const data = {
          ...record,
          id: record.id,
          name: record.name,
          sort: record.sort,
          parentId: record.parentId,
          fileId: record.fileVO?.id ?? '',
          scenarioTypes: record.scenarioTypes,
          scenarioType: record.scenarioType,
          fileList: record.fileVO
            ? [
              {
                uid: record.fileVO.id,
                name: record.fileVO.name,
                url: record.fileVO.path,
                id: record.fileVO.id,
              },
            ]
            : [],
          remark: record.remark,
        }
        formData = reactive(data)
        await getDictionary(record.code)
      }
      modal.visible = true
    }
    const addChidMenu = async (parentId: string): Promise<void> => {
      modal.title = '新增业务菜单'
      formData = reactive({ ...initFormData, parentId })
      resetDictionary()
      modal.visible = true
    }
    const handelAdd = async (): Promise<void> => {
      try {
      formData.scenarioType = formData.scenarioTypes.join('-')
      formData.fileId = formData.fileList.map(item=>item.id).join(',')
      formRef.value?.validate().then(async () => {
        const { id, name, parentId, fileId, sort } = formData
        if (!id) {
          await addSceneMenu({
            id,
            name,
            parentId,
            fileId,
            sort: sort || 1,
            scenarioType: formData.scenarioType
          })
          message.success('添加成功')
        } else {
          await editSceneMenu({
            id,
            name,
            parentId,
            fileId,
            scenarioType: formData.scenarioType,
            sort: sort || 1,
          })
        }

        if (id) {
          formState.hideActors.variable = JSON.stringify(hideActorsValue.value)
          for (const keys of Object.keys(formState)) {
            const config = (formState as any)[keys];
            if (!config.id) {
              await cubeDictionaryService.addDataDictionary({
                ...config,
              });
            } else {
              await cubeDictionaryService.updateDataDictionary({
                ...config,
              });
            }
          }
        }
        message.success('修改成功')
        getSceneList()
        handelCancel()
      })
    } catch (error) {
      message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
    }
    }
    const handelCancel = (): void => {
      modal.visible = false
      uploadRef.value?.clearAll()
      formRef.value?.resetFields()
      resetDictionary()
    };
    const handelDelete = async (id: string): Promise<void> => {
      await deleteSceneMenu({ id })
      message.success('删除成功')
      getSceneList()
    }
    // 计算表格高度====================================================================================================
    const getScrollY = (): void => {
      const ele = document.getElementById('appContainer')
      const height = ele?.clientHeight
      if (height) {
        scrollY.value = height - 140
      }
    }
    window.onresize = (): void=> {
      getScrollY()
    }
    const columns = [
      {
        title: '菜单名称',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: '菜单序号',
        dataIndex: 'sort',
        key: 'sort'
      },
      {
        title: '菜单编号',
        dataIndex: 'code',
        key: 'code'
      },
      {
        title: '菜单图标',
        dataIndex: 'fileVO',
        key: 'fileVO',
        customRender: ({ record }: { record: SceneMenuData; }): JSX.Element =>
          <>
            {record.fileVO ? <img width='50' src={record.fileVO.path} /> : null}
          </>
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ record }: { record: SceneMenuData; }): JSX.Element =>
          <>
            {record?.level === 1 ? <Button type='link' onClick={() => {
              addChidMenu(record.id)
            }}>新增下级</Button> : null}
            <Button type='link' onClick={() => {
              openModal('edit', record)
            }}>编辑</Button>
            <PopConfirm
              title='是否确认删除该菜单?'
              ok-text='确定'
              cancel-text='取消'
              onConfirm={() => {
                handelDelete(record.id)
              }}
            >
              <Button type='text' danger>删除</Button>
            </PopConfirm>
          </>
      }
    ]
    // 布局插槽========================================================================================================
    const gLayoutSlots = {
      'header-btn': (): JSX.Element=> {
        return (
          <Button type='primary' onClick={() => {
            openModal('add')
          }}>新增</Button>
        )
      },
      'content-table': (): JSX.Element => {
        return (
          <>
            <Table
              columns={columns}
              dataSource={tableData.value}
              scrollY={scrollY.value}
              rowKey='id'
              loading={tableLoading.value}
              pagination={false}
            />
          </>
        )
      },
    }
    return (): JSX.Element=>
      <>
        <GLayout title='业务菜单' showFooter={false} v-slots={gLayoutSlots} />
        <Modal
          visible={modal.visible}
          title={modal.title}
          onOk={handelAdd}
          onCancel={handelCancel}
        >
          <Form model={formData} ref={formRef} rules={rulesRef} label-col={{ style: { width: '100px' } }}>
            <FormItem label='菜单名称' name='name'>
              <Input
                maxlength={6}
                placeholder='请输入菜单名称'
                v-model:value={formData.name}
                onChange={() => {
                  formData.name = formData.name ? formData.name.replace(/\s+/g, '') : ''
                }}
              />
            </FormItem>
            <FormItem label='序号' name='sort'>
              <InputNumber
                min={1}
                v-model:value={formData.sort}
                placeholder='请输入菜单序号'
              />
            </FormItem>
            <FormItem label='图片' name='fileId'>
              <FileUpload
                type='picture-card'
                sceneCode={GLOBAL_SCENE_CODE.visualCenterMenu}
                customText='支持上传图片（.png/.jpeg/.jpg/.svg/.gif/.psd）'
                ref={uploadRef} v-model:value={formData.fileList}
              />
            </FormItem>
            <FormItem label='模型场景' name='scenarioType'>
              <CheckboxGroup v-model:value={formData.scenarioTypes} options={scenarioTypesOptions} onChange={() => {
                formRef.value?.resetFields('scenarioType')
              }} />
            </FormItem>
            {
              !modal.title?.includes('新增') && 
            <>
            <FormItem label="视角参数">
              <Textarea
                style={{ width: "100%" }}
                placeholder="请输入视角参数"
                autosize={{ minRows: 2, maxRows: 2 }}
                v-model:value={formState.perspective.variable}
              />
            </FormItem>
            <FormItem label="隐藏楼栋">
              <Cascader
                v-model:value={hideActorsValue.value}
                placeholder="请选择楼栋"
                field-names={{ label: "name", value: "aliasName", children: "children" }}
                multiple
                options={businessAreaOptions.value}
                allow-clear
                show-search
                change-on-select
              />
            </FormItem>
            </>
            }
          </Form>
        </Modal>
      </>
  }
})
